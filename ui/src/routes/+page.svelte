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
  import { onMount } from 'svelte';
  import FlowCanvas from '$lib/components/flow/FlowCanvas.svelte';
  import YamlEditor from '$lib/components/editor/YamlEditor.svelte';
  import Toolbar from '$lib/components/editor/Toolbar.svelte';
  import ValidationPanel from '$lib/components/editor/ValidationPanel.svelte';
  import Inspector from '$lib/components/inspector/Inspector.svelte';
  import Toast from '$lib/components/common/Toast.svelte';
  import { workflowStore, workflowYaml } from '$lib/stores/workflow-store';
  import { editorStore } from '$lib/stores/editor-store';
  import { validationStore } from '$lib/stores/validation-store';
  import { toastStore } from '$lib/stores/toast-store';
  import { getValidator } from '$lib/core/schema/validator';
  import { debounce } from '$lib/utils/debounce';
  import { throttle } from '$lib/utils/throttle';

  // Example workflow YAML
  const exampleYaml = `document:
  dsl: 1.0.0
  namespace: zigflow
  name: hello-world
  version: 0.0.1
  title: Hello World
  summary: A simple hello world workflow
do:
  - greet:
      set:
        message: Hello World
  - callApi:
      call: http
      with:
        method: get
        endpoint: https://api.example.com
  - wait:
      wait:
        seconds: 2
`;

  let selectedNodeId = $state<string | null>(null);
  let yamlContent = $state('');
  let validating = $state(false);
  let saving = $state(false);
  let loading = $state(false);
  let schemaLoaded = $state(false);
  let initializing = $state(true);
  let currentFilename = $state('workflow.yaml');

  // Load schema and example workflow on mount
  onMount(async () => {
    // Load schema
    try {
      const response = await fetch('/schema.yaml');
      const schemaYaml = await response.text();
      const validator = getValidator();
      await validator.loadSchema(schemaYaml);
      schemaLoaded = true;
    } catch (error) {
      console.error('Failed to load schema:', error);
      validationStore.setValidationResult('invalid', [
        {
          path: '',
          message: `Failed to load validation schema: ${error instanceof Error ? error.message : String(error)}`,
          severity: 'error',
        },
      ]);
      toastStore.error('Failed to load validation schema');
    }

    // Load example workflow
    workflowStore.loadFromYaml(exampleYaml);
    yamlContent = exampleYaml;

    // Mark initialization complete
    initializing = false;
  });

  // Add keyboard shortcuts using $effect
  $effect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

      // Ctrl/Cmd + S - Save
      if (ctrlKey && e.key === 's') {
        e.preventDefault();
        handleSave();
      }

      // Ctrl/Cmd + Z - Undo
      if (ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }

      // Ctrl/Cmd + Y or Ctrl/Cmd + Shift + Z - Redo
      if (
        (ctrlKey && e.key === 'y') ||
        (ctrlKey && e.shiftKey && e.key === 'z')
      ) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  });

  // Sync YAML content when workflow changes (only in visual mode)
  $effect(() => {
    if ($editorStore.viewMode === 'visual') {
      yamlContent = $workflowYaml;
    }
  });

  function handleNodeClick(event: CustomEvent) {
    selectedNodeId = event.detail.nodeId;
  }

  // Throttled position update to reduce re-renders during dragging
  const throttledPositionUpdate = throttle(
    (nodeId: string, position: { x: number; y: number }) => {
      workflowStore.updateNodePosition(nodeId, position);
    },
    100
  );

  function handleNodePositionChange(event: CustomEvent) {
    throttledPositionUpdate(event.detail.nodeId, event.detail.position);
  }

  function handleToggleView() {
    const newMode = $editorStore.viewMode === 'visual' ? 'yaml' : 'visual';
    editorStore.setViewMode(newMode);

    // When switching to YAML, update YAML content
    if (newMode === 'yaml') {
      yamlContent = $workflowYaml;
      editorStore.markSyncComplete();
    }
  }

  function handleSync() {
    if ($editorStore.viewMode === 'yaml') {
      // Sync YAML → Graph
      const result = workflowStore.loadFromYaml(yamlContent);
      if (result.success) {
        editorStore.markClean();
        editorStore.markSyncComplete();
        toastStore.success('Synced YAML to visual graph');
      } else {
        toastStore.error(`Failed to parse YAML: ${result.error}`);
      }
    } else {
      // Sync Graph → YAML
      yamlContent = $workflowYaml;
      editorStore.markSyncComplete();
      toastStore.success('Synced visual graph to YAML');
    }
  }

  // Debounced YAML change handler to reduce updates during typing
  const debouncedSetYamlContent = debounce((content: string) => {
    editorStore.setYamlContent(content);
  }, 300);

  function handleYamlChange(newValue: string) {
    yamlContent = newValue;
    debouncedSetYamlContent(newValue);
  }

  function handleUndo() {
    workflowStore.undo();
  }

  function handleRedo() {
    workflowStore.redo();
  }

  async function handleValidate() {
    if (!schemaLoaded) {
      toastStore.warning('Schema not loaded yet. Please wait...');
      return;
    }

    validating = true;

    try {
      const validator = getValidator();
      // Validate the current YAML content
      const yamlToValidate =
        $editorStore.viewMode === 'yaml' ? yamlContent : $workflowYaml;
      const result = validator.validate(yamlToValidate);

      validationStore.setValidationResult(result.status, result.errors);

      if (result.status === 'valid') {
        toastStore.success('Workflow validation passed');
      } else {
        toastStore.error(
          `Workflow validation failed with ${result.errors.length} error(s)`
        );
      }
    } catch (error) {
      validationStore.setValidationResult('invalid', [
        {
          path: '',
          message: `Validation error: ${error instanceof Error ? error.message : String(error)}`,
          severity: 'error',
        },
      ]);
      toastStore.error('Validation error occurred');
    } finally {
      validating = false;
    }
  }

  async function handleSave() {
    const filename = prompt('Enter filename:', currentFilename);
    if (!filename) return;

    saving = true;

    try {
      const yamlToSave =
        $editorStore.viewMode === 'yaml' ? yamlContent : $workflowYaml;

      const response = await fetch('/api/workflows/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename,
          content: yamlToSave,
          publish: false,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        currentFilename = filename;
        editorStore.markClean();
        toastStore.success(`Workflow saved successfully to ${result.filepath}`);
      } else {
        toastStore.error(`Failed to save workflow: ${result.error}`);
      }
    } catch (error) {
      toastStore.error(
        `Error saving workflow: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      saving = false;
    }
  }

  async function handleLoad() {
    const filename = prompt('Enter filename to load:', currentFilename);
    if (!filename) return;

    loading = true;

    try {
      const response = await fetch(
        `/api/workflows/load?filename=${encodeURIComponent(filename)}`
      );

      const result = await response.json();

      if (response.ok) {
        yamlContent = result.content;
        currentFilename = result.filename;
        workflowStore.loadFromYaml(result.content);
        editorStore.markClean();
        toastStore.success(
          `Workflow loaded successfully from ${result.source} directory`
        );
      } else {
        toastStore.error(`Failed to load workflow: ${result.error}`);
      }
    } catch (error) {
      toastStore.error(
        `Error loading workflow: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      loading = false;
    }
  }
</script>

<div class="editor-container">
  <div class="editor-header">
    <h1 class="title">Zigflow Visual Workflow Editor</h1>
    <p class="subtitle">Phase 12 - Testing & Documentation (Complete) ✓</p>
  </div>

  <!-- Toolbar -->
  <Toolbar
    viewMode={$editorStore.viewMode}
    syncPending={$editorStore.syncPending}
    {validating}
    {saving}
    {loading}
    canUndo={workflowStore.canUndo()}
    canRedo={workflowStore.canRedo()}
    ontoggleview={handleToggleView}
    onsync={handleSync}
    onvalidate={handleValidate}
    onsave={handleSave}
    onload={handleLoad}
    onundo={handleUndo}
    onredo={handleRedo}
  />

  <div class="editor-content">
    {#if initializing}
      <!-- Initial Loading State -->
      <div class="loading-overlay">
        <div class="loading-spinner">
          <div class="spinner"></div>
          <p>Loading editor...</p>
        </div>
      </div>
    {:else}
      <div class="editor-main">
        {#if $editorStore.viewMode === 'visual'}
          <!-- Visual Flow Canvas -->
          {#if $workflowStore}
            <FlowCanvas
              graph={$workflowStore}
              bind:selectedNodeId
              onnodeclick={handleNodeClick}
              onnodepositionchange={handleNodePositionChange}
            />
          {:else}
            <div class="loading">Loading workflow...</div>
          {/if}
        {:else}
          <!-- YAML Editor -->
          <YamlEditor bind:value={yamlContent} onchange={handleYamlChange} />
        {/if}
      </div>

      <!-- Sidebar with Inspector and Validation -->
      <div class="editor-sidebar">
        <div class="sidebar-inspector">
          <Inspector {selectedNodeId} />
        </div>
        <div class="sidebar-validation">
          <ValidationPanel />
        </div>
      </div>
    {/if}
  </div>

  <div class="editor-footer">
    <div class="stats">
      <span class="tag is-info">Nodes: {$workflowStore.nodes.length}</span>
      <span class="tag is-success">Edges: {$workflowStore.edges.length}</span>
      {#if selectedNodeId}
        <span class="tag is-warning"
          >Selected: {selectedNodeId.substring(0, 8)}...</span
        >
      {/if}
      {#if $editorStore.isDirty}
        <span class="tag is-danger">Unsaved Changes</span>
      {/if}
      {#if $editorStore.syncPending}
        <span class="tag is-warning">Sync Pending</span>
      {/if}
    </div>
  </div>

  <!-- Toast Notifications -->
  <Toast />
</div>

<style lang="scss">
  .editor-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
  }

  .editor-header {
    padding: 1rem 1.5rem;
    background-color: var(--bulma-scheme-main);
    border-bottom: 1px solid var(--bulma-border);

    .title {
      margin-bottom: 0.25rem;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .subtitle {
      margin-bottom: 0;
      color: var(--bulma-text-light);
      font-size: 0.9rem;
    }
  }

  .editor-content {
    flex: 1;
    display: flex;
    position: relative;
    overflow: hidden;
  }

  .editor-main {
    flex: 1;
    position: relative;
    overflow: hidden;
  }

  .editor-sidebar {
    width: 400px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .sidebar-inspector {
    flex: 1;
    overflow: hidden;
    border-bottom: 1px solid var(--bulma-border);
  }

  .sidebar-validation {
    height: 300px;
    overflow: hidden;
  }

  .editor-footer {
    padding: 0.75rem 1.5rem;
    background-color: var(--bulma-scheme-main);
    border-top: 1px solid var(--bulma-border);

    .stats {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .tag {
      font-size: 0.8rem;
    }
  }

  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-size: 1.2rem;
    color: var(--bulma-text-light);
  }

  .loading-overlay {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background-color: var(--bulma-scheme-main);
  }

  .loading-spinner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;

    p {
      font-size: 1.1rem;
      color: var(--bulma-text);
    }
  }

  .spinner {
    width: 48px;
    height: 48px;
    border: 4px solid var(--bulma-border);
    border-top-color: var(--bulma-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
