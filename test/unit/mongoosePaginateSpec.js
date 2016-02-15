var mongoose = require('mongoose'),
	_ = require('lodash');

require('chai').should();

describe('mongoosePaginate', function () {
	var mongoosePaginate = require('../../lib/mongoosePaginate');

	mongoose.plugin(mongoosePaginate);
	require('../utils/testDb')('course'); // populate db with test data

	var Course = require('../fixtures/models/course');

	it('should return a paginated collection upon request', function() {
		var currentPage = '1',
			page = '2',
			resultsPerPage = '10';

		return Course.paginate(
			{},
			currentPage,
			page,
			resultsPerPage,
			{}
		)
		.then(function(pagingData) {
			pagingData.newCurrentPage.should.equal('2');
			pagingData.before.should.equal('X2lkPTU0MjMwZDJjMjgyYTExMTUwMDM1NDJlYg%3D%3D');
			pagingData.after.should.equal('X2lkPTU0MjMwZjE1MjgyYTExMTUwMDM1NDJmNQ%3D%3D');
			pagingData.pageCount.should.equal(4);
			pagingData.numPages.should.equal(2);
			pagingData.total.should.equal(14);
			pagingData.items.should.be.Array;
			pagingData.items.should.not.be.empty;
		});
	});

	it('should return a paginated collection consisting of _id and specified columns', function() {
		var currentPage = '1',
			page = '2',
			resultsPerPage = '10';

		return Course.paginate(
			{},
			currentPage,
			page,
			resultsPerPage,
			{
				columns: 'name'
			}
		)
		.then(function(pagingData) {
			pagingData.newCurrentPage.should.equal('2');
			pagingData.before.should.equal('X2lkPTU0MjMwZDJjMjgyYTExMTUwMDM1NDJlYg%3D%3D');
			pagingData.after.should.equal('X2lkPTU0MjMwZjE1MjgyYTExMTUwMDM1NDJmNQ%3D%3D');
			pagingData.pageCount.should.equal(4);
			pagingData.numPages.should.equal(2);
			pagingData.total.should.equal(14);
			pagingData.items.should.be.Array;
			pagingData.items.should.not.be.empty;
			pagingData.items[0].name.should.equal('MS Lync');
			mongoose.Types.ObjectId.isValid(pagingData.items[0]._id).should.be.truthy;
			pagingData.items[0]._id.should.deep.equal(mongoose.Types.ObjectId('54230d2c282a1115003542eb'));
			_.size(pagingData.items[0].toObject()).should.equal(2);
		});
	});

	it('should return a filtered paginated collection upon providing options.after', function() {
		var currentPage = '1',
			page = '2',
			resultsPerPage = '10';

		return Course.paginate(
			{},
			currentPage,
			page,
			resultsPerPage,
			{
				after: {
					_id: '54230b67282a1115003542d8'
				}
			}
		)
		.then(function(pagingData) {
			pagingData.newCurrentPage.should.equal('2');
			pagingData.before.should.equal('X2lkPTU0MjMwZDJjMjgyYTExMTUwMDM1NDJlYg%3D%3D');
			pagingData.after.should.equal('X2lkPTU0MjMwZjE1MjgyYTExMTUwMDM1NDJmNQ%3D%3D');
			pagingData.pageCount.should.equal(4);
			pagingData.numPages.should.equal(2);
			pagingData.total.should.equal(14);
			pagingData.items.should.be.Array;
			pagingData.items.should.not.be.empty;
		});
	});

	it('should return a filtered paginated collection upon providing options.before', function() {
		var currentPage = '2',
			page = '1',
			resultsPerPage = '10';

		return Course.paginate(
			{},
			currentPage,
			page,
			resultsPerPage,
			{
				before: {
					_id: '54230d2c282a1115003542eb'
				}
			}
		)
		.then(function(pagingData) {
			pagingData.newCurrentPage.should.equal('1');
			pagingData.before.should.equal('X2lkPTUzYmFiZmE1MTlhNGI0MDAwMGJjYjJkYQ%3D%3D');
			pagingData.after.should.equal('X2lkPTU0MjMwYjY3MjgyYTExMTUwMDM1NDJkOA%3D%3D');
			pagingData.pageCount.should.equal(10);
			pagingData.numPages.should.equal(2);
			pagingData.total.should.equal(14);
			pagingData.items.should.be.Array;
			pagingData.items.should.not.be.empty;
		});
	});

	it('should return the last page of a paginated collection upon providing options.last', function() {
		var currentPage = '1',
			page = '2',
			resultsPerPage = '10';

		return Course.paginate(
			{},
			currentPage,
			page,
			resultsPerPage,
			{
				last: 'true'
			}
		)
		.then(function(pagingData) {
			pagingData.newCurrentPage.should.equal('2');
			pagingData.before.should.equal('X2lkPTU0MjMwZDJjMjgyYTExMTUwMDM1NDJlYg%3D%3D');
			pagingData.after.should.equal('X2lkPTU0MjMwZjE1MjgyYTExMTUwMDM1NDJmNQ%3D%3D');
			pagingData.pageCount.should.equal(4);
			pagingData.numPages.should.equal(2);
			pagingData.total.should.equal(14);
			pagingData.items.should.be.Array;
			pagingData.items.should.not.be.empty;
		});
	});

	// not done
	it('should return a paginated collection upon request', function() {
		var currentPage = '1',
			page = '2',
			resultsPerPage = '10';

		return Course.paginate(
			{},
			currentPage,
			page,
			resultsPerPage,
			{
				populate: {path: 'facilitator', select: 'firstname lastname'}
			}
		)
		.then(function(pagingData) {
			pagingData.newCurrentPage.should.equal('2');
			pagingData.before.should.equal('X2lkPTU0MjMwZDJjMjgyYTExMTUwMDM1NDJlYg%3D%3D');
			pagingData.after.should.equal('X2lkPTU0MjMwZjE1MjgyYTExMTUwMDM1NDJmNQ%3D%3D');
			pagingData.pageCount.should.equal(4);
			pagingData.numPages.should.equal(2);
			pagingData.total.should.equal(14);
			pagingData.items.should.be.Array;
			pagingData.items.should.not.be.empty;
		});
	});
});
