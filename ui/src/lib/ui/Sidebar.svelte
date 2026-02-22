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
  import type { WorkflowFile } from '$lib/tasks/model';
  import { TASK_REGISTRY } from '$lib/tasks/registry';

  // ---------------------------------------------------------------------------
  // Props & events
  // ---------------------------------------------------------------------------

  interface Props {
    file: WorkflowFile;
    selectedWorkflowId: string;
    onworkflowselect?: (id: string) => void;
    onaddworkflow?: () => void;
  }

  let { file, selectedWorkflowId, onworkflowselect, onaddworkflow }: Props =
    $props();

  // ---------------------------------------------------------------------------
  // Palette — split registry into two groups
  // ---------------------------------------------------------------------------

  const taskItems = TASK_REGISTRY.filter((d) => d.category === 'task');
  const controlItems = TASK_REGISTRY.filter((d) => d.category === 'control');

  function handleDragStart(event: DragEvent, nodeType: string) {
    event.dataTransfer?.setData('application/node-type', nodeType);
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'copy';
  }
</script>

<nav class="sidebar">
  <!-- Document metadata -->
  <header class="sidebar-header">
    <p class="sidebar-label">Document</p>
    <h1 class="sidebar-doc-name">{file.document.name}</h1>
    <p class="sidebar-doc-meta">
      {file.document.namespace} · v{file.document.version}
    </p>
  </header>

  <!-- Workflow list -->
  <section class="sidebar-section">
    <p class="sidebar-label">Workflows</p>
    <ul class="workflow-list">
      {#each file.order as id (id)}
        {@const wf = file.workflows[id]}
        {#if wf}
          <li>
            <button
              class="workflow-item"
              class:workflow-item--selected={id === selectedWorkflowId}
              onclick={() => onworkflowselect?.(id)}
              type="button"
            >
              {wf.name}
            </button>
          </li>
        {/if}
      {/each}
    </ul>

    <button
      class="add-workflow-btn"
      onclick={() => onaddworkflow?.()}
      type="button"
    >
      + Add workflow
    </button>
  </section>

  <!-- Task palette -->
  <section class="sidebar-section palette-section">
    <p class="sidebar-label">Tasks</p>
    <ul class="palette-list">
      {#each taskItems as def (def.type)}
        <li>
          <div
            class="palette-item"
            draggable="true"
            role="button"
            tabindex="0"
            title={def.description}
            ondragstart={(e) => handleDragStart(e, def.type)}
          >
            {def.label}
          </div>
        </li>
      {/each}
    </ul>

    <p class="sidebar-label palette-label-gap">Control flow</p>
    <ul class="palette-list">
      {#each controlItems as def (def.type)}
        <li>
          <div
            class="palette-item palette-item--control"
            draggable="true"
            role="button"
            tabindex="0"
            title={def.description}
            ondragstart={(e) => handleDragStart(e, def.type)}
          >
            {def.label}
          </div>
        </li>
      {/each}
    </ul>
  </section>
</nav>

<style>
  .sidebar {
    width: 220px;
    min-width: 220px;
    border-right: 1px solid #ddd;
    background: #fafafa;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }

  .sidebar-header {
    padding: 1rem;
    border-bottom: 1px solid #eee;
  }

  .sidebar-label {
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #999;
    margin: 0 0 0.25rem 0;
  }

  .sidebar-doc-name {
    font-size: 0.95rem;
    font-weight: 600;
    margin: 0 0 0.125rem 0;
    word-break: break-all;
  }

  .sidebar-doc-meta {
    font-size: 0.75rem;
    color: #888;
    margin: 0;
  }

  .sidebar-section {
    padding: 1rem;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .palette-section {
    flex: none;
    border-top: 1px solid #eee;
  }

  .palette-label-gap {
    margin-top: 0.5rem;
  }

  .workflow-list,
  .palette-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .workflow-item {
    display: block;
    width: 100%;
    text-align: left;
    padding: 0.375rem 0.625rem;
    border: 1px solid transparent;
    border-radius: 6px;
    background: transparent;
    font-size: 0.875rem;
    cursor: pointer;
    color: #333;
    transition: background 0.1s;
  }

  .workflow-item:hover {
    background: #efefef;
  }

  .workflow-item--selected {
    background: #e8f0fe;
    border-color: #c5d8ff;
    color: #1a56cc;
    font-weight: 500;
  }

  .add-workflow-btn {
    margin-top: auto;
    padding: 0.375rem 0.75rem;
    border: 1px dashed #ccc;
    border-radius: 6px;
    background: transparent;
    font-size: 0.8rem;
    color: #666;
    cursor: pointer;
    text-align: left;
    transition:
      border-color 0.1s,
      color 0.1s;
  }

  .add-workflow-btn:hover {
    border-color: #999;
    color: #333;
  }

  .palette-item {
    padding: 0.3rem 0.625rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    background: #fff;
    font-size: 0.8rem;
    color: #444;
    cursor: grab;
    user-select: none;
    transition:
      border-color 0.1s,
      background 0.1s;
  }

  .palette-item:hover {
    border-color: #aaa;
    background: #f5f5f5;
  }

  .palette-item:active {
    cursor: grabbing;
  }

  .palette-item--control {
    border-color: #c5d8ff;
    color: #1a56cc;
    background: #f0f5ff;
  }

  .palette-item--control:hover {
    border-color: #7eaaff;
    background: #e8f0fe;
  }
</style>
