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
  import type { EmitTaskData } from '$lib/core/graph/types';

  let { data }: { data: EmitTaskData & { label: string; selected?: boolean } } =
    $props();
</script>

<BaseTaskNode type="emit" label={data.label} selected={data.selected || false}>
  <div class="node-details">
    {#if data.emit?.event?.with}
      <div class="detail-item">
        <span class="detail-label">Event:</span>
        <span class="detail-value">{data.emit.event.with.type || 'custom'}</span
        >
      </div>
      {#if data.emit.event.with.source}
        <div class="detail-item">
          <span class="detail-label">Source:</span>
          <span class="detail-value">{data.emit.event.with.source}</span>
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
