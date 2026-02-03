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
  /**
   * Toast notification component
   *
   * Displays toast notifications in the bottom-right corner
   */

  import { toastStore } from '$lib/stores/toast-store';
  import type { ToastType } from '$lib/stores/toast-store';

  const typeClassMap: Record<ToastType, string> = {
    success: 'is-success',
    error: 'is-danger',
    warning: 'is-warning',
    info: 'is-info',
  };

  const typeIconMap: Record<ToastType, string> = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };
</script>

<div class="toast-container">
  {#each $toastStore.toasts as toast (toast.id)}
    <div class="notification {typeClassMap[toast.type]} toast-item">
      <button
        class="delete"
        aria-label="Dismiss notification"
        onclick={() => toastStore.dismiss(toast.id)}
      ></button>
      <span class="toast-icon">{typeIconMap[toast.type]}</span>
      <span class="toast-message">{toast.message}</span>
    </div>
  {/each}
</div>

<style lang="scss">
  .toast-container {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-width: 400px;
    pointer-events: none;
  }

  .toast-item {
    pointer-events: auto;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    animation: slideIn 0.3s ease-out;

    .toast-icon {
      font-size: 1.25rem;
      flex-shrink: 0;
    }

    .toast-message {
      flex: 1;
      word-break: break-word;
    }

    .delete {
      flex-shrink: 0;
    }
  }

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
</style>
