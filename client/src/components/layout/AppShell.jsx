import React from 'react';

import Sidebar from './Sidebar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { cn } from '../../lib/cn.js';

export default function AppShell({ children, rightPanel }) {
	const { me, isLoadingMe } = useAuth();

	return (
		<div className="min-h-screen bg-slate-50">
			<Sidebar user={me || { name: isLoadingMe ? 'Loading…' : 'User' }} badges={{}} />

			<div className="md:pl-64">
				<div
					className={cn('mx-auto w-full max-w-6xl px-4 py-6', rightPanel && 'xl:pr-80')}
				>
					{children}
				</div>
			</div>

			{rightPanel ? (
				<aside className="hidden xl:fixed xl:inset-y-0 xl:right-0 xl:block xl:w-80 xl:overflow-y-auto xl:border-l xl:border-slate-200/70 xl:bg-slate-50">
					<div className="px-4 py-6">{rightPanel}</div>
				</aside>
			) : null}
		</div>
	);
}
