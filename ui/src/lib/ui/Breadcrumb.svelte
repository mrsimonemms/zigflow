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
  // ---------------------------------------------------------------------------
  // Props
  //
  // crumbs is an ordered list of labels representing the current navigation
  // path. Index 0 is the root. Clicking a crumb navigates up to that level.
  // ---------------------------------------------------------------------------

  interface Props {
    crumbs: string[];
    onnavigate?: (index: number) => void;
  }

  let { crumbs, onnavigate }: Props = $props();
</script>

<nav class="breadcrumb" aria-label="Navigation path">
  {#each crumbs as label, index (index)}
    {#if index > 0}
      <span class="breadcrumb-sep" aria-hidden="true">›</span>
    {/if}

    {#if index < crumbs.length - 1}
      <button
        class="breadcrumb-item breadcrumb-item--link"
        onclick={() => onnavigate?.(index)}
        type="button"
      >
        {label}
      </button>
    {:else}
      <span class="breadcrumb-item breadcrumb-item--current">
        {label}
      </span>
    {/if}
  {/each}
</nav>

<style>
  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.375rem 1rem;
    border-bottom: 1px solid #eee;
    background: #fff;
    font-size: 0.8rem;
    color: #555;
    min-height: 2rem;
  }

  .breadcrumb-sep {
    color: #bbb;
  }

  .breadcrumb-item {
    padding: 0;
    background: none;
    border: none;
    font-size: inherit;
    font-family: inherit;
  }

  .breadcrumb-item--link {
    color: #1a56cc;
    cursor: pointer;
    text-decoration: none;
  }

  .breadcrumb-item--link:hover {
    text-decoration: underline;
  }

  .breadcrumb-item--current {
    color: #333;
    font-weight: 500;
  }
</style>
