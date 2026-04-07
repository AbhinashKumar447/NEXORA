const express = require('express');
const { body, query } = require('express-validator');

const { addAchievement, listAchievements } = require('../controllers/achievementController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.get(
	'/',
	[
		query('userId').optional().isMongoId(),
		query('page').optional().isInt({ min: 1 }),
		query('limit').optional().isInt({ min: 1, max: 50 }),
	],
	validate,
	listAchievements
);

router.post(
	'/',
	authMiddleware,
	[
		body('title').isString().trim().isLength({ min: 2, max: 120 }),
		body('description').optional().isString().trim().isLength({ max: 1000 }),
		body('proofType').optional().isIn(['image', 'link', 'none']),
		body('proofUrl').optional().isString().trim().isLength({ max: 500 }),
		body('verificationStatus').optional().isIn(['self', 'proof', 'verified']),
	],
	validate,
	addAchievement
);

module.exports = router;
