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
  import icon from '$lib/assets/zigflow.png';
  import { resolve } from '$app/paths';
</script>

<nav class="navbar" aria-label="main navigation dropdown">
  <div class="navbar-brand" style:width="100%">
    <a
      class="navbar-item is-justify-content-center"
      href={resolve('/')}
      aria-label="Home"
    >
      <img src={icon} alt="Home" />
    </a>
  </div>
</nav>

<style lang="scss" scoped>
  .navbar {
    .navbar-brand {
      .navbar-item {
        width: 100%;
      }
    }
  }
</style>
