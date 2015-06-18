var _ = require('lodash'),
	BPromise = require('bluebird'),
	models = require('./models'),
	requireDirectory = require('require-directory');

module.exports = {
	load: function(options, done) {
		options = options || {};
		done = done || Function.prototype;

		var fixture = requireDirectory(module, './data'),
			modelNamesToInsert = options.modelNames || Object.keys(fixture);

		BPromise.all(_.chain(fixture)
			.pick(modelNamesToInsert)
			.map(function(modelData, modelName) {
				return new BPromise(function(resolve, reject) {
					var Model = models[modelName];

					var bulk = Model.collection.initializeUnorderedBulkOp();
					_.each(modelData, function(data) {
						var model = new Model(data);
						bulk.insert(model.toObject());
					});

					bulk.execute(null, function(err, result) {
						if (err) {
							// This doesn't appear to get set if there is
							// an error. It's just here to be defensive in
							// case they do set it for errors in the future.
							reject(err);
							return;
						}
						var writeErrors = result.getWriteErrors();
						if (writeErrors.length) {
							_.each(writeErrors, function(error) {
								console.error(error.toString());
							});
							reject();
						} else {
							resolve();
						}
					});
				});
			}).value())
		.then(function() {
			done();
		})
		.catch(function(err) {
			if (err) {
				throw err;
			}
			throw new Error('Could not load test data');
		});
	}
};
