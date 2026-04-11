const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const otpGenerator = require('otp-generator');

const User = require('../models/User');
const EmailOtp = require('../models/EmailOtp');
const { ApiError } = require('../utils/ApiError');
const { extractEmailDomain } = require('../utils/email');
const { signToken, signEmailVerificationToken, verifyEmailVerificationToken } = require('../utils/jwt');
const { getOrCreateCollegeByDomain } = require('./collegeService');
const { sendOTP } = require('./mailService');

function hashOtp({ email, otp }) {
	const secret = process.env.OTP_SECRET || process.env.JWT_SECRET || 'otp_secret';
	return crypto.createHash('sha256').update(`${email}.${otp}.${secret}`).digest('hex');
}

async function requestOtp({ email }) {
	const normalizedEmail = (email || '').trim().toLowerCase();
	if (!normalizedEmail) throw new ApiError(400, 'Email is required');

	const existing = await User.findOne({ email: normalizedEmail });
	if (existing) throw new ApiError(409, 'Email already registered');

	const otp = otpGenerator.generate(6, {
		digits: true,
		upperCaseAlphabets: false,
		lowerCaseAlphabets: false,
		specialChars: false,
	});

	const ttlMs = Number(process.env.OTP_TTL_MS || 5 * 60 * 1000);
	const expiresAt = new Date(Date.now() + ttlMs);

	await EmailOtp.deleteMany({ email: normalizedEmail });
	await EmailOtp.create({
		email: normalizedEmail,
		otpHash: hashOtp({ email: normalizedEmail, otp }),
		expiresAt,
	});

	const mailResult = await sendOTP(normalizedEmail, otp);
	if (!mailResult || mailResult.success !== true) {
		await EmailOtp.deleteMany({ email: normalizedEmail });
		const msg =
			mailResult && mailResult.error && mailResult.error.message
				? mailResult.error.message
				: 'Failed to send OTP';
		throw new ApiError(500, `Failed to send OTP email: ${msg}`);
	}
	return { message: 'OTP sent' };
}

async function verifyOtp({ email, otp }) {
	const normalizedEmail = (email || '').trim().toLowerCase();
	const code = String(otp || '').trim();
	if (!normalizedEmail) throw new ApiError(400, 'Email is required');
	if (!code) throw new ApiError(400, 'OTP is required');

	const record = await EmailOtp.findOne({ email: normalizedEmail }).select('+otpHash');
	if (!record) throw new ApiError(400, 'OTP not requested');
	if (record.verifiedAt) throw new ApiError(400, 'OTP already used');
	if (record.expiresAt.getTime() < Date.now()) {
		await EmailOtp.deleteMany({ email: normalizedEmail });
		throw new ApiError(400, 'OTP expired');
	}

	const expected = record.otpHash;
	const provided = hashOtp({ email: normalizedEmail, otp: code });
	if (provided !== expected) {
		record.attempts = (record.attempts || 0) + 1;
		const maxAttempts = Number(process.env.OTP_MAX_ATTEMPTS || 5);
		if (record.attempts >= maxAttempts) {
			await EmailOtp.deleteMany({ email: normalizedEmail });
			throw new ApiError(400, 'Too many attempts. Request a new OTP');
		}
		await record.save();
		throw new ApiError(400, 'Invalid OTP');
	}

	record.verifiedAt = new Date();
	await record.save();

	const emailVerificationToken = signEmailVerificationToken({ email: normalizedEmail });
	return { emailVerificationToken };
}

async function register({ name, email, password, emailVerificationToken }) {
	const normalizedEmail = (email || '').trim().toLowerCase();
	if (!emailVerificationToken) throw new ApiError(400, 'Email verification required');

	let verifiedPayload;
	try {
		verifiedPayload = verifyEmailVerificationToken(emailVerificationToken);
	} catch {
		throw new ApiError(400, 'Invalid or expired email verification');
	}

	if ((verifiedPayload.email || '').toLowerCase() !== normalizedEmail) {
		throw new ApiError(400, 'Email verification does not match email');
	}

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

	await EmailOtp.deleteMany({ email: normalizedEmail });

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

module.exports = { register, login, requestOtp, verifyOtp };
