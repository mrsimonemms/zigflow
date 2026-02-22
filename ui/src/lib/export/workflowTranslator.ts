/*
 * Copyright 2025 - 2026 Zigflow authors <https://github.com/mrsimonemms/zigflow/graphs/contributors>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Translator for converting Serverless Workflow Graph types to SvelteFlow types
 *
 * This module provides utilities to convert graph nodes and edges from the
 * Serverless Workflow SDK format to the SvelteFlow format.
 */
// Import buildGraph to extract types via inference
import type {
  GraphEdge as ServerlessWorkflowEdge,
  Graph as ServerlessWorkflowGraph,
  GraphNode as ServerlessWorkflowNode,
} from '@serverlessworkflow/sdk';
// Import SvelteFlow types directly from the library
import {
  Position,
  type Edge as SvelteFlowEdge,
  type Node as SvelteFlowNode,
} from '@xyflow/svelte';

// ============================================================================
// SvelteFlow Type Definitions (imported from @xyflow/svelte)
// ============================================================================

/**
 * Position coordinates for SvelteFlow nodes
 */
export interface XYPosition {
  x: number;
  y: number;
}

// ============================================================================
// Translation Options
// ============================================================================

/**
 * Options for configuring the translation process
 */
export interface TranslationOptions {
  /**
   * Default position to use if node doesn't have coordinates
   */
  defaultPosition?: XYPosition;

  /**
   * Spacing between nodes when auto-positioning
   */
  nodeSpacing?: {
    horizontal: number;
    vertical: number;
  };

  /**
   * Whether to automatically layout nodes that don't have positions
   */
  autoLayout?: boolean;

  /**
   * Default node type to use if not specified
   */
  defaultNodeType?: string;

  /**
   * Default edge type to use if not specified
   */
  defaultEdgeType?: string;

  /**
   * Default source position for node handles
   */
  defaultSourcePosition?: Position;

  /**
   * Default target position for node handles
   */
  defaultTargetPosition?: Position;

  /**
   * Whether edges should be animated by default
   */
  defaultEdgeAnimated?: boolean;

  /**
   * Function to generate node positions based on index
   */
  positionGenerator?: (
    node: ServerlessWorkflowNode,
    index: number,
  ) => XYPosition;

  /**
   * Function to map workflow node types to SvelteFlow node types
   */
  nodeTypeMapper?: (workflowNodeType: string) => string;

  /**
   * Function to extract additional data from workflow nodes
   */
  nodeDataExtractor?: (node: ServerlessWorkflowNode) => Record<string, unknown>;

  /**
   * Function to extract additional data from workflow edges
   */
  edgeDataExtractor?: (edge: ServerlessWorkflowEdge) => Record<string, unknown>;
}

/**
 * Result of the translation process
 */
export interface TranslationResult {
  nodes: SvelteFlowNode[];
  edges: SvelteFlowEdge[];
  originalGraph?: ServerlessWorkflowGraph;
}

// ============================================================================
// Default Options
// ============================================================================

const DEFAULT_OPTIONS: Required<
  Omit<
    TranslationOptions,
    | 'positionGenerator'
    | 'nodeTypeMapper'
    | 'nodeDataExtractor'
    | 'edgeDataExtractor'
  >
