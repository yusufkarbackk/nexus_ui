'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    Plus,
    Trash2,
    RefreshCw,
    X,
    Power,
    PowerOff,
    AlertCircle,
    CheckCircle,
    Loader2,
    Sparkles,
    Key,
    Globe,
    Plug,
    Eye,
    EyeOff,
    Zap,
} from 'lucide-react';
import {
    fetchAIProviders,
    createAIProvider,
    deleteAIProvider,
    toggleAIProviderStatus,
    testAIProviderConnection,
    type AIProvider,
    type CreateAIProviderPayload,
    type AIProviderType,
} from '@/app/lib/api';
import { Header } from '@/app/components/Header';
import { ProtectedPage } from '@/app/components/ProtectedPage';

// Hardcoded model options per provider
const MODEL_OPTIONS: Record<AIProviderType, { value: string; label: string }[]> = {
    openai: [
        { value: 'gpt-5.2-chat-latest', label: 'GPT-5.2 Chat Latest' },
        { value: 'gpt-4o', label: 'GPT-4o' },
        { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
    ],
    gemini: [
        { value: 'gemini-3-flash', label: 'Gemini 3 Flash' },
        { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
        { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
    ],
    mcp: [],
    custom_api: [],
};

const PROVIDER_META: Record<AIProviderType, { label: string; color: string; bgColor: string; borderColor: string; description: string }> = {
    openai: { label: 'OpenAI', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30', description: 'GPT models via OpenAI API' },
    gemini: { label: 'Google Gemini', color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30', description: 'Gemini models via Google AI API' },
    mcp: { label: 'MCP Server', color: 'text-violet-400', bgColor: 'bg-violet-500/10', borderColor: 'border-violet-500/30', description: 'Connect to running MCP server via URL' },
    custom_api: { label: 'Custom API', color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30', description: 'OpenAI-compatible custom endpoint' },
};

export default function AIProvidersPage() {
    const [providers, setProviders] = useState<AIProvider[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [testing, setTesting] = useState(false);
    const [showApiKey, setShowApiKey] = useState(false);

    const [form, setForm] = useState<CreateAIProviderPayload>({
        name: '',
        providerType: 'gemini',
        apiKey: '',
        defaultModel: '',
        timeoutSeconds: 30,
        maxTokens: 4096,
    });

    useEffect(() => { loadData(); }, []);

    async function loadData() {
        setIsLoading(true);
        try {
            const res = await fetchAIProviders();
            if (res.success) setProviders(res.data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }

    function resetForm() {
        setForm({
            name: '', providerType: 'gemini', apiKey: '', defaultModel: '',
            timeoutSeconds: 30, maxTokens: 4096,
        });
        setShowApiKey(false);
    }

    async function handleCreate() {
        if (!form.name.trim()) { setError('Name is required'); return; }
        if ((form.providerType === 'openai' || form.providerType === 'gemini') && !form.apiKey?.trim()) {
            setError('API Key is required for this provider type');
            return;
        }
        if (form.providerType === 'mcp' && !form.baseUrl?.trim()) {
            setError('MCP Server URL is required');
            return;
        }
        try {
            const payload = { ...form };
            // Set default model if selected
            if (!payload.defaultModel) payload.defaultModel = undefined;
            const res = await createAIProvider(payload);
            if (res.success) {
                setSuccess('AI Provider created!');
                setShowCreateModal(false);
                resetForm();
                loadData();
                setTimeout(() => setSuccess(null), 3000);
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to create');
        }
    }

    async function handleDelete(id: number) {
        if (!confirm('Delete this AI Provider?')) return;
        try {
            await deleteAIProvider(id);
            setSuccess('Provider deleted');
            loadData();
            setTimeout(() => setSuccess(null), 3000);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to delete');
        }
    }

    async function handleToggle(id: number) {
        try {
            await toggleAIProviderStatus(id);
            loadData();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to toggle');
        }
    }

    async function handleTestConnection() {
        setTesting(true);
        try {
            const res = await testAIProviderConnection({
                providerType: form.providerType,
                baseUrl: form.baseUrl,
                apiKey: form.apiKey,
                model: form.defaultModel,
            });
            if (res.success) {
                setSuccess('Connection successful!');
                setTimeout(() => setSuccess(null), 3000);
            } else {
                setError(res.message || 'Connection failed');
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Test failed');
        } finally {
            setTesting(false);
        }
    }

    const currentModels = MODEL_OPTIONS[form.providerType] || [];
    const meta = PROVIDER_META[form.providerType];

    return (
        <ProtectedPage>
            <main className="min-h-screen bg-slate-950 flex flex-col">
                <Header />

                <div className="flex-1 max-w-5xl mx-auto px-6 py-8 w-full">
                    {/* Page Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
                                <Key className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-semibold text-white">AI Providers</h1>
                                <p className="text-sm text-slate-400">Configure LLM providers for AI Agents</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={loadData} className="p-2 hover:bg-slate-800 rounded-lg transition-colors" title="Refresh">
                                <RefreshCw className={`w-5 h-5 text-slate-400 ${isLoading ? 'animate-spin' : ''}`} />
                            </button>
                            <button
                                onClick={() => { setShowCreateModal(true); setError(null); resetForm(); }}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add Provider
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-400">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span className="text-sm">{error}</span>
                            <button onClick={() => setError(null)} className="ml-auto p-1 hover:bg-red-500/20 rounded"><X className="w-4 h-4" /></button>
                        </div>
                    )}
                    {success && (
                        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-3 text-emerald-400">
                            <CheckCircle className="w-5 h-5 flex-shrink-0" />
                            <span className="text-sm">{success}</span>
                        </div>
                    )}

                    {/* Provider List */}
                    {isLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                        </div>
                    ) : providers.length === 0 ? (
                        <div className="text-center py-16 text-slate-500">
                            <Key className="w-12 h-12 mx-auto mb-4 opacity-30" />
                            <p className="text-lg font-medium text-slate-400">No AI providers configured</p>
                            <p className="text-sm mt-2">Add an AI provider to start using AI Agents</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {providers.map(p => {
                                const pmeta = PROVIDER_META[p.providerType as AIProviderType] || PROVIDER_META.custom_api;
                                return (
                                    <div key={p.id} className={`p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-lg ${pmeta.bgColor}`}>
                                                {p.providerType === 'mcp' ? (
                                                    <Plug className={`w-5 h-5 ${pmeta.color}`} />
                                                ) : p.providerType === 'custom_api' ? (
                                                    <Globe className={`w-5 h-5 ${pmeta.color}`} />
                                                ) : (
                                                    <Sparkles className={`w-5 h-5 ${pmeta.color}`} />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-white font-medium">{p.name}</h3>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${pmeta.bgColor} ${pmeta.color}`}>
                                                        {pmeta.label}
                                                    </span>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                                        {p.status}
                                                    </span>
                                                </div>
                                                {p.description && <p className="text-slate-500 text-sm truncate">{p.description}</p>}
                                                <div className="flex gap-4 text-xs text-slate-500 mt-1">
                                                    {p.defaultModel && <span>Model: <span className="text-slate-300">{p.defaultModel}</span></span>}
                                                    {p.baseUrl && <span>URL: <span className="text-slate-300">{p.baseUrl}</span></span>}
                                                    <span>Timeout: <span className="text-slate-300">{p.timeoutSeconds}s</span></span>
                                                    <span>Max tokens: <span className="text-slate-300">{p.maxTokens}</span></span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleToggle(p.id)}
                                                    className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors"
                                                    title={p.status === 'active' ? 'Deactivate' : 'Activate'}
                                                >
                                                    {p.status === 'active'
                                                        ? <Power className="w-4 h-4 text-emerald-400" />
                                                        : <PowerOff className="w-4 h-4 text-slate-500" />
                                                    }
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(p.id)}
                                                    className="p-1.5 hover:bg-red-900/30 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-400/70" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            {/* Create Provider Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-lg p-6 mx-4 max-h-[85vh] overflow-y-auto shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Key className="w-5 h-5 text-indigo-400" /> Add AI Provider
                            </h2>
                            <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-slate-700 rounded-lg transition-colors">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Provider Type Selector */}
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-2">Provider Type</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {(Object.entries(PROVIDER_META) as [AIProviderType, typeof PROVIDER_META[AIProviderType]][]).map(([type, m]) => (
                                        <button key={type} onClick={() => setForm(p => ({ ...p, providerType: type, defaultModel: '', baseUrl: type === 'mcp' ? 'http://' : undefined }))}
                                            className={`flex flex-col items-start gap-1 p-3 rounded-lg border transition-all text-left ${form.providerType === type
                                                ? `${m.borderColor} ${m.bgColor}`
                                                : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                                                }`}>
                                            <span className={`text-sm font-medium ${form.providerType === type ? m.color : 'text-slate-300'}`}>{m.label}</span>
                                            <span className="text-[11px] text-slate-500">{m.description}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Name */}
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5">Name <span className="text-red-400">*</span></label>
                                <input type="text" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                                    placeholder={`My ${PROVIDER_META[form.providerType].label}`}
                                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5">Description</label>
                                <input type="text" value={form.description || ''} onChange={(e) => setForm(p => ({ ...p, description: e.target.value || undefined }))}
                                    placeholder="Optional description"
                                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 outline-none" />
                            </div>

                            {/* API Key — for openai, gemini */}
                            {(form.providerType === 'openai' || form.providerType === 'gemini') && (
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">API Key <span className="text-red-400">*</span></label>
                                    <div className="relative">
                                        <input
                                            type={showApiKey ? 'text' : 'password'}
                                            value={form.apiKey || ''}
                                            onChange={(e) => setForm(p => ({ ...p, apiKey: e.target.value }))}
                                            placeholder="sk-xxxxx..."
                                            className="w-full px-3 py-2 pr-10 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white font-mono placeholder-slate-500 focus:border-indigo-500 outline-none"
                                        />
                                        <button onClick={() => setShowApiKey(!showApiKey)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-700 rounded transition-colors">
                                            {showApiKey ? <EyeOff className="w-4 h-4 text-slate-500" /> : <Eye className="w-4 h-4 text-slate-500" />}
                                        </button>
                                    </div>
                                    <p className="text-[11px] text-slate-500 mt-1">Your API key is encrypted before storage.</p>
                                </div>
                            )}

                            {/* MCP Server URL */}
                            {form.providerType === 'mcp' && (
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">MCP Server URL <span className="text-red-400">*</span></label>
                                    <input type="text" value={form.baseUrl || ''} onChange={(e) => setForm(p => ({ ...p, baseUrl: e.target.value }))}
                                        placeholder="http://mcp-server:8080"
                                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white font-mono placeholder-slate-500 focus:border-violet-500 outline-none" />
                                    <p className="text-[11px] text-slate-500 mt-1">
                                        Nexus connects as MCP Client to your running MCP Server.
                                        The server exposes tools that agents can call.
                                    </p>
                                </div>
                            )}

                            {/* Custom API URL */}
                            {form.providerType === 'custom_api' && (
                                <>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Base URL <span className="text-red-400">*</span></label>
                                        <input type="text" value={form.baseUrl || ''} onChange={(e) => setForm(p => ({ ...p, baseUrl: e.target.value }))}
                                            placeholder="https://api.your-llm.com/v1"
                                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white font-mono placeholder-slate-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1.5">API Key</label>
                                        <div className="relative">
                                            <input type={showApiKey ? 'text' : 'password'} value={form.apiKey || ''} onChange={(e) => setForm(p => ({ ...p, apiKey: e.target.value }))}
                                                placeholder="Optional API key"
                                                className="w-full px-3 py-2 pr-10 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white font-mono placeholder-slate-500 outline-none" />
                                            <button onClick={() => setShowApiKey(!showApiKey)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-700 rounded">
                                                {showApiKey ? <EyeOff className="w-4 h-4 text-slate-500" /> : <Eye className="w-4 h-4 text-slate-500" />}
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Default Model Dropdown */}
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5">Default Model</label>
                                {currentModels.length > 0 ? (
                                    <select value={form.defaultModel || ''} onChange={(e) => setForm(p => ({ ...p, defaultModel: e.target.value || undefined }))}
                                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:border-indigo-500 outline-none">
                                        <option value="">Select model...</option>
                                        {currentModels.map(m => (
                                            <option key={m.value} value={m.value}>{m.label} ({m.value})</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input type="text" value={form.defaultModel || ''} onChange={(e) => setForm(p => ({ ...p, defaultModel: e.target.value || undefined }))}
                                        placeholder={form.providerType === 'mcp' ? 'N/A for MCP' : 'Enter model name'}
                                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 outline-none"
                                        disabled={form.providerType === 'mcp'}
                                    />
                                )}
                            </div>

                            {/* Timeout + Max Tokens */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Timeout (s)</label>
                                    <input type="number" min="1" max="300" value={form.timeoutSeconds || 30}
                                        onChange={(e) => setForm(p => ({ ...p, timeoutSeconds: parseInt(e.target.value) || 30 }))}
                                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Max Tokens</label>
                                    <input type="number" min="100" max="1000000" value={form.maxTokens || 4096}
                                        onChange={(e) => setForm(p => ({ ...p, maxTokens: parseInt(e.target.value) || 4096 }))}
                                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white outline-none" />
                                </div>
                            </div>

                            {/* MCP Info Banner */}
                            {form.providerType === 'mcp' && (
                                <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-lg">
                                    <div className="flex items-start gap-2">
                                        <Plug className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" />
                                        <div className="text-sm text-violet-300">
                                            <p className="font-medium">MCP Server (Option A — URL)</p>
                                            <ul className="text-xs text-violet-300/70 mt-1 space-y-1">
                                                <li>• Nexus acts as <strong>MCP Client</strong></li>
                                                <li>• Connects to your running MCP Server via HTTP/SSE</li>
                                                <li>• Request-Response pattern: Nexus sends request → MCP Server responds</li>
                                                <li>• MCP Server exposes tools that AI Agents can discover and call</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={handleTestConnection}
                                    disabled={testing}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-slate-600 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors disabled:opacity-50"
                                >
                                    {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                                    Test Connection
                                </button>
                                <button
                                    onClick={handleCreate}
                                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                    Create Provider
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </ProtectedPage>
    );
}
