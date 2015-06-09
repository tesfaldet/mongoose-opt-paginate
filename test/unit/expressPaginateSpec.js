var should = require('chai').should();

describe('expressPaginate', function () {
	var expressPaginate = require('../../lib/expressPaginate');

	it('should expose a setQueryParams function', function(done) {
		should.exist(expressPaginate.setQueryParams);
		done();
	});
});
