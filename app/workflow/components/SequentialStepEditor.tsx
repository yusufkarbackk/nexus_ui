'use client';

import React, { useState, useCallback } from 'react';
import {
    Globe,
    Database,
    Shuffle,
    GitBranch,
    Clock,
    Plus,
    Trash2,
    GripVertical,
    ChevronRight,
    Settings2,
    Power,
    PowerOff,
} from 'lucide-react';
import type { StepType, StepErrorHandling } from '../types/workflowTypes';
import type { WorkflowStepPayload, StepFieldMappingPayload } from '@/app/lib/api';

// ─── Step type metadata ───────────────────────────────────────────
export const STEP_TYPE_META: Record<StepType, { label: string; icon: React.ElementType; color: string; bgColor: string; borderColor: string; description: string }> = {
    rest_call: { label: 'REST Call', icon: Globe, color: 'text-orange-400', bgColor: 'bg-orange-900/30', borderColor: 'border-orange-500/50', description: 'Call a REST API endpoint' },
    db_query: { label: 'DB Query', icon: Database, color: 'text-teal-400', bgColor: 'bg-teal-900/30', borderColor: 'border-teal-500/50', description: 'Run a database query' },
    sap_query: { label: 'SAP Query', icon: Database, color: 'text-rose-400', bgColor: 'bg-rose-900/30', borderColor: 'border-rose-500/50', description: 'Run a SAP HANA query' },
    transform: { label: 'Transform', icon: Shuffle, color: 'text-purple-400', bgColor: 'bg-purple-900/30', borderColor: 'border-purple-500/50', description: 'Transform data payload' },
    condition: { label: 'Condition', icon: GitBranch, color: 'text-amber-400', bgColor: 'bg-amber-900/30', borderColor: 'border-amber-500/50', description: 'Conditional branching' },
    delay: { label: 'Delay', icon: Clock, color: 'text-sky-400', bgColor: 'bg-sky-900/30', borderColor: 'border-sky-500/50', description: 'Wait for a duration' },
};

// ─── Default step factory ─────────────────────────────────────────
export function createDefaultStep(stepType: StepType, order: number): WorkflowStepPayload {
    return {
        stepOrder: order,
        stepName: `${STEP_TYPE_META[stepType].label} ${order}`,
        stepType,
        onError: 'stop' as StepErrorHandling,
        maxRetries: 0,
        timeoutSeconds: 30,
        isActive: true,
        fieldMappings: [] as StepFieldMappingPayload[],
        // defaults per type
        ...(stepType === 'delay' && { delaySeconds: 5 }),
        ...(stepType === 'rest_call' && { restMethod: 'POST' }),
        ...(stepType === 'db_query' && { dbQueryType: 'insert' }),
        ...(stepType === 'sap_query' && { sapQueryType: 'select' }),
    };
}

// ─── Props ────────────────────────────────────────────────────────
interface SequentialStepEditorProps {
    steps: WorkflowStepPayload[];
    onStepsChange: (steps: WorkflowStepPayload[]) => void;
    selectedStepIndex: number | null;
    onSelectStep: (index: number | null) => void;
}

