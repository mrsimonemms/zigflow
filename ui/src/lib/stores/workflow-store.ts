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

// Workflow store - manages the workflow graph state

import { writable, derived } from 'svelte/store';
import type {
  WorkflowGraph,
  BaseNode,
  FlowEdge,
  NodeId,
  Position,
} from '$lib/core/graph/types';
import { YamlToGraphConverter } from '$lib/core/converters/yaml-to-graph';
import { GraphToYamlConverter } from '$lib/core/converters/graph-to-yaml';
import {
  addNode,
  addEdge,
  updateNode,
  deleteNode,
  deleteEdge,
} from '$lib/core/graph/graph-model';

// Default empty graph
const EMPTY_GRAPH: WorkflowGraph = {
  nodes: [],
  edges: [],
  metadata: {
    dsl: '1.0.0',
    namespace: 'zigflow',
    name: 'untitled',
    version: '0.0.1',
  },
};

// History entry for undo/redo
interface HistoryEntry {
  graph: WorkflowGraph;
  timestamp: Date;
}

// Maximum history size
const MAX_HISTORY_SIZE = 50;

// Create writable store with undo/redo support
function createWorkflowStore() {
  const { subscribe, set, update } = writable<WorkflowGraph>(EMPTY_GRAPH);

  const yamlConverter = new YamlToGraphConverter();
  const graphConverter = new GraphToYamlConverter();

  // History stacks
  let history: HistoryEntry[] = [];
  let historyIndex = -1;
  let isUndoRedo = false;

  // Add to history
  function addToHistory(graph: WorkflowGraph) {
    if (isUndoRedo) return;

    // Remove any forward history if we're not at the end
    if (historyIndex < history.length - 1) {
      history = history.slice(0, historyIndex + 1);
    }

    // Add new entry
    history.push({
      graph: JSON.parse(JSON.stringify(graph)), // Deep clone
      timestamp: new Date(),
    });

    // Limit history size
    if (history.length > MAX_HISTORY_SIZE) {
      history = history.slice(history.length - MAX_HISTORY_SIZE);
    }

    historyIndex = history.length - 1;
  }

  // Wrap set to add to history
  const wrappedSet = (graph: WorkflowGraph) => {
    set(graph);
    addToHistory(graph);
  };

  return {
    subscribe,

    /**
     * Load workflow from YAML string
     */
    loadFromYaml: (yamlString: string) => {
      try {
        const graph = yamlConverter.convert(yamlString);
        wrappedSet(graph);
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },

    /**
     * Export workflow to YAML string
     */
    exportToYaml: (graph: WorkflowGraph): string => {
      return graphConverter.convert(graph);
    },

    /**
     * Reset to empty workflow
     */
    reset: () => {
      wrappedSet(EMPTY_GRAPH);
      history = [];
      historyIndex = -1;
    },

    /**
     * Add a new node
     */
    addNode: (node: BaseNode) => {
      update((graph) => {
        const newGraph = addNode(graph, node);
        addToHistory(newGraph);
        return newGraph;
      });
    },

    /**
     * Update an existing node
     */
    updateNode: (nodeId: NodeId, updates: Partial<BaseNode>) => {
      update((graph) => {
        const newGraph = updateNode(graph, nodeId, updates);
        addToHistory(newGraph);
        return newGraph;
      });
    },

    /**
     * Remove a node
     */
    removeNode: (nodeId: NodeId) => {
      update((graph) => {
        const newGraph = deleteNode(graph, nodeId);
        addToHistory(newGraph);
        return newGraph;
      });
    },

    /**
     * Add a new edge
     */
    addEdge: (edge: FlowEdge) => {
      update((graph) => {
        const newGraph = addEdge(graph, edge);
        addToHistory(newGraph);
        return newGraph;
      });
    },

    /**
     * Remove an edge
     */
    removeEdge: (edgeId: string) => {
      update((graph) => {
        const newGraph = deleteEdge(graph, edgeId);
        addToHistory(newGraph);
        return newGraph;
      });
    },

    /**
     * Update node position (for drag operations)
     */
    updateNodePosition: (nodeId: NodeId, position: Position) => {
      update((graph) => {
        const newGraph = updateNode(graph, nodeId, { position });
        addToHistory(newGraph);
        return newGraph;
      });
    },

    /**
     * Update workflow metadata
     */
    updateMetadata: (metadata: Partial<WorkflowGraph['metadata']>) => {
      update((graph) => {
        const newGraph = {
          ...graph,
          metadata: {
            ...graph.metadata,
            ...metadata,
          },
        };
        addToHistory(newGraph);
        return newGraph;
      });
    },

    /**
     * Undo last change
     */
    undo: () => {
      if (historyIndex > 0) {
        isUndoRedo = true;
        historyIndex--;
        set(JSON.parse(JSON.stringify(history[historyIndex].graph)));
        isUndoRedo = false;
        return true;
      }
      return false;
    },

    /**
     * Redo last undone change
     */
    redo: () => {
      if (historyIndex < history.length - 1) {
        isUndoRedo = true;
        historyIndex++;
        set(JSON.parse(JSON.stringify(history[historyIndex].graph)));
        isUndoRedo = false;
        return true;
      }
      return false;
    },

    /**
     * Check if undo is available
     */
    canUndo: () => historyIndex > 0,

    /**
     * Check if redo is available
     */
    canRedo: () => historyIndex < history.length - 1,
  };
}

// Export singleton instance
export const workflowStore = createWorkflowStore();

// Shared converter instance for derived store (performance optimization)
const sharedYamlConverter = new GraphToYamlConverter();

// Cache for YAML conversion to avoid recomputing on same graph
let lastGraph: WorkflowGraph | null = null;
let lastYaml = '';

// Derived store for YAML representation with memoization
export const workflowYaml = derived(workflowStore, ($workflow) => {
  try {
    // Check if graph is the same as last time (by reference)
    // This avoids unnecessary YAML serialization
    if ($workflow === lastGraph) {
      return lastYaml;
    }

    // Convert to YAML
    const yaml = sharedYamlConverter.convert($workflow);

    // Cache result
    lastGraph = $workflow;
    lastYaml = yaml;

    return yaml;
  } catch {
    return '';
  }
});

// Derived store for node count
export const nodeCount = derived(
  workflowStore,
  ($workflow) => $workflow.nodes.length
);

// Derived store for edge count
export const edgeCount = derived(
  workflowStore,
  ($workflow) => $workflow.edges.length
);
