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
  import type { Node } from '$lib/tasks/model';

  // ---------------------------------------------------------------------------
  // Props
  // ---------------------------------------------------------------------------

  interface Props {
    node: Node | null;
  }

  let { node }: Props = $props();

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  function configSummary(n: Node): string {
    if (n.type !== 'task') return '';
    switch (n.config.kind) {
      case 'set':
        return `Sets ${Object.keys(n.config.assignments).length} variable(s)`;
      case 'call-http':
        return `${n.config.method.toUpperCase()} ${n.config.endpoint}`;
      case 'call-grpc':
        return `${n.config.serviceName}/${n.config.method}`;
      case 'call-activity':
        return n.config.name;
      case 'run-container':
        return n.config.image;
      case 'run-script':
        return `${n.config.language} script`;
      case 'run-shell':
        return n.config.command;
      case 'run-workflow':
        return `${n.config.namespace}/${n.config.name}@${n.config.version}`;
      case 'wait':
        return `Wait ${JSON.stringify(n.config.duration)}`;
      case 'raise':
        return `HTTP ${n.config.errorStatus}`;
      case 'listen':
        return `${n.config.mode} of ${n.config.events.length} event(s)`;
    }
  }

  function structuralSummary(n: Node): string {
    switch (n.type) {
      case 'switch':
        return `${n.branches.length} branch(es)`;
      case 'fork':
        return `${n.branches.length} branch(es)${n.compete ? ' — compete' : ''}`;
      case 'try':
        return ['try', n.catchGraph ? 'catch' : null]
          .filter(Boolean)
          .join(' / ');
      case 'loop':
        return `for each in ${n.in}`;
      default:
        return '';
    }
  }
</script>

<aside class="inspector">
  {#if node === null}
    <p class="inspector-empty">Select a node to inspect it.</p>
  {:else}
    <header class="inspector-header">
      <span class="inspector-type">{node.type}</span>
      <h2 class="inspector-name">{node.name}</h2>
    </header>

    <section class="inspector-section">
      <dl>
        <dt>ID</dt>
        <dd class="mono">{node.id}</dd>

        {#if node.type === 'task'}
          <dt>Kind</dt>
          <dd>{node.config.kind}</dd>
          <dt>Detail</dt>
          <dd>{configSummary(node)}</dd>
          {#if node.if}
            <dt>Condition</dt>
            <dd class="mono">{node.if}</dd>
          {/if}
        {:else}
          <dt>Structure</dt>
          <dd>{structuralSummary(node)}</dd>
          {#if node.if}
            <dt>Condition</dt>
            <dd class="mono">{node.if}</dd>
          {/if}
        {/if}
      </dl>
    </section>

    <p class="inspector-hint">Full editing UI coming soon.</p>
  {/if}
</aside>

<style>
  .inspector {
    width: 260px;
    min-width: 260px;
    border-left: 1px solid #ddd;
    background: #fff;
    display: flex;
    flex-direction: column;
    padding: 1rem;
    overflow-y: auto;
    font-size: 0.875rem;
  }

  .inspector-empty {
    color: #888;
    font-style: italic;
    margin: 0;
  }

  .inspector-header {
    margin-bottom: 1rem;
  }

  .inspector-type {
    display: inline-block;
    background: #e8f0fe;
    color: #1a56cc;
    border-radius: 4px;
    padding: 1px 6px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.25rem;
  }

  .inspector-name {
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
    word-break: break-all;
  }

  .inspector-section {
    flex: 1;
  }

  dl {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.25rem 0.75rem;
    margin: 0;
  }

  dt {
    color: #666;
    font-weight: 500;
    white-space: nowrap;
  }

  dd {
    margin: 0;
    word-break: break-all;
    color: #111;
  }

  .mono {
    font-family: monospace;
    font-size: 0.8em;
    color: #555;
  }

  .inspector-hint {
    margin-top: 1.5rem;
    font-size: 0.75rem;
    color: #999;
    font-style: italic;
  }
</style>
