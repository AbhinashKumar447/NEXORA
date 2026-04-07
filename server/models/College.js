const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		domain: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model('College', collegeSchema);
