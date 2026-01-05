'use client';

import { Handle, Position, useReactFlow } from '@xyflow/react';
import {
  Webhook,
  Globe,
  Clock,
  Database,
  Building,
  Send,
  Filter,
  Shuffle,
  GitMerge,
  GitBranch,
  X,
  LucideIcon,
} from 'lucide-react';
import { CustomNodeData, nodeCategories, NodeCategory } from '../../types/workflowTypes';

const iconMap: Record<string, LucideIcon> = {
  webhook: Webhook,
  globe: Globe,
  clock: Clock,
  database: Database,
  building: Building,
  send: Send,
  filter: Filter,
  shuffle: Shuffle,
  'git-merge': GitMerge,
  'git-branch': GitBranch,
};

interface BaseNodeProps {
  id: string;
  data: CustomNodeData;
  selected?: boolean;
  category: NodeCategory;
  showSourceHandle?: boolean;
  showTargetHandle?: boolean;
}

export function BaseNode({
  id,
  data,
  selected,
  category,
  showSourceHandle = true,
  showTargetHandle = true,
}: BaseNodeProps) {
  const { deleteElements } = useReactFlow();
  const categoryStyle = nodeCategories[category];
  const IconComponent = iconMap[data.icon || 'webhook'] || Webhook;

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    deleteElements({ nodes: [{ id }] });
    console.log('Node deleted:', id);
  };

  return (
    <div
      className={`
        group relative min-w-[200px] rounded-xl border-2 shadow-lg
        transition-all duration-200 ease-in-out
        ${categoryStyle.bgColor} ${categoryStyle.borderColor}
        ${selected ? 'ring-2 ring-indigo-500 ring-offset-2 scale-105' : 'hover:scale-102'}
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

      {/* Target Handle (Left) */}
      {showTargetHandle && (
        <Handle
          type="target"
          position={Position.Left}
          className="!w-3 !h-3 !bg-slate-400 !border-2 !border-white hover:!bg-indigo-500 transition-colors"
        />
      )}

      {/* Node Header */}
      <div
        className={`
          flex items-center gap-3 px-4 py-3 border-b
          ${categoryStyle.borderColor}
        `}
      >
        <div
          className={`
            p-2 rounded-lg
            ${category === 'trigger' ? 'bg-blue-100' : ''}
            ${category === 'action' ? 'bg-emerald-100' : ''}
            ${category === 'logic' ? 'bg-amber-100' : ''}
          `}
        >
          <IconComponent
            className={`w-5 h-5 ${categoryStyle.color}`}
            strokeWidth={2}
          />
        </div>
        <div className="flex-1">
          <h3 className={`font-semibold text-sm ${categoryStyle.color}`}>
            {data.label}
          </h3>
        </div>
        <div
          className={`
            px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide
            ${category === 'trigger' ? 'bg-blue-200 text-blue-700' : ''}
            ${category === 'action' ? 'bg-emerald-200 text-emerald-700' : ''}
            ${category === 'logic' ? 'bg-amber-200 text-amber-700' : ''}
          `}
        >
          {category}
        </div>
      </div>

      {/* Node Body */}
      <div className="px-4 py-3">
        <p className="text-xs text-slate-500 leading-relaxed">
          {data.description || 'No description'}
        </p>
      </div>

      {/* Source Handle (Right) */}
      {showSourceHandle && (
        <Handle
          type="source"
          position={Position.Right}
          className="!w-3 !h-3 !bg-slate-400 !border-2 !border-white hover:!bg-indigo-500 transition-colors"
        />
      )}
    </div>
  );
}
