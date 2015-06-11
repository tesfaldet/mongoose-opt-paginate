var url = require('url'),
	_ = require('lodash'),
	clone = require('clone'),
	HttpError = require('http-errors'),
	querystring = require('querystring');

var exports = module.exports = {};

function decode(encoded) {
	return querystring.parse(new Buffer(querystring.unescape(encoded), 'base64').toString('utf8'));
}

exports.setQueryParams = function setQueryParams(req, defaultPageSize, maxPageSize) {
	defaultPageSize = (typeof defaultPageSize === 'number') ? defaultPageSize : 10;
	maxPageSize = (typeof maxPageSize === 'number') ? maxPageSize : 50;

	req.query.page = parseInt(req.query.page, 10) || 1;
	req.query.currentPage = parseInt(req.query.currentPage, 10) || req.query.page;
	req.query.pageSize = parseInt(req.query.pageSize, 10) || defaultPageSize;

	if (req.query.pageSize > maxPageSize) {
		req.query.pageSize = maxPageSize;
	}

	if (req.query.page < 1) {
		req.query.page = 1;
	}

	if (req.query.currentPage < 1) {
		req.query.currentPage = req.query.page;
	}

	if (req.query.pageSize < 1) {
		req.query.pageSize = 1;
	}

	if (req.query.before) {
		req.query.before = decode(req.query.before);
	}

	if (req.query.after) {
		req.query.after = decode(req.query.after);
	}
};

exports.href = function href(req) {
	return function(prev, params) {
		var query = clone(req.query);

		query = _.omit(query, [prev ? 'after' : 'before', 'last']);

		if (typeof prev === 'object') {
			params = prev;
			prev = false;
		} else {
			prev = (typeof prev === 'boolean') ? prev : false;
			query.page += prev ? -1 : 1;
			query.page = (query.page < 1) ? 1 : query.page;
		}

		// allow overriding querystring params
		// (useful for sorting and filtering)
		// another alias for `_.assign` is `_.extend`
		if (typeof params === 'object') {
			query = _.assign(query, params);
		}

		return url.parse(req.originalUrl).pathname + '?' + querystring.stringify(query);
	};
};

exports.hasNextPages = function hasNextPages(req) {
	return function(numPages) {
		if (typeof numPages !== 'number' || numPages < 0) {
			throw new HttpError(500, '`numPages` is not a number >= 0');
		}
		return req.query.page < numPages;
	};
};

exports.hasPreviousPages = function hasPreviousPages(req) {
	return function(numPages) {
		if (typeof numPages !== 'number' || numPages < 0) {
			throw new HttpError(500, '`numPages` is not a number >= 0');
		}
		return req.query.page > 1 && req.query.page <= numPages;
	};
};

exports.firstPage = function firstPage(req) {
	var query = clone(req.query);

	query.page = 1;

	query = _.omit(query, ['before', 'after', 'last']);

	return url.parse(req.originalUrl).pathname + '?' + querystring.stringify(query);
};

exports.prevPage = function prevPage(req, numPages) {
	return exports.hasPreviousPages(req)(numPages) ? exports.href(req)(true) : undefined;
};

exports.nextPage = function nextPage(req, numPages) {
	return exports.hasNextPages(req)(numPages) ? exports.href(req)(false) : undefined;
};

exports.lastPage = function lastPage(req, numPages) {
	var query = clone(req.query);

	query.page = numPages;

	query = _.omit(query, ['before', 'after']);

	query.last = true;

	return url.parse(req.originalUrl).pathname + '?' + querystring.stringify(query);
};
