'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    Bot,
    Plus,
    Trash2,
    RefreshCw,
    X,
    Settings2,
    Wrench,
    Brain,
    Zap,
    ChevronDown,
    ChevronUp,
    Globe,
    Database,
    TerminalSquare,
    Workflow,
    AlertCircle,
    CheckCircle,
    Loader2,
    Sparkles,
} from 'lucide-react';
import {
    fetchAIAgents,
    fetchAIAgentById,
    createAIAgent,
    deleteAIAgent,
    addAIAgentTool,
    deleteAIAgentTool,
    fetchAIProviders,
    type AIAgent,
    type AIAgentTool,
    type CreateAIAgentPayload,
    type CreateAIAgentToolPayload,
    type AIProvider,
    type AIProviderType,
} from '@/app/lib/api';

// Hardcoded model options
const MODEL_OPTIONS: { value: string; label: string }[] = [
    { value: 'claude-opus-4-6', label: 'Claude Opus 4 (Anthropic)' },
    { value: 'gemini-3-flash', label: 'Gemini 3 Flash (Google)' },
    { value: 'gpt-5.2-chat-latest', label: 'GPT-5.2 Chat Latest (OpenAI)' },
];

const TOOL_TYPES = [
    { value: 'rest_call', label: 'REST API Call', icon: Globe, color: 'text-orange-400' },
    { value: 'db_query', label: 'Database Query', icon: Database, color: 'text-teal-400' },
    { value: 'redis_command', label: 'Redis Command', icon: TerminalSquare, color: 'text-red-400' },
    { value: 'workflow', label: 'Sub-Workflow', icon: Workflow, color: 'text-blue-400' },
];

