'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Globe,
    Lock,
    RefreshCw,
    Save,
    AlertCircle,
    CheckCircle,
    Wifi,
    WifiOff,
    Loader2,
    Key,
    Zap,
    Clock,
    Plus,
    Trash2,
    FileJson,
} from 'lucide-react';
import {
    createRestDestination,
    updateRestDestination,
    fetchRestDestinationById,
    testRestConnection,
    HTTPMethod,
    AuthType,
    CreateRestDestinationPayload,
} from '@/app/lib/api';

const httpMethods: { value: HTTPMethod; label: string; color: string }[] = [
    { value: 'GET', label: 'GET', color: 'border-green-500 bg-green-500/10 text-green-400' },
    { value: 'POST', label: 'POST', color: 'border-blue-500 bg-blue-500/10 text-blue-400' },
    { value: 'PUT', label: 'PUT', color: 'border-yellow-500 bg-yellow-500/10 text-yellow-400' },
    { value: 'PATCH', label: 'PATCH', color: 'border-purple-500 bg-purple-500/10 text-purple-400' },
    { value: 'DELETE', label: 'DELETE', color: 'border-red-500 bg-red-500/10 text-red-400' },
];

const authTypes: { value: AuthType; label: string; description: string; icon: React.ReactNode }[] = [
    { value: 'none', label: 'No Auth', description: 'Public endpoint', icon: null },
    { value: 'bearer', label: 'Bearer Token', description: 'OAuth 2.0 / JWT', icon: <Key className="w-4 h-4" /> },
    { value: 'api_key', label: 'API Key', description: 'Custom header', icon: <Zap className="w-4 h-4" /> },
    { value: 'basic', label: 'Basic Auth', description: 'Username & password', icon: <Lock className="w-4 h-4" /> },
];

