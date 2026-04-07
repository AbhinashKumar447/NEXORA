import React from 'react';
import { cn } from '../../lib/cn';

export function Avatar({ className, ...props }) {
	return (
		<div
			className={cn(
				'relative inline-flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-slate-200',
				className
			)}
			{...props}
		/>
	);
}

export function AvatarImage({ className, alt = '', ...props }) {
	return (
		<img
			className={cn('h-full w-full object-cover', className)}
			alt={alt}
			{...props}
		/>
	);
}

export function AvatarFallback({ className, ...props }) {
	return (
		<div
			className={cn(
				'flex h-full w-full items-center justify-center text-xs font-semibold text-slate-700',
				className
			)}
			{...props}
		/>
	);
}
