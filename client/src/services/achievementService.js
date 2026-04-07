import api from './api.js';

export async function listAchievements(params = {}) {
	const { data } = await api.get('/achievements', { params });
	return data;
}

export async function addAchievement(payload) {
	const { data } = await api.post('/achievements', payload);
	return data;
}

export default { listAchievements, addAchievement };
