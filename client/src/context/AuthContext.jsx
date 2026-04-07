import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import userService from '../services/userService.js';

const TOKEN_KEY = 'nexora_token';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
	const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '');
	const [me, setMe] = useState(null);
	const [isLoadingMe, setIsLoadingMe] = useState(false);

	const loginWithToken = useCallback((newToken) => {
		const value = newToken || '';
		setToken(value);
		if (value) localStorage.setItem(TOKEN_KEY, value);
		else localStorage.removeItem(TOKEN_KEY);
	}, []);

	const logout = useCallback(() => {
		loginWithToken('');
	}, [loginWithToken]);

	const refreshMe = useCallback(async () => {
		if (!token) {
			setMe(null);
			return;
		}
		setIsLoadingMe(true);
		try {
			const data = await userService.getMe();
			setMe(data.user || null);
		} catch (err) {
			if (err?.status === 401) logout();
			else setMe(null);
		} finally {
			setIsLoadingMe(false);
		}
	}, [token, logout]);

	useEffect(() => {
		refreshMe();
	}, [refreshMe]);

	const value = useMemo(
		() => ({ token, isAuthenticated: Boolean(token), loginWithToken, logout, me, isLoadingMe, refreshMe }),
		[token, loginWithToken, logout, me, isLoadingMe, refreshMe]
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error('useAuth must be used within AuthProvider');
	return ctx;
}
