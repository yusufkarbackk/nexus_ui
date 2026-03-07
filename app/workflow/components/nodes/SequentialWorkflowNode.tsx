'use client';

import { Handle, Position, useReactFlow } from '@xyflow/react';
import { GitBranch, X } from 'lucide-react';
import { SequentialWorkflowNodeData, nodeCategories } from '../../types/workflowTypes';

interface SequentialWorkflowNodeProps {
    id: string;
    data: SequentialWorkflowNodeData;
    selected?: boolean;
}

export function SequentialWorkflowNode({ id, data, selected }: SequentialWorkflowNodeProps) {
    const { deleteElements } = useReactFlow();
    const categoryStyle = nodeCategories.sequentialWorkflow;

    const handleDelete = (event: React.MouseEvent) => {
        event.stopPropagation();
        deleteElements({ nodes: [{ id }] });
    };

    const isActive = data.sequentialWorkflowIsActive;

    return (
        <div
            className={`
        group relative min-w-[240px] max-w-[280px] rounded-xl border-2 shadow-lg
        transition-all duration-200 ease-in-out
        ${categoryStyle.bgColor} ${categoryStyle.borderColor}
        ${selected ? 'ring-2 ring-purple-500 ring-offset-2 scale-105' : 'hover:scale-102'}
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
                className="!w-3 !h-3 !bg-purple-400 !border-2 !border-white hover:!bg-purple-600 transition-colors"
            />

            {/* Node Header */}
            <div
                className={`
          flex items-center gap-3 px-4 py-3 border-b
          ${categoryStyle.borderColor}
        `}
            >
                <div className="p-2 rounded-lg bg-purple-100">
                    <GitBranch className={`w-5 h-5 ${categoryStyle.color}`} strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold text-sm ${categoryStyle.color} truncate`}>
                        {data.sequentialWorkflowName || data.label}
                    </h3>
                    <p className="text-[10px] text-slate-500">
                        Sequential Workflow
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
                    <div className="px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide bg-purple-200 text-purple-700">
                        SEQ
                    </div>
                </div>
            </div>

            {/* Node Body */}
            <div className="px-4 py-3">
                <p className="text-xs text-slate-500 leading-relaxed">
                    {data.sequentialWorkflowDescription || 'Executes steps in sequence'}
                </p>
            </div>
        </div>
    );
}
