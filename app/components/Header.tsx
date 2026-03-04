'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/lib/auth';
import { useState } from 'react';
import {
    Zap,
    Send,
    Wifi,
    Database,
    Globe,
    Workflow,
    ScrollText,
    BookOpen,
    Cpu,
    Plus,
    LogOut,
    User,
    Server,
    Shield,
    Menu,
    X,
    Bot,
    Key,
} from 'lucide-react';

const NAV_LINKS = [
    { href: '/sender-apps/list', icon: Send, label: 'Sources' },
    { href: '/mqtt-sources', icon: Wifi, label: 'MQTT' },
    { href: '/destinations/list', icon: Database, label: 'Destinations' },
    { href: '/rest-destinations/list', icon: Globe, label: 'REST APIs' },
    { href: '/sap-destinations/list', icon: Server, label: 'SAP' },
    { href: '/redis-destinations/list', icon: Zap, label: 'Redis' },
    { href: '/workflow/list', icon: Workflow, label: 'Workflows' },
    { href: '/logs', icon: ScrollText, label: 'Logs' },
    { href: '/docs', icon: BookOpen, label: 'Docs' },
    { href: '/agents', icon: Cpu, label: 'Agent' },
    { href: '/ai-providers', icon: Key, label: 'AI Providers' },
    { href: '/agent', icon: Bot, label: 'AI Agents' },
    { href: '/settings/rate-limit', icon: Shield, label: 'Settings' },
];

export function Header() {
    const { isAuthenticated, user, logout, isLoading } = useAuth();
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);

    const linkClass = (href: string) =>
        `flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${pathname?.startsWith(href)
            ? 'text-white bg-slate-800'
            : 'text-slate-400 hover:text-white hover:bg-slate-800'
        }`;

    return (
        <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="max-w-screen-xl mx-auto px-6 py-3">
                <div className="flex items-center justify-between gap-4">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 shrink-0">
                        <div className="p-2 bg-indigo-600 rounded-lg">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg font-bold text-white whitespace-nowrap">Nexus Gateway</span>
                    </Link>

                    {/* Desktop Nav — hidden when too small */}
                    <nav className="hidden xl:flex items-center gap-1 overflow-x-auto flex-1 justify-center">
                        {NAV_LINKS.map(({ href, icon: Icon, label }) => (
                            <Link key={href} href={href} className={linkClass(href)}>
                                <Icon className="w-4 h-4 shrink-0" />
                                <span className="whitespace-nowrap">{label}</span>
                            </Link>
                        ))}
                    </nav>

                    {/* Right side: New Workflow + User + Burger */}
                    <div className="flex items-center gap-2 shrink-0">
                        <Link
                            href="/workflow"
                            className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors whitespace-nowrap"
                        >
                            <Plus className="w-4 h-4" />
                            New Workflow
                        </Link>

                        {/* User info (desktop) */}
                        {!isLoading && isAuthenticated && (
                            <div className="hidden xl:flex items-center gap-2 pl-3 border-l border-slate-700">
                                <div className="flex items-center gap-2 px-2 py-1">
                                    <User className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm text-slate-300 max-w-[120px] truncate">
                                        {user?.name || user?.email}
                                    </span>
                                </div>
                                <button
                                    onClick={logout}
                                    className="flex items-center gap-1 px-2 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                    title="Logout"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {/* Burger button — visible when nav doesn't fit */}
                        <button
                            onClick={() => setMenuOpen((o) => !o)}
                            className="xl:hidden flex items-center justify-center w-9 h-9 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            aria-label="Toggle menu"
                        >
                            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile / Collapsed Dropdown Menu */}
            {menuOpen && (
                <div className="xl:hidden border-t border-slate-800 bg-slate-900 px-6 py-4">
                    <nav className="grid grid-cols-2 sm:grid-cols-3 gap-1 mb-4">
                        {NAV_LINKS.map(({ href, icon: Icon, label }) => (
                            <Link
                                key={href}
                                href={href}
                                onClick={() => setMenuOpen(false)}
                                className={linkClass(href)}
                            >
                                <Icon className="w-4 h-4 shrink-0" />
                                <span>{label}</span>
                            </Link>
                        ))}
                        <Link
                            href="/workflow"
                            onClick={() => setMenuOpen(false)}
                            className="sm:hidden flex items-center gap-2 px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors col-span-2"
                        >
                            <Plus className="w-4 h-4" />
                            New Workflow
                        </Link>
                    </nav>

                    {/* User section in dropdown */}
                    {!isLoading && isAuthenticated && (
                        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-slate-400" />
                                <span className="text-sm text-slate-300">{user?.name || user?.email}</span>
                            </div>
                            <button
                                onClick={() => { logout(); setMenuOpen(false); }}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>
                    )}

                    {!isLoading && !isAuthenticated && (
                        <Link
                            href="/login"
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                        >
                            Login
                        </Link>
                    )}
                </div>
            )}
        </header>
    );
}