export function SequentialStepEditor({
    steps,
    onStepsChange,
    selectedStepIndex,
    onSelectStep,
}: SequentialStepEditorProps) {

    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    // Add a new step
    const addStep = useCallback((stepType: StepType) => {
        const newStep = createDefaultStep(stepType, steps.length + 1);
        const updated = [...steps, newStep];
        onStepsChange(updated);
        onSelectStep(updated.length - 1);
    }, [steps, onStepsChange, onSelectStep]);

    // Remove a step
    const removeStep = useCallback((index: number) => {
        const updated = steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, stepOrder: i + 1 }));
        onStepsChange(updated);
        if (selectedStepIndex === index) onSelectStep(null);
        else if (selectedStepIndex !== null && selectedStepIndex > index) onSelectStep(selectedStepIndex - 1);
    }, [steps, onStepsChange, selectedStepIndex, onSelectStep]);

    // Toggle step active
    const toggleActive = useCallback((index: number) => {
        const updated = steps.map((s, i) => i === index ? { ...s, isActive: !s.isActive } : s);
        onStepsChange(updated);
    }, [steps, onStepsChange]);

    // Drag and drop reorder
    const handleDragStart = (index: number) => setDragIndex(index);
    const handleDragEnter = (index: number) => setDragOverIndex(index);
    const handleDragEnd = () => {
        if (dragIndex !== null && dragOverIndex !== null && dragIndex !== dragOverIndex) {
            const updated = [...steps];
            const [moved] = updated.splice(dragIndex, 1);
            updated.splice(dragOverIndex, 0, moved);
            // Re-number
            const renumbered = updated.map((s, i) => ({ ...s, stepOrder: i + 1 }));
            onStepsChange(renumbered);
            // Keep selection on moved item
            if (selectedStepIndex === dragIndex) onSelectStep(dragOverIndex);
        }
        setDragIndex(null);
        setDragOverIndex(null);
    };

    return (
        <div className="flex flex-col h-full">
            {/* Step list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {steps.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                        <Shuffle className="w-10 h-10 mb-3 opacity-30" />
                        <p className="text-sm font-medium">No steps yet</p>
                        <p className="text-xs mt-1">Add a step from the sidebar or use the buttons below</p>
                    </div>
                )}

                {steps.map((step, index) => {
                    const meta = STEP_TYPE_META[step.stepType];
                    const Icon = meta.icon;
                    const isSelected = selectedStepIndex === index;
                    const isDragging = dragIndex === index;
                    const isDragOver = dragOverIndex === index;

                    return (
                        <div
                            key={index}
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragEnter={() => handleDragEnter(index)}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => e.preventDefault()}
                            onClick={() => onSelectStep(isSelected ? null : index)}
                            className={`
                group relative flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer
                transition-all duration-200 ease-in-out
                ${isSelected
                                    ? `${meta.borderColor} ${meta.bgColor} ring-1 ring-white/10`
                                    : 'border-slate-700/50 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800'}
                ${isDragging ? 'opacity-40 scale-95' : ''}
                ${isDragOver ? 'border-cyan-400 bg-cyan-900/20' : ''}
                ${!step.isActive ? 'opacity-50' : ''}
              `}
                        >
                            {/* Drag handle */}
                            <div className="text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing transition-colors">
                                <GripVertical className="w-4 h-4" />
                            </div>

                            {/* Step number */}
                            <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${meta.bgColor} ${meta.color}`}>
                                {index + 1}
                            </div>

                            {/* Icon */}
                            <div className={`p-1.5 rounded-lg ${meta.bgColor}`}>
                                <Icon className={`w-4 h-4 ${meta.color}`} />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-slate-200 truncate">{step.stepName}</h4>
                                <p className="text-[11px] text-slate-500 truncate">{meta.description}</p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => { e.stopPropagation(); toggleActive(index); }}
                                    className="p-1 rounded hover:bg-slate-700 transition-colors"
                                    title={step.isActive ? 'Disable step' : 'Enable step'}
                                >
                                    {step.isActive
                                        ? <Power className="w-3.5 h-3.5 text-emerald-400" />
                                        : <PowerOff className="w-3.5 h-3.5 text-slate-500" />
                                    }
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); removeStep(index); }}
                                    className="p-1 rounded hover:bg-red-900/50 transition-colors"
                                    title="Remove step"
                                >
                                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                </button>
                            </div>

                            {/* Expand indicator */}
                            <ChevronRight className={`w-4 h-4 text-slate-600 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                        </div>
                    );
                })}

                {/* Connecting lines between steps */}
                {steps.length > 0 && (
                    <div className="flex items-center justify-center py-1">
                        <div className="h-6 w-[2px] bg-slate-700 rounded-full" />
                    </div>
                )}
            </div>

            {/* Add step buttons */}
            <div className="border-t border-slate-700 p-4">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-3">Add Step</p>
                <div className="grid grid-cols-3 gap-2">
                    {(Object.entries(STEP_TYPE_META) as [StepType, typeof STEP_TYPE_META[StepType]][]).map(([type, meta]) => {
                        const Icon = meta.icon;
                        return (
                            <button
                                key={type}
                                onClick={() => addStep(type)}
                                className={`
                  flex flex-col items-center gap-1.5 p-2.5 rounded-lg border
                  ${meta.borderColor} ${meta.bgColor}
                  hover:scale-[1.03] hover:brightness-110
                  active:scale-95 transition-all duration-150
                `}
                            >
                                <Icon className={`w-4 h-4 ${meta.color}`} />
                                <span className={`text-[10px] font-medium ${meta.color}`}>{meta.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
