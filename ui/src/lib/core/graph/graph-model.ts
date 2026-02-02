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

// Graph model utilities for manipulating workflow graphs

import { v4 as uuidv4 } from 'uuid';
import type {
  WorkflowGraph,
  BaseNode,
  FlowEdge,
  NodeId,
  EdgeId,
  TaskType,
  TaskData,
  Position,
} from './types';
import { getNodeDefinition } from './node-definitions';

// ============================================================================
// Graph creation and initialization
// ============================================================================

export function createEmptyGraph(): WorkflowGraph {
  return {
    nodes: [],
    edges: [],
    metadata: {
      dsl: '1.0.0',
      namespace: 'zigflow',
      name: 'untitled',
      version: '0.0.1',
    },
  };
}

export function createDefaultMetadata() {
  return {
    dsl: '1.0.0',
    namespace: 'zigflow',
    name: 'untitled',
    version: '0.0.1',
  };
}

// ============================================================================
// Node operations
// ============================================================================

export function createNode(
  type: TaskType,
  label: string,
  position: Position,
  data?: Partial<TaskData>
): BaseNode {
  const nodeData = createDefaultTaskData(type);

  return {
    id: uuidv4(),
    type,
    label,
    position,
    data: { ...nodeData, ...data } as TaskData,
  };
}

export function createDefaultTaskData(type: TaskType): TaskData {
  switch (type) {
    case 'call':
      return { type: 'call', call: 'http' };
    case 'do':
      return { type: 'do', do: [] };
    case 'fork':
      return { type: 'fork', fork: { branches: [] } };
    case 'emit':
      return {
        type: 'emit',
        emit: { event: { with: { source: '', type: '' } } },
      };
    case 'for':
      return { type: 'for', for: { in: '' }, do: [] };
    case 'listen':
      return {
        type: 'listen',
        listen: { to: { one: { with: { source: '', type: '' } } } },
      };
    case 'raise':
      return {
        type: 'raise',
        raise: { error: { type: '', status: 500 } },
      };
    case 'run':
      return {
        type: 'run',
        run: { container: { image: '' } },
      };
    case 'set':
      return { type: 'set', set: {} };
    case 'switch':
      return { type: 'switch', switch: [] };
    case 'try':
      return {
        type: 'try',
        try: [],
        catch: { errors: { with: {} } },
      };
    case 'wait':
      return { type: 'wait', wait: { seconds: 1 } };
    default:
      throw new Error(`Unknown task type: ${type}`);
  }
}

export function findNode(graph: WorkflowGraph, id: NodeId): BaseNode | null {
  return graph.nodes.find((node) => node.id === id) || null;
}

export function updateNode(
  graph: WorkflowGraph,
  id: NodeId,
  updates: Partial<BaseNode>
): WorkflowGraph {
  return {
    ...graph,
    nodes: graph.nodes.map((node) =>
      node.id === id ? { ...node, ...updates } : node
    ),
  };
}

export function deleteNode(graph: WorkflowGraph, id: NodeId): WorkflowGraph {
  return {
    ...graph,
    nodes: graph.nodes.filter((node) => node.id !== id),
    edges: graph.edges.filter(
      (edge) => edge.source !== id && edge.target !== id
    ),
  };
}

export function addNode(graph: WorkflowGraph, node: BaseNode): WorkflowGraph {
  return {
    ...graph,
    nodes: [...graph.nodes, node],
  };
}

// ============================================================================
// Edge operations
// ============================================================================

export function createEdge(
  source: NodeId,
  target: NodeId,
  label?: string,
  type?: FlowEdge['type']
): FlowEdge {
  return {
    id: uuidv4(),
    source,
    target,
    label,
    type: type || 'default',
  };
}

export function findEdge(graph: WorkflowGraph, id: EdgeId): FlowEdge | null {
  return graph.edges.find((edge) => edge.id === id) || null;
}

export function addEdge(graph: WorkflowGraph, edge: FlowEdge): WorkflowGraph {
  // Check if edge already exists (same source and target)
  const exists = graph.edges.some(
    (e) => e.source === edge.source && e.target === edge.target
  );

  if (exists) {
    return graph;
  }

  return {
    ...graph,
    edges: [...graph.edges, edge],
  };
}

export function deleteEdge(graph: WorkflowGraph, id: EdgeId): WorkflowGraph {
  return {
    ...graph,
    edges: graph.edges.filter((edge) => edge.id !== id),
  };
}

export function getIncomingEdges(
  graph: WorkflowGraph,
  nodeId: NodeId
): FlowEdge[] {
  return graph.edges.filter((edge) => edge.target === nodeId);
}

export function getOutgoingEdges(
  graph: WorkflowGraph,
  nodeId: NodeId
): FlowEdge[] {
  return graph.edges.filter((edge) => edge.source === nodeId);
}

// ============================================================================
// Graph topology operations
// ============================================================================

export function getEntryNodes(graph: WorkflowGraph): BaseNode[] {
  return graph.nodes.filter(
    (node) => getIncomingEdges(graph, node.id).length === 0
  );
}

