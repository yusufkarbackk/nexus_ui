import { Node, Edge } from '@xyflow/react';
import { Application, Destination, RestDestination } from '@/app/lib/api';

export type NodeCategory = 'trigger' | 'action' | 'logic' | 'senderApp' | 'mqttSource' | 'destination' | 'restDestination';

// Base custom node data
export interface CustomNodeData {
  label: string;
  description?: string;
  icon?: string;
  category: NodeCategory;
  config?: Record<string, unknown>;
  onDelete?: (id: string) => void;
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
  destinationType: 'database' | 'rest';
  // For database destinations
  destinationId?: number;
  targetTable?: string;
  // For REST destinations
  restDestinationId?: number;
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

export type DestinationType = 'database' | 'rest';

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
  createdAt: string;
}

export interface Pipeline {
  id: number;
  workflowId: number;
  // Source info (uses DB enum values: sender_app, mqtt_source)
  sourceType?: 'sender_app' | 'mqtt_source';
  applicationId: number;
  mqttSourceId?: number;
  // Destination info
  destinationType?: 'database' | 'rest';
  destinationId: number;
  targetTable: string;
  restDestinationId?: number;
  isActive: boolean;
  fieldMappings: FieldMapping[];
  // Expanded references
  application?: Application;
  mqttSource?: MQTTSource;
  destination?: Destination;
  restDestination?: RestDestination;
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

export type WorkflowNode = TriggerNodeType | ActionNodeType | LogicNodeType | SenderAppNodeType | DestinationNodeType | RestDestinationNodeType | MQTTSourceNodeType;
export type WorkflowEdge = Edge<{ pipelineConfig?: PipelineConfig }>;

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
};

