import React, { useEffect, useState } from 'react';

import AppShell from '../../components/layout/AppShell.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx';

import studyHelpService from '../../services/studyHelpService.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function StudyHelpPage() {
	const { me } = useAuth();
	const [items, setItems] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');
	const [message, setMessage] = useState('');

	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [isSaving, setIsSaving] = useState(false);
	const [saveError, setSaveError] = useState('');

	async function load() {
		setIsLoading(true);
		setError('');
		try {
			const collegeId = me?.collegeId?._id;
			const data = await studyHelpService.listRequests({ collegeId, limit: 20 });
			setItems(data.items || []);
		} catch (err) {
			setError(err?.message || 'Failed to load requests');
		} finally {
			setIsLoading(false);
		}
	}

	useEffect(() => {
		load();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [me?.collegeId?._id]);

	async function onCreate(e) {
		e.preventDefault();
		setMessage('');
		setSaveError('');
		setIsSaving(true);
		try {
			await studyHelpService.createRequest({ title, description });
			setTitle('');
			setDescription('');
			setMessage('Request posted');
			await load();
		} catch (err) {
			setSaveError(err?.message || 'Failed to create request');
		} finally {
			setIsSaving(false);
		}
	}

	async function onRespond(requestId, responseMessage) {
		setMessage('');
		setError('');
		try {
			await studyHelpService.respondToRequest(requestId, { message: responseMessage });
			setMessage('Response sent');
			await load();
		} catch (err) {
			setError(err?.message || 'Failed to respond');
		}
	}

	return (
		<AppShell>
			<header className="mb-5">
				<h1 className="text-2xl font-semibold text-slate-900">Study Help</h1>
				<p className="mt-1 text-sm text-slate-500">Post a request and help others.</p>
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

			<section className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
				<Card className="rounded-2xl">
					<CardHeader>
						<CardTitle className="text-sm text-slate-700">Create Request</CardTitle>
					</CardHeader>
					<CardContent>
						<form onSubmit={onCreate} className="space-y-3">
							<div>
								<label className="text-sm font-medium text-slate-700">Title</label>
								<input
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									required
									className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
									placeholder="e.g. Need help with DBMS"
								/>
							</div>
							<div>
								<label className="text-sm font-medium text-slate-700">Description (optional)</label>
								<textarea
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									rows={4}
									className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
									placeholder="Add details"
								/>
							</div>
							{saveError ? (
								<div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
									{saveError}
								</div>
							) : null}
							<Button type="submit" disabled={isSaving}>
								{isSaving ? 'Posting…' : 'Post'}
							</Button>
						</form>
					</CardContent>
				</Card>

				<Card className="rounded-2xl">
					<CardHeader>
						<CardTitle className="text-sm text-slate-700">Requests</CardTitle>
					</CardHeader>
					<CardContent className="pt-0">
						{isLoading ? (
							<div className="text-sm text-slate-500">Loading…</div>
						) : items.length ? (
							<ul className="space-y-3">
								{items.map((r) => (
									<li key={r._id} className="rounded-2xl border border-slate-200/70 bg-white p-4">
										<div className="text-sm font-semibold text-slate-900">{r.title}</div>
										<div className="mt-1 text-xs text-slate-500">by {r?.ownerId?.name || 'Unknown'}</div>
										{r.description ? <p className="mt-2 text-sm text-slate-600">{r.description}</p> : null}

										<RespondBox requestId={r._id} onRespond={onRespond} />
									</li>
								))}
							</ul>
						) : (
							<div className="text-sm text-slate-500">No requests yet.</div>
						)}
					</CardContent>
				</Card>
			</section>
		</AppShell>
	);
}

function RespondBox({ requestId, onRespond }) {
	const [message, setMessage] = useState('');
	const [isSending, setIsSending] = useState(false);

	async function submit(e) {
		e.preventDefault();
		if (!message.trim()) return;
		setIsSending(true);
		try {
			await onRespond(requestId, message.trim());
			setMessage('');
		} finally {
			setIsSending(false);
		}
	}

	return (
		<form onSubmit={submit} className="mt-3 flex gap-2">
			<input
				value={message}
				onChange={(e) => setMessage(e.target.value)}
				className="h-10 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
				placeholder="Write a response…"
			/>
			<Button type="submit" variant="outline" disabled={isSending}>
				{isSending ? 'Sending…' : 'Respond'}
			</Button>
		</form>
	);
}
