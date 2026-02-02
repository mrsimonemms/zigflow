# Developer Guide - Zigflow Visual Workflow Editor

This guide explains the architecture, design decisions, and how to extend the
Zigflow Visual Workflow Editor.

## Architecture Overview

The editor follows a **clean architecture** with strict separation of
concerns:

```text
┌─────────────────────────────────────────────┐
│              UI Layer (Svelte)              │
│  Components, Routes, Visual Presentation    │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│          State Management (Stores)          │
│   workflow-store, editor-store, etc.        │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│         Core Logic (Pure TypeScript)        │
│  Graph Model, Converters, Validation        │
└─────────────────────────────────────────────┘
```

### Key Principles

1. **Graph IR is Source of Truth**: All operations work on the graph model,
   not UI state
2. **Immutability**: State updates create new objects rather than mutating
3. **Type Safety**: TypeScript strict mode, discriminated unions for task
   types
4. **Testability**: Core logic has zero UI dependencies
5. **Performance**: Memoization, throttling, debouncing for large graphs
6. **Manual Sync**: Explicit sync between YAML and visual views

## Directory Structure

```text
ui/
├── src/
│   ├── lib/
│   │   ├── core/                    # Core logic (no Svelte)
│   │   │   ├── schema/              # JSON Schema validation
│   │   │   │   └── validator.ts
│   │   │   ├── graph/               # Graph data model
│   │   │   │   ├── types.ts         # TypeScript interfaces
│   │   │   │   ├── graph-model.ts   # CRUD operations
│   │   │   │   └── node-definitions.ts
│   │   │   └── converters/          # YAML ↔ Graph
│   │   │       ├── yaml-to-graph.ts
│   │   │       ├── graph-to-yaml.ts
│   │   │       └── *.test.ts        # Unit tests
│   │   ├── components/
│   │   │   ├── flow/                # Visual canvas
│   │   │   │   ├── FlowCanvas.svelte
│   │   │   │   ├── node-registry.ts
│   │   │   │   └── nodes/           # 12 task type nodes
│   │   │   ├── inspector/           # Property inspector
│   │   │   │   ├── Inspector.svelte
│   │   │   │   ├── panels/          # Task config panels
│   │   │   │   └── fields/          # Reusable form fields
│   │   │   ├── editor/              # Toolbar, YAML editor
│   │   │   └── common/              # Shared components
│   │   ├── stores/                  # Svelte stores
│   │   │   ├── workflow-store.ts
│   │   │   ├── editor-store.ts
│   │   │   ├── validation-store.ts
│   │   │   └── toast-store.ts
│   │   └── utils/                   # Utilities
│   │       ├── debounce.ts
│   │       └── throttle.ts
│   ├── routes/
│   │   ├── +page.svelte             # Main editor page
│   │   └── api/                     # API endpoints
│   │       └── workflows/
│   │           ├── save/+server.ts
│   │           ├── load/+server.ts
│   │           └── validate/+server.ts
│   └── styles/                      # Global styles
├── static/
│   └── schema.yaml                  # Serverless Workflow schema
└── tests/                           # Integration tests
```

## Core Concepts

### 1. Graph Intermediate Representation (IR)

The graph IR is the central data model:

```typescript
interface WorkflowGraph {
  nodes: BaseNode[]; // All workflow tasks
  edges: FlowEdge[]; // Connections between tasks
  metadata: WorkflowMetadata; // document section from YAML
}

interface BaseNode {
  id: NodeId; // UUID
  type: TaskType; // One of 12 task types
  label: string; // Task name from YAML
  position: Position; // Visual position (x, y)
  data: TaskData; // Task-specific configuration
}
```

**Why UUID IDs?**

- Stable across edits and serialization
- Enable reliable undo/redo
- Simplify edge connections

**Why discriminated unions for TaskData?**

- Type-safe access to task-specific fields
- Compile-time validation of task configurations
- Easy to extend with new task types

### 2. YAML ↔ Graph Converters

#### YamlToGraphConverter

Parses Serverless Workflow YAML into graph IR:

