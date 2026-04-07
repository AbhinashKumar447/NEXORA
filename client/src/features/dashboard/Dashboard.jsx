import React, { useEffect, useMemo, useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import AppShell from '../../components/layout/AppShell.jsx';
import StatCard from '../../components/dashboard/StatCard.jsx';
import OpportunityCard from '../../components/dashboard/OpportunityCard.jsx';
import RightPanel from '../../components/dashboard/RightPanel.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx';

import { useAuth } from '../../context/AuthContext.jsx';
import userService from '../../services/userService.js';
import opportunityService from '../../services/opportunityService.js';
import studyHelpService from '../../services/studyHelpService.js';
import achievementService from '../../services/achievementService.js';

function typeLabel(type) {
	if (!type) return 'Opportunity';
	return String(type)
		.split('_')
		.map((s) => s.charAt(0).toUpperCase() + s.slice(1))
		.join(' ');
}

export default function Dashboard() {
	const { me, isLoadingMe } = useAuth();
	const navigate = useNavigate();
	const [opportunities, setOpportunities] = useState([]);
	const [studyHelpRequests, setStudyHelpRequests] = useState([]);
	const [topStudents, setTopStudents] = useState([]);
	const [stats, setStats] = useState([]);
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const skills = useMemo(() => (Array.isArray(me?.skills) ? me.skills : []), [me]);

	useEffect(() => {
		let cancelled = false;
		async function load() {
			if (!me?._id) return;
			setIsLoading(true);
			setError('');
			try {
				const collegeId = me?.collegeId?._id;
				const [usersRes, oppsRes, helpsRes, myAchRes, studentsRes] = await Promise.all([
					collegeId ? userService.listUsers({ collegeId, limit: 1 }) : Promise.resolve({ total: 0 }),
					collegeId ? opportunityService.listOpportunities({ collegeId, limit: 3 }) : opportunityService.listOpportunities({ limit: 3 }),
					collegeId ? studyHelpService.listRequests({ collegeId, limit: 3 }) : studyHelpService.listRequests({ limit: 3 }),
					achievementService.listAchievements({ userId: me._id, limit: 1 }),
					collegeId ? userService.listUsers({ collegeId, limit: 3 }) : userService.listUsers({ limit: 3 }),
				]);

				if (cancelled) return;
				setOpportunities(oppsRes.items || []);
				setStudyHelpRequests(helpsRes.items || []);
				setTopStudents(studentsRes.items || []);
				setStats([
					{ label: 'Students', value: usersRes.total ?? 0 },
					{ label: 'Opportunities', value: oppsRes.total ?? 0 },
					{ label: 'My Achievements', value: myAchRes.total ?? 0 },
				]);
			} catch (err) {
				if (!cancelled) setError(err?.message || 'Failed to load dashboard');
			} finally {
				if (!cancelled) setIsLoading(false);
			}
		}
		load();
		return () => {
			cancelled = true;
		};
	}, [me?._id, me?.collegeId?._id]);

	const mappedOpportunities = useMemo(
		() =>
			(opportunities || []).map((op) => ({
				id: op._id,
				title: op.title,
				type: typeLabel(op.type),
				duration: op.status === 'open' ? 'Open' : 'Closed',
				by: op?.ownerId?.name || 'Unknown',
				metric: { icon: 'applied', value: Array.isArray(op.applicants) ? op.applicants.length : 0, label: 'Applied' },
				cta: { label: 'Apply', variant: 'default', opportunityId: op._id },
			})),
		[opportunities]
	);

	return (
		<AppShell
			rightPanel={<RightPanel studyHelpRequests={studyHelpRequests} topStudents={topStudents} />}
		>
			<header className="mb-5 flex items-start justify-between gap-4">
				<div>
					<h1 className="text-2xl font-semibold text-slate-900">
						Welcome Back, {me?.name || (isLoadingMe ? 'Loading…' : 'Student')}!
					</h1>
					<p className="mt-1 text-sm text-slate-500">Here’s what’s happening today.</p>
				</div>
				<div className="hidden sm:flex items-center gap-2">
					<Button variant="outline" onClick={() => navigate('/profile')}>View Profile</Button>
					<Button onClick={() => navigate('/opportunities')}>Explore</Button>
				</div>
			</header>

			{error ? (
				<div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
					{error}
				</div>
			) : null}

			{isLoading ? (
				<div className="mb-5 text-sm text-slate-500">Loading dashboard…</div>
			) : null}

			<section className="mb-5">
				<Card className="rounded-2xl">
					<CardHeader className="flex flex-row items-center justify-between pb-3">
						<CardTitle className="text-sm text-slate-700">Quick Stats</CardTitle>
						<button
							type="button"
							className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
						>
							<MoreHorizontal className="h-4 w-4" />
						</button>
					</CardHeader>
					<CardContent className="grid grid-cols-1 gap-3 pt-0 sm:grid-cols-3">
						{stats.map((stat) => (
							<StatCard key={stat.label} label={stat.label} value={stat.value} />
						))}
					</CardContent>
				</Card>
			</section>

			<section className="mb-5">
				<Card className="rounded-2xl">
					<CardHeader className="flex flex-row items-center justify-between pb-3">
						<CardTitle className="text-sm text-slate-700">Explore Opportunities</CardTitle>
						<button
							type="button"
							className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
						>
							<MoreHorizontal className="h-4 w-4" />
						</button>
					</CardHeader>
					<CardContent className="grid grid-cols-1 gap-4 pt-0 lg:grid-cols-3">
						{mappedOpportunities.length ? (
							mappedOpportunities.map((op) => <OpportunityCard key={op.id} opportunity={op} />)
						) : (
							<div className="text-sm text-slate-500">No opportunities yet.</div>
						)}
					</CardContent>
				</Card>
			</section>

			<section className="mb-5">
				<Card className="rounded-2xl">
					<CardHeader className="flex flex-row items-center justify-between pb-3">
						<CardTitle className="text-sm text-slate-700">Find Students by Skills</CardTitle>
						<button
							type="button"
							className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
						>
							<MoreHorizontal className="h-4 w-4" />
						</button>
					</CardHeader>
					<CardContent className="flex flex-wrap gap-2 pt-0">
						{skills.length ? (
							skills.slice(0, 10).map((skill) => (
								<Button
									key={skill}
									variant="secondary"
									size="sm"
									className="rounded-xl"
									onClick={() => navigate(`/find?skills=${encodeURIComponent(skill)}`)}
								>
									{skill}
								</Button>
							))
						) : (
							<div className="text-sm text-slate-500">Add skills in your profile to search.</div>
						)}
					</CardContent>
				</Card>
			</section>
		</AppShell>
	);
}
