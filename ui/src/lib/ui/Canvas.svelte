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
  import type { FlowGraph } from '$lib/tasks/model';
  import { Background, Controls, SvelteFlow } from '@xyflow/svelte';
  import '@xyflow/svelte/dist/style.css';
  import { untrack } from 'svelte';

  // ---------------------------------------------------------------------------
  // Props
  // ---------------------------------------------------------------------------

  interface Props {
    graph: FlowGraph;
    selectedNodeId?: string | null;
    onnodeselect?: (nodeId: string | null) => void;
  }

  let { graph, selectedNodeId = null, onnodeselect }: Props = $props();

  // ---------------------------------------------------------------------------
  // Layout constants
  // ---------------------------------------------------------------------------

  const NODE_HEIGHT = 60;
  const NODE_WIDTH = 240;
  const VERTICAL_GAP = 40;
  const STRIDE = NODE_HEIGHT + VERTICAL_GAP;
  const CANVAS_CENTER_X = 0;

  // ---------------------------------------------------------------------------
  // Derive SvelteFlow nodes and edges from the FlowGraph IR.
  // Positions are determined by index in order[] — no layout algorithm needed.
  // ---------------------------------------------------------------------------

  function nodeTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      task: 'Task',
      switch: 'Switch',
      fork: 'Fork',
      try: 'Try/Catch',
      loop: 'Loop',
    };
    return labels[type] ?? type;
  }

  // SvelteFlow node shape
  type SFNode = {
    id: string;
    data: { label: string; nodeType: string; typeLabel: string };
    position: { x: number; y: number };
    style: string;
    selected: boolean;
  };

  type SFEdge = {
    id: string;
    source: string;
    target: string;
  };

  function deriveNodes(g: FlowGraph): SFNode[] {
    return g.order.map((id, index) => {
      const node = g.nodes[id]!;
      return {
        id: node.id,
        data: {
          label: node.name,
          nodeType: node.type,
          typeLabel: nodeTypeLabel(node.type),
        },
        position: { x: CANVAS_CENTER_X, y: index * STRIDE },
        style: `width: ${NODE_WIDTH}px; height: ${NODE_HEIGHT}px;`,
        selected: id === selectedNodeId,
      };
    });
  }

  function deriveEdges(g: FlowGraph): SFEdge[] {
    return g.order.slice(0, -1).map((id, index) => ({
      id: `seq-${id}-${g.order[index + 1]}`,
      source: id,
      target: g.order[index + 1]!,
    }));
  }

  // Use untrack() so the initial $state value reads the prop without creating
  // a reactive dependency. The $effect below handles all subsequent updates.
  let nodes = $state(untrack(() => deriveNodes(graph)));
  let edges = $state(untrack(() => deriveEdges(graph)));

  // Resync when graph or selection changes.
  $effect(() => {
    nodes = deriveNodes(graph);
    edges = deriveEdges(graph);
  });

  // ---------------------------------------------------------------------------
  // Selection forwarding
  // `onselectionchange` is a prop callback on the SvelteFlow component.
  // ---------------------------------------------------------------------------

  type SelectionParams = { nodes: { id: string }[]; edges: { id: string }[] };

  function handleSelectionChange(params: SelectionParams) {
    const selected = params.nodes ?? [];
    onnodeselect?.(selected.length > 0 ? (selected[0]?.id ?? null) : null);
  }
</script>

<div class="canvas-root">
  <SvelteFlow
    bind:nodes
    bind:edges
    fitView
    onselectionchange={handleSelectionChange}
  >
    <Background />
    <Controls />
  </SvelteFlow>
</div>

<style>
  .canvas-root {
    width: 100%;
    height: 100%;
    background: #f8f8f8;
  }
</style>
