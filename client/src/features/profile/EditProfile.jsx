import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AppShell from '../../components/layout/AppShell.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import userService from '../../services/userService.js';

function splitCsv(value) {
	return String(value || '')
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean);
}

export default function EditProfile() {
	const navigate = useNavigate();
	const { me, refreshMe } = useAuth();

	const [name, setName] = useState('');
	const [branch, setBranch] = useState('');
	const [year, setYear] = useState('');
	const [skills, setSkills] = useState('');
	const [interests, setInterests] = useState('');
	const [bio, setBio] = useState('');
	const [avatarUrl, setAvatarUrl] = useState('');
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState('');

	useEffect(() => {
		setName(me?.name || '');
		setBranch(me?.branch || '');
		setYear(me?.year ? String(me.year) : '');
		setSkills(Array.isArray(me?.skills) ? me.skills.join(', ') : '');
		setInterests(Array.isArray(me?.interests) ? me.interests.join(', ') : '');
		setBio(me?.bio || '');
		setAvatarUrl(me?.avatarUrl || '');
	}, [me?._id]);

	async function onSubmit(e) {
		e.preventDefault();
		setError('');
		setIsSaving(true);
		try {
			await userService.updateMe({
				name,
				branch,
				year: year ? Number(year) : undefined,
				skills: splitCsv(skills),
				interests: splitCsv(interests),
				bio,
				avatarUrl,
			});
			await refreshMe();
			navigate('/profile', { replace: true });
		} catch (err) {
			setError(err?.message || 'Failed to update profile');
		} finally {
			setIsSaving(false);
		}
	}

	return (
		<AppShell>
			<header className="mb-5 flex items-start justify-between gap-4">
				<div>
					<h1 className="text-2xl font-semibold text-slate-900">Edit Profile</h1>
					<p className="mt-1 text-sm text-slate-500">Update your details.</p>
				</div>
				<Button variant="outline" onClick={() => navigate('/profile')}>
					Back
				</Button>
			</header>

			<Card className="rounded-2xl">
				<CardHeader>
					<CardTitle className="text-sm text-slate-700">Profile</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div className="md:col-span-2">
							<label className="text-sm font-medium text-slate-700">Name</label>
							<input
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
								className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
							/>
						</div>
						<div>
							<label className="text-sm font-medium text-slate-700">Branch</label>
							<input
								value={branch}
								onChange={(e) => setBranch(e.target.value)}
								className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
							/>
						</div>
						<div>
							<label className="text-sm font-medium text-slate-700">Year</label>
							<input
								type="number"
								value={year}
								onChange={(e) => setYear(e.target.value)}
								min={1}
								max={10}
								className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
							/>
						</div>
						<div className="md:col-span-2">
							<label className="text-sm font-medium text-slate-700">Skills (comma separated)</label>
							<input
								value={skills}
								onChange={(e) => setSkills(e.target.value)}
								className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
								placeholder="DSA, React, MongoDB"
							/>
						</div>
						<div className="md:col-span-2">
							<label className="text-sm font-medium text-slate-700">Interests (comma separated)</label>
							<input
								value={interests}
								onChange={(e) => setInterests(e.target.value)}
								className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
							/>
						</div>
						<div className="md:col-span-2">
							<label className="text-sm font-medium text-slate-700">Bio</label>
							<textarea
								value={bio}
								onChange={(e) => setBio(e.target.value)}
								rows={4}
								className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
							/>
						</div>
						<div className="md:col-span-2">
							<label className="text-sm font-medium text-slate-700">Avatar URL</label>
							<input
								value={avatarUrl}
								onChange={(e) => setAvatarUrl(e.target.value)}
								className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
								placeholder="https://..."
							/>
						</div>

						{error ? (
							<div className="md:col-span-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
								{error}
							</div>
						) : null}

						<div className="md:col-span-2 flex items-center justify-end gap-2">
							<Button type="button" variant="outline" onClick={() => navigate('/profile')}>
								Cancel
							</Button>
							<Button type="submit" disabled={isSaving}>
								{isSaving ? 'Saving…' : 'Save Changes'}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</AppShell>
	);
}
