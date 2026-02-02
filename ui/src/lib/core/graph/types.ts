/*
 * Copyright 2025 - 2026 Zigflow authors <https://github.com/mrsimonemms/zigflow/graphs/contributors>
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

// Core type definitions for the Zigflow workflow graph IR
// Based on Serverless Workflow DSL 1.0 schema

export type NodeId = string;
export type EdgeId = string;

// Visual position for nodes on canvas
export interface Position {
  x: number;
  y: number;
}

// Task type discriminator - all 12 Serverless Workflow task types
export type TaskType =
  | 'call'
  | 'do'
  | 'fork'
  | 'emit'
  | 'for'
  | 'listen'
  | 'raise'
  | 'run'
  | 'set'
  | 'switch'
  | 'try'
  | 'wait';

// Base node interface (all workflow tasks extend this)
export interface BaseNode {
  id: NodeId;
  type: TaskType;
  label: string; // Task name from YAML
  position: Position;
  data: TaskData;
}

// Task data is a discriminated union based on type
export type TaskData =
  | CallTaskData
  | DoTaskData
  | ForkTaskData
  | EmitTaskData
  | ForTaskData
  | ListenTaskData
  | RaiseTaskData
  | RunTaskData
  | SetTaskData
  | SwitchTaskData
  | TryTaskData
  | WaitTaskData;

// ============================================================================
// Common task properties (taskBase from schema)
// ============================================================================

export interface TaskBase {
  if?: string; // Runtime expression for conditional execution
  input?: InputConfig;
  output?: OutputConfig;
  export?: ExportConfig;
  timeout?: TimeoutConfig | string; // Inline or reference
  then?: FlowDirective;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Call Task (HTTP, gRPC, OpenAPI, AsyncAPI, Function, etc.)
// ============================================================================

export interface CallTaskData extends TaskBase {
  type: 'call';
  call: string; // 'http', 'grpc', 'openapi', 'asyncapi', 'a2a', 'mcp', or function name
  with?: CallTaskWith;
}

export type CallTaskWith =
  | HttpCallArgs
  | GrpcCallArgs
  | OpenApiCallArgs
  | AsyncApiCallArgs
  | A2ACallArgs
  | McpCallArgs
  | FunctionCallArgs;

export interface HttpCallArgs {
  method: string;
  endpoint: string | Endpoint;
  headers?: Record<string, string> | string;
  body?: unknown;
  query?: Record<string, string> | string;
  output?: 'raw' | 'content' | 'response';
  redirect?: boolean;
}

export interface GrpcCallArgs {
  proto: ExternalResource;
  service: {
    name: string;
    host: string;
    port?: number;
    authentication?: AuthenticationPolicy | { use: string };
  };
  method: string;
  arguments?: Record<string, unknown>;
}

export interface OpenApiCallArgs {
  document: ExternalResource;
  operationId: string;
  parameters?: Record<string, unknown>;
  authentication?: AuthenticationPolicy | { use: string };
  output?: 'raw' | 'content' | 'response';
  redirect?: boolean;
}

export interface AsyncApiCallArgs {
  document: ExternalResource;
  channel?: string;
  operation?: string;
  server?: {
    name: string;
    variables?: Record<string, unknown>;
  };
  protocol?: string;
  message?: {
    payload?: Record<string, unknown>;
    headers?: Record<string, unknown>;
  };
  subscription?: unknown;
  authentication?: AuthenticationPolicy | { use: string };
}

export interface A2ACallArgs {
  agentCard?: ExternalResource;
  server?: string | Endpoint;
  method: string;
  parameters?: Record<string, unknown> | string;
}

export interface McpCallArgs {
  protocolVersion?: string;
  method: string;
  parameters?: Record<string, unknown> | string;
  timeout?: Duration;
  transport: unknown;
  client?: {
    name: string;
    description?: string;
  };
}

// Custom function arguments (dynamic key-value pairs)
export type FunctionCallArgs = Record<string, unknown>;

// ============================================================================
// Do Task (Sequential execution)
// ============================================================================

export interface DoTaskData extends TaskBase {
  type: 'do';
  do: TaskListItem[];
}

// ============================================================================
// Fork Task (Parallel execution)
// ============================================================================

export interface ForkTaskData extends TaskBase {
  type: 'fork';
  fork: {
    branches: TaskListItem[];
    compete?: boolean;
  };
}

// ============================================================================
// Emit Task (Event emission)
// ============================================================================

export interface EmitTaskData extends TaskBase {
  type: 'emit';
  emit: {
    event: {
      with: EventProperties;
    };
  };
}

// ============================================================================
// For Task (Iteration)
// ============================================================================

export interface ForTaskData extends TaskBase {
  type: 'for';
  for: {
    each?: string; // Variable name for current item
    in: string; // Collection expression
    at?: string; // Variable name for index
  };
  while?: string; // Continue condition
  do: TaskListItem[];
}

// ============================================================================
// Listen Task (Event consumption)
// ============================================================================

export interface ListenTaskData extends TaskBase {
  type: 'listen';
  listen: {
    to: EventConsumptionStrategy;
    read?: 'data' | 'envelope' | 'raw';
  };
  foreach?: SubscriptionIterator;
}

// ============================================================================
// Raise Task (Error raising)
// ============================================================================

export interface RaiseTaskData extends TaskBase {
  type: 'raise';
  raise: {
    error: Error | string; // Inline or reference
  };
}

// ============================================================================
// Run Task (Container, Script, Shell, Workflow execution)
// ============================================================================

export interface RunTaskData extends TaskBase {
  type: 'run';
  run: RunTaskConfig;
}

export type RunTaskConfig =
  | ContainerRunConfig
  | ScriptRunConfig
  | ShellRunConfig
  | WorkflowRunConfig;

export interface ContainerRunConfig {
  await?: boolean;
  return?: 'stdout' | 'stderr' | 'code' | 'all' | 'none';
  container: {
    image: string;
    name?: string;
    command?: string;
    ports?: Record<string, unknown>;
    volumes?: Record<string, unknown>;
    environment?: Record<string, string>;
    stdin?: string;
    arguments?: string[];
    lifetime?: {
      cleanup: 'always' | 'never' | 'eventually';
      after?: Duration;
    };
  };
}

export interface ScriptRunConfig {
  await?: boolean;
  return?: 'stdout' | 'stderr' | 'code' | 'all' | 'none';
  script: {
    language: string;
    code?: string; // Inline script
    source?: ExternalResource; // External script
    stdin?: string;
    arguments?: string[];
    environment?: Record<string, string>;
  };
}

export interface ShellRunConfig {
  await?: boolean;
  return?: 'stdout' | 'stderr' | 'code' | 'all' | 'none';
  shell: {
    command: string;
    stdin?: string;
    arguments?: string[];
    environment?: Record<string, string>;
  };
}

export interface WorkflowRunConfig {
  await?: boolean;
  return?: 'stdout' | 'stderr' | 'code' | 'all' | 'none';
  workflow: {
    namespace: string;
    name: string;
    version?: string;
    input?: Record<string, unknown>;
  };
}

// ============================================================================
// Set Task (State mutation)
// ============================================================================

export interface SetTaskData extends TaskBase {
  type: 'set';
  set: Record<string, unknown> | string;
}

// ============================================================================
// Switch Task (Conditional branching)
// ============================================================================

export interface SwitchTaskData extends TaskBase {
  type: 'switch';
  switch: SwitchCase[];
}

export interface SwitchCase {
  [caseName: string]: {
    when?: string; // Condition expression
    then: FlowDirective;
  };
}

// ============================================================================
// Try Task (Error handling)
// ============================================================================

export interface TryTaskData extends TaskBase {
  type: 'try';
  try: TaskListItem[];
  catch: {
    errors?: {
      with: ErrorFilter;
    };
    as?: string; // Variable name for caught error
    when?: string; // Catch condition
    exceptWhen?: string; // Negative catch condition
    retry?: RetryPolicy | string;
    do?: TaskListItem[];
  };
}

// ============================================================================
// Wait Task (Delay)
// ============================================================================

export interface WaitTaskData extends TaskBase {
  type: 'wait';
  wait: Duration;
}

// ============================================================================
// Supporting types
// ============================================================================

export interface FlowEdge {
  id: EdgeId;
  source: NodeId;
  target: NodeId;
  sourceHandle?: string; // For switch cases
  targetHandle?: string;
  label?: string;
  type?: 'default' | 'conditional' | 'error';
}

export interface WorkflowGraph {
  nodes: BaseNode[];
  edges: FlowEdge[];
  metadata: WorkflowMetadata;
}

export interface WorkflowMetadata {
  dsl: string;
  namespace: string;
  name: string;
  version: string;
  title?: string;
  summary?: string;
  tags?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

// Task list item (used in do, fork, try, for)
export interface TaskListItem {
  [taskName: string]: Omit<TaskData, 'type'>;
}

// Flow directive (continue, exit, end, or task reference)
export type FlowDirective = 'continue' | 'exit' | 'end' | string;

// Duration (ISO 8601 or object)
export type Duration =
  | string
  | {
      days?: number;
      hours?: number;
      minutes?: number;
      seconds?: number;
      milliseconds?: number;
    };

// Input configuration
export interface InputConfig {
  schema?: Schema;
  from?: string | Record<string, unknown>;
}

// Output configuration
export interface OutputConfig {
  schema?: Schema;
  as?: string | Record<string, unknown>;
}

// Export configuration
export interface ExportConfig {
  schema?: Schema;
  as?: string | Record<string, unknown>;
}

// Timeout configuration
export interface TimeoutConfig {
  after: Duration;
}

// Schema definition
export interface Schema {
  format?: string;
  document?: unknown; // Inline schema
  resource?: ExternalResource; // External schema
}

// External resource
export interface ExternalResource {
  name?: string;
  endpoint: string | Endpoint;
}

// Endpoint
export interface Endpoint {
  uri: string;
  authentication?: AuthenticationPolicy | { use: string };
}

// Authentication policy
export type AuthenticationPolicy =
  | { basic: BasicAuth | { use: string } }
  | { bearer: BearerAuth | { use: string } }
  | { digest: DigestAuth | { use: string } }
  | { oauth2: OAuth2Auth | { use: string } }
  | { oidc: OAuth2Auth | { use: string } };

export interface BasicAuth {
  username: string;
  password: string;
}

export interface BearerAuth {
  token: string;
}

export interface DigestAuth {
  username: string;
  password: string;
}

export interface OAuth2Auth {
  authority: string;
  grant: string;
  client: {
    id: string;
    secret?: string;
    assertion?: string;
    authentication?: string;
  };
  request?: {
    encoding?: 'application/x-www-form-urlencoded' | 'application/json';
  };
  issuers?: string[];
  scopes?: string[];
  audiences?: string[];
  username?: string;
  password?: string;
  subject?: OAuth2Token;
  actor?: OAuth2Token;
  endpoints?: {
    token?: string;
    revocation?: string;
    introspection?: string;
  };
}

export interface OAuth2Token {
  token: string;
  type: string;
}

// Event properties
export interface EventProperties {
  id?: string;
  source: string;
  type: string;
  time?: string;
  subject?: string;
  datacontenttype?: string;
  dataschema?: string;
  data?: unknown;
  [key: string]: unknown;
}

// Event consumption strategy
export type EventConsumptionStrategy =
  | { all: EventFilter[] }
  | { any: EventFilter[]; until?: string | EventConsumptionStrategy }
  | { one: EventFilter };

// Event filter
export interface EventFilter {
  with: EventProperties;
  correlate?: Record<
    string,
    {
      from: string;
      expect?: string;
    }
  >;
}

// Subscription iterator
export interface SubscriptionIterator {
  item?: string;
  at?: string;
  do?: TaskListItem[];
  output?: OutputConfig;
  export?: ExportConfig;
}

// Error definition
export interface Error {
  type: string;
  status: number;
  instance?: string;
  title?: string;
  detail?: string;
}

// Error filter
export interface ErrorFilter {
  type?: string;
  status?: number;
  instance?: string;
  title?: string;
  details?: string;
}

// Retry policy
export interface RetryPolicy {
  when?: string;
  exceptWhen?: string;
  delay?: Duration;
  backoff?:
    | { constant: Record<string, never> }
    | { exponential: Record<string, never> }
    | { linear: Record<string, never> };
  limit?: {
    attempt?: {
      count?: number;
      duration?: Duration;
    };
    duration?: Duration;
  };
  jitter?: {
    from: Duration;
    to: Duration;
  };
}
