# Zigflow Workflow Builder - Architecture

## Overview

The Zigflow Workflow Builder is a React-based visual editor for creating CNCF Serverless Workflow v1.x.x compliant workflows that run on Zigflow/Temporal.

## Technology Stack

- **React 18**: UI framework
- **React Flow**: Canvas and node-based editor
- **Zustand**: State management
- **Dexie**: IndexedDB wrapper for persistence
- **js-yaml**: YAML parsing and generation
- **Lucide React**: Icon library
- **Vite**: Build tool and dev server

## Project Structure

```
workflow-builder/
├── public/
│   ├── ziggy.svg              # Logo
│   └── vite.svg               # Vite logo
├── src/
│   ├── components/
│   │   ├── editors/           # Task-specific property editors
│   │   │   ├── SetTaskEditor.jsx
│   │   │   ├── CallTaskEditor.jsx
│   │   │   ├── WaitTaskEditor.jsx
│   │   │   ├── DoTaskEditor.jsx
│   │   │   ├── ForkTaskEditor.jsx
│   │   │   ├── ForTaskEditor.jsx
│   │   │   ├── SwitchTaskEditor.jsx
│   │   │   ├── TryTaskEditor.jsx
│   │   │   ├── ListenTaskEditor.jsx
│   │   │   ├── EmitTaskEditor.jsx
│   │   │   ├── RaiseTaskEditor.jsx
│   │   │   └── RunTaskEditor.jsx
│   │   ├── nodes/
│   │   │   ├── TaskNode.jsx   # Visual node component
│   │   │   └── TaskNode.css
│   │   ├── App.jsx
│   │   ├── Toolbar.jsx        # Top toolbar
│   │   ├── TaskPalette.jsx    # Left sidebar with task types
│   │   ├── WorkflowCanvas.jsx # React Flow canvas
│   │   ├── Sidebar.jsx        # Right sidebar container
│   │   ├── PropertyEditor.jsx # Task property editor
│   │   ├── WorkflowMetadataEditor.jsx
│   │   └── ExportDialog.jsx
│   ├── constants/
│   │   └── taskTypes.js       # Task type definitions
│   ├── db/
│   │   └── workflowDB.js      # IndexedDB operations
│   ├── store/
│   │   └── workflowStore.js   # Zustand state management
│   ├── utils/
│   │   └── uuid.js            # UUID generator
│   ├── main.jsx               # Entry point
│   ├── App.css                # Global styles
│   └── index.css              # Base styles
├── index.html
├── package.json
├── vite.config.js
├── README.md
├── QUICK_START.md
└── ARCHITECTURE.md (this file)
```

## Core Concepts

### State Management (Zustand)

The application uses a single Zustand store (`workflowStore.js`) that manages:

- **Workflow Document**: Metadata (namespace, name, version, etc.)
- **Workflow Configuration**: Input, output, timeout, schedule, use sections
- **Tasks**: Array of task objects with IDs and configurations
- **UI State**: Selected task, nodes, edges

### Task Model

Each task in the store has:
- `id`: Unique identifier (UUID)
- `taskName`: User-defined name
- `taskType`: Type (set, call, wait, etc.)
- `[taskType]`: Task-specific configuration object
- Common properties: `if`, `then`, `input`, `output`, etc.

### React Flow Integration

- **Nodes**: Visual representation of tasks on canvas
- **Edges**: Connections between tasks showing flow
- **Drag & Drop**: Tasks dragged from palette create nodes
- **Handles**: Connection points (top=input, bottom=output)

### Persistence

Tasks and workflows are saved to:
1. **In-Memory**: Zustand store (current session)
2. **IndexedDB**: Via Dexie (persistent across sessions)

### Export Pipeline

1. User clicks Export
2. `generateWorkflow()` transforms store state to spec-compliant structure
3. Converts to YAML or JSON
4. User downloads or copies to clipboard

## Component Architecture

### Top-Level Components

```
App
├── Toolbar (actions: save, export, metadata)
├── TaskPalette (drag source)
├── WorkflowCanvas (React Flow)
│   └── TaskNode (custom node type)
├── Sidebar
│   └── PropertyEditor
│       └── [TaskEditor] (dynamic based on selected task)
└── Modals (conditional)
    ├── WorkflowMetadataEditor
    └── ExportDialog
```

### Data Flow

