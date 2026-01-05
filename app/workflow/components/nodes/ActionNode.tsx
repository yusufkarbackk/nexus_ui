'use client';

import { BaseNode } from './BaseNode';
import { CustomNodeData } from '../../types/workflowTypes';

interface ActionNodeProps {
  id: string;
  data: CustomNodeData;
  selected?: boolean;
}

export function ActionNode({ id, data, selected }: ActionNodeProps) {
  return (
    <BaseNode
      id={id}
      data={data}
      selected={selected}
      category="action"
      showTargetHandle={true}
      showSourceHandle={true}
    />
  );
}
