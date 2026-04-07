const express = require('express');
const { body, query, param } = require('express-validator');

const { createRequest, listRequests, respond } = require('../controllers/studyHelpController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.get(
	'/',
	[
		query('collegeId').optional().isMongoId(),
		query('page').optional().isInt({ min: 1 }),
		query('limit').optional().isInt({ min: 1, max: 50 }),
	],
	validate,
	listRequests
);

router.post(
	'/',
	authMiddleware,
	[
		body('title').isString().trim().isLength({ min: 3, max: 140 }),
		body('description').optional().isString().trim().isLength({ max: 2000 }),
	],
	validate,
	createRequest
);

router.post(
	'/:id/respond',
	authMiddleware,
	[param('id').isMongoId(), body('message').isString().trim().isLength({ min: 1, max: 800 })],
	validate,
	respond
);

module.exports = router;
