'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Workflow,
  ArrowLeft,
  Plus,
  Trash2,
  RefreshCw,
  AlertCircle,
  Search,
  Calendar,
  GitBranch,
  Database,
  Send,
  CheckCircle,
  XCircle,
  ToggleLeft,
  ToggleRight,
  Eye,
  Edit,
  ArrowRight,
} from 'lucide-react';
import {
  fetchWorkflows,
  deleteWorkflow,
  updateWorkflow,
  Workflow as WorkflowType,
} from '@/app/lib/api';

export function WorkflowList() {
  const [workflows, setWorkflows] = useState<WorkflowType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const loadWorkflows = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchWorkflows();
      if (response.success) {
        setWorkflows(response.data);
      } else {
        setError(response.message);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load workflows';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWorkflows();
  }, [loadWorkflows]);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This will also delete all associated pipelines and mappings. This action cannot be undone.`)) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await deleteWorkflow(id);
      if (response.success) {
        setWorkflows((prev) => prev.filter((wf) => wf.id !== id));
      } else {
        setError(response.message || 'Failed to delete workflow');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete workflow';
      setError(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (workflow: WorkflowType) => {
    setTogglingId(workflow.id);
    try {
      const response = await updateWorkflow(workflow.id, {
        isActive: !workflow.isActive,
      });
      if (response.success && response.data) {
        setWorkflows((prev) =>
          prev.map((wf) =>
            wf.id === workflow.id ? { ...wf, isActive: response.data!.isActive } : wf
          )
        );
      } else {
        setError(response.message || 'Failed to toggle status');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle status';
      setError(errorMessage);
    } finally {
      setTogglingId(null);
    }
  };

  const filteredWorkflows = workflows.filter(
    (wf) =>
      wf.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wf.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getPipelineCount = (workflow: WorkflowType) => {
    return workflow.pipelines?.length || 0;
  };

  const getMappingCount = (workflow: WorkflowType) => {
    return workflow.pipelines?.reduce((acc, p) => acc + (p.fieldMappings?.length || 0), 0) || 0;
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
                  <Workflow className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-white">Workflows</h1>
                  <p className="text-sm text-slate-400">Manage your data integration pipelines</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={loadWorkflows}
                disabled={isLoading}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <Link
                href="/workflow"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Workflow
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
              placeholder="Search workflows..."
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
            <p className="text-slate-400">Loading workflows...</p>
          </div>
        ) : filteredWorkflows.length === 0 ? (
          <div className="text-center py-16">
            <div className="p-4 bg-slate-800 rounded-full w-fit mx-auto mb-4">
              <Workflow className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchTerm ? 'No workflows found' : 'No workflows yet'}
            </h3>
            <p className="text-slate-400 mb-6">
              {searchTerm
                ? 'Try a different search term'
                : 'Create your first data integration workflow to get started'}
            </p>
            {!searchTerm && (
              <Link
                href="/workflow"
                className="inline-flex items-center gap-2 px-6 py-3 text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create First Workflow
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredWorkflows.map((workflow) => (
              <Link
                key={workflow.id}
                href={`/workflow?id=${workflow.id}`}
                className={`
                  group bg-slate-900 border rounded-xl p-5 transition-colors block cursor-pointer
                  ${workflow.isActive
                    ? 'border-slate-800 hover:border-slate-700'
                    : 'border-slate-800/50 opacity-60'
                  }
                `}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Workflow Icon */}
                    <div className="p-3 bg-indigo-500/20 rounded-lg">
                      <GitBranch className="w-6 h-6 text-indigo-400" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold text-white truncate">{workflow.name}</h3>
                        {workflow.isActive ? (
                          <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-emerald-500/20 text-emerald-400 rounded-full">
                            <CheckCircle className="w-3 h-3" />
                            Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-slate-500/20 text-slate-400 rounded-full">
                            <XCircle className="w-3 h-3" />
                            Inactive
                          </span>
                        )}
                      </div>

                      {workflow.description && (
                        <p className="text-sm text-slate-400 mb-3 line-clamp-1">{workflow.description}</p>
                      )}

                      {/* Pipeline Info */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Send className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{getPipelineCount(workflow)} pipeline{getPipelineCount(workflow) !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Database className="w-3.5 h-3.5 text-teal-400" />
                          <span>{getMappingCount(workflow)} mapping{getMappingCount(workflow) !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formatDate(workflow.createdAt)}</span>
                        </div>
                      </div>

                      {/* Pipelines Preview */}
                      {workflow.pipelines && workflow.pipelines.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {workflow.pipelines.slice(0, 3).map((pipeline) => (
                            <div
                              key={pipeline.id}
                              className="flex items-center gap-1.5 px-2 py-1 bg-slate-800 rounded text-xs"
                            >
                              <span className="text-indigo-400">{pipeline.application?.name || 'App'}</span>
                              <ArrowRight className="w-3 h-3 text-slate-500" />
                              <span className="text-teal-400">{pipeline.destination?.name || 'Dest'}</span>
                              <span className="text-slate-500">→ {pipeline.targetTable}</span>
                            </div>
                          ))}
                          {workflow.pipelines.length > 3 && (
                            <span className="px-2 py-1 text-xs text-slate-500">
                              +{workflow.pipelines.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleToggleStatus(workflow);
                      }}
                      disabled={togglingId === workflow.id}
                      className={`
                        p-2 rounded-lg transition-colors
                        ${workflow.isActive
                          ? 'text-emerald-400 hover:bg-emerald-500/10'
                          : 'text-slate-400 hover:bg-slate-700'
                        }
                      `}
                      title={workflow.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {togglingId === workflow.id ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : workflow.isActive ? (
                        <ToggleRight className="w-5 h-5" />
                      ) : (
                        <ToggleLeft className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDelete(workflow.id, workflow.name);
                      }}
                      disabled={deletingId === workflow.id}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete"
                    >
                      {deletingId === workflow.id ? (
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
        {!isLoading && filteredWorkflows.length > 0 && (
          <div className="mt-6 text-center text-sm text-slate-500">
            Showing {filteredWorkflows.length} of {workflows.length} workflows
            {' • '}
            {workflows.filter((wf) => wf.isActive).length} active
          </div>
        )}
      </main>
    </div>
  );
}


