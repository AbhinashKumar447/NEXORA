const mongoose = require('mongoose');

const User = require('../models/User');
const College = require('../models/College');
const { ApiError } = require('../utils/ApiError');

function parseCsvList(value) {
	if (!value) return [];
	if (Array.isArray(value)) return value.map(String).map((s) => s.trim()).filter(Boolean);
	return String(value)
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean);
}

function escapeRegex(value) {
	return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function getById(userId) {
	if (!mongoose.isValidObjectId(userId)) throw new ApiError(400, 'Invalid user id');
	const user = await User.findById(userId).populate('collegeId', 'name domain');
	if (!user) throw new ApiError(404, 'User not found');
	return user;
}

async function listUsers({ collegeId, page = 1, limit = 10 }) {
	const query = {};
	if (collegeId) {
		if (!mongoose.isValidObjectId(collegeId)) throw new ApiError(400, 'Invalid collegeId');
		query.collegeId = collegeId;
	}

	const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);
	const safePage = Math.max(Number(page) || 1, 1);
	const skip = (safePage - 1) * safeLimit;

	const [items, total] = await Promise.all([
		User.find(query)
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(safeLimit)
			.populate('collegeId', 'name domain'),
		User.countDocuments(query),
	]);

	return {
		items,
		page: safePage,
		limit: safeLimit,
		total,
		pages: Math.ceil(total / safeLimit),
	};
}

async function searchUsers({
	q,
	skill,
	skills,
	interest,
	interests,
	college,
	collegeId,
	branch,
	year,
	page = 1,
	limit = 10,
}) {
	const match = {};

	if (collegeId) {
		if (!mongoose.isValidObjectId(collegeId)) throw new ApiError(400, 'Invalid collegeId');
		match.collegeId = new mongoose.Types.ObjectId(collegeId);
	} else if (college) {
		const collegeRegex = new RegExp(escapeRegex(college), 'i');
		const colleges = await College.find({
			$or: [{ name: collegeRegex }, { domain: collegeRegex }],
		})
			.select('_id')
			.limit(20);

		if (!colleges.length) {
			return { items: [], page: 1, limit: Math.min(Math.max(Number(limit) || 10, 1), 50), total: 0, pages: 0 };
		}
		match.collegeId = { $in: colleges.map((c) => c._id) };
	}

	if (branch) {
		match.branch = new RegExp(`^${escapeRegex(branch)}$`, 'i');
	}

	if (year !== undefined && year !== null && String(year).trim() !== '') {
		const yearNum = Number(year);
		if (!Number.isFinite(yearNum)) throw new ApiError(400, 'Invalid year');
		match.year = yearNum;
	}

	const skillList = parseCsvList(skills || skill);
	if (skillList.length) match.skills = { $in: skillList };

	const interestList = parseCsvList(interests || interest);
	if (interestList.length) match.interests = { $in: interestList };

	const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);
	const safePage = Math.max(Number(page) || 1, 1);
	const skip = (safePage - 1) * safeLimit;

	const keyword = String(q || '').trim();
	const keywordRegex = keyword ? new RegExp(escapeRegex(keyword), 'i') : null;

	const pipeline = [{ $match: match }];

	if (keywordRegex) {
		pipeline.push({
			$match: {
				$or: [
					{ name: keywordRegex },
					{ skills: { $elemMatch: { $regex: keywordRegex } } },
					{ interests: { $elemMatch: { $regex: keywordRegex } } },
					{ branch: keywordRegex },
				],
			},
		});

		pipeline.push({
			$addFields: {
				__score: {
					$add: [
						{
							$cond: [
								{ $regexMatch: { input: '$name', regex: keywordRegex } },
								100,
								0,
							],
						},
						{
							$cond: [
								{
									$anyElementTrue: {
										$map: {
											input: { $ifNull: ['$skills', []] },
											as: 's',
											in: { $regexMatch: { input: '$$s', regex: keywordRegex } },
										},
									},
								},
								50,
								0,
							],
						},
						{
							$cond: [
								{
									$anyElementTrue: {
										$map: {
											input: { $ifNull: ['$interests', []] },
											as: 'i',
											in: { $regexMatch: { input: '$$i', regex: keywordRegex } },
										},
									},
								},
								30,
								0,
							],
						},
					],
				},
			},
		});
	} else {
		pipeline.push({ $addFields: { __score: 0 } });
	}

	// Relevance (name > skills) then recent activity (updatedAt)
	pipeline.push({ $sort: { __score: -1, updatedAt: -1, createdAt: -1 } });

	pipeline.push({
		$facet: {
			items: [
				{ $skip: skip },
				{ $limit: safeLimit },
				{
					$lookup: {
						from: 'colleges',
						localField: 'collegeId',
						foreignField: '_id',
						as: 'collegeId',
					},
				},
				{ $unwind: { path: '$collegeId', preserveNullAndEmptyArrays: true } },
				{
					$project: {
						passwordHash: 0,
						__score: 0,
						__v: 0,
					},
				},
			],
			meta: [{ $count: 'total' }],
		},
	});

	const [result] = await User.aggregate(pipeline);
	const items = result?.items || [];
	const total = result?.meta?.[0]?.total || 0;
	const pages = total ? Math.ceil(total / safeLimit) : 0;

	return {
		items,
		page: safePage,
		limit: safeLimit,
		total,
		pages,
	};
}

async function updateProfile(userId, patch) {
	const allowed = {
		name: patch.name,
		branch: patch.branch,
		year: patch.year,
		skills: patch.skills,
		interests: patch.interests,
		bio: patch.bio,
		avatarUrl: patch.avatarUrl,
	};

	const updated = await User.findByIdAndUpdate(userId, allowed, {
		new: true,
		runValidators: true,
	}).populate('collegeId', 'name domain');

	if (!updated) throw new ApiError(404, 'User not found');
	return updated;
}

module.exports = { getById, listUsers, searchUsers, updateProfile };
