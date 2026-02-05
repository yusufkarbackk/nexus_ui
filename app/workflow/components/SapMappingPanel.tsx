'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
    X,
    Database,
    Send,
    ArrowRight,
    Loader2,
    AlertCircle,
    Table,
    RefreshCw,
    Wifi,
    Code,
    Settings,
    ChevronDown,
    ChevronRight,
    Layers,
    Key,
} from 'lucide-react';
import {
    Application,
    SapDestination,
    SapSchema,
    SapTable,
    SapColumn,
    fetchSapSchemas,
    fetchSapTables,
    fetchSapColumns,
} from '@/app/lib/api';
import { FieldMappingConfig, PipelineConfig, MQTTSource } from '../types/workflowTypes';

// Generic source field type
interface SourceField {
    name: string;
    dataType?: string;
}

interface SapMappingPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (config: PipelineConfig) => void;
    sourceApplication?: Application;
    mqttSource?: MQTTSource;
    targetSapDestination: SapDestination;
    sourceNodeId: string;
    targetNodeId: string;
    existingConfig?: PipelineConfig;
}

type SapQueryType = 'insert' | 'update' | 'delete';

// Transform types available
const TRANSFORM_TYPES = [
    { value: '', label: 'None' },
    { value: 'uppercase', label: 'UPPERCASE' },
    { value: 'lowercase', label: 'lowercase' },
    { value: 'trim', label: 'Trim whitespace' },
    { value: 'round', label: 'Round number', hasParam: true },
    { value: 'date_format', label: 'Format date', hasParam: true },
    { value: 'prefix', label: 'Add prefix', hasParam: true },
    { value: 'suffix', label: 'Add suffix', hasParam: true },
];

