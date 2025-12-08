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
} from 'lucide-react';
import { DraggableNodeItem, nodeCategories } from '../types/workflowTypes';
import { draggableNodes } from '../data/initialData';
import {
  fetchApplications,
  fetchDestinations,
  Application,
  Destination,
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
};

interface SidebarProps {
  className?: string;
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

export function Sidebar({ className }: SidebarProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoadingApps, setIsLoadingApps] = useState(true);
  const [isLoadingDests, setIsLoadingDests] = useState(true);

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

  useEffect(() => {
    loadApplications();
    loadDestinations();
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

        {/* Destinations */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-teal-500" />
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Destinations
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

