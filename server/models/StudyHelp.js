const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema(
	{
		userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		message: { type: String, required: true, trim: true, maxlength: 800 },
	},
	{ timestamps: true }
);

const studyHelpSchema = new mongoose.Schema(
	{
		title: { type: String, required: true, trim: true, maxlength: 140 },
		description: { type: String, default: '', trim: true, maxlength: 2000 },
		collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
		ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		responses: [responseSchema],
		expiresAt: { type: Date, required: true },
	},
	{ timestamps: true }
);

// TTL index: MongoDB will delete docs automatically after expiresAt.
studyHelpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
studyHelpSchema.index({ collegeId: 1, createdAt: -1 });

module.exports = mongoose.model('StudyHelp', studyHelpSchema);
