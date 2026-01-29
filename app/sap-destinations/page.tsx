'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    ArrowLeft,
    Server,
    Save,
    Loader2,
    AlertCircle,
    X,
    CheckCircle,
    Plug,
} from 'lucide-react';

interface SapDestinationFormData {
    name: string;
    description: string;
    dsn_name: string;
    host: string;
    port: number;
    database_name: string; // For SAP HANA MDC (Multitenant)
    username: string;
    password: string;
    timeout_seconds: number;
    max_rows: number;
}

export default function SapDestinationForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get('id');
    const isEdit = !!editId;

    const [formData, setFormData] = useState<SapDestinationFormData>({
        name: '',
        description: '',
        dsn_name: '',
        host: '',
        port: 30015,
        database_name: '',
        username: '',
        password: '',
        timeout_seconds: 30,
        max_rows: 1000,
    });

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(isEdit);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [testingConnection, setTestingConnection] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

    useEffect(() => {
        if (editId) {
            fetchDestination(editId);
        }
    }, [editId]);

    const fetchDestination = async (id: string) => {
        try {
            setLoadingData(true);
            const token = localStorage.getItem('nexus_token');
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/sap-destinations/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch SAP destination');
            }

            const data = await response.json();
            if (data.success && data.data) {
                setFormData({
                    name: data.data.name || '',
                    description: data.data.description || '',
                    dsn_name: data.data.dsn_name || '',
                    host: data.data.host || '',
                    port: data.data.port || 30015,
                    database_name: data.data.database_name || '',
                    username: data.data.username || '',
                    password: '', // Don't show password
                    timeout_seconds: data.data.timeout_seconds || 30,
                    max_rows: data.data.max_rows || 1000,
                });
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load destination');
        } finally {
            setLoadingData(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const token = localStorage.getItem('nexus_token');
            const url = isEdit
                ? `${process.env.NEXT_PUBLIC_API_URL}/api/sap-destinations/${editId}`
                : `${process.env.NEXT_PUBLIC_API_URL}/api/sap-destinations`;

            const body = isEdit
                ? {
                    name: formData.name,
                    description: formData.description || null,
                    dsn_name: formData.dsn_name,
                    host: formData.host,
                    port: formData.port,
                    database_name: formData.database_name || null,
                    username: formData.username,
                    password: formData.password || undefined, // Only send if changed
                    timeout_seconds: formData.timeout_seconds,
                    max_rows: formData.max_rows,
                }
                : formData;

            const response = await fetch(url, {
                method: isEdit ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to save SAP destination');
            }

            setSuccess(isEdit ? 'SAP destination updated!' : 'SAP destination created!');
            setTimeout(() => {
                router.push('/sap-destinations/list');
            }, 1000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value) || 0 : value,
        }));
    };

    const testConnection = async () => {
        setTestingConnection(true);
        setTestResult(null);

        try {
            const token = localStorage.getItem('nexus_token');
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/sap-destinations/test`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        host: formData.host,
                        port: formData.port,
                        database_name: formData.database_name || null,
                        username: formData.username,
                        password: formData.password,
                        timeout_seconds: formData.timeout_seconds,
                    }),
                }
            );

            const data = await response.json();
            setTestResult({
                success: data.success,
                message: data.message || (data.success ? 'Connection successful!' : 'Connection failed'),
            });
        } catch (err) {
            setTestResult({
                success: false,
                message: err instanceof Error ? err.message : 'Connection test failed',
            });
        } finally {
            setTestingConnection(false);
        }
    };

    if (loadingData) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Header */}
            <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/sap-destinations/list"
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-600 rounded-lg">
                                <Server className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-white">
                                    {isEdit ? 'Edit SAP Connection' : 'New SAP Connection'}
                                </h1>
                                <p className="text-sm text-slate-400">
                                    Configure SAP HANA ODBC connection
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-8">
                {/* Messages */}
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

                {success && (
                    <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-3 text-emerald-400">
                        <CheckCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{success}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <h2 className="text-lg font-medium text-white mb-4">Connection Details</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Name <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="SAP HANA Production"
                                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={2}
                                    placeholder="Production SAP HANA database for materials data"
                                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ODBC Settings */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <h2 className="text-lg font-medium text-white mb-4">Connection Settings</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    DSN Name <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="dsn_name"
                                    value={formData.dsn_name}
                                    onChange={handleChange}
                                    required
                                    placeholder="SAPHANA_PROD"
                                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                                <p className="mt-1 text-xs text-slate-500">
                                    The ODBC Data Source Name configured in /etc/odbc.ini
                                </p>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Host <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="host"
                                        value={formData.host}
                                        onChange={handleChange}
                                        required
                                        placeholder="hana.example.com"
                                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Port <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="port"
                                        value={formData.port}
                                        onChange={handleChange}
                                        required
                                        min={1}
                                        max={65535}
                                        placeholder="30015"
                                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Database Name
                                    <span className="ml-2 text-xs text-slate-500">(for MDC / Multitenant)</span>
                                </label>
                                <input
                                    type="text"
                                    name="database_name"
                                    value={formData.database_name}
                                    onChange={handleChange}
                                    placeholder="TENANT_DB"
                                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                                <p className="mt-1 text-xs text-slate-500">
                                    Leave empty to connect to SYSTEMDB. For tenant databases (Single Container in DBeaver), enter the tenant database name.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Username <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        required
                                        placeholder="SAPUSER"
                                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Password {!isEdit && <span className="text-red-400">*</span>}
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required={!isEdit}
                                        placeholder={isEdit ? '••••••••' : 'Enter password'}
                                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    />
                                    {isEdit && (
                                        <p className="mt-1 text-xs text-slate-500">
                                            Leave empty to keep current password
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Test Connection Button */}
                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={testConnection}
                                    disabled={testingConnection || !formData.host || !formData.username || (!isEdit && !formData.password)}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-orange-400 border border-orange-500/50 hover:bg-orange-500/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                                >
                                    {testingConnection ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Testing...
                                        </>
                                    ) : (
                                        <>
                                            <Plug className="w-4 h-4" />
                                            Test Connection
                                        </>
                                    )}
                                </button>

                                {testResult && (
                                    <div className={`mt-3 p-3 rounded-lg flex items-center gap-2 text-sm ${testResult.success
                                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                                        : 'bg-red-500/10 border border-red-500/30 text-red-400'
                                        }`}>
                                        {testResult.success ? (
                                            <CheckCircle className="w-4 h-4 flex-shrink-0" />
                                        ) : (
                                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                        )}
                                        <span>{testResult.message}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Options */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <h2 className="text-lg font-medium text-white mb-4">Options</h2>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Timeout (seconds)
                                </label>
                                <input
                                    type="number"
                                    name="timeout_seconds"
                                    value={formData.timeout_seconds}
                                    onChange={handleChange}
                                    min={1}
                                    max={300}
                                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Max Rows
                                </label>
                                <input
                                    type="number"
                                    name="max_rows"
                                    value={formData.max_rows}
                                    onChange={handleChange}
                                    min={1}
                                    max={100000}
                                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                                <p className="mt-1 text-xs text-slate-500">
                                    Maximum rows returned per query
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3">
                        <Link
                            href="/sap-destinations/list"
                            className="px-6 py-3 text-sm text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-3 text-sm text-white bg-orange-600 hover:bg-orange-500 disabled:bg-orange-600/50 disabled:cursor-not-allowed rounded-lg transition-colors"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    {isEdit ? 'Update Connection' : 'Create Connection'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
