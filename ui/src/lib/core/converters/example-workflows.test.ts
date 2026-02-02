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
 * Integration tests for example workflows
 *
 * Tests round-trip conversion (YAML → Graph → YAML) for all
 * example workflows in the examples directory
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';
import { YamlToGraphConverter } from './yaml-to-graph';
import { GraphToYamlConverter } from './graph-to-yaml';

const EXAMPLES_DIR = join(process.cwd(), '..', 'examples');

const exampleWorkflows = [
  'activity-call',
  'authorise-change-request',
  'basic',
  'child-workflows',
  'competing-concurrent-tasks',
  'conditionally-execute',
  'external-calls',
  'for-loop',
  'heartbeat',
  'hello-world-encrypted',
  'hello-world',
  'money-transfer',
  'multiple-workflows',
  'python',
  'query',
  'raise',
  'run-task',
  'schedule',
  'search-attributes',
  'signal',
  'switch',
  'try-catch',
  'typescript',
  'update',
];

describe('Example Workflows Round-Trip Conversion', () => {
  const yamlConverter = new YamlToGraphConverter();
  const graphConverter = new GraphToYamlConverter();

  exampleWorkflows.forEach((exampleName) => {
    it(`should handle ${exampleName} workflow`, () => {
      const workflowPath = join(EXAMPLES_DIR, exampleName, 'workflow.yaml');

      // Read original YAML
      const originalYaml = readFileSync(workflowPath, 'utf-8');

      // Parse to graph
      const graph = yamlConverter.convert(originalYaml);

      // Verify graph was created
      expect(graph).toBeDefined();
      expect(graph.metadata).toBeDefined();
      expect(graph.metadata.dsl).toBe('1.0.0');
      expect(graph.nodes).toBeInstanceOf(Array);
      expect(graph.edges).toBeInstanceOf(Array);

      // Convert back to YAML
      const serializedYaml = graphConverter.convert(graph);

      // Parse both YAMLs to compare structure
      const original = yaml.load(originalYaml) as Record<string, unknown>;
      const serialized = yaml.load(serializedYaml) as Record<string, unknown>;

      // Verify document metadata is preserved
      expect(serialized.document).toEqual(original.document);

      // Verify do section exists
      expect(serialized.do).toBeDefined();
      expect(Array.isArray(serialized.do)).toBe(true);

      // Log success
      console.log(
        `✓ ${exampleName}: ${graph.nodes.length} nodes, ${graph.edges.length} edges`
      );
    });
  });

  it('should preserve workflow structure integrity', () => {
    const workflowPath = join(EXAMPLES_DIR, 'hello-world', 'workflow.yaml');
    const originalYaml = readFileSync(workflowPath, 'utf-8');

    // Round-trip conversion
    const graph = yamlConverter.convert(originalYaml);
    const serializedYaml = graphConverter.convert(graph);

    // Second round-trip to ensure consistency
    const graph2 = yamlConverter.convert(serializedYaml);
    const serializedYaml2 = graphConverter.convert(graph2);

    // Parse both
    const first = yaml.load(serializedYaml) as Record<string, unknown>;
    const second = yaml.load(serializedYaml2) as Record<string, unknown>;

    // Should be identical after second round-trip
    expect(second).toEqual(first);
  });
});
