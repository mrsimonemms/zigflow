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

  import BaseTaskNode from './BaseTaskNode.svelte';
  import type { RunTaskData } from '$lib/core/graph/types';

  let { data }: { data: RunTaskData & { label: string; selected?: boolean } } =
    $props();
</script>

<BaseTaskNode type="run" label={data.label} selected={data.selected || false}>
  <div class="node-details">
    {#if data.run}
      {#if typeof data.run === 'string'}
        <div class="detail-item">
          <span class="detail-label">Container:</span>
          <span class="detail-value">{data.run}</span>
        </div>
      {:else if 'container' in data.run}
        <div class="detail-item">
          <span class="detail-label">Container:</span>
          <span class="detail-value">{data.run.container.image}</span>
        </div>
      {:else if 'shell' in data.run}
        <div class="detail-item">
          <span class="detail-label">Shell:</span>
          <span class="detail-value"
            >{typeof data.run.shell === 'string'
              ? data.run.shell
              : 'script'}</span
          >
        </div>
      {:else if 'script' in data.run}
        <div class="detail-item">
          <span class="detail-label">Script:</span>
          <span class="detail-value"
            >{typeof data.run.script === 'string'
              ? data.run.script
              : 'inline'}</span
          >
        </div>
      {:else if 'workflow' in data.run}
        <div class="detail-item">
          <span class="detail-label">Workflow:</span>
          <span class="detail-value"
            >{typeof data.run.workflow === 'string'
              ? data.run.workflow
              : 'reference'}</span
          >
        </div>
      {/if}
    {/if}
  </div>
</BaseTaskNode>

<style lang="scss">
  .node-details {
    font-size: 0.8rem;
    color: var(--bulma-text);
  }

  .detail-item {
    margin-bottom: 4px;
    display: flex;
    gap: 6px;
  }

  .detail-label {
    font-weight: 600;
    color: var(--bulma-text-strong);
  }

  .detail-value {
    color: var(--bulma-text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
