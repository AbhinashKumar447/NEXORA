function extractEmailDomain(email) {
	if (!email || typeof email !== 'string') return '';
	const at = email.lastIndexOf('@');
	if (at === -1) return '';
	return email.slice(at + 1).trim().toLowerCase();
}

function domainToCollegeName(domain) {
	if (!domain) return 'Unknown College';
	const first = domain.split('.').filter(Boolean)[0];
	if (!first) return domain;
	return first
		.split('-')
		.map((p) => (p ? p[0].toUpperCase() + p.slice(1) : p))
		.join(' ');
}

module.exports = { extractEmailDomain, domainToCollegeName };
