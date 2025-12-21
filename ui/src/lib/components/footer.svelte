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
  /* eslint-disable svelte/no-navigation-without-resolve */
  import type { ILink } from '$lib/interfaces/link';

  const icons: ILink[] = [
    {
      icon: 'home',
      url: 'https://zigflow.dev',
      label: 'Homepage',
    },
    {
      icon: 'github',
      url: 'https://github.com/mrsimonemms/zigflow',
      label: 'Source',
    },
  ];

  const startYear = 2025;
  const currentYear = new Date().getFullYear();

  let copyrightYear = $state(`${startYear}`);
  if (currentYear > startYear) {
    copyrightYear += ` - ${currentYear}`;
  }
</script>

<footer class="footer p-5 is-size-7">
  <div class="columns is-vcentered">
    <div class="column">
      <p>
        &copy;
        <a
          href="https://github.com/mrsimonemms/zigflow/blob/main/AUTHORS"
          target="_blank"
        >
          Zigflow Authors
        </a>
        {copyrightYear} | Released under
        <a
          href="https://github.com/mrsimonemms/zigflow/blob/main/LICENSE"
          target="_blank">Apache 2.0 licence</a
        >
      </p>
    </div>
    <div class="column has-text-right">
      {#each icons as item, key (key)}
        {#if key > 0}
          <span class="ml-5"></span>
        {/if}
        <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
        <a
          rel="external noopener noreferrer"
          href={item.url}
          style="color: currentColor"
          target="_blank"
          aria-label={item.label}
        >
          {#if item.icon}
            <span class="icon">
              <i class="mdi mdi-24px mdi-{item.icon}"></i>
            </span>
          {/if}
        </a>
      {/each}
    </div>
  </div>
</footer>
