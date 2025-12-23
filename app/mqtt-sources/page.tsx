'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Plus,
    Trash2,
    Edit2,
    RefreshCw,
    Wifi,
    WifiOff,
    AlertCircle,
    CheckCircle,
    XCircle,
    Link2,
    Settings,
    Lock,
    Copy,
    Key
} from 'lucide-react';

interface MQTTSource {
    id: number;
    name: string;
    description?: string;
    brokerUrl: string;
    username?: string;
    clientId?: string;
    useTls: boolean;
    encryptionEnabled: boolean;
    masterSecret?: string; // One-time reveal
    secretVersion: number;
    isActive: boolean;
    status: 'connected' | 'disconnected' | 'error';
    subscriptions?: MQTTSubscription[];
    createdAt: string;
}

interface MQTTSubscription {
    id: number;
    mqttSourceId: number;
    workflowId: number;
    topicPattern: string;
    qos: number;
    payloadFormat: string;
    isActive: boolean;
    workflow?: { id: number; name: string };
}

interface Workflow {
    id: number;
    name: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function MQTTSourcesPage() {
    const [sources, setSources] = useState<MQTTSource[]>([]);
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSource, setSelectedSource] = useState<MQTTSource | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [showSubModal, setShowSubModal] = useState(false);
    const [testingId, setTestingId] = useState<number | null>(null);
    const [showSecretModal, setShowSecretModal] = useState(false);
    const [newMasterSecret, setNewMasterSecret] = useState<string | null>(null);
    const [copiedSecret, setCopiedSecret] = useState(false);

