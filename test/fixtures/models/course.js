var mongoose = require('mongoose'),
	CourseSchema = new mongoose.Schema({
		name: {type: String, required: true},
		code: {type: String, unique: true, required: true},
		description: String
	});

module.exports = mongoose.model('Course', CourseSchema);
