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

function parseIsoDateOnly(value) {
	if (value === undefined || value === null || value === '') return null;
	const str = String(value);
	const match = /^\d{4}-\d{2}-\d{2}$/.exec(str);
	if (!match) throw new ApiError(400, 'Invalid date format. Use YYYY-MM-DD');
	const [yearStr, monthStr, dayStr] = str.split('-');
	const year = Number(yearStr);
	const month = Number(monthStr);
	const day = Number(dayStr);
	const dt = new Date(Date.UTC(year, month - 1, day));
	if (Number.isNaN(dt.getTime())) throw new ApiError(400, 'Invalid date');
	return dt;
}

function utcStartOfToday() {
	const now = new Date();
	return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function addUtcMonths(dateUtcMidnight, months) {
	return new Date(
		Date.UTC(
			dateUtcMidnight.getUTCFullYear(),
			dateUtcMidnight.getUTCMonth() + months,
			dateUtcMidnight.getUTCDate()
		)
	);
}

async function createOpportunity({ ownerId, title, description, type, skills, startDate, endDate }) {
	const owner = await User.findById(ownerId);
	if (!owner) throw new ApiError(404, 'Owner not found');

	const startsAt = parseIsoDateOnly(startDate);
	const endAtStartOfDay = parseIsoDateOnly(endDate);
	if ((startsAt && !endAtStartOfDay) || (!startsAt && endAtStartOfDay)) {
		throw new ApiError(400, 'Provide both startDate and endDate, or neither');
	}
	if (startsAt && endAtStartOfDay && endAtStartOfDay.getTime() < startsAt.getTime()) {
		throw new ApiError(400, 'endDate must be on or after startDate');
	}
	if (startsAt && endAtStartOfDay) {
		const today = utcStartOfToday();
		if (startsAt.getTime() < today.getTime()) throw new ApiError(400, 'startDate cannot be in the past');
		if (endAtStartOfDay.getTime() < today.getTime()) throw new ApiError(400, 'endDate cannot be in the past');

		const maxAllowedEnd = addUtcMonths(today, 2);
		if (endAtStartOfDay.getTime() > maxAllowedEnd.getTime()) {
			throw new ApiError(400, 'endDate cannot be more than 2 months from today');
		}
	}

	const expiresAt = endAtStartOfDay
		? new Date(endAtStartOfDay.getTime() + 24 * 60 * 60 * 1000 - 1)
		: null;

	const opportunity = await Opportunity.create({
		title,
		description,
		type,
		skills: parseCsvList(skills),
		collegeId: owner.collegeId,
		ownerId,
		startsAt,
		expiresAt,
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

	const now = new Date();
	const expiryClause = {
		$or: [{ expiresAt: { $exists: false } }, { expiresAt: null }, { expiresAt: { $gt: now } }],
	};
	const startClause = {
		$or: [{ startsAt: { $exists: false } }, { startsAt: null }, { startsAt: { $lte: now } }],
	};
	query.$and = (query.$and || []).concat([expiryClause, startClause]);

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
	if (op.startsAt && op.startsAt.getTime() > Date.now()) throw new ApiError(404, 'Opportunity not found');
	if (op.expiresAt && op.expiresAt.getTime() <= Date.now()) throw new ApiError(404, 'Opportunity not found');
	return op;
}

async function applyToOpportunity({ opportunityId, userId }) {
	const op = await getOpportunityById(opportunityId);
	if (op.expiresAt && op.expiresAt.getTime() <= Date.now()) throw new ApiError(400, 'Opportunity is expired');
	const ownerId = op.ownerId?._id ? op.ownerId._id.toString() : op.ownerId?.toString();
	if (ownerId && ownerId === userId) throw new ApiError(403, 'Owner cannot apply to own opportunity');
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
