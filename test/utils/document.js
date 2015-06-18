var mongoose = require('mongoose'),
	BPromise = require('bluebird'),
	_ = require('lodash');

var registerDisconnect = _.once(function() {
	process.on('exit', function() {
		mongoose.disconnect();
	});
});

var connection;

module.exports.ensureConnected = function() {
	return new BPromise(function(resolve, reject) {
		if (connection) {
			resolve(connection);
			return;
		}

		registerDisconnect();

		var testMongoPort = 27888,
			testMongoDbName = 'mop_test',
			dbUrl = 'mongodb://localhost:' + testMongoPort + '/' + testMongoDbName;

		console.log('Connecting to DB ' + dbUrl);

		mongoose.connection.once('error', reject);
		mongoose.connection.once('open', function() {
			connection = mongoose.connection;
			console.log('DB connected.');
			resolve(connection);
		});

		mongoose.connect(dbUrl, {db: {w: 'majority'}});
	});
};

module.exports.ensureIndexes = function() {
	var models = require('../fixtures/models');

	var buildIndexes = _.chain(models)
		.filter(function(model) {
			return model.schema.indexes().length > 0;
		})
		.map(function(model) {
			return new BPromise(function(resolve) {
				model.once('index', resolve);
				model.ensureIndexes();
			});
		}).value();

	return BPromise.all(buildIndexes);
};
