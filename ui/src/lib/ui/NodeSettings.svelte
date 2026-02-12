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
  import type { Node } from '@xyflow/svelte';
  import {
    SetTask,
    WaitTask,
    CallHttpTask,
    CallGrpcTask,
    CallActivityTask,
    DoTask,
    ForTask,
    ForkTask,
    SwitchTask,
    TryTask,
    ListenTask,
    EmitTask,
    RaiseTask,
    RunTask,
    type Task,
  } from '$lib/tasks';
  import type { TaskState } from '$lib/tasks/task';

  let { node, onClose }: { node: Node; onClose: () => void } = $props();

  // Map task types to task classes
  const taskTypeMap: Record<string, Task> = {
    set: new SetTask(),
    wait: new WaitTask(),
    'call-http': new CallHttpTask(),
    'call-grpc': new CallGrpcTask(),
    'call-activity': new CallActivityTask(),
    do: new DoTask(),
    for: new ForTask(),
    fork: new ForkTask(),
    switch: new SwitchTask(),
    try: new TryTask(),
    listen: new ListenTask(),
    emit: new EmitTask(),
    raise: new RaiseTask(),
    run: new RunTask(),
  };

  // Ensure node.data exists and initialize with defaults if needed
  $effect(() => {
    if (!node.data) {
      node.data = {};
    }
    if (!node.data.taskType) {
      node.data.taskType = 'set';
    }
    if (!node.data.name) {
      const type = (node.data.taskType as string) || 'set';
      node.data.name = `${type}-task`;
    }
    if (!node.data.state) {
      const type = (node.data.taskType as string) || 'set';
      const taskInstance = taskTypeMap[type];
      node.data.state = taskInstance?.getDefaultData() || {};
    }
  });

  // Get the task instance for this node (derived from node data)
  const taskType = $derived((node.data?.taskType as string) || 'set');
  const task = $derived(taskTypeMap[taskType]);

  // Read directly from node.data (reactive via $derived)
  const taskName = $derived((node.data?.name as string) || `${taskType}-task`);
  const taskState = $derived(
    (node.data?.state as TaskState) || task?.getDefaultData() || {},
  );

  // Extract specific and common data for display
  const specificData = $derived.by(() => {
    const { metadata, export: exp, output, ...specific } = taskState;
    return specific;
  });

  const commonData = $derived.by(() => ({
    metadata: taskState.metadata || {},
    export: taskState.export || {},
    output: taskState.output || {},
  }));

  // Helper to format JSON for textarea
  function toJSON(obj: unknown): string {
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return '{}';
    }
  }

  // Local text state for each textarea
  let specificDataText = $state('{}');
  let metadataText = $state('{}');
  let exportText = $state('{}');
  let outputText = $state('{}');

  // Sync local text with node data when it changes externally
  $effect(() => {
    specificDataText = toJSON(specificData);
    metadataText = toJSON(commonData.metadata);
    exportText = toJSON(commonData.export);
    outputText = toJSON(commonData.output);
  });

  // Update handlers - directly update node.data
  function updateTaskName(value: string) {
    if (node.data) {
      node.data.name = value;
    }
  }

  function updateSpecificData(text: string) {
    specificDataText = text;
    try {
      const parsed = JSON.parse(text) as Record<string, unknown>;
      const common = commonData;
      if (node.data) {
        node.data.state = { ...common, ...parsed };
      }
    } catch {
      // Invalid JSON - don't update state, just keep the text
    }
  }

  function updateMetadata(text: string) {
    metadataText = text;
    try {
      const parsed = JSON.parse(text) as Record<string, unknown>;
      if (node.data && node.data.state) {
        node.data.state = { ...node.data.state, metadata: parsed };
      }
    } catch {
      // Invalid JSON - don't update state, just keep the text
    }
  }

  function updateExport(text: string) {
    exportText = text;
    try {
      const parsed = JSON.parse(text) as Record<string, unknown>;
      if (node.data && node.data.state) {
        node.data.state = { ...node.data.state, export: parsed };
      }
    } catch {
      // Invalid JSON - don't update state, just keep the text
    }
  }

  function updateOutput(text: string) {
    outputText = text;
    try {
      const parsed = JSON.parse(text) as Record<string, unknown>;
      if (node.data && node.data.state) {
        node.data.state = { ...node.data.state, output: parsed };
      }
    } catch {
      // Invalid JSON - don't update state, just keep the text
    }
  }
</script>

