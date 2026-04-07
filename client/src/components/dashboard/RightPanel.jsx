import React from 'react';
import { ArrowRight, MoreHorizontal, Trophy } from 'lucide-react';

import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import WidgetSection from './WidgetSection';


function safeName(value) {
	return (value || 'User').toString();
}

export default function RightPanel({ studyHelpRequests = [], topStudents = [] }) {
	return (
		<div className="space-y-4">
			<Card className="overflow-hidden rounded-2xl border border-slate-200/70 bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-sm">
				<CardHeader className="pb-3">
					<CardTitle className="text-base font-semibold text-white">Need a Team for the Hackathon?</CardTitle>
					<p className="mt-1 text-sm text-white/80">Post your requirement & find teammates quickly!</p>
				</CardHeader>
				<CardContent className="pt-0">
					<Button className="bg-amber-400 text-slate-900 hover:bg-amber-300" size="sm">
						Create Opportunity <ArrowRight className="ml-2 h-4 w-4" />
					</Button>
				</CardContent>
			</Card>

			<WidgetSection
				title="Study Help Requests"
				rightSlot={
					<button type="button" className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
						<MoreHorizontal className="h-4 w-4" />
					</button>
				}
			>
				{studyHelpRequests.length ? (
					<ul className="space-y-3">
						{studyHelpRequests.map((req) => (
							<li key={req._id} className="flex items-start justify-between gap-3">
								<div className="min-w-0">
									<div className="truncate text-sm font-medium text-slate-900">{req.title}</div>
									<div className="mt-0.5 text-xs text-slate-500">
										by {safeName(req?.ownerId?.name)}
									</div>
								</div>
							</li>
						))}
					</ul>
				) : (
					<div className="text-sm text-slate-500">No requests yet.</div>
				)}
			</WidgetSection>

			<WidgetSection
				title="Top Students"
				rightSlot={
					<button type="button" className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
						<MoreHorizontal className="h-4 w-4" />
					</button>
				}
			>
				{topStudents.length ? (
					<ul className="space-y-3">
						{topStudents.map((s) => (
							<li key={s._id} className="flex items-center justify-between gap-3">
								<div className="flex min-w-0 items-center gap-3">
									<Avatar className="h-9 w-9">
										{s.avatarUrl ? <AvatarImage src={s.avatarUrl} alt={safeName(s.name)} /> : null}
										<AvatarFallback>{safeName(s.name).slice(0, 2).toUpperCase()}</AvatarFallback>
									</Avatar>
									<div className="min-w-0">
										<div className="truncate text-sm font-medium text-slate-900">{safeName(s.name)}</div>
										<div className="truncate text-xs text-slate-500">
											{s.branch || (Array.isArray(s.skills) && s.skills[0]) || 'Student'}
										</div>
									</div>
								</div>
								<div className="flex items-center gap-2 text-xs text-slate-600">
									<Trophy className="h-4 w-4 text-amber-500" />
									<span className="whitespace-nowrap">{(s.skills || []).length} skills</span>
								</div>
							</li>
						))}
					</ul>
				) : (
					<div className="text-sm text-slate-500">No students found.</div>
				)}
			</WidgetSection>
		</div>
	);
}
