
const TOKEN_KEY = 'nexora_token';

function getStoredToken() {
	try {
		if (typeof window === 'undefined') return '';
		return localStorage.getItem(TOKEN_KEY) || '';
	} catch {
		return '';
	}
}

function buildUrl(path) {
	const baseUrl = import.meta.env.VITE_API_BASE_URL;
	if (!baseUrl) return path;
	return `${String(baseUrl).replace(/\/$/, '')}${path}`;
}

async function request(path, { method = 'GET', body, token, headers } = {}) {
	const effectiveToken = token ?? getStoredToken();
	const res = await fetch(buildUrl(path), {
		method,
		headers: {
			'Content-Type': 'application/json',
			...(effectiveToken ? { Authorization: `Bearer ${effectiveToken}` } : {}),
			...(headers || {}),
		},
		body: body ? JSON.stringify(body) : undefined,
	});

	const text = await res.text();
	let data = null;
	try {
		data = text ? JSON.parse(text) : null;
	} catch {
		data = text;
	}

	if (!res.ok) {
		const message = data && typeof data === 'object' && data.message ? data.message : 'Request failed';
		const error = new Error(message);
		error.status = res.status;
		error.data = data;
		throw error;
	}

	return data;
}

export const apiClient = {
	get: (path, options) => request(path, { ...options, method: 'GET' }),
	post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
	put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
	delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
};
