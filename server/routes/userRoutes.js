const express = require('express');
const { query, body } = require('express-validator');

const { getUsers, searchUsers, getUserById, getMe, updateMe } = require('../controllers/userController');
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
	getUsers
);

router.get(
	'/search',
	[
		query('q').optional().isString(),
		query('skill').optional().isString(),
		query('skills').optional().isString(),
		query('interest').optional().isString(),
		query('interests').optional().isString(),
		query('college').optional().isString(),
		query('collegeId').optional().isMongoId(),
		query('branch').optional().isString(),
		query('year').optional().isInt({ min: 1, max: 10 }),
		query('page').optional().isInt({ min: 1 }),
		query('limit').optional().isInt({ min: 1, max: 50 }),
	],
	validate,
	searchUsers
);

router.get('/me', authMiddleware, getMe);

router.put(
	'/me',
	authMiddleware,
	[
		body('name').optional().isString().trim().isLength({ min: 2, max: 80 }),
		body('branch').optional().isString().trim().isLength({ max: 80 }),
		body('year').optional().isInt({ min: 1, max: 10 }),
		body('skills').optional(),
		body('interests').optional(),
		body('bio').optional().isString().trim().isLength({ max: 300 }),
		body('avatarUrl').optional().isString().trim().isLength({ max: 500 }),
	],
	validate,
	updateMe
);

router.get('/:id', getUserById);

module.exports = router;
