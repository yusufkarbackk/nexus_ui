import { Node, Edge } from '@xyflow/react';
import { Application, Destination, RestDestination, SapDestination } from '@/app/lib/api';

export type NodeCategory = 'trigger' | 'action' | 'logic' | 'senderApp' | 'mqttSource' | 'destination' | 'restDestination' | 'sapDestination';

// Base custom node data
export interface CustomNodeData {
  label: string;
  description?: string;
  icon?: string;
  category: NodeCategory;
  config?: Record<string, unknown>;
  onDelete?: (id: string) => void;
  // Index signature for React Flow compatibility
  [key: string]: unknown;
}

// Sender App specific node data
export interface SenderAppNodeData extends CustomNodeData {
  category: 'senderApp';
  applicationId: number;
  application: Application;
}

// Destination specific node data (Database)
export interface DestinationNodeData extends CustomNodeData {
  category: 'destination';
  destinationId: number;
  destination: Destination;
}

// REST Destination specific node data
export interface RestDestinationNodeData extends CustomNodeData {
  category: 'restDestination';
  restDestinationId: number;
  restDestination: RestDestination;
}

// MQTT Source specific node data
export interface MQTTSourceNodeData extends CustomNodeData {
  category: 'mqttSource';
  mqttSourceId: number;
  mqttSource: MQTTSource;
}

// SAP Destination specific node data
export interface SapDestinationNodeData extends CustomNodeData {
  category: 'sapDestination';
  sapDestinationId: number;
  sapDestination: SapDestination;
}

// MQTT Source type
export interface MQTTSource {
  id: number;
  name: string;
  brokerUrl: string;
  encryptionEnabled: boolean;
  fields?: MQTTSourceField[];
}

export interface MQTTSourceField {
  id: number;
  mqttSourceId: number;
  name: string;
  dataType: string;
  description?: string;
}

// Pipeline configuration stored in edges
export interface PipelineConfig {
  sourceNodeId: string;
  targetNodeId: string;
  sourceType: 'sender_app' | 'mqtt_source';
  applicationId?: number; // For sender app sources
  mqttSourceId?: number;  // For MQTT sources
  destinationType: 'database' | 'rest' | 'sap';
  // For database destinations
  destinationId?: number;
  targetTable?: string;
  dbQueryType?: 'select' | 'insert' | 'upsert' | 'update' | 'delete';  // Database CRUD operation type
  dbPrimaryKey?: string;  // Primary key column for UPDATE/DELETE WHERE clause
  // For REST destinations
  restDestinationId?: number;
  // For SAP destinations
  sapDestinationId?: number;
  sapTargetSchema?: string;
  sapQuery?: string;
  sapQueryType?: string;
  sapPrimaryKey?: string;  // Primary key column for UPDATE/DELETE WHERE clause
  fieldMappings: FieldMappingConfig[];
}


export interface FieldMappingConfig {
  sourceField: string;
  destinationColumn: string;
  dataType?: string;       // string, number, boolean, datetime
  transformType?: string;  // uppercase, lowercase, round, etc.
  transformParam?: string; // parameter for transform
  defaultValue?: string;   // default if source is null
  nullHandling?: string;   // skip, use_default, required
}

// Table and column info from API
export interface TableInfo {
  name: string;
}

export interface ColumnInfo {
  name: string;
  dataType: string;
  isNullable: boolean;
  columnKey?: string;
  default?: string;
}

// Workflow API types
export interface FieldMappingRequest {
  sourceField: string;
  destinationColumn: string;
  dataType?: string;
  transformType?: string;
  transformParam?: string;
  defaultValue?: string;
  nullHandling?: string;
}

export type DestinationType = 'database' | 'rest' | 'sap';

export interface PipelineRequest {
  sourceType: 'sender_app' | 'mqtt_source';
  applicationId?: number;       // For sender app sources
  mqttSourceId?: number;        // For MQTT sources
  destinationId?: number;       // For database destinations
  targetTable?: string;         // For database destinations
  destinationType: DestinationType;
  restDestinationId?: number;   // For REST destinations
  isActive: boolean;
  fieldMappings: FieldMappingRequest[];
}

