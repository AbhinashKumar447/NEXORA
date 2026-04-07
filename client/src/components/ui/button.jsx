import React from 'react';
import { cn } from '../../lib/cn';

export function Button({
	asChild = false,
	className,
	variant = 'default',
	size = 'default',
	...props
}) {
	const Comp = asChild ? 'span' : 'button';

	return (
		<Comp
			className={cn(
				'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 disabled:pointer-events-none disabled:opacity-50',
				variant === 'default' && 'bg-blue-600 text-white hover:bg-blue-700',
				variant === 'secondary' && 'bg-slate-100 text-slate-900 hover:bg-slate-200',
				variant === 'ghost' && 'bg-transparent text-slate-700 hover:bg-slate-100',
				variant === 'outline' && 'border border-slate-200 bg-white text-slate-900 hover:bg-slate-50',
				variant === 'highlight' && 'bg-amber-400 text-slate-900 hover:bg-amber-300',
				size === 'default' && 'h-10 px-4 py-2',
				size === 'sm' && 'h-9 px-3',
				size === 'lg' && 'h-11 px-5',
				size === 'icon' && 'h-10 w-10 p-0',
				className
			)}
			{...props}
		/>
	);
}
