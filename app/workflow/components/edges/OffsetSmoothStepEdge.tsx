'use client';

import { BaseEdge, getSmoothStepPath, EdgeLabelRenderer } from '@xyflow/react';
import type { Edge, EdgeProps } from '@xyflow/react';

// Define edge data type
interface OffsetEdgeData extends Record<string, unknown> {
    pipelineConfig?: unknown;
    edgeOffset?: number;
}

// Define custom edge type
type OffsetEdge = Edge<OffsetEdgeData, 'offsetSmoothStep'>;

/**
 * Custom edge component that renders with a vertical offset.
 * Used for multiple edges connecting the same source and target nodes.
 */
export function OffsetSmoothStepEdge({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    label,
    labelStyle,
    labelBgStyle,
    labelBgPadding,
    labelBgBorderRadius,
    data,
}: EdgeProps<OffsetEdge>) {
    // Get offset from edge data (stored during creation)
    const offset = (data as OffsetEdgeData)?.edgeOffset || 0;

    // Calculate path with offset applied to both source and target Y positions
    const [edgePath, labelX, labelY] = getSmoothStepPath({
        sourceX,
        sourceY: sourceY + offset,
        sourcePosition,
        targetX,
        targetY: targetY + offset,
        targetPosition,
        borderRadius: 10,
    });

    // Also offset the label position for better visibility
    const offsetLabelY = labelY + (offset * 0.3);

    // Parse styles safely
    const bgStyle = labelBgStyle as React.CSSProperties | undefined;
    const textStyle = labelStyle as React.CSSProperties | undefined;
    const padding = labelBgPadding as [number, number] | undefined;

    return (
        <>
            <BaseEdge
                path={edgePath}
                style={style}
                markerEnd={markerEnd as string | undefined}
            />
            {label && (
                <EdgeLabelRenderer>
                    <div
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${labelX}px, ${offsetLabelY}px)`,
                            background: bgStyle?.fill || '#0f172a',
                            padding: `${padding?.[1] || 2}px ${padding?.[0] || 4}px`,
                            borderRadius: labelBgBorderRadius || 4,
                            fontSize: 10,
                            color: textStyle?.fill || '#ec4899',
                            pointerEvents: 'all',
                        }}
                        className="nodrag nopan"
                    >
                        {label}
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    );
}

export const edgeTypes = {
    offsetSmoothStep: OffsetSmoothStepEdge,
};
