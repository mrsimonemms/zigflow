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
import End from '$lib/components/nodes/end.svelte';
import Start from '$lib/components/nodes/start.svelte';
import Task from '$lib/components/nodes/task.svelte';
import { type Node, type NodeTypes } from '@xyflow/svelte';
import { v4 as uuidv4 } from 'uuid';

export const nodeTypes: NodeTypes = {
  end: End,
  start: Start,
  task: Task,
};

export function createNode(opts: Partial<Node>): Node {
  return {
    ...opts,
    data: opts.data ?? {},
    position: opts.position ?? { x: 0, y: 0 },
    id: uuidv4(),
    draggable: opts.draggable ?? false,
    deletable: opts.deletable ?? false,
    connectable: opts.connectable ?? false,
  };
}
