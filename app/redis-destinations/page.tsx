'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    ArrowLeft,
    Zap,
    Save,
    Loader2,
    AlertCircle,
    X,
    CheckCircle,
    Plug,
    Shield,
} from 'lucide-react';
import {
    fetchRedisDestinationById,
    createRedisDestination,
    updateRedisDestination,
    testRedisConnection,
} from '@/app/lib/api';

interface RedisDestinationFormData {
    name: string;
    description: string;
    host: string;
    port: number;
    password: string;
    databaseNumber: number;
    useTls: boolean;
}

export default function RedisDestinationForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get('id');
    const isEdit = !!editId;

    const [formData, setFormData] = useState<RedisDestinationFormData>({
        name: '',
        description: '',
        host: 'localhost',
        port: 6379,
        password: '',
        databaseNumber: 0,
        useTls: false,
    });

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(isEdit);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [testingConnection, setTestingConnection] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string; latency?: string } | null>(null);

    useEffect(() => {
        if (editId) {
            loadDestination(Number(editId));
        }
    }, [editId]);

    const loadDestination = async (id: number) => {
        try {
            setLoadingData(true);
            const data = await fetchRedisDestinationById(id);
            if (data.success && data.data) {
                setFormData({
                    name: data.data.name || '',
                    description: data.data.description || '',
                    host: data.data.host || '',
                    port: data.data.port || 6379,
                    password: '', // never pre-fill password
                    databaseNumber: data.data.databaseNumber ?? 0,
                    useTls: data.data.useTls ?? false,
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
            const payload = {
                name: formData.name,
                description: formData.description || undefined,
                host: formData.host,
                port: formData.port,
                password: formData.password || undefined,
                databaseNumber: formData.databaseNumber,
                useTls: formData.useTls,
            };

            if (isEdit) {
                await updateRedisDestination(Number(editId), payload);
                setSuccess('Redis destination updated!');
            } else {
                await createRedisDestination(payload);
                setSuccess('Redis destination created!');
            }

            setTimeout(() => {
                router.push('/redis-destinations/list');
            }, 1000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData((prev) => ({ ...prev, [name]: checked }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: type === 'number' ? (parseInt(value) || 0) : value,
            }));
        }
    };

    const handleTestConnection = async () => {
        setTestingConnection(true);
        setTestResult(null);

        try {
            const result = await testRedisConnection({
                host: formData.host,
                port: formData.port,
                password: formData.password || undefined,
                databaseNumber: formData.databaseNumber,
                useTls: formData.useTls,
            });
            setTestResult(result);
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
                <Loader2 className="w-8 h-8 text-red-400 animate-spin" />
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
                            href="/redis-destinations/list"
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-600 rounded-lg">
                                <Zap className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-white">
                                    {isEdit ? 'Edit Redis Connection' : 'New Redis Connection'}
                                </h1>
                                <p className="text-sm text-slate-400">
                                    Configure external Redis server connection
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
                        <button onClick={() => setError(null)} className="ml-auto p-1 hover:bg-red-500/20 rounded">
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
                        <h2 className="text-lg font-medium text-white mb-4">Basic Information</h2>

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
                                    placeholder="Redis Production"
                                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                                    placeholder="Production Redis cache server"
                                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Connection Settings */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <h2 className="text-lg font-medium text-white mb-4">Connection Settings</h2>

                        <div className="space-y-4">
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
                                        placeholder="redis.example.com"
                                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                                        placeholder="6379"
                                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder={isEdit ? '••••••••' : 'Leave empty if none'}
                                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    />
                                    {isEdit && (
                                        <p className="mt-1 text-xs text-slate-500">Leave empty to keep current password</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Database Number
                                    </label>
                                    <input
                                        type="number"
                                        name="databaseNumber"
                                        value={formData.databaseNumber}
                                        onChange={handleChange}
                                        min={0}
                                        max={15}
                                        placeholder="0"
                                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    />
                                    <p className="mt-1 text-xs text-slate-500">Redis DB index (0–15)</p>
                                </div>
                            </div>

                            {/* TLS toggle */}
                            <div className="flex items-center gap-3 pt-2">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="useTls"
                                        checked={formData.useTls}
                                        onChange={handleChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                                </label>
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm text-slate-300">Use TLS / SSL connection</span>
                                </div>
                            </div>

                            {/* Test Connection */}
                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={handleTestConnection}
                                    disabled={testingConnection || !formData.host}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 border border-red-500/50 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
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
                                        {testResult.latency && (
                                            <span className="ml-auto text-slate-400">{testResult.latency}</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3">
                        <Link
                            href="/redis-destinations/list"
                            className="px-6 py-3 text-sm text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-3 text-sm text-white bg-red-600 hover:bg-red-500 disabled:bg-red-600/50 disabled:cursor-not-allowed rounded-lg transition-colors"
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
