import api from './api.js';

export async function listRequests(params = {}) {
	const { data } = await api.get('/study-help', { params });
	return data;
}

export async function createRequest(payload) {
	const { data } = await api.post('/study-help', payload);
	return data;
}

export async function respondToRequest(requestId, payload) {
	const { data } = await api.post(`/study-help/${requestId}/respond`, payload);
	return data;
}

export default { listRequests, createRequest, respondToRequest };
