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
  import type { TryTaskData } from '$lib/core/graph/types';

  let { data }: { data: TryTaskData & { label: string; selected?: boolean } } =
    $props();
</script>

<BaseTaskNode type="try" label={data.label} selected={data.selected || false}>
  <div class="node-details">
    {#if data.try && Array.isArray(data.try)}
      <div class="detail-item">
        <span class="detail-label">Try:</span>
        <span class="detail-value">{data.try.length} task(s)</span>
      </div>
    {/if}
    {#if data.catch}
      <div class="detail-item">
        <span class="badge catch">Has Catch</span>
      </div>
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

  .badge {
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 0.7rem;
    font-weight: 600;

    &.catch {
      background-color: var(--bulma-danger-light);
      color: var(--bulma-danger-dark);
    }
  }
</style>
