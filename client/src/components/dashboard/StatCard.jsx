import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export default function StatCard({ label, value, valueClassName = '' }) {
	return (
		<Card className="rounded-2xl">
			<CardHeader className="pb-2">
				<CardTitle className="text-sm text-slate-600">{label}</CardTitle>
			</CardHeader>
			<CardContent>
				<div className={`text-2xl font-semibold text-slate-900 ${valueClassName}`}>{value}</div>
			</CardContent>
		</Card>
	);
}
