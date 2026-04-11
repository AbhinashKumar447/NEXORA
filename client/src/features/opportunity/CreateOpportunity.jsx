import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AppShell from '../../components/layout/AppShell.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import opportunityService from '../../services/opportunityService.js';

function splitCsv(value) {
	return String(value || '')
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean);
}

export default function CreateOpportunity() {
	const navigate = useNavigate();
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [type, setType] = useState('team');
	const [skills, setSkills] = useState('');
	const [startDate, setStartDate] = useState('');
	const [endDate, setEndDate] = useState('');
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState('');

	const todayInput = new Date().toISOString().slice(0, 10);
	const maxInput = (() => {
		const d = new Date();
		d.setMonth(d.getMonth() + 2);
		return d.toISOString().slice(0, 10);
	})();

	async function onSubmit(e) {
		e.preventDefault();
		setError('');
		setIsSaving(true);
		try {
			if ((startDate && !endDate) || (!startDate && endDate)) {
				throw new Error('Please select both start and end dates');
			}
			await opportunityService.createOpportunity({
				title,
				description,
				type,
				skills: splitCsv(skills),
				startDate: startDate || undefined,
				endDate: endDate || undefined,
			});
			navigate('/opportunities', { replace: true });
		} catch (err) {
			setError(err?.message || 'Failed to create opportunity');
		} finally {
			setIsSaving(false);
		}
	}

	return (
		<AppShell>
			<header className="mb-5 flex items-start justify-between gap-4">
				<div>
					<h1 className="text-2xl font-semibold text-slate-900">Create Opportunity</h1>
					<p className="mt-1 text-sm text-slate-500">Post an opportunity for students in your college.</p>
				</div>
				<Button variant="outline" onClick={() => navigate('/opportunities')}>
					Back
				</Button>
			</header>

			<Card className="rounded-2xl">
				<CardHeader>
					<CardTitle className="text-sm text-slate-700">Details</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={onSubmit} className="space-y-4">
						<div>
							<label className="text-sm font-medium text-slate-700">Title</label>
							<input
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								required
								className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
								placeholder="e.g. Looking for hackathon teammates"
							/>
						</div>
						<div>
							<label className="text-sm font-medium text-slate-700">Type</label>
							<select
								value={type}
								onChange={(e) => setType(e.target.value)}
								className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
							>
								<option value="team">Team</option>
								<option value="mentorship">Mentorship</option>
								<option value="internship">Internship</option>
								<option value="study_help">Study Help</option>
							</select>
						</div>
						<div>
							<label className="text-sm font-medium text-slate-700">Skills (comma separated)</label>
							<input
								value={skills}
								onChange={(e) => setSkills(e.target.value)}
								className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
								placeholder="React, Node, DSA"
							/>
						</div>
						<div>
							<label className="text-sm font-medium text-slate-700">Active dates</label>
							<div className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-2">
								<div>
									<label className="text-xs font-medium text-slate-600">Start date</label>
									<input
										type="date"
										value={startDate}
										onChange={(e) => setStartDate(e.target.value)}
										min={todayInput}
										max={maxInput}
										className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
									/>
								</div>
								<div>
									<label className="text-xs font-medium text-slate-600">End date</label>
									<input
										type="date"
										value={endDate}
										onChange={(e) => setEndDate(e.target.value)}
										min={todayInput}
										max={maxInput}
										className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
									/>
								</div>
							</div>
							<p className="mt-1 text-xs text-slate-500">Optional. Opportunity is visible from start date and auto-deletes after end date.</p>
						</div>
						<div>
							<label className="text-sm font-medium text-slate-700">Description</label>
							<textarea
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								rows={5}
								className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
								placeholder="Add details about the opportunity"
							/>
						</div>
						{error ? (
							<div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
								{error}
							</div>
						) : null}
						<div className="flex items-center justify-end gap-2">
							<Button type="button" variant="outline" onClick={() => navigate('/opportunities')}>
								Cancel
							</Button>
							<Button type="submit" disabled={isSaving}>
								{isSaving ? 'Creating…' : 'Create'}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</AppShell>
	);
}