```typescript
class YamlToGraphConverter {
  convert(yamlString: string): WorkflowGraph {
    // 1. Parse YAML using js-yaml
    // 2. Extract document metadata
    // 3. Convert do section to nodes and edges
    // 4. Handle nested tasks (do, fork, try, for)
    // 5. Auto-layout nodes vertically
    // 6. Return graph IR
  }
}
```

**Key Design Decisions:**

- **Preserves all fields**: Unknown fields are kept in `data.raw`
- **Auto-layout**: Simple vertical layout with configurable spacing
- **Nested tasks**: Flattened into parent-child relationships
- **Error handling**: Throws detailed errors for invalid YAML

#### GraphToYamlConverter

Serializes graph IR back to YAML:

```typescript
class GraphToYamlConverter {
  convert(graph: WorkflowGraph): string {
    // 1. Rebuild document section from metadata
    // 2. Sort nodes by topological order (edges)
    // 3. Rebuild nested task structures
    // 4. Serialize to YAML string
    // 5. Return formatted YAML
  }
}
```

**Key Design Decisions:**

- **Topological sort**: Ensures tasks are in correct order
- **Structure rebuilding**: Reconstructs nested do/fork/try/for
- **Format preservation**: Uses js-yaml's clean output format
- **Comment loss**: Cannot preserve YAML comments (js-yaml limitation)

### 3. State Management

#### workflow-store

The main store for graph state:

```typescript
const workflowStore = createWorkflowStore();

// CRUD operations
workflowStore.addNode(node);
workflowStore.updateNode(nodeId, updates);
workflowStore.removeNode(nodeId);
workflowStore.addEdge(edge);
workflowStore.removeEdge(edgeId);

// YAML operations
workflowStore.loadFromYaml(yamlString);
workflowStore.exportToYaml(graph);

// Undo/redo
workflowStore.undo();
workflowStore.redo();
```

**History Management:**

- Maintains up to 50 history entries
- Deep clones graphs for immutability
- Flags undo/redo operations to skip history tracking

**Performance Optimization:**

- Shared converter instances
- Memoized YAML serialization (caches last result)
- Reference equality check to avoid unnecessary conversions

#### editor-store

UI state management:

```typescript
const editorStore = {
  viewMode: 'visual' | 'yaml',
  syncPending: boolean,
  isDirty: boolean,
  yamlContent: string,
};
```

#### validation-store

Validation results:

```typescript
const validationStore = {
  status: 'valid' | 'invalid' | 'unknown',
  errors: ValidationError[]
};
```

### 4. Visual Canvas (Svelte Flow)

The visual canvas uses `@xyflow/svelte` for node rendering and interactions:

```svelte
<SvelteFlow
  nodes={flowNodes}
  edges={flowEdges}
  {nodeTypes}
  on:nodeclick={handleNodeClick}
  on:nodedragstop={handleNodeDragStop}
/>
```

**Custom Node Components:**

- Each of the 12 task types has a custom node component
- Styled with Bulma CSS + task-specific colors
- Handles for incoming/outgoing edges
- Shows task-specific icon and summary

**Performance Considerations:**

- Uses Svelte's $effect() for reactive updates
- Throttled position updates during drag (100ms)
- Memoized node/edge conversions

### 5. Property Inspector

The inspector shows task-specific configuration forms:

```text
┌─────────────────────────┐
│  Inspector              │
├─────────────────────────┤
│  Task: callApi          │
│  Type: call             │
├─────────────────────────┤
│  ┌─ CallPanel ────────┐ │
│  │ Function: http     │ │
│  │ Method: [GET  ▼]   │ │
│  │ Endpoint: [____]   │ │
│  │ ...                │ │
│  └────────────────────┘ │
└─────────────────────────┘
```

**Reusable Form Fields:**

- `TextField.svelte`: Simple text input
- `SelectField.svelte`: Dropdown selection
- `KeyValueEditor.svelte`: Key-value pairs (headers, variables)
- `DurationField.svelte`: ISO 8601 duration input
- `ObjectEditor.svelte`: JSON object editing

## Adding a New Task Type

