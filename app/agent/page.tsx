'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Download,
    Copy,
    Check,
    Server,
    Shield,
    ArrowLeft,
    RefreshCw,
    ExternalLink,
    Cpu,
} from 'lucide-react';
import { fetchApplications, Application } from '@/app/lib/api';

export default function AgentConfigPage() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [selectedApps, setSelectedApps] = useState<Set<number>>(new Set());
    const [serverUrl, setServerUrl] = useState('https://nexus.yourcompany.com');
    const [isLoading, setIsLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [generatedConfig, setGeneratedConfig] = useState<string | null>(null);

    // Fetch applications on mount
    useEffect(() => {
        loadApplications();
    }, []);

    async function loadApplications() {
        setIsLoading(true);
        try {
            const response = await fetchApplications();
            if (response.success && response.data) {
                setApplications(response.data);
            }
        } catch (error) {
            console.error('Failed to load applications:', error);
        } finally {
            setIsLoading(false);
        }
    }

    function toggleApp(appId: number) {
        const newSelected = new Set(selectedApps);
        if (newSelected.has(appId)) {
            newSelected.delete(appId);
        } else {
            newSelected.add(appId);
        }
        setSelectedApps(newSelected);
        setGeneratedConfig(null); // Reset generated config
    }

    function selectAll() {
        setSelectedApps(new Set(applications.map(app => app.id)));
        setGeneratedConfig(null);
    }

    function deselectAll() {
        setSelectedApps(new Set());
        setGeneratedConfig(null);
    }

    function generateConfig() {
        const selected = applications.filter(app => selectedApps.has(app.id));
        if (selected.length === 0) return;

        const config = `# Nexus Agent Configuration
# Generated from Nexus UI

agent:
  port: 9000
  bind: "127.0.0.1"  # Only allow local connections

nexus:
  server_url: "${serverUrl}"
  timeout: 30s
  retry_attempts: 3
  retry_delay: 5s

# Sender Apps
apps:
${selected.map(app => `  - name: "${app.name}"
    app_key: "${app.appKey}"
    master_secret: "${app.masterSecret || 'YOUR_MASTER_SECRET_HERE'}"`).join('\n\n')}

buffer:
  enabled: true
  max_size: 10000
  db_path: "./queue.db"
`;

        setGeneratedConfig(config);
    }

    async function copyConfig() {
        if (!generatedConfig) return;
        await navigator.clipboard.writeText(generatedConfig);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    function downloadConfig() {
        if (!generatedConfig) return;
        const blob = new Blob([generatedConfig], { type: 'text/yaml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'config.yml';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Header */}
            <div className="border-b border-white/10 backdrop-blur-xl bg-white/5">
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/dashboard"
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-white/70" />
                            </Link>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25">
                                    <Cpu className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-semibold text-white">Nexus Agent</h1>
                                    <p className="text-xs text-white/50">Configuration Generator</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Info Banner */}
                <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
                    <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-cyan-400 mt-0.5" />
                        <div>
                            <h3 className="text-white font-medium">What is the Nexus Agent?</h3>
                            <p className="text-white/70 text-sm mt-1">
                                The Nexus Agent is a lightweight local service that enables <strong>any programming language</strong> to
                                send encrypted data to Nexus. Install it on your servers, configure it with your sender apps, and
                                send plain JSON to <code className="bg-white/10 px-1 rounded">localhost:9000/send</code>.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - App Selection */}
                    <div className="space-y-6">
                        <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                            <div className="p-4 border-b border-white/10 flex items-center justify-between">
                                <h2 className="text-white font-medium flex items-center gap-2">
                                    <Server className="w-4 h-4 text-cyan-400" />
                                    Select Sender Apps
                                </h2>
                                <div className="flex gap-2">
                                    <button
                                        onClick={selectAll}
                                        className="text-xs text-cyan-400 hover:text-cyan-300"
                                    >
                                        Select All
                                    </button>
                                    <span className="text-white/30">|</span>
                                    <button
                                        onClick={deselectAll}
                                        className="text-xs text-white/50 hover:text-white/70"
                                    >
                                        Deselect All
                                    </button>
                                </div>
                            </div>

                            <div className="p-4 space-y-2 max-h-[300px] overflow-y-auto">
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin" />
                                    </div>
                                ) : applications.length === 0 ? (
                                    <div className="text-center py-8 text-white/50">
                                        <p>No sender apps found.</p>
                                        <Link href="/sender-apps" className="text-cyan-400 hover:underline text-sm">
                                            Create a sender app first
                                        </Link>
                                    </div>
                                ) : (
                                    applications.map(app => (
                                        <label
                                            key={app.id}
                                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${selectedApps.has(app.id)
                                                    ? 'bg-cyan-500/20 border border-cyan-500/30'
                                                    : 'bg-white/5 border border-transparent hover:bg-white/10'
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedApps.has(app.id)}
                                                onChange={() => toggleApp(app.id)}
                                                className="w-4 h-4 rounded border-white/30 bg-white/10 text-cyan-500 focus:ring-cyan-500"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white font-medium truncate">{app.name}</p>
                                                <p className="text-white/50 text-xs truncate font-mono">{app.appKey}</p>
                                            </div>
                                        </label>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Server URL */}
                        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                            <label className="block text-white/70 text-sm mb-2">Nexus Server URL</label>
                            <input
                                type="url"
                                value={serverUrl}
                                onChange={(e) => {
                                    setServerUrl(e.target.value);
                                    setGeneratedConfig(null);
                                }}
                                placeholder="https://nexus.yourcompany.com"
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                            />
                        </div>

                        {/* Generate Button */}
                        <button
                            onClick={generateConfig}
                            disabled={selectedApps.size === 0}
                            className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${selectedApps.size > 0
                                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40'
                                    : 'bg-white/10 text-white/30 cursor-not-allowed'
                                }`}
                        >
                            Generate Configuration
                        </button>
                    </div>

                    {/* Right Column - Generated Config */}
                    <div className="space-y-6">
                        <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                            <div className="p-4 border-b border-white/10 flex items-center justify-between">
                                <h2 className="text-white font-medium">Generated config.yml</h2>
                                {generatedConfig && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={copyConfig}
                                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                            title="Copy to clipboard"
                                        >
                                            {copied ? (
                                                <Check className="w-4 h-4 text-green-400" />
                                            ) : (
                                                <Copy className="w-4 h-4 text-white/70" />
                                            )}
                                        </button>
                                        <button
                                            onClick={downloadConfig}
                                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                            title="Download config.yml"
                                        >
                                            <Download className="w-4 h-4 text-white/70" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="p-4">
                                {generatedConfig ? (
                                    <pre className="text-sm text-white/80 font-mono bg-black/30 rounded-lg p-4 overflow-x-auto max-h-[400px] overflow-y-auto">
                                        {generatedConfig}
                                    </pre>
                                ) : (
                                    <div className="text-center py-12 text-white/50">
                                        <p>Select sender apps and click &quot;Generate Configuration&quot;</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Downloads & Documentation */}
                        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                            <h3 className="text-white font-medium mb-3">Quick Start</h3>
                            <ol className="text-white/70 text-sm space-y-2 list-decimal list-inside">
                                <li>Download the Nexus Agent binary for your platform</li>
                                <li>Save the generated <code className="bg-white/10 px-1 rounded">config.yml</code> file</li>
                                <li>Run: <code className="bg-white/10 px-1 rounded">./nexus-agent -config config.yml</code></li>
                                <li>Send data: <code className="bg-white/10 px-1 rounded">POST http://localhost:9000/send</code></li>
                            </ol>

                            <div className="mt-4 pt-4 border-t border-white/10">
                                <a
                                    href="https://github.com/yourorg/nexus-agent"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    View Documentation & Downloads
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
