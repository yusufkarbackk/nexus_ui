// Data types supported by the database
export type DataFieldType = 'string' | 'number' | 'boolean' | 'json';

export interface DataField {
  id: string;
  name: string;
  type: DataFieldType;
  required: boolean;
  description?: string;
}

export interface SenderApp {
  id: string;
  appId: string;
  name: string;
  description?: string;
  dataFields: DataField[];
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'inactive';
}

export const dataTypeOptions: { value: DataFieldType; label: string; description: string }[] = [
  { value: 'string', label: 'String', description: 'Text data (varchar, text, date, email, url)' },
  { value: 'number', label: 'Number', description: 'Numeric values (int, float, decimal)' },
  { value: 'boolean', label: 'Boolean', description: 'True/False values' },
  { value: 'json', label: 'JSON', description: 'JSON object or array' },
];

