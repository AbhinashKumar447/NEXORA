import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export default function WidgetSection({ title, rightSlot, children }) {
	return (
		<Card className="rounded-2xl">
			<CardHeader className="flex flex-row items-center justify-between">
				<CardTitle className="text-sm text-slate-800">{title}</CardTitle>
				{rightSlot}
			</CardHeader>
			<CardContent className="pt-0">{children}</CardContent>
		</Card>
	);
}
