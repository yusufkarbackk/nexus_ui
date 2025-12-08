'use client';

import { NodeProps } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import { CustomNodeData } from '../../types/workflowTypes';

export function LogicNode({ id, data, selected }: NodeProps<CustomNodeData>) {
  return (
    <BaseNode
      id={id}
      data={data}
      selected={selected}
      category="logic"
      showTargetHandle={true}
      showSourceHandle={true}
    />
  );
}
