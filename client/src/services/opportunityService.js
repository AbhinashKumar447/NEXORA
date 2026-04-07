import api from './api.js';

export async function listOpportunities(params = {}) {
	const { data } = await api.get('/opportunities', { params });
	return data;
}

export async function createOpportunity(payload) {
	const { data } = await api.post('/opportunities', payload);
	return data;
}

export async function applyToOpportunity(opportunityId) {
	const { data } = await api.post(`/opportunities/${opportunityId}/apply`);
	return data;
}

export default { listOpportunities, createOpportunity, applyToOpportunity };
