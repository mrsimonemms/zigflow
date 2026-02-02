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

// Editor state store - manages UI state for the workflow editor

import { writable } from 'svelte/store';

export type ViewMode = 'visual' | 'yaml';

export interface EditorState {
  viewMode: ViewMode;
  yamlContent: string;
  isDirty: boolean;
  syncPending: boolean;
  selectedNodeId: string | null;
}

function createEditorStore() {
  const { subscribe, set, update } = writable<EditorState>({
    viewMode: 'visual',
    yamlContent: '',
    isDirty: false,
    syncPending: false,
    selectedNodeId: null,
  });

  return {
    subscribe,
    setViewMode: (mode: ViewMode) => {
      update((state) => ({ ...state, viewMode: mode }));
    },
    setYamlContent: (content: string) => {
      update((state) => ({
        ...state,
        yamlContent: content,
        isDirty: true,
        syncPending: true,
      }));
    },
    setSelectedNodeId: (nodeId: string | null) => {
      update((state) => ({ ...state, selectedNodeId: nodeId }));
    },
    markClean: () => {
      update((state) => ({ ...state, isDirty: false }));
    },
    markSyncComplete: () => {
      update((state) => ({ ...state, syncPending: false }));
    },
    reset: () => {
      set({
        viewMode: 'visual',
        yamlContent: '',
        isDirty: false,
        syncPending: false,
        selectedNodeId: null,
      });
    },
  };
}

export const editorStore = createEditorStore();
