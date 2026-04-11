import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '../../components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import authService from './authService.js';

export default function Signup() {
	const navigate = useNavigate();
	const { loginWithToken } = useAuth();

	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [otp, setOtp] = useState('');
	const [otpSent, setOtpSent] = useState(false);
	const [otpVerified, setOtpVerified] = useState(false);
	const [emailVerificationToken, setEmailVerificationToken] = useState('');
	const [isOtpSending, setIsOtpSending] = useState(false);
	const [isOtpVerifying, setIsOtpVerifying] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');
	const [info, setInfo] = useState('');

	function resetOtpState() {
		setOtp('');
		setOtpSent(false);
		setOtpVerified(false);
		setEmailVerificationToken('');
	}

	async function onSubmit(e) {
		e.preventDefault();
		setError('');
		setInfo('');
		if (!otpVerified || !emailVerificationToken) {
			setError('Please verify OTP before creating your account');
			return;
		}
		setIsLoading(true);
		try {
			const result = await authService.register({
				name,
				email,
				password,
				emailVerificationToken,
			});
			loginWithToken(result.token);
			navigate('/', { replace: true });
		} catch (err) {
			setError(err?.message || 'Signup failed');
		} finally {
			setIsLoading(false);
		}
	}

	async function onSendOtp() {
		setError('');
		setInfo('');
		setIsOtpSending(true);
		try {
			await authService.requestOtp({ email });
			setOtpSent(true);
			setOtpVerified(false);
			setEmailVerificationToken('');
			setInfo('OTP sent to your email');
		} catch (err) {
			setError(err?.message || 'Failed to send OTP');
		} finally {
			setIsOtpSending(false);
		}
	}

	async function onVerifyOtp() {
		setError('');
		setInfo('');
		setIsOtpVerifying(true);
		try {
			const result = await authService.verifyOtp({ email, otp });
			setOtpVerified(true);
			setEmailVerificationToken(result.emailVerificationToken || '');
			setInfo('Email verified');
		} catch (err) {
			setOtpVerified(false);
			setEmailVerificationToken('');
			setError(err?.message || 'OTP verification failed');
		} finally {
			setIsOtpVerifying(false);
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
								className="flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium text-slate-300 hover:text-slate-100"
							>
								Sign In
							</Link>
							<Link
								to="/signup"
								className="flex-1 rounded-lg bg-slate-950 px-3 py-2 text-center text-sm font-medium text-slate-100"
							>
								Sign Up
							</Link>
						</div>
						<CardTitle className="mt-4 text-base font-semibold text-slate-100">Create account</CardTitle>
						<p className="mt-1 text-sm text-slate-400">Verify email to continue.</p>
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
									<label className="text-sm font-medium text-slate-200">College Email</label>
									<input
										type="email"
										value={email}
										onChange={(e) => {
											setEmail(e.target.value);
											resetOtpState();
											setError('');
											setInfo('');
									}}
										required
										className="mt-1 h-10 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500/40"
										placeholder="you@college.edu"
									/>
									<div className="mt-2">
										<Button
											type="button"
											disabled={!email || isOtpSending || isLoading}
											onClick={onSendOtp}
											className="w-full border border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700"
										>
											{isOtpSending ? 'Sending OTP…' : otpSent ? 'Resend OTP' : 'Send OTP'}
										</Button>
									</div>
								</div>

								<div>
									<label className="text-sm font-medium text-slate-200">OTP</label>
									<input
										type="text"
										value={otp}
										onChange={(e) => {
											setOtp(e.target.value);
											setOtpVerified(false);
											setEmailVerificationToken('');
											setError('');
											setInfo('');
									}}
										required
										disabled={!otpSent || isLoading}
										className="mt-1 h-10 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500/40 disabled:opacity-60"
										placeholder="Enter the OTP"
										inputMode="numeric"
									/>
									<div className="mt-2">
										<Button
											type="button"
											disabled={!otpSent || !otp || isOtpVerifying || isLoading}
											onClick={onVerifyOtp}
											className="w-full bg-emerald-500 text-slate-950 hover:bg-emerald-400"
										>
											{isOtpVerifying ? 'Verifying…' : otpVerified ? 'Verified' : 'Verify OTP'}
										</Button>
									</div>
								</div>

								{otpVerified ? (
									<>
										<div>
											<label className="text-sm font-medium text-slate-200">Name</label>
											<input
												type="text"
												value={name}
												onChange={(e) => setName(e.target.value)}
												required
												className="mt-1 h-10 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500/40"
												placeholder="Your name"
											/>
										</div>
										<div>
											<label className="text-sm font-medium text-slate-200">Password</label>
											<input
												type="password"
												value={password}
												onChange={(e) => setPassword(e.target.value)}
												required
												minLength={6}
												className="mt-1 h-10 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500/40"
												placeholder="At least 6 characters"
											/>
										</div>
									</>
								) : null}

								{info ? (
									<div className="rounded-xl border border-emerald-900/50 bg-emerald-950/20 px-3 py-2 text-sm text-emerald-200">
										{info}
									</div>
								) : null}

								{error ? (
									<div className="rounded-xl border border-rose-900/50 bg-rose-950/30 px-3 py-2 text-sm text-rose-200">
										{error}
									</div>
								) : null}

								<Button
									type="submit"
									disabled={isLoading || !otpVerified}
									className="w-full bg-emerald-500 text-slate-950 hover:bg-emerald-400"
								>
									{isLoading ? 'Creating…' : otpVerified ? 'Create Account' : 'Verify OTP to continue'}
								</Button>
							</form>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
