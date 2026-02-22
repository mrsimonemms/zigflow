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
  import { exportToYaml } from '$lib/export/yaml';
  import {
    addForkBranch,
    addNode,
    addSwitchBranch,
    addWorkflow,
    createForkNode,
    createLoopNode,
    createSetNode,
    createSwitchNode,
    createTryNode,
    createWaitNode,
    createWorkflowFile,
    insertNode,
    moveNode,
    removeNode,
    replaceNode,
    setWorkflowRoot,
  } from '$lib/tasks/actions';
  import type {
    FlowGraph,
    Node,
    NodeType,
    WorkflowFile,
  } from '$lib/tasks/model';
  import Breadcrumb from '$lib/ui/Breadcrumb.svelte';
  import Canvas from '$lib/ui/Canvas.svelte';
  import Inspector from '$lib/ui/Inspector.svelte';
  import Sidebar from '$lib/ui/Sidebar.svelte';

  // ---------------------------------------------------------------------------
  // Workflow state (IR)
  // ---------------------------------------------------------------------------

  // Demo file: a sequential workflow with varied node types.
  function buildDemoFile(): WorkflowFile {
    const file = createWorkflowFile({
      dsl: '1.0.0',
      namespace: 'demo',
      name: 'my-workflow',
      version: '0.0.1',
      title: 'Demo Workflow',
    });

    const rootId = file.order[0]!;

    // Build a FlowGraph with representative nodes
    let root: FlowGraph = { nodes: {}, order: [] };

    const greet = createSetNode('greet', { message: 'Hello, World!' });
    root = addNode(root, greet);

    const pause = createWaitNode('pause', { duration: { seconds: 5 } });
    root = addNode(root, pause);

    let switchNode = createSwitchNode('route');
    switchNode = addSwitchBranch(
      switchNode,
      'fast-path',
      '${ $input.fast == true }',
    );
    switchNode = addSwitchBranch(switchNode, 'default');
    root = addNode(root, switchNode);

    let fork = createForkNode('parallel-work');
    fork = addForkBranch(fork, 'branch-a');
    fork = addForkBranch(fork, 'branch-b');
    root = addNode(root, fork);

    const tryNode = createTryNode('safe-call');
    root = addNode(root, tryNode);

    const loop = createLoopNode('process-items', '${ $input.items }');
    root = addNode(root, loop);

    return {
      ...file,
      workflows: {
        ...file.workflows,
        [rootId]: { ...file.workflows[rootId]!, root },
      },
    };
  }

  // Build the initial file outside reactive context so downstream $state
  // initialisers can reference it without triggering Svelte's warning about
  // capturing reactive values in non-reactive initialisers.
  const _initialFile = buildDemoFile();
  const _initialWorkflowId = _initialFile.order[0]!;

  let workflowFile = $state<WorkflowFile>(_initialFile);

  // ---------------------------------------------------------------------------
  // Navigation state (UI-only — which FlowGraph is currently visible)
  // ---------------------------------------------------------------------------

  type NavEntry =
    | { kind: 'workflow'; workflowId: string }
    | { kind: 'switch-branch'; nodeId: string; branchId: string }
    | { kind: 'fork-branch'; nodeId: string; branchId: string }
    | { kind: 'try-section'; nodeId: string; section: 'try' | 'catch' }
    | { kind: 'loop-body'; nodeId: string };

  let selectedWorkflowId = $state<string>(_initialWorkflowId);
  let navStack = $state<NavEntry[]>([
    { kind: 'workflow', workflowId: _initialWorkflowId },
  ]);
  let selectedNodeId = $state<string | null>(null);

  // ---------------------------------------------------------------------------
  // Derive the current FlowGraph from the navigation stack
  // ---------------------------------------------------------------------------

  function resolveGraph(
    file: WorkflowFile,
    stack: NavEntry[],
  ): FlowGraph | null {
    if (stack.length === 0) return null;

    const root = stack[0];
    if (root.kind !== 'workflow') return null;

    const wf = file.workflows[root.workflowId];
    if (!wf) return null;

    let graph: FlowGraph = wf.root;

    for (const entry of stack.slice(1)) {
      if (entry.kind === 'switch-branch') {
        const node = graph.nodes[entry.nodeId];
        if (!node || node.type !== 'switch') return null;
        const branch = node.branches.find((b) => b.id === entry.branchId);
        if (!branch) return null;
        graph = branch.graph;
      } else if (entry.kind === 'fork-branch') {
        const node = graph.nodes[entry.nodeId];
        if (!node || node.type !== 'fork') return null;
        const branch = node.branches.find((b) => b.id === entry.branchId);
        if (!branch) return null;
        graph = branch.graph;
      } else if (entry.kind === 'try-section') {
        const node = graph.nodes[entry.nodeId];
        if (!node || node.type !== 'try') return null;
        graph =
          entry.section === 'catch'
            ? (node.catchGraph ?? node.tryGraph)
            : node.tryGraph;
      } else if (entry.kind === 'loop-body') {
        const node = graph.nodes[entry.nodeId];
        if (!node || node.type !== 'loop') return null;
        graph = node.bodyGraph;
      } else {
        return null;
      }
    }

    return graph;
  }

  const currentGraph = $derived(resolveGraph(workflowFile, navStack));

  // ---------------------------------------------------------------------------
  // Breadcrumb labels
  // ---------------------------------------------------------------------------

  function buildCrumbs(file: WorkflowFile, stack: NavEntry[]): string[] {
    return stack.map((entry, i) => {
      if (entry.kind === 'workflow') {
        return file.workflows[entry.workflowId]?.name ?? entry.workflowId;
      }
      // For nested entries, look up the node name from the previous graph
      const parentGraph = resolveGraph(file, stack.slice(0, i));
      if (!parentGraph) return entry.kind;
      const node = parentGraph.nodes[entry.nodeId];
      if (!node) return entry.kind;
      switch (entry.kind) {
        case 'switch-branch': {
          const branch =
            node.type === 'switch'
              ? node.branches.find((b) => b.id === entry.branchId)
              : null;
          return `${node.name} › ${branch?.label ?? entry.branchId}`;
        }
        case 'fork-branch': {
          const branch =
            node.type === 'fork'
              ? node.branches.find((b) => b.id === entry.branchId)
              : null;
          return `${node.name} › ${branch?.label ?? entry.branchId}`;
        }
        case 'try-section':
          return `${node.name} › ${entry.section}`;
        case 'loop-body':
          return `${node.name} › body`;
      }
    });
  }

  const breadcrumbs = $derived(buildCrumbs(workflowFile, navStack));

  // ---------------------------------------------------------------------------
  // Selected node (resolved from current graph)
  // ---------------------------------------------------------------------------

  const selectedNode = $derived<Node | null>(
    selectedNodeId && currentGraph
      ? (currentGraph.nodes[selectedNodeId] ?? null)
      : null,
  );

  // ---------------------------------------------------------------------------
  // Event handlers
  // ---------------------------------------------------------------------------

  function handleWorkflowSelect(id: string) {
    selectedWorkflowId = id;
    navStack = [{ kind: 'workflow', workflowId: id }];
    selectedNodeId = null;
  }

  function handleAddWorkflow() {
    workflowFile = addWorkflow(workflowFile, 'new-workflow');
    const newId = workflowFile.order[workflowFile.order.length - 1]!;
    handleWorkflowSelect(newId);
  }

  function handleNodeSelect(nodeId: string | null) {
    selectedNodeId = nodeId;
  }

  function handleNavigate(index: number) {
    navStack = navStack.slice(0, index + 1);
    selectedNodeId = null;
  }

  function handleInsert(nodeType: NodeType) {
    workflowFile = insertNode(workflowFile, selectedWorkflowId, nodeType);
  }

  // Apply a FlowGraph transform at whatever depth the navStack currently points
  // to, threading the result back up through the IR to produce a new WorkflowFile.
  function updateCurrentGraph(transform: (g: FlowGraph) => FlowGraph): void {
    const stack = navStack;
    if (stack.length === 0) return;
    const top = stack[0];
    if (top.kind !== 'workflow') return;
    const wfId = top.workflowId;
    const wf = workflowFile.workflows[wfId];
    if (!wf) return;

    function applyAt(graph: FlowGraph, depth: number): FlowGraph {
      if (depth >= stack.length) return transform(graph);
      const entry = stack[depth];
      switch (entry.kind) {
        case 'switch-branch': {
          const node = graph.nodes[entry.nodeId];
          if (!node || node.type !== 'switch') return graph;
          const newNode = {
            ...node,
            branches: node.branches.map((b) =>
              b.id === entry.branchId
                ? { ...b, graph: applyAt(b.graph, depth + 1) }
                : b,
            ),
          };
          return replaceNode(graph, newNode);
        }
        case 'fork-branch': {
          const node = graph.nodes[entry.nodeId];
          if (!node || node.type !== 'fork') return graph;
          const newNode = {
            ...node,
            branches: node.branches.map((b) =>
              b.id === entry.branchId
                ? { ...b, graph: applyAt(b.graph, depth + 1) }
                : b,
            ),
          };
          return replaceNode(graph, newNode);
        }
        case 'try-section': {
          const node = graph.nodes[entry.nodeId];
          if (!node || node.type !== 'try') return graph;
          const sub =
            entry.section === 'catch'
              ? (node.catchGraph ?? node.tryGraph)
              : node.tryGraph;
          const updated = applyAt(sub, depth + 1);
          const newNode =
            entry.section === 'catch'
              ? { ...node, catchGraph: updated }
              : { ...node, tryGraph: updated };
          return replaceNode(graph, newNode);
        }
        case 'loop-body': {
          const node = graph.nodes[entry.nodeId];
          if (!node || node.type !== 'loop') return graph;
          return replaceNode(graph, {
            ...node,
            bodyGraph: applyAt(node.bodyGraph, depth + 1),
          });
        }
        default:
          return graph;
      }
    }

    workflowFile = setWorkflowRoot(workflowFile, wfId, applyAt(wf.root, 1));
  }

  function handleDelete() {
    const id = selectedNodeId;
    if (!id) return;
    selectedNodeId = null;
    updateCurrentGraph((g) => removeNode(g, id));
  }

  const selectedNodeIndex = $derived(
    selectedNodeId && currentGraph
      ? currentGraph.order.indexOf(selectedNodeId)
      : -1,
  );
  const canMoveUp = $derived(selectedNodeIndex > 0);
  const canMoveDown = $derived(
    selectedNodeIndex >= 0 &&
      currentGraph !== null &&
      selectedNodeIndex < currentGraph.order.length - 1,
  );

  function handleMoveUp() {
    const id = selectedNodeId;
    if (!id || !canMoveUp) return;
    updateCurrentGraph((g) => moveNode(g, id, selectedNodeIndex - 1));
  }

  function handleMoveDown() {
    const id = selectedNodeId;
    if (!id || !canMoveDown) return;
    updateCurrentGraph((g) => moveNode(g, id, selectedNodeIndex + 1));
  }

  // ---------------------------------------------------------------------------
  // YAML export
  // ---------------------------------------------------------------------------

  let exportOutput = $state<string>('');
  let exportError = $state<string>('');
  let showExport = $state(false);

  function handleExport() {
    const result = exportToYaml(workflowFile);
    if (result.ok) {
      exportOutput = result.yaml;
      exportError = '';
    } else {
      exportOutput = '';
      exportError = result.errors.join('\n');
    }
    showExport = true;
  }