export interface CreateWorkflowRequest {
  name: string;
  description?: string;
  isActive: boolean;
  pipelines: PipelineRequest[];
}

export interface UpdateWorkflowRequest {
  name?: string;
  description?: string;
  isActive?: boolean;
  pipelines?: PipelineRequest[];
}

export interface FieldMapping {
  id: number;
  pipelineId: number;
  sourceField: string;
  destinationColumn: string;
  dataType?: string;       // string, number, boolean, datetime
  transformType?: string;  // uppercase, lowercase, round, etc.
  transformParam?: string; // parameter for transform
  defaultValue?: string;   // default if source is null
  nullHandling?: string;   // skip, use_default, required
  createdAt: string;
}

// SAP Pipeline Config for persisting SAP query settings
export interface SapPipelineConfig {
  id?: number;
  pipelineId?: number;
  sapDestinationId?: number;
  queryType: string;
  sqlQuery: string;
  targetSchema?: string;
  targetTable?: string;
  primaryKeyColumn?: string;
  paramMapping?: string;
}

export interface Pipeline {
  id: number;
  workflowId: number;
  // Source info (uses DB enum values: sender_app, mqtt_source)
  sourceType?: 'sender_app' | 'mqtt_source';
  applicationId: number;
  mqttSourceId?: number;
  // Destination info
  destinationType?: 'database' | 'rest' | 'sap';
  destinationId: number;
  targetTable: string;
  restDestinationId?: number;
  sapDestinationId?: number;
  isActive: boolean;
  fieldMappings: FieldMapping[];
  // Expanded references
  application?: Application;
  mqttSource?: MQTTSource;
  destination?: Destination;
  restDestination?: RestDestination;
  sapDestination?: SapDestination;
  sapPipelineConfig?: SapPipelineConfig;
  createdAt: string;
  updatedAt: string;
}

export interface Workflow {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  pipelines: Pipeline[];
  createdAt: string;
  updatedAt: string;
}

// Node types for React Flow
export type TriggerNodeType = Node<CustomNodeData, 'trigger'>;
export type ActionNodeType = Node<CustomNodeData, 'action'>;
export type LogicNodeType = Node<CustomNodeData, 'logic'>;
export type SenderAppNodeType = Node<SenderAppNodeData, 'senderApp'>;
export type DestinationNodeType = Node<DestinationNodeData, 'destination'>;
export type RestDestinationNodeType = Node<RestDestinationNodeData, 'restDestination'>;
export type MQTTSourceNodeType = Node<MQTTSourceNodeData, 'mqttSource'>;

export type SapDestinationNodeType = Node<SapDestinationNodeData, 'sapDestination'>;

export type WorkflowNode = TriggerNodeType | ActionNodeType | LogicNodeType | SenderAppNodeType | DestinationNodeType | RestDestinationNodeType | MQTTSourceNodeType | SapDestinationNodeType;
export type WorkflowEdge = Edge<{ pipelineConfig?: PipelineConfig; edgeOffset?: number }>;

export interface DraggableNodeItem {
  type: string;
  label: string;
  description: string;
  category: NodeCategory;
  icon: string;
  // For dynamic items (sender apps / destinations)
  applicationId?: number;
  application?: Application;
  destinationId?: number;
  destination?: Destination;
  // For REST destinations
  restDestinationId?: number;
  restDestination?: RestDestination;
  // For MQTT sources
  mqttSourceId?: number;
  mqttSource?: MQTTSource;
  // For SAP destinations
  sapDestinationId?: number;
  sapDestination?: SapDestination;
}

export const nodeCategories: Record<NodeCategory, { color: string; bgColor: string; borderColor: string }> = {
  trigger: {
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-400',
  },
  action: {
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-400',
  },
  logic: {
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-400',
  },
  senderApp: {
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-400',
  },
  mqttSource: {
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-400',
  },
  destination: {
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-400',
  },
  restDestination: {
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-400',
  },
  sapDestination: {
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-400',
  },
};

