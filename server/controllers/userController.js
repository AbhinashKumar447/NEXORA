const { asyncHandler } = require('../utils/asyncHandler');
const userService = require('../services/userService');

const getUsers = asyncHandler(async (req, res) => {
	const { collegeId, page, limit } = req.query;
	const result = await userService.listUsers({ collegeId, page, limit });
	res.status(200).json({ success: true, ...result });
});

const searchUsers = asyncHandler(async (req, res) => {
	const { q, skill, skills, interest, interests, college, collegeId, branch, year, page, limit } = req.query;
	const result = await userService.searchUsers({
		q,
		skill,
		skills,
		interest,
		interests,
		college,
		collegeId,
		branch,
		year,
		page,
		limit,
	});
	res.status(200).json({ success: true, ...result });
});

const getUserById = asyncHandler(async (req, res) => {
	const user = await userService.getById(req.params.id);
	res.status(200).json({ success: true, user });
});

const getMe = asyncHandler(async (req, res) => {
	const user = await userService.getById(req.user.id);
	res.status(200).json({ success: true, user });
});

const updateMe = asyncHandler(async (req, res) => {
	const user = await userService.updateProfile(req.user.id, req.body || {});
	res.status(200).json({ success: true, user });
});

module.exports = { getUsers, searchUsers, getUserById, getMe, updateMe };