export function SapMappingPanel({
    isOpen,
    onClose,
    onSave,
    sourceApplication,
    mqttSource,
    targetSapDestination,
    sourceNodeId,
    targetNodeId,
    existingConfig,
}: SapMappingPanelProps) {
    // Schema, table, column states
    const [schemas, setSchemas] = useState<SapSchema[]>([]);
    const [tables, setTables] = useState<SapTable[]>([]);
    const [columns, setColumns] = useState<SapColumn[]>([]);
    const [selectedSchema, setSelectedSchema] = useState<string>(existingConfig?.sapTargetSchema || '');
    const [selectedTable, setSelectedTable] = useState<string>(existingConfig?.targetTable || '');
    const [queryType, setQueryType] = useState<SapQueryType>((existingConfig?.sapQueryType as SapQueryType) || 'insert');

    // Primary key column for UPDATE/DELETE WHERE clause
    const [primaryKeyColumn, setPrimaryKeyColumn] = useState<string>(existingConfig?.sapPrimaryKey || '');

    // Field mappings with transforms
    const [fieldMappings, setFieldMappings] = useState<FieldMappingConfig[]>(
        existingConfig?.fieldMappings || []
    );

    // Loading states
    const [isLoadingSchemas, setIsLoadingSchemas] = useState(false);
    const [isLoadingTables, setIsLoadingTables] = useState(false);
    const [isLoadingColumns, setIsLoadingColumns] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Expand/collapse for advanced settings
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Track if this is the initial load (to preserve existing config values)
    const isInitialLoad = useRef(true);

    // BUGFIX: Sync state with existingConfig when prop changes (different edge clicked)
    // React useState only initializes once, so we need useEffect to update when props change
    useEffect(() => {
        setSelectedSchema(existingConfig?.sapTargetSchema || '');
        setSelectedTable(existingConfig?.targetTable || '');
        setQueryType((existingConfig?.sapQueryType as SapQueryType) || 'insert');
        setPrimaryKeyColumn(existingConfig?.sapPrimaryKey || '');
        setFieldMappings(existingConfig?.fieldMappings || []);
        setError(null);
        isInitialLoad.current = true; // Reset flag for new config
    }, [existingConfig]);

    // Load schemas on mount
    const loadSchemas = useCallback(async () => {
        if (!targetSapDestination) return;
        setIsLoadingSchemas(true);
        setError(null);
        try {
            const response = await fetchSapSchemas(targetSapDestination.id);
            if (response.success) {
                setSchemas(response.schemas);
            } else {
                setError(response.error || 'Failed to load schemas');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load schemas');
        } finally {
            setIsLoadingSchemas(false);
        }
    }, [targetSapDestination]);

    // Load tables when schema selected
    const loadTables = useCallback(async (schema: string) => {
        if (!targetSapDestination || !schema) return;
        setIsLoadingTables(true);
        setError(null);
        try {
            const response = await fetchSapTables(targetSapDestination.id, schema);
            if (response.success) {
                setTables(response.tables);
            } else {
                setError(response.error || 'Failed to load tables');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load tables');
        } finally {
            setIsLoadingTables(false);
        }
    }, [targetSapDestination]);

    // Load columns when table selected
    const loadColumns = useCallback(async (schema: string, table: string) => {
        if (!targetSapDestination || !schema || !table) return;
        setIsLoadingColumns(true);
        setError(null);
        try {
            const response = await fetchSapColumns(targetSapDestination.id, schema, table);
            if (response.success) {
                setColumns(response.columns);
            } else {
                setError(response.error || 'Failed to load columns');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load columns');
        } finally {
            setIsLoadingColumns(false);
        }
    }, [targetSapDestination]);

    // Load schemas on panel open
    useEffect(() => {
        if (isOpen && targetSapDestination) {
            loadSchemas();
        }
    }, [isOpen, targetSapDestination, loadSchemas]);

    // Load tables when schema changes
    useEffect(() => {
        if (selectedSchema) {
            loadTables(selectedSchema);
            // Only reset selectedTable if user manually changed schema (not initial load)
            if (!isInitialLoad.current) {
                setSelectedTable('');
                setColumns([]);
            }
            isInitialLoad.current = false;
        }
    }, [selectedSchema, loadTables]);

    // Load columns when table changes
    useEffect(() => {
        if (selectedSchema && selectedTable) {
            loadColumns(selectedSchema, selectedTable);
        }
    }, [selectedSchema, selectedTable, loadColumns]);

    // Get source fields from either sender app or MQTT source
    const sourceFields: SourceField[] = mqttSource
        ? (mqttSource.fields || []).map(f => ({ name: f.name, dataType: f.dataType }))
        : (sourceApplication?.fields || []).map(f => ({ name: f.name, dataType: f.dataType }));

    const sourceName = mqttSource?.name || sourceApplication?.name || 'Unknown';
    const isMQTT = !!mqttSource;

    // Auto-map fields with same name
    const handleAutoMap = useCallback(() => {
        if (columns.length === 0 || sourceFields.length === 0) return;

        const newMappings: FieldMappingConfig[] = [];
        sourceFields.forEach(sf => {
            // Find matching column (case-insensitive)
            const matchingCol = columns.find(
                col => col.name.toLowerCase() === sf.name.toLowerCase()
            );
            if (matchingCol && !fieldMappings.some(m => m.sourceField === sf.name)) {
                newMappings.push({
                    sourceField: sf.name,
                    destinationColumn: matchingCol.name,
                    dataType: matchingCol.dataType,
                    nullHandling: matchingCol.isNullable ? 'skip' : 'required',
                });
            }
        });

        setFieldMappings([...fieldMappings, ...newMappings]);
    }, [columns, sourceFields, fieldMappings]);

    // Add mapping
    const handleAddMapping = (sourceField: string, destinationColumn: string) => {
        const col = columns.find(c => c.name === destinationColumn);
        setFieldMappings([
            ...fieldMappings,
            {
                sourceField,
                destinationColumn,
                dataType: col?.dataType,
                nullHandling: col?.isNullable ? 'skip' : 'required',
            },
        ]);
    };

    // Remove mapping
    const handleRemoveMapping = (sourceField: string) => {
        setFieldMappings(fieldMappings.filter(m => m.sourceField !== sourceField));
    };

    // Update mapping transform
    const handleUpdateMapping = (sourceField: string, updates: Partial<FieldMappingConfig>) => {
        setFieldMappings(
            fieldMappings.map(m =>
                m.sourceField === sourceField ? { ...m, ...updates } : m
            )
        );
    };

    // Get mapped column for a source field
    const getMappedColumn = (sourceField: string): string | undefined => {
        return fieldMappings.find(m => m.sourceField === sourceField)?.destinationColumn;
    };

    // Generate SQL preview
    const sqlPreview = useMemo(() => {
        if (!selectedSchema || !selectedTable || fieldMappings.length === 0) {
            return '';
        }

        const quotedSchema = `"${selectedSchema}"`;
        const quotedTable = `"${selectedTable}"`;
        const quotedColumns = fieldMappings.map(m => `"${m.destinationColumn}"`).join(', ');
        const placeholders = fieldMappings.map(() => '?').join(', ');

        switch (queryType) {
            case 'insert':
                return `INSERT INTO ${quotedSchema}.${quotedTable}\n  (${quotedColumns})\n  VALUES (${placeholders})`;
            case 'update':
                // For UPDATE, filter out PK from SET clause and use it in WHERE
                const updateColumns = fieldMappings
                    .filter(m => m.destinationColumn !== primaryKeyColumn)
                    .map(m => `"${m.destinationColumn}" = ?`)
                    .join(', ');
                const whereClause = primaryKeyColumn ? `"${primaryKeyColumn}" = ?` : '<select primary key>';
                return `UPDATE ${quotedSchema}.${quotedTable}\n  SET ${updateColumns}\n  WHERE ${whereClause}`;
            case 'delete':
                const deleteWhereClause = primaryKeyColumn ? `"${primaryKeyColumn}" = ?` : '<select primary key>';
                return `DELETE FROM ${quotedSchema}.${quotedTable}\n  WHERE ${deleteWhereClause}`;
            default:
                return '';
        }
    }, [selectedSchema, selectedTable, fieldMappings, queryType, primaryKeyColumn]);

    // Handle save
    const handleSave = () => {
        if (!selectedSchema) {
            setError('Please select a schema');
            return;
        }
        if (!selectedTable) {
            setError('Please select a table');
            return;
        }
        if (fieldMappings.length === 0) {
            setError('Please add at least one field mapping');
            return;
        }
        // Validate primary key is selected for UPDATE/DELETE
        if ((queryType === 'update' || queryType === 'delete') && !primaryKeyColumn) {
            setError('Please select a primary key column for UPDATE/DELETE operations');
            return;
        }

        const config: PipelineConfig = {
            sourceNodeId,
            targetNodeId,
            sourceType: mqttSource ? 'mqtt_source' : 'sender_app',
            applicationId: sourceApplication?.id,
            mqttSourceId: mqttSource?.id,
            destinationType: 'sap',
            sapDestinationId: targetSapDestination.id,
            sapTargetSchema: selectedSchema,
            targetTable: selectedTable,
            sapQueryType: queryType,
            sapPrimaryKey: primaryKeyColumn || undefined,
            sapQuery: sqlPreview,
            fieldMappings: fieldMappings,
        };

        onSave(config);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-lg ${isMQTT ? 'bg-violet-100' : 'bg-indigo-100'}`}>
                                {isMQTT ? (
                                    <Wifi className="w-5 h-5 text-violet-600" />
                                ) : (
                                    <Send className="w-5 h-5 text-indigo-600" />
                                )}
                            </div>
                            <span className="font-semibold text-slate-700">{sourceName}</span>
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-400" />
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-rose-100">
                                <Database className="w-5 h-5 text-rose-600" />
                            </div>
                            <span className="font-semibold text-slate-700">{targetSapDestination.name}</span>
                            <span className="text-xs px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full">SAP HANA</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-slate-200 transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Error display */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                            <AlertCircle className="w-5 h-5" />
                            <span className="text-sm">{error}</span>
                            <button onClick={() => setError(null)} className="ml-auto">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* Schema, Table, Operation Selection */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        {/* Schema Selector */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                                <Layers className="w-4 h-4" />
                                Schema
                            </label>
                            <div className="flex gap-2">
                                <select
                                    value={selectedSchema}
                                    onChange={(e) => setSelectedSchema(e.target.value)}
                                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none text-slate-900 bg-white text-sm"
                                    disabled={isLoadingSchemas}
                                >
                                    <option value="">Select schema...</option>
                                    {schemas.map((schema) => (
                                        <option key={schema.name} value={schema.name}>
                                            {schema.name}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={loadSchemas}
                                    disabled={isLoadingSchemas}
                                    className="px-2 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                                    title="Refresh schemas"
                                >
                                    {isLoadingSchemas ? (
                                        <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                                    ) : (
                                        <RefreshCw className="w-4 h-4 text-slate-500" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Table Selector */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                                <Table className="w-4 h-4" />
                                Table
                            </label>
                            <select
                                value={selectedTable}
                                onChange={(e) => setSelectedTable(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none text-slate-900 bg-white text-sm"
                                disabled={isLoadingTables || !selectedSchema}
                            >
                                <option value="">Select table...</option>
                                {tables.map((table) => (
                                    <option key={table.name} value={table.name}>
                                        {table.name} {table.type && table.type !== 'TABLE' ? `(${table.type})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Operation Type */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                                <Settings className="w-4 h-4" />
                                Operation
                            </label>
                            <select
                                value={queryType}
                                onChange={(e) => setQueryType(e.target.value as SapQueryType)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none text-slate-900 bg-white text-sm"
                            >
                                <option value="insert">INSERT</option>
                                <option value="update">UPDATE</option>
                                <option value="delete">DELETE</option>
                            </select>
                        </div>
                    </div>

                    {/* Primary Key Selection - Only for UPDATE/DELETE */}
                    {(queryType === 'update' || queryType === 'delete') && columns.length > 0 && (
                        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                            <label className="flex items-center gap-2 text-sm font-semibold text-amber-800 mb-2">
                                <Key className="w-4 h-4" />
                                Primary Key Column (for WHERE clause)
                            </label>
                            <select
                                value={primaryKeyColumn}
                                onChange={(e) => setPrimaryKeyColumn(e.target.value)}
                                className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-slate-900 bg-white text-sm"
                            >
                                <option value="">-- Select Primary Key Column --</option>
                                {columns.map((col) => (
                                    <option key={col.name} value={col.name}>
                                        {col.name} {col.dataType && `(${col.dataType})`}
                                    </option>
                                ))}
                            </select>
                            <p className="mt-2 text-xs text-amber-700">
                                This column will be used in the WHERE clause to identify which row to {queryType}.
                            </p>
                        </div>
                    )}

                    {/* Field Mapping Section */}
                    {selectedTable && columns.length > 0 && (
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold text-slate-700">
                                    Field Mappings ({fieldMappings.length})
                                </h3>
                                <button
                                    onClick={handleAutoMap}
                                    className="px-3 py-1.5 text-xs font-medium bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition-colors"
                                >
                                    Auto-Map Fields
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                {/* Source Fields */}
                                <div>
                                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                                        Source Fields ({sourceFields.length})
                                    </h4>
                                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                                        {sourceFields.map((field) => {
                                            const mappedColumn = getMappedColumn(field.name);
                                            const mapping = fieldMappings.find(m => m.sourceField === field.name);
                                            return (
                                                <div
                                                    key={field.name}
                                                    className={`px-3 py-2 rounded-lg border ${mappedColumn
                                                        ? 'bg-green-50 border-green-200'
                                                        : 'bg-slate-50 border-slate-200'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <span className="font-medium text-sm text-slate-700">
                                                                {field.name}
                                                            </span>
                                                            <span className="ml-2 text-xs text-slate-400">
                                                                ({field.dataType || 'string'})
                                                            </span>
                                                        </div>
                                                        {mappedColumn && (
                                                            <div className="flex items-center gap-2">
                                                                <ArrowRight className="w-4 h-4 text-green-500" />
                                                                <span className="text-xs font-medium text-green-700">
                                                                    "{mappedColumn}"
                                                                </span>
                                                                <button
                                                                    onClick={() => handleRemoveMapping(field.name)}
                                                                    className="p-1 hover:bg-red-100 rounded"
                                                                >
                                                                    <X className="w-3 h-3 text-red-500" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {/* Transform options for mapped fields */}
                                                    {mappedColumn && mapping && (
                                                        <div className="mt-2 flex gap-2 flex-wrap">
                                                            <select
                                                                value={mapping.transformType || ''}
                                                                onChange={(e) =>
                                                                    handleUpdateMapping(field.name, {
                                                                        transformType: e.target.value || undefined,
                                                                    })
                                                                }
                                                                className="text-xs px-2 py-1 border border-slate-200 rounded bg-white text-slate-700"
                                                            >
                                                                {TRANSFORM_TYPES.map((t) => (
                                                                    <option key={t.value} value={t.value}>
                                                                        {t.label}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            {mapping.transformType &&
                                                                TRANSFORM_TYPES.find((t) => t.value === mapping.transformType)
                                                                    ?.hasParam && (
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Param"
                                                                        value={mapping.transformParam || ''}
                                                                        onChange={(e) =>
                                                                            handleUpdateMapping(field.name, {
                                                                                transformParam: e.target.value,
                                                                            })
                                                                        }
                                                                        className="text-xs px-2 py-1 border border-slate-200 rounded bg-white text-slate-700 w-20"
                                                                    />
                                                                )}
                                                        </div>
                                                    )}
                                                    {/* Map dropdown for unmapped fields */}
                                                    {!mappedColumn && (
                                                        <select
                                                            className="mt-2 w-full text-xs px-2 py-1 border border-slate-200 rounded bg-white text-slate-700"
                                                            value=""
                                                            onChange={(e) => {
                                                                if (e.target.value) {
                                                                    handleAddMapping(field.name, e.target.value);
                                                                }
                                                            }}
                                                        >
                                                            <option value="">Map to SAP column...</option>
                                                            {columns
                                                                .filter(
                                                                    (c) =>
                                                                        !fieldMappings.some((m) => m.destinationColumn === c.name)
                                                                )
                                                                .map((col) => (
                                                                    <option key={col.name} value={col.name}>
                                                                        "{col.name}" ({col.dataType})
                                                                    </option>
                                                                ))}
                                                        </select>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* SAP Columns */}
                                <div>
                                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                                        SAP Columns ({columns.length})
                                    </h4>
                                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                                        {isLoadingColumns ? (
                                            <div className="flex items-center justify-center py-8">
                                                <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
                                            </div>
                                        ) : (
                                            columns.map((col) => {
                                                const isMapped = fieldMappings.some(
                                                    (m) => m.destinationColumn === col.name
                                                );
                                                const mappedFrom = fieldMappings.find(
                                                    (m) => m.destinationColumn === col.name
                                                )?.sourceField;
                                                return (
                                                    <div
                                                        key={col.name}
                                                        className={`px-3 py-2 rounded-lg border ${isMapped
                                                            ? 'bg-green-50 border-green-200'
                                                            : col.isNullable
                                                                ? 'bg-slate-50 border-slate-200'
                                                                : 'bg-amber-50 border-amber-200'
                                                            }`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <span className="font-medium text-sm text-slate-700">
                                                                    "{col.name}"
                                                                </span>
                                                                {!col.isNullable && (
                                                                    <span className="ml-2 text-xs font-medium text-amber-600">
                                                                        *required
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className="text-xs text-slate-400">
                                                                {col.dataType}
                                                                {col.length ? `(${col.length})` : ''}
                                                            </span>
                                                        </div>
                                                        {isMapped && mappedFrom && (
                                                            <div className="mt-1 text-xs text-green-600">
                                                                ← {mappedFrom}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SQL Preview */}
                    {sqlPreview && (
                        <div className="mb-6">
                            <button
                                onClick={() => setShowAdvanced(!showAdvanced)}
                                className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2"
                            >
                                {showAdvanced ? (
                                    <ChevronDown className="w-4 h-4" />
                                ) : (
                                    <ChevronRight className="w-4 h-4" />
                                )}
                                <Code className="w-4 h-4" />
                                SQL Preview
                            </button>
                            {showAdvanced && (
                                <pre className="p-4 bg-slate-900 text-green-400 rounded-lg text-sm font-mono overflow-x-auto">
                                    {sqlPreview}
                                </pre>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
                    <div className="text-sm text-slate-500">
                        {fieldMappings.length} field(s) mapped
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!selectedTable || fieldMappings.length === 0}
                            className="px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Save Configuration
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
