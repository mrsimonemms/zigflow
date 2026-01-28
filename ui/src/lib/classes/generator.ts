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
import { createNode } from '$lib/components/nodes';
import { type Edge, type Node } from '@xyflow/svelte';
// import fs from 'fs/promises';
import jsYAML from 'js-yaml';
// import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface DirectoryEntry {
  isDirectory: boolean;
  name: string;
  path: string;
}

export interface FileEntry {
  workflow: unknown;
  name: string;
  path: string;
}

export type Entry = DirectoryEntry | FileEntry;

export class Generator {
  protected nodes: Node[] = [];

  constructor(protected entries: Entry[]) {}

  addNode(sourceId: string) {
    this.nodes.push(
      createNode({
        type: 'task',
      }),
    );
    console.log(sourceId);
  }

  async build(): Promise<{ edges: Edge[]; nodes: Node[] }> {
    let y = 0;
    const nodes: Node[] = [
      createNode({
        position: {
          x: 0,
          y,
        },
        type: 'start',
      }),
    ];
    const edges: Edge[] = [];

    this.nodes.forEach((node) => {
      y += 100;
      node.position = {
        x: 0,
        y,
      };

      nodes.push(node);
    });

    // Add the end
    nodes.push(
      createNode({
        position: {
          x: 0,
          y: y + 100,
        },
        type: 'end',
      }),
    );

    const [last] = nodes.slice(-1);

    // Connect the edges
    nodes.forEach((item, key) => {
      if (item !== last) {
        edges.push({
          id: uuidv4(),
          source: item.id,
          target: nodes[key + 1].id,
          deletable: false,
          type: 'link',
        });
      }
    });

    return {
      edges,
      nodes,
    };
  }

  /**
   * Generate Source
   *
   * Builds the source YAML code from the UI. This is what's actually saved and
   * used by Zigflow.
   *
   * @returns {string}
   */
  generateSource(): string {
    return `document:
  dsl: 1.0.0
  namespace: zigflow
  name: simple-workflow
  version: 1.0.0
  metadata:
    generatedAt: ${new Date().toISOString()}
do:
  - set:
      export:
        as: data
      set:
        message: Hello from Ziggy`;
  }

  static async loadDir(root: string): Promise<Entry[]> {
    // Import dependencies in here. This cannot be loaded in browser
    const fs = await import('fs/promises');
    const path = await import('path');

    const entries = await fs.readdir(root, { withFileTypes: true });
    const ent: Entry[] = [];

    for (const entry of entries) {
      if (entry.isDirectory()) {
        ent.push({
          isDirectory: true,
          path: entry.parentPath,
          name: entry.name,
        });
      } else if (entry.isFile()) {
        ent.push({
          workflow: jsYAML.load(
            await fs.readFile(path.join(entry.parentPath, entry.name), 'utf-8'),
          ),
          path: entry.parentPath,
          name: entry.name,
        });
      }
    }

    return ent;
  }
}
