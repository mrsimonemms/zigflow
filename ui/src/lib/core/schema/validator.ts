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

// Schema validator using Ajv

import Ajv2020, { type AnySchema } from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import yaml from 'js-yaml';
import type {
  ValidationError,
  ValidationStatus,
} from '$lib/stores/validation-store';

// Validation result
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  status: ValidationStatus;
}

// Schema validator class
export class SchemaValidator {
  private ajv: Ajv2020;
  private schema: unknown | null = null;
  private validateFn: ((data: unknown) => boolean) | null = null;

  constructor() {
    // Create Ajv instance with draft 2020-12 support and strict mode disabled for flexibility
    this.ajv = new Ajv2020({
      allErrors: true,
      verbose: true,
      strict: false,
    });

    // Add format validators (email, uri, date-time, etc.)
    addFormats(this.ajv);
  }

  /**
   * Load schema from YAML string
   */
  async loadSchema(schemaYaml: string): Promise<void> {
    try {
      // Parse YAML schema
      this.schema = yaml.load(schemaYaml);

      // Compile schema
      this.validateFn = this.ajv.compile(this.schema as AnySchema);
    } catch (error) {
      throw new Error(
        `Failed to load schema: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Validate YAML workflow against schema
   */
  validate(workflowYaml: string): ValidationResult {
    // Check if schema is loaded
    if (!this.validateFn) {
      return {
        valid: false,
        errors: [
          {
            path: '',
            message: 'Schema not loaded. Call loadSchema() first.',
            severity: 'error',
          },
        ],
        status: 'invalid',
      };
    }

    try {
      // Parse YAML
      const workflow = yaml.load(workflowYaml);

      // Validate against schema
      const valid = this.validateFn(workflow);

      if (valid) {
        return {
          valid: true,
          errors: [],
          status: 'valid',
        };
      }

      // Convert Ajv errors to our format
      const errors: ValidationError[] =
        this.ajv.errors?.map((err) => ({
          path: err.instancePath || err.schemaPath || '/',
          message: this.formatErrorMessage(err),
          severity: 'error',
        })) || [];

      return {
        valid: false,
        errors,
        status: 'invalid',
      };
    } catch (error) {
      // YAML parsing error
      return {
        valid: false,
        errors: [
          {
            path: '',
            message: `YAML parse error: ${error instanceof Error ? error.message : String(error)}`,
            severity: 'error',
          },
        ],
        status: 'invalid',
      };
    }
  }

  /**
   * Format Ajv error message for display
   */
  private formatErrorMessage(error: {
    keyword?: string;
    message?: string;
    params?: Record<string, unknown>;
    instancePath?: string;
  }): string {
    const path = error.instancePath || '';
    const message = error.message || 'Unknown error';

    // Format based on error keyword
    switch (error.keyword) {
      case 'required':
        return `Missing required property: ${error.params?.missingProperty}`;
      case 'type':
        return `Invalid type: expected ${error.params?.type}, got ${error.params?.actual || 'unknown'}`;
      case 'enum':
        return `Invalid value: must be one of ${JSON.stringify(error.params?.allowedValues)}`;
      case 'additionalProperties':
        return `Unexpected property: ${error.params?.additionalProperty}`;
      case 'minLength':
        return `String too short: minimum length is ${error.params?.limit}`;
      case 'maxLength':
        return `String too long: maximum length is ${error.params?.limit}`;
      case 'pattern':
        return `String does not match pattern: ${error.params?.pattern}`;
      default:
        return `${path ? `At ${path}: ` : ''}${message}`;
    }
  }

  /**
   * Check if schema is loaded
   */
  isReady(): boolean {
    return this.validateFn !== null;
  }
}

// Singleton instance
let validatorInstance: SchemaValidator | null = null;

/**
 * Get or create validator instance
 */
export function getValidator(): SchemaValidator {
  if (!validatorInstance) {
    validatorInstance = new SchemaValidator();
  }
  return validatorInstance;
}
