const { ApiError } = require('../utils/ApiError');
const { verifyToken } = require('../utils/jwt');

function authMiddleware(req, _res, next) {
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return next(new ApiError(401, 'Not authorized'));
	}

	const token = authHeader.split(' ')[1];
	try {
		const decoded = verifyToken(token);
		if (!decoded || !decoded.userId) {
			return next(new ApiError(401, 'Invalid token'));
		}

		req.user = { id: String(decoded.userId) };
		return next();
	} catch (_err) {
		return next(new ApiError(401, 'Invalid token'));
	}
}

module.exports = { authMiddleware };
