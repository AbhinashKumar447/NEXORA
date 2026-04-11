const { asyncHandler } = require('../utils/asyncHandler');
const opportunityService = require('../services/opportunityService');

const createOpportunity = asyncHandler(async (req, res) => {
	const { title, description, type, skills, startDate, endDate } = req.body;
	const op = await opportunityService.createOpportunity({
		ownerId: req.user.id,
		title,
		description,
		type,
		skills,
		startDate,
		endDate,
	});
	res.status(201).json({ success: true, opportunity: op });
});

const listOpportunities = asyncHandler(async (req, res) => {
	const { collegeId, type, skills, page, limit } = req.query;
	const result = await opportunityService.listOpportunities({ collegeId, type, skills, page, limit });
	res.status(200).json({ success: true, ...result });
});

const getOpportunity = asyncHandler(async (req, res) => {
	const op = await opportunityService.getOpportunityById(req.params.id);
	res.status(200).json({ success: true, opportunity: op });
});

const apply = asyncHandler(async (req, res) => {
	const op = await opportunityService.applyToOpportunity({ opportunityId: req.params.id, userId: req.user.id });
	res.status(200).json({ success: true, opportunity: op });
});

const updateOpportunity = asyncHandler(async (req, res) => {
	const op = await opportunityService.updateOpportunity({
		opportunityId: req.params.id,
		userId: req.user.id,
		patch: req.body || {},
	});
	res.status(200).json({ success: true, opportunity: op });
});

const deleteOpportunity = asyncHandler(async (req, res) => {
	const result = await opportunityService.deleteOpportunity({ opportunityId: req.params.id, userId: req.user.id });
	res.status(200).json({ success: true, ...result });
});

module.exports = {
	createOpportunity,
	listOpportunities,
	getOpportunity,
	apply,
	updateOpportunity,
	deleteOpportunity,
};
