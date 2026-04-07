import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
	Bell,
	BookOpen,
	Briefcase,
	Home,
	MessageCircle,
	Search,
	ClipboardList,
	User,
	Users,
	Plus,
} from 'lucide-react';

import { cn } from '../../lib/cn';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useAuth } from '../../context/AuthContext.jsx';

const NAV_ITEMS = [
	{ key: 'home', label: 'Home', icon: Home, to: '/' },
	{ key: 'opportunities', label: 'Opportunities', icon: Briefcase, to: '/opportunities' },
	{ key: 'find', label: 'Find Students', icon: Search, to: '/find' },
	{ key: 'study', label: 'Study Help', icon: BookOpen, to: '/study-help' },
	{ key: 'profile', label: 'My Profile', icon: User, to: '/profile' },
	{ key: 'assignments', label: 'Assignments', icon: ClipboardList },
	{ key: 'messages', label: 'Messages', icon: MessageCircle, badgeKey: 'messages' },
	{ key: 'notifications', label: 'Notifications', icon: Bell, badgeKey: 'notifications' },
];

export default function Sidebar({ user, badges = {} }) {
	const navigate = useNavigate();
	const { logout } = useAuth();

	function onLogout() {
		logout();
		navigate('/login', { replace: true });
	}

	return (
		<aside
			className={cn(
				'w-full md:fixed md:inset-y-0 md:left-0 md:w-64',
				'bg-gradient-to-b from-blue-950 via-blue-900 to-blue-800 text-white'
			)}
		>
			<div className="flex h-full flex-col">
				<div className="flex items-center gap-3 px-5 py-5">
					<Avatar className="h-12 w-12 ring-2 ring-white/20">
						{user?.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={user.name || 'User'} /> : null}
						<AvatarFallback>{(user?.name || 'User').slice(0, 2).toUpperCase()}</AvatarFallback>
					</Avatar>
					<div className="min-w-0">
						<div className="truncate text-sm font-semibold">{user?.name || 'User'}</div>
						<div className="truncate text-xs text-white/70">{user?.collegeId?.name || ''}</div>
					</div>
				</div>

				<nav className="flex-1 px-3">
					<ul className="space-y-1">
						{NAV_ITEMS.map((item) => {
							const Icon = item.icon;
							const badgeValue = item.badgeKey ? badges[item.badgeKey] : null;
							const isDisabled = !item.to;

							return (
								<li key={item.key}>
									{item.to ? (
										<NavLink
											to={item.to}
											className={({ isActive }) =>
												cn(
													'group flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors',
													isActive
														? 'bg-white/12 text-white'
														: 'text-white/85 hover:bg-white/10'
												)
											}
										>
											<span className="flex items-center gap-3">
												<Icon className="h-5 w-5 text-white/80" />
												<span>{item.label}</span>
											</span>
											{typeof badgeValue === 'number' && badgeValue > 0 ? (
												<Badge className="bg-rose-500 text-white">{badgeValue}</Badge>
											) : null}
										</NavLink>
									) : (
										<button
											type="button"
											disabled={isDisabled}
											className={cn(
												'group flex w-full cursor-not-allowed items-center justify-between rounded-xl px-3 py-2 text-sm text-white/40',
												'opacity-70'
											)}
										>
											<span className="flex items-center gap-3">
												<Icon className="h-5 w-5 text-white/40" />
												<span>{item.label}</span>
											</span>
										</button>
									)}
								</li>
							);
						})}
					</ul>
				</nav>

				<div className="px-5 pb-6">
					<Button
						className="w-full justify-center"
						variant="highlight"
						onClick={() => navigate('/opportunities/new')}
					>
						<Plus className="mr-2 h-4 w-4" />
						Post an Opportunity
					</Button>
					<Button
						className="mt-3 w-full justify-center bg-white/10 text-white hover:bg-white/15"
						variant="ghost"
						onClick={onLogout}
					>
						Logout
					</Button>
					<div className="mt-4 flex items-center gap-2 text-xs text-white/70">
						<Users className="h-4 w-4" />
						<span className="leading-5">Build your network faster</span>
					</div>
				</div>
			</div>
		</aside>
	);
}
