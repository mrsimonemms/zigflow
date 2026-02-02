# Zigflow Visual Workflow Editor

A drag-and-drop visual editor for creating and editing
[Serverless Workflow DSL](https://serverlessworkflow.io/) workflows,
specifically designed for Zigflow.

## Features

- **Visual Flow Canvas**: Drag-and-drop interface for workflow design
- **Bi-directional Editing**: Toggle between visual graph and YAML views
- **Full DSL Support**: All 12 Serverless Workflow task types supported
- **JSON Schema Validation**: Real-time validation against the Serverless
  Workflow schema
- **File System Persistence**: Save and load workflows to/from the file system
- **Undo/Redo**: Full history management for all edits
- **Property Inspector**: Edit task configurations in a side panel
- **Toast Notifications**: User-friendly feedback for all operations
- **Keyboard Shortcuts**: Streamlined workflow with Ctrl+S, Ctrl+Z, Ctrl+Y

## Supported Task Types

The editor supports all 12 Serverless Workflow task types:

1. **call** - Call external services (HTTP, OpenAPI, AsyncAPI, gRPC)
2. **do** - Group tasks for sequential execution
3. **emit** - Emit events to the workflow engine
4. **for** - Iterate over collections
5. **fork** - Execute tasks in parallel
6. **listen** - Wait for external events
7. **raise** - Raise errors
8. **run** - Execute containers, scripts, or shells
9. **set** - Set workflow variables
10. **switch** - Conditional branching
11. **try** - Error handling with catch blocks
12. **wait** - Pause execution

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Docker (optional, for containerized deployment)

### Installation

```bash
cd ui
npm install
```

### Development

```bash
npm run dev
```

The editor will be available at `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

## Usage

### Creating a New Workflow

1. The editor starts with a simple "Hello World" example workflow
2. You can modify it in either **Visual** or **YAML** mode
3. Use the **Property Inspector** (right sidebar) to edit task details

### Switching Between Views

Click the **Visual** or **YAML** buttons in the toolbar to toggle between modes.

**Important**: Changes in one view are not automatically reflected in the
other. Click the **Sync** button to manually synchronize:

- **Visual → YAML**: Updates YAML content with current visual graph
- **YAML → Visual**: Parses YAML and updates visual graph

### Saving Workflows

1. Click the **Save** button or press `Ctrl+S` (Windows/Linux) or `Cmd+S` (Mac)
2. Enter a filename (must end with `.yaml` or `.yml`)
3. The workflow will be saved to the `/data/drafts/` directory

To publish a workflow (save to `/data/published/`), modify the save handler
in the code.

### Loading Workflows

1. Click the **Load** button
2. Enter the filename of a previously saved workflow
3. The editor will search for the file in both `published` and `drafts` directories

### Validating Workflows

Click the **Validate** button to check your workflow against the JSON Schema.
Validation errors will appear in the **Validation Panel** at the bottom right.

### Editing Task Properties

1. Click on any node in the visual canvas to select it
2. The **Property Inspector** (right sidebar) will show task-specific
   configuration fields
3. Edit the fields and changes are applied immediately to the graph

### Keyboard Shortcuts

- `Ctrl+S` (or `Cmd+S` on Mac): Save workflow
- `Ctrl+Z` (or `Cmd+Z` on Mac): Undo last change
- `Ctrl+Y` (or `Cmd+Shift+Z` on Mac): Redo undone change

### Undo/Redo

The editor maintains a history of up to 50 changes. Use the **Undo** and
**Redo** buttons in the toolbar, or use keyboard shortcuts.

## Architecture

The editor follows a clean architecture with separation of concerns:

- **Core Logic** (`src/lib/core/`): Graph model, converters, validation (no UI dependencies)
- **Components** (`src/lib/components/`): Reusable Svelte components for UI
- **Stores** (`src/lib/stores/`): State management using Svelte stores
- **Routes** (`src/routes/`): SvelteKit pages and API endpoints

### Data Flow

```text
YAML File → Parser → Graph IR (source of truth) → UI Components
                                ↓
                         Serializer → YAML File
```

The **Graph Intermediate Representation (IR)** is the single source of truth.
All state mutations operate on this graph, ensuring predictable behavior and
testability.

## API Endpoints

The editor includes SvelteKit API endpoints for server-side operations:

### POST /api/workflows/save

Save a workflow to the file system.

**Request Body:**

```json
{
  "filename": "my-workflow.yaml",
  "content": "document:\n  dsl: 1.0.0\n...",
  "publish": false
}
```

**Response:**

```json
{
  "success": true,
  "filepath": "/data/drafts/my-workflow.yaml",
  "message": "Workflow saved to drafts directory"
}
```

### GET /api/workflows/load?filename=my-workflow.yaml

Load a workflow from the file system. Searches in `published` first, then `drafts`.

**Response:**

```json
{
  "success": true,
  "filename": "my-workflow.yaml",
  "content": "document:\n  dsl: 1.0.0\n...",
  "source": "drafts"
}
```

### POST /api/workflows/validate

Validate a workflow against the JSON Schema.

**Request Body:**

```json
{
  "content": "document:\n  dsl: 1.0.0\n..."
}
```

**Response:**

```json
{
  "success": true,
  "validation": {
    "status": "valid",
    "errors": []
  }
}
```

## Configuration

### Environment Variables

- `DATA_DIR`: Base directory for saving workflows (default: `/data`)

### Schema File

The editor uses `/static/schema.yaml` for validation. This file is
automatically copied from `/docs/static/schema.yaml` during build.

## Testing

### Unit Tests

```bash
npm run test
```

Runs unit tests for converters and core logic using Vitest.

### Watch Mode

```bash
npm run test:watch
```

Runs tests in watch mode for development.

### Test Coverage

The test suite includes:

- **Unit tests**: All 12 task types, error handling, edge cases
- **Integration tests**: Round-trip conversion (YAML → Graph → YAML)
- **Example workflows**: All 24 example workflows from `/examples`

## Troubleshooting

### Schema Not Loaded

If you see "Schema not loaded yet" when trying to validate:

1. Check that `/static/schema.yaml` exists
2. Restart the development server
3. Check browser console for errors

### Validation Errors

Common validation errors:

- **Missing required fields**: Ensure all required fields in the `document`
  section are present
- **Invalid task structure**: Each task must have exactly one task type field
  (e.g., `set`, `call`, `wait`)
- **Type mismatches**: Ensure values match the expected types (string, number,
  object, array)

### Sync Issues

If changes don't appear after switching views:

1. Click the **Sync** button explicitly to synchronize
2. The sync button will highlight when views are out of sync

## Contributing

See the main repository [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines.

## License

Apache License 2.0 - See [LICENSE](../LICENSE) for details.
