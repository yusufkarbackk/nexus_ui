import { WorkflowNode, WorkflowEdge, DraggableNodeItem } from '../types/workflowTypes';

export const initialNodes: WorkflowNode[] = [
  {
    id: 'node-1',
    type: 'trigger',
    position: { x: 100, y: 200 },
    data: {
      label: 'Incoming Webhook',
      description: 'Receives data from external API',
      category: 'trigger',
      icon: 'webhook',
    },
  },
  {
    id: 'node-2',
    type: 'logic',
    position: { x: 400, y: 200 },
    data: {
      label: 'Filter Data',
      description: 'Filter records by condition',
      category: 'logic',
      icon: 'filter',
    },
  },
  {
    id: 'node-3',
    type: 'action',
    position: { x: 700, y: 200 },
    data: {
      label: 'Save to MySQL',
      description: 'Insert data to MySQL database',
      category: 'action',
      icon: 'database',
    },
  },
];

export const initialEdges: WorkflowEdge[] = [
  {
    id: 'edge-1-2',
    source: 'node-1',
    target: 'node-2',
    animated: true,
    style: { stroke: '#6366f1', strokeWidth: 2 },
  },
  {
    id: 'edge-2-3',
    source: 'node-2',
    target: 'node-3',
    animated: true,
    style: { stroke: '#6366f1', strokeWidth: 2 },
  },
];

export const draggableNodes: DraggableNodeItem[] = [
  // Trigger Nodes
  {
    type: 'trigger',
    label: 'Webhook',
    description: 'HTTP webhook trigger',
    category: 'trigger',
    icon: 'webhook',
  },
  {
    type: 'trigger',
    label: 'API Ingress',
    description: 'REST API endpoint',
    category: 'trigger',
    icon: 'globe',
  },
  {
    type: 'trigger',
    label: 'Schedule',
    description: 'Cron-based trigger',
    category: 'trigger',
    icon: 'clock',
  },
  // Action Nodes
  {
    type: 'action',
    label: 'MySQL',
    description: 'MySQL database',
    category: 'action',
    icon: 'database',
  },
  {
    type: 'action',
    label: 'PostgreSQL',
    description: 'PostgreSQL database',
    category: 'action',
    icon: 'database',
  },
  {
    type: 'action',
    label: 'SAP',
    description: 'SAP integration',
    category: 'action',
    icon: 'building',
  },
  {
    type: 'action',
    label: 'HTTP Request',
    description: 'Send HTTP request',
    category: 'action',
    icon: 'send',
  },
  // Logic Nodes
  {
    type: 'logic',
    label: 'Filter',
    description: 'Filter data by condition',
    category: 'logic',
    icon: 'filter',
  },
  {
    type: 'logic',
    label: 'Transform',
    description: 'Transform data format',
    category: 'logic',
    icon: 'shuffle',
  },
  {
    type: 'logic',
    label: 'Merge',
    description: 'Merge multiple inputs',
    category: 'logic',
    icon: 'git-merge',
  },
  {
    type: 'logic',
    label: 'Split',
    description: 'Split into branches',
    category: 'logic',
    icon: 'git-branch',
  },
];






