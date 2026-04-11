const { asyncHandler } = require('../utils/asyncHandler');
const authService = require('../services/authService');

const register = asyncHandler(async (req, res) => {
	const { name, email, password, emailVerificationToken } = req.body;
	const result = await authService.register({ name, email, password, emailVerificationToken });
	res.status(201).json({ success: true, ...result });
});

const login = asyncHandler(async (req, res) => {
	const { email, password } = req.body;
	const result = await authService.login({ email, password });
	res.status(200).json({ success: true, ...result });
});

const requestOtp = asyncHandler(async (req, res) => {
	const { email } = req.body;
	const result = await authService.requestOtp({ email });
	res.status(200).json({ success: true, ...result });
});

const verifyOtp = asyncHandler(async (req, res) => {
	const { email, otp } = req.body;
	const result = await authService.verifyOtp({ email, otp });
	res.status(200).json({ success: true, ...result });
});

module.exports = { register, login, requestOtp, verifyOtp };
