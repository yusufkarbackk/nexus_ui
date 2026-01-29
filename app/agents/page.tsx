'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Plus,
    Copy,
    Check,
    Server,
    ArrowLeft,
    RefreshCw,
    Trash2,
    Settings,
    Activity,
    X,
    Cpu,
    Link2,
    Unlink,
} from 'lucide-react';
import {
    fetchAgents,
    createAgent,
    deleteAgent,
    fetchAgentById,
    fetchApplications,
    assignAppToAgent,
    unassignAppFromAgent,
    Agent,
    AgentApp,
    Application,
} from '@/app/lib/api';

export default function AgentsPage() {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
    const [newAgentName, setNewAgentName] = useState('');
    const [newAgentDesc, setNewAgentDesc] = useState('');
    const [newAgentType, setNewAgentType] = useState('');
    const [copiedToken, setCopiedToken] = useState<number | null>(null);
    const [createdAgent, setCreatedAgent] = useState<Agent | null>(null);
    const [assignedApps, setAssignedApps] = useState<AgentApp[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setIsLoading(true);
        try {
            const [agentsRes, appsRes] = await Promise.all([
                fetchAgents(),
                fetchApplications(),
            ]);
            if (agentsRes.success && agentsRes.data) {
                setAgents(agentsRes.data);
            }
            if (appsRes.success && appsRes.data) {
                setApplications(appsRes.data);
            }
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleCreateAgent() {
        if (!newAgentName.trim()) return;
        try {
            const response = await createAgent({
                name: newAgentName,
                description: newAgentDesc || undefined,
                agent_type: newAgentType || undefined,
            });
            if (response.success && response.data) {
                setCreatedAgent(response.data);
                setNewAgentName('');
                setNewAgentDesc('');
                setNewAgentType('');
                loadData();
            }
        } catch (error) {
            console.error('Failed to create agent:', error);
        }
    }

    async function handleDeleteAgent(id: number) {
        if (!confirm('Are you sure you want to delete this agent?')) return;
        try {
            await deleteAgent(id);
            loadData();
        } catch (error) {
            console.error('Failed to delete agent:', error);
        }
    }

    async function copyToken(token: string, agentId: number) {
        await navigator.clipboard.writeText(token);
        setCopiedToken(agentId);
        setTimeout(() => setCopiedToken(null), 2000);
    }

    async function openAssignModal(agent: Agent) {
        setSelectedAgent(agent);
        try {
            const response = await fetchAgentById(agent.id);
            if (response.success && response.data?.apps) {
                setAssignedApps(response.data.apps);
            } else {
                setAssignedApps([]);
            }
        } catch (error) {
            console.error('Failed to fetch agent apps:', error);
            setAssignedApps([]);
        }
        setShowAssignModal(true);
    }

    async function handleAssignApp(appId: number) {
        if (!selectedAgent) return;
        try {
            await assignAppToAgent(selectedAgent.id, appId);
            const response = await fetchAgentById(selectedAgent.id);
            if (response.success && response.data?.apps) {
                setAssignedApps(response.data.apps);
            }
            loadData();
        } catch (error) {
            console.error('Failed to assign app:', error);
        }
    }

    async function handleUnassignApp(appId: number) {
        if (!selectedAgent) return;
        try {
            await unassignAppFromAgent(selectedAgent.id, appId);
            const response = await fetchAgentById(selectedAgent.id);
            if (response.success && response.data?.apps) {
                setAssignedApps(response.data.apps);
            }
            loadData();
        } catch (error) {
            console.error('Failed to unassign app:', error);
        }
    }

    function getStatusColor(status: string) {
        switch (status) {
            case 'active': return 'bg-green-500/20 text-green-400';
            case 'inactive': return 'bg-yellow-500/20 text-yellow-400';
            case 'revoked': return 'bg-red-500/20 text-red-400';
            default: return 'bg-white/10 text-white/50';
        }
    }

    function formatDate(dateStr: string | null) {
        if (!dateStr) return 'Never';
        return new Date(dateStr).toLocaleString();
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Header */}
            <div className="border-b border-white/10 backdrop-blur-xl bg-white/5">
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/"
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-white/70" />
                            </Link>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25">
                                    <Cpu className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-semibold text-white">Agents</h1>
                                    <p className="text-xs text-white/50">Manage auto-sync agents</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={loadData}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                title="Refresh"
                            >
                                <RefreshCw className={`w-5 h-5 text-white/70 ${isLoading ? 'animate-spin' : ''}`} />
                            </button>
                            <button
                                onClick={() => {
                                    setShowCreateModal(true);
                                    setCreatedAgent(null);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-medium shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all"
                            >
                                <Plus className="w-4 h-4" />
                                New Agent
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Info Banner */}
                <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
                    <div className="flex items-start gap-3">
                        <Activity className="w-5 h-5 text-cyan-400 mt-0.5" />
                        <div>
                            <h3 className="text-white font-medium">Auto-Sync Agents</h3>
                            <p className="text-white/70 text-sm mt-1">
                                Create an agent, assign sender apps, and use the generated token in your agent's <code className="bg-white/10 px-1 rounded">config.yml</code>.
                                The agent will automatically sync app credentials from this server.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Agents Grid */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
                    </div>
                ) : agents.length === 0 ? (
                    <div className="text-center py-16 text-white/50">
                        <Server className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">No agents configured</p>
                        <p className="text-sm mt-2">Create an agent to enable auto-sync</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {agents.map(agent => (
                            <div
                                key={agent.id}
                                className="rounded-xl bg-white/5 border border-white/10 p-4 hover:border-cyan-500/30 transition-all"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="text-white font-medium">{agent.name}</h3>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(agent.status)}`}>
                                            {agent.status}
                                        </span>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => openAssignModal(agent)}
                                            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                                            title="Manage Apps"
                                        >
                                            <Settings className="w-4 h-4 text-white/50" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteAgent(agent.id)}
                                            className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-400/70" />
                                        </button>
                                    </div>
                                </div>

                                {agent.description && (
                                    <p className="text-white/50 text-sm mb-3 line-clamp-2">{agent.description}</p>
                                )}

                                <div className="text-xs text-white/40 space-y-1 mb-3">
                                    <p>Apps: <span className="text-white/70">{agent.appCount || 0}</span></p>
                                    <p>Last seen: <span className="text-white/70">{formatDate(agent.lastSeenAt)}</span></p>
                                    {agent.ipAddress && <p>IP: <span className="text-white/70">{agent.ipAddress}</span></p>}
                                </div>

                                {/* Token Display */}
                                <div className="flex items-center gap-2 p-2 bg-black/30 rounded-lg">
                                    <code className="text-xs text-cyan-400 font-mono flex-1 truncate">
                                        {agent.token}
                                    </code>
                                    <button
                                        onClick={() => copyToken(agent.token, agent.id)}
                                        className="p-1 hover:bg-white/10 rounded transition-colors"
                                        title="Copy token"
                                    >
                                        {copiedToken === agent.id ? (
                                            <Check className="w-3.5 h-3.5 text-green-400" />
                                        ) : (
                                            <Copy className="w-3.5 h-3.5 text-white/50" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Agent Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-slate-800 border border-white/10 rounded-xl w-full max-w-md p-6 mx-4">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-white">
                                {createdAgent ? 'Agent Created!' : 'Create New Agent'}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setCreatedAgent(null);
                                }}
                                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-white/50" />
                            </button>
                        </div>

                        {createdAgent ? (
                            <div className="space-y-4">
                                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                                    <p className="text-green-400 text-sm mb-2">Save this token - it won't be shown again!</p>
                                    <div className="flex items-center gap-2 p-2 bg-black/30 rounded-lg">
                                        <code className="text-sm text-cyan-400 font-mono flex-1 break-all">
                                            {createdAgent.token}
                                        </code>
                                        <button
                                            onClick={() => copyToken(createdAgent.token, createdAgent.id)}
                                            className="p-2 hover:bg-white/10 rounded transition-colors"
                                        >
                                            {copiedToken === createdAgent.id ? (
                                                <Check className="w-4 h-4 text-green-400" />
                                            ) : (
                                                <Copy className="w-4 h-4 text-white/50" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <div className="p-3 bg-white/5 rounded-lg">
                                    <p className="text-white/70 text-sm">Add this to your agent's <code className="bg-white/10 px-1 rounded">config.yml</code>:</p>
                                    <pre className="mt-2 text-xs text-cyan-300 font-mono bg-black/30 p-2 rounded overflow-x-auto">
                                        {`nexus:
  server_url: "${window.location.origin}"
  agent_token: "${createdAgent.token}"`}
                                    </pre>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setCreatedAgent(null);
                                    }}
                                    className="w-full py-2 bg-cyan-500 text-white rounded-lg font-medium hover:bg-cyan-600 transition-colors"
                                >
                                    Done
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-white/70 text-sm mb-2">Name</label>
                                    <input
                                        type="text"
                                        value={newAgentName}
                                        onChange={(e) => setNewAgentName(e.target.value)}
                                        placeholder="Production Server 1"
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-white/70 text-sm mb-2">Agent Type</label>
                                    <select
                                        value={newAgentType}
                                        onChange={(e) => setNewAgentType(e.target.value)}
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                    >
                                        <option value="" className="bg-slate-800">Select type (optional)</option>
                                        <option value="sender" className="bg-slate-800">Sender - Push data to Nexus</option>
                                        <option value="receiver" className="bg-slate-800">Receiver - Receive encrypted data</option>
                                        <option value="query" className="bg-slate-800">Query - Execute database queries</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-white/70 text-sm mb-2">Description (optional)</label>
                                    <textarea
                                        value={newAgentDesc}
                                        onChange={(e) => setNewAgentDesc(e.target.value)}
                                        placeholder="Main production server for IoT data"
                                        rows={2}
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
                                    />
                                </div>
                                <button
                                    onClick={handleCreateAgent}
                                    disabled={!newAgentName.trim()}
                                    className={`w-full py-2 rounded-lg font-medium transition-all ${newAgentName.trim()
                                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                                        : 'bg-white/10 text-white/30 cursor-not-allowed'
                                        }`}
                                >
                                    Create Agent
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Assign Apps Modal */}
            {showAssignModal && selectedAgent && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-slate-800 border border-white/10 rounded-xl w-full max-w-lg p-6 mx-4 max-h-[80vh] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-semibold text-white">Manage Apps</h2>
                                <p className="text-white/50 text-sm">{selectedAgent.name}</p>
                            </div>
                            <button
                                onClick={() => setShowAssignModal(false)}
                                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-white/50" />
                            </button>
                        </div>

                        <div className="space-y-4 overflow-y-auto flex-1">
                            {/* Assigned Apps */}
                            <div>
                                <h3 className="text-white/70 text-sm font-medium mb-2 flex items-center gap-2">
                                    <Link2 className="w-4 h-4" /> Assigned Apps ({assignedApps.length})
                                </h3>
                                {assignedApps.length === 0 ? (
                                    <p className="text-white/40 text-sm p-3 bg-white/5 rounded-lg">No apps assigned</p>
                                ) : (
                                    <div className="space-y-2">
                                        {assignedApps.map(app => (
                                            <div key={app.id} className="flex items-center justify-between p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                                                <div>
                                                    <p className="text-white font-medium">{app.name}</p>
                                                    <p className="text-white/50 text-xs font-mono">{app.appKey}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleUnassignApp(app.id)}
                                                    className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors"
                                                    title="Unassign"
                                                >
                                                    <Unlink className="w-4 h-4 text-red-400" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Available Apps */}
                            <div>
                                <h3 className="text-white/70 text-sm font-medium mb-2">Available Apps</h3>
                                <div className="space-y-2">
                                    {applications
                                        .filter(app => !assignedApps.some(a => a.id === app.id))
                                        .map(app => (
                                            <div key={app.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
                                                <div>
                                                    <p className="text-white font-medium">{app.name}</p>
                                                    <p className="text-white/50 text-xs font-mono">{app.appKey}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleAssignApp(app.id)}
                                                    className="flex items-center gap-1 px-2 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg text-sm transition-colors"
                                                >
                                                    <Plus className="w-3 h-3" /> Assign
                                                </button>
                                            </div>
                                        ))}
                                    {applications.filter(app => !assignedApps.some(a => a.id === app.id)).length === 0 && (
                                        <p className="text-white/40 text-sm p-3 bg-white/5 rounded-lg">All apps are assigned</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowAssignModal(false)}
                            className="mt-4 w-full py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
