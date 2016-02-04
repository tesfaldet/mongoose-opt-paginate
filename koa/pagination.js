var	paginationHelpers = require('../lib/paginationHelpers');

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

	function formatResponse(ctx, currentPage, before, after, pageCount, numPages, total, items) {
		if (before) {
			ctx.query.before = before;
		}

		if (after) {
			ctx.query.after = after;
		}

		ctx.query.currentPage = currentPage;

		var response = {
			page: currentPage,
			hasMore: paginationHelpers.hasNextPages(ctx.query)(numPages),
			links: {
				first: paginationHelpers.firstPage(ctx.request, ctx.query),
				prev: paginationHelpers.prevPage(ctx.request, ctx.query, numPages),
				next: paginationHelpers.nextPage(ctx.request, ctx.query, numPages),
				last: paginationHelpers.lastPage(ctx.request, ctx.query, numPages)
			},
			pageCount: pageCount,
			total: total,
			before: before,
			after: after,
			data: items
		};

		return response;
	}

	function searchModelAndPaginate(ctx, search, options, cb) {
		return Model.paginate(
			search,
			ctx.query.currentPage,
			ctx.query.page,
			ctx.query.pageSize,
			options
		)
		.then(function(pagingData) {
			if (typeof cb === 'function') {
				cb(null, formatResponse(
					ctx,
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
					ctx,
					pagingData.newCurrentPage,
					pagingData.before,
					pagingData.after,
					pagingData.pageCount,
					pagingData.numPages,
					pagingData.total,
					pagingData.items
				);
			}
		}, function(err) {
			if (typeof cb === 'function') {
				cb(err, null);
				return;
			}

			throw err;
		});
	}

	return function paginate(ctx, search, options, cb) {
		paginationHelpers.setQueryParams(ctx.query, conf.defaultPageSize, conf.maxPageSize);

		options = options || {};

		if (ctx.query.sortBy) {
			options.sortBy = {};

			var splitFields = ctx.query.sortBy.split(',');

			var ascendingSortDirection = '1';
			var directions = ctx.query.sortDirection || ascendingSortDirection;
			var splitDirections = directions.split(',');

			for(var i = 0; splitFields[i]; i++) {
				splitFields[i] = splitFields[i].trim();
				options.sortBy[splitFields[i]] = splitDirections[i] || 1;
			}
		}

		if (ctx.query.before) {
			options.before = ctx.query.before;
		}

		if (ctx.query.after) {
			options.after = ctx.query.after;
		}

		if (ctx.query.last) {
			options.last = ctx.query.last;
		}

		if (!search) {
			search = {};
		}

		return searchModelAndPaginate(ctx, search, options, cb);
	};
};
