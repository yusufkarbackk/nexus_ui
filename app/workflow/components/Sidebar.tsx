'use client';

import { DragEvent, useEffect, useState } from 'react';
import {
  Webhook,
  Globe,
  Clock,
  Database,
  Building,
  Send,
  Filter,
  Shuffle,
  GitMerge,
  GitBranch,
  GripVertical,
  Zap,
  Server,
  Loader2,
  RefreshCw,
  LucideIcon,
  Wifi,
} from 'lucide-react';
import { DraggableNodeItem, nodeCategories } from '../types/workflowTypes';
import type { WorkflowType } from '@/app/lib/api';
import { draggableNodes } from '../data/initialData';
import {
  fetchApplications,
  fetchDestinations,
  fetchRestDestinations,
  fetchMqttSources,
  fetchSapDestinations,
  Application,
  Destination,
  RestDestination,
  MQTTSource,
  SapDestination,
} from '@/app/lib/api';

const iconMap: Record<string, LucideIcon> = {
  webhook: Webhook,
  globe: Globe,
  clock: Clock,
  database: Database,
  building: Building,
  send: Send,
  filter: Filter,
  shuffle: Shuffle,
  'git-merge': GitMerge,
  'git-branch': GitBranch,
  server: Server,
  wifi: Wifi,
};

interface SidebarProps {
  className?: string;
  workflowType?: WorkflowType;
}

