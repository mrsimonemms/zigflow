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

// YAML to Graph converter - parses Serverless Workflow DSL to graph IR

import yaml from 'js-yaml';
import { v4 as uuidv4 } from 'uuid';
import type {
  WorkflowGraph,
  BaseNode,
  FlowEdge,
  TaskType,
  TaskData,
  TaskListItem,
  Position,
} from '../graph/types';

interface ParseContext {
  nodes: BaseNode[];
  edges: FlowEdge[];
  nodeCounter: number;
}

export class YamlToGraphConverter {
  /**
   * Convert a YAML workflow string to a WorkflowGraph
   */
  convert(yamlString: string): WorkflowGraph {
    // Parse YAML
    const parsed = yaml.load(yamlString) as Record<string, unknown>;

    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Invalid YAML: expected object');
    }

    // Extract metadata from document section
    const metadata = this.extractMetadata(parsed);

    // Initialize parsing context
    const context: ParseContext = {
      nodes: [],
      edges: [],
      nodeCounter: 0,
    };

    // Parse top-level 'do' tasks
    if (parsed.do && Array.isArray(parsed.do)) {
      this.parseTaskList(parsed.do, context, null);
    }

    return {
      nodes: context.nodes,
      edges: context.edges,
      metadata,
    };
  }

  /**
   * Extract workflow metadata from document section
   */
  private extractMetadata(parsed: Record<string, unknown>) {
    if (!parsed.document) {
      throw new Error('Invalid workflow: missing document section');
    }

    const doc = parsed.document as Record<string, unknown>;

    // Validate required fields
    if (!doc.dsl || !doc.namespace || !doc.name || !doc.version) {
      throw new Error(
        'Invalid workflow: document must have dsl, namespace, name, and version'
      );
    }

    return {
      dsl: doc.dsl as string,
      namespace: doc.namespace as string,
      name: doc.name as string,
      version: doc.version as string,
      title: doc.title as string | undefined,
      summary: doc.summary as string | undefined,
      tags: doc.tags as Record<string, string> | undefined,
      metadata: doc.metadata as Record<string, unknown> | undefined,
    };
  }

  /**
   * Parse a task list (array of task items)
   * Returns the ID of the last node in the sequence
   */
  private parseTaskList(
    tasks: TaskListItem[],
    context: ParseContext,
    parentId: string | null
  ): string | null {
    let previousId = parentId;

    for (const taskItem of tasks) {
      // Task item is an object with a single key (task name)
      const taskName = Object.keys(taskItem)[0];
      const taskConfig = taskItem[taskName];

      // Detect task type and create node
      const taskType = this.detectTaskType(taskConfig);
      const nodeId = this.createNode(taskName, taskType, taskConfig, context);

      // Connect to previous task if exists
      if (previousId) {
        this.createEdge(previousId, nodeId, context);
      }

      // Handle nested task structures
      this.parseNestedTasks(nodeId, taskType, taskConfig, context);

      previousId = nodeId;
    }

    return previousId;
  }

  /**
   * Detect the task type from task configuration
   */
  private detectTaskType(taskConfig: Record<string, unknown>): TaskType {
    if (taskConfig.call !== undefined) return 'call';
    if (taskConfig.do !== undefined) return 'do';
    if (taskConfig.fork !== undefined) return 'fork';
    if (taskConfig.emit !== undefined) return 'emit';
    if (taskConfig.for !== undefined) return 'for';
    if (taskConfig.listen !== undefined) return 'listen';
    if (taskConfig.raise !== undefined) return 'raise';
    if (taskConfig.run !== undefined) return 'run';
    if (taskConfig.set !== undefined) return 'set';
    if (taskConfig.switch !== undefined) return 'switch';
    if (taskConfig.try !== undefined) return 'try';
    if (taskConfig.wait !== undefined) return 'wait';

    throw new Error(
      `Unknown task type in config: ${JSON.stringify(Object.keys(taskConfig))}`
    );
  }

  /**
   * Create a node and add it to the context
   */
  private createNode(
    label: string,
    type: TaskType,
    config: Record<string, unknown>,
    context: ParseContext
  ): string {
    const nodeId = uuidv4();
    const position = this.calculatePosition(context.nodeCounter++);

    const node: BaseNode = {
      id: nodeId,
      type,
      label,
      position,
      data: this.convertTaskData(type, config),
    };

    context.nodes.push(node);
    return nodeId;
  }

  /**
   * Create an edge and add it to the context
   */
  private createEdge(
    source: string,
    target: string,
    context: ParseContext,
    label?: string
  ): void {
    const edge: FlowEdge = {
      id: uuidv4(),
      source,
      target,
      label,
      type: 'default',
    };

    context.edges.push(edge);
  }

  /**
   * Convert task configuration to typed TaskData
   */
  private convertTaskData(
    type: TaskType,
    config: Record<string, unknown>
  ): TaskData {
    // Create base data with type
    const data: Record<string, unknown> = { type };

    // Copy all task-specific fields
    // This preserves the full task configuration from the YAML
    Object.assign(data, config);

    return data as unknown as TaskData;
  }

  /**
   * Parse nested task structures (do, fork, try, for)
   */
  private parseNestedTasks(
    parentId: string,
    type: TaskType,
    config: Record<string, unknown>,
    context: ParseContext
  ): void {
    switch (type) {
      case 'do':
        // Sequential tasks
        if (config.do && Array.isArray(config.do)) {
          this.parseTaskList(config.do, context, parentId);
        }
        break;

      case 'fork':
        // Parallel branches
        if (
          config.fork &&
          typeof config.fork === 'object' &&
          'branches' in config.fork &&
          Array.isArray((config.fork as Record<string, unknown>).branches)
        ) {
          for (const branch of (config.fork as Record<string, unknown>)
            .branches as TaskListItem[]) {
            // Each branch starts from the fork node
            this.parseTaskList([branch], context, parentId);
          }
        }
        break;

      case 'try':
        // Try block tasks
        if (config.try && Array.isArray(config.try)) {
          const lastTryNode = this.parseTaskList(config.try, context, parentId);

          // Catch block tasks (error path)
          if (
            config.catch &&
            typeof config.catch === 'object' &&
            'do' in config.catch &&
            Array.isArray((config.catch as Record<string, unknown>).do)
          ) {
            // Error edge from last try node to catch block
            const firstCatchNode = this.parseTaskList(
              (config.catch as Record<string, unknown>).do as TaskListItem[],
              context,
              null
            );
            if (lastTryNode && firstCatchNode) {
              this.createEdge(lastTryNode, firstCatchNode, context, 'error');
            }
          }
        }
        break;

      case 'for':
        // Loop body
        if (config.do && Array.isArray(config.do)) {
          const lastLoopNode = this.parseTaskList(config.do, context, parentId);

          // Create back-edge for loop (optional - for visualization)
          if (lastLoopNode) {
            // Could add a loop-back edge here if desired
            // this.createEdge(lastLoopNode, parentId, context, 'loop');
          }
        }
        break;

      case 'switch':
        // Conditional branches
        if (config.switch && Array.isArray(config.switch)) {
          // TODO: Implement switch case parsing with 'then' directives
          // Each case can have a 'then' directive that points to other tasks
        }
        break;

      // Other task types don't have nested structures
      default:
        break;
    }
  }

  /**
   * Calculate position for a node based on its index
   */
  private calculatePosition(index: number): Position {
    // Simple vertical layout
    // TODO: Implement smarter layout algorithms (Dagre, ELK)
    return {
      x: 250,
      y: index * 120 + 50,
    };
  }

  /**
   * Parse workflow from file path (for testing/development)
   * Not implemented - use convert() with string instead
   */
  async convertFromFile(): Promise<WorkflowGraph> {
    // This would be used in Node.js environment for testing
    // In browser, use fetch or file input
    throw new Error('File parsing not implemented - use convert() with string');
  }
}
