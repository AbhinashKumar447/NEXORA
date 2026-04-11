import api from './api.js';

export async function login(payload) {
	const { data } = await api.post('/auth/login', payload);
	return data;
}

export async function register(payload) {
	const { data } = await api.post('/auth/register', payload);
	return data;
}

export async function requestOtp(payload) {
	const { data } = await api.post('/auth/request-otp', payload);
	return data;
}

export async function verifyOtp(payload) {
	const { data } = await api.post('/auth/verify-otp', payload);
	return data;
}

// Backwards-compatible alias
export async function signup(payload) {
	return register(payload);
}

export default { login, register, signup, requestOtp, verifyOtp };
