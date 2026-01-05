'use client';

import { Handle, Position, useReactFlow } from '@xyflow/react';
import { Globe, X, Zap, Key, Lock } from 'lucide-react';
import { RestDestinationNodeData, nodeCategories } from '../../types/workflowTypes';

interface RestDestinationNodeProps {
    id: string;
    data: RestDestinationNodeData;
    selected?: boolean;
}

export function RestDestinationNode({ id, data, selected }: RestDestinationNodeProps) {
    const { deleteElements } = useReactFlow();
    const categoryStyle = nodeCategories.restDestination;

    const handleDelete = (event: React.MouseEvent) => {
        event.stopPropagation();
        deleteElements({ nodes: [{ id }] });
    };

    const restDestination = data.restDestination;
    const isUp = restDestination?.status === 'up';

    const getAuthIcon = () => {
        switch (restDestination?.authType) {
            case 'bearer':
                return <Key className="w-3 h-3 text-orange-500" />;
            case 'api_key':
                return <Zap className="w-3 h-3 text-orange-500" />;
            case 'basic':
                return <Lock className="w-3 h-3 text-orange-500" />;
            default:
                return null;
        }
    };

    const getMethodColor = () => {
        switch (restDestination?.method) {
            case 'GET':
                return 'bg-green-100 text-green-700';
            case 'POST':
                return 'bg-blue-100 text-blue-700';
            case 'PUT':
                return 'bg-yellow-100 text-yellow-700';
            case 'PATCH':
                return 'bg-purple-100 text-purple-700';
            case 'DELETE':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-slate-100 text-slate-700';
        }
    };

    // Extract domain from URL for display
    const getDomain = (url: string) => {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname;
        } catch {
            return url;
        }
    };

    return (
        <div
            className={`
        group relative min-w-[240px] max-w-[280px] rounded-xl border-2 shadow-lg
        transition-all duration-200 ease-in-out
        ${categoryStyle.bgColor} ${categoryStyle.borderColor}
        ${selected ? 'ring-2 ring-orange-500 ring-offset-2 scale-105' : 'hover:scale-102'}
      `}
        >
            {/* Delete Button */}
            <button
                onClick={handleDelete}
                className={`
          absolute -top-2 -right-2 z-10
          w-6 h-6 rounded-full
          bg-red-500 hover:bg-red-600
          text-white
          flex items-center justify-center
          opacity-0 group-hover:opacity-100
          transition-all duration-200
          shadow-md hover:scale-110
        `}
                title="Delete node"
            >
                <X className="w-3.5 h-3.5" strokeWidth={3} />
            </button>

            {/* Target Handle (Left) - receives from sender apps */}
            <Handle
                type="target"
                position={Position.Left}
                className="!w-3 !h-3 !bg-orange-400 !border-2 !border-white hover:!bg-orange-600 transition-colors"
            />

            {/* Node Header */}
            <div
                className={`
          flex items-center gap-3 px-4 py-3 border-b
          ${categoryStyle.borderColor}
        `}
            >
                <div className="p-2 rounded-lg bg-orange-100">
                    <Globe className={`w-5 h-5 ${categoryStyle.color}`} strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold text-sm ${categoryStyle.color} truncate`}>
                        {restDestination?.name || data.label}
                    </h3>
                    <p className="text-[10px] text-slate-500">
                        REST API
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Auth indicator */}
                    {getAuthIcon()}
                    {/* Status indicator */}
                    <div
                        className={`
              w-2 h-2 rounded-full
              ${isUp ? 'bg-green-500' : 'bg-red-500'}
            `}
                        title={isUp ? 'Active' : 'Inactive'}
                    />
                    <div className="px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide bg-orange-200 text-orange-700">
                        REST
                    </div>
                </div>
            </div>

            {/* Node Body */}
            <div className="px-4 py-3">
                <p className="text-xs text-slate-500 leading-relaxed mb-2">
                    {restDestination?.description || 'REST API endpoint'}
                </p>

                {/* Connection details */}
                <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Method:</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${getMethodColor()}`}>
                            {restDestination?.method || 'POST'}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">URL:</span>
                        <span className="text-slate-600 font-mono text-[10px] truncate max-w-[140px]" title={restDestination?.baseUrl}>
                            {restDestination?.baseUrl ? getDomain(restDestination.baseUrl) : 'N/A'}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Auth:</span>
                        <span className="text-slate-600 text-[10px] capitalize">
                            {restDestination?.authType?.replace('_', ' ') || 'None'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
