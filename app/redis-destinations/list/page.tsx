'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    Plus,
    Zap,
    Trash2,
    Edit,
    Check,
    X,
    AlertCircle,
    RefreshCw,
    ToggleLeft,
    ToggleRight,
    Wifi,
    WifiOff,
    Activity,
} from 'lucide-react';
import {
    fetchRedisDestinations,
    deleteRedisDestination,
    toggleRedisDestinationStatus,
    testRedisConnection,
    RedisDestination,
} from '@/app/lib/api';

export default function RedisDestinationList() {
    const [destinations, setDestinations] = useState<RedisDestination[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [testingId, setTestingId] = useState<number | null>(null);
    const [testResults, setTestResults] = useState<Record<number, { success: boolean; message: string; latency?: string }>>({});
    const [togglingId, setTogglingId] = useState<number | null>(null);

    const loadDestinations = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchRedisDestinations();
            if (data.success) {
                setDestinations(data.data || []);
            } else {
                throw new Error(data.message);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load Redis destinations');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDestinations();
    }, [loadDestinations]);

    const handleDelete = async (id: number) => {
        try {
            await deleteRedisDestination(id);
            setDeleteId(null);
            loadDestinations();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete');
        }
    };

    const handleToggle = async (dest: RedisDestination) => {
        setTogglingId(dest.id);
        try {
            await toggleRedisDestinationStatus(dest.id);
            loadDestinations();
        } catch {
            setError('Failed to toggle status');
        } finally {
            setTogglingId(null);
        }
    };

    const handleTest = async (dest: RedisDestination) => {
        setTestingId(dest.id);
        try {
            const result = await testRedisConnection({
                host: dest.host,
                port: dest.port,
                databaseNumber: dest.databaseNumber,
                useTls: dest.useTls,
            });
            setTestResults((prev) => ({ ...prev, [dest.id]: result }));
        } catch {
            setTestResults((prev) => ({ ...prev, [dest.id]: { success: false, message: 'Test failed' } }));
        } finally {
            setTestingId(null);
        }
    };

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
                                <div className="p-2 bg-red-600 rounded-lg">
                                    <Zap className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-semibold text-white">Redis Destinations</h1>
                                    <p className="text-sm text-slate-400">Manage external Redis connections</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={loadDestinations}
                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                                title="Refresh"
                            >
                                <RefreshCw className="w-5 h-5" />
                            </button>
                            <Link
                                href="/redis-destinations"
                                className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add Redis Connection
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-400">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{error}</span>
                        <button onClick={() => setError(null)} className="ml-auto p-1 hover:bg-red-500/20 rounded">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <RefreshCw className="w-8 h-8 text-slate-400 animate-spin" />
                    </div>
                ) : destinations.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800 rounded-full mb-4">
                            <Zap className="w-8 h-8 text-slate-500" />
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">No Redis Destinations</h3>
                        <p className="text-slate-400 mb-6">
                            Add your first Redis connection to use in workflow Redis command steps.
                        </p>
                        <Link
                            href="/redis-destinations"
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add Redis Connection
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {destinations.map((dest) => {
                            const testResult = testResults[dest.id];
                            const isUp = dest.status === 'up';
                            return (
                                <div
                                    key={dest.id}
                                    className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className={`p-3 rounded-lg ${isUp ? 'bg-red-500/20' : 'bg-slate-700'}`}>
                                                <Zap className={`w-5 h-5 ${isUp ? 'text-red-400' : 'text-slate-400'}`} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-lg font-medium text-white">{dest.name}</h3>
                                                    <span className={`px-2 py-0.5 text-xs rounded-full ${isUp
                                                        ? 'bg-emerald-500/20 text-emerald-400'
                                                        : 'bg-slate-700 text-slate-400'
                                                        }`}>
                                                        {dest.status}
                                                    </span>
                                                    {dest.useTls && (
                                                        <span className="px-2 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-400">TLS</span>
                                                    )}
                                                </div>
                                                {dest.description && (
                                                    <p className="text-sm text-slate-400 mt-1">{dest.description}</p>
                                                )}
                                                <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                                                    <span>Host: <span className="text-slate-300">{dest.host}:{dest.port}</span></span>
                                                    <span>DB: <span className="text-slate-300">{dest.databaseNumber}</span></span>
                                                </div>
                                                {/* Test result badge */}
                                                {testResult && (
                                                    <div className={`mt-3 flex items-center gap-2 text-sm ${testResult.success ? 'text-emerald-400' : 'text-red-400'}`}>
                                                        {testResult.success ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                                                        <span>{testResult.message}</span>
                                                        {testResult.latency && <span className="text-slate-500">({testResult.latency})</span>}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {/* Test connection */}
                                            <button
                                                onClick={() => handleTest(dest)}
                                                disabled={testingId === dest.id}
                                                className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                title="Test connection"
                                            >
                                                {testingId === dest.id
                                                    ? <RefreshCw className="w-4 h-4 animate-spin" />
                                                    : <Activity className="w-4 h-4" />
                                                }
                                            </button>

                                            {/* Toggle status */}
                                            <button
                                                onClick={() => handleToggle(dest)}
                                                disabled={togglingId === dest.id}
                                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                                                title={isUp ? 'Set Inactive' : 'Set Active'}
                                            >
                                                {isUp
                                                    ? <ToggleRight className="w-4 h-4 text-emerald-400" />
                                                    : <ToggleLeft className="w-4 h-4" />
                                                }
                                            </button>

                                            {deleteId === dest.id ? (
                                                <>
                                                    <button
                                                        onClick={() => handleDelete(dest.id)}
                                                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                                        title="Confirm Delete"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteId(null)}
                                                        className="p-2 text-slate-400 hover:bg-slate-700 rounded-lg transition-colors"
                                                        title="Cancel"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <Link
                                                        href={`/redis-destinations?id=${dest.id}`}
                                                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => setDeleteId(dest.id)}
                                                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
