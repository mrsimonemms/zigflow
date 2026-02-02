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
  import { workflowStore } from '$lib/stores/workflow-store';
  import type { BaseNode } from '$lib/core/graph/types';
  import { NODE_TYPE_DEFINITIONS } from '$lib/core/graph/node-definitions';
  import TextField from './fields/TextField.svelte';
  import CallPanel from './panels/CallPanel.svelte';
  import SetPanel from './panels/SetPanel.svelte';
  import WaitPanel from './panels/WaitPanel.svelte';

  let { selectedNodeId }: { selectedNodeId: string | null } = $props();

  // Get selected node from store
  const selectedNode = $derived(
    selectedNodeId
      ? $workflowStore.nodes.find((n) => n.id === selectedNodeId)
      : null
  );

  // Get node definition
  const nodeDef = $derived(
    selectedNode ? NODE_TYPE_DEFINITIONS[selectedNode.type] : null
  );

  // Handle label change
  function handleLabelChange(newLabel: string) {
    if (selectedNode) {
      workflowStore.updateNode(selectedNode.id, { label: newLabel });
    }
  }

  // Handle data update
  function handleDataUpdate(newData: Partial<BaseNode['data']>) {
    if (selectedNode) {
      workflowStore.updateNode(selectedNode.id, {
        data: { ...selectedNode.data, ...newData } as BaseNode['data'],
      });
    }
  }
</script>

<div class="inspector">
  {#if selectedNode && nodeDef}
    <div class="inspector-header" style="background-color: {nodeDef.color}">
      <span class="inspector-icon">{nodeDef.icon}</span>
      <span class="inspector-type">{nodeDef.label}</span>
    </div>

    <div class="inspector-body">
      <!-- Common properties -->
      <div class="section">
        <h3 class="title is-6">Basic Properties</h3>
        <TextField
          label="Task Name"
          bind:value={selectedNode.label}
          required
          placeholder="Enter task name"
          onchange={handleLabelChange}
        />
      </div>

      <!-- Task-specific configuration -->
      <div class="section">
        <h3 class="title is-6">Configuration</h3>
        {#if selectedNode.type === 'call'}
          <CallPanel node={selectedNode} onupdate={handleDataUpdate} />
        {:else if selectedNode.type === 'set'}
          <SetPanel node={selectedNode} onupdate={handleDataUpdate} />
        {:else if selectedNode.type === 'wait'}
          <WaitPanel node={selectedNode} onupdate={handleDataUpdate} />
        {:else}
          <div class="notification is-info is-light">
            <p>
              Configuration panel for <strong>{selectedNode.type}</strong> tasks is
              coming soon.
            </p>
          </div>
        {/if}
      </div>

      <!-- Node ID for reference -->
      <div class="section">
        <p class="help">
          <strong>Node ID:</strong>
          <code>{selectedNode.id.substring(0, 8)}...</code>
        </p>
      </div>
    </div>
  {:else}
    <div class="inspector-empty">
      <div class="empty-icon">📋</div>
      <p class="empty-message">Select a node to edit its properties</p>
    </div>
  {/if}
</div>

<style lang="scss">
  .inspector {
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: var(--bulma-scheme-main);
    border-left: 1px solid var(--bulma-border);
  }

  .inspector-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    color: white;
    font-weight: 600;
    border-bottom: 1px solid var(--bulma-border);
  }

  .inspector-icon {
    font-size: 1.5rem;
  }

  .inspector-type {
    font-size: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .inspector-body {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
  }

  .section {
    margin-bottom: 1.5rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--bulma-border);

    &:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }

    .title {
      margin-bottom: 1rem;
    }
  }

  .inspector-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 2rem;
    text-align: center;
  }

  .empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  .empty-message {
    color: var(--bulma-text-light);
    font-size: 1rem;
  }
</style>
