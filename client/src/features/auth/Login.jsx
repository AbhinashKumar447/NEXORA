import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '../../components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import authService from './authService.js';

export default function Login() {
	const navigate = useNavigate();
	const { loginWithToken } = useAuth();

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');

	async function onSubmit(e) {
		e.preventDefault();
		setError('');
		setIsLoading(true);
		try {
			const result = await authService.login({ email, password });
			loginWithToken(result.token);
			navigate('/', { replace: true });
		} catch (err) {
			setError(err?.message || 'Login failed');
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className="min-h-screen bg-slate-50">
			<div className="mx-auto flex min-h-screen max-w-md items-center px-4 py-10">
				<Card className="w-full rounded-2xl">
					<CardHeader>
						<CardTitle className="text-xl">Login</CardTitle>
						<p className="mt-1 text-sm text-slate-500">Welcome back! Sign in to continue.</p>
					</CardHeader>
					<CardContent>
						<form onSubmit={onSubmit} className="space-y-4">
							<div>
								<label className="text-sm font-medium text-slate-700">Email</label>
								<input
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
									className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
									placeholder="you@college.edu"
								/>
							</div>
							<div>
								<label className="text-sm font-medium text-slate-700">Password</label>
								<input
									type="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
									placeholder="••••••••"
								/>
							</div>

							{error ? (
								<div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
									{error}
								</div>
							) : null}

							<Button type="submit" className="w-full" disabled={isLoading}>
								{isLoading ? 'Signing in…' : 'Sign In'}
							</Button>

							<p className="text-center text-sm text-slate-600">
								Don’t have an account?{' '}
								<Link className="font-medium text-blue-700 hover:underline" to="/signup">
									Create one
								</Link>
							</p>
						</form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
