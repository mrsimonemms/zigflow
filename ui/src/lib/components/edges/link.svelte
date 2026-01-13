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
  import {
    BaseEdge,
    type EdgeProps,
    EdgeLabel,
    getSmoothStepPath,
    Position,
  } from '@xyflow/svelte';
  import { nodes as nodesStore } from '$lib/stores/nodes';

  let {
    id,
    sourceX,
    sourceY,
    sourcePosition = Position.Bottom,
    source,
    targetX,
    targetY,
    targetPosition = Position.Top,
  }: EdgeProps = $props();

  let [edgePath, labelX, labelY] = $derived(
    getSmoothStepPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    }),
  );
</script>

<BaseEdge {id} path={edgePath} />
<EdgeLabel x={labelX} y={labelY}>
  <button onclick={() => nodesStore.set(source)}>&plus;</button>
</EdgeLabel>
