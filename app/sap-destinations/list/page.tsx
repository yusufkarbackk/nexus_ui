'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    Plus,
    Server,
    Trash2,
    Edit,
    Check,
    X,
    AlertCircle,
    RefreshCw,
} from 'lucide-react';

interface SapDestination {
    id: number;
    name: string;
    description?: string;
    dsn_name: string;
    username: string;
    timeout_seconds: number;
    max_rows: number;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
}

export default function SapDestinationList() {
    const [destinations, setDestinations] = useState<SapDestination[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const fetchDestinations = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('nexus_token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sap-destinations`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch SAP destinations');
            }

            const data = await response.json();
            if (data.success) {
                setDestinations(data.data || []);
            } else {
                throw new Error(data.message);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDestinations();
    }, [fetchDestinations]);

    const handleDelete = async (id: number) => {
        try {
            const token = localStorage.getItem('nexus_token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sap-destinations/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete SAP destination');
            }

            setDeleteId(null);
            fetchDestinations();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete');
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
                                <div className="p-2 bg-orange-600 rounded-lg">
                                    <Server className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-semibold text-white">SAP Destinations</h1>
                                    <p className="text-sm text-slate-400">Manage SAP ODBC connections</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={fetchDestinations}
                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                                title="Refresh"
                            >
                                <RefreshCw className="w-5 h-5" />
                            </button>
                            <Link
                                href="/sap-destinations"
                                className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-orange-600 hover:bg-orange-500 rounded-lg transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add SAP Connection
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
                        <button
                            onClick={() => setError(null)}
                            className="ml-auto p-1 hover:bg-red-500/20 rounded"
                        >
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
                            <Server className="w-8 h-8 text-slate-500" />
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">No SAP Connections</h3>
                        <p className="text-slate-400 mb-6">
                            Add your first SAP ODBC connection to start querying SAP HANA databases.
                        </p>
                        <Link
                            href="/sap-destinations"
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-white bg-orange-600 hover:bg-orange-500 rounded-lg transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add SAP Connection
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {destinations.map((dest) => (
                            <div
                                key={dest.id}
                                className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-lg ${dest.status === 'active' ? 'bg-orange-500/20' : 'bg-slate-700'}`}>
                                            <Server className={`w-5 h-5 ${dest.status === 'active' ? 'text-orange-400' : 'text-slate-400'}`} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-lg font-medium text-white">{dest.name}</h3>
                                                <span className={`px-2 py-0.5 text-xs rounded-full ${dest.status === 'active'
                                                    ? 'bg-emerald-500/20 text-emerald-400'
                                                    : 'bg-slate-700 text-slate-400'
                                                    }`}>
                                                    {dest.status}
                                                </span>
                                            </div>
                                            {dest.description && (
                                                <p className="text-sm text-slate-400 mt-1">{dest.description}</p>
                                            )}
                                            <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                                                <span>DSN: <span className="text-slate-300">{dest.dsn_name}</span></span>
                                                <span>User: <span className="text-slate-300">{dest.username}</span></span>
                                                <span>Timeout: <span className="text-slate-300">{dest.timeout_seconds}s</span></span>
                                                <span>Max Rows: <span className="text-slate-300">{dest.max_rows}</span></span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
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
                                                    href={`/sap-destinations?id=${dest.id}`}
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
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
