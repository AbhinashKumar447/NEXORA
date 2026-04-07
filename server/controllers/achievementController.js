const { asyncHandler } = require('../utils/asyncHandler');
const achievementService = require('../services/achievementService');

const addAchievement = asyncHandler(async (req, res) => {
	const { title, description, proofType, proofUrl, verificationStatus } = req.body;
	const doc = await achievementService.addAchievement({
		userId: req.user.id,
		title,
		description,
		proofType,
		proofUrl,
		verificationStatus,
	});
	res.status(201).json({ success: true, achievement: doc });
});

const listAchievements = asyncHandler(async (req, res) => {
	const { userId, page, limit } = req.query;
	const result = await achievementService.listAchievements({ userId, page, limit });
	res.status(200).json({ success: true, ...result });
});

module.exports = { addAchievement, listAchievements };
