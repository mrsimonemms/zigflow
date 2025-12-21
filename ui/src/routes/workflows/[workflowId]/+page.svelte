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
  /* eslint-disable svelte/no-at-html-tags */

  import PageTitle from '$lib/components/page-title.svelte';
  import {
    Background,
    Controls,
    ControlButton,
    type DefaultEdgeOptions,
    type Edge,
    type Node,
    SvelteFlow,
  } from '@xyflow/svelte';
  import hljs from 'highlight.js/lib/core';
  import yamlLang from 'highlight.js/lib/languages/yaml';
  import { nodeTypes } from '$lib/components/nodes';
  import { edgeTypes } from '$lib/components/edges';
  import { nodes as nodesStore } from '$lib/stores/nodes';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();

  hljs.registerLanguage('yaml', yamlLang);

  let source = $state.raw<string>('');
  let nodes = $state.raw<Node[]>([]);
  let edges = $state<Edge[]>([]);
  $effect(() => {
    nodes = data.nodes;
    edges = data.edges;
  });

  const defaultEdgeOptions: DefaultEdgeOptions = {
    animated: true,
    type: 'smoothstep',
  };

  let displaySource = $state(false);

  nodesStore.subscribe(async (sourceId?: string) => {
    if (sourceId) {
      data.generator.addNode(sourceId);
      // Unset the value of the node store
      nodesStore.set(undefined);

      const resp = await data.generator.build();

      nodes = resp.nodes;
      edges = resp.edges;
    }
  });

  function viewSource() {
    source = data.generator.generateSource();
    displaySource = true;
  }
</script>

<PageTitle title="Workflow Editor" />

<div class="viewport" class:is-hidden={displaySource}>
  <SvelteFlow
    bind:nodes
    bind:edges
    fitView
    {defaultEdgeOptions}
    {edgeTypes}
    {nodeTypes}
    proOptions={{ hideAttribution: true }}
  >
    <Controls>
      <ControlButton onclick={viewSource}>
        <span class="icon">
          <i class="mdi mdi-code-tags"></i>
        </span>
      </ControlButton>
    </Controls>
    <Background />
  </SvelteFlow>
</div>

<div class="source" class:is-hidden={!displaySource}>
  <button
    onclick={() => (displaySource = !displaySource)}
    class="button mt-5 ml-5 is-primary"
  >
    Back to editor
  </button>

  <section class="section">
    <pre><code class="hljs"
        >{@html hljs.highlight(source, { language: 'yaml' }).value}</code
      ></pre>
  </section>
</div>

<style lang="scss" scoped>
  .source {
    pre {
      padding: 0;
    }
  }

  .viewport {
    width: 100%;
    height: 100%;
  }
</style>
