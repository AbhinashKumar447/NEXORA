const express = require('express');
const { body } = require('express-validator');

const { register, login } = require('../controllers/authController');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.post(
	'/register',
	[
		body('name').isString().trim().isLength({ min: 2, max: 80 }),
		body('email').isEmail().normalizeEmail(),
		body('password').isString().isLength({ min: 6, max: 100 }),
	],
	validate,
	register
);

// Alias for clients that use /signup
router.post(
	'/signup',
	[
		body('name').isString().trim().isLength({ min: 2, max: 80 }),
		body('email').isEmail().normalizeEmail(),
		body('password').isString().isLength({ min: 6, max: 100 }),
	],
	validate,
	register
);

router.post(
	'/login',
	[body('email').isEmail().normalizeEmail(), body('password').isString().isLength({ min: 1 })],
	validate,
	login
);

module.exports = router;
