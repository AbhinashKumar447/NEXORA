import api from './api.js';

export async function getMe() {
	const { data } = await api.get('/users/me');
	return data;
}

export async function updateMe(patch) {
	const { data } = await api.put('/users/me', patch);
	return data;
}

export async function listUsers(params = {}) {
	const { data } = await api.get('/users', { params });
	return data;
}

export async function searchUsers(params = {}) {
	const { data } = await api.get('/users/search', { params });
	return data;
}

export default { getMe, updateMe, listUsers, searchUsers };
