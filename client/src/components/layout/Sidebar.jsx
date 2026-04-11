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

export default function Sidebar({ user, badges = {}, isOpen = true, onToggle }) {
	const navigate = useNavigate();
	const { logout } = useAuth();
	const showFull = Boolean(isOpen);

	function onLogout() {
		logout();
		navigate('/login', { replace: true });
	}

	return (
		<aside
			className={cn(
				'fixed inset-y-0 left-0 z-50 overflow-y-auto transition-[width,transform] duration-200',
				showFull ? 'translate-x-0 w-64 md:w-56' : '-translate-x-full w-64 md:translate-x-0 md:w-16',
				'border-r border-white/10 text-white backdrop-blur-md',
				'bg-gradient-to-b from-blue-950/75 via-blue-900/70 to-blue-800/65'
			)}
		>
			<div className="flex h-full flex-col">
				<div
					className={cn(
						'flex items-center justify-between px-5 py-5',
						!showFull && 'flex-col justify-start gap-3 px-2 py-4'
					)}
				>
					<button
						type="button"
						onClick={onToggle}
						className={cn(
							'rounded-xl p-1 transition-colors hover:bg-white/10',
							!showFull && 'p-1.5'
						)}
						aria-label={showFull ? 'Collapse sidebar' : 'Expand sidebar'}
					>
						<img src="/logo-mark.svg" alt="App logo" className="h-10 w-10" />
					</button>
				</div>

				<div
					className={cn(
						'flex items-center gap-3 px-5 pb-8',
						!showFull && 'flex-col px-2'
					)}
				>
					<Avatar className="h-12 w-12 ring-2 ring-white/20">
						{user?.avatarUrl ? (
							<AvatarImage src={user.avatarUrl} alt={user.name || 'User'} />
						) : null}
						<AvatarFallback>{(user?.name || 'User').slice(0, 2).toUpperCase()}</AvatarFallback>
					</Avatar>
					{showFull ? (
						<div className="min-w-0">
							<div className="truncate text-sm font-semibold">{user?.name || 'User'}</div>
							<div className="truncate text-xs text-white/70">{user?.collegeId?.name || ''}</div>
						</div>
					) : null}
				</div>

				<nav className={cn('flex-1 px-3', !showFull && 'px-2')}>
					<ul className="space-y-1">
						{NAV_ITEMS.map((item) => {
							const Icon = item.icon;
							const badgeValue = item.badgeKey ? badges[item.badgeKey] : null;
							const isDisabled = !item.to;
							const isProfile = item.key === 'profile';

							return (
								<li key={item.key}>
									{item.to ? (
										<NavLink
											to={item.to}
											className={({ isActive }) =>
												cn(
													'group flex w-full items-center rounded-xl px-3 py-2 text-sm transition-colors',
													showFull ? 'justify-between' : 'justify-center',
													isActive
														? 'bg-white/12 text-white'
														: 'text-white/85 hover:bg-white/10'
												)
											}
										>
												<span className={cn('flex items-center gap-3', !showFull && 'gap-0')}>
													<Icon className="h-5 w-5 text-white/80 transition-colors group-hover:text-amber-300" />
													{showFull ? <span>{item.label}</span> : <span className="sr-only">{item.label}</span>}
											</span>
												{showFull ? (
													<div className="flex items-center gap-2">
														{typeof badgeValue === 'number' && badgeValue > 0 ? (
															<Badge className="bg-rose-500 text-white">{badgeValue}</Badge>
														) : null}
														{isProfile ? (
															<button
																type="button"
																className="rounded-lg p-1 text-amber-300 transition-colors hover:bg-white/10 hover:text-amber-200"
																aria-label="Logout"
																onClick={(event) => {
																	event.preventDefault();
																	event.stopPropagation();
																	onLogout();
																}}
															>
																<Plus className="h-4 w-4" />
															</button>
														) : null}
													</div>
												) : null}
										</NavLink>
									) : (
										<button
											type="button"
											disabled={isDisabled}
											className={cn(
													'group flex w-full cursor-not-allowed items-center rounded-xl px-3 py-2 text-sm text-white/40',
													showFull ? 'justify-between' : 'justify-center',
												'opacity-70'
											)}
										>
												<span className={cn('flex items-center gap-3', !showFull && 'gap-0')}>
												<Icon className="h-5 w-5 text-white/40 transition-colors group-hover:text-amber-300" />
													{showFull ? <span>{item.label}</span> : <span className="sr-only">{item.label}</span>}
											</span>
										</button>
									)}
								</li>
							);
						})}
					</ul>
				</nav>

					{showFull ? (
						<div className="px-5 pb-6">
					<Button
						className="w-full justify-center"
						variant="highlight"
						onClick={() => navigate('/opportunities/new')}
					>
						<Plus className="mr-2 h-4 w-4" />
						Post an Opportunity
					</Button>
					<div className="mt-4 flex items-center gap-2 text-xs text-white/70">
						<Users className="h-4 w-4" />
						<span className="leading-5">Build your network faster</span>
					</div>
						</div>
					) : null}
			</div>
		</aside>
	);
}
