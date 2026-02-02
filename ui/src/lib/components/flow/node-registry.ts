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

// Node registry - maps task types to Svelte node components
// Used by Svelte Flow to render custom nodes

import type { TaskType } from '$lib/core/graph/types';

// Import all node components
import CallNode from './nodes/CallNode.svelte';
import DoNode from './nodes/DoNode.svelte';
import ForkNode from './nodes/ForkNode.svelte';
import EmitNode from './nodes/EmitNode.svelte';
import ForNode from './nodes/ForNode.svelte';
import ListenNode from './nodes/ListenNode.svelte';
import RaiseNode from './nodes/RaiseNode.svelte';
import RunNode from './nodes/RunNode.svelte';
import SetNode from './nodes/SetNode.svelte';
import SwitchNode from './nodes/SwitchNode.svelte';
import TryNode from './nodes/TryNode.svelte';
import WaitNode from './nodes/WaitNode.svelte';

/**
 * Node type registry for Svelte Flow
 * Maps TaskType to corresponding Svelte component
 */
export const nodeTypes = {
  call: CallNode,
  do: DoNode,
  fork: ForkNode,
  emit: EmitNode,
  for: ForNode,
  listen: ListenNode,
  raise: RaiseNode,
  run: RunNode,
  set: SetNode,
  switch: SwitchNode,
  try: TryNode,
  wait: WaitNode,
};

/**
 * Get the node component for a given task type
 */
export function getNodeComponent(type: TaskType) {
  const component = nodeTypes[type];
  if (!component) {
    throw new Error(`Unknown node type: ${type}`);
  }
  return component;
}
