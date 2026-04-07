import axios from 'axios';

const TOKEN_KEY = 'nexora_token';

function getToken() {
	try {
		return localStorage.getItem(TOKEN_KEY) || '';
	} catch {
		return '';
	}
}

const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL || '/api',
	headers: {
		'Content-Type': 'application/json',
	},
});

api.interceptors.request.use((config) => {
	const token = getToken();
	if (token && !config.headers?.Authorization) {
		config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` };
	}
	return config;
});

api.interceptors.response.use(
	(res) => res,
	(error) => {
		const status = error?.response?.status;
		const data = error?.response?.data;
		const message =
			(data && typeof data === 'object' && data.message) ||
			error?.message ||
			'Request failed';

		const normalized = new Error(message);
		normalized.status = status;
		normalized.data = data;
		return Promise.reject(normalized);
	}
);

export default api;
