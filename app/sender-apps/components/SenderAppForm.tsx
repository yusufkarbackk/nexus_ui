'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  RefreshCw, 
  Plus, 
  Copy, 
  Check, 
  Save,
  ArrowLeft,
  Zap,
  Info,
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { DataField } from '../types/senderAppTypes';
import { generateAppId, generateFieldId } from '../utils/generateAppId';
import { DataFieldRow } from './DataFieldRow';
import { createApplication, updateApplication, fetchApplicationById, ApplicationFieldPayload } from '@/app/lib/api';

export function SenderAppForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  const isEditMode = !!editId;
  
  const [appName, setAppName] = useState('');
  const [appDescription, setAppDescription] = useState('');
  const [appId, setAppId] = useState(() => generateAppId());
  const [dataFields, setDataFields] = useState<DataField[]>([]);
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load existing application data when in edit mode
  useEffect(() => {
    async function loadApplication() {
      if (!editId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetchApplicationById(parseInt(editId));
        if (response.success && response.data) {
          const app = response.data;
          setAppName(app.name);
          setAppDescription(app.description || '');
          setAppId(app.appKey);
          
          // Convert fields to DataField format
          if (app.fields && app.fields.length > 0) {
            const fields: DataField[] = app.fields.map((field) => ({
              id: field.id.toString(),
              name: field.name,
              type: field.dataType,
              required: false,
              description: field.description || undefined,
            }));
            setDataFields(fields);
          }
        } else {
          setError(response.message || 'Failed to load application');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load application');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadApplication();
  }, [editId]);

  const regenerateAppId = useCallback(() => {
    setAppId(generateAppId());
  }, []);

  const copyAppId = useCallback(async () => {
    await navigator.clipboard.writeText(appId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [appId]);

  const addDataField = useCallback(() => {
    const newField: DataField = {
      id: generateFieldId(),
      name: '',
      type: 'string',
      required: false,
    };
    setDataFields((prev) => [...prev, newField]);
  }, []);

  const updateDataField = useCallback((id: string, updates: Partial<DataField>) => {
    setDataFields((prev) =>
      prev.map((field) => (field.id === id ? { ...field, ...updates } : field))
    );
  }, []);

  const removeDataField = useCallback((id: string) => {
    setDataFields((prev) => prev.filter((field) => field.id !== id));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Convert data fields to API format
      const fieldsPayload: ApplicationFieldPayload[] = dataFields
        .filter((field) => field.name.trim().length > 0)
        .map((field) => ({
          name: field.name,
          dataType: field.type,
          description: field.description || undefined,
        }));

      let response;
      
      if (isEditMode && editId) {
        // Update existing application
        response = await updateApplication(parseInt(editId), {
          name: appName,
          description: appDescription || undefined,
          fields: fieldsPayload.length > 0 ? fieldsPayload : undefined,
        });
        
        if (response.success) {
          setSuccess('Sender App updated successfully!');
          setTimeout(() => {
            router.push('/sender-apps/list');
          }, 1500);
        } else {
          setError(response.message || 'Failed to update application');
        }
      } else {
        // Create new application
        response = await createApplication({
          name: appName,
          description: appDescription || undefined,
          appKey: appId,
          fields: fieldsPayload.length > 0 ? fieldsPayload : undefined,
        });

        if (response.success) {
          setSuccess('Sender App created successfully!');
          setTimeout(() => {
            router.push('/sender-apps/list');
          }, 1500);
        } else {
          setError(response.message || 'Failed to create application');
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Error saving application:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const isFormValid = appName.trim().length > 0;

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600 rounded-lg">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-white">{isEditMode ? 'Edit Sender App' : 'Create Sender App'}</h1>
                  <p className="text-sm text-slate-400">{isEditMode ? 'Update your data source' : 'Configure your data source'}</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleSubmit}
              disabled={!isFormValid || isSaving}
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all
                ${isFormValid && !isSaving
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
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
                  {isEditMode ? 'Update App' : 'Save App'}
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            <span className="ml-3 text-slate-400">Loading application...</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <p className="text-emerald-400 text-sm">{success}</p>
          </div>
        )}

        {!isLoading && (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* App ID Section */}
          <section className="bg-slate-900 rounded-xl border border-slate-800 p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-500/20 rounded-lg">
                <Info className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-white mb-1">App Identifier (API Key)</h2>
                <p className="text-sm text-slate-400 mb-4">
                  This unique key will be used to authenticate API calls. Include it as <code className="text-emerald-400 bg-slate-800 px-1 rounded">X-API-Key</code> header.
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 flex items-center bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                    <code className="flex-1 px-4 py-3 text-emerald-400 font-mono text-sm">
                      {appId}
                    </code>
                    <button
                      type="button"
                      onClick={copyAppId}
                      className="px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors border-l border-slate-700"
                      title="Copy to clipboard"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {!isEditMode && (
                    <button
                      type="button"
                      onClick={regenerateAppId}
                      className="flex items-center gap-2 px-4 py-3 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
                      title="Generate new ID"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span className="text-sm">Regenerate</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Basic Info Section */}
          <section className="bg-slate-900 rounded-xl border border-slate-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="appName" className="block text-sm font-medium text-slate-300 mb-2">
                  App Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="appName"
                  type="text"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="e.g., Customer CRM System"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="appDescription" className="block text-sm font-medium text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  id="appDescription"
                  value={appDescription}
                  onChange={(e) => setAppDescription(e.target.value)}
                  placeholder="Describe what this sender app does..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          </section>

          {/* Data Fields Section */}
          <section className="bg-slate-900 rounded-xl border border-slate-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-white">Data Schema</h2>
                <p className="text-sm text-slate-400 mt-1">
                  Define the fields that this app will send (saved to database)
                </p>
              </div>
              <button
                type="button"
                onClick={addDataField}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Field
              </button>
            </div>

            {dataFields.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-700 rounded-lg">
                <div className="p-3 bg-slate-800 rounded-full w-fit mx-auto mb-4">
                  <Plus className="w-6 h-6 text-slate-500" />
                </div>
                <h3 className="text-white font-medium mb-1">No fields defined</h3>
                <p className="text-sm text-slate-400 mb-4">
                  Add fields to define the data structure your app will send
                </p>
                <button
                  type="button"
                  onClick={addDataField}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add First Field
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {dataFields.map((field) => (
                  <DataFieldRow
                    key={field.id}
                    field={field}
                    onUpdate={updateDataField}
                    onRemove={removeDataField}
                  />
                ))}
              </div>
            )}
          </section>

          {/* API Usage Example */}
          <section className="bg-slate-900 rounded-xl border border-slate-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">API Usage Example</h2>
            <p className="text-sm text-slate-400 mb-4">
              Use this example to send data to the Nexus Gateway ingress endpoint:
            </p>
            <pre className="bg-slate-950 border border-slate-800 rounded-lg p-4 overflow-x-auto">
              <code className="text-sm text-slate-300">
{`curl -X POST http://localhost:8080/ingress \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${appId}" \\
  -d '${JSON.stringify(
    dataFields.length > 0
      ? dataFields.reduce((acc, field) => {
          acc[field.name || 'field_name'] = getExampleValue(field.type);
          return acc;
        }, {} as Record<string, unknown>)
      : { key: 'value', example: 'data' },
    null,
    2
  )}'`}
              </code>
            </pre>
          </section>
        </form>
        )}
      </main>
    </div>
  );
}

function getExampleValue(type: string): unknown {
  switch (type) {
    case 'string':
      return 'example_value';
    case 'number':
      return 123;
    case 'boolean':
      return true;
    case 'json':
      return { key: 'value' };
    default:
      return null;
  }
}

