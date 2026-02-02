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
  import type { BaseNode, CallTaskData } from '$lib/core/graph/types';
  import SelectField from '../fields/SelectField.svelte';
  import TextField from '../fields/TextField.svelte';
  import KeyValueEditor from '../fields/KeyValueEditor.svelte';

  let {
    node,
    onupdate,
  }: {
    node: BaseNode;
    onupdate: (data: Partial<CallTaskData>) => void;
  } = $props();

  const data = $derived(node.data as CallTaskData);

  // Call type options
  const callTypes = [
    { value: 'http', label: 'HTTP' },
    { value: 'grpc', label: 'gRPC' },
    { value: 'openapi', label: 'OpenAPI' },
    { value: 'asyncapi', label: 'AsyncAPI' },
    { value: 'a2a', label: 'Agent-to-Agent' },
    { value: 'mcp', label: 'MCP' },
  ];

  // HTTP methods
  const httpMethods = [
    { value: 'get', label: 'GET' },
    { value: 'post', label: 'POST' },
    { value: 'put', label: 'PUT' },
    { value: 'patch', label: 'PATCH' },
    { value: 'delete', label: 'DELETE' },
    { value: 'head', label: 'HEAD' },
    { value: 'options', label: 'OPTIONS' },
  ];

  function handleCallTypeChange(value: string) {
    onupdate({ call: value });
  }

  function handleMethodChange(value: string) {
    if (data.with && 'method' in data.with) {
      onupdate({
        with: { ...data.with, method: value },
      });
    }
  }

  function handleEndpointChange(value: string) {
    if (data.with && 'endpoint' in data.with) {
      onupdate({
        with: { ...data.with, endpoint: { uri: value } },
      });
    }
  }

  function handleHeadersChange(value: Record<string, unknown>) {
    if (data.with && 'headers' in data.with) {
      onupdate({
        with: { ...data.with, headers: value },
      });
    }
  }
</script>

<div class="call-panel">
  <SelectField
    label="Call Type"
    value={data.call}
    options={callTypes}
    required
    help="Type of service to call"
    onchange={handleCallTypeChange}
  />

  {#if data.call === 'http' && data.with && 'method' in data.with}
    <SelectField
      label="HTTP Method"
      value={typeof data.with.method === 'string' ? data.with.method : 'get'}
      options={httpMethods}
      required
      onchange={handleMethodChange}
    />

    <TextField
      label="Endpoint"
      value={'endpoint' in data.with &&
      typeof data.with.endpoint === 'object' &&
      data.with.endpoint &&
      'uri' in data.with.endpoint
        ? String(data.with.endpoint.uri)
        : ''}
      placeholder="https://api.example.com/endpoint"
      required
      help="URL to call"
      onchange={handleEndpointChange}
    />

    <KeyValueEditor
      label="Headers"
      value={'headers' in data.with &&
      typeof data.with.headers === 'object' &&
      data.with.headers
        ? (data.with.headers as Record<string, unknown>)
        : {}}
      help="HTTP headers to include in the request"
      onchange={handleHeadersChange}
    />
  {:else}
    <div class="notification is-info is-light">
      <p>
        Configure the <strong>{data.call}</strong> call parameters in the YAML editor.
      </p>
    </div>
  {/if}
</div>

<style lang="scss">
  .call-panel {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
</style>
