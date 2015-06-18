var db = require('./document'),
	fixtures = require('../fixtures');

module.exports = function() {
	var connection;
	var modelsToLoad = Array.prototype.slice.call(arguments);

	before(function(done) {
		this.timeout(8000);

		db.ensureConnected().then(function(conn) {
			connection = conn;
			done();
		}, function(err) {
			done(err);
		});
	});

	beforeEach(function(done) {
		connection.db.dropDatabase(function(dropErr) {
			if (dropErr) {
				done(dropErr);
				return;
			}

			db.ensureIndexes().then(function() {
				fixtures.load({modelNames: modelsToLoad}, function() {
					done();
				});
			}, function(indexErr) {
				done(indexErr);
			});
		});
	});

	// after(function(done) {
	// 	connection.db.dropDatabase(function(dropErr) {
	// 		if (dropErr) {
	// 			done(dropErr);
	// 			return;
	// 		}
	// 		done();
	// 	});
	// });

};