<aside class="node-settings">
  <div class="settings-header">
    <div class="header-content">
      <h2>Task Settings</h2>
      <p class="subtitle">{task?.label || 'Configure task'}</p>
    </div>
    <button
      class="close-button"
      onclick={onClose}
      aria-label="Close settings panel"
    >
      ×
    </button>
  </div>

  <div class="settings-content">
    <!-- 1. Task Name (Top) -->
    <div class="setting-group">
      <label class="setting-label" for="task-name">Task Name</label>
      <input
        id="task-name"
        class="setting-input"
        type="text"
        value={taskName}
        oninput={(e) => updateTaskName(e.currentTarget.value)}
        placeholder="Enter task name"
      />
      <span class="help-text"
        >Step name in the workflow (e.g., "step1", "getData")</span
      >
    </div>

    <!-- 2. Task-Specific Data (Middle) -->
    {#if task}
      <div class="setting-section">
        <h3 class="section-title">{task.label} Configuration</h3>

        <div class="setting-group">
          <label class="setting-label" for="task-specific"
            >Task Data (JSON)</label
          >
          <textarea
            id="task-specific"
            class="setting-textarea"
            value={specificDataText}
            oninput={(e) => updateSpecificData(e.currentTarget.value)}
            placeholder={toJSON(task.getDefaultSpecificData())}
            rows="8"
          ></textarea>
          <span class="help-text">Task-specific configuration</span>
        </div>
      </div>
    {/if}

    <!-- 3. Common Properties (Bottom) -->
    <div class="setting-section">
      <h3 class="section-title">Common Properties</h3>

      <div class="setting-group">
        <label class="setting-label" for="metadata">Metadata (JSON)</label>
        <textarea
          id="metadata"
          class="setting-textarea"
          value={metadataText}
          oninput={(e) => updateMetadata(e.currentTarget.value)}
          placeholder="{JSON.stringify({ description: '...' })}"
          rows="4"
        ></textarea>
        <span class="help-text">Arbitrary metadata for the task</span>
      </div>

      <div class="setting-group">
        <label class="setting-label" for="export">Export (JSON)</label>
        <textarea
          id="export"
          class="setting-textarea"
          value={exportText}
          oninput={(e) => updateExport(e.currentTarget.value)}
          placeholder="{JSON.stringify({ as: { result: '.' } })}"
          rows="4"
        ></textarea>
        <span class="help-text"
          >Export data from the task as context variables</span
        >
      </div>

      <div class="setting-group">
        <label class="setting-label" for="output">Output (JSON)</label>
        <textarea
          id="output"
          class="setting-textarea"
          value={outputText}
          oninput={(e) => updateOutput(e.currentTarget.value)}
          placeholder="{JSON.stringify({ as: '${ . }' })}"
          rows="4"
        ></textarea>
        <span class="help-text">Output transformation expression</span>
      </div>
    </div>
  </div>
</aside>

<style lang="scss">
  @use '../../styles/tokens' as *;

  .node-settings {
    width: 380px;
    height: 100%;
    background-color: $color-bg;
    border-left: 1px solid $color-border;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .settings-header {
    padding: $spacing-lg;
    border-bottom: 1px solid $color-border;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: $spacing-md;
    flex-shrink: 0;

    .header-content {
      flex: 1;
      min-width: 0;
    }

    h2 {
      margin: 0 0 $spacing-xs 0;
      font-size: $font-size-lg;
      font-weight: $font-weight-bold;
    }

    .subtitle {
      margin: 0;
      font-size: $font-size-sm;
      color: $color-text-muted;
    }
  }

  .close-button {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: 1px solid $color-border;
    border-radius: $radius-sm;
    color: $color-text-muted;
    font-size: $font-size-2xl;
    line-height: 1;
    cursor: pointer;
    transition:
      background-color $transition-fast,
      border-color $transition-fast,
      color $transition-fast;

    &:hover {
      background-color: $color-bg-alt;
      border-color: $color-danger;
      color: $color-danger;
    }

    &:active {
      background-color: $color-danger;
      border-color: $color-danger;
      color: $color-bg;
    }
  }

  .settings-content {
    flex: 1;
    overflow-y: auto;
    padding: $spacing-lg;
    display: flex;
    flex-direction: column;
    gap: $spacing-xl;
  }

  .setting-group {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
  }

  .setting-section {
    padding-top: $spacing-lg;
    border-top: 1px solid $color-border;

    &:first-child {
      padding-top: 0;
      border-top: none;
    }
  }

  .section-title {
    margin: 0 0 $spacing-md 0;
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    color: $color-text;
  }

  .setting-label {
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $color-text-muted;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .setting-input {
    padding: $spacing-sm $spacing-md;
    background-color: $color-bg;
    border: 1px solid $color-border;
    border-radius: $radius-sm;
    font-size: $font-size-base;
    font-family: $font-family-base;
    color: $color-text;
    transition: border-color $transition-fast;

    &:focus {
      outline: none;
      border-color: $color-primary;
    }

    &::placeholder {
      color: $color-text-muted;
    }
  }

  .setting-textarea {
    padding: $spacing-sm $spacing-md;
    background-color: $color-bg;
    border: 1px solid $color-border;
    border-radius: $radius-sm;
    font-size: $font-size-sm;
    font-family: $font-family-mono;
    color: $color-text;
    resize: vertical;
    min-height: 80px;
    transition: border-color $transition-fast;

    &:focus {
      outline: none;
      border-color: $color-primary;
    }

    &::placeholder {
      color: $color-text-muted;
    }
  }

  .help-text {
    font-size: $font-size-xs;
    color: $color-text-muted;
    font-style: italic;
  }
</style>
