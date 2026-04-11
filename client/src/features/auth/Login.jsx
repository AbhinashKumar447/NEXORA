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
		<div className="min-h-screen bg-slate-950">
			<div className="mx-auto flex min-h-screen max-w-md items-center px-4 py-10">
				<Card className="w-full border-slate-800 bg-slate-900 shadow-none hover:shadow-none">
					<CardHeader className="pb-4">
						<div className="flex rounded-xl bg-slate-800/80 p-1">
							<Link
								to="/login"
								className="flex-1 rounded-lg bg-slate-950 px-3 py-2 text-center text-sm font-medium text-slate-100"
							>
								Sign In
							</Link>
							<Link
								to="/signup"
								className="flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium text-slate-300 hover:text-slate-100"
							>
								Sign Up
							</Link>
						</div>
						<CardTitle className="mt-4 text-base font-semibold text-slate-100">Welcome</CardTitle>
						<p className="mt-1 text-sm text-slate-400">Choose a sign-in method.</p>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							<Button
								type="button"
								disabled
								className="w-full border border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-800"
							>
								Continue with Google
							</Button>
							<Button
								type="button"
								disabled
								className="w-full border border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-800"
							>
								Continue with GitHub
							</Button>

							<div className="py-1 text-center text-xs font-medium text-slate-500">OR CONTINUE WITH</div>

							<form onSubmit={onSubmit} className="space-y-3">
								<div>
									<label className="text-sm font-medium text-slate-200">Email</label>
									<input
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										required
										className="mt-1 h-10 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500/40"
										placeholder="name@example.com"
									/>
								</div>
								<div>
									<label className="text-sm font-medium text-slate-200">Password</label>
									<input
										type="password"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										required
										className="mt-1 h-10 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500/40"
										placeholder="••••••••"
									/>
								</div>

								{error ? (
									<div className="rounded-xl border border-rose-900/50 bg-rose-950/30 px-3 py-2 text-sm text-rose-200">
										{error}
									</div>
								) : null}

								<Button
									type="submit"
									disabled={isLoading}
									className="w-full bg-emerald-500 text-slate-950 hover:bg-emerald-400"
								>
									{isLoading ? 'Signing in…' : 'Continue with Email'}
								</Button>
							</form>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
