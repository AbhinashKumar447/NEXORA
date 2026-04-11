const mongoose = require('mongoose');

const emailOtpSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: true,
			lowercase: true,
			trim: true,
			index: true,
		},
		otpHash: {
			type: String,
			required: true,
			select: false,
		},
		expiresAt: {
			type: Date,
			required: true,
		},
		attempts: {
			type: Number,
			default: 0,
			min: 0,
		},
		verifiedAt: {
			type: Date,
			default: null,
		},
	},
	{ timestamps: true }
);

// Auto-delete records once expired
emailOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('EmailOtp', emailOtpSchema);
