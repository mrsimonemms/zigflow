<!--
  ~ Copyright 2025 - 2026 Zigflow authors <https://github.com/mrsimonemms/zigflow/graphs/contributors>
  ~
  ~ Licensed under the Apache License, Version 2.0 (the "License");
  ~ you may not use this file except in compliance with the License.
  ~ You may obtain a copy of the License at
  ~
  ~     http://www.apache.org/licenses/LICENSE-2.0
  ~
  ~ Unless required by applicable law or agreed to in writing, software
  ~ distributed under the License is distributed on an "AS IS" BASIS,
  ~ WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  ~ See the License for the specific language governing permissions and
  ~ limitations under the License.
-->

<script lang="ts">
  /*
   * Copyright 2025 - 2026 Zigflow authors
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

  import { Handle, Position } from '@xyflow/svelte';
  import type { TaskType } from '$lib/core/graph/types';
  import { NODE_TYPE_DEFINITIONS } from '$lib/core/graph/node-definitions';
  import type { Snippet } from 'svelte';

  // Props
  let {
    type,
    label,
    selected = false,
    children,
  }: {
    type: TaskType;
    label: string;
    selected?: boolean;
    children?: Snippet;
  } = $props();

  // Get node definition
  const nodeDef = $derived(NODE_TYPE_DEFINITIONS[type]);
</script>

<div class="task-node" class:selected style="border-color: {nodeDef.color}">
  <!-- Input handle (top) -->
  {#if nodeDef.maxIncoming !== 0}
    <Handle type="target" position={Position.Top} />
  {/if}

  <!-- Node header -->
  <div class="task-node-header" style="background-color: {nodeDef.color}">
    <span class="task-node-icon">{nodeDef.icon}</span>
    <span class="task-node-type">{nodeDef.label}</span>
  </div>

  <!-- Node body -->
  <div class="task-node-body">
    <div class="task-node-label">{label}</div>
    {#if children}
      {@render children()}
    {/if}
  </div>

  <!-- Output handle (bottom) -->
  {#if nodeDef.maxOutgoing !== 0}
    <Handle type="source" position={Position.Bottom} />
  {/if}
</div>

<style lang="scss">
  .task-node {
    min-width: 180px;
    background: var(--bulma-scheme-main);
    border: 2px solid var(--bulma-border);
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    &.selected {
      border-width: 3px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    }
  }

  .task-node-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 6px 6px 0 0;
    color: white;
    font-weight: 600;
    font-size: 0.875rem;
  }

  .task-node-icon {
    font-size: 1.2rem;
    line-height: 1;
  }

  .task-node-type {
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .task-node-body {
    padding: 12px;
  }

  .task-node-label {
    font-weight: 600;
    font-size: 0.95rem;
    margin-bottom: 8px;
    color: var(--bulma-text-strong);
  }

  /* Handle styles */
  :global(.svelte-flow__handle) {
    width: 10px;
    height: 10px;
    background-color: var(--bulma-link);
    border: 2px solid var(--bulma-scheme-main);

    &:hover {
      background-color: var(--bulma-link-dark);
    }
  }
</style>
