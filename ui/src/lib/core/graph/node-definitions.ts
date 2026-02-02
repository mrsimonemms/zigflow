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

// Node type definitions with visual and structural constraints

import type { TaskType } from './types';

export interface NodeTypeDefinition {
  type: TaskType;
  label: string;
  description: string;
  color: string; // Primary color for this node type
  icon: string; // Icon identifier (using a simple text-based icon system)
  maxIncoming: number | 'unlimited';
  maxOutgoing: number | 'unlimited';
  requiredFields: string[];
  hasBody: boolean; // Does it contain nested tasks?
  category: 'control' | 'action' | 'data' | 'event' | 'error';
}

export const NODE_TYPE_DEFINITIONS: Record<TaskType, NodeTypeDefinition> = {
  call: {
    type: 'call',
    label: 'Call',
    description: 'Call external APIs, services, or functions',
    color: '#3298dc',
    icon: '📞',
    maxIncoming: 'unlimited',
    maxOutgoing: 1,
    requiredFields: ['call'],
    hasBody: false,
    category: 'action',
  },

  do: {
    type: 'do',
    label: 'Do',
    description: 'Execute a list of tasks sequentially',
    color: '#48c774',
    icon: '▶',
    maxIncoming: 'unlimited',
    maxOutgoing: 1,
    requiredFields: ['do'],
    hasBody: true,
    category: 'control',
  },

  fork: {
    type: 'fork',
    label: 'Fork',
    description: 'Execute multiple tasks concurrently',
    color: '#ffdd57',
    icon: '⑂',
    maxIncoming: 'unlimited',
    maxOutgoing: 'unlimited',
    requiredFields: ['fork', 'branches'],
    hasBody: true,
    category: 'control',
  },

  emit: {
    type: 'emit',
    label: 'Emit',
    description: 'Publish events to event brokers',
    color: '#f14668',
    icon: '📤',
    maxIncoming: 'unlimited',
    maxOutgoing: 1,
    requiredFields: ['emit'],
    hasBody: false,
    category: 'event',
  },

  for: {
    type: 'for',
    label: 'For',
    description: 'Iterate over a collection of items',
    color: '#00d1b2',
    icon: '🔁',
    maxIncoming: 'unlimited',
    maxOutgoing: 1,
    requiredFields: ['for', 'do'],
    hasBody: true,
    category: 'control',
  },

  listen: {
    type: 'listen',
    label: 'Listen',
    description: 'Listen for and consume external events',
    color: '#485fc7',
    icon: '👂',
    maxIncoming: 'unlimited',
    maxOutgoing: 1,
    requiredFields: ['listen'],
    hasBody: false,
    category: 'event',
  },

  raise: {
    type: 'raise',
    label: 'Raise',
    description: 'Raise and propagate errors',
    color: '#f14668',
    icon: '⚠',
    maxIncoming: 'unlimited',
    maxOutgoing: 1,
    requiredFields: ['raise'],
    hasBody: false,
    category: 'error',
  },

  run: {
    type: 'run',
    label: 'Run',
    description: 'Execute containers, scripts, shells, or workflows',
    color: '#3e8ed0',
    icon: '⚙',
    maxIncoming: 'unlimited',
    maxOutgoing: 1,
    requiredFields: ['run'],
    hasBody: false,
    category: 'action',
  },

  set: {
    type: 'set',
    label: 'Set',
    description: 'Set workflow state variables',
    color: '#48c774',
    icon: '=',
    maxIncoming: 'unlimited',
    maxOutgoing: 1,
    requiredFields: ['set'],
    hasBody: false,
    category: 'data',
  },

  switch: {
    type: 'switch',
    label: 'Switch',
    description: 'Conditional branching based on expressions',
    color: '#ffdd57',
    icon: '◇',
    maxIncoming: 'unlimited',
    maxOutgoing: 'unlimited',
    requiredFields: ['switch'],
    hasBody: false,
    category: 'control',
  },

  try: {
    type: 'try',
    label: 'Try',
    description: 'Execute tasks with error handling and retries',
    color: '#ff9f43',
    icon: '🛡',
    maxIncoming: 'unlimited',
    maxOutgoing: 2, // Normal flow + error flow
    requiredFields: ['try', 'catch'],
    hasBody: true,
    category: 'error',
  },

  wait: {
    type: 'wait',
    label: 'Wait',
    description: 'Pause workflow execution for a specified duration',
    color: '#b5b5b5',
    icon: '⏱',
    maxIncoming: 'unlimited',
    maxOutgoing: 1,
    requiredFields: ['wait'],
    hasBody: false,
    category: 'control',
  },
};

// Helper to get node definition by type
export function getNodeDefinition(type: TaskType): NodeTypeDefinition {
  return NODE_TYPE_DEFINITIONS[type];
}

// Helper to check if a node type can have nested tasks
export function hasNestedTasks(type: TaskType): boolean {
  return NODE_TYPE_DEFINITIONS[type].hasBody;
}

// Helper to get all node types by category
export function getNodeTypesByCategory(
  category: NodeTypeDefinition['category']
): TaskType[] {
  return Object.values(NODE_TYPE_DEFINITIONS)
    .filter((def) => def.category === category)
    .map((def) => def.type);
}

// Validation helper: check if edge connection is valid
export function canConnect(
  sourceType: TaskType,
  targetType: TaskType
): boolean {
  const sourceDef = NODE_TYPE_DEFINITIONS[sourceType];
  const targetDef = NODE_TYPE_DEFINITIONS[targetType];

  // Check if source can have outgoing edges
  if (
    typeof sourceDef.maxOutgoing === 'number' &&
    sourceDef.maxOutgoing === 0
  ) {
    return false;
  }

  // Check if target can have incoming edges
  if (
    typeof targetDef.maxIncoming === 'number' &&
    targetDef.maxIncoming === 0
  ) {
    return false;
  }

  return true;
}
