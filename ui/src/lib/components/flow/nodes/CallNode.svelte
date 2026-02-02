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
  import type { CallTaskData } from '$lib/core/graph/types';

  // Svelte Flow node data
  let { data }: { data: CallTaskData & { label: string; selected?: boolean } } =
    $props();
</script>

<BaseTaskNode type="call" label={data.label} selected={data.selected || false}>
  <div class="node-details">
    <div class="detail-item">
      <span class="detail-label">Call:</span>
      <span class="detail-value">{data.call}</span>
    </div>
    {#if data.with && 'endpoint' in data.with}
      <div class="detail-item">
        <span class="detail-label">Endpoint:</span>
        <span class="detail-value">{data.with.endpoint}</span>
      </div>
      {#if 'method' in data.with && typeof data.with.method === 'string'}
        <div class="detail-item">
          <span class="detail-label">Method:</span>
          <span class="detail-value method"
            >{data.with.method.toUpperCase()}</span
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

    &.method {
      padding: 0 4px;
      border-radius: 3px;
      background-color: var(--bulma-info-light);
      color: var(--bulma-info-dark);
      font-weight: 600;
      font-size: 0.75rem;
    }
  }
</style>
