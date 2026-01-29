'use client';

import Link from 'next/link';
import { useAuth } from '@/app/lib/auth';
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
} from 'lucide-react';

export function Header() {
    const { isAuthenticated, user, logout, isLoading } = useAuth();

    return (
        <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
            <div className="max-w-6xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-600 rounded-lg">
                                <Zap className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-white">Nexus Gateway</span>
                        </Link>
                    </div>

                    <nav className="flex items-center gap-2">
                        <Link
                            href="/sender-apps/list"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <Send className="w-4 h-4" />
                            Sources
                        </Link>
                        <Link
                            href="/mqtt-sources"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <Wifi className="w-4 h-4" />
                            MQTT
                        </Link>
                        <Link
                            href="/destinations/list"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <Database className="w-4 h-4" />
                            Destinations
                        </Link>
                        <Link
                            href="/rest-destinations/list"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <Globe className="w-4 h-4" />
                            REST APIs
                        </Link>
                        <Link
                            href="/sap-destinations/list"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <Server className="w-4 h-4" />
                            SAP
                        </Link>
                        <Link
                            href="/workflow/list"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <Workflow className="w-4 h-4" />
                            Workflows
                        </Link>
                        <Link
                            href="/logs"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <ScrollText className="w-4 h-4" />
                            Logs
                        </Link>
                        <Link
                            href="/docs"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <BookOpen className="w-4 h-4" />
                            Docs
                        </Link>
                        <Link
                            href="/agents"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <Cpu className="w-4 h-4" />
                            Agent
                        </Link>
                        <Link
                            href="/workflow"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            New Workflow
                        </Link>

                        {/* User section */}
                        {!isLoading && isAuthenticated && (
                            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-slate-700">
                                <div className="flex items-center gap-2 px-3 py-2">
                                    <User className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm text-slate-300">{user?.name || user?.email}</span>
                                </div>
                                <button
                                    onClick={logout}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                    title="Logout"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {!isLoading && !isAuthenticated && (
                            <Link
                                href="/login"
                                className="flex items-center gap-2 px-4 py-2 ml-4 text-sm text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                            >
                                Login
                            </Link>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
}
