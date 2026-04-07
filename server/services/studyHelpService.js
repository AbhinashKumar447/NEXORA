const mongoose = require('mongoose');

const StudyHelp = require('../models/StudyHelp');
const User = require('../models/User');
const { ApiError } = require('../utils/ApiError');

function getExpiryDate() {
	const hours = Number(process.env.STUDY_HELP_TTL_HOURS || 48);
	const ms = Math.max(hours, 1) * 60 * 60 * 1000;
	return new Date(Date.now() + ms);
}

async function createHelpRequest({ ownerId, title, description }) {
	const owner = await User.findById(ownerId);
	if (!owner) throw new ApiError(404, 'Owner not found');

	const doc = await StudyHelp.create({
		title,
		description,
		collegeId: owner.collegeId,
		ownerId,
		expiresAt: getExpiryDate(),
	});

	return doc;
}

async function listHelpRequests({ collegeId, page = 1, limit = 10 }) {
	const query = {};
	if (collegeId) {
		if (!mongoose.isValidObjectId(collegeId)) throw new ApiError(400, 'Invalid collegeId');
		query.collegeId = collegeId;
	}

	const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);
	const safePage = Math.max(Number(page) || 1, 1);
	const skip = (safePage - 1) * safeLimit;

	const [items, total] = await Promise.all([
		StudyHelp.find(query)
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(safeLimit)
			.populate('ownerId', 'name email')
			.populate('collegeId', 'name domain'),
		StudyHelp.countDocuments(query),
	]);

	return {
		items,
		page: safePage,
		limit: safeLimit,
		total,
		pages: Math.ceil(total / safeLimit),
	};
}

async function respondToRequest({ requestId, userId, message }) {
	if (!mongoose.isValidObjectId(requestId)) throw new ApiError(400, 'Invalid request id');
	const doc = await StudyHelp.findById(requestId);
	if (!doc) throw new ApiError(404, 'Study help request not found');

	doc.responses.push({ userId, message });
	await doc.save();

	return StudyHelp.findById(requestId)
		.populate('ownerId', 'name email')
		.populate('collegeId', 'name domain')
		.populate('responses.userId', 'name email');
}

module.exports = { createHelpRequest, listHelpRequests, respondToRequest };
