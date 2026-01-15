'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    BookOpen,
    Download,
    Zap,
    CheckCircle,
    Copy,
    Check,
    ExternalLink,
    Server,
    Terminal,
    Settings,
    Play,
    AlertTriangle,
} from 'lucide-react';

export default function DocsPage() {
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const copyCode = async (code: string, id: string) => {
        await navigator.clipboard.writeText(code);
        setCopiedCode(id);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const binaryInstallCode = `# Download the agent
wget https://github.com/yusufkarbackk/nexus-architecture/releases/latest/download/nexus-agent-linux-amd64

# Make executable
chmod +x nexus-agent-linux-amd64

# Move to system path
sudo mv nexus-agent-linux-amd64 /usr/local/bin/nexus-agent

# Create config directory
sudo mkdir -p /etc/nexus-agent`;

    const configCode = `agent:
  port: 9000
  bind: "this server ip"

nexus:
  server_url: "https://your-nexus-server.com"
  agent_token: "agt_YOUR_TOKEN_HERE"
  sync_interval: 60s
  timeout: 30s

buffer:
  enabled: true
  max_size: 10000
  db_path: "./queue.db"`;

    const systemdCode = `[Unit]
Description=Nexus Agent
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/nexus-agent -config /etc/nexus-agent/config.yml
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target`;

    const sendDataCode = `# Health check
curl http://localhost:9000/health

# Send data
curl -X POST http://localhost:9000/send \\
  -H "Content-Type: application/json" \\
  -d '{
    "app_key": "app_YOUR_APP_KEY",
    "data": {
      "temperature": 25.5,
      "humidity": 60,
      "device_id": "sensor-001"
    }
  }'`;

    const pythonExampleCode = `import requests

AGENT_URL = "http://localhost:9000"
APP_KEY = "app_YOUR_APP_KEY"

def send_data(data: dict):
    response = requests.post(
        f"{AGENT_URL}/send",
        json={
            "app_key": APP_KEY,
            "data": data
        }
    )
    return response.json()

# Example usage
result = send_data({
    "temperature": 25.5,
    "humidity": 60,
    "device_id": "sensor-001"
})
print(result)`;

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Header */}
            <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/"
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-600 rounded-lg">
                                <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-white">Agent Documentation</h1>
                                <p className="text-sm text-slate-400">Install and configure Nexus Agent</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
                {/* Overview */}
                <section className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                        <Server className="w-6 h-6 text-indigo-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <h2 className="text-lg font-semibold text-indigo-400 mb-2">What is Nexus Agent?</h2>
                            <p className="text-indigo-200/80 text-sm">
                                Nexus Agent is a lightweight service that runs on your server or device.
                                It receives data from your applications and securely forwards it to the Nexus platform.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Binary Installation */}
                <section className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-500/20 rounded-lg">
                            <Terminal className="w-5 h-5 text-indigo-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-white">Installation (Linux)</h2>
                    </div>

                    <div className="space-y-6">
                        {/* Step 1 */}
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold text-sm">1</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-white font-medium">Create an Agent in Nexus</h3>
                                <p className="text-slate-400 text-sm mt-1">
                                    Go to <Link href="/agents" className="text-indigo-400 hover:underline">Agents → Create New</Link>.
                                    Save your <strong className="text-amber-400">Agent Token</strong>.
                                </p>
                                <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                                    <p className="text-amber-400 text-xs flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" />
                                        The Agent Token is shown only once - copy it immediately!
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold text-sm">2</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-white font-medium">Download & Install Agent</h3>
                                <div className="mt-2">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-slate-400 text-sm">Linux AMD64</span>
                                        <button
                                            onClick={() => copyCode(binaryInstallCode, 'install')}
                                            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
                                        >
                                            {copiedCode === 'install' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                            {copiedCode === 'install' ? 'Copied!' : 'Copy'}
                                        </button>
                                    </div>
                                    <pre className="bg-slate-950 border border-slate-800 rounded-lg p-4 overflow-x-auto">
                                        <code className="text-sm text-emerald-400">{binaryInstallCode}</code>
                                    </pre>
                                </div>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold text-sm">3</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-white font-medium">Create Configuration</h3>
                                <p className="text-slate-400 text-sm mt-1">
                                    Create <code className="text-emerald-400">/etc/nexus-agent/config.yml</code>:
                                </p>
                                <div className="mt-2">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-slate-400 text-sm">config.yml</span>
                                        <button
                                            onClick={() => copyCode(configCode, 'config')}
                                            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
                                        >
                                            {copiedCode === 'config' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                            {copiedCode === 'config' ? 'Copied!' : 'Copy'}
                                        </button>
                                    </div>
                                    <pre className="bg-slate-950 border border-slate-800 rounded-lg p-4 overflow-x-auto">
                                        <code className="text-sm text-slate-300">{configCode}</code>
                                    </pre>
                                </div>
                            </div>
                        </div>

                        {/* Step 4 */}
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold text-sm">4</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-white font-medium">Setup Systemd Service</h3>
                                <p className="text-slate-400 text-sm mt-1">
                                    Create <code className="text-emerald-400">/etc/systemd/system/nexus-agent.service</code>:
                                </p>
                                <div className="mt-2">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-slate-400 text-sm">nexus-agent.service</span>
                                        <button
                                            onClick={() => copyCode(systemdCode, 'systemd')}
                                            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
                                        >
                                            {copiedCode === 'systemd' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                            {copiedCode === 'systemd' ? 'Copied!' : 'Copy'}
                                        </button>
                                    </div>
                                    <pre className="bg-slate-950 border border-slate-800 rounded-lg p-4 overflow-x-auto">
                                        <code className="text-sm text-slate-300">{systemdCode}</code>
                                    </pre>
                                </div>
                                <div className="mt-3 p-3 bg-slate-800 rounded-lg">
                                    <code className="text-sm text-emerald-400">
                                        sudo systemctl daemon-reload && sudo systemctl enable --now nexus-agent
                                    </code>
                                </div>
                            </div>
                        </div>

                        {/* Done */}
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-emerald-400 font-medium">Done!</h3>
                                <p className="text-slate-400 text-sm mt-1">
                                    Check status: <code className="text-emerald-400">sudo systemctl status nexus-agent</code>
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Sending Data */}
                <section className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-amber-500/20 rounded-lg">
                            <Play className="w-5 h-5 text-amber-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-white">Sending Data to Agent</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-400 text-sm">cURL Example</span>
                                <button
                                    onClick={() => copyCode(sendDataCode, 'send')}
                                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
                                >
                                    {copiedCode === 'send' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                    {copiedCode === 'send' ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                            <pre className="bg-slate-950 border border-slate-800 rounded-lg p-4 overflow-x-auto">
                                <code className="text-sm text-emerald-400">{sendDataCode}</code>
                            </pre>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-400 text-sm">Python Example</span>
                                <button
                                    onClick={() => copyCode(pythonExampleCode, 'python')}
                                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
                                >
                                    {copiedCode === 'python' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                    {copiedCode === 'python' ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                            <pre className="bg-slate-950 border border-slate-800 rounded-lg p-4 overflow-x-auto">
                                <code className="text-sm text-slate-300">{pythonExampleCode}</code>
                            </pre>
                        </div>
                    </div>
                </section>

                {/* Download Links */}
                <section className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Download className="w-6 h-6 text-indigo-400" />
                        <h2 className="text-xl font-semibold text-white">Download Agent</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                        <a
                            href="https://github.com/yusufkarbackk/nexus-architecture/releases/latest/download/nexus-agent-linux-amd64"
                            className="block bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-indigo-500 transition-colors"
                        >
                            <div className="text-white font-medium">Linux AMD64</div>
                            <div className="text-slate-400 text-sm">Intel/AMD 64-bit</div>
                        </a>
                        <a
                            href="https://github.com/yusufkarbackk/nexus-architecture/releases/latest/download/nexus-agent-linux-arm64"
                            className="block bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-indigo-500 transition-colors"
                        >
                            <div className="text-white font-medium">Linux ARM64</div>
                            <div className="text-slate-400 text-sm">Raspberry Pi, ARM servers</div>
                        </a>
                        <a
                            href="https://github.com/yusufkarbackk/nexus-architecture/releases/latest/download/nexus-agent-windows-amd64.exe"
                            className="block bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-indigo-500 transition-colors"
                        >
                            <div className="text-white font-medium">Windows AMD64</div>
                            <div className="text-slate-400 text-sm">Windows 10/11</div>
                        </a>
                    </div>

                    <div className="mt-4">
                        <a
                            href="https://github.com/yusufkarbackk/nexus-architecture/releases"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300"
                        >
                            <ExternalLink className="w-4 h-4" />
                            View all releases on GitHub
                        </a>
                    </div>
                </section>

                {/* Workflow Section */}
                <section className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Settings className="w-6 h-6 text-purple-400" />
                        <h2 className="text-xl font-semibold text-white">Configure Workflow</h2>
                    </div>

                    <div className="text-slate-400 text-sm space-y-3">
                        <p>After your agent is running:</p>
                        <ol className="list-decimal list-inside space-y-2 ml-2">
                            <li>Go to <Link href="/sender-apps" className="text-indigo-400 hover:underline">Sender Apps</Link> and create an app with AppKey</li>
                            <li>Go to <Link href="/workflow" className="text-indigo-400 hover:underline">Workflow Editor</Link></li>
                            <li>Drag your Sender App onto the canvas</li>
                            <li>Connect it to a destination (Database or REST API)</li>
                            <li>Configure field mappings and Save</li>
                        </ol>
                        <p className="mt-4">
                            Your data will now flow: <span className="text-emerald-400">Your App → Agent → Nexus → Destination</span>
                        </p>
                    </div>
                </section>
            </main>
        </div>
    );
}
