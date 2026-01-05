'use client';

import { BaseNode } from './BaseNode';
import { CustomNodeData } from '../../types/workflowTypes';

interface LogicNodeProps {
  id: string;
  data: CustomNodeData;
  selected?: boolean;
}

export function LogicNode({ id, data, selected }: LogicNodeProps) {
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