export default function AIAgentsPage() {
    const [agents, setAgents] = useState<AIAgent[]>([]);
    const [providers, setProviders] = useState<AIProvider[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showToolModal, setShowToolModal] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);
    const [expandedAgent, setExpandedAgent] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Create form
    const [form, setForm] = useState<CreateAIAgentPayload>({
        name: '',
        aiProviderId: 0,
        systemPrompt: 'You are a helpful AI assistant.',
        temperature: 0.7,
        maxTokens: 4096,
        maxIterations: 10,
        memoryEnabled: true,
        memoryType: 'redis',
        memoryTtl: 3600,
        memoryMaxMessages: 50,
        outputType: 'text',
    });

    // Tool form
    const [toolForm, setToolForm] = useState<CreateAIAgentToolPayload>({
        toolName: '',
        toolDescription: '',
        toolType: 'rest_call',
    });

    useEffect(() => { loadData(); }, []);

    async function loadData() {
        setIsLoading(true);
        try {
            const [agentsRes, providersRes] = await Promise.all([
                fetchAIAgents(),
                fetchAIProviders(),
            ]);
            if (agentsRes.success) setAgents(agentsRes.data || []);
            if (providersRes.success) setProviders(providersRes.data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleCreateAgent() {
        if (!form.name.trim() || !form.aiProviderId) {
            setError('Name and AI Provider are required');
            return;
        }
        try {
            const res = await createAIAgent(form);
            if (res.success) {
                setSuccess('AI Agent created!');
                setShowCreateModal(false);
                setForm({
                    name: '', aiProviderId: 0, systemPrompt: 'You are a helpful AI assistant.',
                    temperature: 0.7, maxTokens: 4096, maxIterations: 10,
                    memoryEnabled: true, memoryType: 'redis', memoryTtl: 3600, memoryMaxMessages: 50, outputType: 'text',
                });
                loadData();
                setTimeout(() => setSuccess(null), 3000);
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to create agent');
        }
    }

    async function handleDeleteAgent(id: number) {
        if (!confirm('Delete this AI Agent and all its tools?')) return;
        try {
            await deleteAIAgent(id);
            setSuccess('Agent deleted');
            loadData();
            setTimeout(() => setSuccess(null), 3000);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to delete');
        }
    }

    async function toggleExpand(agentId: number) {
        if (expandedAgent === agentId) {
            setExpandedAgent(null);
            setSelectedAgent(null);
            return;
        }
        try {
            const res = await fetchAIAgentById(agentId);
            if (res.success && res.data) {
                setSelectedAgent(res.data);
                setExpandedAgent(agentId);
            }
        } catch (e) {
            console.error(e);
        }
    }

    async function handleAddTool() {
        if (!selectedAgent || !toolForm.toolName.trim() || !toolForm.toolDescription.trim()) {
            setError('Tool name and description are required');
            return;
        }
        try {
            await addAIAgentTool(selectedAgent.id, toolForm);
            setShowToolModal(false);
            setToolForm({ toolName: '', toolDescription: '', toolType: 'rest_call' });
            // Refresh agent
            const res = await fetchAIAgentById(selectedAgent.id);
            if (res.success && res.data) setSelectedAgent(res.data);
            setSuccess('Tool added!');
            setTimeout(() => setSuccess(null), 3000);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to add tool');
        }
    }

    async function handleDeleteTool(toolId: number) {
        if (!selectedAgent) return;
        try {
            await deleteAIAgentTool(selectedAgent.id, toolId);
            const res = await fetchAIAgentById(selectedAgent.id);
            if (res.success && res.data) setSelectedAgent(res.data);
        } catch (e) {
            console.error(e);
        }
    }

    function getToolIcon(toolType: string) {
        const found = TOOL_TYPES.find(t => t.value === toolType);
        if (!found) return Globe;
        return found.icon;
    }

    function getToolColor(toolType: string) {
        const found = TOOL_TYPES.find(t => t.value === toolType);
        return found?.color || 'text-slate-400';
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950">
            {/* Header */}
            <div className="border-b border-white/10 backdrop-blur-xl bg-white/5">
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                <ArrowLeft className="w-5 h-5 text-white/70" />
                            </Link>
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
                                    <Bot className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-semibold text-white">AI Agents</h1>
                                    <p className="text-xs text-white/50">Manage autonomous AI agents with tools</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={loadData} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Refresh">
                                <RefreshCw className={`w-5 h-5 text-white/70 ${isLoading ? 'animate-spin' : ''}`} />
                            </button>
                            <button
                                onClick={() => { setShowCreateModal(true); setError(null); }}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg font-medium shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all"
                            >
                                <Plus className="w-4 h-4" />
                                New AI Agent
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Messages */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-400">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{error}</span>
                        <button onClick={() => setError(null)} className="ml-auto p-1 hover:bg-red-500/20 rounded"><X className="w-4 h-4" /></button>
                    </div>
                )}
                {success && (
                    <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-3 text-emerald-400">
                        <CheckCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{success}</span>
                    </div>
                )}

                {/* Info Banner */}
                <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20">
                    <div className="flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-violet-400 mt-0.5" />
                        <div>
                            <h3 className="text-white font-medium">AI Agent Objects</h3>
                            <p className="text-white/70 text-sm mt-1">
                                Create autonomous AI agents with tools (REST APIs, DB queries, Redis, sub-workflows).
                                Agents use a ReAct loop: reason → pick a tool → execute → reason again → final answer.
                                Add agents to workflow steps using the <code className="bg-white/10 px-1 rounded">AI Agent</code> step type.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Agents List */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
                    </div>
                ) : agents.length === 0 ? (
                    <div className="text-center py-16 text-white/50">
                        <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">No AI agents configured</p>
                        <p className="text-sm mt-2">Create an AI Agent to add autonomous reasoning to your workflows</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {agents.map(agent => {
                            const isExpanded = expandedAgent === agent.id;
                            return (
                                <div key={agent.id} className="rounded-xl bg-white/5 border border-white/10 overflow-hidden hover:border-violet-500/30 transition-all">
                                    {/* Agent Header */}
                                    <div
                                        className="flex items-center gap-4 p-4 cursor-pointer"
                                        onClick={() => toggleExpand(agent.id)}
                                    >
                                        <div className="p-2 rounded-lg bg-violet-500/20">
                                            <Brain className={`w-5 h-5 ${agent.isActive ? 'text-violet-400' : 'text-slate-500'}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-white font-medium">{agent.name}</h3>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${agent.isActive ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                                    {agent.isActive ? 'active' : 'inactive'}
                                                </span>
                                            </div>
                                            {agent.description && <p className="text-white/50 text-sm truncate">{agent.description}</p>}
                                            <div className="flex gap-4 text-xs text-white/40 mt-1">
                                                <span>Provider: <span className="text-white/70">{agent.providerName || 'N/A'}</span></span>
                                                <span>Model: <span className="text-white/70">{agent.model || 'default'}</span></span>
                                                <span>Max Iter: <span className="text-white/70">{agent.maxIterations}</span></span>
                                                <span>Memory: <span className="text-white/70">{agent.memoryEnabled ? 'On' : 'Off'}</span></span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteAgent(agent.id); }}
                                                className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-400/70" />
                                            </button>
                                            {isExpanded ? <ChevronUp className="w-5 h-5 text-white/50" /> : <ChevronDown className="w-5 h-5 text-white/50" />}
                                        </div>
                                    </div>

                                    {/* Expanded: Tools */}
                                    {isExpanded && selectedAgent && selectedAgent.id === agent.id && (
                                        <div className="border-t border-white/10 p-4 bg-white/[0.02]">
                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div className="p-3 bg-white/5 rounded-lg">
                                                    <p className="text-xs text-white/40 mb-1">System Prompt</p>
                                                    <p className="text-sm text-white/80 line-clamp-3 font-mono">{selectedAgent.systemPrompt}</p>
                                                </div>
                                                <div className="p-3 bg-white/5 rounded-lg">
                                                    <p className="text-xs text-white/40 mb-1">Configuration</p>
                                                    <div className="grid grid-cols-2 gap-2 text-xs text-white/60">
                                                        <span>Temperature: <span className="text-white">{selectedAgent.temperature}</span></span>
                                                        <span>Max Tokens: <span className="text-white">{selectedAgent.maxTokens}</span></span>
                                                        <span>Output: <span className="text-white">{selectedAgent.outputType}</span></span>
                                                        <span>Memory TTL: <span className="text-white">{selectedAgent.memoryTtl}s</span></span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Tools */}
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-sm font-medium text-white flex items-center gap-2">
                                                    <Wrench className="w-4 h-4 text-violet-400" />
                                                    Tools ({selectedAgent.tools?.length || 0})
                                                </h4>
                                                <button
                                                    onClick={() => { setShowToolModal(true); setError(null); }}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-violet-500/20 hover:bg-violet-500/30 text-violet-400 rounded-lg text-sm transition-colors"
                                                >
                                                    <Plus className="w-3 h-3" /> Add Tool
                                                </button>
                                            </div>

                                            {(!selectedAgent.tools || selectedAgent.tools.length === 0) ? (
                                                <p className="text-white/40 text-sm p-3 bg-white/5 rounded-lg">
                                                    No tools configured. The agent will respond directly without tool use.
                                                </p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {selectedAgent.tools.map(tool => {
                                                        const ToolIcon = getToolIcon(tool.toolType);
                                                        return (
                                                            <div key={tool.id} className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg">
                                                                <div className="p-1.5 bg-white/10 rounded-lg">
                                                                    <ToolIcon className={`w-4 h-4 ${getToolColor(tool.toolType)}`} />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-white font-medium text-sm">{tool.toolName}</p>
                                                                    <p className="text-white/50 text-xs truncate">{tool.toolDescription}</p>
                                                                </div>
                                                                <span className="text-xs px-2 py-0.5 bg-white/10 text-white/60 rounded">
                                                                    {TOOL_TYPES.find(t => t.value === tool.toolType)?.label || tool.toolType}
                                                                </span>
                                                                <button
                                                                    onClick={() => handleDeleteTool(tool.id)}
                                                                    className="p-1 hover:bg-red-500/20 rounded transition-colors"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5 text-red-400/70" />
                                                                </button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Create Agent Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-slate-800 border border-white/10 rounded-xl w-full max-w-lg p-6 mx-4 max-h-[85vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Bot className="w-5 h-5 text-violet-400" /> Create AI Agent
                            </h2>
                            <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                                <X className="w-5 h-5 text-white/50" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-white/70 text-sm mb-2">Name <span className="text-red-400">*</span></label>
                                <input type="text" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                                    placeholder="Customer Support Agent" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50" />
                            </div>
                            <div>
                                <label className="block text-white/70 text-sm mb-2">Description</label>
                                <input type="text" value={form.description || ''} onChange={(e) => setForm(p => ({ ...p, description: e.target.value || undefined }))}
                                    placeholder="Handles customer inquiries using tools" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50" />
                            </div>
                            <div>
                                <label className="block text-white/70 text-sm mb-2">AI Provider <span className="text-red-400">*</span></label>
                                <select value={form.aiProviderId} onChange={(e) => setForm(p => ({ ...p, aiProviderId: Number(e.target.value) }))}
                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50">
                                    <option value={0} className="bg-slate-800">Select provider...</option>
                                    {providers.filter(p => p.status === 'active').map(p => (
                                        <option key={p.id} value={p.id} className="bg-slate-800">{p.name} ({p.providerType})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-white/70 text-sm mb-2">Model</label>
                                <select value={form.model || ''} onChange={(e) => setForm(p => ({ ...p, model: e.target.value || undefined }))}
                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50">
                                    <option value="" className="bg-slate-800">Use provider default</option>
                                    {MODEL_OPTIONS.map(m => (
                                        <option key={m.value} value={m.value} className="bg-slate-800">{m.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-white/70 text-sm mb-2">System Prompt</label>
                                <textarea value={form.systemPrompt} onChange={(e) => setForm(p => ({ ...p, systemPrompt: e.target.value }))}
                                    rows={3} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none font-mono text-sm" />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-white/70 text-xs mb-1">Temperature</label>
                                    <input type="number" step="0.1" min="0" max="2" value={form.temperature} onChange={(e) => setForm(p => ({ ...p, temperature: parseFloat(e.target.value) || 0.7 }))}
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50" />
                                </div>
                                <div>
                                    <label className="block text-white/70 text-xs mb-1">Max Tokens</label>
                                    <input type="number" min="100" max="32000" value={form.maxTokens} onChange={(e) => setForm(p => ({ ...p, maxTokens: parseInt(e.target.value) || 4096 }))}
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50" />
                                </div>
                                <div>
                                    <label className="block text-white/70 text-xs mb-1">Max Iterations</label>
                                    <input type="number" min="1" max="50" value={form.maxIterations} onChange={(e) => setForm(p => ({ ...p, maxIterations: parseInt(e.target.value) || 10 }))}
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-white/70 text-sm mb-2">Output Type</label>
                                <select value={form.outputType} onChange={(e) => setForm(p => ({ ...p, outputType: e.target.value }))}
                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50">
                                    <option value="text" className="bg-slate-800">Text</option>
                                    <option value="json" className="bg-slate-800">JSON</option>
                                    <option value="image" className="bg-slate-800">Image</option>
                                    <option value="video" className="bg-slate-800">Video</option>
                                </select>
                            </div>
                            <button
                                onClick={handleCreateAgent}
                                disabled={!form.name.trim() || !form.aiProviderId}
                                className={`w-full py-2.5 rounded-lg font-medium transition-all ${form.name.trim() && form.aiProviderId
                                    ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25'
                                    : 'bg-white/10 text-white/30 cursor-not-allowed'
                                    }`}
                            >
                                Create Agent
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Tool Modal */}
            {showToolModal && selectedAgent && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-slate-800 border border-white/10 rounded-xl w-full max-w-lg p-6 mx-4 max-h-[85vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <Wrench className="w-5 h-5 text-violet-400" /> Add Tool
                                </h2>
                                <p className="text-white/50 text-sm">{selectedAgent.name}</p>
                            </div>
                            <button onClick={() => setShowToolModal(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                                <X className="w-5 h-5 text-white/50" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-white/70 text-sm mb-2">Tool Name <span className="text-red-400">*</span></label>
                                <input type="text" value={toolForm.toolName} onChange={(e) => setToolForm(p => ({ ...p, toolName: e.target.value }))}
                                    placeholder="get_customer_info" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50 font-mono" />
                            </div>
                            <div>
                                <label className="block text-white/70 text-sm mb-2">Description <span className="text-red-400">*</span></label>
                                <textarea value={toolForm.toolDescription} onChange={(e) => setToolForm(p => ({ ...p, toolDescription: e.target.value }))}
                                    placeholder="Retrieves customer information by customer ID from the CRM database"
                                    rows={2} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none" />
                                <p className="text-xs text-white/40 mt-1">This is shown to the AI - be descriptive so it knows when to use this tool.</p>
                            </div>
                            <div>
                                <label className="block text-white/70 text-sm mb-2">Tool Type</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {TOOL_TYPES.map(tt => {
                                        const Icon = tt.icon;
                                        return (
                                            <button key={tt.value} onClick={() => setToolForm(p => ({ ...p, toolType: tt.value }))}
                                                className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${toolForm.toolType === tt.value
                                                    ? 'border-violet-500/50 bg-violet-500/10'
                                                    : 'border-white/10 bg-white/5 hover:border-white/20'
                                                    }`}>
                                                <Icon className={`w-4 h-4 ${tt.color}`} />
                                                <span className="text-sm text-white">{tt.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            <div>
                                <label className="block text-white/70 text-sm mb-2">Parameters Schema (optional JSON)</label>
                                <textarea value={toolForm.parametersSchema || ''} onChange={(e) => setToolForm(p => ({ ...p, parametersSchema: e.target.value || undefined }))}
                                    placeholder='{"customer_id": "string", "include_orders": "boolean"}'
                                    rows={3} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none font-mono text-sm" />
                            </div>

                            {/* Type-specific config hints */}
                            {toolForm.toolType === 'rest_call' && (
                                <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg text-sm text-orange-300">
                                    <p>Configure REST destination, method, path, etc. after creation via the API.</p>
                                </div>
                            )}
                            {toolForm.toolType === 'db_query' && (
                                <div>
                                    <label className="block text-white/70 text-sm mb-2">SQL Query</label>
                                    <textarea value={toolForm.dbQuery || ''} onChange={(e) => setToolForm(p => ({ ...p, dbQuery: e.target.value || undefined }))}
                                        placeholder="SELECT * FROM customers WHERE id = {{customer_id}}"
                                        rows={3} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none font-mono text-sm" />
                                    <p className="text-xs text-white/40 mt-1">Only SELECT queries are allowed for safety.</p>
                                </div>
                            )}
                            {toolForm.toolType === 'redis_command' && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-white/70 text-sm mb-2">Redis Command</label>
                                        <select value={toolForm.redisCommand || 'GET'} onChange={(e) => setToolForm(p => ({ ...p, redisCommand: e.target.value }))}
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50">
                                            <option value="GET" className="bg-slate-800">GET</option>
                                            <option value="HGET" className="bg-slate-800">HGET</option>
                                            <option value="HGETALL" className="bg-slate-800">HGETALL</option>
                                            <option value="KEYS" className="bg-slate-800">KEYS</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-white/70 text-sm mb-2">Key Template</label>
                                        <input type="text" value={toolForm.redisKeyTemplate || ''} onChange={(e) => setToolForm(p => ({ ...p, redisKeyTemplate: e.target.value || undefined }))}
                                            placeholder="user:{{user_id}}" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50" />
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleAddTool}
                                disabled={!toolForm.toolName.trim() || !toolForm.toolDescription.trim()}
                                className={`w-full py-2.5 rounded-lg font-medium transition-all ${toolForm.toolName.trim() && toolForm.toolDescription.trim()
                                    ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white'
                                    : 'bg-white/10 text-white/30 cursor-not-allowed'
                                    }`}
                            >
                                Add Tool
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
