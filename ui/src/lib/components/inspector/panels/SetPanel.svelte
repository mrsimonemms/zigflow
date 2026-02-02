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
  import type { BaseNode, SetTaskData } from '$lib/core/graph/types';
  import KeyValueEditor from '../fields/KeyValueEditor.svelte';

  let {
    node,
    onupdate,
  }: {
    node: BaseNode;
    onupdate: (data: Partial<SetTaskData>) => void;
  } = $props();

  const data = $derived(node.data as SetTaskData);

  function handleSetChange(value: Record<string, unknown>) {
    onupdate({ set: value });
  }
</script>

<div class="set-panel">
  <KeyValueEditor
    label="Variables"
    value={typeof data.set === 'object' ? data.set : {}}
    help="Set variables in the workflow context"
    onchange={handleSetChange}
  />

  <div class="notification is-info is-light">
    <p>
      <strong>Tip:</strong> Values can be runtime expressions using $&#123; &#125;
      syntax.
    </p>
  </div>
</div>

<style lang="scss">
  .set-panel {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
</style>