If Serverless Workflow adds a new task type, follow these steps:

### 1. Update TypeScript Types

```typescript
// src/lib/core/graph/types.ts

export type TaskType =
  | 'call' | 'do' | 'emit' | 'for' | 'fork' | 'listen'
  | 'raise' | 'run' | 'set' | 'switch' | 'try' | 'wait'
  | 'newtask'; // Add here

interface NewTaskData {
  type: 'newtask';
  // Add task-specific fields
  foo: string;
  bar: number;
  raw?: Record<string, unknown>; // Preserve unknown fields
}

export type TaskData =
  | CallTaskData | DoTaskData | ...
  | NewTaskData; // Add to union
```

### 2. Update YAML Parser

```typescript
// src/lib/core/converters/yaml-to-graph.ts

private parseTask(name: string, taskDef: unknown): BaseNode {
  // ...
  if ('newtask' in taskObj) {
    return this.parseNewTask(name, taskObj.newtask);
  }
  // ...
}

private parseNewTask(name: string, config: unknown): BaseNode {
  const data: NewTaskData = {
    type: 'newtask',
    foo: config.foo,
    bar: config.bar,
    raw: this.preserveUnknownFields(config, ['foo', 'bar'])
  };

  return {
    id: this.generateId(),
    type: 'newtask',
    label: name,
    position: this.nextPosition(),
    data
  };
}
```

### 3. Update YAML Serializer

```typescript
// src/lib/core/converters/graph-to-yaml.ts

private serializeTask(node: BaseNode): Record<string, unknown> {
  if (node.type === 'newtask') {
    return {
      newtask: {
        foo: node.data.foo,
        bar: node.data.bar,
        ...node.data.raw // Restore unknown fields
      }
    };
  }
  // ...
}
```

### 4. Create Node Component

```svelte
<!-- src/lib/components/flow/nodes/NewTaskNode.svelte -->

<script lang="ts">
  import type { NewTaskData } from '$lib/core/graph/types';

  let { data }: { data: NewTaskData } = $props();
</script>

<div class="node newtask-node" class:selected={data.selected}>
  <div class="node-icon">🆕</div>
  <div class="node-label">{data.label}</div>
  <div class="node-summary">{data.foo}</div>
</div>

<style>
  .newtask-node {
    background: var(--bulma-info);
    border: 2px solid var(--bulma-info-dark);
    padding: 1rem;
    border-radius: 8px;
  }
</style>
```

### 5. Register Node Type

```typescript
// src/lib/components/flow/node-registry.ts

import NewTaskNode from './nodes/NewTaskNode.svelte';

export const nodeTypes = {
  call: CallNode,
  do: DoNode,
  // ...
  newtask: NewTaskNode, // Add here
};
```

### 6. Create Inspector Panel

```svelte
<!-- src/lib/components/inspector/panels/NewTaskPanel.svelte -->

<script lang="ts">
  import TextField from '../fields/TextField.svelte';
  import type { NewTaskData } from '$lib/core/graph/types';

  let {
    data,
    onupdate,
  }: {
    data: NewTaskData;
    onupdate: (updates: Partial<NewTaskData>) => void;
  } = $props();
</script>

<div class="panel">
  <TextField
    label="Foo"
    value={data.foo}
    onchange={(value) => onupdate({ foo: value })}
  />

  <TextField
    label="Bar"
    value={String(data.bar)}
    type="number"
    onchange={(value) => onupdate({ bar: Number(value) })}
  />
</div>
```

### 7. Update Inspector

In `src/lib/components/inspector/Inspector.svelte`, add the import and panel:

```typescript
import NewTaskPanel from './panels/NewTaskPanel.svelte';
```

Then in the template section, add the panel mapping:

```svelte
{#if node.type === 'newtask'}
  <NewTaskPanel data={node.data} onupdate={handleUpdate} />
{/if}
```

### 8. Write Tests

```typescript
// src/lib/core/converters/yaml-to-graph.test.ts

it('should parse newtask', () => {
  const yaml = `
document:
  dsl: 1.0.0
  namespace: zigflow
  name: test
  version: 0.0.1
