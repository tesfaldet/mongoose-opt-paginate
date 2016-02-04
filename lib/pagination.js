var	paginationHelpers = require('./paginationHelpers');

module.exports = function(Model, conf) {
	if (!conf) {
		conf = {
			defaultPageSize: 10,
			maxPageSize: 50
		};
	} else {
		conf.defaultPageSize = conf.defaultPageSize ? conf.defaultPageSize : 10;
		conf.maxPageSize = conf.maxPageSize ? conf.maxPageSize : 50;
	}

	function formatResponse(req, currentPage, before, after, pageCount, numPages, total, items) {
		if (before) {
			req.query.before = before;
		}

		if (after) {
			req.query.after = after;
		}

		req.query.currentPage = currentPage;

		var response = {
			page: currentPage,
			hasMore: paginationHelpers.hasNextPages(req.query)(numPages),
			links: {
				first: paginationHelpers.firstPage(req, req.query),
				prev: paginationHelpers.prevPage(req, req.query, numPages),
				next: paginationHelpers.nextPage(req, req.query, numPages),
				last: paginationHelpers.lastPage(req, req.query, numPages)
			},
			pageCount: pageCount,
			total: total,
			before: before,
			after: after,
			data: items
		};

		return response;
	}

	function searchModelAndPaginate(search, options, req, res, next, cb) {
		return Model.paginate(
			search,
			req.query.currentPage,
			req.query.page,
			req.query.pageSize,
			options
		)
		.then(function(pagingData) {
			if (typeof cb === 'function') {
				cb(formatResponse(
					req,
					pagingData.newCurrentPage,
					pagingData.before,
					pagingData.after,
					pagingData.pageCount,
					pagingData.numPages,
					pagingData.total,
					pagingData.items
				));
			} else {
				return formatResponse(
					req,
					pagingData.newCurrentPage,
					pagingData.before,
					pagingData.after,
					pagingData.pageCount,
					pagingData.numPages,
					pagingData.total,
					pagingData.items
				);
			}
		}, next);
	}

	return function paginate(req, res, next, search, options, cb) {
		paginationHelpers.setQueryParams(req.query, conf.defaultPageSize, conf.maxPageSize);

		options = options || {};

		if (req.query.sortBy) {
			options.sortBy = {};

			var splitFields = req.query.sortBy.split(',');

			var ascendingSortDirection = '1';
			var directions = req.query.sortDirection || ascendingSortDirection;
			var splitDirections = directions.split(',');

			for(var i = 0; splitFields[i]; i++) {
				splitFields[i] = splitFields[i].trim();
				options.sortBy[splitFields[i]] = splitDirections[i] || 1;
			}
		}

		if (req.query.before) {
			options.before = req.query.before;
		}

		if (req.query.after) {
			options.after = req.query.after;
		}

		if (req.query.last) {
			options.last = req.query.last;
		}

		if (!search) {
			search = {};
		}

		return searchModelAndPaginate(search, options, req, res, next, cb);
	};
};