```
User Action → Component → Store Action → State Update → UI Re-render
                                        ↓
                                   IndexedDB (save)
                                        ↓
                                   Export (YAML/JSON)
```

## Task Editors

Each task type has a dedicated editor component:

- **SetTaskEditor**: JSON object or expression
- **CallTaskEditor**: Supports HTTP, gRPC, OpenAPI, AsyncAPI, A2A, MCP, Function
- **WaitTaskEditor**: Duration configuration
- **DoTaskEditor**: Sequential task list
- **ForkTaskEditor**: Concurrent branches with compete option
- **ForTaskEditor**: Loop configuration
- **SwitchTaskEditor**: Conditional cases
- **TryTaskEditor**: Try/catch with retry policies
- **ListenTaskEditor**: Event consumption
- **EmitTaskEditor**: Event publishing
- **RaiseTaskEditor**: Error definition
- **RunTaskEditor**: Container, script, shell, or workflow execution

## Workflow Generation

The `generateWorkflow()` function:

1. Starts with document metadata
2. Adds optional sections (input, use, output, timeout, schedule)
3. Transforms tasks array into `do` array
4. Strips internal IDs and UI state
5. Returns spec-compliant workflow object

## Validation

Current validation:
- Required document fields (dsl, namespace, name, version)
- JSON syntax in editors
- Task name uniqueness (recommended)

Future enhancements:
- Schema-based validation
- Runtime expression syntax checking
- Cyclic dependency detection

## Performance Considerations

- **React Flow**: Handles hundreds of nodes efficiently
- **Zustand**: Minimal re-renders with selector-based subscriptions
- **IndexedDB**: Async, doesn't block UI
- **Code Splitting**: Could be added for task editors

## Browser Storage

- **Dexie/IndexedDB**: Stores complete workflows
- **LocalStorage**: Could be used for preferences (not implemented)
- **No Backend**: Fully client-side application

## Extensibility

### Adding New Task Types

1. Add to `TASK_TYPES` and `TASK_METADATA` in `constants/taskTypes.js`
2. Create editor component in `components/editors/`
3. Register in `editorComponents` map in `PropertyEditor.jsx`
4. Update `generateWorkflow()` if special handling needed

### Adding Authentication

1. Extend `use.authentications` in store
2. Create authentication editor UI
3. Link to call tasks via `authentication` property

### Adding Validation

1. Load schema from `docs/static/schema.yaml`
2. Use Ajv or similar for JSON Schema validation
3. Display errors in UI

## Development Workflow

1. `npm install` - Install dependencies
2. `npm run dev` - Start dev server
3. Make changes - Hot reload active
4. `npm run build` - Production build
5. `npm run preview` - Preview production build

## Testing Strategy (Future)

- **Unit Tests**: Task editors, store actions, utility functions
- **Integration Tests**: Workflow generation, export functionality
- **E2E Tests**: Full user workflows with Playwright/Cypress
- **Visual Regression**: Canvas rendering consistency

## Deployment Options

1. **Static Hosting**: Deploy `dist/` to Netlify, Vercel, GitHub Pages
2. **Docker**: Serve with nginx
3. **Embedded**: Include in Zigflow CLI or desktop app

## Security Considerations

- **No Server**: No API vulnerabilities
- **Client-Side Only**: Data stays in browser
- **XSS**: React's built-in protection
- **Code Injection**: Runtime expressions are strings, not executed in builder
- **CSP**: Can be configured for production

## Roadmap

### Phase 1 (Complete)
- All task types
- Drag & drop interface
- Property editors
- YAML/JSON export
- Browser storage

### Phase 2 (Future)
- Import workflows (YAML/JSON)
- Workflow templates
- Copy/paste tasks
- Undo/redo
- Keyboard shortcuts
- Search/filter tasks

### Phase 3 (Future)
- Real-time validation
- Collaboration features
- Version history
- Integration with Temporal UI
- Testing workflows in-browser

## Known Limitations

1. **No Import**: Can't load existing workflows yet
2. **No Validation**: Basic JSON validation only
3. **No Undo/Redo**: Browser-level only
4. **Complex Tasks**: Do, Fork, For tasks use JSON instead of visual sub-flows
5. **No Sub-graphs**: Composite tasks shown as single nodes

## Contributing

See main Zigflow repository for contribution guidelines.

## License

Apache-2.0
