'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  X,
  Database,
  Send,
  ArrowRight,
  Loader2,
  AlertCircle,
  Check,
  Table,
  Columns,
  RefreshCw,
  Wifi,
} from 'lucide-react';
import {
  Application,
  Destination,
  fetchDestinationTables,
  fetchTableColumns,
  TableInfo,
  ColumnInfo,
} from '@/app/lib/api';
import { FieldMappingConfig, PipelineConfig, MQTTSource, MQTTSourceField } from '../types/workflowTypes';

// Generic source field type
interface SourceField {
  name: string;
  dataType?: string;
}

interface MappingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: PipelineConfig) => void;
  // Either sourceApplication or mqttSource must be provided
  sourceApplication?: Application;
  mqttSource?: MQTTSource;
  // Target can be either database or REST
  targetType: 'database' | 'rest';
  targetDestination?: Destination | null;  // For database targets
  targetRestDestination?: { id: number; name: string; baseUrl?: string } | null;  // For REST targets
  sourceNodeId: string;
  targetNodeId: string;
  existingConfig?: PipelineConfig;
}

export function MappingPanel({
  isOpen,
  onClose,
  onSave,
  sourceApplication,
  mqttSource,
  targetType,
  targetDestination,
  targetRestDestination,
  sourceNodeId,
  targetNodeId,
  existingConfig,
}: MappingPanelProps) {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [columns, setColumns] = useState<ColumnInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>(existingConfig?.targetTable || '');
  const [fieldMappings, setFieldMappings] = useState<FieldMappingConfig[]>(
    existingConfig?.fieldMappings || []
  );
  const [isLoadingTables, setIsLoadingTables] = useState(false);
  const [isLoadingColumns, setIsLoadingColumns] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine if this is a database target
  const isDbTarget = targetType === 'database' && targetDestination;

  // Fetch tables when panel opens (database targets only)
  const loadTables = useCallback(async () => {
    if (!isDbTarget || !targetDestination) return;
    setIsLoadingTables(true);
    setError(null);
    try {
      const response = await fetchDestinationTables(targetDestination.id);
      setTables(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tables');
    } finally {
      setIsLoadingTables(false);
    }
  }, [isDbTarget, targetDestination]);

  // Fetch columns when table is selected (database targets only)
  const loadColumns = useCallback(async (tableName: string) => {
    if (!isDbTarget || !targetDestination) return;
    if (!tableName) {
      setColumns([]);
      return;
    }
    setIsLoadingColumns(true);
    setError(null);
    try {
      const response = await fetchTableColumns(targetDestination.id, tableName);
      setColumns(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load columns');
    } finally {
      setIsLoadingColumns(false);
    }
  }, [isDbTarget, targetDestination]);

  useEffect(() => {
    if (isOpen && isDbTarget) {
      loadTables();
    }
  }, [isOpen, isDbTarget, loadTables]);

  useEffect(() => {
    if (selectedTable && isDbTarget) {
      loadColumns(selectedTable);
    }
  }, [selectedTable, isDbTarget, loadColumns]);

  // Auto-map fields with same name
  const handleAutoMap = () => {
    // Get source fields from either source type
    const fields: SourceField[] = mqttSource
      ? (mqttSource.fields || []).map(f => ({ name: f.name, dataType: f.dataType }))
      : (sourceApplication?.fields || []).map(f => ({ name: f.name, dataType: f.dataType }));

    const newMappings: FieldMappingConfig[] = [];

    fields.forEach((field) => {
      const matchingColumn = columns.find(
        (col) => col.name.toLowerCase() === field.name.toLowerCase()
      );
      if (matchingColumn) {
        newMappings.push({
          sourceField: field.name,
          destinationColumn: matchingColumn.name,
        });
      }
    });

    setFieldMappings(newMappings);
  };

  // Add a new mapping
  const handleAddMapping = (sourceField: string, destinationColumn: string) => {
    // Check if this source field is already mapped
    const existingIndex = fieldMappings.findIndex((m) => m.sourceField === sourceField);
    if (existingIndex >= 0) {
      // Update existing mapping
      const newMappings = [...fieldMappings];
      newMappings[existingIndex] = { sourceField, destinationColumn };
      setFieldMappings(newMappings);
    } else {
      // Add new mapping
      setFieldMappings([...fieldMappings, { sourceField, destinationColumn }]);
    }
  };

  // Remove a mapping
  const handleRemoveMapping = (sourceField: string) => {
    setFieldMappings(fieldMappings.filter((m) => m.sourceField !== sourceField));
  };

  // Get destination column for a source field
  const getMappedColumn = (sourceField: string): string | undefined => {
    return fieldMappings.find((m) => m.sourceField === sourceField)?.destinationColumn;
  };

  // Handle save
  const handleSave = () => {
    // For database targets, require table and mappings
    if (isDbTarget) {
      if (!selectedTable) {
        setError('Please select a target table');
        return;
      }
      if (fieldMappings.length === 0) {
        setError('Please add at least one field mapping');
        return;
      }
    }

    // Determine destination ID based on target type
    const destId = isDbTarget
      ? targetDestination?.id
      : targetRestDestination?.id;

    if (!destId) {
      setError('No destination selected');
      return;
    }

    const config: PipelineConfig = {
      sourceNodeId,
      targetNodeId,
      sourceType: mqttSource ? 'mqtt_source' : 'sender_app',
      applicationId: sourceApplication?.id,
      mqttSourceId: mqttSource?.id,
      destinationType: isDbTarget ? 'database' : 'rest',
      destinationId: destId,
      targetTable: isDbTarget ? selectedTable : undefined,
      fieldMappings: isDbTarget ? fieldMappings : [],
    };

    onSave(config);
    onClose();
  };

  if (!isOpen) return null;

  // Get source fields from either sender app or MQTT source
  const sourceFields: SourceField[] = mqttSource
    ? (mqttSource.fields || []).map(f => ({ name: f.name, dataType: f.dataType }))
    : (sourceApplication?.fields || []).map(f => ({ name: f.name, dataType: f.dataType }));

  const sourceName = mqttSource?.name || sourceApplication?.name || 'Unknown';
  const targetName = targetDestination?.name || targetRestDestination?.name || 'Unknown';
  const isMQTT = !!mqttSource;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
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
              <div className={`p-2 rounded-lg ${isDbTarget ? 'bg-teal-100' : 'bg-orange-100'}`}>
                {isDbTarget ? (
                  <Database className="w-5 h-5 text-teal-600" />
                ) : (
                  <Send className="w-5 h-5 text-orange-600" />
                )}
              </div>
              <span className="font-semibold text-slate-700">{targetName}</span>
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

          {/* Table Selection (Database targets only) */}
          {isDbTarget ? (
            <div className="mb-6">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <Table className="w-4 h-4" />
                Target Table
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-slate-900 bg-white"
                  disabled={isLoadingTables}
                >
                  <option value="" className="text-slate-500">Select a table...</option>
                  {tables.map((table) => (
                    <option key={table.name} value={table.name} className="text-slate-900">
                      {table.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={loadTables}
                  disabled={isLoadingTables}
                  className="px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                  title="Refresh tables"
                >
                  {isLoadingTables ? (
                    <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
                  ) : (
                    <RefreshCw className="w-5 h-5 text-slate-500" />
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2 text-orange-800">
                <Send className="w-5 h-5" />
                <span className="font-semibold">REST API Destination</span>
              </div>
              <p className="text-sm text-orange-700 mt-2">
                Data from the source will be sent to this REST endpoint. The payload will include all mapped source fields as JSON.
              </p>
            </div>
          )}

          {/* Field Mappings */}
          {selectedTable && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Columns className="w-4 h-4" />
                  Field Mappings
                </label>
                <button
                  onClick={handleAutoMap}
                  disabled={isLoadingColumns || columns.length === 0}
                  className="px-3 py-1.5 text-sm bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors disabled:opacity-50"
                >
                  Auto-map matching fields
                </button>
              </div>

              {isLoadingColumns ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                  <span className="ml-2 text-slate-500">Loading columns...</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-6">
                  {/* Source Fields */}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                      Source Fields ({sourceFields.length})
                    </h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                      {sourceFields.map((field) => {
                        const mappedColumn = getMappedColumn(field.name);
                        return (
                          <div
                            key={field.name}
                            className={`
                              flex items-center justify-between px-3 py-2 rounded-lg border
                              ${mappedColumn
                                ? 'bg-green-50 border-green-200'
                                : 'bg-slate-50 border-slate-200'
                              }
                            `}
                          >
                            <div>
                              <span className="font-medium text-sm text-slate-700">
                                {field.name}
                              </span>
                              <span className="ml-2 text-xs text-slate-400">
                                ({field.dataType})
                              </span>
                            </div>
                            {mappedColumn && (
                              <div className="flex items-center gap-2">
                                <ArrowRight className="w-4 h-4 text-green-500" />
                                <span className="text-xs font-medium text-green-700">
                                  {mappedColumn}
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
                        );
                      })}
                      {sourceFields.length === 0 && (
                        <p className="text-sm text-slate-400 text-center py-4">
                          No fields defined in this application
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Destination Columns */}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                      Destination Columns ({columns.length})
                    </h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                      {columns.map((column) => {
                        const isMapped = fieldMappings.some(
                          (m) => m.destinationColumn === column.name
                        );
                        return (
                          <div
                            key={column.name}
                            className={`
                              px-3 py-2 rounded-lg border cursor-pointer transition-colors
                              ${isMapped
                                ? 'bg-green-50 border-green-200'
                                : 'bg-slate-50 border-slate-200 hover:border-teal-300 hover:bg-teal-50'
                              }
                            `}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-medium text-sm text-slate-700">
                                  {column.name}
                                </span>
                                <span className="ml-2 text-xs text-slate-400">
                                  ({column.dataType})
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {column.columnKey === 'PRI' && (
                                  <span className="px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 rounded">
                                    PK
                                  </span>
                                )}
                                {!column.isNullable && (
                                  <span className="px-1.5 py-0.5 text-[10px] font-medium bg-red-100 text-red-700 rounded">
                                    REQ
                                  </span>
                                )}
                                {isMapped && (
                                  <Check className="w-4 h-4 text-green-500" />
                                )}
                              </div>
                            </div>
                            {/* Map dropdown - shows which source field to map */}
                            {!isMapped && (
                              <select
                                className="mt-2 w-full text-xs px-2 py-1 border border-slate-200 rounded bg-white text-slate-900"
                                value=""
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleAddMapping(e.target.value, column.name);
                                  }
                                }}
                              >
                                <option value="" className="text-slate-500">Map from source field...</option>
                                {sourceFields
                                  .filter((f) => !getMappedColumn(f.name))
                                  .map((field) => (
                                    <option key={field.name} value={field.name} className="text-slate-900">
                                      {field.name} ({field.dataType})
                                    </option>
                                  ))}
                              </select>
                            )}
                          </div>
                        );
                      })}
                      {columns.length === 0 && (
                        <p className="text-sm text-slate-400 text-center py-4">
                          No columns found in this table
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Field Mapping Configuration (ETL Options) */}
              {fieldMappings.length > 0 && (
                <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-slate-700 mb-4">
                    Field Transformations ({fieldMappings.length} field{fieldMappings.length !== 1 ? 's' : ''})
                  </h4>
                  <div className="space-y-3">
                    {fieldMappings.map((mapping, index) => (
                      <div
                        key={mapping.sourceField}
                        className="bg-white p-3 rounded-lg border border-slate-200"
                      >
                        {/* Field Mapping Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-indigo-600 font-medium text-sm">{mapping.sourceField}</span>
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                            <span className="text-teal-600 font-medium text-sm">{mapping.destinationColumn}</span>
                          </div>
                          <button
                            onClick={() => handleRemoveMapping(mapping.sourceField)}
                            className="p-1 hover:bg-red-100 rounded"
                          >
                            <X className="w-3 h-3 text-red-500" />
                          </button>
                        </div>

                        {/* Transform Options Row */}
                        <div className="grid grid-cols-4 gap-2">
                          {/* Data Type */}
                          <div>
                            <label className="text-[10px] text-slate-500 uppercase font-medium">Type</label>
                            <select
                              value={mapping.dataType || ''}
                              onChange={(e) => {
                                const newMappings = [...fieldMappings];
                                newMappings[index] = { ...mapping, dataType: e.target.value || undefined };
                                setFieldMappings(newMappings);
                              }}
                              className="w-full text-xs px-2 py-1 border border-slate-200 rounded bg-white text-slate-700"
                            >
                              <option value="">Auto</option>
                              <option value="string">String</option>
                              <option value="number">Number</option>
                              <option value="integer">Integer</option>
                              <option value="boolean">Boolean</option>
                              <option value="datetime">DateTime</option>
                            </select>
                          </div>

                          {/* Transform Type */}
                          <div>
                            <label className="text-[10px] text-slate-500 uppercase font-medium">Transform</label>
                            <select
                              value={mapping.transformType || ''}
                              onChange={(e) => {
                                const newMappings = [...fieldMappings];
                                newMappings[index] = { ...mapping, transformType: e.target.value || undefined, transformParam: undefined };
                                setFieldMappings(newMappings);
                              }}
                              className="w-full text-xs px-2 py-1 border border-slate-200 rounded bg-white text-slate-700"
                            >
                              <option value="">None</option>
                              <optgroup label="String">
                                <option value="uppercase">Uppercase</option>
                                <option value="lowercase">Lowercase</option>
                                <option value="trim">Trim</option>
                              </optgroup>
                              <optgroup label="Number">
                                <option value="round">Round</option>
                                <option value="floor">Floor</option>
                                <option value="ceil">Ceiling</option>
                                <option value="abs">Absolute</option>
                                <option value="multiply">Multiply</option>
                                <option value="divide">Divide</option>
                                <option value="add">Add</option>
                                <option value="subtract">Subtract</option>
                              </optgroup>
                              <optgroup label="DateTime">
                                <option value="timestamp">Unix Timestamp</option>
                                <option value="date_now">Current Date</option>
                                <option value="datetime_now">Current DateTime</option>
                              </optgroup>
                            </select>
                          </div>

                          {/* Transform Param (for multiply, divide, round, etc.) */}
                          <div>
                            <label className="text-[10px] text-slate-500 uppercase font-medium">Param</label>
                            <input
                              type="text"
                              placeholder={['multiply', 'divide', 'add', 'subtract'].includes(mapping.transformType || '') ? 'Value' : 'Decimals'}
                              value={mapping.transformParam || ''}
                              onChange={(e) => {
                                const newMappings = [...fieldMappings];
                                newMappings[index] = { ...mapping, transformParam: e.target.value || undefined };
                                setFieldMappings(newMappings);
                              }}
                              disabled={!['round', 'multiply', 'divide', 'add', 'subtract'].includes(mapping.transformType || '')}
                              className="w-full text-xs px-2 py-1 border border-slate-200 rounded bg-white text-slate-700 disabled:bg-slate-100 disabled:text-slate-400"
                            />
                          </div>

                          {/* Null Handling */}
                          <div>
                            <label className="text-[10px] text-slate-500 uppercase font-medium">If Null</label>
                            <select
                              value={mapping.nullHandling || 'skip'}
                              onChange={(e) => {
                                const newMappings = [...fieldMappings];
                                newMappings[index] = { ...mapping, nullHandling: e.target.value };
                                setFieldMappings(newMappings);
                              }}
                              className="w-full text-xs px-2 py-1 border border-slate-200 rounded bg-white text-slate-700"
                            >
                              <option value="skip">Skip field</option>
                              <option value="use_default">Use default</option>
                              <option value="required">Error (required)</option>
                            </select>
                          </div>
                        </div>

                        {/* Default Value (only if null_handling is use_default) */}
                        {mapping.nullHandling === 'use_default' && (
                          <div className="mt-2">
                            <label className="text-[10px] text-slate-500 uppercase font-medium">Default Value</label>
                            <input
                              type="text"
                              placeholder="Default value when null"
                              value={mapping.defaultValue || ''}
                              onChange={(e) => {
                                const newMappings = [...fieldMappings];
                                newMappings[index] = { ...mapping, defaultValue: e.target.value || undefined };
                                setFieldMappings(newMappings);
                              }}
                              className="w-full text-xs px-2 py-1 border border-slate-200 rounded bg-white text-slate-700"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!selectedTable || fieldMappings.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Mapping
          </button>
        </div>
      </div>
    </div>
  );
}


