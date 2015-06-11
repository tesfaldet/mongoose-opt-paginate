var should = require('chai').should(); // jshint ignore:line

describe('expressPaginate', function () {
	var expressPaginate = require('../../lib/expressPaginate');

	it('should set query parameters on call to setQueryParams', function(done) {
		var req = {
			query: {
				before: 'X2lkPTU0MjQzMGZhYjZjOWIxMTUwMGNmZjdhZQ%3D%3D',
				after: 'X2lkPTU1Nzg4MmQ4Njg0NDEyYWUyYzQyMjU2NA%3D%3D'
			}
		},
		defaultPageSize = 10,
		maxPageSize = 50;
		expressPaginate.setQueryParams(req, defaultPageSize, maxPageSize);
		req.query.should.not.be.empty;
		req.query.page.should.equal(1);
		req.query.currentPage.should.equal(req.query.page);
		req.query.pageSize.should.equal(defaultPageSize);
		req.query.before.should.deep.equal({_id: '542430fab6c9b11500cff7ae'});
		req.query.after.should.deep.equal({_id: '557882d8684412ae2c422564'});

		req = {
			query: {
				page: -1,
				currentPage: -1,
				pageSize: 60
			}
		};
		expressPaginate.setQueryParams(req, defaultPageSize, maxPageSize);
		req.query.should.deep.equal({
			page: 1,
			currentPage: 1,
			pageSize: maxPageSize
		});

		req = {
			query: {
				pageSize: -1
			}
		};
		expressPaginate.setQueryParams(req, null, null);
		req.query.should.deep.equal({
			currentPage: 1,
			page: 1,
			pageSize: 1
		});
		done();
	});

	it('should provide a url for the first page', function(done) {
		var req = {
			query: {
				before: 'X2lkPTU0MjQzMGZhYjZjOWIxMTUwMGNmZjdhZQ%3D%3D',
				after: 'X2lkPTU1Nzg4MmQ4Njg0NDEyYWUyYzQyMjU2NA%3D%3D',
				sortBy: 'name',
				sortDirection: 1,
				page: 5,
				currentPage: 5
			},
			originalUrl: 'api/courses'
		},
		expectUrl = 'api/courses?sortBy=name&sortDirection=1&page=1&currentPage=5',
		resultUrl = expressPaginate.firstPage(req);

		resultUrl.should.equal(expectUrl);
		done();
	});

	it('should provide a url for the previous page', function(done) {
		var req = {
			query: {
				before: 'X2lkPTU0MjQzMGZhYjZjOWIxMTUwMGNmZjdhZQ%3D%3D',
				after: 'X2lkPTU1Nzg4MmQ4Njg0NDEyYWUyYzQyMjU2NA%3D%3D',
				sortBy: 'name',
				sortDirection: 1,
				page: 5,
				currentPage: 5
			},
			originalUrl: 'api/courses'
		},
		numPages = 10,
		expectUrl = 'api/courses?before=X2lkPTU0MjQzMGZhYjZjOWIxMTUwMGNmZjdhZQ%253D%253D&sortBy=name&sortDirection=1&page=4&currentPage=5',
		resultUrl = expressPaginate.prevPage(req, numPages);
		resultUrl.should.equal(expectUrl);

		numPages = 0,
		resultUrl = expressPaginate.prevPage(req, numPages);
		should.not.exist(resultUrl);

		numPages = '0';
		try {
			expressPaginate.prevPage(req, numPages);
		} catch (error) {
			error.name.should.equal('InternalServerError');
			error.status.should.equal(500);
			error.statusCode.should.equal(500);
			error.message.should.equal('`numPages` is not a number >= 0');
		}
		done();
	});

	it('should provide a url for the next page', function(done) {
		var req = {
			query: {
				before: 'X2lkPTU0MjQzMGZhYjZjOWIxMTUwMGNmZjdhZQ%3D%3D',
				after: 'X2lkPTU1Nzg4MmQ4Njg0NDEyYWUyYzQyMjU2NA%3D%3D',
				sortBy: 'name',
				sortDirection: 1,
				page: 5,
				currentPage: 5
			},
			originalUrl: 'api/courses'
		},
		numPages = 10,
		expectUrl = 'api/courses?after=X2lkPTU1Nzg4MmQ4Njg0NDEyYWUyYzQyMjU2NA%253D%253D&sortBy=name&sortDirection=1&page=6&currentPage=5',
		resultUrl = expressPaginate.nextPage(req, numPages);
		resultUrl.should.equal(expectUrl);

		numPages = 0,
		resultUrl = expressPaginate.nextPage(req, numPages);
		should.not.exist(resultUrl);

		numPages = '0';
		try {
			expressPaginate.nextPage(req, numPages);
		} catch (error) {
			error.name.should.equal('InternalServerError');
			error.status.should.equal(500);
			error.statusCode.should.equal(500);
			error.message.should.equal('`numPages` is not a number >= 0');
		}
		done();
	});

	it('should provide a url for the last page', function(done) {
		var req = {
			query: {
				before: 'X2lkPTU0MjQzMGZhYjZjOWIxMTUwMGNmZjdhZQ%3D%3D',
				after: 'X2lkPTU1Nzg4MmQ4Njg0NDEyYWUyYzQyMjU2NA%3D%3D',
				sortBy: 'name',
				sortDirection: 1,
				page: 5,
				currentPage: 5
			},
			originalUrl: 'api/courses'
		},
		numPages = 10,
		expectUrl = 'api/courses?sortBy=name&sortDirection=1&page=10&currentPage=5&last=true',
		resultUrl = expressPaginate.lastPage(req, numPages);

		resultUrl.should.equal(expectUrl);
		done();
	});

	it('should allow overwriting of query params', function(done) {
		var req = {
			query: {
				before: 'X2lkPTU0MjQzMGZhYjZjOWIxMTUwMGNmZjdhZQ%3D%3D',
				after: 'X2lkPTU1Nzg4MmQ4Njg0NDEyYWUyYzQyMjU2NA%3D%3D',
				sortBy: 'name',
				sortDirection: 1,
				page: 5,
				currentPage: 5
			},
			originalUrl: 'api/courses'
		},
		expectUrl = 'api/courses?before=X2lkPTU0MjQzMGZhYjZjOWIxMTUwMGNmZjdhZQ%253D%253D&sortBy=date&sortDirection=1&page=5&currentPage=5',
		resultUrl = expressPaginate.href(req)({sortBy: 'date'});

		resultUrl.should.equal(expectUrl);
		done();
	});
});
