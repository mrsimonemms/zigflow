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

  // Make isDirectory reactive so it updates when navigating
  const isDirectory = $derived(props.data.type === 'directory');
  const workflowId = props.data.workflowId;

  let nodeId = $state(5); // Counter for generating unique node IDs

  let nodes = $state.raw<Node[]>([]);
  let edges = $state.raw<Edge[]>([]);

  // Update nodes and edges when data changes
  $effect(() => {
    if (props.data.type === 'workflow') {
      nodes = props.data.graph.nodes;
      edges = props.data.graph.edges;
    } else {
      nodes = [];
      edges = [];
    }
  });

  // Track selected node
  const selectedNode = $derived(nodes.find((node) => node.selected));

  // Handle closing the settings panel by deselecting all nodes
  function handleCloseSettings() {
    nodes = nodes.map((node) => ({ ...node, selected: false }));
  }
</script>

{#if isDirectory}
  <div class="directory-list">
    <h1>Directory: {props.data.type === 'directory' ? props.data.currentPath || '/' : '/'}</h1>

    {#if props.data.type === 'directory' && props.data.entries.length === 0}
      <p>Directory empty</p>
    {:else if props.data.type === 'directory'}
      <ul>
        {#each props.data.entries as entry}
          <li>
            <a href="/workflows/{entry.path}">
              {entry.name}{entry.isDirectory ? '/' : ''}
            </a>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
{:else}
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
{/if}

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

  .directory-list {
    padding: $spacing-lg;
  }

  .directory-list h1 {
    margin: 0 0 $spacing-lg 0;
  }

  .directory-list ul {
    list-style: none;
    padding: 0;
  }

  .directory-list li {
    margin: $spacing-sm 0;
  }

  .directory-list a {
    color: $color-text;
    text-decoration: none;
  }

  .directory-list a:hover {
    text-decoration: underline;
  }
</style>
