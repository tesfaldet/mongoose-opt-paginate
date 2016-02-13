var	expressPaginate = require('./expressPaginate');

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

	function formatResponse(req, res, currentPage, before, after, pageCount, numPages, total, items) {
		if (before) {
			req.query.before = before;
		}

		if (after) {
			req.query.after = after;
		}

		req.query.currentPage = currentPage;

		var response = {
			page: currentPage,
			hasMore: expressPaginate.hasNextPages(req)(numPages),
			links: {
				first: expressPaginate.firstPage(req),
				prev: expressPaginate.prevPage(req, numPages),
				next: expressPaginate.nextPage(req, numPages),
				last: expressPaginate.lastPage(req, numPages)
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
		Model.paginate(
			search,
			req.query.currentPage,
			req.query.page,
			req.query.pageSize,
			function(err, newCurrentPage, before, after, pageCount, numPages, total, items) {
				if (err) {
					next(err);
					return;
				}

				if (typeof cb === 'function') {
					cb(formatResponse(req, res, newCurrentPage, before, after, pageCount, numPages, total, items));
				} else {
					return res.json(formatResponse(req, res, newCurrentPage, before, after, pageCount, numPages, total, items));
				}
			},
			options
		);
	}

	function paginate(req, res, next, search, options, cb) {
		expressPaginate.setQueryParams(req, conf.defaultPageSize, conf.maxPageSize);

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
	}

	return paginate;
};
