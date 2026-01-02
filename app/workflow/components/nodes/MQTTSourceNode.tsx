'use client';

import { Handle, Position, useReactFlow, NodeProps } from '@xyflow/react';
import { Wifi, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { MQTTSourceNodeData, nodeCategories } from '../../types/workflowTypes';

export function MQTTSourceNode({ id, data, selected }: NodeProps<MQTTSourceNodeData>) {
    const { deleteElements } = useReactFlow();
    const [isExpanded, setIsExpanded] = useState(false);
    const categoryStyle = nodeCategories.mqttSource;

    const handleDelete = (event: React.MouseEvent) => {
        event.stopPropagation();
        deleteElements({ nodes: [{ id }] });
    };

    const fields = data.mqttSource?.fields || [];

    return (
        <div
            className={`
        group relative min-w-[240px] max-w-[280px] rounded-xl border-2 shadow-lg
        transition-all duration-200 ease-in-out
        ${categoryStyle.bgColor} ${categoryStyle.borderColor}
        ${selected ? 'ring-2 ring-violet-500 ring-offset-2 scale-105' : 'hover:scale-102'}
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

            {/* Node Header */}
            <div
                className={`
          flex items-center gap-3 px-4 py-3 border-b
          ${categoryStyle.borderColor}
        `}
            >
                <div className="p-2 rounded-lg bg-violet-100">
                    <Wifi className={`w-5 h-5 ${categoryStyle.color}`} strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold text-sm ${categoryStyle.color} truncate`}>
                        {data.mqttSource?.name || data.label}
                    </h3>
                    <p className="text-[10px] text-slate-500 truncate">
                        {data.mqttSource?.brokerUrl || 'MQTT Source'}
                    </p>
                </div>
                <div className="px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide bg-violet-200 text-violet-700">
                    MQTT
                </div>
            </div>

            {/* Node Body */}
            <div className="px-4 py-3">
                <p className="text-xs text-slate-500 leading-relaxed mb-2">
                    {data.mqttSource?.encryptionEnabled ? '🔒 Encrypted' : '⚡ Real-time data source'}
                </p>

                {/* Fields section */}
                {fields.length > 0 && (
                    <div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsExpanded(!isExpanded);
                            }}
                            className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-800 mb-2"
                        >
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            {fields.length} field{fields.length !== 1 ? 's' : ''}
                        </button>

                        {isExpanded && (
                            <div className="space-y-1 max-h-32 overflow-y-auto">
                                {fields.map((field) => (
                                    <div
                                        key={field.id}
                                        className="flex items-center justify-between px-2 py-1 bg-white/60 rounded text-xs"
                                    >
                                        <span className="font-medium text-slate-700 truncate">{field.name}</span>
                                        <span className="text-slate-400 text-[10px] ml-2">{field.dataType}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Source Handle (Right) - connects to destinations */}
            <Handle
                type="source"
                position={Position.Right}
                className="!w-3 !h-3 !bg-violet-400 !border-2 !border-white hover:!bg-violet-600 transition-colors"
            />
        </div>
    );
}