export function getLeafNodes(graph: WorkflowGraph): BaseNode[] {
  return graph.nodes.filter(
    (node) => getOutgoingEdges(graph, node.id).length === 0
  );
}

export function isAcyclic(graph: WorkflowGraph): boolean {
  const visited = new Set<NodeId>();
  const recursionStack = new Set<NodeId>();

  function hasCycle(nodeId: NodeId): boolean {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    const outgoing = getOutgoingEdges(graph, nodeId);
    for (const edge of outgoing) {
      if (!visited.has(edge.target)) {
        if (hasCycle(edge.target)) {
          return true;
        }
      } else if (recursionStack.has(edge.target)) {
        return true;
      }
    }

    recursionStack.delete(nodeId);
    return false;
  }

  for (const node of graph.nodes) {
    if (!visited.has(node.id)) {
      if (hasCycle(node.id)) {
        return false;
      }
    }
  }

  return true;
}

export function getReachableNodes(
  graph: WorkflowGraph,
  startId: NodeId
): Set<NodeId> {
  const reachable = new Set<NodeId>();
  const queue: NodeId[] = [startId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (reachable.has(current)) continue;

    reachable.add(current);

    const outgoing = getOutgoingEdges(graph, current);
    for (const edge of outgoing) {
      if (!reachable.has(edge.target)) {
        queue.push(edge.target);
      }
    }
  }

  return reachable;
}

// ============================================================================
// Graph validation
// ============================================================================

export interface ValidationIssue {
  severity: 'error' | 'warning';
  nodeId?: NodeId;
  edgeId?: EdgeId;
  message: string;
}

export function validateGraph(graph: WorkflowGraph): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Check for at least one entry node
  const entryNodes = getEntryNodes(graph);
  if (graph.nodes.length > 0 && entryNodes.length === 0) {
    issues.push({
      severity: 'error',
      message:
        'Workflow must have at least one entry node (with no incoming edges)',
    });
  }

  // Check for orphaned nodes
  const allReachable = new Set<NodeId>();
  for (const entry of entryNodes) {
    const reachable = getReachableNodes(graph, entry.id);
    reachable.forEach((id) => allReachable.add(id));
  }

  for (const node of graph.nodes) {
    if (!allReachable.has(node.id) && entryNodes.length > 0) {
      issues.push({
        severity: 'warning',
        nodeId: node.id,
        message: `Node "${node.label}" is not reachable from any entry node`,
      });
    }
  }

  // Check for required fields per node type
  for (const node of graph.nodes) {
    const definition = getNodeDefinition(node.type);
    for (const field of definition.requiredFields) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!(node.data as any)[field]) {
        issues.push({
          severity: 'error',
          nodeId: node.id,
          message: `Node "${node.label}" is missing required field: ${field}`,
        });
      }
    }
  }

  // Check for edge count constraints
  for (const node of graph.nodes) {
    const definition = getNodeDefinition(node.type);
    const incoming = getIncomingEdges(graph, node.id);
    const outgoing = getOutgoingEdges(graph, node.id);

    if (
      typeof definition.maxIncoming === 'number' &&
      incoming.length > definition.maxIncoming
    ) {
      issues.push({
        severity: 'error',
        nodeId: node.id,
        message: `Node "${node.label}" has ${incoming.length} incoming edges but max is ${definition.maxIncoming}`,
      });
    }

    if (
      typeof definition.maxOutgoing === 'number' &&
      outgoing.length > definition.maxOutgoing
    ) {
      issues.push({
        severity: 'error',
        nodeId: node.id,
        message: `Node "${node.label}" has ${outgoing.length} outgoing edges but max is ${definition.maxOutgoing}`,
      });
    }
  }

  return issues;
}

// ============================================================================
// Position and layout utilities
// ============================================================================

export function calculateVerticalPosition(index: number): Position {
  return {
    x: 250,
    y: index * 120 + 50,
  };
}

export function calculateGridPosition(index: number, columns = 3): Position {
  const row = Math.floor(index / columns);
  const col = index % columns;

  return {
    x: col * 300 + 50,
    y: row * 150 + 50,
  };
}

export function autoLayout(graph: WorkflowGraph): WorkflowGraph {
  // Simple vertical layout for now
  // TODO: Implement more sophisticated layouts (Dagre, ELK)

  const entryNodes = getEntryNodes(graph);
  const positioned = new Set<NodeId>();
  let yOffset = 50;

  function layoutFromNode(nodeId: NodeId, depth: number) {
    if (positioned.has(nodeId)) return;

    const node = findNode(graph, nodeId);
    if (!node) return;

    node.position = {
      x: depth * 250 + 50,
      y: yOffset,
    };

    positioned.add(nodeId);
    yOffset += 120;

    const outgoing = getOutgoingEdges(graph, nodeId);
    for (const edge of outgoing) {
      layoutFromNode(edge.target, depth + 1);
    }
  }

  for (const entry of entryNodes) {
    layoutFromNode(entry.id, 0);
  }

  return { ...graph };
}
