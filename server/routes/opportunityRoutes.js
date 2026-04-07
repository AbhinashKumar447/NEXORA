const express = require('express');
const { body, query, param } = require('express-validator');

const {
	createOpportunity,
	listOpportunities,
	getOpportunity,
	apply,
	updateOpportunity,
	deleteOpportunity,
} = require('../controllers/opportunityController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.get(
	'/',
	[
		query('collegeId').optional().isMongoId(),
		query('type').optional().isIn(['team', 'mentorship', 'internship', 'study_help']),
		query('skills').optional().isString(),
		query('page').optional().isInt({ min: 1 }),
		query('limit').optional().isInt({ min: 1, max: 50 }),
	],
	validate,
	listOpportunities
);

router.post(
	'/',
	authMiddleware,
	[
		body('title').isString().trim().isLength({ min: 3, max: 120 }),
		body('description').optional().isString().trim().isLength({ max: 2000 }),
		body('type').isIn(['team', 'mentorship', 'internship', 'study_help']),
		body('skills').optional(),
	],
	validate,
	createOpportunity
);

router.get('/:id', [param('id').isMongoId()], validate, getOpportunity);

router.post('/:id/apply', authMiddleware, [param('id').isMongoId()], validate, apply);

router.put(
	'/:id',
	authMiddleware,
	[
		param('id').isMongoId(),
		body('title').optional().isString().trim().isLength({ min: 3, max: 120 }),
		body('description').optional().isString().trim().isLength({ max: 2000 }),
		body('type').optional().isIn(['team', 'mentorship', 'internship', 'study_help']),
		body('skills').optional(),
		body('status').optional().isIn(['open', 'closed']),
	],
	validate,
	updateOpportunity
);

router.delete('/:id', authMiddleware, [param('id').isMongoId()], validate, deleteOpportunity);

module.exports = router;
