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
  import type { WaitTaskData } from '$lib/core/graph/types';

  let { data }: { data: WaitTaskData & { label: string; selected?: boolean } } =
    $props();

  // Format wait duration
  function formatDuration(wait: WaitTaskData['wait']): string {
    if (!wait) return 'unknown';
    if (typeof wait === 'string') return wait;

    const parts: string[] = [];
    if (wait.days) parts.push(`${wait.days}d`);
    if (wait.hours) parts.push(`${wait.hours}h`);
    if (wait.minutes) parts.push(`${wait.minutes}m`);
    if (wait.seconds) parts.push(`${wait.seconds}s`);
    if (wait.milliseconds) parts.push(`${wait.milliseconds}ms`);

    return parts.length > 0 ? parts.join(' ') : 'unknown';
  }
</script>

<BaseTaskNode type="wait" label={data.label} selected={data.selected || false}>
  <div class="node-details">
    {#if data.wait}
      <div class="detail-item">
        <span class="detail-label">Duration:</span>
        <span class="detail-value duration">{formatDuration(data.wait)}</span>
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

    &.duration {
      font-family: monospace;
      background-color: var(--bulma-info-light);
      color: var(--bulma-info-dark);
      padding: 0 4px;
      border-radius: 3px;
      font-weight: 600;
      font-size: 0.75rem;
    }
  }
</style>
