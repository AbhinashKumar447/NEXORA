import React from 'react';
import { cn } from '../../lib/cn';

export function Badge({ className, variant = 'default', ...props }) {
	return (
		<span
			className={cn(
				'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
				variant === 'default' && 'bg-slate-100 text-slate-700',
				variant === 'success' && 'bg-emerald-100 text-emerald-700',
				variant === 'warning' && 'bg-amber-100 text-amber-700',
				variant === 'danger' && 'bg-rose-100 text-rose-700',
				className
			)}
			{...props}
		/>
	);
}
