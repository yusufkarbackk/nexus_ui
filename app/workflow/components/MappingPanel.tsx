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
  targetDestination: Destination;
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
  targetDestination,
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

  // Fetch tables when panel opens
  const loadTables = useCallback(async () => {
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
  }, [targetDestination.id]);

  // Fetch columns when table is selected
  const loadColumns = useCallback(async (tableName: string) => {
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
  }, [targetDestination.id]);

  useEffect(() => {
    if (isOpen) {
      loadTables();
    }
  }, [isOpen, loadTables]);

  useEffect(() => {
    if (selectedTable) {
      loadColumns(selectedTable);
    }
  }, [selectedTable, loadColumns]);

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
    if (!selectedTable) {
      setError('Please select a target table');
      return;
    }
    if (fieldMappings.length === 0) {
      setError('Please add at least one field mapping');
      return;
    }

    const config: PipelineConfig = {
      sourceNodeId,
      targetNodeId,
      sourceType: mqttSource ? 'mqttSource' : 'senderApp',
      applicationId: sourceApplication?.id,
      mqttSourceId: mqttSource?.id,
      destinationType: 'database',
      destinationId: targetDestination.id,
      targetTable: selectedTable,
      fieldMappings,
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
              <div className="p-2 rounded-lg bg-teal-100">
                <Database className="w-5 h-5 text-teal-600" />
              </div>
              <span className="font-semibold text-slate-700">{targetDestination.name}</span>
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

          {/* Table Selection */}
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
                            key={field.id}
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
                                    <option key={field.id} value={field.name} className="text-slate-900">
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

              {/* Mapping Summary */}
              {fieldMappings.length > 0 && (
                <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">
                    Mapping Summary ({fieldMappings.length} field{fieldMappings.length !== 1 ? 's' : ''})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {fieldMappings.map((mapping) => (
                      <div
                        key={mapping.sourceField}
                        className="flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                      >
                        <span className="text-indigo-600 font-medium">{mapping.sourceField}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span className="text-teal-600 font-medium">{mapping.destinationColumn}</span>
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


