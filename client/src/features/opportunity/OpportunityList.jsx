import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AppShell from '../../components/layout/AppShell.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import opportunityService from '../../services/opportunityService.js';
import { useAuth } from '../../context/AuthContext.jsx';

function typeLabel(type) {
	if (!type) return 'Opportunity';
	return String(type)
		.split('_')
		.map((s) => s.charAt(0).toUpperCase() + s.slice(1))
		.join(' ');
}

export default function OpportunityList() {
	const navigate = useNavigate();
	const { me } = useAuth();

	const [items, setItems] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');
	const [message, setMessage] = useState('');

	const collegeId = me?.collegeId?._id;

	useEffect(() => {
		let cancelled = false;
		async function load() {
			setIsLoading(true);
			setError('');
			try {
				const data = await opportunityService.listOpportunities({ collegeId, limit: 20 });
				if (!cancelled) setItems(data.items || []);
			} catch (err) {
				if (!cancelled) setError(err?.message || 'Failed to load opportunities');
			} finally {
				if (!cancelled) setIsLoading(false);
			}
		}
		load();
		return () => {
			cancelled = true;
		};
	}, [collegeId]);

	const mapped = useMemo(
		() =>
			(items || []).map((op) => ({
				...op,
				typeLabel: typeLabel(op.type),
				ownerName: op?.ownerId?.name || 'Unknown',
				appliedCount: Array.isArray(op.applicants) ? op.applicants.length : 0,
				isOwner: Boolean(me?._id) && String(op?.ownerId?._id || op?.ownerId || '') === String(me._id),
			})),
		[items, me?._id]
	);

	async function onApply(id) {
		setMessage('');
		setError('');
		try {
			await opportunityService.applyToOpportunity(id);
			setMessage('Applied successfully');
		} catch (err) {
			setError(err?.message || 'Failed to apply');
		}
	}

	return (
		<AppShell>
			<header className="mb-5 flex items-start justify-between gap-4">
				<div>
					<h1 className="text-2xl font-semibold text-slate-900">Opportunities</h1>
					<p className="mt-1 text-sm text-slate-500">Explore and apply to opportunities in your college.</p>
				</div>
				<Button onClick={() => navigate('/opportunities/new')}>Create</Button>
			</header>

			{message ? (
				<div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
					{message}
				</div>
			) : null}
			{error ? (
				<div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
					{error}
				</div>
			) : null}

			<Card className="rounded-2xl">
				<CardHeader className="flex flex-row items-center justify-between pb-3">
					<CardTitle className="text-sm text-slate-700">Latest</CardTitle>
				</CardHeader>
				<CardContent className="pt-0">
					{isLoading ? (
						<div className="text-sm text-slate-500">Loading…</div>
					) : mapped.length ? (
						<ul className="space-y-3">
							{mapped.map((op) => (
								<li key={op._id} className="rounded-2xl border border-slate-200/70 bg-white p-4">
									<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
										<div className="min-w-0">
											<div className="text-sm font-semibold text-slate-900">{op.title}</div>
											<div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
												<Badge className="bg-blue-50 text-blue-700">{op.typeLabel}</Badge>
												<span>•</span>
												<span>By {op.ownerName}</span>
												<span>•</span>
												<span>{op.appliedCount} applied</span>
											</div>
											{op.description ? (
												<p className="mt-2 text-sm text-slate-600">{op.description}</p>
											) : null}
											{Array.isArray(op.skills) && op.skills.length ? (
												<div className="mt-3 flex flex-wrap gap-2">
													{op.skills.slice(0, 8).map((s) => (
														<Badge key={s} className="bg-slate-100 text-slate-700">
															{s}
														</Badge>
													))}
												</div>
											) : null}
										</div>
										<div className="flex shrink-0 items-center gap-2">
											<Button
												variant="outline"
												disabled={op.isOwner}
												onClick={() => onApply(op._id)}
											>
												{op.isOwner ? 'Your post' : 'Apply'}
											</Button>
										</div>
									</div>
								</li>
							))}
						</ul>
					) : (
						<div className="text-sm text-slate-500">No opportunities yet.</div>
					)}
				</CardContent>
			</Card>
		</AppShell>
	);
}
