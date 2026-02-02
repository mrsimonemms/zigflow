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
    value = $bindable<Record<string, number>>({}),
    help,
    error,
    onchange,
  }: {
    label: string;
    value?: Record<string, number>;
    help?: string;
    error?: string;
    onchange?: (value: Record<string, number>) => void;
  } = $props();

  // Duration units
  const units = [
    { key: 'days', label: 'Days' },
    { key: 'hours', label: 'Hours' },
    { key: 'minutes', label: 'Minutes' },
    { key: 'seconds', label: 'Seconds' },
    { key: 'milliseconds', label: 'Milliseconds' },
  ];

  function handleChange(unit: string, newValue: string) {
    const numValue = parseInt(newValue, 10);
    if (!isNaN(numValue) && numValue > 0) {
      value = { ...value, [unit]: numValue };
    } else {
      // Remove the unit from the value object
      const newVal = { ...value };
      delete newVal[unit];
      value = newVal;
    }
    onchange?.(value);
  }
</script>

<div class="field">
  <div class="label">{label}</div>
  {#if help && !error}
    <p class="help">{help}</p>
  {/if}
  {#if error}
    <p class="help is-danger">{error}</p>
  {/if}

  <div class="duration-fields">
    {#each units as unit}
      <div class="duration-field">
        <label class="label is-small">
          {unit.label}
          <input
            class="input is-small"
            type="number"
            min="0"
            placeholder="0"
            value={value[unit.key] || ''}
            oninput={(e) => handleChange(unit.key, e.currentTarget.value)}
          />
        </label>
      </div>
    {/each}
  </div>
</div>

<style lang="scss">
  .field {
    margin-bottom: 1rem;
  }

  .duration-fields {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  .duration-field {
    .label {
      margin-bottom: 0.25rem;
      font-size: 0.85rem;
    }
  }
</style>
