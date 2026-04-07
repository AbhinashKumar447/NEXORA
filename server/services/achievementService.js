const mongoose = require('mongoose');

const Achievement = require('../models/Achievement');
const { ApiError } = require('../utils/ApiError');

async function addAchievement({ userId, title, description, proofType, proofUrl, verificationStatus }) {
	const doc = await Achievement.create({
		userId,
		title,
		description,
		proofType: proofType || (proofUrl ? 'link' : 'none'),
		proofUrl: proofUrl || '',
		verificationStatus: verificationStatus || 'self',
		isVerified: verificationStatus === 'verified',
	});

	return doc;
}

async function listAchievements({ userId, page = 1, limit = 10 }) {
	const query = {};
	if (userId) {
		if (!mongoose.isValidObjectId(userId)) throw new ApiError(400, 'Invalid userId');
		query.userId = userId;
	}

	const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);
	const safePage = Math.max(Number(page) || 1, 1);
	const skip = (safePage - 1) * safeLimit;

	const [items, total] = await Promise.all([
		Achievement.find(query).sort({ createdAt: -1 }).skip(skip).limit(safeLimit),
		Achievement.countDocuments(query),
	]);

	return {
		items,
		page: safePage,
		limit: safeLimit,
		total,
		pages: Math.ceil(total / safeLimit),
	};
}

module.exports = { addAchievement, listAchievements };
