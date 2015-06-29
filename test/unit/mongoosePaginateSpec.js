var mongoose = require('mongoose'),
	should = require('chai').should(), // jshint ignore:line
	_ = require('lodash');

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

	it('should return a paginated collection consisting of _id and specified columns', function(done) {
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
				items[0].name.should.equal('MS Lync');
				mongoose.Types.ObjectId.isValid(items[0]._id).should.be.truthy;
				items[0]._id.should.deep.equal(mongoose.Types.ObjectId('54230d2c282a1115003542eb'));
				_.size(items[0].toObject()).should.equal(2);
				done();
			},
			{
				columns: 'name'
			}
		);
	});

	it('should return a filtered paginated collection upon providing options.after', function(done) {
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
			{
				after: {
					_id: '54230b67282a1115003542d8'
				}
			}
		);
	});

	it('should return a filtered paginated collection upon providing options.before', function(done) {
		var currentPage = '2',
			page = '1',
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
				newCurrentPage.should.equal('1');
				before.should.equal('X2lkPTUzYmFiZmE1MTlhNGI0MDAwMGJjYjJkYQ%3D%3D');
				after.should.equal('X2lkPTU0MjMwYjY3MjgyYTExMTUwMDM1NDJkOA%3D%3D');
				pageCount.should.equal(10);
				numPages.should.equal(2);
				total.should.equal(14);
				items.should.be.Array;
				items.should.not.be.empty;
				done();
			},
			{
				before: {
					_id: '54230d2c282a1115003542eb'
				}
			}
		);
	});

	it('should return the last page of a paginated collection upon providing options.last', function(done) {
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
			{
				last: 'true'
			}
		);
	});

	// not done
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
			{
				populate: {path: 'facilitator', select: 'firstname lastname'}
			}
		);
	});
});
