const College = require('../models/College');
const { domainToCollegeName } = require('../utils/email');

async function getOrCreateCollegeByDomain(domain) {
	const normalized = (domain || '').trim().toLowerCase();
	let college = await College.findOne({ domain: normalized });
	if (college) return college;

	college = await College.create({
		domain: normalized,
		name: domainToCollegeName(normalized),
	});

	return college;
}

module.exports = { getOrCreateCollegeByDomain };
