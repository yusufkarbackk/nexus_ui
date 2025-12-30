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
    Radio,
    Lock,
    AlertTriangle,
} from 'lucide-react';

export default function DocsPage() {
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'sender' | 'mqtt'>('sender');

    const copyCode = async (code: string, id: string) => {
        await navigator.clipboard.writeText(code);
        setCopiedCode(id);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const pythonCode = `from nexus_enigma import NexusEnigma

# Your credentials from Nexus UI
client = NexusEnigma(
    app_key="app_your_app_key",
    master_secret="your_master_secret_base64",
    base_url="http://localhost:8080"
)

# Send encrypted data
response = client.send({
    "temperature": 25.5,
    "humidity": 60,
    "device_id": "sensor-001"
})

print(response)  # {"message": "Data accepted"}`;

    const mqttCode = `from mqtt_enigma import MQTTEnigmaClient

# Your credentials from Nexus UI
client = MQTTEnigmaClient(
    host="localhost",          # Your MQTT broker
    port=1883,
    master_secret="your_master_secret_base64",
    source_id=1                # Your MQTT Source ID
)

# Connect and publish
client.connect()

client.publish("sensors/temperature", {
    "temperature": 25.5,
    "humidity": 60
})

client.disconnect()`;

    const installCode = `pip install cryptography requests paho-mqtt`;

    const downloadSDK = (type: 'python' | 'mqtt') => {
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
                                <h1 className="text-lg font-semibold text-white">SDK Documentation</h1>
                                <p className="text-sm text-slate-400">Step-by-step guide to send data</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
                {/* Important Notice */}
                <section className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                        <Lock className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <h2 className="text-lg font-semibold text-amber-400 mb-2">Encryption is Mandatory</h2>
                            <p className="text-amber-200/80 text-sm">
                                All data sent to Nexus must be encrypted using our SDK.
                                Raw API calls without encryption will be rejected.
                                When you create a Sender App or MQTT Source, you&apos;ll receive a
                                <strong className="text-amber-400"> Master Secret</strong> - save it immediately as it&apos;s only shown once!
                            </p>
                        </div>
                    </div>
                </section>

                {/* Method Selection Tabs */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('sender')}
                        className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'sender'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                    >
                        <Zap className="w-4 h-4" />
                        HTTP Sender App
                    </button>
                    <button
                        onClick={() => setActiveTab('mqtt')}
                        className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'mqtt'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                    >
                        <Radio className="w-4 h-4" />
                        MQTT Source
                    </button>
                </div>

                {/* Sender App Steps */}
                {activeTab === 'sender' && (
                    <section className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-indigo-500/20 rounded-lg">
                                <Zap className="w-5 h-5 text-indigo-400" />
                            </div>
                            <h2 className="text-xl font-semibold text-white">HTTP Sender App Setup</h2>
                        </div>

                        <div className="space-y-6">
                            {/* Step 1 */}
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-white font-bold text-sm">1</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-white font-medium">Create a Sender App</h3>
                                    <p className="text-slate-400 text-sm mt-1">
                                        Go to <Link href="/sender-apps/create" className="text-indigo-400 hover:underline">Sender Apps → Create New</Link>.
                                        Enter your app name and define the data fields you&apos;ll be sending.
                                    </p>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-white font-bold text-sm">2</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-white font-medium">Save Your Credentials</h3>
                                    <p className="text-slate-400 text-sm mt-1">
                                        After creation, copy your <strong className="text-emerald-400">App Key</strong> and
                                        <strong className="text-amber-400"> Master Secret</strong>.
                                    </p>
                                    <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                                        <p className="text-amber-400 text-xs flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4" />
                                            The Master Secret is shown only once - copy it immediately!
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-white font-bold text-sm">3</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-white font-medium">Install the SDK</h3>
                                    <div className="mt-2">
                                        <pre className="bg-slate-950 border border-slate-800 rounded-lg p-3 overflow-x-auto">
                                            <code className="text-sm text-emerald-400">{installCode}</code>
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
                                    <h3 className="text-white font-medium">Send Data from Your App</h3>
                                    <div className="mt-2">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-slate-400 text-sm">Python</span>
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
                                </div>
                            </div>

                            {/* Step 5 */}
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-white font-bold text-sm">5</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-white font-medium">Configure Workflow</h3>
                                    <p className="text-slate-400 text-sm mt-1">
                                        Go to <Link href="/workflow" className="text-indigo-400 hover:underline">Workflow Editor</Link>.
                                        Drag your Sender App onto the canvas, connect it to a destination (database or REST API),
                                        configure field mappings, and save.
                                    </p>
                                </div>
                            </div>

                            {/* Step 6 */}
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                                    <CheckCircle className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-emerald-400 font-medium">Done!</h3>
                                    <p className="text-slate-400 text-sm mt-1">
                                        Your data will now flow automatically from your app → Nexus → your destination.
                                        Check <Link href="/logs" className="text-indigo-400 hover:underline">Logs</Link> to monitor messages.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* MQTT Source Steps */}
                {activeTab === 'mqtt' && (
                    <section className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-emerald-500/20 rounded-lg">
                                <Radio className="w-5 h-5 text-emerald-400" />
                            </div>
                            <h2 className="text-xl font-semibold text-white">MQTT Source Setup</h2>
                        </div>

                        <div className="space-y-6">
                            {/* Step 1 */}
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-white font-bold text-sm">1</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-white font-medium">Create an MQTT Source</h3>
                                    <p className="text-slate-400 text-sm mt-1">
                                        Go to <Link href="/mqtt-sources" className="text-emerald-400 hover:underline">MQTT Sources → Add New</Link>.
                                        Configure your MQTT broker connection (host, port, credentials if needed).
                                    </p>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-white font-bold text-sm">2</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-white font-medium">Save Your Credentials</h3>
                                    <p className="text-slate-400 text-sm mt-1">
                                        After creation, copy your <strong className="text-emerald-400">Source ID</strong> and
                                        <strong className="text-amber-400"> Master Secret</strong>.
                                    </p>
                                    <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                                        <p className="text-amber-400 text-xs flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4" />
                                            The Master Secret is shown only once - copy it immediately!
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-white font-bold text-sm">3</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-white font-medium">Add Topic Subscription</h3>
                                    <p className="text-slate-400 text-sm mt-1">
                                        Click on your MQTT source and add a subscription with the topic pattern your devices will publish to
                                        (e.g., <code className="text-emerald-400">sensors/temperature</code>).
                                    </p>
                                </div>
                            </div>

                            {/* Step 4 */}
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-white font-bold text-sm">4</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-white font-medium">Install the SDK</h3>
                                    <div className="mt-2">
                                        <pre className="bg-slate-950 border border-slate-800 rounded-lg p-3 overflow-x-auto">
                                            <code className="text-sm text-emerald-400">{installCode}</code>
                                        </pre>
                                    </div>
                                </div>
                            </div>

                            {/* Step 5 */}
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-white font-bold text-sm">5</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-white font-medium">Publish from Your Device</h3>
                                    <div className="mt-2">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-slate-400 text-sm">Python</span>
                                            <button
                                                onClick={() => copyCode(mqttCode, 'mqtt')}
                                                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
                                            >
                                                {copiedCode === 'mqtt' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                                {copiedCode === 'mqtt' ? 'Copied!' : 'Copy'}
                                            </button>
                                        </div>
                                        <pre className="bg-slate-950 border border-slate-800 rounded-lg p-4 overflow-x-auto">
                                            <code className="text-sm text-slate-300">{mqttCode}</code>
                                        </pre>
                                    </div>
                                </div>
                            </div>

                            {/* Step 6 */}
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-white font-bold text-sm">6</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-white font-medium">Configure Workflow</h3>
                                    <p className="text-slate-400 text-sm mt-1">
                                        Go to <Link href="/workflow" className="text-emerald-400 hover:underline">Workflow Editor</Link>.
                                        Drag your MQTT Source onto the canvas, connect it to a destination,
                                        configure field mappings, and save.
                                    </p>
                                </div>
                            </div>

                            {/* Step 7 */}
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                                    <CheckCircle className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-emerald-400 font-medium">Done!</h3>
                                    <p className="text-slate-400 text-sm mt-1">
                                        Messages published to your subscribed topics will automatically flow to your destination.
                                        Check <Link href="/logs" className="text-emerald-400 hover:underline">Logs</Link> to monitor messages.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Download SDKs */}
                <section className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Download className="w-6 h-6 text-indigo-400" />
                        <h2 className="text-xl font-semibold text-white">Download SDKs</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        {/* HTTP SDK */}
                        <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-indigo-500/20 rounded-lg">
                                    <Code className="w-5 h-5 text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="text-white font-medium">HTTP Sender SDK</h3>
                                    <p className="text-slate-400 text-xs">nexus_enigma.py</p>
                                </div>
                            </div>
                            <p className="text-slate-400 text-sm mb-4">
                                For applications sending data via HTTP API.
                            </p>
                            <button
                                onClick={() => downloadSDK('python')}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                Download
                            </button>
                        </div>

                        {/* MQTT SDK */}
                        <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-emerald-500/20 rounded-lg">
                                    <Radio className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="text-white font-medium">MQTT Source SDK</h3>
                                    <p className="text-slate-400 text-xs">mqtt_enigma.py</p>
                                </div>
                            </div>
                            <p className="text-slate-400 text-sm mb-4">
                                For IoT devices publishing via MQTT protocol.
                            </p>
                            <button
                                onClick={() => downloadSDK('mqtt')}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                Download
                            </button>
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
                                <div className="text-emerald-400">Your App / Device</div>
                                <div className="text-xs">Encrypt with Master Secret + Daily Key</div>
                            </div>
                            <div>↓</div>
                            <div className="text-center">
                                <div className="text-indigo-400">Nexus API / MQTT Subscriber</div>
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
                                <div className="text-xs">Decrypt → Transform → Route</div>
                            </div>
                            <div>↓</div>
                            <div className="text-center">
                                <div className="text-emerald-400">Your Destination</div>
                                <div className="text-xs">✓ Data stored / forwarded</div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 grid md:grid-cols-3 gap-3">
                        <div className="p-3 bg-slate-800 rounded-lg text-center">
                            <div className="text-lg font-bold text-indigo-400">AES-256-GCM</div>
                            <div className="text-xs text-slate-400">Industry-standard encryption</div>
                        </div>
                        <div className="p-3 bg-slate-800 rounded-lg text-center">
                            <div className="text-lg font-bold text-emerald-400">Daily Rotation</div>
                            <div className="text-xs text-slate-400">Keys rotate every 24 hours</div>
                        </div>
                        <div className="p-3 bg-slate-800 rounded-lg text-center">
                            <div className="text-lg font-bold text-amber-400">One-Time Secret</div>
                            <div className="text-xs text-slate-400">Master Secret shown once</div>
                        </div>
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
                            <div className="text-red-400 font-medium text-sm min-w-[180px]">encryption is required</div>
                            <div className="text-slate-400 text-sm">You must use the SDK. Raw HTTP calls without encryption are not allowed.</div>
                        </div>
                        <div className="flex items-start gap-4 p-3 bg-slate-800 rounded-lg">
                            <div className="text-red-400 font-medium text-sm min-w-[180px]">Decryption failed</div>
                            <div className="text-slate-400 text-sm">Verify your Master Secret matches the one from app/source creation.</div>
                        </div>
                        <div className="flex items-start gap-4 p-3 bg-slate-800 rounded-lg">
                            <div className="text-red-400 font-medium text-sm min-w-[180px]">Invalid API Key</div>
                            <div className="text-slate-400 text-sm">Check your App Key is correct and the sender app exists.</div>
                        </div>
                        <div className="flex items-start gap-4 p-3 bg-slate-800 rounded-lg">
                            <div className="text-red-400 font-medium text-sm min-w-[180px]">Data not arriving</div>
                            <div className="text-slate-400 text-sm">Check that your workflow is saved and destinations are configured.</div>
                        </div>
                        <div className="flex items-start gap-4 p-3 bg-slate-800 rounded-lg">
                            <div className="text-red-400 font-medium text-sm min-w-[180px]">MQTT: No workflow found</div>
                            <div className="text-slate-400 text-sm">Link your MQTT source to a workflow in the Workflow Editor.</div>
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
