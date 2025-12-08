'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Zap,
  ArrowLeft,
  Plus,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  Search,
  Calendar,
  FileJson,
} from 'lucide-react';
import { fetchApplications, deleteApplication, Application } from '@/app/lib/api';

export function ApplicationList() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadApplications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchApplications();
      if (response.success) {
        setApplications(response.data);
      } else {
        setError(response.message);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load applications';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const handleCopyAppKey = async (appKey: string) => {
    await navigator.clipboard.writeText(appKey);
    setCopiedId(appKey);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await deleteApplication(id);
      if (response.success) {
        setApplications((prev) => prev.filter((app) => app.id !== id));
      } else {
        setError(response.message);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete application';
      setError(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredApplications = applications.filter(
    (app) =>
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.appKey.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
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
                  <h1 className="text-lg font-semibold text-white">Sender Apps</h1>
                  <p className="text-sm text-slate-400">Manage your registered applications</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={loadApplications}
                disabled={isLoading}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <Link
                href="/sender-apps"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                New App
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-300"
            >
              ×
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-16">
            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Loading applications...</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="text-center py-16">
            <div className="p-4 bg-slate-800 rounded-full w-fit mx-auto mb-4">
              <Zap className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchTerm ? 'No applications found' : 'No applications yet'}
            </h3>
            <p className="text-slate-400 mb-6">
              {searchTerm
                ? 'Try a different search term'
                : 'Create your first sender app to get started'}
            </p>
            {!searchTerm && (
              <Link
                href="/sender-apps"
                className="inline-flex items-center gap-2 px-6 py-3 text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create First App
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredApplications.map((app) => (
              <Link
                key={app.id}
                href={`/sender-apps?id=${app.id}`}
                className="group bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors block cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white truncate">{app.name}</h3>
                      <span className="px-2 py-0.5 text-xs font-medium bg-emerald-500/20 text-emerald-400 rounded-full">
                        Active
                      </span>
                    </div>

                    {app.description && (
                      <p className="text-sm text-slate-400 mb-3 line-clamp-2">{app.description}</p>
                    )}

                    {/* App Key */}
                    <div className="flex items-center gap-2 mb-3">
                      <code className="text-sm text-emerald-400 font-mono bg-slate-800 px-3 py-1.5 rounded-lg truncate max-w-md">
                        {app.appKey}
                      </code>
                      <button
                        onClick={() => handleCopyAppKey(app.appKey)}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                        title="Copy API Key"
                      >
                        {copiedId === app.appKey ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Meta Info */}
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <FileJson className="w-3.5 h-3.5" />
                        <span>{app.fields?.length || 0} fields</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Created {formatDate(app.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDelete(app.id, app.name);
                      }}
                      disabled={deletingId === app.id}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete"
                    >
                      {deletingId === app.id ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Stats */}
        {!isLoading && filteredApplications.length > 0 && (
          <div className="mt-6 text-center text-sm text-slate-500">
            Showing {filteredApplications.length} of {applications.length} applications
          </div>
        )}
      </main>
    </div>
  );
}


