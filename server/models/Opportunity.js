const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema(
	{
		title: { type: String, required: true, trim: true, maxlength: 120 },
		description: { type: String, default: '', trim: true, maxlength: 2000 },
		type: {
			type: String,
			enum: ['team', 'mentorship', 'internship', 'study_help'],
			required: true,
		},
		collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
		ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		skills: [{ type: String, trim: true, maxlength: 40 }],
		status: { type: String, enum: ['open', 'closed'], default: 'open' },
		applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
		startsAt: { type: Date, default: null },
		expiresAt: { type: Date, default: null },
	},
	{ timestamps: true }
);

opportunitySchema.index({ collegeId: 1, createdAt: -1 });
opportunitySchema.index({ type: 1, createdAt: -1 });
opportunitySchema.index({ skills: 1 });
opportunitySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
opportunitySchema.index({ startsAt: 1 });

module.exports = mongoose.model('Opportunity', opportunitySchema);
