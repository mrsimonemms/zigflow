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
  import type { BaseNode, WaitTaskData } from '$lib/core/graph/types';
  import DurationField from '../fields/DurationField.svelte';

  let {
    node,
    onupdate,
  }: {
    node: BaseNode;
    onupdate: (data: Partial<WaitTaskData>) => void;
  } = $props();

  const data = $derived(node.data as WaitTaskData);

  function handleDurationChange(value: Record<string, number>) {
    onupdate({ wait: value });
  }
</script>

<div class="wait-panel">
  <DurationField
    label="Wait Duration"
    value={typeof data.wait === 'object' ? data.wait : {}}
    help="How long to wait before continuing"
    onchange={handleDurationChange}
  />

  <div class="notification is-info is-light">
    <p>
      <strong>Note:</strong> You can specify multiple units (e.g., 2 hours and 30
      minutes).
    </p>
  </div>
</div>

<style lang="scss">
  .wait-panel {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
</style>
