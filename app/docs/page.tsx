'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    BookOpen,
    Code,
    Download,
    Shield,
    Database,
    Zap,
    CheckCircle,
    Copy,
    Check,
    ExternalLink,
} from 'lucide-react';

export default function DocsPage() {
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const copyCode = async (code: string, id: string) => {
        await navigator.clipboard.writeText(code);
        setCopiedCode(id);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const pythonCode = `from nexus_enigma import NexusEnigma

client = NexusEnigma(
    app_key="YOUR_APP_KEY",
    master_secret="YOUR_MASTER_SECRET",
    base_url="http://your-nexus-server:8080"
)

# Send encrypted data
response = client.send({
    "sensor_id": "temp_001",
    "temperature": 25.5,
    "humidity": 60
})
print(response)`;

    const jsCode = `const NexusEnigma = require('./nexus-enigma.js');

const client = new NexusEnigma({
    appKey: 'YOUR_APP_KEY',
    masterSecret: 'YOUR_MASTER_SECRET',
    baseUrl: 'http://your-nexus-server:8080'
});

// Send encrypted data
client.send({
    sensor_id: 'temp_001',
    temperature: 25.5,
    humidity: 60
}).then(response => {
    console.log(response);
});`;

    const curlCode = `curl -X POST http://your-nexus-server:8080/ingress \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: YOUR_APP_KEY" \\
  -d '{"sensor_id": "temp_001", "temperature": 25.5}'`;

    const downloadSDK = (type: 'python' | 'javascript') => {
        const filename = type === 'python' ? 'nexus_enigma.py' : 'nexus-enigma.js';
        window.open(`/api/sdk/${type}`, '_blank');
    };

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
                                <h1 className="text-lg font-semibold text-white">Documentation</h1>
                                <p className="text-sm text-slate-400">Getting started with Nexus</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
                {/* Quick Start */}
                <section className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Zap className="w-6 h-6 text-amber-400" />
                        <h2 className="text-xl font-semibold text-white">Quick Start (5 Minutes)</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold text-sm">1</span>
                            </div>
                            <div>
                                <h3 className="text-white font-medium">Create a Sender App</h3>
                                <p className="text-slate-400 text-sm mt-1">
                                    Go to <Link href="/sender-apps/create" className="text-indigo-400 hover:underline">Sender Apps → Create New</Link>.
                                    Enter your app name and enable encryption if needed.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold text-sm">2</span>
                            </div>
                            <div>
                                <h3 className="text-white font-medium">Save Your Credentials</h3>
                                <p className="text-slate-400 text-sm mt-1">
                                    Copy your <strong className="text-emerald-400">App Key</strong> and <strong className="text-amber-400">Master Secret</strong> (if encrypted).
                                    The Master Secret is shown only once!
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold text-sm">3</span>
                            </div>
                            <div>
                                <h3 className="text-white font-medium">Create a Workflow</h3>
                                <p className="text-slate-400 text-sm mt-1">
                                    Go to <Link href="/workflow" className="text-indigo-400 hover:underline">Workflows → Create New</Link>.
                                    Connect your sender app to a destination.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold text-sm">4</span>
                            </div>
                            <div>
                                <h3 className="text-white font-medium">Integrate the SDK</h3>
                                <p className="text-slate-400 text-sm mt-1">
                                    Download our SDK and start sending data from your application.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Download SDKs */}
                <section className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Download className="w-6 h-6 text-indigo-400" />
                        <h2 className="text-xl font-semibold text-white">Download SDKs</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        {/* Python SDK */}
                        <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <Code className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-white font-medium">Python SDK</h3>
                                    <p className="text-slate-400 text-xs">nexus_enigma.py</p>
                                </div>
                            </div>
                            <p className="text-slate-400 text-sm mb-4">
                                For Python applications. Requires <code className="text-emerald-400">cryptography</code> and <code className="text-emerald-400">requests</code>.
                            </p>
                            <button
                                onClick={() => downloadSDK('python')}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                Download Python SDK
                            </button>
                        </div>

                        {/* JavaScript SDK */}
                        <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-amber-500/20 rounded-lg">
                                    <Code className="w-5 h-5 text-amber-400" />
                                </div>
                                <div>
                                    <h3 className="text-white font-medium">JavaScript SDK</h3>
                                    <p className="text-slate-400 text-xs">nexus-enigma.js</p>
                                </div>
                            </div>
                            <p className="text-slate-400 text-sm mb-4">
                                For Node.js and browser applications. Works with CommonJS and ES modules.
                            </p>
                            <button
                                onClick={() => downloadSDK('javascript')}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                Download JavaScript SDK
                            </button>
                        </div>
                    </div>
                </section>

                {/* Code Examples */}
                <section className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Code className="w-6 h-6 text-emerald-400" />
                        <h2 className="text-xl font-semibold text-white">Code Examples</h2>
                    </div>

                    <div className="space-y-6">
                        {/* Python Example */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-white font-medium">Python (with Encryption)</h3>
                                <button
                                    onClick={() => copyCode(pythonCode, 'python')}
                                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
                                >
                                    {copiedCode === 'python' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                    {copiedCode === 'python' ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                            <pre className="bg-slate-950 border border-slate-800 rounded-lg p-4 overflow-x-auto">
                                <code className="text-sm text-slate-300">{pythonCode}</code>
                            </pre>
                        </div>

                        {/* JavaScript Example */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-white font-medium">JavaScript (with Encryption)</h3>
                                <button
                                    onClick={() => copyCode(jsCode, 'js')}
                                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
                                >
                                    {copiedCode === 'js' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                    {copiedCode === 'js' ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                            <pre className="bg-slate-950 border border-slate-800 rounded-lg p-4 overflow-x-auto">
                                <code className="text-sm text-slate-300">{jsCode}</code>
                            </pre>
                        </div>

                        {/* cURL Example */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-white font-medium">cURL (Without Encryption)</h3>
                                <button
                                    onClick={() => copyCode(curlCode, 'curl')}
                                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
                                >
                                    {copiedCode === 'curl' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                    {copiedCode === 'curl' ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                            <pre className="bg-slate-950 border border-slate-800 rounded-lg p-4 overflow-x-auto">
                                <code className="text-sm text-slate-300">{curlCode}</code>
                            </pre>
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Shield className="w-6 h-6 text-amber-400" />
                        <h2 className="text-xl font-semibold text-white">How Encryption Works</h2>
                    </div>

                    <div className="bg-slate-950 rounded-lg p-6 font-mono text-sm">
                        <div className="flex flex-col items-center space-y-3 text-slate-400">
                            <div className="text-center">
                                <div className="text-emerald-400">Your App (SDK)</div>
                                <div className="text-xs">Encrypt with daily key</div>
                            </div>
                            <div>↓</div>
                            <div className="text-center">
                                <div className="text-indigo-400">Nexus API</div>
                                <div className="text-xs">Receives encrypted blob</div>
                            </div>
                            <div>↓</div>
                            <div className="text-center">
                                <div className="text-purple-400">Redis Queue</div>
                                <div className="text-xs">Data stays encrypted</div>
                            </div>
                            <div>↓</div>
                            <div className="text-center">
                                <div className="text-amber-400">Nexus Worker</div>
                                <div className="text-xs">Decrypt → Transform → Insert</div>
                            </div>
                            <div>↓</div>
                            <div className="text-center">
                                <div className="text-emerald-400">Your Database</div>
                                <div className="text-xs">✓ Data stored</div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                        <p className="text-emerald-400 text-sm">
                            <CheckCircle className="w-4 h-4 inline mr-2" />
                            <strong>Your data is encrypted</strong> from the moment you send it until the Worker processes it.
                            No one can read it while in transit or stored in Redis.
                        </p>
                    </div>
                </section>

                {/* Troubleshooting */}
                <section className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Database className="w-6 h-6 text-red-400" />
                        <h2 className="text-xl font-semibold text-white">Troubleshooting</h2>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-start gap-4 p-3 bg-slate-800 rounded-lg">
                            <div className="text-red-400 font-medium text-sm min-w-[140px]">Invalid API Key</div>
                            <div className="text-slate-400 text-sm">Check your App Key is correct and the sender app exists.</div>
                        </div>
                        <div className="flex items-start gap-4 p-3 bg-slate-800 rounded-lg">
                            <div className="text-red-400 font-medium text-sm min-w-[140px]">Decryption failed</div>
                            <div className="text-slate-400 text-sm">Verify your Master Secret matches the one from app creation.</div>
                        </div>
                        <div className="flex items-start gap-4 p-3 bg-slate-800 rounded-lg">
                            <div className="text-red-400 font-medium text-sm min-w-[140px]">Data not arriving</div>
                            <div className="text-slate-400 text-sm">Check that your workflow is active and destinations are configured.</div>
                        </div>
                        <div className="flex items-start gap-4 p-3 bg-slate-800 rounded-lg">
                            <div className="text-red-400 font-medium text-sm min-w-[140px]">Connection refused</div>
                            <div className="text-slate-400 text-sm">Verify the Nexus server URL is correct and the server is running.</div>
                        </div>
                    </div>

                    <div className="mt-4">
                        <Link
                            href="/logs"
                            className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300"
                        >
                            <ExternalLink className="w-4 h-4" />
                            View Logs for detailed message status
                        </Link>
                    </div>
                </section>
            </main>
        </div>
    );
}
