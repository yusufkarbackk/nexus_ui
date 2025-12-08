'use client';

import { Handle, Position, useReactFlow, NodeProps } from '@xyflow/react';
import { Database, X, Server } from 'lucide-react';
import { DestinationNodeData, nodeCategories } from '../../types/workflowTypes';

export function DestinationNode({ id, data, selected }: NodeProps<DestinationNodeData>) {
  const { deleteElements } = useReactFlow();
  const categoryStyle = nodeCategories.destination;

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    deleteElements({ nodes: [{ id }] });
    console.log('Nodeselect:', id);
  };

  const destination = data.destination;
  const isUp = destination?.status === 'up';

  const getDbIcon = () => {
    if (destination?.connectionType === 'postgresql') {
      return <Server className={`w-5 h-5 ${categoryStyle.color}`} strokeWidth={2} />;
    }
    return <Database className={`w-5 h-5 ${categoryStyle.color}`} strokeWidth={2} />;
  };

  return (
    <div
      className={`
        group relative min-w-[240px] max-w-[280px] rounded-xl border-2 shadow-lg
        transition-all duration-200 ease-in-out
        ${categoryStyle.bgColor} ${categoryStyle.borderColor}
        ${selected ? 'ring-2 ring-teal-500 ring-offset-2 scale-105' : 'hover:scale-102'}
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
        className="!w-3 !h-3 !bg-teal-400 !border-2 !border-white hover:!bg-teal-600 transition-colors"
      />

      {/* Node Header */}
      <div
        className={`
          flex items-center gap-3 px-4 py-3 border-b
          ${categoryStyle.borderColor}
        `}
      >
        <div className="p-2 rounded-lg bg-teal-100">
          {getDbIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-sm ${categoryStyle.color} truncate`}>
            {destination?.name || data.label}
          </h3>
          <p className="text-[10px] text-slate-500">
            {destination?.connectionType?.toUpperCase()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Status indicator */}
          <div
            className={`
              w-2 h-2 rounded-full
              ${isUp ? 'bg-green-500' : 'bg-red-500'}
            `}
            title={isUp ? 'Connected' : 'Disconnected'}
          />
          <div className="px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide bg-teal-200 text-teal-700">
            Dest
          </div>
        </div>
      </div>

      {/* Node Body */}
      <div className="px-4 py-3">
        <p className="text-xs text-slate-500 leading-relaxed mb-2">
          {destination?.description || 'Destination database'}
        </p>
        
        {/* Connection details */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Host:</span>
            <span className="text-slate-600 font-mono text-[10px] truncate max-w-[140px]">
              {destination?.host}:{destination?.port}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Database:</span>
            <span className="text-slate-600 font-mono text-[10px] truncate max-w-[140px]">
              {destination?.databaseName}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}


