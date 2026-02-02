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

  import type { ViewMode } from '$lib/stores/editor-store';

  // Props
  let {
    viewMode,
    syncPending = false,
    validating = false,
    saving = false,
    loading = false,
    canUndo = false,
    canRedo = false,
    ontoggleview,
    onsync,
    onvalidate,
    onsave,
    onload,
    onundo,
    onredo,
  }: {
    viewMode: ViewMode;
    syncPending?: boolean;
    validating?: boolean;
    saving?: boolean;
    loading?: boolean;
    canUndo?: boolean;
    canRedo?: boolean;
    ontoggleview?: () => void;
    onsync?: () => void;
    onvalidate?: () => void;
    onsave?: () => void;
    onload?: () => void;
    onundo?: () => void;
    onredo?: () => void;
  } = $props();
</script>

<div class="toolbar">
  <div class="toolbar-section">
    <!-- View Toggle -->
    <div class="buttons has-addons">
      <button
        class="button is-small"
        class:is-primary={viewMode === 'visual'}
        onclick={() => ontoggleview?.()}
      >
        <span class="icon is-small">
          <i class="icon">📊</i>
        </span>
        <span>Visual</span>
      </button>
      <button
        class="button is-small"
        class:is-primary={viewMode === 'yaml'}
        onclick={() => ontoggleview?.()}
      >
        <span class="icon is-small">
          <i class="icon">📝</i>
        </span>
        <span>YAML</span>
      </button>
    </div>

    <!-- Sync Button -->
    <button
      class="button is-small is-info"
      class:is-loading={syncPending}
      disabled={syncPending}
      onclick={() => onsync?.()}
      title="Sync changes between views"
    >
      <span class="icon is-small">
        <i class="icon">🔄</i>
      </span>
      <span>Sync</span>
    </button>

    <!-- Validate Button -->
    <button
      class="button is-small is-success"
      class:is-loading={validating}
      disabled={validating}
      onclick={() => onvalidate?.()}
      title="Validate workflow against schema"
    >
      <span class="icon is-small">
        <i class="icon">✓</i>
      </span>
      <span>Validate</span>
    </button>
  </div>

  <div class="toolbar-section">
    <!-- Save/Load -->
    <div class="buttons has-addons">
      <button
        class="button is-small is-primary"
        class:is-loading={saving}
        disabled={saving}
        onclick={() => onsave?.()}
        title="Save workflow"
      >
        <span class="icon is-small">
          <i class="icon">💾</i>
        </span>
        <span>Save</span>
      </button>
      <button
        class="button is-small"
        class:is-loading={loading}
        disabled={loading}
        onclick={() => onload?.()}
        title="Load workflow"
      >
        <span class="icon is-small">
          <i class="icon">📂</i>
        </span>
        <span>Load</span>
      </button>
    </div>
  </div>

  <div class="toolbar-section">
    <!-- Undo/Redo -->
    <div class="buttons has-addons">
      <button
        class="button is-small"
        disabled={!canUndo}
        onclick={() => onundo?.()}
        title="Undo (Ctrl+Z)"
      >
        <span class="icon is-small">
          <i class="icon">↶</i>
        </span>
        <span>Undo</span>
      </button>
      <button
        class="button is-small"
        disabled={!canRedo}
        onclick={() => onredo?.()}
        title="Redo (Ctrl+Y)"
      >
        <span class="icon is-small">
          <i class="icon">↷</i>
        </span>
        <span>Redo</span>
      </button>
    </div>
  </div>
</div>

<style lang="scss">
  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background-color: var(--bulma-scheme-main);
    border-bottom: 1px solid var(--bulma-border);
    gap: 1rem;
  }

  .toolbar-section {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
