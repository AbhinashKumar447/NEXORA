const jwt = require('jsonwebtoken');

function signToken(payload) {
	const secret = process.env.JWT_SECRET;
	if (!secret) throw new Error('JWT_SECRET is not set in environment');

	const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
	return jwt.sign(payload, secret, { expiresIn });
}

function verifyToken(token) {
	const secret = process.env.JWT_SECRET;
	if (!secret) throw new Error('JWT_SECRET is not set in environment');

	return jwt.verify(token, secret);
}

function signEmailVerificationToken({ email }) {
	const secret = process.env.JWT_SECRET;
	if (!secret) throw new Error('JWT_SECRET is not set in environment');

	const expiresIn = process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN || '10m';
	return jwt.sign({ type: 'email_verify', email }, secret, { expiresIn });
}

function verifyEmailVerificationToken(token) {
	const payload = verifyToken(token);
	if (!payload || payload.type !== 'email_verify' || !payload.email) {
		throw new Error('Invalid email verification token');
	}
	return payload;
}

module.exports = { signToken, verifyToken, signEmailVerificationToken, verifyEmailVerificationToken };
