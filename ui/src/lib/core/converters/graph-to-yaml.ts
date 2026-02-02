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

// Graph to YAML converter - serializes graph IR to Serverless Workflow DSL

import yaml from 'js-yaml';
import type { WorkflowGraph, BaseNode, NodeId } from '../graph/types';
import { getEntryNodes, getOutgoingEdges } from '../graph/graph-model';

export class GraphToYamlConverter {
  /**
   * Convert a WorkflowGraph to YAML string
   */
  convert(graph: WorkflowGraph): string {
    // Build workflow object
    const workflow: Record<string, unknown> = {
      document: this.buildDocument(graph),
    };

    // Build task list from graph topology
    const tasks = this.buildTaskList(graph);
    if (tasks.length > 0) {
      workflow.do = tasks;
    }

    // Serialize to YAML
    return yaml.dump(workflow, {
      indent: 2,
      lineWidth: 120,
      noRefs: true,
      sortKeys: false,
      quotingType: '"',
      forceQuotes: false,
    });
  }

  /**
   * Build document section from metadata
   */
  private buildDocument(graph: WorkflowGraph): Record<string, unknown> {
    const doc: Record<string, unknown> = {
      dsl: graph.metadata.dsl,
      namespace: graph.metadata.namespace,
      name: graph.metadata.name,
      version: graph.metadata.version,
    };

    // Add optional fields if present
    if (graph.metadata.title) {
      doc.title = graph.metadata.title;
    }
    if (graph.metadata.summary) {
      doc.summary = graph.metadata.summary;
    }
    if (graph.metadata.tags) {
      doc.tags = graph.metadata.tags;
    }
    if (graph.metadata.metadata) {
      doc.metadata = graph.metadata.metadata;
    }

    return doc;
  }

  /**
   * Build task list from graph nodes in topological order
   */
  private buildTaskList(graph: WorkflowGraph): Record<string, unknown>[] {
    const tasks: Record<string, unknown>[] = [];
    const visited = new Set<NodeId>();

    // Find entry nodes (no incoming edges)
    const entryNodes = getEntryNodes(graph);

    // Traverse graph in topological order
    for (const entryNode of entryNodes) {
      this.traverseNode(entryNode.id, graph, tasks, visited);
    }

    return tasks;
  }

  /**
   * Traverse a node and its descendants, adding tasks in order
   */
  private traverseNode(
    nodeId: NodeId,
    graph: WorkflowGraph,
    tasks: Record<string, unknown>[],
    visited: Set<NodeId>
  ): void {
    // Skip if already visited
    if (visited.has(nodeId)) {
      return;
    }

    visited.add(nodeId);

    // Find the node
    const node = graph.nodes.find((n) => n.id === nodeId);
    if (!node) {
      return;
    }

    // Convert node to task config
    const taskConfig = this.nodeToTaskConfig(node);

    // Add task to list (task name is the label)
    tasks.push({
      [node.label]: taskConfig,
    });

    // Traverse outgoing edges
    const outgoing = getOutgoingEdges(graph, nodeId);
    for (const edge of outgoing) {
      this.traverseNode(edge.target, graph, tasks, visited);
    }
  }

  /**
   * Convert a node to its task configuration
   */
  private nodeToTaskConfig(node: BaseNode): Record<string, unknown> {
    // Copy all data except the 'type' field
    const config: Record<string, unknown> = {};

    // Copy all properties from node.data except 'type'
    for (const [key, value] of Object.entries(node.data)) {
      if (key !== 'type') {
        config[key] = value;
      }
    }

    return config;
  }

  /**
   * Convert graph to YAML and save to file (for testing/development)
   */
  async convertToFile(): Promise<void> {
    // This would be used in Node.js environment for testing
    // In browser, use convert() and trigger download
    throw new Error(
      'File saving not implemented - use convert() to get string'
    );
  }
}
