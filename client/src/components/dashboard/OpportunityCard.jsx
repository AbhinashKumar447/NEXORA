import React, { useState } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Briefcase, CheckCircle2, Flame, Users } from 'lucide-react';
import opportunityService from '../../services/opportunityService.js';

function metricIcon(metric) {
	if (!metric) return null;
	if (metric.icon === 'applied') return <Users className="h-4 w-4 text-slate-500" />;
	if (metric.icon === 'interested') return <Flame className="h-4 w-4 text-amber-500" />;
	if (metric.icon === 'join') return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
	return <Briefcase className="h-4 w-4 text-slate-500" />;
}

export default function OpportunityCard({ opportunity }) {
	const { title, type, duration, by, metric, cta } = opportunity;
	const [isApplying, setIsApplying] = useState(false);
	const [error, setError] = useState('');
	const isCtaDisabled = Boolean(cta?.disabled) || isApplying;

	const ctaVariant =
		cta?.variant === 'success'
			? 'default'
			: cta?.variant === 'secondary'
				? 'secondary'
				: 'default';

	const ctaClassName = cta?.variant === 'success' ? 'bg-emerald-600 hover:bg-emerald-700' : '';

	async function onCtaClick() {
		if (isCtaDisabled) return;
		if (!cta?.opportunityId) return;
		setError('');
		setIsApplying(true);
		try {
			await opportunityService.applyToOpportunity(cta.opportunityId);
		} catch (err) {
			setError(err?.message || 'Failed to apply');
		} finally {
			setIsApplying(false);
		}
	}

	return (
		<Card className="rounded-2xl">
			<CardHeader className="pb-2">
				<div className="flex items-start justify-between gap-3">
					<div>
						<CardTitle className="text-sm font-semibold text-slate-900">{title}</CardTitle>
						<div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
							<Badge className="bg-blue-50 text-blue-700">{type}</Badge>
							<span>•</span>
							<span>{duration}</span>
							<span>•</span>
							<span>By {by}</span>
						</div>
					</div>
				</div>
			</CardHeader>
			<CardContent className="pt-0">
				{metric ? (
					<div className="mt-2 inline-flex items-center gap-2 text-xs text-slate-600">
						{metricIcon(metric)}
						{metric.value !== null ? (
							<span>
								<span className="font-semibold">{metric.value}</span> {metric.label}
							</span>
						) : (
							<span className="font-semibold">{metric.label}</span>
						)}
					</div>
				) : null}
				{error ? <div className="mt-2 text-xs text-rose-600">{error}</div> : null}
			</CardContent>
			<CardFooter className="flex justify-end">
				<Button
					className={ctaClassName}
					variant={ctaVariant}
					disabled={isCtaDisabled}
					onClick={onCtaClick}
				>
					{isApplying ? 'Applying…' : cta?.label || 'View'}
				</Button>
			</CardFooter>
		</Card>
	);
}
