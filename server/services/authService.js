const bcrypt = require('bcryptjs');

const User = require('../models/User');
const { ApiError } = require('../utils/ApiError');
const { extractEmailDomain } = require('../utils/email');
const { signToken } = require('../utils/jwt');
const { getOrCreateCollegeByDomain } = require('./collegeService');

async function register({ name, email, password }) {
	const normalizedEmail = (email || '').trim().toLowerCase();
	const domain = extractEmailDomain(normalizedEmail);
	if (!domain) throw new ApiError(400, 'Invalid email');

	const existing = await User.findOne({ email: normalizedEmail });
	if (existing) throw new ApiError(409, 'Email already registered');

	const college = await getOrCreateCollegeByDomain(domain);
	const passwordHash = await bcrypt.hash(password, 12);

	const user = await User.create({
		name,
		email: normalizedEmail,
		passwordHash,
		emailDomain: domain,
		collegeId: college._id,
	});

	const token = signToken({ userId: user._id.toString() });
	return {
		token,
		user: {
			id: user._id,
			name: user.name,
			email: user.email,
			collegeId: user.collegeId,
			emailDomain: user.emailDomain,
		},
	};
}

async function login({ email, password }) {
	const normalizedEmail = (email || '').trim().toLowerCase();
	const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');
	if (!user) throw new ApiError(401, 'Invalid credentials');

	const ok = await bcrypt.compare(password, user.passwordHash);
	if (!ok) throw new ApiError(401, 'Invalid credentials');

	const token = signToken({ userId: user._id.toString() });
	return {
		token,
		user: {
			id: user._id,
			name: user.name,
			email: user.email,
			collegeId: user.collegeId,
			emailDomain: user.emailDomain,
		},
	};
}

module.exports = { register, login };
