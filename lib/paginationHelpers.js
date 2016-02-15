var url = require('url'),
	_ = require('lodash'),
	clone = require('clone'),
	HttpError = require('http-errors'),
	querystring = require('querystring');

var exports = module.exports = {};

function decode(encoded) {
	return querystring.parse(new Buffer(querystring.unescape(encoded), 'base64').toString('utf8'));
}

exports.setQueryParams = function setQueryParams(queryParams, defaultPageSize, maxPageSize) {
	defaultPageSize = (typeof defaultPageSize === 'number') ? defaultPageSize : 10;
	maxPageSize = (typeof maxPageSize === 'number') ? maxPageSize : 50;

	queryParams.page = parseInt(queryParams.page, 10) || 1;
	queryParams.currentPage = parseInt(queryParams.currentPage, 10) || queryParams.page;
	queryParams.pageSize = parseInt(queryParams.pageSize, 10) || defaultPageSize;

	if (queryParams.pageSize > maxPageSize) {
		queryParams.pageSize = maxPageSize;
	}

	if (queryParams.page < 1) {
		queryParams.page = 1;
	}

	if (queryParams.currentPage < 1) {
		queryParams.currentPage = queryParams.page;
	}

	if (queryParams.pageSize < 1) {
		queryParams.pageSize = 1;
	}

	if (queryParams.before) {
		queryParams.before = decode(queryParams.before);
	}

	if (queryParams.after) {
		queryParams.after = decode(queryParams.after);
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

exports.hasNextPages = function hasNextPages(queryParams) {
	return function(numPages) {
		if (typeof numPages !== 'number' || numPages < 0) {
			throw new HttpError(500, '`numPages` is not a number >= 0');
		}
		return queryParams.page < numPages;
	};
};

exports.hasPreviousPages = function hasPreviousPages(queryParams) {
	return function(numPages) {
		if (typeof numPages !== 'number' || numPages < 0) {
			throw new HttpError(500, '`numPages` is not a number >= 0');
		}
		return queryParams.page > 1 && queryParams.page <= numPages;
	};
};

exports.firstPage = function firstPage(req, queryParams) {
	var query = clone(queryParams);

	query.page = 1;

	query = _.omit(query, ['before', 'after', 'last']);

	return url.parse(req.originalUrl).pathname + '?' + querystring.stringify(query);
};

exports.prevPage = function prevPage(req, queryParams, numPages) {
	return exports.hasPreviousPages(queryParams)(numPages) ? exports.href(req)(true) : undefined;
};

exports.nextPage = function nextPage(req, queryParams, numPages) {
	return exports.hasNextPages(queryParams)(numPages) ? exports.href(req)(false) : undefined;
};

exports.lastPage = function lastPage(req, queryParams, numPages) {
	var query = clone(queryParams);

	query.page = numPages;

	query = _.omit(query, ['before', 'after']);

	query.last = true;

	return url.parse(req.originalUrl).pathname + '?' + querystring.stringify(query);
};
