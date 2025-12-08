import { Node, Edge } from '@xyflow/react';
import { Application, Destination } from '@/app/lib/api';

export type NodeCategory = 'trigger' | 'action' | 'logic' | 'senderApp' | 'destination';

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

// Destination specific node data
export interface DestinationNodeData extends CustomNodeData {
  category: 'destination';
  destinationId: number;
  destination: Destination;
}

// Pipeline configuration stored in edges
export interface PipelineConfig {
  sourceNodeId: string;
  targetNodeId: string;
  applicationId: number;
  destinationId: number;
  targetTable: string;
  fieldMappings: FieldMappingConfig[];
}

export interface FieldMappingConfig {
  sourceField: string;
  destinationColumn: string;
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
}

export interface PipelineRequest {
  applicationId: number;
  destinationId: number;
  targetTable: string;
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
  applicationId: number;
  destinationId: number;
  targetTable: string;
  isActive: boolean;
  fieldMappings: FieldMapping[];
  application?: Application;
  destination?: Destination;
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

export type WorkflowNode = TriggerNodeType | ActionNodeType | LogicNodeType | SenderAppNodeType | DestinationNodeType;
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
  destination: {
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-400',
  },
};

