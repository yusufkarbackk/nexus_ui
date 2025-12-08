'use client';

import { Trash2, GripVertical } from 'lucide-react';
import { DataField, DataFieldType, dataTypeOptions } from '../types/senderAppTypes';

interface DataFieldRowProps {
  field: DataField;
  onUpdate: (id: string, updates: Partial<DataField>) => void;
  onRemove: (id: string) => void;
}

export function DataFieldRow({ field, onUpdate, onRemove }: DataFieldRowProps) {
  return (
    <div className="group flex items-start gap-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
      {/* Drag Handle */}
      <div className="pt-2 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
        <GripVertical className="w-4 h-4" />
      </div>

      {/* Field Name */}
      <div className="flex-1 min-w-0">
        <label className="block text-xs text-slate-400 mb-1">Field Name</label>
        <input
          type="text"
          value={field.name}
          onChange={(e) => onUpdate(field.id, { name: e.target.value })}
          placeholder="e.g., customer_id"
          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Field Type */}
      <div className="w-40">
        <label className="block text-xs text-slate-400 mb-1">Type</label>
        <select
          value={field.type}
          onChange={(e) => onUpdate(field.id, { type: e.target.value as DataFieldType })}
          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none cursor-pointer"
        >
          {dataTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Required Toggle */}
      <div className="w-24 text-center">
        <label className="block text-xs text-slate-400 mb-1">Required</label>
        <button
          type="button"
          onClick={() => onUpdate(field.id, { required: !field.required })}
          className={`
            w-12 h-6 rounded-full transition-colors relative
            ${field.required ? 'bg-indigo-600' : 'bg-slate-700'}
          `}
        >
          <span
            className={`
              absolute top-1 w-4 h-4 bg-white rounded-full transition-transform
              ${field.required ? 'left-7' : 'left-1'}
            `}
          />
        </button>
      </div>

      {/* Description */}
      <div className="flex-1 min-w-0">
        <label className="block text-xs text-slate-400 mb-1">Description</label>
        <input
          type="text"
          value={field.description || ''}
          onChange={(e) => onUpdate(field.id, { description: e.target.value })}
          placeholder="Optional description"
          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Remove Button */}
      <div className="pt-6">
        <button
          type="button"
          onClick={() => onRemove(field.id)}
          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          title="Remove field"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}






