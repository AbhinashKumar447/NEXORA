import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import AppShell from '../../components/layout/AppShell.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import userService from '../../services/userService.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function SearchPage() {
	const { me } = useAuth();
	const [searchParams, setSearchParams] = useSearchParams();

	const [q, setQ] = useState(searchParams.get('q') || '');
	const [skills, setSkills] = useState(searchParams.get('skills') || searchParams.get('skill') || '');
	const [branch, setBranch] = useState(searchParams.get('branch') || '');
	const [college, setCollege] = useState(searchParams.get('college') || '');
	const [page, setPage] = useState(Number(searchParams.get('page') || 1));
	const limit = 10;
	const [items, setItems] = useState([]);
	const [total, setTotal] = useState(0);
	const [pages, setPages] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');

	useEffect(() => {
		setQ(searchParams.get('q') || '');
		setSkills(searchParams.get('skills') || searchParams.get('skill') || '');
		setBranch(searchParams.get('branch') || '');
		setCollege(searchParams.get('college') || '');
		setPage(Number(searchParams.get('page') || 1));
	}, [searchParams]);

	const debouncedParams = useMemo(
		() => ({
			q: q.trim(),
			skills: skills.trim(),
			branch: branch.trim(),
			college: college.trim(),
			page,
		}),
		[q, skills, branch, college, page]
	);

	function highlight(text, needle) {
		const value = String(text || '');
		const query = String(needle || '').trim();
		if (!query) return value;
		const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		const re = new RegExp(escaped, 'ig');
		const parts = value.split(re);
		const matches = value.match(re);
		if (!matches) return value;
		return (
			<>
				{parts.map((part, idx) => (
					<React.Fragment key={`${part}-${idx}`}>
						{part}
						{matches[idx] ? (
							<span className="rounded bg-slate-200 px-0.5 text-slate-900">{matches[idx]}</span>
						) : null}
					</React.Fragment>
				))}
			</>
		);
	}

	async function runSearch(nextParams) {
		setError('');
		setIsLoading(true);
		try {
			const collegeId = me?.collegeId?._id;
			const data = await userService.searchUsers({
				q: nextParams.q || undefined,
				skills: nextParams.skills || undefined,
				branch: nextParams.branch || undefined,
				college: nextParams.college || undefined,
				collegeId,
				page: nextParams.page,
				limit,
			});
			setItems(data.items || []);
			setTotal(Number(data.total || 0));
			setPages(Number(data.pages || 0));
			setSearchParams((prev) => {
				const merged = new URLSearchParams(prev);
				for (const key of ['q', 'skills', 'branch', 'college', 'page']) merged.delete(key);
				if (nextParams.q) merged.set('q', nextParams.q);
				if (nextParams.skills) merged.set('skills', nextParams.skills);
				if (nextParams.branch) merged.set('branch', nextParams.branch);
				if (nextParams.college) merged.set('college', nextParams.college);
				merged.set('page', String(nextParams.page || 1));
				return merged;
			});
		} catch (err) {
			setError(err?.message || 'Failed to search users');
		} finally {
			setIsLoading(false);
		}
	}

	useEffect(() => {
		setPage(1);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [q, skills, branch, college]);

	useEffect(() => {
		if (!me?.collegeId?._id) return;
		const timer = setTimeout(() => {
			runSearch(debouncedParams);
		}, 300);
		return () => clearTimeout(timer);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [me?.collegeId?._id, debouncedParams]);

	return (
		<AppShell>
			<header className="mb-5">
				<h1 className="text-2xl font-semibold text-slate-900">Find Students</h1>
				<p className="mt-1 text-sm text-slate-500">Search students by name and filters.</p>
			</header>

			<Card className="mb-5 rounded-2xl">
				<CardHeader>
					<CardTitle className="text-sm text-slate-700">Search</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 gap-3 md:grid-cols-4">
						<input
							value={q}
							onChange={(e) => setQ(e.target.value)}
							className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
							placeholder="Name / keyword (e.g., abhi)"
						/>
						<input
							value={skills}
							onChange={(e) => setSkills(e.target.value)}
							className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
							placeholder="Skills (e.g., DSA, React)"
						/>
						<input
							value={branch}
							onChange={(e) => setBranch(e.target.value)}
							className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
							placeholder="Branch (e.g., CSE)"
						/>
						<input
							value={college}
							onChange={(e) => setCollege(e.target.value)}
							className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
							placeholder="College (e.g., KLU)"
						/>
					</div>
					<div className="mt-3 text-xs text-slate-500">
						{isLoading ? 'Loading…' : total ? `${total} result${total === 1 ? '' : 's'}` : ' '}
					</div>
					{error ? (
						<div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
							{error}
						</div>
					) : null}
				</CardContent>
			</Card>

			<Card className="rounded-2xl">
				<CardHeader className="flex flex-row items-center justify-between pb-3">
					<CardTitle className="text-sm text-slate-700">Results</CardTitle>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							disabled={isLoading || page <= 1}
							onClick={() => setPage((p) => Math.max(1, p - 1))}
						>
							Prev
						</Button>
						<div className="text-xs text-slate-500">Page {page} / {Math.max(pages, 1)}</div>
						<Button
							variant="outline"
							disabled={isLoading || (pages ? page >= pages : items.length < limit)}
							onClick={() => setPage((p) => p + 1)}
						>
							Next
						</Button>
					</div>
				</CardHeader>
				<CardContent className="pt-0">
					{isLoading && !items.length ? (
						<div className="text-sm text-slate-500">Loading…</div>
					) : items.length ? (
						<ul className="space-y-3">
							{items.map((u) => (
								<li key={u._id} className="rounded-2xl border border-slate-200/70 bg-white p-4">
									<div className="flex items-start justify-between gap-3">
										<div className="flex items-start gap-3">
											{u.avatarUrl ? (
												<img
													src={u.avatarUrl}
													alt={u.name}
													className="h-10 w-10 rounded-full border border-slate-200 object-cover"
												/>
											) : (
												<div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700">
													{String(u.name || '?').slice(0, 1).toUpperCase()}
												</div>
											)}
										<div className="min-w-0">
												<div className="text-sm font-semibold text-slate-900">{highlight(u.name, q)}</div>
												<div className="mt-2 text-xs text-slate-500">{highlight(u?.collegeId?.name || '', college || q)}</div>
												{u.branch || u.year ? (
													<div className="mt-1 text-xs text-slate-500">
														{u.branch ? highlight(u.branch, branch || q) : null}
														{u.branch && u.year ? ' • ' : null}
														{u.year ? `Year ${u.year}` : null}
													</div>
												) : null}
												{u.bio ? <div className="mt-2 text-sm text-slate-600">{u.bio}</div> : null}
											{Array.isArray(u.skills) && u.skills.length ? (
												<div className="mt-3 flex flex-wrap gap-2">
													{u.skills.slice(0, 12).map((s) => (
														<Badge key={s} className="bg-slate-100 text-slate-700">
																{highlight(s, skills || q)}
														</Badge>
													))}
												</div>
											) : (
												<div className="mt-2 text-sm text-slate-500">No skills listed.</div>
											)}
										</div>
										</div>
									</div>
								</li>
							))}
						</ul>
					) : (
						<div className="text-sm text-slate-500">No results found.</div>
					)}
				</CardContent>
			</Card>
		</AppShell>
	);
}
