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

// Validation state store - manages workflow validation results

import { writable } from 'svelte/store';

export type ValidationStatus = 'valid' | 'invalid' | 'warning' | 'unknown';

export interface ValidationError {
  path: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationState {
  status: ValidationStatus;
  errors: ValidationError[];
  lastValidated: Date | null;
  isValidating: boolean;
}

function createValidationStore() {
  const { subscribe, set, update } = writable<ValidationState>({
    status: 'unknown',
    errors: [],
    lastValidated: null,
    isValidating: false,
  });

  return {
    subscribe,
    startValidation: () => {
      update((state) => ({ ...state, isValidating: true }));
    },
    setValidationResult: (
      status: ValidationStatus,
      errors: ValidationError[] = []
    ) => {
      set({
        status,
        errors,
        lastValidated: new Date(),
        isValidating: false,
      });
    },
    addError: (error: ValidationError) => {
      update((state) => ({
        ...state,
        errors: [...state.errors, error],
        status: error.severity === 'error' ? 'invalid' : 'warning',
      }));
    },
    clearErrors: () => {
      update((state) => ({
        ...state,
        errors: [],
        status: 'unknown',
      }));
    },
    reset: () => {
      set({
        status: 'unknown',
        errors: [],
        lastValidated: null,
        isValidating: false,
      });
    },
  };
}

export const validationStore = createValidationStore();
