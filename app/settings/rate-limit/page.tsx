'use client';

import { useState, useEffect, useCallback } from 'react';
import { Shield, Save, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { fetchGlobalRateLimit, updateGlobalRateLimit, GlobalRateLimitConfig } from '@/app/lib/api';

export default function RateLimitSettingsPage() {
    const [config, setConfig] = useState<GlobalRateLimitConfig>({
        id: 1,
        limitValue: 0,
        limitUnit: 'second',
        updatedAt: '',
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const load = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetchGlobalRateLimit();
            if (res.success && res.data) {
                setConfig(res.data);
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load config');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleSave = async () => {
        setIsSaving(true);
        setError(null);
        setSuccess(null);
        try {
            const res = await updateGlobalRateLimit(config.limitValue, config.limitUnit);
            if (res.success) {
                setSuccess('Global rate limit updated successfully!');
                if (res.data) setConfig(res.data);
            } else {
                setError(res.message || 'Failed to update');
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to update config');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Header */}
            <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-600 rounded-lg">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-white">Rate Limiting</h1>
                            <p className="text-sm text-slate-400">Configure global request limits</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || isLoading}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all
              ${!isSaving && !isLoading
                                ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                    >
                        {isSaving ? (
                            <><RefreshCw className="w-4 h-4 animate-spin" /> Saving...</>
                        ) : (
                            <><Save className="w-4 h-4" /> Save Changes</>
                        )}
                    </button>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
                {/* Alerts */}
                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}
                {success && (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                        <p className="text-emerald-400 text-sm">{success}</p>
                    </div>
                )}

                {/* Global limit card */}
                <section className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                    <h2 className="text-lg font-semibold text-white mb-1">Global (Node) Rate Limit</h2>
                    <p className="text-sm text-slate-400 mb-6">
                        Maximum total requests accepted by this Nexus node within the selected time window.
                        Set to <code className="text-emerald-400 bg-slate-800 px-1 rounded">0</code> to disable (no limit).
                    </p>

                    {isLoading ? (
                        <div className="flex items-center gap-3 text-slate-400">
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span className="text-sm">Loading config...</span>
                        </div>
                    ) : (
                        <div className="flex items-end gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Max Requests
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    value={config.limitValue}
                                    onChange={(e) =>
                                        setConfig((prev) => ({
                                            ...prev,
                                            limitValue: Math.max(0, parseInt(e.target.value) || 0),
                                        }))
                                    }
                                    placeholder="0 = no limit"
                                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                            <div className="w-52">
                                <label className="block text-sm font-medium text-slate-300 mb-2">Per</label>
                                <select
                                    value={config.limitUnit}
                                    onChange={(e) =>
                                        setConfig((prev) => ({
                                            ...prev,
                                            limitUnit: e.target.value as 'second' | 'minute',
                                        }))
                                    }
                                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="second">Per Second (RPS)</option>
                                    <option value="minute">Per Minute (RPM)</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {config.limitValue > 0 && (
                        <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                            <p className="text-amber-400 text-sm">
                                ⚠ All requests exceeding <strong>{config.limitValue}/{config.limitUnit}</strong> will receive HTTP 429 Too Many Requests.
                            </p>
                        </div>
                    )}
                    {config.limitValue === 0 && !isLoading && (
                        <div className="mt-4 p-3 bg-slate-800/60 border border-slate-700 rounded-lg">
                            <p className="text-slate-400 text-sm">✓ No global rate limit is currently active.</p>
                        </div>
                    )}
                </section>

                {/* Per-app info card */}
                <section className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                    <h2 className="text-lg font-semibold text-white mb-1">Per-App Rate Limit</h2>
                    <p className="text-sm text-slate-400">
                        Individual Sender Apps can have their own rate limits configured on the{' '}
                        <a href="/sender-apps/list" className="text-indigo-400 hover:text-indigo-300 underline">
                            Sender Apps
                        </a>{' '}
                        page. Per-app limits are enforced independently of the global limit.
                    </p>
                </section>

                {/* Algorithm info */}
                <section className="bg-slate-900/50 rounded-xl border border-slate-700 p-5">
                    <h3 className="text-sm font-semibold text-slate-300 mb-2">How it works</h3>
                    <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                        <li>Uses a <strong className="text-slate-300">Fixed Window Counter</strong> algorithm backed by Redis.</li>
                        <li>Counters reset at each time window boundary (e.g., every second or minute).</li>
                        <li>If Redis is unavailable, limits are temporarily bypassed (fail-open) to avoid outages.</li>
                        <li>Rate limit changes take effect immediately — no restart required.</li>
                    </ul>
                </section>
            </main>
        </div>
    );
}
