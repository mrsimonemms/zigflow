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
  import FlowCanvas from '$lib/ui/FlowCanvas.svelte';
  import NodeSettings from '$lib/ui/NodeSettings.svelte';
  import Sidebar from '$lib/ui/Sidebar.svelte';
  import { type Edge, type Node, SvelteFlowProvider } from '@xyflow/svelte';
  import '@xyflow/svelte/dist/style.css';

  const props = $props();

  const workflowId = props.data.workflowId;

  let nodeId = $state(5); // Counter for generating unique node IDs

  let nodes = $state.raw<Node[]>(props.data.graph.nodes);

  let edges = $state.raw<Edge[]>(props.data.graph.edges);

  // Track selected node
  const selectedNode = $derived(nodes.find((node) => node.selected));

  // Handle closing the settings panel by deselecting all nodes
  function handleCloseSettings() {
    nodes = nodes.map((node) => ({ ...node, selected: false }));
  }
</script>

<div class="workflow-editor">
  <header>
    <h1>Workflow Editor</h1>
    <p>Workflow ID: <code>{workflowId}</code></p>
  </header>

  <SvelteFlowProvider>
    <div class="editor-layout">
      <Sidebar />
      <FlowCanvas bind:nodes bind:edges bind:nodeId />
      {#if selectedNode}
        <NodeSettings node={selectedNode} onClose={handleCloseSettings} />
      {/if}
    </div>
  </SvelteFlowProvider>
</div>

<style lang="scss">
  @use '../../../styles/tokens' as *;

  .workflow-editor {
    height: 100vh;
    display: flex;
    flex-direction: column;
  }

  header {
    padding: $spacing-lg;
    border-bottom: 1px solid $color-border;
    background-color: $color-bg;

    h1 {
      margin: 0 0 $spacing-xs 0;
    }

    p {
      margin: 0;
    }
  }

  .editor-layout {
    flex: 1;
    display: flex;
    overflow: hidden;
  }
</style>