> = {
  defaultPosition: { x: 0, y: 0 },
  nodeSpacing: { horizontal: 200, vertical: 100 },
  autoLayout: true,
  defaultNodeType: 'default',
  defaultEdgeType: 'smoothstep',
  defaultSourcePosition: Position.Bottom,
  defaultTargetPosition: Position.Top,
  defaultEdgeAnimated: true,
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Type-safe accessor for node properties that may not be in the base type
 */
function getNodeProperty<T = unknown>(
  node: ServerlessWorkflowNode,
  key: string,
): T | undefined {
  return (node as Record<string, unknown>)[key] as T | undefined;
}

/**
 * Type-safe accessor for edge properties that may not be in the base type
 */
function getEdgeProperty<T = unknown>(
  edge: ServerlessWorkflowEdge,
  key: string,
): T | undefined {
  return (edge as Record<string, unknown>)[key] as T | undefined;
}

/**
 * Default position generator that arranges nodes in a vertical layout
 */
function defaultPositionGenerator(
  node: ServerlessWorkflowNode,
  index: number,
  options: TranslationOptions,
): XYPosition {
  const spacing = options.nodeSpacing ?? DEFAULT_OPTIONS.nodeSpacing;

  return {
    x: 0,
    y: index * spacing.vertical,
  };
}

/**
 * Default node type mapper - maps common workflow node types to SvelteFlow types
 */
function defaultNodeTypeMapper(workflowNodeType: string): string {
  const typeMap: Record<string, string> = {
    root: 'default',
    entry: 'input',
    exit: 'output',
    start: 'input',
    end: 'output',
  };

  return typeMap[workflowNodeType.toLowerCase()] ?? 'default';
}

/**
 * Generate a unique edge ID if not provided
 */
function generateEdgeId(edge: ServerlessWorkflowEdge): string {
  const edgeId = getEdgeProperty<string>(edge, 'id');
  if (edgeId) return edgeId;

  const source = getEdgeProperty<string>(edge, 'sourceId') ?? 'unknown';
  const target = getEdgeProperty<string>(edge, 'destinationId') ?? 'unknown';
  const sourceHandle = getEdgeProperty<string>(edge, 'sourceHandle');
  const targetHandle = getEdgeProperty<string>(edge, 'targetHandle');

  const sourceHandlePart = sourceHandle ? `-${sourceHandle}` : '';
  const targetHandlePart = targetHandle ? `-${targetHandle}` : '';

  return `e-${source}${sourceHandlePart}-${target}${targetHandlePart}`;
}

// ============================================================================
// Main Translation Functions
// ============================================================================

/**
 * Translates a Serverless Workflow Node to a SvelteFlow Node
 */
export function translateNode(
  workflowNode: ServerlessWorkflowNode,
  index: number,
  options: TranslationOptions = {},
): SvelteFlowNode {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  // Determine position
  let position: XYPosition;
  const nodePosition = getNodeProperty<XYPosition>(workflowNode, 'position');
  if (nodePosition) {
    // Use existing position if available
    position = nodePosition;
  } else if (mergedOptions.autoLayout) {
    // Generate position automatically
    if (options.positionGenerator) {
      position = options.positionGenerator(workflowNode, index);
    } else {
      position = defaultPositionGenerator(workflowNode, index, mergedOptions);
    }
  } else {
    position = mergedOptions.defaultPosition;
  }

  // Determine node type
  const nodeTypeMapper = options.nodeTypeMapper ?? defaultNodeTypeMapper;
  const nodeType = getNodeProperty<string>(workflowNode, 'type');
  const mappedType = nodeType
    ? nodeTypeMapper(nodeType)
    : mergedOptions.defaultNodeType;

  // Extract or build data object
  let data: Record<string, unknown>;
  if (options.nodeDataExtractor) {
    data = options.nodeDataExtractor(workflowNode);
  } else {
    const nodeLabel = getNodeProperty<string>(workflowNode, 'label');
    const nodeId = getNodeProperty<string>(workflowNode, 'id');
    const nodeData = getNodeProperty<Record<string, unknown>>(
      workflowNode,
      'data',
    );

    data = {
      label: nodeLabel ?? nodeId ?? 'Unnamed Node',
      ...(nodeData ?? {}), // Include any existing data
    };
  }

  // Build the SvelteFlow node
  const svelteFlowNode: SvelteFlowNode = {
    id: getNodeProperty<string>(workflowNode, 'id') ?? `node-${index}`,
    position,
    data,
    type: mappedType,
  };

  // Add optional properties if they exist
  const parent =
    getNodeProperty<string>(workflowNode, 'parent') ??
    getNodeProperty<string>(workflowNode, 'parentId');
  if (parent) {
    svelteFlowNode.parentId = parent;
  }

  const hidden = getNodeProperty<boolean>(workflowNode, 'hidden');
  if (hidden !== undefined) {
    svelteFlowNode.hidden = hidden;
  }

  const draggable = getNodeProperty<boolean>(workflowNode, 'draggable');
  if (draggable !== undefined) {
    svelteFlowNode.draggable = draggable;
  }

  const selectable = getNodeProperty<boolean>(workflowNode, 'selectable');
  if (selectable !== undefined) {
    svelteFlowNode.selectable = selectable;
  }

  const width = getNodeProperty<number>(workflowNode, 'width');
  if (width !== undefined) {
    svelteFlowNode.width = width;
  }

  const height = getNodeProperty<number>(workflowNode, 'height');
  if (height !== undefined) {
    svelteFlowNode.height = height;
  }

  const sourcePosition = getNodeProperty<Position>(
    workflowNode,
    'sourcePosition',
  );
  svelteFlowNode.sourcePosition =
    sourcePosition ?? mergedOptions.defaultSourcePosition;

  const targetPosition = getNodeProperty<Position>(
    workflowNode,
    'targetPosition',
  );
  svelteFlowNode.targetPosition =
    targetPosition ?? mergedOptions.defaultTargetPosition;

  return svelteFlowNode;
}

/**
 * Translates a Serverless Workflow Edge to a SvelteFlow Edge
 */
export function translateEdge(
  workflowEdge: ServerlessWorkflowEdge,
  options: TranslationOptions = {},
): SvelteFlowEdge {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  // Extract or build data object
  let data: Record<string, unknown>;
  if (options.edgeDataExtractor) {
    data = options.edgeDataExtractor(workflowEdge);
  } else {
    const edgeData = getEdgeProperty<Record<string, unknown>>(
      workflowEdge,
      'data',
    );
    data = edgeData ?? {};
  }

  // Build the SvelteFlow edge
  const source = getEdgeProperty<string>(workflowEdge, 'sourceId') ?? '';
  const target = getEdgeProperty<string>(workflowEdge, 'destinationId') ?? '';
  const edgeType = getEdgeProperty<string>(workflowEdge, 'type');

  const svelteFlowEdge: SvelteFlowEdge = {
    id: generateEdgeId(workflowEdge),
    source,
    target,
    type: edgeType ?? mergedOptions.defaultEdgeType,
    data,
  };

  // Add optional properties
  const label = getEdgeProperty<string>(workflowEdge, 'label');
  if (label) {
    svelteFlowEdge.label = label;
  }

  const sourceHandle = getEdgeProperty<string | null>(
    workflowEdge,
    'sourceHandle',
  );
  if (sourceHandle !== undefined) {
    svelteFlowEdge.sourceHandle = sourceHandle;
  }

  const targetHandle = getEdgeProperty<string | null>(
    workflowEdge,
    'targetHandle',
  );
  if (targetHandle !== undefined) {
    svelteFlowEdge.targetHandle = targetHandle;
  }

  const animated = getEdgeProperty<boolean>(workflowEdge, 'animated');
  svelteFlowEdge.animated = animated ?? mergedOptions.defaultEdgeAnimated;

  const hidden = getEdgeProperty<boolean>(workflowEdge, 'hidden');
  if (hidden !== undefined) {
    svelteFlowEdge.hidden = hidden;
  }

  const style = getEdgeProperty<string>(workflowEdge, 'style');
  if (style !== undefined) {
    svelteFlowEdge.style = style;
  }

  return svelteFlowEdge;
}

/**
 * Translates an entire Serverless Workflow Graph to SvelteFlow nodes and edges
 */
export function translateGraph(
  workflowGraph: ServerlessWorkflowGraph,
  options: TranslationOptions = {},
): TranslationResult {
  // Safely access nodes and edges arrays
  const graphNodes =
    (workflowGraph as { nodes?: ServerlessWorkflowNode[] }).nodes ?? [];
  const graphEdges =
    (workflowGraph as { edges?: ServerlessWorkflowEdge[] }).edges ?? [];

  // Translate all nodes
  const nodes = graphNodes.map((node, index) =>
    translateNode(node, index, options),
  );

  // Translate all edges
  const edges = graphEdges.map((edge) => translateEdge(edge, options));

  return {
    nodes,
    edges,
    originalGraph: workflowGraph,
  };
}

/**
 * Translates arrays of nodes and edges separately
 */
export function translateNodesAndEdges(
  workflowNodes: ServerlessWorkflowNode[],
  workflowEdges: ServerlessWorkflowEdge[],
  options: TranslationOptions = {},
): TranslationResult {
  const nodes = workflowNodes.map((node, index) =>
    translateNode(node, index, options),
  );

  const edges = workflowEdges.map((edge) => translateEdge(edge, options));

  return {
    nodes,
    edges,
  };
}

// ============================================================================
// Utility Functions for Advanced Use Cases
// ============================================================================

/**
 * Creates a hierarchical layout for nodes based on their parent relationships
 */
export function applyHierarchicalLayout(
  nodes: SvelteFlowNode[],
  options: { spacing?: { horizontal: number; vertical: number } } = {},
): SvelteFlowNode[] {
  const spacing = options.spacing ?? { horizontal: 200, vertical: 100 };

  // Group nodes by parent
  const nodesByParent = new Map<string | undefined, SvelteFlowNode[]>();
  nodes.forEach((node) => {
    const parentId = node.parentId;
    if (!nodesByParent.has(parentId)) {
      nodesByParent.set(parentId, []);
    }
    nodesByParent.get(parentId)!.push(node);
  });

  // Position root nodes first
  const rootNodes = nodesByParent.get(undefined) ?? [];
  rootNodes.forEach((node, index) => {
    node.position = {
      x: index * spacing.horizontal,
      y: 0,
    };
  });

  // Position child nodes relative to their parents
  nodes.forEach((node) => {
    if (node.parentId) {
      const parent = nodes.find((n) => n.id === node.parentId);
      if (parent) {
        const siblings = nodesByParent.get(node.parentId) ?? [];
        const siblingIndex = siblings.indexOf(node);

        node.position = {
          x: parent.position.x + siblingIndex * spacing.horizontal,
          y: parent.position.y + spacing.vertical,
        };
      }
    }
  });

  return nodes;
}

/**
 * Filters out entry and exit nodes if needed
 */
export function filterSystemNodes(
  graph: TranslationResult,
  options: { keepEntry?: boolean; keepExit?: boolean } = {},
): TranslationResult {
  const { keepEntry = false, keepExit = false } = options;

  const filteredNodes = graph.nodes.filter((node) => {
    const isEntry = node.type === 'input' || node.id.includes('entry');
    const isExit = node.type === 'output' || node.id.includes('exit');

    if (isEntry && !keepEntry) return false;
    if (isExit && !keepExit) return false;
    return true;
  });

  // Filter edges that connect to removed nodes
  const nodeIds = new Set(filteredNodes.map((n) => n.id));
  const filteredEdges = graph.edges.filter(
    (edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target),
  );

  return {
    nodes: filteredNodes,
    edges: filteredEdges,
    originalGraph: graph.originalGraph,
  };
}

// ============================================================================
// Export All
// ============================================================================

export default {
  translateNode,
  translateEdge,
  translateGraph,
  translateNodesAndEdges,
  applyHierarchicalLayout,
  filterSystemNodes,
};
