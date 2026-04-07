const mongoose = require('mongoose');

const Opportunity = require('../models/Opportunity');
const User = require('../models/User');
const { ApiError } = require('../utils/ApiError');

function parseCsvList(value) {
	if (!value) return [];
	if (Array.isArray(value)) return value.map(String).map((s) => s.trim()).filter(Boolean);
	return String(value)
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean);
}

async function createOpportunity({ ownerId, title, description, type, skills }) {
	const owner = await User.findById(ownerId);
	if (!owner) throw new ApiError(404, 'Owner not found');

	const opportunity = await Opportunity.create({
		title,
		description,
		type,
		skills: parseCsvList(skills),
		collegeId: owner.collegeId,
		ownerId,
	});

	return opportunity;
}

async function listOpportunities({ collegeId, type, skills, page = 1, limit = 10 }) {
	const query = {};
	if (collegeId) {
		if (!mongoose.isValidObjectId(collegeId)) throw new ApiError(400, 'Invalid collegeId');
		query.collegeId = collegeId;
	}
	if (type) query.type = type;

	const skillList = parseCsvList(skills);
	if (skillList.length) query.skills = { $in: skillList };

	const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);
	const safePage = Math.max(Number(page) || 1, 1);
	const skip = (safePage - 1) * safeLimit;

	const [items, total] = await Promise.all([
		Opportunity.find(query)
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(safeLimit)
			.populate('ownerId', 'name email')
			.populate('collegeId', 'name domain'),
		Opportunity.countDocuments(query),
	]);

	return {
		items,
		page: safePage,
		limit: safeLimit,
		total,
		pages: Math.ceil(total / safeLimit),
	};
}

async function getOpportunityById(id) {
	if (!mongoose.isValidObjectId(id)) throw new ApiError(400, 'Invalid opportunity id');
	const op = await Opportunity.findById(id).populate('ownerId', 'name email').populate('collegeId', 'name domain');
	if (!op) throw new ApiError(404, 'Opportunity not found');
	return op;
}

async function applyToOpportunity({ opportunityId, userId }) {
	const op = await getOpportunityById(opportunityId);
	if (op.status !== 'open') throw new ApiError(400, 'Opportunity is closed');
	if (op.applicants.some((id) => id.toString() === userId)) {
		throw new ApiError(409, 'Already applied');
	}
	op.applicants.push(userId);
	await op.save();
	return op;
}

async function updateOpportunity({ opportunityId, userId, patch }) {
	const op = await getOpportunityById(opportunityId);
	if (op.ownerId._id ? op.ownerId._id.toString() !== userId : op.ownerId.toString() !== userId) {
		throw new ApiError(403, 'Not allowed');
	}

	const allowed = {
		title: patch.title,
		description: patch.description,
		type: patch.type,
		skills: patch.skills ? parseCsvList(patch.skills) : undefined,
		status: patch.status,
	};

	Object.keys(allowed).forEach((k) => {
		if (allowed[k] === undefined) delete allowed[k];
	});

	const updated = await Opportunity.findByIdAndUpdate(opportunityId, allowed, {
		new: true,
		runValidators: true,
	}).populate('ownerId', 'name email');

	return updated;
}

async function deleteOpportunity({ opportunityId, userId }) {
	const op = await getOpportunityById(opportunityId);
	if (op.ownerId._id ? op.ownerId._id.toString() !== userId : op.ownerId.toString() !== userId) {
		throw new ApiError(403, 'Not allowed');
	}
	await Opportunity.deleteOne({ _id: opportunityId });
	return { deleted: true };
}

module.exports = {
	createOpportunity,
	listOpportunities,
	getOpportunityById,
	applyToOpportunity,
	updateOpportunity,
	deleteOpportunity,
};
