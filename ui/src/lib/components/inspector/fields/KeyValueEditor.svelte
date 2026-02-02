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
    value = $bindable<Record<string, unknown>>({}),
    help,
    onchange,
  }: {
    label: string;
    value?: Record<string, unknown>;
    help?: string;
    onchange?: (value: Record<string, unknown>) => void;
  } = $props();

  // Convert object to array of key-value pairs
  let entries = $state(
    Object.entries(value).map(([key, val]) => ({
      key,
      value: String(val),
      id: Math.random(),
    }))
  );

  // Update value when entries change
  function updateValue() {
    const newValue: Record<string, unknown> = {};
    entries.forEach((entry) => {
      if (entry.key) {
        newValue[entry.key] = entry.value;
      }
    });
    value = newValue;
    onchange?.(newValue);
  }

  function addEntry() {
    entries = [...entries, { key: '', value: '', id: Math.random() }];
  }

  function removeEntry(id: number) {
    entries = entries.filter((e) => e.id !== id);
    updateValue();
  }

  function handleKeyChange(id: number, newKey: string) {
    entries = entries.map((e) => (e.id === id ? { ...e, key: newKey } : e));
    updateValue();
  }

  function handleValueChange(id: number, newValue: string) {
    entries = entries.map((e) => (e.id === id ? { ...e, value: newValue } : e));
    updateValue();
  }
</script>

<div class="field">
  <div class="label">{label}</div>
  {#if help}
    <p class="help">{help}</p>
  {/if}

  <div class="kv-entries">
    {#each entries as entry (entry.id)}
      <div class="kv-entry">
        <input
          class="input is-small"
          type="text"
          placeholder="Key"
          aria-label="Key"
          value={entry.key}
          oninput={(e) => handleKeyChange(entry.id, e.currentTarget.value)}
        />
        <input
          class="input is-small"
          type="text"
          placeholder="Value"
          aria-label="Value"
          value={entry.value}
          oninput={(e) => handleValueChange(entry.id, e.currentTarget.value)}
        />
        <button
          class="button is-small is-danger"
          onclick={() => removeEntry(entry.id)}
          title="Remove"
        >
          ×
        </button>
      </div>
    {/each}
  </div>

  <button class="button is-small is-info" onclick={addEntry}>
    <span class="icon is-small">+</span>
    <span>Add Entry</span>
  </button>
</div>

<style lang="scss">
  .field {
    margin-bottom: 1rem;
  }

  .kv-entries {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .kv-entry {
    display: grid;
    grid-template-columns: 1fr 1fr auto;
    gap: 0.5rem;
    align-items: center;
  }
</style>
