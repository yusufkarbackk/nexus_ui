'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Search,
    RefreshCw,
    CheckCircle,
    XCircle,
    Clock,
    ChevronDown,
    ChevronUp,
    Filter,
    BarChart3
} from 'lucide-react';

interface Log {
    id: number;
    dataId: string;
    source: string;
    destination: string;
    host: string;
    dataSent?: string;
    dataReceived?: string;
    sentAt?: string;
    receivedAt?: string;
    message?: string;
    status: string;
    retryCount: number;
    workflowId?: number;
    createdAt: string;
    updatedAt: string;
}

interface LogStats {
    totalLogs: number;
    successCount: number;
    failedCount: number;
    retryCount: number;
    todayCount: number;
    last24Hours: number;
    bySource: Record<string, number>;
    byDestination: Record<string, number>;
}

interface LogsResponse {
    success: boolean;
    message: string;
    data: Log[];
    total: number;
    limit: number;
    offset: number;
}

interface StatsResponse {
    success: boolean;
    message: string;
    data: LogStats;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Get auth headers
function getAuthHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('nexus_token') : null;
    if (token) {
        return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
    }
    return { 'Content-Type': 'application/json' };
}

export default function LogsPage() {
    const [logs, setLogs] = useState<Log[]>([]);
    const [stats, setStats] = useState<LogStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

    // Filters
    const [statusFilter, setStatusFilter] = useState('');
    const [sourceFilter, setSourceFilter] = useState('');
    const [destinationFilter, setDestinationFilter] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [limit] = useState(25);
    const [offset, setOffset] = useState(0);

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (statusFilter) params.append('status', statusFilter);
            if (sourceFilter) params.append('source', sourceFilter);
            if (destinationFilter) params.append('destination', destinationFilter);
            if (dateFrom) params.append('from', dateFrom);
            if (dateTo) params.append('to', dateTo);
            params.append('limit', limit.toString());
            params.append('offset', offset.toString());

            const response = await fetch(`${API_BASE_URL}/api/logs?${params}`, {
                headers: getAuthHeaders()
            });
            const data: LogsResponse = await response.json();

            if (data.success) {
                setLogs(data.data || []);
                setTotal(data.total);
            }
        } catch (error) {
            console.error('Failed to fetch logs:', error);
        } finally {
            setLoading(false);
        }
    }, [statusFilter, sourceFilter, destinationFilter, dateFrom, dateTo, limit, offset]);

    const fetchStats = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/logs/stats`, {
                headers: getAuthHeaders()
            });
            const data: StatsResponse = await response.json();

            if (data.success) {
                setStats(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    }, []);

    useEffect(() => {
        fetchLogs();
        fetchStats();
    }, [fetchLogs, fetchStats]);

    const toggleRow = (id: number) => {
        const newSet = new Set(expandedRows);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setExpandedRows(newSet);
    };

    const getStatusBadge = (status: string, retryCount: number) => {
        if (status === 'SUCCESS') {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                    <CheckCircle className="w-3 h-3" /> Success
                </span>
            );
        }
        if (status === 'FAILED') {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                    <XCircle className="w-3 h-3" /> Failed
                </span>
            );
        }
        if (status === 'DROPPED') {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-slate-500/20 text-slate-400">
                    <XCircle className="w-3 h-3" /> Dropped
                </span>
            );
        }
        if (status === 'RETRY' || retryCount > 0) {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                    <RefreshCw className="w-3 h-3" /> Retry ({retryCount})
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                <Clock className="w-3 h-3" /> Pending
            </span>
        );
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString();
    };

    const handleRefresh = () => {
        fetchLogs();
        fetchStats();
    };

    const handleClearFilters = () => {
        setStatusFilter('');
        setSourceFilter('');
        setDestinationFilter('');
        setDateFrom('');
        setDateTo('');
        setOffset(0);
    };

    const totalPages = Math.ceil(total / limit);
    const currentPage = Math.floor(offset / limit) + 1;

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Transaction Logs</h1>
                        <p className="text-slate-400 text-sm">Monitor data flow and processing status</p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
                    >
                        <RefreshCw className="w-4 h-4" /> Refresh
                    </button>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <BarChart3 className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-slate-400 text-sm">Total Logs</p>
                                    <p className="text-xl font-bold">{stats.totalLogs.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-500/20 rounded-lg">
                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                </div>
                                <div>
                                    <p className="text-slate-400 text-sm">Success</p>
                                    <p className="text-xl font-bold text-green-400">{stats.successCount.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-500/20 rounded-lg">
                                    <XCircle className="w-5 h-5 text-red-400" />
                                </div>
                                <div>
                                    <p className="text-slate-400 text-sm">Failed</p>
                                    <p className="text-xl font-bold text-red-400">{stats.failedCount.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-yellow-500/20 rounded-lg">
                                    <Clock className="w-5 h-5 text-yellow-400" />
                                </div>
                                <div>
                                    <p className="text-slate-400 text-sm">Last 24h</p>
                                    <p className="text-xl font-bold">{stats.last24Hours.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-slate-800/50 rounded-xl p-4 mb-6 border border-slate-700">
                    <div className="flex items-center gap-2 mb-3">
                        <Filter className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-300">Filters</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setOffset(0); }}
                            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">All Status</option>
                            <option value="SUCCESS">Success</option>
                            <option value="FAILED">Failed</option>
                            <option value="RETRY">Retry</option>
                            <option value="DROPPED">Dropped</option>
                            <option value="PENDING">Pending</option>
                        </select>
                        <input
                            type="text"
                            placeholder="Source..."
                            value={sourceFilter}
                            onChange={(e) => { setSourceFilter(e.target.value); setOffset(0); }}
                            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <input
                            type="text"
                            placeholder="Destination..."
                            value={destinationFilter}
                            onChange={(e) => { setDestinationFilter(e.target.value); setOffset(0); }}
                            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => { setDateFrom(e.target.value); setOffset(0); }}
                            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => { setDateTo(e.target.value); setOffset(0); }}
                            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="mt-3 flex justify-end">
                        <button
                            onClick={handleClearFilters}
                            className="text-sm text-slate-400 hover:text-white transition"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>

                {/* Logs Table */}
                <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-700">
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Time</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Source</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Destination</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Message</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                                        Loading...
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                                        <Search className="w-6 h-6 mx-auto mb-2 opacity-50" />
                                        No logs found
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <React.Fragment key={log.id}>
                                        <tr
                                            key={log.id}
                                            className="border-b border-slate-700/50 hover:bg-slate-700/30 cursor-pointer transition"
                                            onClick={() => toggleRow(log.id)}
                                        >
                                            <td className="px-4 py-3 text-sm text-slate-300">{formatDate(log.createdAt)}</td>
                                            <td className="px-4 py-3">{getStatusBadge(log.status, log.retryCount)}</td>
                                            <td className="px-4 py-3 text-sm text-slate-300">{log.source}</td>
                                            <td className="px-4 py-3 text-sm text-slate-300">{log.destination}</td>
                                            <td className="px-4 py-3 text-sm text-slate-400 max-w-xs truncate">{log.message || '-'}</td>
                                            <td className="px-4 py-3">
                                                {expandedRows.has(log.id) ? (
                                                    <ChevronUp className="w-4 h-4 text-slate-400" />
                                                ) : (
                                                    <ChevronDown className="w-4 h-4 text-slate-400" />
                                                )}
                                            </td>
                                        </tr>
                                        {expandedRows.has(log.id) && (
                                            <tr key={`${log.id}-details`} className="bg-slate-900/50">
                                                <td colSpan={6} className="px-4 py-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <h4 className="text-xs font-medium text-slate-400 mb-2">Data Sent</h4>
                                                            <pre className="bg-slate-950 rounded-lg p-3 text-xs text-slate-300 overflow-auto max-h-40">
                                                                {log.dataSent ? JSON.stringify(JSON.parse(log.dataSent), null, 2) : '-'}
                                                            </pre>
                                                        </div>
                                                        <div>
                                                            <h4 className="text-xs font-medium text-slate-400 mb-2">Data Received</h4>
                                                            <pre className="bg-slate-950 rounded-lg p-3 text-xs text-slate-300 overflow-auto max-h-40">
                                                                {log.dataReceived || '-'}
                                                            </pre>
                                                        </div>
                                                    </div>
                                                    <div className="mt-3 flex gap-4 text-xs text-slate-500">
                                                        <span>ID: {log.dataId}</span>
                                                        <span>Host: {log.host}</span>
                                                        {log.sentAt && <span>Sent: {formatDate(log.sentAt)}</span>}
                                                        {log.receivedAt && <span>Received: {formatDate(log.receivedAt)}</span>}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))
                            )}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    {!loading && logs.length > 0 && (
                        <div className="px-4 py-3 border-t border-slate-700 flex items-center justify-between">
                            <span className="text-sm text-slate-400">
                                Showing {offset + 1} - {Math.min(offset + limit, total)} of {total} logs
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setOffset(Math.max(0, offset - limit))}
                                    disabled={offset === 0}
                                    className="px-3 py-1 bg-slate-700 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition"
                                >
                                    Previous
                                </button>
                                <span className="px-3 py-1 text-sm text-slate-400">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setOffset(offset + limit)}
                                    disabled={offset + limit >= total}
                                    className="px-3 py-1 bg-slate-700 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
