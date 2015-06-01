var async = require('async'),
	HttpError = require('http-errors'),
	_ = require('lodash'),
	clone = require('clone'),
	querystring = require('querystring'),
	deasync = require('deasync'),
	mongoose = require('mongoose');

function encode(obj) {
	return querystring.escape(new Buffer(querystring.stringify(obj)).toString('base64'));
}

// equivalent to db.collection.getIndexKeys in mongodb shell
function getIndexKeys(model) {
	var indexKeys = [];
	var collection = model.collection;
	var indexInformation = deasync(collection.indexInformation);

	try {
		var indexes = indexInformation.call(collection);
		_.forEach(indexes, function(index) {
			indexKeys.push(_.object(index));
		});

	} catch(err) {
		throw new HttpError(500, 'Cannot retrieve index keys');
	}

	return indexKeys;
}

function oppositeIndex(index) {
	var opposite = clone(index);
	_.forEach(opposite, function(direction, key) {
		opposite[key] = direction * -1;
	});
	return opposite;
}

function compoundIndexExists(indexes, index) {
	var exists = false, oppositeExists = false,
		opposite = oppositeIndex(index);
	_.forEach(indexes, function(key) {
		if (JSON.stringify(key) === JSON.stringify(index) && !exists) {
			exists = true;
		} else if (JSON.stringify(key) === JSON.stringify(opposite) && !oppositeExists) {
			oppositeExists = true;
		}
		if (exists && oppositeExists) {
			return false;
		}
	});
	if (exists && oppositeExists) {
		return 2;
	} else if (oppositeExists) {
		return 1;
	} else if (exists) {
		return true;
	} else {
		return false;
	}
}

function keysInSameOrder(obj1, obj2) {
	var arr1 = [],
		arr2 = [];
	_.forEach(obj1, function(val, key) {
		arr1.push(key);
	});
	_.forEach(obj2, function(val, key) {
		arr2.push(key);
	});
	return JSON.stringify(arr1) === JSON.stringify(arr2);
}

function flipDirections(options) {
	_.forEach(options.sortBy, function(direction, key) {
		options.sortBy[key] = direction * -1;
	});
	options.flip = !options.flip;
}

function execPagination(q, callback) {
	var _return = {},
		after, before;

	q.exec(function(err, objects) {
		if (!objects) {
			objects = [];
		}
		if (q.options.flip) {
			objects.reverse();
		}

		_return.objects = objects;
		_return.thisPageCount = objects.length;

		if (objects.length > 0) {
			_return.after = {};
			_return.before = {};

			after = objects.length - 1;
			before = 0;

			_.forEach(q.options.sortBy, function(direction, sortKey) {
				_return.after[sortKey] = objects[after][sortKey].toString();
				_return.before[sortKey] = objects[before][sortKey].toString();
			});

			_return.after = encode(_return.after);
			_return.before = encode(_return.before);
		} else {
			_return.after = null;
			_return.before = null;
		}

		return callback(err, _return);
	});
}

function setPaginateParams(options, model, last) {
	if (!options.sortBy) {
		options.sortBy = {};
	}

	options.sortBy._id = 1;
	options.flip = false;

	if (_.size(options.sortBy) > 1) {
		_.forEach(options.sortBy, function(direction, sortKey) {
			options.sortBy[sortKey] = parseInt(direction, 10);
		});

		_.forEach(options.sortBy, function(direction, sortKey) {
			options.sortBy._id = direction; // direction is primary sort key (first key)
			return false;
		});
	}

	if (last) {
		flipDirections(options);
		return;
	}

	if (options.after && options.before) {
		throw new HttpError(400, 'Pagination can\'t have both after and before parameter');
	}

	if (options.after || options.before) {
		var hasIndex = compoundIndexExists(getIndexKeys(model), options.sortBy);

		if (hasIndex) {
			if (options.after && keysInSameOrder(options.after, options.sortBy)) {
				options.filter = {};
				options.after._id = mongoose.Types.ObjectId(options.after._id);
				if (hasIndex === 1) {
					options.filter = {max: options.after, skip: 1};
					options.filter.hint = oppositeIndex(options.sortBy);
				} else {
					options.filter = {min: options.after, skip: 1};
					options.filter.hint = clone(options.sortBy);
				}
			} else if (options.before && keysInSameOrder(options.before, options.sortBy)) {
				options.filter = {};
				options.before._id = mongoose.Types.ObjectId(options.before._id);
				if (hasIndex === 1) {
					options.filter = {min: options.before, skip: 1};
					options.filter.hint = oppositeIndex(options.sortBy);
				} else {
					options.filter = {max: options.before, skip: 1};
					options.filter.hint = clone(options.sortBy);
				}
				flipDirections(options);
			}
		}
	}
}

function paginate(q, fromPageNumber, toPageNumber, resultsPerPage, callback, options) {
	var query, skipTo, columns, sortBy, filter, populate, pageJump,
		last = options.last == 'true', model = this;

	options = options || {};
	setPaginateParams(options, model, last);

	columns = options.columns || null;
	sortBy = options.sortBy || null;
	filter = options.filter || null;
	populate = options.populate || null;
	callback = callback || function() {};

	skipTo = (toPageNumber * resultsPerPage) - resultsPerPage;
	pageJump = Math.abs(toPageNumber - fromPageNumber);

	query = model.find(clone(q));

	if (columns) {
		query = query.select(columns);
	}
	if (filter) {
		query.setOptions(filter);
	}
	if (sortBy) {
		query = query.sort(sortBy);
	}
	if (populate) {
		if (Array.isArray(populate)) {
			populate.forEach(function(field) {
				query = query.populate(field);
			});
		} else {
			query = query.populate(populate);
		}
	}

	query.options.flip = options.flip;
	query.options.sortBy = options.sortBy;

	if (last) {
		model.count(q, function(err, count) {
			if (err) {
				return callback(err);
			}
			if (count % resultsPerPage) {
				query = query.limit(count % resultsPerPage);
			} else {
				query = query.limit(resultsPerPage);
			}
			execPagination(query, function(err, data) {
				if (err) {
					callback(err);
				}
				callback(null, toPageNumber, data.before, data.after, data.thisPageCount,
					Math.ceil(count / resultsPerPage) || 1, count, data.objects);
			});
		});
	} else {
		// fallback to traditional skip when options.after or options.before not given
		if (!filter) {
			query = query.skip(skipTo);
		// go to page current+|N|, |N| > 1
		} else if (pageJump > 1) {
			skipTo = ((pageJump - 1) * resultsPerPage) + filter.skip;
			query.setOptions({skip: skipTo});
		}
		query = query.limit(resultsPerPage);
		async.parallel({
			results: function(callback) {
				execPagination(query, callback);
			},
			count: function(callback) {
				model.count(q, function(err, count) {
					callback(err, count);
				});
			}
		}, function(error, data) {
			if (error) {
				return callback(error);
			}
			callback(null, toPageNumber, data.results.before, data.results.after, data.results.thisPageCount,
					Math.ceil(data.count / resultsPerPage) || 1, data.count, data.results.objects);
		});
	}
}

module.exports = function(schema) {
	schema.statics.paginate = paginate;
};
