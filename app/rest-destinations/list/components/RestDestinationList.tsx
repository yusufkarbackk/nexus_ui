'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    Globe,
    ArrowLeft,
    Plus,
    Trash2,
    RefreshCw,
    AlertCircle,
    Search,
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    ToggleLeft,
    ToggleRight,
    Key,
    Zap,
    Lock,
} from 'lucide-react';
import {
    fetchRestDestinations,
    deleteRestDestination,
    toggleRestDestinationStatus,
    RestDestination,
} from '@/app/lib/api';

const methodColors: Record<string, string> = {
    GET: 'bg-green-500/20 text-green-400',
    POST: 'bg-blue-500/20 text-blue-400',
    PUT: 'bg-yellow-500/20 text-yellow-400',
    PATCH: 'bg-purple-500/20 text-purple-400',
    DELETE: 'bg-red-500/20 text-red-400',
};

const authIcons: Record<string, React.ReactNode> = {
    none: null,
    bearer: <Key className="w-3.5 h-3.5" />,
    api_key: <Zap className="w-3.5 h-3.5" />,
    basic: <Lock className="w-3.5 h-3.5" />,
};

export function RestDestinationList() {
    const [destinations, setDestinations] = useState<RestDestination[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [togglingId, setTogglingId] = useState<number | null>(null);

    const loadDestinations = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetchRestDestinations();
            if (response.success) {
                setDestinations(response.data || []);
            } else {
                setError(response.message);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load REST destinations';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDestinations();
    }, [loadDestinations]);

    const handleDelete = async (id: number, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
            return;
        }

        setDeletingId(id);
        try {
            const response = await deleteRestDestination(id);
            if (response.success) {
                setDestinations((prev) => prev.filter((dest) => dest.id !== id));
            } else {
                setError(response.message);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete REST destination';
            setError(errorMessage);
        } finally {
            setDeletingId(null);
        }
    };

    const handleToggleStatus = async (id: number) => {
        setTogglingId(id);
        try {
            const response = await toggleRestDestinationStatus(id);
            if (response.success) {
                setDestinations((prev) =>
                    prev.map((dest) =>
                        dest.id === id ? { ...dest, status: response.status } : dest
                    )
                );
            } else {
                setError(response.message);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to toggle status';
            setError(errorMessage);
        } finally {
            setTogglingId(null);
        }
    };

    const filteredDestinations = destinations.filter(
        (dest) =>
            dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dest.baseUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dest.method.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getDomain = (url: string) => {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname;
        } catch {
            return url;
        }
    };

    const isUp = (status: string) => status === 'up';

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Header */}
            <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/"
                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-600 rounded-lg">
                                    <Globe className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-semibold text-white">REST Destinations</h1>
                                    <p className="text-sm text-slate-400">Manage your REST API endpoints</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={loadDestinations}
                                disabled={isLoading}
                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                                title="Refresh"
                            >
                                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                            </button>
                            <Link
                                href="/rest-destinations"
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-500 rounded-lg transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                New REST API
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-6 py-8">
                {/* Search */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search REST destinations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                        <p className="text-red-400 text-sm">{error}</p>
                        <button
                            onClick={() => setError(null)}
                            className="ml-auto text-red-400 hover:text-red-300"
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* Loading State */}
                {isLoading ? (
                    <div className="text-center py-16">
                        <RefreshCw className="w-8 h-8 text-orange-400 animate-spin mx-auto mb-4" />
                        <p className="text-slate-400">Loading REST destinations...</p>
                    </div>
                ) : filteredDestinations.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="p-4 bg-slate-800 rounded-full w-fit mx-auto mb-4">
                            <Globe className="w-8 h-8 text-slate-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                            {searchTerm ? 'No REST destinations found' : 'No REST destinations yet'}
                        </h3>
                        <p className="text-slate-400 mb-6">
                            {searchTerm
                                ? 'Try a different search term'
                                : 'Create your first REST API destination to get started'}
                        </p>
                        {!searchTerm && (
                            <Link
                                href="/rest-destinations"
                                className="inline-flex items-center gap-2 px-6 py-3 text-white bg-orange-600 hover:bg-orange-500 rounded-lg transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                Create First REST API
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredDestinations.map((dest) => (
                            <Link
                                key={dest.id}
                                href={`/rest-destinations?id=${dest.id}`}
                                className={`
                  group bg-slate-900 border rounded-xl p-5 transition-colors block cursor-pointer
                  ${isUp(dest.status)
                                        ? 'border-slate-800 hover:border-slate-700'
                                        : 'border-slate-800/50 opacity-60'
                                    }
                `}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        {/* API Icon */}
                                        <div className="p-3 bg-orange-500/20 rounded-lg">
                                            <Globe className="w-6 h-6 text-orange-400" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-lg font-semibold text-white truncate">{dest.name}</h3>
                                                <span className={`px-2 py-0.5 text-xs font-medium rounded ${methodColors[dest.method] || 'bg-slate-500/20 text-slate-400'}`}>
                                                    {dest.method}
                                                </span>
                                                {isUp(dest.status) ? (
                                                    <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-emerald-500/20 text-emerald-400 rounded-full">
                                                        <CheckCircle className="w-3 h-3" />
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-red-500/20 text-red-400 rounded-full">
                                                        <XCircle className="w-3 h-3" />
                                                        Inactive
                                                    </span>
                                                )}
                                            </div>

                                            {dest.description && (
                                                <p className="text-sm text-slate-400 mb-2 line-clamp-1">{dest.description}</p>
                                            )}

                                            {/* Connection Info */}
                                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                                                <div className="flex items-center gap-1.5">
                                                    <Globe className="w-3.5 h-3.5" />
                                                    <span className="font-mono text-xs truncate max-w-[200px]" title={dest.baseUrl}>
                                                        {getDomain(dest.baseUrl)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    {authIcons[dest.authType]}
                                                    <span className="capitalize">{dest.authType.replace('_', ' ')}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    <span>{dest.timeoutSeconds}s timeout</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    <span>{formatDate(dest.createdAt)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleToggleStatus(dest.id);
                                            }}
                                            disabled={togglingId === dest.id}
                                            className={`
                        p-2 rounded-lg transition-colors
                        ${isUp(dest.status)
                                                    ? 'text-emerald-400 hover:bg-emerald-500/10'
                                                    : 'text-slate-400 hover:bg-slate-700'
                                                }
                      `}
                                            title={isUp(dest.status) ? 'Set to Inactive' : 'Set to Active'}
                                        >
                                            {togglingId === dest.id ? (
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                            ) : isUp(dest.status) ? (
                                                <ToggleRight className="w-5 h-5" />
                                            ) : (
                                                <ToggleLeft className="w-5 h-5" />
                                            )}
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleDelete(dest.id, dest.name);
                                            }}
                                            disabled={deletingId === dest.id}
                                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            {deletingId === dest.id ? (
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Stats */}
                {!isLoading && filteredDestinations.length > 0 && (
                    <div className="mt-6 text-center text-sm text-slate-500">
                        Showing {filteredDestinations.length} of {destinations.length} REST destinations
                        {' • '}
                        {destinations.filter((d) => d.status === 'up').length} active
                    </div>
                )}
            </main>
        </div>
    );
}
