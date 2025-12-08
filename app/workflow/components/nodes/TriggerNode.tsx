'use client';

import { NodeProps } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import { CustomNodeData } from '../../types/workflowTypes';

export function TriggerNode({ id, data, selected }: NodeProps<CustomNodeData>) {
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
