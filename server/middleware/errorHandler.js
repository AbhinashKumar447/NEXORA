function notFound(_req, res, _next) {
	res.status(404).json({ success: false, message: 'Route not found' });
}

function errorHandler(err, _req, res, _next) {
	const statusCode = err && err.statusCode ? err.statusCode : res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

	res.status(statusCode).json({
		success: false,
		message: err && err.message ? err.message : 'Server error',
		details: err && err.details ? err.details : undefined,
		stack: process.env.NODE_ENV === 'production' ? undefined : err && err.stack ? err.stack : undefined,
	});
}

module.exports = { notFound, errorHandler };
