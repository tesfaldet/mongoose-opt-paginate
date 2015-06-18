var mongoose = require('mongoose'),
	should = require('chai').should(); // jshint ignore:line

describe('mongoosePaginate', function () {
	var mongoosePaginate = require('../../lib/mongoosePaginate');

	mongoose.plugin(mongoosePaginate);
	require('../utils/testDb')('course'); // populate db with test data

	var Course = require('../fixtures/models/course');

	it('should return a paginated collection upon request', function(done) {
		var currentPage = '1',
			page = '2',
			resultsPerPage = '10';

		Course.paginate(
			{},
			currentPage,
			page,
			resultsPerPage,
			function(err, newCurrentPage, before, after, pageCount, numPages, total, items) {
				if (err) {
					done(err);
					return;
				}
				newCurrentPage.should.equal('2');
				before.should.equal('X2lkPTU0MjMwZDJjMjgyYTExMTUwMDM1NDJlYg%3D%3D');
				after.should.equal('X2lkPTU0MjMwZjE1MjgyYTExMTUwMDM1NDJmNQ%3D%3D');
				pageCount.should.equal(4);
				numPages.should.equal(2);
				total.should.equal(14);
				items.should.be.Array;
				items.should.not.be.empty;
				done();
			},
			{}
		);
	});
});