    // Form state for source
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        brokerUrl: 'tcp://localhost:1883',
        username: '',
        password: '',
        clientId: '',
        useTls: false,
        encryptionEnabled: false,
        isActive: true
    });

    // Form state for subscription
    const [subFormData, setSubFormData] = useState({
        workflowId: 0,
        topicPattern: '',
        qos: 0,
        payloadFormat: 'json',
        isActive: true
    });

    const fetchSources = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/mqtt-sources`);
            const data = await response.json();
            if (data.success) {
                setSources(data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch MQTT sources:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchWorkflows = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/workflows`);
            const data = await response.json();
            if (data.success) {
                setWorkflows(data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch workflows:', error);
        }
    }, []);

    useEffect(() => {
        fetchSources();
        fetchWorkflows();
    }, [fetchSources, fetchWorkflows]);

    const handleCreateSource = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/mqtt-sources`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (data.success) {
                setShowModal(false);
                fetchSources();

                // If encryption was enabled, show the master secret (one-time)
                if (data.data?.masterSecret) {
                    setNewMasterSecret(data.data.masterSecret);
                    setShowSecretModal(true);
                }

                resetForm();
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            console.error('Failed to create source:', error);
        }
    };

    const handleUpdateSource = async () => {
        if (!selectedSource) return;
        try {
            const response = await fetch(`${API_BASE_URL}/api/mqtt-sources/${selectedSource.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (data.success) {
                setShowModal(false);
                fetchSources();
                setSelectedSource(null);
                resetForm();
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            console.error('Failed to update source:', error);
        }
    };

    const handleDeleteSource = async (id: number) => {
        if (!confirm('Delete this MQTT source? All subscriptions will also be deleted.')) return;
        try {
            const response = await fetch(`${API_BASE_URL}/api/mqtt-sources/${id}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            if (data.success) {
                fetchSources();
            }
        } catch (error) {
            console.error('Failed to delete source:', error);
        }
    };

    const handleTestConnection = async (id: number) => {
        setTestingId(id);
        try {
            const response = await fetch(`${API_BASE_URL}/api/mqtt-sources/${id}/test`, {
                method: 'POST'
            });
            const data = await response.json();
            if (data.success) {
                alert(`Connection successful! Latency: ${data.latency}`);
            } else {
                alert(`Connection failed: ${data.message}`);
            }
            fetchSources();
        } catch (error) {
            console.error('Failed to test connection:', error);
        } finally {
            setTestingId(null);
        }
    };

    const handleCreateSubscription = async () => {
        if (!selectedSource) return;
        try {
            const response = await fetch(`${API_BASE_URL}/api/mqtt-sources/${selectedSource.id}/subscriptions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(subFormData)
            });
            const data = await response.json();
            if (data.success) {
                setShowSubModal(false);
                loadSourceDetails(selectedSource.id);
                setSubFormData({ workflowId: 0, topicPattern: '', qos: 0, payloadFormat: 'json', isActive: true });
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            console.error('Failed to create subscription:', error);
        }
    };

    const handleDeleteSubscription = async (subId: number) => {
        if (!confirm('Delete this subscription?')) return;
        try {
            const response = await fetch(`${API_BASE_URL}/api/mqtt-subscriptions/${subId}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            if (data.success && selectedSource) {
                loadSourceDetails(selectedSource.id);
            }
        } catch (error) {
            console.error('Failed to delete subscription:', error);
        }
    };

    const loadSourceDetails = async (id: number) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/mqtt-sources/${id}`);
            const data = await response.json();
            if (data.success) {
                setSelectedSource(data.data);
            }
        } catch (error) {
            console.error('Failed to load source details:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            brokerUrl: 'tcp://localhost:1883',
            username: '',
            password: '',
            clientId: '',
            useTls: false,
            encryptionEnabled: false,
            isActive: true
        });
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedSecret(true);
            setTimeout(() => setCopiedSecret(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const openEditModal = (source: MQTTSource) => {
        setSelectedSource(source);
        setFormData({
            name: source.name,
            description: source.description || '',
            brokerUrl: source.brokerUrl,
            username: source.username || '',
            password: '',
            clientId: source.clientId || '',
            useTls: source.useTls,
            isActive: source.isActive
        });
        setShowModal(true);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'connected':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                        <Wifi className="w-3 h-3" /> Connected
                    </span>
                );
            case 'error':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                        <AlertCircle className="w-3 h-3" /> Error
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-slate-500/20 text-slate-400">
                        <WifiOff className="w-3 h-3" /> Disconnected
                    </span>
                );
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white">MQTT Sources</h1>
                        <p className="text-slate-400 text-sm">Connect to MQTT brokers for IoT sensor data ingestion</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={fetchSources}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
                        >
                            <RefreshCw className="w-4 h-4" /> Refresh
                        </button>
                        <button
                            onClick={() => { resetForm(); setSelectedSource(null); setShowModal(true); }}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
                        >
                            <Plus className="w-4 h-4" /> Add Source
                        </button>
                    </div>
                </div>

                {/* Sources Grid */}
                {loading ? (
                    <div className="text-center py-12">
                        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-slate-400" />
                        <p className="text-slate-400 mt-2">Loading...</p>
                    </div>
                ) : sources.length === 0 ? (
                    <div className="text-center py-12 bg-slate-800/50 rounded-xl border border-slate-700">
                        <Wifi className="w-12 h-12 mx-auto text-slate-600 mb-4" />
                        <h3 className="text-lg font-medium text-slate-300">No MQTT Sources</h3>
                        <p className="text-slate-500 mb-4">Add your first MQTT broker to start ingesting sensor data</p>
                        <button
                            onClick={() => { resetForm(); setShowModal(true); }}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
                        >
                            Add MQTT Source
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sources.map(source => (
                            <div key={source.id} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700 hover:border-slate-600 transition">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="font-semibold text-white">{source.name}</h3>
                                        <p className="text-slate-400 text-sm truncate max-w-[200px]">{source.brokerUrl}</p>
                                    </div>
                                    {getStatusBadge(source.status)}
                                </div>

                                {source.description && (
                                    <p className="text-slate-500 text-sm mb-3 line-clamp-2">{source.description}</p>
                                )}

                                <div className="flex items-center gap-2 mb-4">
                                    <span className={`px-2 py-0.5 rounded text-xs ${source.isActive ? 'bg-green-500/20 text-green-400' : 'bg-slate-600/50 text-slate-400'}`}>
                                        {source.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                    {source.useTls && (
                                        <span className="px-2 py-0.5 rounded text-xs bg-blue-500/20 text-blue-400">TLS</span>
                                    )}
                                    {source.encryptionEnabled && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-amber-500/20 text-amber-400">
                                            <Lock className="w-3 h-3" /> Encrypted
                                        </span>
                                    )}
                                </div>

                                <div className="flex gap-2 pt-3 border-t border-slate-700">
                                    <button
                                        onClick={() => loadSourceDetails(source.id)}
                                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition"
                                    >
                                        <Settings className="w-4 h-4" /> Manage
                                    </button>
                                    <button
                                        onClick={() => handleTestConnection(source.id)}
                                        disabled={testingId === source.id}
                                        className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition disabled:opacity-50"
                                    >
                                        {testingId === source.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                                    </button>
                                    <button
                                        onClick={() => openEditModal(source)}
                                        className="flex items-center justify-center px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteSource(source.id)}
                                        className="flex items-center justify-center px-3 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg text-sm transition"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Source Details Panel */}
                {selectedSource && !showModal && (
                    <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-slate-900 border-l border-slate-700 p-6 overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold">{selectedSource.name}</h2>
                            <button onClick={() => setSelectedSource(null)} className="text-slate-400 hover:text-white">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="text-slate-400 text-sm">Broker URL</label>
                                <p className="text-white">{selectedSource.brokerUrl}</p>
                            </div>
                            <div>
                                <label className="text-slate-400 text-sm">Status</label>
                                <div className="mt-1">{getStatusBadge(selectedSource.status)}</div>
                            </div>
                        </div>

                        {/* Subscriptions */}
                        <div className="border-t border-slate-700 pt-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold">Topic Subscriptions</h3>
                                <button
                                    onClick={() => setShowSubModal(true)}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded text-sm transition"
                                >
                                    <Plus className="w-4 h-4" /> Add
                                </button>
                            </div>

                            {selectedSource.subscriptions && selectedSource.subscriptions.length > 0 ? (
                                <div className="space-y-2">
                                    {selectedSource.subscriptions.map(sub => (
                                        <div key={sub.id} className="bg-slate-800 rounded-lg p-3 flex items-center justify-between">
                                            <div>
                                                <p className="text-white font-mono text-sm">{sub.topicPattern}</p>
                                                <p className="text-slate-500 text-xs">
                                                    → {sub.workflow?.name || `Workflow ${sub.workflowId}`} | QoS {sub.qos}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteSubscription(sub.id)}
                                                className="text-red-400 hover:text-red-300 p-1"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-500 text-sm">No subscriptions. Add topics to route MQTT messages to workflows.</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Create/Edit Source Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-slate-900 rounded-xl p-6 w-full max-w-md border border-slate-700">
                            <h2 className="text-xl font-bold mb-4">
                                {selectedSource ? 'Edit MQTT Source' : 'Add MQTT Source'}
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        placeholder="My MQTT Broker"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Broker URL *</label>
                                    <input
                                        type="text"
                                        value={formData.brokerUrl}
                                        onChange={(e) => setFormData({ ...formData, brokerUrl: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono text-sm"
                                        placeholder="tcp://broker.example.com:1883"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Username</label>
                                        <input
                                            type="text"
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                                        <input
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                            placeholder={selectedSource ? '••••••••' : ''}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Client ID</label>
                                    <input
                                        type="text"
                                        value={formData.clientId}
                                        onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        placeholder="Auto-generated if empty"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        rows={2}
                                    />
                                </div>

                                <div className="flex items-center gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.useTls}
                                            onChange={(e) => setFormData({ ...formData, useTls: e.target.checked })}
                                            className="w-4 h-4 rounded"
                                        />
                                        <span className="text-sm text-slate-300">Use TLS</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                            className="w-4 h-4 rounded"
                                        />
                                        <span className="text-sm text-slate-300">Active</span>
                                    </label>
                                </div>

                                {/* Encryption toggle - only shown for new sources */}
                                {!selectedSource && (
                                    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.encryptionEnabled}
                                                onChange={(e) => setFormData({ ...formData, encryptionEnabled: e.target.checked })}
                                                className="w-4 h-4 rounded accent-amber-500"
                                            />
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <Lock className="w-4 h-4 text-amber-400" />
                                                    <span className="text-sm font-medium text-slate-200">Enable Encryption</span>
                                                </div>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    Encrypt MQTT payloads with Enigma. A master secret will be generated.
                                                </p>
                                            </div>
                                        </label>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => { setShowModal(false); setSelectedSource(null); }}
                                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={selectedSource ? handleUpdateSource : handleCreateSource}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
                                >
                                    {selectedSource ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add Subscription Modal */}
                {showSubModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-slate-900 rounded-xl p-6 w-full max-w-md border border-slate-700">
                            <h2 className="text-xl font-bold mb-4">Add Topic Subscription</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Topic Pattern *</label>
                                    <input
                                        type="text"
                                        value={subFormData.topicPattern}
                                        onChange={(e) => setSubFormData({ ...subFormData, topicPattern: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                                        placeholder="sensor/+/temperature"
                                    />
                                    <p className="text-slate-500 text-xs mt-1">Use + for single-level wildcard, # for multi-level</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Target Workflow *</label>
                                    <select
                                        value={subFormData.workflowId}
                                        onChange={(e) => setSubFormData({ ...subFormData, workflowId: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    >
                                        <option value={0}>Select workflow...</option>
                                        {workflows.map(wf => (
                                            <option key={wf.id} value={wf.id}>{wf.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">QoS Level</label>
                                        <select
                                            value={subFormData.qos}
                                            onChange={(e) => setSubFormData({ ...subFormData, qos: parseInt(e.target.value) })}
                                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        >
                                            <option value={0}>0 - At most once</option>
                                            <option value={1}>1 - At least once</option>
                                            <option value={2}>2 - Exactly once</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Payload Format</label>
                                        <select
                                            value={subFormData.payloadFormat}
                                            onChange={(e) => setSubFormData({ ...subFormData, payloadFormat: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        >
                                            <option value="json">JSON</option>
                                            <option value="raw">Raw</option>
                                            <option value="csv">CSV</option>
                                        </select>
                                    </div>
                                </div>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={subFormData.isActive}
                                        onChange={(e) => setSubFormData({ ...subFormData, isActive: e.target.checked })}
                                        className="w-4 h-4 rounded"
                                    />
                                    <span className="text-sm text-slate-300">Active</span>
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setShowSubModal(false)}
                                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateSubscription}
                                    disabled={!subFormData.topicPattern || !subFormData.workflowId}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition disabled:opacity-50"
                                >
                                    Add Subscription
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Master Secret Modal - shown after creating encrypted source */}
                {showSecretModal && newMasterSecret && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                        <div className="bg-slate-900 rounded-xl p-6 w-full max-w-lg border border-amber-500/50 shadow-lg shadow-amber-500/10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-amber-500/20 rounded-lg">
                                    <Key className="w-6 h-6 text-amber-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Master Secret Generated</h2>
                                    <p className="text-sm text-slate-400">Save this secret - it will not be shown again!</p>
                                </div>
                            </div>

                            <div className="bg-slate-800 rounded-lg p-4 mb-4">
                                <div className="flex items-center justify-between gap-2">
                                    <code className="text-amber-300 text-sm font-mono break-all flex-1">
                                        {newMasterSecret}
                                    </code>
                                    <button
                                        onClick={() => copyToClipboard(newMasterSecret)}
                                        className="flex-shrink-0 p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
                                    >
                                        {copiedSecret ? (
                                            <CheckCircle className="w-5 h-5 text-green-400" />
                                        ) : (
                                            <Copy className="w-5 h-5 text-slate-300" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
                                <p className="text-red-300 text-sm">
                                    <strong>⚠ Warning:</strong> This master secret is shown only once. Copy it now and store it securely.
                                    You'll need it to configure your MQTT devices with encryption.
                                </p>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    onClick={() => { setShowSecretModal(false); setNewMasterSecret(null); }}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
                                >
                                    I've Saved the Secret
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
