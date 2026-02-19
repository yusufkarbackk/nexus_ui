'use client';

import React, { useState, useEffect } from 'react';
import {
    X,
    Globe,
    Database,
    Shuffle,
    GitBranch,
    Clock,
    AlertTriangle,
    ChevronDown,
} from 'lucide-react';
import type { StepType, StepErrorHandling } from '../types/workflowTypes';
import type { WorkflowStepPayload } from '@/app/lib/api';
import {
    fetchRestDestinations,
    fetchDestinations,
    type RestDestination,
    type Destination,
} from '@/app/lib/api';
import { STEP_TYPE_META } from './SequentialStepEditor';

interface StepConfigPanelProps {
    step: WorkflowStepPayload;
    stepIndex: number;
    onUpdate: (updated: WorkflowStepPayload) => void;
    onClose: () => void;
}

export function StepConfigPanel({ step, stepIndex, onUpdate, onClose }: StepConfigPanelProps) {
    const meta = STEP_TYPE_META[step.stepType];
    const Icon = meta.icon;

    // Resources for dropdowns
    const [restDestinations, setRestDestinations] = useState<RestDestination[]>([]);
    const [dbDestinations, setDbDestinations] = useState<Destination[]>([]);

    useEffect(() => {
        if (step.stepType === 'rest_call') {
            fetchRestDestinations().then(r => setRestDestinations(r.data || [])).catch(() => { });
        }
        if (step.stepType === 'db_query') {
            fetchDestinations().then(r => setDbDestinations(r.data || [])).catch(() => { });
        }
    }, [step.stepType]);

    const updateField = <K extends keyof WorkflowStepPayload>(key: K, value: WorkflowStepPayload[K]) => {
        onUpdate({ ...step, [key]: value });
    };

    return (
        <div className="w-[420px] bg-slate-900 border-l border-slate-700 flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className={`flex items-center justify-between px-4 py-3 border-b border-slate-700 ${meta.bgColor}`}>
                <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${meta.bgColor}`}>
                        <Icon className={`w-5 h-5 ${meta.color}`} />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-white">Step {stepIndex + 1} Configuration</h3>
                        <p className={`text-[11px] ${meta.color}`}>{meta.label}</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-700 transition-colors">
                    <X className="w-4 h-4 text-slate-400" />
                </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">

                {/* Common: Step Name */}
                <FieldGroup label="Step Name">
                    <input
                        type="text"
                        value={step.stepName}
                        onChange={(e) => updateField('stepName', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                        placeholder="Enter step name"
                    />
                </FieldGroup>

                {/* ── REST Call Config ── */}
                {step.stepType === 'rest_call' && (
                    <>
                        <FieldGroup label="REST Destination">
                            <select
                                value={step.restDestinationId || ''}
                                onChange={(e) => updateField('restDestinationId', e.target.value ? Number(e.target.value) : undefined)}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:border-orange-500 outline-none"
                            >
                                <option value="">Select destination...</option>
                                {restDestinations.map(d => (
                                    <option key={d.id} value={d.id}>{d.name} — {d.method} {d.baseUrl}</option>
                                ))}
                            </select>
                        </FieldGroup>

                        <div className="grid grid-cols-2 gap-3">
                            <FieldGroup label="Method Override">
                                <select
                                    value={step.restMethod || ''}
                                    onChange={(e) => updateField('restMethod', e.target.value || undefined)}
                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:border-orange-500 outline-none"
                                >
                                    <option value="">Use default</option>
                                    <option value="GET">GET</option>
                                    <option value="POST">POST</option>
                                    <option value="PUT">PUT</option>
                                    <option value="PATCH">PATCH</option>
                                    <option value="DELETE">DELETE</option>
                                </select>
                            </FieldGroup>

                            <FieldGroup label="Path Override">
                                <input
                                    type="text"
                                    value={step.restPath || ''}
                                    onChange={(e) => updateField('restPath', e.target.value || undefined)}
                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 outline-none"
                                    placeholder="/path"
                                />
                            </FieldGroup>
                        </div>

                        <FieldGroup label="Body Template (JSON)">
                            <textarea
                                value={step.restBodyTemplate || ''}
                                onChange={(e) => updateField('restBodyTemplate', e.target.value || undefined)}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono placeholder-slate-500 outline-none resize-y min-h-[80px]"
                                placeholder={'{"key": "{{input.field}}"}'}
                                rows={4}
                            />
                        </FieldGroup>
                    </>
                )}

                {/* ── DB Query Config ── */}
                {step.stepType === 'db_query' && (
                    <>
                        <FieldGroup label="Database Destination">
                            <select
                                value={step.databaseConfigId || ''}
                                onChange={(e) => updateField('databaseConfigId', e.target.value ? Number(e.target.value) : undefined)}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:border-teal-500 outline-none"
                            >
                                <option value="">Select database...</option>
                                {dbDestinations.map(d => (
                                    <option key={d.id} value={d.id}>{d.name} — {d.connectionType}</option>
                                ))}
                            </select>
                        </FieldGroup>

                        <div className="grid grid-cols-2 gap-3">
                            <FieldGroup label="Query Type">
                                <select
                                    value={step.dbQueryType || 'insert'}
                                    onChange={(e) => updateField('dbQueryType', e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:border-teal-500 outline-none"
                                >
                                    <option value="insert">INSERT</option>
                                    <option value="update">UPDATE</option>
                                    <option value="upsert">UPSERT</option>
                                    <option value="select">SELECT</option>
                                    <option value="delete">DELETE</option>
                                </select>
                            </FieldGroup>

                            <FieldGroup label="Target Table">
                                <input
                                    type="text"
                                    value={step.dbTargetTable || ''}
                                    onChange={(e) => updateField('dbTargetTable', e.target.value || undefined)}
                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 outline-none"
                                    placeholder="table_name"
                                />
                            </FieldGroup>
                        </div>

                        {(step.dbQueryType === 'update' || step.dbQueryType === 'upsert' || step.dbQueryType === 'delete') && (
                            <FieldGroup label="Primary Key Column">
                                <input
                                    type="text"
                                    value={step.dbPrimaryKey || ''}
                                    onChange={(e) => updateField('dbPrimaryKey', e.target.value || undefined)}
                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 outline-none"
                                    placeholder="id"
                                />
                            </FieldGroup>
                        )}

                        {step.dbQueryType === 'select' && (
                            <FieldGroup label="Extended Query (optional)">
                                <textarea
                                    value={step.dbExtendedQuery || ''}
                                    onChange={(e) => updateField('dbExtendedQuery', e.target.value || undefined)}
                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono placeholder-slate-500 outline-none resize-y min-h-[80px]"
                                    placeholder="SELECT title, body FROM products WHERE status = 'active'"
                                    rows={3}
                                />
                                <p className="text-[11px] text-slate-500 mt-1">
                                    Custom SELECT query. Leave empty for default <code className="text-teal-400">SELECT * FROM table</code>.
                                </p>
                            </FieldGroup>
                        )}
                    </>
                )}

                {/* ── Transform Config ── */}
                {step.stepType === 'transform' && (
                    <FieldGroup label="Transform Expression (JSON key map)">
                        <textarea
                            value={step.transformExpression || ''}
                            onChange={(e) => updateField('transformExpression', e.target.value || undefined)}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono placeholder-slate-500 outline-none resize-y min-h-[100px]"
                            placeholder={'{"new_key": "old_key",\n "renamed": "original"}'}
                            rows={5}
                        />
                        <p className="text-[11px] text-slate-500 mt-1">JSON object mapping new field names to source field names</p>
                    </FieldGroup>
                )}

                {/* ── Condition Config ── */}
                {step.stepType === 'condition' && (
                    <>
                        <FieldGroup label="Condition Expression (JSON)">
                            <textarea
                                value={step.conditionExpression || ''}
                                onChange={(e) => updateField('conditionExpression', e.target.value || undefined)}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono placeholder-slate-500 outline-none resize-y min-h-[80px]"
                                placeholder={'{"field": "status", "operator": "eq", "value": "active"}'}
                                rows={3}
                            />
                            <p className="text-[11px] text-slate-500 mt-1">Evaluates against the current step data</p>
                        </FieldGroup>

                        <div className="grid grid-cols-2 gap-3">
                            <FieldGroup label="On True → Step #">
                                <input
                                    type="number"
                                    value={step.onTrueStep ?? ''}
                                    onChange={(e) => updateField('onTrueStep', e.target.value ? Number(e.target.value) : undefined)}
                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white outline-none"
                                    placeholder="Next"
                                    min={1}
                                />
                            </FieldGroup>
                            <FieldGroup label="On False → Step #">
                                <input
                                    type="number"
                                    value={step.onFalseStep ?? ''}
                                    onChange={(e) => updateField('onFalseStep', e.target.value ? Number(e.target.value) : undefined)}
                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white outline-none"
                                    placeholder="Next"
                                    min={1}
                                />
                            </FieldGroup>
                        </div>
                    </>
                )}

                {/* ── Delay Config ── */}
                {step.stepType === 'delay' && (
                    <FieldGroup label="Delay (seconds)">
                        <input
                            type="number"
                            value={step.delaySeconds ?? 5}
                            onChange={(e) => updateField('delaySeconds', Number(e.target.value) || 1)}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white outline-none"
                            min={1}
                            max={3600}
                        />
                    </FieldGroup>
                )}

                {/* ── Divider ── */}
                <div className="border-t border-slate-700 pt-4">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <AlertTriangle className="w-3 h-3" />
                        Advanced Settings
                    </p>
                </div>

                {/* Common: Input Mapping */}
                <FieldGroup label="Input Mapping (JSON)">
                    <textarea
                        value={step.inputMapping || ''}
                        onChange={(e) => updateField('inputMapping', e.target.value || undefined)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono placeholder-slate-500 outline-none resize-y"
                        placeholder={'{"data": "$trigger"}'}
                        rows={2}
                    />
                    <p className="text-[11px] text-slate-500 mt-1">Map variables from previous steps. Use $trigger for initial data, $step1_output etc.</p>
                </FieldGroup>

                {/* Common: Output Variable */}
                <FieldGroup label="Output Variable">
                    <input
                        type="text"
                        value={step.outputVariable || ''}
                        onChange={(e) => updateField('outputVariable', e.target.value || undefined)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 outline-none"
                        placeholder={`step${stepIndex + 1}_output`}
                    />
                </FieldGroup>

                {/* Error Handling */}
                <div className="grid grid-cols-3 gap-3">
                    <FieldGroup label="On Error">
                        <select
                            value={step.onError}
                            onChange={(e) => updateField('onError', e.target.value as StepErrorHandling)}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white outline-none"
                        >
                            <option value="stop">Stop</option>
                            <option value="skip">Skip</option>
                            <option value="retry">Retry</option>
                        </select>
                    </FieldGroup>

                    <FieldGroup label="Max Retries">
                        <input
                            type="number"
                            value={step.maxRetries}
                            onChange={(e) => updateField('maxRetries', Number(e.target.value) || 0)}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white outline-none"
                            min={0}
                            max={10}
                            disabled={step.onError !== 'retry'}
                        />
                    </FieldGroup>

                    <FieldGroup label="Timeout (s)">
                        <input
                            type="number"
                            value={step.timeoutSeconds}
                            onChange={(e) => updateField('timeoutSeconds', Number(e.target.value) || 30)}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white outline-none"
                            min={1}
                            max={300}
                        />
                    </FieldGroup>
                </div>
            </div>
        </div>
    );
}

// ─── Helper sub-component ─────────────────────────────────────────
function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
            {children}
        </div>
    );
}
