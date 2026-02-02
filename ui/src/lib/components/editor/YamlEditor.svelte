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

  // Props
  let {
    value = $bindable(''),
    readonly = false,
    onchange,
  }: {
    value?: string;
    readonly?: boolean;
    onchange?: (value: string) => void;
  } = $props();

  function handleInput(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    value = target.value;
    onchange?.(value);
  }
</script>

<div class="yaml-editor">
  <textarea
    class="yaml-textarea"
    {value}
    {readonly}
    spellcheck="false"
    oninput={handleInput}
    placeholder="Enter YAML workflow definition..."
  ></textarea>
</div>

<style lang="scss">
  .yaml-editor {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: var(--bulma-scheme-main);
  }

  .yaml-textarea {
    width: 100%;
    height: 100%;
    padding: 1rem;
    font-family: 'Courier New', Courier, monospace;
    font-size: 0.9rem;
    line-height: 1.5;
    background-color: var(--bulma-scheme-main);
    color: var(--bulma-text);
    border: none;
    outline: none;
    resize: none;
    tab-size: 2;

    &:focus {
      background-color: var(--bulma-scheme-main);
    }

    &[readonly] {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }
</style>
