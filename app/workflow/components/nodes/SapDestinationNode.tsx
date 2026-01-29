'use client';

import { Handle, Position, useReactFlow } from '@xyflow/react';
import { Server, X, Database } from 'lucide-react';
import { SapDestinationNodeData, nodeCategories } from '../../types/workflowTypes';

interface SapDestinationNodeProps {
    id: string;
    data: SapDestinationNodeData;
    selected?: boolean;
}

export function SapDestinationNode({ id, data, selected }: SapDestinationNodeProps) {
    const { deleteElements } = useReactFlow();
    const categoryStyle = nodeCategories.sapDestination;

    const handleDelete = (event: React.MouseEvent) => {
        event.stopPropagation();
        deleteElements({ nodes: [{ id }] });
    };

    const sapDestination = data.sapDestination;
    const isActive = sapDestination?.status === 'active';

    return (
        <div
            className={`
        group relative min-w-[240px] max-w-[280px] rounded-xl border-2 shadow-lg
        transition-all duration-200 ease-in-out
        ${categoryStyle.bgColor} ${categoryStyle.borderColor}
        ${selected ? 'ring-2 ring-rose-500 ring-offset-2 scale-105' : 'hover:scale-102'}
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
                className="!w-3 !h-3 !bg-rose-400 !border-2 !border-white hover:!bg-rose-600 transition-colors"
            />

            {/* Node Header */}
            <div
                className={`
          flex items-center gap-3 px-4 py-3 border-b
          ${categoryStyle.borderColor}
        `}
            >
                <div className="p-2 rounded-lg bg-rose-100">
                    <Database className={`w-5 h-5 ${categoryStyle.color}`} strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold text-sm ${categoryStyle.color} truncate`}>
                        {sapDestination?.name || data.label}
                    </h3>
                    <p className="text-[10px] text-slate-500">
                        SAP HANA ODBC
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Status indicator */}
                    <div
                        className={`
              w-2 h-2 rounded-full
              ${isActive ? 'bg-green-500' : 'bg-red-500'}
            `}
                        title={isActive ? 'Active' : 'Inactive'}
                    />
                    <div className="px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide bg-rose-200 text-rose-700">
                        SAP
                    </div>
                </div>
            </div>

            {/* Node Body */}
            <div className="px-4 py-3">
                <p className="text-xs text-slate-500 leading-relaxed mb-2">
                    {sapDestination?.description || 'SAP HANA Database Query'}
                </p>

                {/* Connection details */}
                <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">DSN:</span>
                        <span className="text-slate-600 font-mono text-[10px] truncate max-w-[140px]">
                            {sapDestination?.dsn_name}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Timeout:</span>
                        <span className="text-slate-600 font-mono text-[10px]">
                            {sapDestination?.timeout_seconds}s
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Max Rows:</span>
                        <span className="text-slate-600 font-mono text-[10px]">
                            {sapDestination?.max_rows}
                        </span>
                    </div>
                </div>

                {/* Click hint */}
                <div className="mt-3 pt-2 border-t border-rose-200">
                    <p className="text-[10px] text-rose-500 text-center">
                        Connect to configure SQL query
                    </p>
                </div>
            </div>
        </div>
    );
}
