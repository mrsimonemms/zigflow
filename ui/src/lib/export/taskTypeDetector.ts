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
 * Task Type Detection for Zigflow Tasks
 *
 * Maps Serverless Workflow task configurations to Zigflow task types
 * for proper visualization in SvelteFlow
 */

// Task type detection maps
const TASK_TYPE_MAP = new Map([
  ['set', 'set'],
  ['wait', 'wait'],
  ['fork', 'fork'],
  ['do', 'do'],
  ['switch', 'switch'],
  ['try', 'try'],
  ['for', 'for'],
  ['listen', 'listen'],
  ['raise', 'raise'],
  ['emit', 'emit'],
  ['run', 'run'],
]);

const CALL_TYPE_MAP = new Map([
  ['http', 'call-http'],
  ['grpc', 'call-grpc'],
  ['asyncapi', 'call-activity'],
  ['openapi', 'call-http'],
]);

/**
 * Extracts task configuration from a workflow do item
 * Each do item is an object with a single key (the step name)
 */
function extractTaskConfig(
  doItem: Record<string, unknown>,
): { stepName: string; config: Record<string, unknown> } | null {
  const keys = Object.keys(doItem);
  if (keys.length === 0) return null;

  const stepName = keys[0];
  const config = doItem[stepName] as Record<string, unknown>;

  return { stepName, config };
}

/**
 * Detects the Zigflow task type from a workflow task configuration
 */
export function detectTaskType(taskConfig: Record<string, unknown>): string {
  // Check for call task with subtype
  if (taskConfig.call && typeof taskConfig.call === 'string') {
    return CALL_TYPE_MAP.get(taskConfig.call) || 'call';
  }

  // Check for other task types
  for (const [key, type] of TASK_TYPE_MAP) {
    if (key in taskConfig) {
      return type;
    }
  }

  return 'default';
}

/**
 * Detects task type from a workflow graph node
 * The node may have metadata that indicates its task type
 */
export function detectTaskTypeFromNode(node: Record<string, unknown>): string {
  // Check if the node has a taskType property
  const taskType = node.taskType as string | undefined;
  if (taskType) {
    return taskType;
  }

  // Check if the node has data with taskConfig
  const data = node.data as Record<string, unknown> | undefined;
  if (data?.taskConfig) {
    return detectTaskType(data.taskConfig as Record<string, unknown>);
  }

  // Try to infer from node label or id
  const label = (node.label as string | undefined)?.toLowerCase();
  const id = (node.id as string | undefined)?.toLowerCase();

  // Check label/id for task type keywords
  const searchText = `${label || ''} ${id || ''}`;

  for (const [key, type] of TASK_TYPE_MAP) {
    if (searchText.includes(key)) {
      return type;
    }
  }

  for (const [key, type] of CALL_TYPE_MAP) {
    if (searchText.includes(key)) {
      return type;
    }
  }

  // Default to 'default' type
  return 'default';
}

/**
 * Parses a workflow 'do' array and returns task information
 */
export function parseWorkflowTasks(
  doArray: Array<Record<string, unknown>>,
): Array<{
  stepName: string;
  taskType: string;
  config: Record<string, unknown>;
}> {
  return doArray
    .map((item) => {
      const extracted = extractTaskConfig(item);
      if (!extracted) return null;

      const { stepName, config } = extracted;
      const taskType = detectTaskType(config);

      return { stepName, taskType, config };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}
