const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
			maxlength: 80,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},
		passwordHash: {
			type: String,
			required: true,
			select: false,
		},
		emailDomain: {
			type: String,
			required: true,
			lowercase: true,
			trim: true,
		},
		collegeId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'College',
			required: true,
		},
		branch: { type: String, default: '', trim: true, maxlength: 80 },
		year: { type: Number, min: 1, max: 10 },
		skills: [{ type: String, trim: true, maxlength: 40 }],
		interests: [{ type: String, trim: true, maxlength: 40 }],
		bio: { type: String, default: '', trim: true, maxlength: 300 },
		avatarUrl: { type: String, default: '', trim: true },
		verified: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

userSchema.index({ collegeId: 1, createdAt: -1 });
userSchema.index({ skills: 1 });
userSchema.index({ name: 1 });
userSchema.index({ branch: 1, year: 1, updatedAt: -1 });

module.exports = mongoose.model('User', userSchema);
