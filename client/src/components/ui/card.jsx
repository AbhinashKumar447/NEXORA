import React from 'react';
import { cn } from '../../lib/cn';

export function Card({ className, ...props }) {
	return (
		<div
			className={cn(
				'rounded-2xl border border-slate-200/70 bg-white shadow-sm transition-shadow hover:shadow-md',
				className
			)}
			{...props}
		/>
	);
}

export function CardHeader({ className, ...props }) {
	return <div className={cn('p-5 pb-3', className)} {...props} />;
}

export function CardTitle({ className, ...props }) {
	return (
		<h3 className={cn('text-sm font-semibold text-slate-900', className)} {...props} />
	);
}

export function CardContent({ className, ...props }) {
	return <div className={cn('p-5 pt-0', className)} {...props} />;
}

export function CardFooter({ className, ...props }) {
	return <div className={cn('p-5 pt-0', className)} {...props} />;
}
