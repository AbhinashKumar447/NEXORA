import React, { useState } from 'react';

import Sidebar from './Sidebar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { cn } from '../../lib/cn.js';
import { Button } from '../ui/button.jsx';

export default function AppShell({ children, rightPanel }) {
	const { me, isLoadingMe } = useAuth();
	const [sidebarOpen, setSidebarOpen] = useState(false);

	function toggleSidebar() {
		setSidebarOpen((current) => !current);
	}

	function openSidebar() {
		setSidebarOpen(true);
	}

	function closeSidebar() {
		setSidebarOpen(false);
	}

	return (
		<div className="min-h-screen bg-slate-50">
			<Sidebar
				user={me || { name: isLoadingMe ? 'Loading…' : 'User' }}
				badges={{}}
				isOpen={sidebarOpen}
				onToggle={toggleSidebar}
			/>

			{sidebarOpen ? (
				<div
					className="fixed inset-0 z-40 bg-black/30 md:hidden"
					onClick={() => setSidebarOpen(false)}
					aria-hidden="true"
				/>
			) : null}

			<div
				className="md:pl-16"
			>
				<div
					className={cn('mx-auto w-full max-w-6xl px-4 py-6', rightPanel && 'xl:pr-80')}
				>
					<div className="mb-4 flex items-center md:hidden">
						<Button
							size="icon"
							variant="ghost"
							onClick={toggleSidebar}
							aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
						>
							<img src="/logo-mark.svg" alt="App logo" className="h-7 w-7" />
						</Button>
					</div>
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
