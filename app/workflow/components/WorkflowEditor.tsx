'use client';

import { useCallback, useRef, DragEvent, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  ReactFlowProvider,
  useReactFlow,
  BackgroundVariant,
  Panel,
  Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { TriggerNode, ActionNode, LogicNode, SenderAppNode, DestinationNode, RestDestinationNode, MQTTSourceNode } from './nodes';
import { Sidebar } from './Sidebar';
import { MappingPanel } from './MappingPanel';
import {
  DraggableNodeItem,
  CustomNodeData,
  WorkflowNode,
  SenderAppNodeData,
  DestinationNodeData,
  RestDestinationNodeData,
  MQTTSourceNodeData,
  MQTTSource,
  PipelineConfig,
  WorkflowEdge,
} from '../types/workflowTypes';
import { createWorkflow, updateWorkflow, fetchWorkflowById, Application, Destination, Workflow } from '@/app/lib/api';
import { Save, Play, Undo, Redo, ZoomIn, ZoomOut, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  logic: LogicNode,
  senderApp: SenderAppNode,
  destination: DestinationNode,
  restDestination: RestDestinationNode,
  mqttSource: MQTTSourceNode,
};

let nodeIdCounter = 1;

function generateNodeId(): string {
  return `node-${Date.now()}-${nodeIdCounter++}`;
}

interface MappingPanelState {
  isOpen: boolean;
  sourceNodeId: string;
  targetNodeId: string;
  sourceApplication: Application | null;
  mqttSource?: MQTTSource | null;  // For MQTT source connections
  targetDestination: Destination | null;
  pendingConnection: Connection | null;
  existingConfig: PipelineConfig | null;
}

function FlowCanvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  const isEditMode = !!editId;

  const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<WorkflowEdge>([]);
  const { screenToFlowPosition, zoomIn, zoomOut } = useReactFlow();

  const [workflowId, setWorkflowId] = useState<number | null>(null);
  const [workflowName, setWorkflowName] = useState('New Workflow');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [retentionHours, setRetentionHours] = useState(168); // Default 7 days
  const [deleteFailedImmediately, setDeleteFailedImmediately] = useState(false);
  const [pipelineConfigs, setPipelineConfigs] = useState<Map<string, PipelineConfig>>(new Map());
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState('');

  const [mappingPanel, setMappingPanel] = useState<MappingPanelState>({
    isOpen: false,
    sourceNodeId: '',
    targetNodeId: '',
    sourceApplication: null,
    targetDestination: null,
    pendingConnection: null,
    existingConfig: null,
  });

  // Load existing workflow when in edit mode
  useEffect(() => {
    async function loadWorkflow() {
      if (!editId) return;

      setIsLoading(true);

      try {
        const response = await fetchWorkflowById(parseInt(editId));
        if (response.success && response.data) {
          const workflow = response.data;
          setWorkflowId(workflow.id);
          setWorkflowName(workflow.name);
          setWorkflowDescription(workflow.description || '');
          setRetentionHours(workflow.redisRetentionHours || 168);
          setDeleteFailedImmediately(workflow.deleteFailedImmediately || false);

          // Reconstruct nodes and edges from pipelines
          const newNodes: WorkflowNode[] = [];
          const newEdges: WorkflowEdge[] = [];
          const newPipelineConfigs = new Map<string, PipelineConfig>();

          let nodeIndex = 0;
          const appNodeMap = new Map<number, string>(); // applicationId -> nodeId
          const mqttNodeMap = new Map<number, string>(); // mqttSourceId -> nodeId
          const destNodeMap = new Map<number, string>(); // destinationId -> nodeId

          workflow.pipelines?.forEach((pipeline, pipelineIndex) => {
            let sourceNodeId: string | undefined;

            // Check if this is an MQTT source or sender app (matches DB enum values)
            if (pipeline.sourceType === 'mqtt_source' && pipeline.mqttSource) {
              // Create MQTT source node if not already created
              sourceNodeId = mqttNodeMap.get(pipeline.mqttSourceId || 0);
              if (!sourceNodeId) {
                sourceNodeId = `node-loaded-mqtt-${pipeline.mqttSourceId}`;
                mqttNodeMap.set(pipeline.mqttSourceId || 0, sourceNodeId);

                newNodes.push({
                  id: sourceNodeId,
                  type: 'mqttSource',
                  position: { x: 100, y: 100 + (nodeIndex * 200) },
                  data: {
                    label: pipeline.mqttSource.name,
                    description: pipeline.mqttSource.brokerUrl || 'MQTT Broker',
                    category: 'mqttSource',
                    icon: 'wifi',
                    mqttSourceId: pipeline.mqttSource.id,
                    mqttSource: pipeline.mqttSource,
                  } as MQTTSourceNodeData,
                });
                nodeIndex++;
              }
            } else if (pipeline.application) {
              // Create sender app node if not already created
              sourceNodeId = appNodeMap.get(pipeline.applicationId);
              if (!sourceNodeId) {
                sourceNodeId = `node-loaded-app-${pipeline.applicationId}`;
                appNodeMap.set(pipeline.applicationId, sourceNodeId);

                newNodes.push({
                  id: sourceNodeId,
                  type: 'senderApp',
                  position: { x: 100, y: 100 + (nodeIndex * 200) },
                  data: {
                    label: pipeline.application.name,
                    description: pipeline.application.description || `${pipeline.application.fields?.length || 0} fields`,
                    category: 'senderApp',
                    icon: 'send',
                    applicationId: pipeline.application.id,
                    application: pipeline.application,
                  } as SenderAppNodeData,
                });
                nodeIndex++;
              }
            }

            // Create destination node based on type
            let targetNodeId: string | undefined;

            if (pipeline.destinationType === 'rest' && pipeline.restDestination) {
              // REST destination
              targetNodeId = destNodeMap.get(pipeline.restDestinationId || 0);
              if (!targetNodeId) {
                targetNodeId = `node-loaded-rest-${pipeline.restDestinationId}`;
                destNodeMap.set(pipeline.restDestinationId || 0, targetNodeId);

                newNodes.push({
                  id: targetNodeId,
                  type: 'restDestination',
                  position: { x: 500, y: 100 + ((nodeIndex - appNodeMap.size) * 200) },
                  data: {
                    label: pipeline.restDestination.name,
                    description: pipeline.restDestination.description || 'REST API endpoint',
                    category: 'restDestination',
                    icon: 'globe',
                    restDestinationId: pipeline.restDestination.id,
                    restDestination: pipeline.restDestination,
                  } as RestDestinationNodeData,
                });
              }
            } else if (pipeline.destination) {
              // Database destination
              targetNodeId = destNodeMap.get(pipeline.destinationId || 0);
              if (!targetNodeId) {
                targetNodeId = `node-loaded-dest-${pipeline.destinationId}`;
                destNodeMap.set(pipeline.destinationId || 0, targetNodeId);

                newNodes.push({
                  id: targetNodeId,
                  type: 'destination',
                  position: { x: 500, y: 100 + ((nodeIndex - appNodeMap.size) * 200) },
                  data: {
                    label: pipeline.destination.name,
                    description: `${pipeline.destination.connectionType.toUpperCase()} - ${pipeline.destination.databaseName}`,
                    category: 'destination',
                    icon: pipeline.destination.connectionType === 'postgresql' ? 'server' : 'database',
                    destinationId: pipeline.destination.id,
                    destination: pipeline.destination,
                  } as DestinationNodeData,
                });
              }
            }

            // Create edge and pipeline config
            if (sourceNodeId && targetNodeId) {
              const edgeId = `edge-${sourceNodeId}-${targetNodeId}-${pipelineIndex}`;
              const isRest = pipeline.destinationType === 'rest';

              newEdges.push({
                id: edgeId,
                source: sourceNodeId,
                target: targetNodeId,
                animated: true,
                style: { stroke: isRest ? '#f97316' : '#14b8a6', strokeWidth: 2 },
                label: isRest ? pipeline.restDestination?.name : pipeline.targetTable,
                labelStyle: { fill: isRest ? '#f97316' : '#14b8a6', fontSize: 10 },
                labelBgStyle: { fill: '#0f172a', fillOpacity: 0.8 },
                labelBgPadding: [4, 2] as [number, number],
                labelBgBorderRadius: 4,
              });

              const config: PipelineConfig = {
                sourceNodeId,
                targetNodeId,
                sourceType: (pipeline.sourceType as 'sender_app' | 'mqtt_source') || 'sender_app',
                applicationId: pipeline.applicationId,
                destinationType: pipeline.destinationType || 'database',
                destinationId: pipeline.destinationId,
                targetTable: pipeline.targetTable,
                restDestinationId: pipeline.restDestinationId,
                fieldMappings: pipeline.fieldMappings?.map(fm => ({
                  sourceField: fm.sourceField,
                  destinationColumn: fm.destinationColumn,
                  dataType: fm.dataType,
                  transformType: fm.transformType,
                  transformParam: fm.transformParam,
                  defaultValue: fm.defaultValue,
                  nullHandling: fm.nullHandling,
                })) || [],
              };

              newPipelineConfigs.set(edgeId, config);
            }
          });

          setNodes(newNodes);
          setEdges(newEdges);
          setPipelineConfigs(newPipelineConfigs);
        } else {
          setSaveStatus('error');
          setSaveMessage('Failed to load workflow');
          setTimeout(() => setSaveStatus('idle'), 3000);
        }
      } catch (error) {
        console.error('Failed to load workflow:', error);
        setSaveStatus('error');
        setSaveMessage(error instanceof Error ? error.message : 'Failed to load workflow');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } finally {
        setIsLoading(false);
      }
    }

    loadWorkflow();
  }, [editId, setNodes, setEdges]);

  // Handle connection between nodes
  const onConnect = useCallback(
    (connection: Connection) => {
      const sourceNode = nodes.find((n) => n.id === connection.source);
      const targetNode = nodes.find((n) => n.id === connection.target);

      // Debug logging
      console.log('onConnect called:', {
        connection,
        sourceNodeType: sourceNode?.type,
        targetNodeType: targetNode?.type,
        sourceNodeData: sourceNode?.data,
        nodesCount: nodes.length
      });

      // Check if this is a sender app -> database destination connection
      if (
        sourceNode?.type === 'senderApp' &&
        targetNode?.type === 'destination'
      ) {
        const sourceData = sourceNode.data as SenderAppNodeData;
        const targetData = targetNode.data as DestinationNodeData;

        // Open mapping panel for database destinations
        setMappingPanel({
          isOpen: true,
          sourceNodeId: connection.source!,
          targetNodeId: connection.target!,
          sourceApplication: sourceData.application,
          targetDestination: targetData.destination,
          pendingConnection: connection,
          existingConfig: null,
        });
      } else if (
        sourceNode?.type === 'senderApp' &&
        targetNode?.type === 'restDestination'
      ) {
        // REST destination - create pipeline config directly (no table mapping needed)
        const sourceData = sourceNode.data as SenderAppNodeData;
        const targetData = targetNode.data as RestDestinationNodeData;

        const edgeId = `edge-${connection.source}-${connection.target}`;

        // Create the pipeline config for REST destination
        const config: PipelineConfig = {
          sourceNodeId: connection.source!,
          targetNodeId: connection.target!,
          sourceType: 'sender_app',
          applicationId: sourceData.application.id,
          destinationType: 'rest',
          restDestinationId: targetData.restDestinationId,
          fieldMappings: [], // No field mappings for REST - sends full payload
        };

        // Add the edge with REST styling
        setEdges((eds) =>
          addEdge(
            {
              ...connection,
              id: edgeId,
              animated: true,
              style: { stroke: '#f97316', strokeWidth: 2 },
              label: targetData.restDestination?.name || 'REST API',
              labelStyle: { fill: '#f97316', fontSize: 10 },
              labelBgStyle: { fill: '#0f172a', fillOpacity: 0.8 },
              labelBgPadding: [4, 2] as [number, number],
              labelBgBorderRadius: 4,
              data: { pipelineConfig: config },
            },
            eds
          )
        );

        // Store the pipeline config
        setPipelineConfigs((prev) => {
          const newMap = new Map(prev);
          newMap.set(edgeId, config);
          return newMap;
        });
      } else if (
        sourceNode?.type === 'mqttSource' &&
        targetNode?.type === 'destination'
      ) {
        // MQTT source -> database destination connection
        const sourceData = sourceNode.data as MQTTSourceNodeData;
        const targetData = targetNode.data as DestinationNodeData;

        // Open mapping panel for database destinations
        setMappingPanel({
          isOpen: true,
          sourceNodeId: connection.source!,
          targetNodeId: connection.target!,
          sourceApplication: null,  // No sender app, use MQTT source
          mqttSource: sourceData.mqttSource,
          targetDestination: targetData.destination,
          pendingConnection: connection,
          existingConfig: null,
        });
      } else if (
        sourceNode?.type === 'mqttSource' &&
        targetNode?.type === 'restDestination'
      ) {
        // MQTT source -> REST destination connection
        const sourceData = sourceNode.data as MQTTSourceNodeData;
        const targetData = targetNode.data as RestDestinationNodeData;

        const edgeId = `edge-${connection.source}-${connection.target}`;

        // Create the pipeline config for REST destination
        const config: PipelineConfig = {
          sourceNodeId: connection.source!,
          targetNodeId: connection.target!,
          sourceType: 'mqtt_source',
          mqttSourceId: sourceData.mqttSource.id,
          destinationType: 'rest',
          restDestinationId: targetData.restDestinationId,
          fieldMappings: [], // No field mappings for REST - sends full payload
        };

        // Add the edge with REST styling
        setEdges((eds) =>
          addEdge(
            {
              ...connection,
              id: edgeId,
              animated: true,
              style: { stroke: '#f97316', strokeWidth: 2 },
              label: targetData.restDestination?.name || 'REST API',
              labelStyle: { fill: '#f97316', fontSize: 10 },
              labelBgStyle: { fill: '#0f172a', fillOpacity: 0.8 },
              labelBgPadding: [4, 2] as [number, number],
              labelBgBorderRadius: 4,
              data: { pipelineConfig: config },
            },
            eds
          )
        );

        // Store the pipeline config
        setPipelineConfigs((prev) => {
          const newMap = new Map(prev);
          newMap.set(edgeId, config);
          return newMap;
        });
      } else {
        // For other connections, just add the edge
        setEdges((eds) =>
          addEdge(
            {
              ...connection,
              animated: true,
              style: { stroke: '#6366f1', strokeWidth: 2 },
            },
            eds
          )
        );
      }
    },
    [nodes, setEdges]
  );

  // Handle mapping panel save
  const handleMappingSave = useCallback(
    (config: PipelineConfig) => {
      const edgeId = `edge-${config.sourceNodeId}-${config.targetNodeId}`;

      if (mappingPanel.pendingConnection) {
        // Creating new connection - Add the edge
        setEdges((eds) =>
          addEdge(
            {
              ...mappingPanel.pendingConnection!,
              id: edgeId,
              animated: true,
              style: { stroke: '#14b8a6', strokeWidth: 2 },
              label: config.targetTable,
              labelStyle: { fill: '#14b8a6', fontSize: 10 },
              labelBgStyle: { fill: '#0f172a', fillOpacity: 0.8 },
              labelBgPadding: [4, 2] as [number, number],
              labelBgBorderRadius: 4,
              data: { pipelineConfig: config },
            },
            eds
          )
        );
      } else {
        // Editing existing connection - Update edge label
        setEdges((eds) =>
          eds.map((edge) => {
            if (edge.source === config.sourceNodeId && edge.target === config.targetNodeId) {
              return {
                ...edge,
                label: config.targetTable,
                data: { pipelineConfig: config },
              };
            }
            return edge;
          })
        );
      }

      // Store/Update pipeline config
      setPipelineConfigs((prev) => {
        const newMap = new Map(prev);
        // Find and remove old config with same source/target if exists
        for (const [key, value] of newMap.entries()) {
          if (value.sourceNodeId === config.sourceNodeId && value.targetNodeId === config.targetNodeId) {
            newMap.delete(key);
            break;
          }
        }
        newMap.set(edgeId, config);
        return newMap;
      });

      // Close mapping panel
      setMappingPanel({
        isOpen: false,
        sourceNodeId: '',
        targetNodeId: '',
        sourceApplication: null,
        targetDestination: null,
        pendingConnection: null,
        existingConfig: null,
      });
    },
    [mappingPanel.pendingConnection, setEdges]
  );

  // Handle mapping panel close
  const handleMappingClose = useCallback(() => {
    setMappingPanel({
      isOpen: false,
      sourceNodeId: '',
      targetNodeId: '',
      sourceApplication: null,
      targetDestination: null,
      pendingConnection: null,
      existingConfig: null,
    });
  }, []);

  const onNodeClick = useCallback((_event: React.MouseEvent, node: WorkflowNode) => {
    console.log('Nodeselect:', node.id);
  }, []);

  // Handle edge click - open mapping panel to edit existing connection
  const onEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: WorkflowEdge) => {
      // Get the pipeline config for this edge
      const existingConfig = pipelineConfigs.get(edge.id);
      if (!existingConfig) {
        console.log('No config found for edge:', edge.id);
        return;
      }

      // Find source and target nodes
      const sourceNode = nodes.find((n) => n.id === edge.source);
      const targetNode = nodes.find((n) => n.id === edge.target);

      if (!sourceNode || !targetNode) {
        console.log('Source or target node not found');
        return;
      }

      // Handle both senderApp and mqttSource as source nodes
      // Handle both destination and restDestination as target nodes
      const isSenderApp = sourceNode.type === 'senderApp';
      const isMqttSource = sourceNode.type === 'mqttSource';
      const isDbDest = targetNode.type === 'destination';
      const isRestDest = targetNode.type === 'restDestination';

      if ((isSenderApp || isMqttSource) && (isDbDest || isRestDest)) {
        const targetData = isDbDest
          ? (targetNode.data as DestinationNodeData).destination
          : (targetNode.data as RestDestinationNodeData).restDestination;

        // Build mapping panel state
        const panelState: MappingPanelState = {
          isOpen: true,
          sourceNodeId: edge.source,
          targetNodeId: edge.target,
          sourceApplication: isSenderApp ? (sourceNode.data as SenderAppNodeData).application : null,
          mqttSource: isMqttSource ? (sourceNode.data as MQTTSourceNodeData).mqttSource : null,
          targetDestination: targetData,
          pendingConnection: null, // null because we're editing, not creating
          existingConfig: existingConfig,
        };

        setMappingPanel(panelState);
      }
    },
    [nodes, pipelineConfigs]
  );

  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const data = event.dataTransfer.getData('application/reactflow');
      if (!data) return;

      const nodeData: DraggableNodeItem = JSON.parse(data);

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      let newNode: WorkflowNode;

      if (nodeData.type === 'senderApp' && nodeData.application) {
        newNode = {
          id: generateNodeId(),
          type: 'senderApp',
          position,
          data: {
            label: nodeData.label,
            description: nodeData.description,
            category: 'senderApp',
            icon: nodeData.icon,
            applicationId: nodeData.applicationId!,
            application: nodeData.application,
          } as SenderAppNodeData,
        };
      } else if (nodeData.type === 'destination' && nodeData.destination) {
        newNode = {
          id: generateNodeId(),
          type: 'destination',
          position,
          data: {
            label: nodeData.label,
            description: nodeData.description,
            category: 'destination',
            icon: nodeData.icon,
            destinationId: nodeData.destinationId!,
            destination: nodeData.destination,
          } as DestinationNodeData,
        };
      } else if (nodeData.type === 'restDestination' && nodeData.restDestination) {
        // Handle REST destination drop
        newNode = {
          id: generateNodeId(),
          type: 'restDestination',
          position,
          data: {
            label: nodeData.label,
            description: nodeData.description,
            category: 'restDestination',
            icon: nodeData.icon,
            restDestinationId: nodeData.restDestinationId!,
            restDestination: nodeData.restDestination,
          } as RestDestinationNodeData,
        };
      } else if (nodeData.type === 'mqttSource' && nodeData.mqttSource) {
        // Handle MQTT source drop
        newNode = {
          id: generateNodeId(),
          type: 'mqttSource',
          position,
          data: {
            label: nodeData.label,
            description: nodeData.description,
            category: 'mqttSource',
            icon: nodeData.icon,
            mqttSourceId: nodeData.mqttSourceId!,
            mqttSource: nodeData.mqttSource,
          } as MQTTSourceNodeData,
        };
      } else {
        newNode = {
          id: generateNodeId(),
          type: nodeData.type,
          position,
          data: {
            label: nodeData.label,
            description: nodeData.description,
            category: nodeData.category,
            icon: nodeData.icon,
          } as CustomNodeData,
        };
      }

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes]
  );

  // Handle edge deletion - also remove pipeline config
  const onEdgesDelete = useCallback(
    (deletedEdges: Edge[]) => {
      setPipelineConfigs((prev) => {
        const newMap = new Map(prev);
        deletedEdges.forEach((edge) => {
          newMap.delete(edge.id);
        });
        return newMap;
      });
    },
    []
  );

  const handleSave = async () => {
    // Collect all pipeline configurations
    const pipelines = Array.from(pipelineConfigs.values()).map((config) => ({
      sourceType: config.sourceType || 'sender_app',
      // Source fields - either applicationId or mqttSourceId based on sourceType
      ...(config.sourceType === 'mqtt_source'
        ? { mqttSourceId: config.mqttSourceId }
        : { applicationId: config.applicationId }
      ),
      destinationType: config.destinationType || 'database',
      // Database destination fields
      ...(config.destinationType !== 'rest' && {
        destinationId: config.destinationId,
        targetTable: config.targetTable,
      }),
      // REST destination fields
      ...(config.destinationType === 'rest' && {
        restDestinationId: config.restDestinationId,
      }),
      isActive: true,
      fieldMappings: config.fieldMappings.map((fm) => ({
        sourceField: fm.sourceField,
        destinationColumn: fm.destinationColumn,
        dataType: fm.dataType,
        transformType: fm.transformType,
        transformParam: fm.transformParam,
        defaultValue: fm.defaultValue,
        nullHandling: fm.nullHandling,
      })),
    }));

    if (pipelines.length === 0) {
      setSaveStatus('error');
      setSaveMessage('Please add at least one data mapping (connect a source to a destination)');
      setTimeout(() => setSaveStatus('idle'), 3000);
      return;
    }

    setIsSaving(true);
    setSaveStatus('idle');

    try {
      let response;

      if (isEditMode && workflowId) {
        // Update existing workflow
        response = await updateWorkflow(workflowId, {
          name: workflowName,
          description: workflowDescription || undefined,
          isActive: true,
          redisRetentionHours: retentionHours,
          deleteFailedImmediately: deleteFailedImmediately,
          pipelines,
        });

        if (response.success) {
          setSaveStatus('success');
          setSaveMessage('Workflow updated successfully!');
          console.log('Workflow updated:', response.data);
        } else {
          throw new Error(response.message);
        }
      } else {
        // Create new workflow
        response = await createWorkflow({
          name: workflowName,
          description: workflowDescription || undefined,
          isActive: true,
          redisRetentionHours: retentionHours,
          deleteFailedImmediately: deleteFailedImmediately,
          pipelines,
        });

        if (response.success) {
          setSaveStatus('success');
          setSaveMessage('Workflow saved successfully!');
          console.log('Workflow saved:', response.data);
          // Set the workflow ID so subsequent saves will update instead of create
          if (response.data) {
            setWorkflowId(response.data.id);
          }
        } else {
          throw new Error(response.message);
        }
      }
    } catch (error) {
      console.error('Failed to save workflow:', error);
      setSaveStatus('error');
      setSaveMessage(error instanceof Error ? error.message : 'Failed to save workflow');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleRun = () => {
    console.log('Running workflow...');
    // Here you would trigger workflow execution
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen w-full bg-slate-950 items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-lg">Loading workflow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-slate-950">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Canvas */}
      <div ref={reactFlowWrapper} className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onEdgesDelete={onEdgesDelete}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          onDragOver={onDragOver}
          onDrop={onDrop}
          nodeTypes={nodeTypes}
          fitView
          className="bg-slate-950"
          defaultEdgeOptions={{
            animated: true,
            style: { stroke: '#6366f1', strokeWidth: 2 },
          }}
          connectionLineStyle={{ stroke: '#6366f1', strokeWidth: 2 }}
          snapToGrid
          snapGrid={[15, 15]}
          deleteKeyCode={['Backspace', 'Delete']}
        >
          {/* Background Pattern */}
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="#334155"
          />

          {/* Mini Map */}
          <MiniMap
            nodeStrokeColor={(node) => {
              switch (node.type) {
                case 'trigger':
                  return '#3b82f6';
                case 'action':
                  return '#10b981';
                case 'logic':
                  return '#f59e0b';
                case 'senderApp':
                  return '#6366f1';
                case 'destination':
                  return '#14b8a6';
                default:
                  return '#64748b';
              }
            }}
            nodeColor={(node) => {
              switch (node.type) {
                case 'trigger':
                  return '#dbeafe';
                case 'action':
                  return '#d1fae5';
                case 'logic':
                  return '#fef3c7';
                case 'senderApp':
                  return '#e0e7ff';
                case 'destination':
                  return '#ccfbf1';
                default:
                  return '#f1f5f9';
              }
            }}
            nodeBorderRadius={8}
            maskColor="rgba(15, 23, 42, 0.8)"
            className="!bg-slate-800 !border-slate-700 rounded-lg"
          />

          {/* Controls */}
          <Controls
            className="!bg-slate-800 !border-slate-700 !rounded-lg !shadow-lg"
            showZoom={false}
            showFitView={false}
            showInteractive={false}
          />

          {/* Top Action Bar */}
          <Panel position="top-center">
            <div className="flex items-center gap-2 bg-slate-800/90 backdrop-blur-sm px-4 py-2 rounded-xl border border-slate-700 shadow-lg">
              <button
                onClick={() => zoomOut()}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => zoomIn()}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-slate-600 mx-1" />
              <button
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                title="Undo"
              >
                <Undo className="w-4 h-4" />
              </button>
              <button
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                title="Redo"
              >
                <Redo className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-slate-600 mx-1" />
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save
              </button>
              <button
                onClick={handleRun}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
              >
                <Play className="w-4 h-4" />
                Run
              </button>
            </div>
          </Panel>

          {/* Workflow Name & Settings */}
          <Panel position="top-left" className="ml-4 mt-4">
            <div className="bg-slate-800/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-4">
              <input
                type="text"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                className="bg-transparent text-white font-semibold text-lg outline-none border-none focus:ring-0"
                placeholder="Workflow name..."
              />
              <div className="w-px h-6 bg-slate-600" />
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deleteFailedImmediately}
                    onChange={(e) => setDeleteFailedImmediately(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0"
                  />
                  <span className="text-xs text-slate-400">Delete failed immediately</span>
                </label>
                {!deleteFailedImmediately && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">|</span>
                    <span className="text-xs text-slate-400">Retention:</span>
                    <input
                      type="number"
                      min={0.1}
                      step={0.1}
                      value={retentionHours}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setRetentionHours(isNaN(val) ? 168 : val);
                      }}
                      className="w-16 px-2 py-1 bg-slate-700 text-white text-sm rounded border border-slate-600 focus:outline-none focus:border-indigo-500"
                      title="Hours to keep failed messages (e.g., 0.5 = 30 minutes)"
                    />
                    <span className="text-xs text-slate-400">hrs</span>
                  </div>
                )}
              </div>
            </div>
          </Panel>

          {/* Save Status Message */}
          {saveStatus !== 'idle' && (
            <Panel position="top-right" className="mr-4 mt-4">
              <div
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg border backdrop-blur-sm
                  ${saveStatus === 'success'
                    ? 'bg-green-900/50 border-green-700 text-green-300'
                    : 'bg-red-900/50 border-red-700 text-red-300'
                  }
                `}
              >
                {saveStatus === 'success' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                <span className="text-sm">{saveMessage}</span>
              </div>
            </Panel>
          )}

          {/* Pipeline Count */}
          <Panel position="bottom-left" className="ml-4 mb-4">
            <div className="bg-slate-800/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-slate-700">
              <p className="text-xs text-slate-400">
                <span className="text-white font-medium">{pipelineConfigs.size}</span> data mapping{pipelineConfigs.size !== 1 ? 's' : ''} configured
              </p>
            </div>
          </Panel>

          {/* Drop Zone Hint */}
          <Panel position="bottom-center" className="mb-4">
            <div className="bg-slate-800/60 backdrop-blur-sm px-4 py-2 rounded-lg border border-slate-700/50">
              <p className="text-sm text-slate-400">
                Drop sender apps and destinations here, then connect them to configure data mappings
              </p>
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {/* Mapping Panel */}
      {(mappingPanel.sourceApplication || mappingPanel.mqttSource) && mappingPanel.targetDestination && (
        <MappingPanel
          isOpen={mappingPanel.isOpen}
          onClose={handleMappingClose}
          onSave={handleMappingSave}
          sourceApplication={mappingPanel.sourceApplication || undefined}
          mqttSource={mappingPanel.mqttSource || undefined}
          targetDestination={mappingPanel.targetDestination}
          sourceNodeId={mappingPanel.sourceNodeId}
          targetNodeId={mappingPanel.targetNodeId}
          existingConfig={mappingPanel.existingConfig || undefined}
        />
      )}
    </div>
  );
}

export function WorkflowEditor() {
  return (
    <ReactFlowProvider>
      <FlowCanvas />
    </ReactFlowProvider>
  );
}

