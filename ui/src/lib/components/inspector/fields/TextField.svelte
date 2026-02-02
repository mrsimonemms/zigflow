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
  let {
    label,
    value = $bindable(''),
    placeholder = '',
    required = false,
    readonly = false,
    help,
    error,
    onchange,
  }: {
    label: string;
    value?: string;
    placeholder?: string;
    required?: boolean;
    readonly?: boolean;
    help?: string;
    error?: string;
    onchange?: (value: string) => void;
  } = $props();

  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    value = target.value;
    onchange?.(value);
  }
</script>

<div class="field">
  <label class="label">
    {label}
    {#if required}
      <span class="has-text-danger">*</span>
    {/if}
    <div class="control">
      <input
        class="input"
        class:is-danger={error}
        type="text"
        {placeholder}
        {readonly}
        {value}
        oninput={handleInput}
      />
    </div>
  </label>
  {#if help && !error}
    <p class="help">{help}</p>
  {/if}
  {#if error}
    <p class="help is-danger">{error}</p>
  {/if}
</div>

<style lang="scss">
  .field {
    margin-bottom: 1rem;
  }
</style>