function DraggableNode({ node }: { node: DraggableNodeItem }) {
  const categoryStyle = nodeCategories[node.category];
  const IconComponent = iconMap[node.icon] || Webhook;

  const handleDragStart = (event: DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(node));
    event.dataTransfer.effectAllowed = 'move';
  };

  const getBgColor = () => {
    switch (node.category) {
      case 'trigger':
        return 'bg-blue-100';
      case 'action':
        return 'bg-emerald-100';
      case 'logic':
        return 'bg-amber-100';
      case 'senderApp':
        return 'bg-indigo-100';
      case 'destination':
        return 'bg-teal-100';
      case 'restDestination':
        return 'bg-orange-100';
      case 'sapDestination':
        return 'bg-rose-100';
      default:
        return 'bg-slate-100';
    }
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={`
        group flex items-center gap-3 p-3 rounded-lg border-2 cursor-grab
        transition-all duration-200 ease-in-out
        ${categoryStyle.bgColor} ${categoryStyle.borderColor}
        hover:scale-[1.02] hover:shadow-md active:cursor-grabbing active:scale-[0.98]
      `}
    >
      <div className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="w-4 h-4" />
      </div>
      <div className={`p-2 rounded-lg ${getBgColor()}`}>
        <IconComponent className={`w-4 h-4 ${categoryStyle.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className={`text-sm font-medium ${categoryStyle.color} truncate`}>
          {node.label}
        </h4>
        <p className="text-xs text-slate-500 truncate">{node.description}</p>
      </div>
    </div>
  );
}

export function Sidebar({ className, workflowType = 'fan_out' }: SidebarProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [restDestinations, setRestDestinations] = useState<RestDestination[]>([]);
  const [mqttSources, setMqttSources] = useState<MQTTSource[]>([]);
  const [sapDestinations, setSapDestinations] = useState<SapDestination[]>([]);
  const [isLoadingApps, setIsLoadingApps] = useState(true);
  const [isLoadingDests, setIsLoadingDests] = useState(true);
  const [isLoadingRestDests, setIsLoadingRestDests] = useState(true);
  const [isLoadingMqtt, setIsLoadingMqtt] = useState(true);
  const [isLoadingSap, setIsLoadingSap] = useState(true);

  const loadApplications = async () => {
    setIsLoadingApps(true);
    try {
      const response = await fetchApplications();
      setApplications(response.data);
    } catch (error) {
      console.error('Failed to load applications:', error);
    } finally {
      setIsLoadingApps(false);
    }
  };

  const loadDestinations = async () => {
    setIsLoadingDests(true);
    try {
      const response = await fetchDestinations();
      setDestinations(response.data);
    } catch (error) {
      console.error('Failed to load destinations:', error);
    } finally {
      setIsLoadingDests(false);
    }
  };

  const loadRestDestinations = async () => {
    setIsLoadingRestDests(true);
    try {
      const response = await fetchRestDestinations();
      setRestDestinations(response.data);
    } catch (error) {
      console.error('Failed to load REST destinations:', error);
    } finally {
      setIsLoadingRestDests(false);
    }
  };

  const loadMqttSources = async () => {
    setIsLoadingMqtt(true);
    try {
      const response = await fetchMqttSources();
      setMqttSources(response.data || []);
    } catch (error) {
      console.error('Failed to load MQTT sources:', error);
    } finally {
      setIsLoadingMqtt(false);
    }
  };

  const loadSapDestinations = async () => {
    setIsLoadingSap(true);
    try {
      const response = await fetchSapDestinations();
      setSapDestinations(response.data || []);
    } catch (error) {
      console.error('Failed to load SAP destinations:', error);
    } finally {
      setIsLoadingSap(false);
    }
  };

  useEffect(() => {
    loadApplications();
    loadDestinations();
    loadRestDestinations();
    loadMqttSources();
    loadSapDestinations();
  }, []);

  // Convert applications to draggable nodes
  const senderAppNodes: DraggableNodeItem[] = applications.map((app) => ({
    type: 'senderApp',
    label: app.name,
    description: app.description || `${app.fields?.length || 0} fields`,
    category: 'senderApp',
    icon: 'send',
    applicationId: app.id,
    application: app,
  }));

  // Convert MQTT sources to draggable nodes
  const mqttSourceNodes: DraggableNodeItem[] = mqttSources.map((source) => ({
    type: 'mqttSource',
    label: source.name,
    description: source.fields?.length ? `${source.fields.length} fields` : source.brokerUrl,
    category: 'mqttSource',
    icon: 'wifi',
    mqttSourceId: source.id,
    mqttSource: source,
  }));

  // Convert destinations to draggable nodes
  const destinationNodes: DraggableNodeItem[] = destinations.map((dest) => ({
    type: 'destination',
    label: dest.name,
    description: `${dest.connectionType.toUpperCase()} - ${dest.databaseName}`,
    category: 'destination',
    icon: dest.connectionType === 'postgresql' ? 'server' : 'database',
    destinationId: dest.id,
    destination: dest,
  }));

  // Convert REST destinations to draggable nodes
  const restDestinationNodes: DraggableNodeItem[] = restDestinations.map((dest) => ({
    type: 'restDestination',
    label: dest.name,
    description: `${dest.method} - ${dest.authType === 'none' ? 'No Auth' : dest.authType.replace('_', ' ')}`,
    category: 'restDestination',
    icon: 'globe',
    restDestinationId: dest.id,
    restDestination: dest,
  }));

  // Convert SAP destinations to draggable nodes
  const sapDestinationNodes: DraggableNodeItem[] = sapDestinations.map((dest) => ({
    type: 'sapDestination',
    label: dest.name,
    description: `ODBC - ${dest.dsn_name}`,
    category: 'sapDestination',
    icon: 'server',
    sapDestinationId: dest.id,
    sapDestination: dest,
  }));

  // Keep legacy nodes for triggers and logic
  const triggerNodes = draggableNodes.filter((n) => n.category === 'trigger');
  const logicNodes = draggableNodes.filter((n) => n.category === 'logic');

  return (
    <aside
      className={`
        w-72 bg-slate-900 border-r border-slate-800
        flex flex-col h-full overflow-hidden
        ${className}
      `}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-600 rounded-lg">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-white">Nexus Gateway</h2>
            <p className="text-xs text-slate-400">Workflow Editor</p>
          </div>
        </div>
      </div>

      {/* Node Categories */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {workflowType === 'sequential' ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <GitBranch className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm font-medium text-slate-400">Sequential Mode</p>
            <p className="text-xs text-center mt-2 px-4 text-slate-500">Use the step editor panel to add and configure workflow steps.</p>
          </div>
        ) : (
          <>
            {/* Sender Apps */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Sender Apps
                  </h3>
                </div>
                <button
                  onClick={loadApplications}
                  disabled={isLoadingApps}
                  className="p-1 hover:bg-slate-700 rounded transition-colors"
                  title="Refresh sender apps"
                >
                  {isLoadingApps ? (
                    <Loader2 className="w-3 h-3 text-slate-500 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3 h-3 text-slate-500" />
                  )}
                </button>
              </div>
              <div className="space-y-2">
                {isLoadingApps ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
                  </div>
                ) : senderAppNodes.length > 0 ? (
                  senderAppNodes.map((node) => (
                    <DraggableNode key={`app-${node.applicationId}`} node={node} />
                  ))
                ) : (
                  <p className="text-xs text-slate-500 text-center py-2">
                    No sender apps found
                  </p>
                )}
              </div>
            </div>

            {/* MQTT Sources */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    MQTT Sources
                  </h3>
                </div>
                <button
                  onClick={loadMqttSources}
                  disabled={isLoadingMqtt}
                  className="p-1 hover:bg-slate-700 rounded transition-colors"
                  title="Refresh MQTT sources"
                >
                  {isLoadingMqtt ? (
                    <Loader2 className="w-3 h-3 text-slate-500 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3 h-3 text-slate-500" />
                  )}
                </button>
              </div>
              <div className="space-y-2">
                {isLoadingMqtt ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
                  </div>
                ) : mqttSourceNodes.length > 0 ? (
                  mqttSourceNodes.map((node) => (
                    <DraggableNode key={`mqtt-${node.mqttSourceId}`} node={node} />
                  ))
                ) : (
                  <p className="text-xs text-slate-500 text-center py-2">
                    No MQTT sources found
                  </p>
                )}
              </div>
            </div>

            {/* Destinations */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-teal-500" />
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    DB Destinations
                  </h3>
                </div>
                <button
                  onClick={loadDestinations}
                  disabled={isLoadingDests}
                  className="p-1 hover:bg-slate-700 rounded transition-colors"
                  title="Refresh destinations"
                >
                  {isLoadingDests ? (
                    <Loader2 className="w-3 h-3 text-slate-500 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3 h-3 text-slate-500" />
                  )}
                </button>
              </div>
              <div className="space-y-2">
                {isLoadingDests ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
                  </div>
                ) : destinationNodes.length > 0 ? (
                  destinationNodes.map((node) => (
                    <DraggableNode key={`dest-${node.destinationId}`} node={node} />
                  ))
                ) : (
                  <p className="text-xs text-slate-500 text-center py-2">
                    No destinations found
                  </p>
                )}
              </div>
            </div>

            {/* REST Destinations */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    REST APIs
                  </h3>
                </div>
                <button
                  onClick={loadRestDestinations}
                  disabled={isLoadingRestDests}
                  className="p-1 hover:bg-slate-700 rounded transition-colors"
                  title="Refresh REST destinations"
                >
                  {isLoadingRestDests ? (
                    <Loader2 className="w-3 h-3 text-slate-500 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3 h-3 text-slate-500" />
                  )}
                </button>
              </div>
              <div className="space-y-2">
                {isLoadingRestDests ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
                  </div>
                ) : restDestinationNodes.length > 0 ? (
                  restDestinationNodes.map((node) => (
                    <DraggableNode key={`rest-${node.restDestinationId}`} node={node} />
                  ))
                ) : (
                  <p className="text-xs text-slate-500 text-center py-2">
                    No REST APIs configured
                  </p>
                )}
              </div>
            </div>

            {/* SAP Destinations */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500" />
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    SAP ODBC
                  </h3>
                </div>
                <button
                  onClick={loadSapDestinations}
                  disabled={isLoadingSap}
                  className="p-1 hover:bg-slate-700 rounded transition-colors"
                  title="Refresh SAP destinations"
                >
                  {isLoadingSap ? (
                    <Loader2 className="w-3 h-3 text-slate-500 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3 h-3 text-slate-500" />
                  )}
                </button>
              </div>
              <div className="space-y-2">
                {isLoadingSap ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
                  </div>
                ) : sapDestinationNodes.length > 0 ? (
                  sapDestinationNodes.map((node) => (
                    <DraggableNode key={`sap-${node.sapDestinationId}`} node={node} />
                  ))
                ) : (
                  <p className="text-xs text-slate-500 text-center py-2">
                    No SAP destinations configured
                  </p>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-700 pt-4">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-3">
                Additional Nodes
              </p>
            </div>

            {/* Trigger Nodes */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Triggers
                </h3>
              </div>
              <div className="space-y-2">
                {triggerNodes.map((node) => (
                  <DraggableNode key={`${node.type}-${node.label}`} node={node} />
                ))}
              </div>
            </div>

            {/* Logic Nodes */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Logic
                </h3>
              </div>
              <div className="space-y-2">
                {logicNodes.map((node) => (
                  <DraggableNode key={`${node.type}-${node.label}`} node={node} />
                ))}
              </div>
            </div>

          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        <p className="text-xs text-slate-500 text-center">
          Drag nodes to the canvas to build your workflow
        </p>
      </div>
    </aside>
  );
}

