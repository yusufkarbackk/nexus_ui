'use client';

import { BaseNode } from './BaseNode';
import { CustomNodeData } from '../../types/workflowTypes';

interface TriggerNodeProps {
  id: string;
  data: CustomNodeData;
  selected?: boolean;
}

export function TriggerNode({ id, data, selected }: TriggerNodeProps) {
  return (
    <BaseNode
      id={id}
      data={data}
      selected={selected}
      category="trigger"
      showTargetHandle={false}
      showSourceHandle={true}
    />
  );
}
