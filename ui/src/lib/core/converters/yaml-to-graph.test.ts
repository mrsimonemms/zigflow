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
import { YamlToGraphConverter } from './yaml-to-graph';

describe('YamlToGraphConverter', () => {
  const converter = new YamlToGraphConverter();

  it('should parse hello-world example', () => {
    const yaml = `
document:
  dsl: 1.0.0
  namespace: zigflow
  name: hello-world
  version: 0.0.1
  title: Hello World
  summary: Hello world with Zigflow
do:
  - set:
      set:
        message: Hello from Ziggy
`;

    const graph = converter.convert(yaml);

    // Check metadata
    expect(graph.metadata.dsl).toBe('1.0.0');
    expect(graph.metadata.namespace).toBe('zigflow');
    expect(graph.metadata.name).toBe('hello-world');
    expect(graph.metadata.version).toBe('0.0.1');
    expect(graph.metadata.title).toBe('Hello World');

    // Check nodes
    expect(graph.nodes).toHaveLength(1);
    expect(graph.nodes[0].type).toBe('set');
    expect(graph.nodes[0].label).toBe('set');

    // Check edges (no edges in single-task workflow)
    expect(graph.edges).toHaveLength(0);
  });

  it('should parse sequential tasks', () => {
    const yaml = `
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

    const graph = converter.convert(yaml);

    expect(graph.nodes).toHaveLength(3);
    expect(graph.nodes[0].label).toBe('task1');
    expect(graph.nodes[0].type).toBe('set');
    expect(graph.nodes[1].label).toBe('task2');
    expect(graph.nodes[1].type).toBe('wait');
    expect(graph.nodes[2].label).toBe('task3');
    expect(graph.nodes[2].type).toBe('set');

    // Check edges connect tasks sequentially
    expect(graph.edges).toHaveLength(2);
    expect(graph.edges[0].source).toBe(graph.nodes[0].id);
    expect(graph.edges[0].target).toBe(graph.nodes[1].id);
    expect(graph.edges[1].source).toBe(graph.nodes[1].id);
    expect(graph.edges[1].target).toBe(graph.nodes[2].id);
  });

  it('should parse call task', () => {
    const yaml = `
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

    const graph = converter.convert(yaml);

    expect(graph.nodes).toHaveLength(1);
    expect(graph.nodes[0].type).toBe('call');
    expect(graph.nodes[0].data.type).toBe('call');
    if (graph.nodes[0].data.type === 'call') {
      expect(graph.nodes[0].data.call).toBe('http');
    }
  });

  it('should handle invalid YAML', () => {
    expect(() => {
      converter.convert('invalid: yaml: }');
    }).toThrow();
  });

  it('should require document section', () => {
    expect(() => {
      converter.convert('do: []');
    }).toThrow('missing document section');
  });

  it('should parse do task (nested tasks)', () => {
    const yaml = `
document:
  dsl: 1.0.0
  namespace: zigflow
  name: test
  version: 0.0.1
do:
  - processData:
      do:
        - step1:
            set:
              foo: bar
        - step2:
            set:
              baz: qux
`;

    const graph = converter.convert(yaml);

    expect(graph.nodes).toHaveLength(3); // Parent + 2 children
    expect(graph.nodes[0].type).toBe('do');
    expect(graph.nodes[0].label).toBe('processData');
  });

  it('should parse fork task', () => {
    const yaml = `
document:
  dsl: 1.0.0
  namespace: zigflow
  name: test
  version: 0.0.1
do:
  - parallel:
      fork:
        branches:
          - branch1:
              set:
                foo: bar
          - branch2:
              set:
                baz: qux
`;

    const graph = converter.convert(yaml);

    expect(graph.nodes).toHaveLength(3); // Parent + 2 branches
    expect(graph.nodes[0].type).toBe('fork');
  });

  it('should parse switch task', () => {
    const yaml = `
document:
  dsl: 1.0.0
  namespace: zigflow
  name: test
  version: 0.0.1
do:
  - decide:
      switch:
        - case1:
            when: \${ .status == 200 }
            then: success
        - case2:
            when: \${ .status >= 400 }
            then: error
`;

    const graph = converter.convert(yaml);

    expect(graph.nodes).toHaveLength(1);
    expect(graph.nodes[0].type).toBe('switch');
    expect(graph.nodes[0].data.type).toBe('switch');
  });

  it('should parse try task', () => {
    const yaml = `
document:
  dsl: 1.0.0
  namespace: zigflow
  name: test
  version: 0.0.1
do:
  - tryTask:
      try:
        - risky:
            call: http
            with:
              method: get
              endpoint: https://api.example.com
      catch:
        errors:
          - type: "*"
        as: error
        do:
          - handleError:
              set:
                error: \${ .error }
`;

    const graph = converter.convert(yaml);

    expect(graph.nodes.length).toBeGreaterThan(0);
    expect(graph.nodes[0].type).toBe('try');
  });

  it('should parse for task', () => {
    const yaml = `
document:
  dsl: 1.0.0
  namespace: zigflow
  name: test
  version: 0.0.1
do:
  - iterate:
      for:
        each: item
        in: \${ .items }
        do:
          - processItem:
              set:
                result: \${ .item }
`;

    const graph = converter.convert(yaml);

    expect(graph.nodes.length).toBeGreaterThan(0);
    expect(graph.nodes[0].type).toBe('for');
  });

  it('should parse emit task', () => {
    const yaml = `
document:
  dsl: 1.0.0
  namespace: zigflow
  name: test
  version: 0.0.1
do:
  - sendEvent:
      emit:
        event:
          type: orderPlaced
          data:
            orderId: \${ .orderId }
`;

    const graph = converter.convert(yaml);

    expect(graph.nodes).toHaveLength(1);
    expect(graph.nodes[0].type).toBe('emit');
  });

  it('should parse listen task', () => {
    const yaml = `
document:
  dsl: 1.0.0
  namespace: zigflow
  name: test
  version: 0.0.1
do:
  - waitForEvent:
      listen:
        to:
          any:
            - type: orderConfirmed
            - type: orderCancelled
`;

    const graph = converter.convert(yaml);

    expect(graph.nodes).toHaveLength(1);
    expect(graph.nodes[0].type).toBe('listen');
  });

  it('should parse raise task', () => {
    const yaml = `
document:
  dsl: 1.0.0
  namespace: zigflow
  name: test
  version: 0.0.1
do:
  - throwError:
      raise:
        error:
          type: ValidationError
          message: Invalid input
`;

    const graph = converter.convert(yaml);

    expect(graph.nodes).toHaveLength(1);
    expect(graph.nodes[0].type).toBe('raise');
  });

  it('should parse run task', () => {
    const yaml = `
document:
  dsl: 1.0.0
  namespace: zigflow
  name: test
  version: 0.0.1
do:
  - runContainer:
      run:
        container:
          image: alpine:latest
          command: echo "Hello"
`;

    const graph = converter.convert(yaml);

    expect(graph.nodes).toHaveLength(1);
    expect(graph.nodes[0].type).toBe('run');
  });

  it('should parse wait task with duration', () => {
    const yaml = `
document:
  dsl: 1.0.0
  namespace: zigflow
  name: test
  version: 0.0.1
do:
  - pause:
      wait:
        seconds: 5
`;

    const graph = converter.convert(yaml);

    expect(graph.nodes).toHaveLength(1);
    expect(graph.nodes[0].type).toBe('wait');
    expect(graph.nodes[0].data.type).toBe('wait');
  });

  it('should handle complex nested workflows', () => {
    const yaml = `
document:
  dsl: 1.0.0
  namespace: zigflow
  name: complex
  version: 0.0.1
do:
  - setup:
      set:
        initialized: true
  - processData:
      do:
        - fetch:
            call: http
            with:
              method: get
              endpoint: https://api.example.com
        - validate:
            switch:
              - success:
                  when: \${ .status == 200 }
                  then: continue
              - error:
                  when: \${ .status >= 400 }
                  then: fail
  - cleanup:
      set:
        completed: true
`;

    const graph = converter.convert(yaml);

    expect(graph.nodes.length).toBeGreaterThanOrEqual(3);
    expect(graph.edges.length).toBeGreaterThan(0);
  });
});
