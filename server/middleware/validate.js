const { validationResult } = require('express-validator');
const { ApiError } = require('../utils/ApiError');

function validate(req, _res, next) {
	const result = validationResult(req);
	if (result.isEmpty()) return next();

	throw new ApiError(400, 'Validation error', result.array());
}

module.exports = { validate };
