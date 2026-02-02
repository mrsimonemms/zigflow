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
  import type { ListenTaskData } from '$lib/core/graph/types';

  let {
    data,
  }: { data: ListenTaskData & { label: string; selected?: boolean } } =
    $props();
</script>

<BaseTaskNode
  type="listen"
  label={data.label}
  selected={data.selected || false}
>
  <div class="node-details">
    {#if data.listen?.to}
      {#if 'any' in data.listen.to && Array.isArray(data.listen.to.any)}
        <div class="detail-item">
          <span class="detail-label">Listen:</span>
          <span class="detail-value"
            >Any of {data.listen.to.any.length} events</span
          >
        </div>
      {:else if 'all' in data.listen.to && Array.isArray(data.listen.to.all)}
        <div class="detail-item">
          <span class="detail-label">Listen:</span>
          <span class="detail-value"
            >All of {data.listen.to.all.length} events</span
          >
        </div>
      {:else if 'one' in data.listen.to && Array.isArray(data.listen.to.one)}
        <div class="detail-item">
          <span class="detail-label">Listen:</span>
          <span class="detail-value"
            >One of {data.listen.to.one.length} events</span
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
  }
</style>
