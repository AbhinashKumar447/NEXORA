import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AppShell from '../../components/layout/AppShell.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import achievementService from '../../services/achievementService.js';

export default function Profile() {
	const navigate = useNavigate();
	const { me, isLoadingMe } = useAuth();
	const [achievements, setAchievements] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');

	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [proofUrl, setProofUrl] = useState('');
	const [isSaving, setIsSaving] = useState(false);
	const [saveError, setSaveError] = useState('');

	useEffect(() => {
		let cancelled = false;
		async function load() {
			if (!me?._id) return;
			setIsLoading(true);
			setError('');
			try {
				const data = await achievementService.listAchievements({ userId: me._id, limit: 20 });
				if (!cancelled) setAchievements(data.items || []);
			} catch (err) {
				if (!cancelled) setError(err?.message || 'Failed to load achievements');
			} finally {
				if (!cancelled) setIsLoading(false);
			}
		}
		load();
		return () => {
			cancelled = true;
		};
	}, [me?._id]);

	async function onAddAchievement(e) {
		e.preventDefault();
		setSaveError('');
		setIsSaving(true);
		try {
			await achievementService.addAchievement({
				title,
				description,
				proofUrl: proofUrl || undefined,
			});
			setTitle('');
			setDescription('');
			setProofUrl('');
			if (me?._id) {
				const data = await achievementService.listAchievements({ userId: me._id, limit: 20 });
				setAchievements(data.items || []);
			}
		} catch (err) {
			setSaveError(err?.message || 'Failed to add achievement');
		} finally {
			setIsSaving(false);
		}
	}

	return (
		<AppShell>
			<header className="mb-5 flex items-start justify-between gap-4">
				<div>
					<h1 className="text-2xl font-semibold text-slate-900">My Profile</h1>
					<p className="mt-1 text-sm text-slate-500">Your account details and achievements.</p>
				</div>
				<Button variant="outline" onClick={() => navigate('/profile/edit')}>
					Edit Profile
				</Button>
			</header>

			{error ? (
				<div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
					{error}
				</div>
			) : null}

			<section className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
				<Card className="rounded-2xl">
					<CardHeader>
						<CardTitle className="text-sm text-slate-700">Profile</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<div className="text-sm text-slate-700">
							<div className="font-medium text-slate-900">{me?.name || (isLoadingMe ? 'Loading…' : '—')}</div>
							<div className="text-slate-500">{me?.email || '—'}</div>
						</div>
						<div className="text-sm text-slate-600">
							<span className="font-medium text-slate-900">College:</span>{' '}
							{me?.collegeId?.name || '—'}
						</div>
						<div className="text-sm text-slate-600">
							<span className="font-medium text-slate-900">Branch:</span> {me?.branch || '—'}
						</div>
						<div className="text-sm text-slate-600">
							<span className="font-medium text-slate-900">Year:</span> {me?.year || '—'}
						</div>
						<div className="text-sm text-slate-600">
							<span className="font-medium text-slate-900">Skills:</span>{' '}
							{Array.isArray(me?.skills) && me.skills.length ? me.skills.join(', ') : '—'}
						</div>
						<div className="text-sm text-slate-600">
							<span className="font-medium text-slate-900">Interests:</span>{' '}
							{Array.isArray(me?.interests) && me.interests.length ? me.interests.join(', ') : '—'}
						</div>
						<div className="text-sm text-slate-600">
							<span className="font-medium text-slate-900">Bio:</span> {me?.bio || '—'}
						</div>
					</CardContent>
				</Card>

				<Card className="rounded-2xl">
					<CardHeader>
						<CardTitle className="text-sm text-slate-700">Add Achievement</CardTitle>
					</CardHeader>
					<CardContent>
						<form onSubmit={onAddAchievement} className="space-y-3">
							<div>
								<label className="text-sm font-medium text-slate-700">Title</label>
								<input
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									required
									className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
									placeholder="e.g. Won Hackathon"
								/>
							</div>
							<div>
								<label className="text-sm font-medium text-slate-700">Description (optional)</label>
								<textarea
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									rows={3}
									className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
									placeholder="Short details"
								/>
							</div>
							<div>
								<label className="text-sm font-medium text-slate-700">Proof URL (optional)</label>
								<input
									value={proofUrl}
									onChange={(e) => setProofUrl(e.target.value)}
									className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
									placeholder="https://..."
								/>
							</div>
							{saveError ? (
								<div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
									{saveError}
								</div>
							) : null}
							<Button type="submit" disabled={isSaving}>
								{isSaving ? 'Saving…' : 'Add Achievement'}
							</Button>
						</form>
					</CardContent>
				</Card>
			</section>

			<section className="mb-5">
				<Card className="rounded-2xl">
					<CardHeader className="flex flex-row items-center justify-between pb-3">
						<CardTitle className="text-sm text-slate-700">My Achievements</CardTitle>
					</CardHeader>
					<CardContent className="pt-0">
						{isLoading ? (
							<div className="text-sm text-slate-500">Loading…</div>
						) : achievements.length ? (
							<ul className="space-y-3">
								{achievements.map((a) => (
									<li key={a._id} className="rounded-xl border border-slate-200/70 bg-white px-3 py-2">
										<div className="text-sm font-medium text-slate-900">{a.title}</div>
										{a.description ? <div className="mt-1 text-xs text-slate-500">{a.description}</div> : null}
									</li>
								))}
							</ul>
						) : (
							<div className="text-sm text-slate-500">No achievements yet.</div>
						)}
					</CardContent>
				</Card>
			</section>
		</AppShell>
	);
}
