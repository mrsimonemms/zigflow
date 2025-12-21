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
  import Logo from '$lib/components/logo.svelte';
  import Footer from '$lib/components/footer.svelte';
  import TaskSidebar from '$lib/components/task-sidebar.svelte';
  import Navbar from '$lib/components/navbar.svelte';

  let { children } = $props();
</script>

<div class="columns is-flex-grow-1 is-gapless">
  <!-- Sidebar -->
  <div class="sidebar column is-2">
    <Logo />

    <TaskSidebar />
  </div>

  <!-- Main column -->
  <div class="column is-flex is-flex-direction-column">
    <Navbar />
    <div class="is-flex-grow-1">
      {@render children?.()}
    </div>

    <Footer />
  </div>
</div>

<style lang="scss" scoped>
  .columns.is-gapless:not(:last-child) {
    margin: {
      bottom: 0;
    }
  }

  .sidebar {
    border: {
      right: {
        color: var(--bulma-grey-lighter);
        style: solid;
        width: 1px;
      }
    }
  }
</style>
