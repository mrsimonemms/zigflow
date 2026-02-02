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

/**
 * Toast notification store
 *
 * Manages toast notifications with auto-dismiss functionality
 */

import { writable } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number; // milliseconds, 0 = no auto-dismiss
}

interface ToastStore {
  toasts: Toast[];
}

function createToastStore() {
  const { subscribe, update } = writable<ToastStore>({ toasts: [] });

  let idCounter = 0;

  return {
    subscribe,

    /**
     * Add a toast notification
     */
    show(message: string, type: ToastType = 'info', duration = 5000) {
      const id = `toast-${++idCounter}`;
      const toast: Toast = { id, message, type, duration };

      update((state) => ({
        toasts: [...state.toasts, toast],
      }));

      // Auto-dismiss after duration
      if (duration > 0) {
        setTimeout(() => {
          this.dismiss(id);
        }, duration);
      }

      return id;
    },

    /**
     * Dismiss a specific toast
     */
    dismiss(id: string) {
      update((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    },

    /**
     * Dismiss all toasts
     */
    dismissAll() {
      update(() => ({ toasts: [] }));
    },

    // Convenience methods
    success(message: string, duration = 5000) {
      return this.show(message, 'success', duration);
    },

    error(message: string, duration = 7000) {
      return this.show(message, 'error', duration);
    },

    warning(message: string, duration = 6000) {
      return this.show(message, 'warning', duration);
    },

    info(message: string, duration = 5000) {
      return this.show(message, 'info', duration);
    },
  };
}

export const toastStore = createToastStore();
