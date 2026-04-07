const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema(
	{
		userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		title: { type: String, required: true, trim: true, maxlength: 120 },
		description: { type: String, default: '', trim: true, maxlength: 1000 },
		proofType: { type: String, enum: ['image', 'link', 'none'], default: 'none' },
		proofUrl: { type: String, default: '', trim: true },
		verificationStatus: { type: String, enum: ['self', 'proof', 'verified'], default: 'self' },
		isVerified: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

achievementSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Achievement', achievementSchema);
