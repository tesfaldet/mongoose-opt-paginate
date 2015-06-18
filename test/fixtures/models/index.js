var Bluebird = require('bluebird');

['course']
.forEach(function(modelName) {
	var model = require('./' + modelName);

	Bluebird.promisifyAll(model);

	module.exports[modelName] = model;
});
