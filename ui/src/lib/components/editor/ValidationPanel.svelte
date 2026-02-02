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
  import { validationStore } from '$lib/stores/validation-store';
  import type { ValidationError } from '$lib/stores/validation-store';

  // Subscribe to validation store
  const validation = $derived($validationStore);

  // Get status icon
  function getStatusIcon(status: typeof validation.status): string {
    switch (status) {
      case 'valid':
        return '✅';
      case 'invalid':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return '❓';
    }
  }

  // Get status color class
  function getStatusClass(status: typeof validation.status): string {
    switch (status) {
      case 'valid':
        return 'is-success';
      case 'invalid':
        return 'is-danger';
      case 'warning':
        return 'is-warning';
      default:
        return 'is-info';
    }
  }

  // Get severity icon
  function getSeverityIcon(severity: ValidationError['severity']): string {
    return severity === 'error' ? '🔴' : '🟡';
  }
</script>

<div class="validation-panel">
  <div class="panel-header">
    <h3 class="title is-6">Validation</h3>
    <span class="tag {getStatusClass(validation.status)}">
      {getStatusIcon(validation.status)}
      {validation.status.toUpperCase()}
    </span>
  </div>

  {#if validation.errors.length > 0}
    <div class="validation-errors">
      {#each validation.errors as error}
        <div
          class="notification {error.severity === 'error'
            ? 'is-danger'
            : 'is-warning'} is-light"
        >
          <div class="error-header">
            <span class="error-icon">{getSeverityIcon(error.severity)}</span>
            <span class="error-path">{error.path || 'Root'}</span>
          </div>
          <p class="error-message">{error.message}</p>
        </div>
      {/each}
    </div>
  {:else if validation.status === 'valid'}
    <div class="notification is-success is-light">
      <p>✨ Workflow is valid and ready to use!</p>
    </div>
  {:else}
    <div class="notification is-info is-light">
      <p>Click "Validate" to check your workflow.</p>
    </div>
  {/if}

  {#if validation.lastValidated}
    <div class="validation-timestamp">
      <small class="has-text-grey">
        Last validated: {new Date(
          validation.lastValidated
        ).toLocaleTimeString()}
      </small>
    </div>
  {/if}
</div>

<style lang="scss">
  .validation-panel {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    background-color: var(--bulma-scheme-main);
    border-left: 1px solid var(--bulma-border);
    height: 100%;
    overflow-y: auto;
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--bulma-border);

    .title {
      margin: 0;
    }
  }

  .validation-errors {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .error-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    font-weight: 600;
  }

  .error-icon {
    font-size: 1rem;
  }

  .error-path {
    font-family: monospace;
    font-size: 0.85rem;
    color: var(--bulma-text-strong);
  }

  .error-message {
    font-size: 0.9rem;
    margin: 0;
  }

  .validation-timestamp {
    padding-top: 0.5rem;
    border-top: 1px solid var(--bulma-border);
    text-align: center;
  }

  .notification {
    margin: 0;
  }
</style>
