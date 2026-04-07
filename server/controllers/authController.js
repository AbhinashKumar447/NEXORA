const { asyncHandler } = require('../utils/asyncHandler');
const authService = require('../services/authService');

const register = asyncHandler(async (req, res) => {
	const { name, email, password } = req.body;
	const result = await authService.register({ name, email, password });
	res.status(201).json({ success: true, ...result });
});

const login = asyncHandler(async (req, res) => {
	const { email, password } = req.body;
	const result = await authService.login({ email, password });
	res.status(200).json({ success: true, ...result });
});

module.exports = { register, login };
