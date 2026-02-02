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
  /*
   * Copyright 2025 - 2026 Zigflow authors
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

  import {
    SvelteFlow,
    Controls,
    Background,
    MiniMap,
    type NodeTypes,
  } from '@xyflow/svelte';
  import type { Node, Edge } from '@xyflow/svelte';
  import { writable } from 'svelte/store';
  import { nodeTypes } from './node-registry';
  import type {
    WorkflowGraph,
    BaseNode,
    FlowEdge,
  } from '$lib/core/graph/types';

  // Import Svelte Flow styles
  import '@xyflow/svelte/dist/style.css';

  // Props
  let {
    graph,
    selectedNodeId = $bindable<string | null>(null),
    onnodeclick,
    onnodepositionchange,
  }: {
    graph: WorkflowGraph;
    selectedNodeId?: string | null;
    onnodeclick?: (event: CustomEvent) => void;
    onnodepositionchange?: (event: CustomEvent) => void;
  } = $props();

  // Convert graph IR nodes to Svelte Flow nodes
  function convertNodes(nodes: BaseNode[], selected: string | null): Node[] {
    return nodes.map(
      (node: BaseNode): Node => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: {
          ...node.data,
          label: node.label,
          selected: node.id === selected,
        },
      })
    );
  }

  // Convert graph IR edges to Svelte Flow edges
  function convertEdges(edges: FlowEdge[]): Edge[] {
    return edges.map(
      (edge: FlowEdge): Edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label,
        type: edge.type || 'default',
        animated: edge.label === 'error' || edge.label === 'loop',
      })
    );
  }

  // Create writable stores for Svelte Flow
  const flowNodes = writable<Node[]>([]);
  const flowEdges = writable<Edge[]>([]);

  // Update stores when graph changes
  $effect(() => {
    flowNodes.set(convertNodes(graph.nodes, selectedNodeId));
  });
  $effect(() => {
    flowEdges.set(convertEdges(graph.edges));
  });

  // Handle node click
  function handleNodeClick(event: CustomEvent) {
    const nodeId = event.detail?.node?.id;
    if (nodeId) {
      selectedNodeId = nodeId;
      onnodeclick?.(new CustomEvent('nodeClick', { detail: { nodeId } }));
    }
  }

  // Handle node drag end (update position in graph)
  function handleNodeDragStop(event: CustomEvent) {
    const node = event.detail?.node;
    if (node) {
      onnodepositionchange?.(
        new CustomEvent('nodePositionChange', {
          detail: {
            nodeId: node.id,
            position: node.position,
          },
        })
      );
    }
  }

  // Handle pane click (deselect node)
  function handlePaneClick() {
    selectedNodeId = null;
    onnodeclick?.(new CustomEvent('nodeClick', { detail: { nodeId: null } }));
  }
</script>

<div class="flow-canvas">
  <SvelteFlow
    nodes={flowNodes}
    edges={flowEdges}
    nodeTypes={nodeTypes as unknown as NodeTypes}
    fitView
    snapGrid={[15, 15]}
    on:nodeclick={handleNodeClick}
    on:nodedragstop={handleNodeDragStop}
    on:paneclick={handlePaneClick}
  >
    <!-- Flow controls (zoom, fit, etc.) -->
    <Controls />

    <!-- Background pattern -->
    <Background />

    <!-- Mini map for navigation -->
    <MiniMap nodeStrokeWidth={3} />
  </SvelteFlow>
</div>

<style lang="scss">
  .flow-canvas {
    width: 100%;
    height: 100%;
    background-color: var(--bulma-scheme-main);
    position: relative;
  }

  /* Override Svelte Flow styles to match Bulma theme */
  :global(.svelte-flow) {
    background-color: var(--bulma-scheme-main);
  }

  :global(.svelte-flow__minimap) {
    background-color: var(--bulma-scheme-main);
    border: 1px solid var(--bulma-border);
  }

  :global(.svelte-flow__edge-path) {
    stroke: var(--bulma-link);
  }

  :global(.svelte-flow__edge.animated path) {
    stroke-dasharray: 5;
    animation: dashdraw 0.5s linear infinite;
  }

  @keyframes dashdraw {
    to {
      stroke-dashoffset: -10;
    }
  }
</style>