export function RestDestinationForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get('id');
    const isEditMode = !!editId;

    // Form state
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [baseUrl, setBaseUrl] = useState('');
    const [method, setMethod] = useState<HTTPMethod>('POST');
    const [headers, setHeaders] = useState('');
    const [authType, setAuthType] = useState<AuthType>('none');
    const [authToken, setAuthToken] = useState(''); // For bearer
    const [apiKeyHeader, setApiKeyHeader] = useState('X-API-Key'); // For api_key
    const [apiKeyValue, setApiKeyValue] = useState(''); // For api_key
    const [basicUsername, setBasicUsername] = useState(''); // For basic
    const [basicPassword, setBasicPassword] = useState(''); // For basic
    const [timeoutSeconds, setTimeoutSeconds] = useState(30);

    // Body fields state
    interface BodyField {
        id: string;
        name: string;
        type: 'string' | 'number' | 'boolean' | 'json';
        required: boolean;
        description: string;
    }
    const [bodyFields, setBodyFields] = useState<BodyField[]>([]);

    // Generate unique ID (fallback for HTTP where crypto.randomUUID is not available)
    const generateId = () => {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        // Fallback for HTTP contexts
        return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 11);
    };

    // Body field helpers
    const addBodyField = () => {
        setBodyFields([...bodyFields, {
            id: generateId(),
            name: '',
            type: 'string',
            required: false,
            description: '',
        }]);
    };

    const updateBodyField = (id: string, updates: Partial<BodyField>) => {
        setBodyFields(bodyFields.map(field =>
            field.id === id ? { ...field, ...updates } : field
        ));
    };

    const removeBodyField = (id: string) => {
        setBodyFields(bodyFields.filter(field => field.id !== id));
    };

    // UI state
    const [isSaving, setIsSaving] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [testResult, setTestResult] = useState<{
        success: boolean;
        message: string;
        statusCode?: number;
        latency?: string;
    } | null>(null);

    // Load existing destination data when in edit mode
    useEffect(() => {
        async function loadDestination() {
            if (!editId) return;

            setIsLoading(true);
            setError(null);

            try {
                const response = await fetchRestDestinationById(parseInt(editId));
                if (response.success && response.data) {
                    const dest = response.data;
                    setName(dest.name);
                    setDescription(dest.description || '');
                    setBaseUrl(dest.baseUrl);
                    setMethod(dest.method);
                    setHeaders(dest.headers || '');
                    setAuthType(dest.authType);
                    setTimeoutSeconds(dest.timeoutSeconds);
                    // Load body fields if present
                    if (dest.bodyFields && Array.isArray(dest.bodyFields)) {
                        setBodyFields(dest.bodyFields.map(f => ({
                            id: crypto.randomUUID(),
                            name: f.name,
                            type: f.type,
                            required: f.required,
                            description: f.description || '',
                        })));
                    }
                    // Auth config is not returned for security
                } else {
                    setError(response.message || 'Failed to load REST destination');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load REST destination');
            } finally {
                setIsLoading(false);
            }
        }

        loadDestination();
    }, [editId]);

    const getAuthConfig = useCallback(() => {
        switch (authType) {
            case 'bearer':
                return JSON.stringify({ token: authToken });
            case 'api_key':
                return JSON.stringify({ headerName: apiKeyHeader, key: apiKeyValue });
            case 'basic':
                return JSON.stringify({ username: basicUsername, password: basicPassword });
            default:
                return undefined;
        }
    }, [authType, authToken, apiKeyHeader, apiKeyValue, basicUsername, basicPassword]);

    const handleTestConnection = async () => {
        setIsTesting(true);
        setTestResult(null);

        try {
            const result = await testRestConnection({
                baseUrl,
                method,
                headers: headers || undefined,
                authType,
                authConfig: getAuthConfig(),
                timeoutSeconds,
            });
            setTestResult(result);
        } catch (err) {
            setTestResult({
                success: false,
                message: err instanceof Error ? err.message : 'Connection test failed',
            });
        } finally {
            setIsTesting(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);
        setSuccess(null);

        try {
            let response;

            if (isEditMode && editId) {
                // Update existing destination
                const bodyFieldsPayload = bodyFields.filter(f => f.name.trim()).map(f => ({
                    name: f.name,
                    type: f.type,
                    required: f.required,
                    description: f.description,
                }));
                response = await updateRestDestination(parseInt(editId), {
                    name,
                    description: description || undefined,
                    baseUrl,
                    method,
                    headers: headers || undefined,
                    bodyFields: bodyFieldsPayload.length > 0 ? bodyFieldsPayload : undefined,
                    authType,
                    authConfig: getAuthConfig(),
                    timeoutSeconds,
                });

                if (response.success) {
                    setSuccess('REST destination updated successfully!');
                    setTimeout(() => {
                        router.push('/rest-destinations/list');
                    }, 1500);
                } else {
                    setError(response.message || 'Failed to update REST destination');
                }
            } else {
                // Create new destination
                const bodyFieldsPayload = bodyFields.filter(f => f.name.trim()).map(f => ({
                    name: f.name,
                    type: f.type,
                    required: f.required,
                    description: f.description,
                }));
                const payload: CreateRestDestinationPayload = {
                    name,
                    description: description || undefined,
                    baseUrl,
                    method,
                    headers: headers || undefined,
                    bodyFields: bodyFieldsPayload.length > 0 ? bodyFieldsPayload : undefined,
                    authType,
                    authConfig: getAuthConfig(),
                    timeoutSeconds,
                };

                response = await createRestDestination(payload);

                if (response.success) {
                    setSuccess('REST destination created successfully!');
                    setTimeout(() => {
                        router.push('/rest-destinations/list');
                    }, 1500);
                } else {
                    setError(response.message || 'Failed to create REST destination');
                }
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
            setError(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    const isFormValid =
        name.trim().length > 0 &&
        baseUrl.trim().length > 0 &&
        (authType === 'none' ||
            (authType === 'bearer' && (isEditMode || authToken.trim().length > 0)) ||
            (authType === 'api_key' && (isEditMode || (apiKeyHeader.trim().length > 0 && apiKeyValue.trim().length > 0))) ||
            (authType === 'basic' && (isEditMode || (basicUsername.trim().length > 0 && basicPassword.trim().length > 0))));

    const canTestConnection = baseUrl.trim().length > 0;

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Header */}
            <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/rest-destinations/list"
                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-600 rounded-lg">
                                    <Globe className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-semibold text-white">{isEditMode ? 'Edit REST API' : 'Create REST API'}</h1>
                                    <p className="text-sm text-slate-400">{isEditMode ? 'Update REST endpoint' : 'Configure REST endpoint'}</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={!isFormValid || isSaving}
                            className={`
                flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all
                ${isFormValid && !isSaving
                                    ? 'bg-orange-600 hover:bg-orange-500 text-white'
                                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                }
              `}
                        >
                            {isSaving ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    {isEditMode ? 'Update' : 'Save'}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-6 py-8">
                {/* Loading State */}
                {isLoading && (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
                        <span className="ml-3 text-slate-400">Loading REST destination...</span>
                    </div>
                )}

                {/* Alerts */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                        <p className="text-emerald-400 text-sm">{success}</p>
                    </div>
                )}

                {!isLoading && (
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* HTTP Method Selection */}
                        <section className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                            <h2 className="text-lg font-semibold text-white mb-4">HTTP Method</h2>
                            <div className="flex flex-wrap gap-3">
                                {httpMethods.map((m) => (
                                    <button
                                        key={m.value}
                                        type="button"
                                        onClick={() => setMethod(m.value)}
                                        className={`
                    px-4 py-2 rounded-lg border-2 text-sm font-bold transition-all
                    ${method === m.value
                                                ? m.color
                                                : 'border-slate-700 hover:border-slate-600 bg-slate-800/50 text-slate-400'
                                            }
                  `}
                                    >
                                        {m.label}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Basic Information */}
                        <section className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                            <h2 className="text-lg font-semibold text-white mb-6">Basic Information</h2>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                                        Name <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g., Slack Webhook, Salesforce API"
                                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        id="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Describe what this endpoint is used for..."
                                        rows={2}
                                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Endpoint Configuration */}
                        <section className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <Globe className="w-5 h-5 text-slate-400" />
                                <h2 className="text-lg font-semibold text-white">Endpoint</h2>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="baseUrl" className="block text-sm font-medium text-slate-300 mb-2">
                                        URL <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        id="baseUrl"
                                        type="url"
                                        value={baseUrl}
                                        onChange={(e) => setBaseUrl(e.target.value)}
                                        placeholder="https://api.example.com/webhook"
                                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-sm"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="headers" className="block text-sm font-medium text-slate-300 mb-2">
                                        Custom Headers <span className="text-slate-500 text-xs">(JSON format)</span>
                                    </label>
                                    <textarea
                                        id="headers"
                                        value={headers}
                                        onChange={(e) => setHeaders(e.target.value)}
                                        placeholder='{"Content-Type": "application/json", "X-Custom-Header": "value"}'
                                        rows={2}
                                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none font-mono text-sm"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="timeout" className="block text-sm font-medium text-slate-300 mb-2">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                Timeout (seconds)
                                            </div>
                                        </label>
                                        <input
                                            id="timeout"
                                            type="number"
                                            value={timeoutSeconds}
                                            onChange={(e) => setTimeoutSeconds(parseInt(e.target.value) || 30)}
                                            min={1}
                                            max={300}
                                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Authentication */}
                        <section className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <Lock className="w-5 h-5 text-slate-400" />
                                <h2 className="text-lg font-semibold text-white">Authentication</h2>
                            </div>

                            {/* Auth Type Selection */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                                {authTypes.map((auth) => (
                                    <button
                                        key={auth.value}
                                        type="button"
                                        onClick={() => setAuthType(auth.value)}
                                        className={`
                    p-3 rounded-lg border-2 text-left transition-all
                    ${authType === auth.value
                                                ? 'border-orange-500 bg-orange-500/10'
                                                : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                                            }
                  `}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            {auth.icon && <span className={authType === auth.value ? 'text-orange-400' : 'text-slate-400'}>{auth.icon}</span>}
                                            <span className={`font-medium text-sm ${authType === auth.value ? 'text-orange-400' : 'text-white'}`}>
                                                {auth.label}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500">{auth.description}</p>
                                    </button>
                                ))}
                            </div>

                            {/* Auth Configuration */}
                            {authType === 'bearer' && (
                                <div>
                                    <label htmlFor="authToken" className="block text-sm font-medium text-slate-300 mb-2">
                                        Bearer Token {!isEditMode && <span className="text-red-400">*</span>}
                                        {isEditMode && <span className="text-slate-500 text-xs ml-2">(leave empty to keep current)</span>}
                                    </label>
                                    <input
                                        id="authToken"
                                        type="password"
                                        value={authToken}
                                        onChange={(e) => setAuthToken(e.target.value)}
                                        placeholder="Enter your bearer token..."
                                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    />
                                </div>
                            )}

                            {authType === 'api_key' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="apiKeyHeader" className="block text-sm font-medium text-slate-300 mb-2">
                                            Header Name {!isEditMode && <span className="text-red-400">*</span>}
                                        </label>
                                        <input
                                            id="apiKeyHeader"
                                            type="text"
                                            value={apiKeyHeader}
                                            onChange={(e) => setApiKeyHeader(e.target.value)}
                                            placeholder="X-API-Key"
                                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="apiKeyValue" className="block text-sm font-medium text-slate-300 mb-2">
                                            API Key {!isEditMode && <span className="text-red-400">*</span>}
                                            {isEditMode && <span className="text-slate-500 text-xs ml-2">(leave empty to keep)</span>}
                                        </label>
                                        <input
                                            id="apiKeyValue"
                                            type="password"
                                            value={apiKeyValue}
                                            onChange={(e) => setApiKeyValue(e.target.value)}
                                            placeholder="Your API key..."
                                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            )}

                            {authType === 'basic' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="basicUsername" className="block text-sm font-medium text-slate-300 mb-2">
                                            Username {!isEditMode && <span className="text-red-400">*</span>}
                                        </label>
                                        <input
                                            id="basicUsername"
                                            type="text"
                                            value={basicUsername}
                                            onChange={(e) => setBasicUsername(e.target.value)}
                                            placeholder="Username"
                                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="basicPassword" className="block text-sm font-medium text-slate-300 mb-2">
                                            Password {!isEditMode && <span className="text-red-400">*</span>}
                                            {isEditMode && <span className="text-slate-500 text-xs ml-2">(leave empty to keep)</span>}
                                        </label>
                                        <input
                                            id="basicPassword"
                                            type="password"
                                            value={basicPassword}
                                            onChange={(e) => setBasicPassword(e.target.value)}
                                            placeholder="Password"
                                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* Request Body Fields */}
                        <section className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <FileJson className="w-5 h-5 text-slate-400" />
                                    <h2 className="text-lg font-semibold text-white">Request Body Fields</h2>
                                </div>
                                <button
                                    type="button"
                                    onClick={addBodyField}
                                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 rounded-lg transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Field
                                </button>
                            </div>

                            <p className="text-sm text-slate-400 mb-4">
                                Define the fields expected in the request body. You can map source data to these fields in the workflow editor.
                            </p>

                            {bodyFields.length === 0 ? (
                                <div className="text-center py-8 border border-dashed border-slate-700 rounded-lg">
                                    <p className="text-slate-500 text-sm">No body fields defined.</p>
                                    <p className="text-slate-600 text-xs mt-1">Click &quot;Add Field&quot; to define request body structure.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {bodyFields.map((field, index) => (
                                        <div key={field.id} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                                            <div className="grid grid-cols-12 gap-3 items-start">
                                                <div className="col-span-4">
                                                    <label className="block text-xs text-slate-400 mb-1">Field Name</label>
                                                    <input
                                                        type="text"
                                                        value={field.name}
                                                        onChange={(e) => updateBodyField(field.id, { name: e.target.value })}
                                                        placeholder="e.g., temperature"
                                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="block text-xs text-slate-400 mb-1">Type</label>
                                                    <select
                                                        value={field.type}
                                                        onChange={(e) => updateBodyField(field.id, { type: e.target.value as BodyField['type'] })}
                                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                    >
                                                        <option value="string">String</option>
                                                        <option value="number">Number</option>
                                                        <option value="boolean">Boolean</option>
                                                        <option value="json">JSON</option>
                                                    </select>
                                                </div>
                                                <div className="col-span-4">
                                                    <label className="block text-xs text-slate-400 mb-1">Description</label>
                                                    <input
                                                        type="text"
                                                        value={field.description}
                                                        onChange={(e) => updateBodyField(field.id, { description: e.target.value })}
                                                        placeholder="Optional description"
                                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                    />
                                                </div>
                                                <div className="col-span-1 flex items-end pb-1">
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={field.required}
                                                            onChange={(e) => updateBodyField(field.id, { required: e.target.checked })}
                                                            className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-orange-500 focus:ring-orange-500"
                                                        />
                                                        <span className="text-xs text-slate-400">Req</span>
                                                    </label>
                                                </div>
                                                <div className="col-span-1 flex items-end justify-end pb-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeBodyField(field.id)}
                                                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Test Connection */}
                        <section className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Wifi className="w-5 h-5 text-slate-400" />
                                    <h2 className="text-lg font-semibold text-white">Test Connection</h2>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleTestConnection}
                                    disabled={!canTestConnection || isTesting}
                                    className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${canTestConnection && !isTesting
                                            ? 'bg-blue-600 hover:bg-blue-500 text-white'
                                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                        }
                `}
                                >
                                    {isTesting ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            Testing...
                                        </>
                                    ) : (
                                        <>
                                            <Wifi className="w-4 h-4" />
                                            Test Connection
                                        </>
                                    )}
                                </button>
                            </div>

                            {testResult && (
                                <div
                                    className={`
                  p-4 rounded-lg flex items-center gap-3
                  ${testResult.success
                                            ? 'bg-emerald-500/10 border border-emerald-500/30'
                                            : 'bg-red-500/10 border border-red-500/30'
                                        }
                `}
                                >
                                    {testResult.success ? (
                                        <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                    ) : (
                                        <WifiOff className="w-5 h-5 text-red-400 flex-shrink-0" />
                                    )}
                                    <div className="flex-1">
                                        <p className={testResult.success ? 'text-emerald-400' : 'text-red-400'}>
                                            {testResult.message}
                                        </p>
                                        <div className="flex gap-4 mt-1 text-sm text-slate-400">
                                            {testResult.statusCode && <span>Status: {testResult.statusCode}</span>}
                                            {testResult.latency && <span>Latency: {testResult.latency}</span>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!testResult && (
                                <p className="text-sm text-slate-400">
                                    Test your endpoint before saving to ensure it&apos;s accessible.
                                </p>
                            )}
                        </section>
                    </form>
                )}
            </main>
        </div>
    );
}