do:
  - myTask:
      newtask:
        foo: hello
        bar: 42
`;

  const graph = converter.convert(yaml);

  expect(graph.nodes).toHaveLength(1);
  expect(graph.nodes[0].type).toBe('newtask');
  expect(graph.nodes[0].data.type).toBe('newtask');
  if (graph.nodes[0].data.type === 'newtask') {
    expect(graph.nodes[0].data.foo).toBe('hello');
    expect(graph.nodes[0].data.bar).toBe(42);
  }
});
```

## Performance Optimization

### Debouncing YAML Changes

The YAML editor debounces changes to reduce updates:

```typescript
const debouncedSetYamlContent = debounce((content: string) => {
  editorStore.setYamlContent(content);
}, 300);
```

### Throttling Position Updates

Node dragging throttles position updates:

```typescript
const throttledPositionUpdate = throttle(
  (nodeId: string, position: Position) => {
    workflowStore.updateNodePosition(nodeId, position);
  },
  100
);
```

### Memoized YAML Conversion

The workflow store caches YAML conversion results:

```typescript
let lastGraph: WorkflowGraph | null = null;
let lastYaml = '';

export const workflowYaml = derived(workflowStore, ($workflow) => {
  if ($workflow === lastGraph) {
    return lastYaml; // Return cached result
  }

  const yaml = converter.convert($workflow);
  lastGraph = $workflow;
  lastYaml = yaml;
  return yaml;
});
```

### Large Graph Recommendations

For workflows with 100+ nodes:

1. **Use pagination**: Split large workflows into sub-workflows
2. **Lazy load panels**: Only render visible nodes in inspector
3. **Increase throttle delays**: Adjust throttle/debounce timings
4. **Consider virtualization**: Use virtual scrolling for node lists

## Testing

### Unit Tests

Test converters and core logic:

```bash
npm run test
```

### Watch Mode

```bash
npm run test:watch
```

### Writing Tests

```typescript
import { describe, it, expect } from 'vitest';

describe('MyFeature', () => {
  it('should do something', () => {
    // Arrange
    const input = /* ... */;

    // Act
    const result = myFunction(input);

    // Assert
    expect(result).toBe(expected);
  });
});
```

### Test Coverage

Run tests with coverage:

```bash
npx vitest run --coverage
```

## Debugging

### Enable Verbose Logging

```typescript
// In converter files
console.log('Parsing task:', taskName, taskDef);
```

### Inspect Graph State

```typescript
// In browser console
$workflowStore; // Current graph
$workflowYaml; // Current YAML
$editorStore; // UI state
```

### Common Issues

#### "Schema not loaded"

- Check `/static/schema.yaml` exists
- Ensure schema is valid YAML
- Check network tab for 404 errors

#### "Failed to parse YAML"

- Validate YAML syntax (use yamllint)
- Check for required fields in `document`
- Ensure task types are correctly spelled

#### "Edges not connecting"

- Verify node IDs match
- Check edge source/target are valid node IDs
- Ensure edges array is not empty

## Code Style

### TypeScript

- Use strict mode
- Prefer interfaces over types for object shapes
- Use discriminated unions for polymorphism
- Document complex functions with JSDoc

### Svelte

- Use Svelte 5 runes ($state, $derived, $effect, $props)
- Prefer composition over inheritance
- Keep components focused (single responsibility)
- Use TypeScript for all component scripts

### Formatting

```bash
npm run format  # Format with Prettier
npm run lint    # Lint with ESLint
```

## Deployment

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm run preview
```

### Docker

```bash
docker build -t zigflow-ui .
docker run -p 3000:3000 -v /data:/data zigflow-ui
```

## Resources

- [Serverless Workflow DSL](https://serverlessworkflow.io/)
- [Svelte 5 Documentation](https://svelte.dev/docs/svelte/overview)
- [Svelte Flow](https://svelteflow.dev/)
- [Vitest](https://vitest.dev/)
- [Bulma CSS](https://bulma.io/)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Submit a pull request

## License

Apache License 2.0 - See LICENSE for details.