</script>

<div class="editor-root">
  <!-- Sidebar: document + workflow list -->
  <Sidebar
    file={workflowFile}
    {selectedWorkflowId}
    onworkflowselect={handleWorkflowSelect}
    onaddworkflow={handleAddWorkflow}
  />

  <!-- Main area: breadcrumb + canvas + inspector -->
  <div class="editor-main">
    <div class="editor-topbar">
      <Breadcrumb crumbs={breadcrumbs} onnavigate={handleNavigate} />
      <button class="export-btn" onclick={handleExport} type="button">
        Export YAML
      </button>
    </div>

    <div class="editor-canvas-area">
      {#if currentGraph !== null}
        <Canvas
          graph={currentGraph}
          {selectedNodeId}
          onnodeselect={handleNodeSelect}
          oninsert={handleInsert}
        />
      {:else}
        <div class="canvas-placeholder">No graph to display.</div>
      {/if}

      <Inspector
        node={selectedNode}
        {canMoveUp}
        {canMoveDown}
        onmoveup={handleMoveUp}
        onmovedown={handleMoveDown}
        ondelete={handleDelete}
      />
    </div>
  </div>
</div>

<!-- YAML export overlay -->
{#if showExport}
  <div
    class="export-overlay"
    role="dialog"
    aria-modal="true"
    aria-label="YAML export"
  >
    <div class="export-dialog">
      <div class="export-dialog-header">
        <h2>Exported YAML</h2>
        <button
          class="export-close-btn"
          onclick={() => {
            showExport = false;
          }}
          type="button"
          aria-label="Close">✕</button
        >
      </div>
      {#if exportError}
        <pre class="export-error">{exportError}</pre>
      {:else}
        <pre class="export-code">{exportOutput}</pre>
      {/if}
    </div>
  </div>
{/if}

<style>
  .editor-root {
    height: 100vh;
    display: flex;
    overflow: hidden;
    font-family: system-ui, sans-serif;
  }

  .editor-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .editor-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #eee;
    background: #fff;
    padding-right: 1rem;
  }

  .export-btn {
    padding: 0.3rem 0.75rem;
    background: #1a56cc;
    color: #fff;
    border: none;
    border-radius: 6px;
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
  }

  .export-btn:hover {
    background: #1344a8;
  }

  .editor-canvas-area {
    flex: 1;
    display: flex;
    overflow: hidden;
  }

  .canvas-placeholder {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #888;
    font-size: 0.9rem;
  }

  /* Export overlay */
  .export-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .export-dialog {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    width: min(720px, 90vw);
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .export-dialog-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid #eee;
  }

  .export-dialog-header h2 {
    margin: 0;
    font-size: 1rem;
  }

  .export-close-btn {
    background: none;
    border: none;
    font-size: 1rem;
    cursor: pointer;
    color: #666;
    padding: 0.25rem;
    line-height: 1;
  }

  .export-code,
  .export-error {
    flex: 1;
    margin: 0;
    padding: 1rem 1.25rem;
    overflow-y: auto;
    font-size: 0.8rem;
    white-space: pre-wrap;
    font-family: 'Courier New', monospace;
  }

  .export-error {
    color: #c0392b;
    background: #fff5f5;
  }
</style>
