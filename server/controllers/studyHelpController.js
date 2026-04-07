const { asyncHandler } = require('../utils/asyncHandler');
const studyHelpService = require('../services/studyHelpService');

const createRequest = asyncHandler(async (req, res) => {
	const { title, description } = req.body;
	const doc = await studyHelpService.createHelpRequest({ ownerId: req.user.id, title, description });
	res.status(201).json({ success: true, request: doc });
});

const listRequests = asyncHandler(async (req, res) => {
	const { collegeId, page, limit } = req.query;
	const result = await studyHelpService.listHelpRequests({ collegeId, page, limit });
	res.status(200).json({ success: true, ...result });
});

const respond = asyncHandler(async (req, res) => {
	const { message } = req.body;
	const doc = await studyHelpService.respondToRequest({ requestId: req.params.id, userId: req.user.id, message });
	res.status(200).json({ success: true, request: doc });
});

module.exports = { createRequest, listRequests, respond };
