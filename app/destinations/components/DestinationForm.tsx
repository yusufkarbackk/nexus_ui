'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Database,
  Server,
  Lock,
  RefreshCw,
  Save,
  AlertCircle,
  CheckCircle,
  Wifi,
  WifiOff,
  Loader2,
} from 'lucide-react';
import {
  createDestination,
  updateDestination,
  fetchDestinationById,
  testDestinationConnection,
  ConnectionType,
  CreateDestinationPayload,
} from '@/app/lib/api';

const connectionTypes: { value: ConnectionType; label: string; icon: string; defaultPort: number }[] = [
  { value: 'mysql', label: 'MySQL', icon: '🐬', defaultPort: 3306 },
  { value: 'postgresql', label: 'PostgreSQL', icon: '🐘', defaultPort: 5432 },
];

export function DestinationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  const isEditMode = !!editId;
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [connectionType, setConnectionType] = useState<ConnectionType>('mysql');
  const [host, setHost] = useState('');
  const [port, setPort] = useState(3306);
  const [databaseName, setDatabaseName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    latency?: string;
  } | null>(null);

  // Load existing destination data when in edit mode
  useEffect(() => {
    async function loadDestination() {
      if (!editId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetchDestinationById(parseInt(editId));
        if (response.success && response.data) {
          const dest = response.data;
          setName(dest.name);
          setDescription(dest.description || '');
          setConnectionType(dest.connectionType);
          setHost(dest.host);
          setPort(dest.port);
          setDatabaseName(dest.databaseName);
          setUsername(dest.username);
          // Password is not returned from API for security, keep empty
        } else {
          setError(response.message || 'Failed to load destination');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load destination');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadDestination();
  }, [editId]);

  const handleConnectionTypeChange = useCallback((type: ConnectionType) => {
    setConnectionType(type);
    const dbConfig = connectionTypes.find((d) => d.value === type);
    if (dbConfig) {
      setPort(dbConfig.defaultPort);
    }
  }, []);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await testDestinationConnection({
        connectionType,
        host,
        port,
        databaseName,
        username,
        password,
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
        response = await updateDestination(parseInt(editId), {
          name,
          description: description || undefined,
          connectionType,
          host,
          port,
          databaseName,
          username,
          // Only include password if it was changed (not empty)
          ...(password ? { password } : {}),
        });

        if (response.success) {
          setSuccess('Destination updated successfully!');
          setTimeout(() => {
            router.push('/destinations/list');
          }, 1500);
        } else {
          setError(response.message || 'Failed to update destination');
        }
      } else {
        // Create new destination
        const payload: CreateDestinationPayload = {
          name,
          description: description || undefined,
          connectionType,
          host,
          port,
          databaseName,
          username,
          password,
        };

        response = await createDestination(payload);

        if (response.success) {
          setSuccess('Destination created successfully!');
          setTimeout(() => {
            router.push('/destinations/list');
          }, 1500);
        } else {
          setError(response.message || 'Failed to create destination');
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
    host.trim().length > 0 &&
    port > 0 &&
    databaseName.trim().length > 0 &&
    username.trim().length > 0 &&
    (isEditMode || password.trim().length > 0); // Password required only for new destinations

  const canTestConnection =
    host.trim().length > 0 &&
    port > 0 &&
    databaseName.trim().length > 0 &&
    username.trim().length > 0 &&
    password.trim().length > 0;

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-600 rounded-lg">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-white">{isEditMode ? 'Edit Destination' : 'Create Destination'}</h1>
                  <p className="text-sm text-slate-400">{isEditMode ? 'Update target database' : 'Configure target database'}</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleSubmit}
              disabled={!isFormValid || isSaving}
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all
                ${isFormValid && !isSaving
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
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
                  {isEditMode ? 'Update Destination' : 'Save Destination'}
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
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
            <span className="ml-3 text-slate-400">Loading destination...</span>
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
          {/* Database Type Selection */}
          <section className="bg-slate-900 rounded-xl border border-slate-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Database Type</h2>
            <div className="grid grid-cols-2 gap-4">
              {connectionTypes.map((db) => (
                <button
                  key={db.value}
                  type="button"
                  onClick={() => handleConnectionTypeChange(db.value)}
                  className={`
                    p-4 rounded-lg border-2 text-left transition-all
                    ${connectionType === db.value
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{db.icon}</span>
                    <div>
                      <h3 className={`font-semibold ${connectionType === db.value ? 'text-emerald-400' : 'text-white'}`}>
                        {db.label}
                      </h3>
                      <p className="text-sm text-slate-400">Port {db.defaultPort}</p>
                    </div>
                  </div>
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
                  Destination Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Production MySQL Database"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                  placeholder="Describe what this destination is used for..."
                  rows={2}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          </section>

          {/* Connection Details */}
          <section className="bg-slate-900 rounded-xl border border-slate-800 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Server className="w-5 h-5 text-slate-400" />
              <h2 className="text-lg font-semibold text-white">Connection Details</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 md:col-span-1">
                <label htmlFor="host" className="block text-sm font-medium text-slate-300 mb-2">
                  Host <span className="text-red-400">*</span>
                </label>
                <input
                  id="host"
                  type="text"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  placeholder="e.g., localhost or 192.168.1.100"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label htmlFor="port" className="block text-sm font-medium text-slate-300 mb-2">
                  Port <span className="text-red-400">*</span>
                </label>
                <input
                  id="port"
                  type="number"
                  value={port}
                  onChange={(e) => setPort(parseInt(e.target.value) || 0)}
                  min={1}
                  max={65535}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div className="col-span-2">
                <label htmlFor="databaseName" className="block text-sm font-medium text-slate-300 mb-2">
                  Database Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="databaseName"
                  type="text"
                  value={databaseName}
                  onChange={(e) => setDatabaseName(e.target.value)}
                  placeholder="e.g., nexus_data"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>
          </section>

          {/* Authentication */}
          <section className="bg-slate-900 rounded-xl border border-slate-800 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Lock className="w-5 h-5 text-slate-400" />
              <h2 className="text-lg font-semibold text-white">Authentication</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-2">
                  Username <span className="text-red-400">*</span>
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Database username"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                  Password {!isEditMode && <span className="text-red-400">*</span>}
                  {isEditMode && <span className="text-slate-500 text-xs ml-2">(leave empty to keep current)</span>}
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Database password"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>
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
                <div>
                  <p className={testResult.success ? 'text-emerald-400' : 'text-red-400'}>
                    {testResult.message}
                  </p>
                  {testResult.latency && (
                    <p className="text-sm text-slate-400 mt-1">Latency: {testResult.latency}</p>
                  )}
                </div>
              </div>
            )}

            {!testResult && (
              <p className="text-sm text-slate-400">
                Test your connection before saving to ensure the database is accessible.
              </p>
            )}
          </section>
        </form>
        )}
      </main>
    </div>
  );
}
