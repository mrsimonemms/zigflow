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

import { describe, it, expect } from 'vitest';
import yaml from 'js-yaml';
import { YamlToGraphConverter } from './yaml-to-graph';
import { GraphToYamlConverter } from './graph-to-yaml';

describe('GraphToYamlConverter', () => {
  const graphConverter = new GraphToYamlConverter();

  it('should serialize a simple workflow', () => {
    const yamlParser = new YamlToGraphConverter();

    const originalYaml = `
document:
  dsl: 1.0.0
  namespace: zigflow
  name: test
  version: 0.0.1
do:
  - task1:
      set:
        foo: bar
`;

    const graph = yamlParser.convert(originalYaml);
    const serializedYaml = graphConverter.convert(graph);

    // Parse both to compare structure
    const original = yaml.load(originalYaml) as Record<string, unknown>;
    const serialized = yaml.load(serializedYaml) as Record<string, unknown>;

    expect(serialized.document).toEqual(original.document);
    expect(serialized.do).toBeDefined();
  });

  it('should preserve metadata fields', () => {
    const yamlParser = new YamlToGraphConverter();

    const originalYaml = `
document:
  dsl: 1.0.0
  namespace: zigflow
  name: test
  version: 0.0.1
  title: Test Workflow
  summary: A test workflow
do:
  - task1:
      set:
        foo: bar
`;

    const graph = yamlParser.convert(originalYaml);
    const serializedYaml = graphConverter.convert(graph);
    const serialized = yaml.load(serializedYaml) as Record<string, unknown>;
    const doc = serialized.document as Record<string, unknown>;

    expect(doc.title).toBe('Test Workflow');
    expect(doc.summary).toBe('A test workflow');
  });

  describe('Round-trip conversion', () => {
    it('should preserve simple workflow structure', () => {
      const yamlParser = new YamlToGraphConverter();

      const originalYaml = `
document:
  dsl: 1.0.0
  namespace: zigflow
  name: hello-world
  version: 0.0.1
do:
  - greet:
      set:
        message: Hello World
`;

      // YAML → Graph → YAML
      const graph = yamlParser.convert(originalYaml);
      const serializedYaml = graphConverter.convert(graph);

      // Parse both
      const original = yaml.load(originalYaml) as Record<string, unknown>;
      const serialized = yaml.load(serializedYaml) as Record<string, unknown>;

      // Compare structure
      expect(serialized.document).toEqual(original.document);
      expect(Array.isArray(serialized.do)).toBe(true);
      expect((serialized.do as unknown[]).length).toBe(1);
    });

    it('should preserve sequential tasks', () => {
      const yamlParser = new YamlToGraphConverter();

      const originalYaml = `
document:
  dsl: 1.0.0
  namespace: zigflow
  name: test
  version: 0.0.1
do:
  - task1:
      set:
        foo: bar
  - task2:
      wait:
        seconds: 1
  - task3:
      set:
        baz: qux
`;

      const graph = yamlParser.convert(originalYaml);
      const serializedYaml = graphConverter.convert(graph);
      const serialized = yaml.load(serializedYaml) as Record<string, unknown>;

      expect(Array.isArray(serialized.do)).toBe(true);
      expect((serialized.do as unknown[]).length).toBe(3);
    });

    it('should preserve call task with HTTP configuration', () => {
      const yamlParser = new YamlToGraphConverter();

      const originalYaml = `
document:
  dsl: 1.0.0
  namespace: zigflow
  name: test
  version: 0.0.1
do:
  - callApi:
      call: http
      with:
        method: get
        endpoint: https://api.example.com
`;

      const graph = yamlParser.convert(originalYaml);
      const serializedYaml = graphConverter.convert(graph);
      const serialized = yaml.load(serializedYaml) as Record<string, unknown>;

      const tasks = serialized.do as Record<string, unknown>[];
      const callTask = tasks[0].callApi as Record<string, unknown>;

      expect(callTask.call).toBe('http');
      expect(callTask.with).toBeDefined();
    });
  });
});
