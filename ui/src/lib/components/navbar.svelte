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
  import { resolve } from '$app/paths';
  import { divider, type ILink } from '$lib/interfaces/link';

  function splitPath(input: string): { dir: string; file: string } {
    const lastSlash = input.lastIndexOf('/');

    return {
      dir: lastSlash === -1 ? '' : input.slice(0, lastSlash),
      file: input.slice(lastSlash + 1),
    };
  }

  // @todo(sje): get path from props
  const filePath = '/Home/file.yaml';
  const { dir, file: fileName } = splitPath(filePath);
  const fileSteps = dir.split('/').filter((i) => i);

  const fileMenu: (Omit<ILink, 'url'> | typeof divider)[] = [
    {
      icon: 'pencil',
      label: 'Rename',
    },
    {
      icon: 'arrow-left-top',
      label: 'Move',
    },
    {
      icon: 'content-copy',
      label: 'Duplicate',
    },
    {
      icon: 'history',
      label: 'Versions',
    },
    divider,
    {
      icon: 'trash-can-outline',
      label: 'Delete',
      class: 'has-text-danger',
    },
  ];
</script>

<nav class="navbar" aria-label="main navigation dropdown">
  <div class="navbar-menu">
    <div class="navbar-start">
      <a href={resolve('/workflows')} class="navbar-item">/</a>
      {#each fileSteps as step, key (key)}
        <a href={resolve('/workflows/Home')} class="navbar-item">
          <span class="icon-text">
            <span class="icon">
              <i class="mdi mdi-folder"></i>
            </span>
            <span>{step}</span>
          </span>
        </a>
      {/each}
      <div class="navbar-item has-dropdown is-hoverable">
        <!-- svelte-ignore a11y_missing_attribute -->
        <a class="navbar-link">
          <span class="icon-text">
            <span class="icon">
              <i class="mdi mdi-file-outline"></i>
            </span>
            <span>{fileName}</span>
          </span>
        </a>
        <div class="navbar-dropdown">
          {#each fileMenu as item, key (key)}
            {#if item === divider}
              <hr class="navbar-divider" />
            {:else}
              <a href={resolve('/')} class="navbar-item">
                <span class="icon-text {item.class} is-block">
                  <span class="icon">
                    <i class="mdi mdi-{item.icon}"></i>
                  </span>
                  <span>{item.label}</span>
                </span>
              </a>
            {/if}
          {/each}
        </div>
      </div>
    </div>
  </div>
</nav>

<style lang="scss" scoped>
  .navbar {
    border: {
      bottom: {
        color: var(--bulma-grey-lighter);
        style: solid;
        width: 1px;
      }
    }
  }
</style>
