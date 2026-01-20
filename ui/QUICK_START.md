# Zigflow Workflow Builder - Quick Start Guide

Welcome to the Zigflow Workflow Builder! This visual drag-and-drop tool helps you create Serverless Workflow v1.x.x compliant workflows for Zigflow.

## Installation

```bash
cd workflow-builder
npm install
```

## Running the Application

```bash
npm run dev
```

The application will open at [http://localhost:3000](http://localhost:3000)

## Building Your First Workflow

### 1. Set Workflow Metadata
- Click the **Metadata** button in the toolbar
- Fill in required fields:
  - **DSL Version**: `1.0.0`
  - **Namespace**: `zigflow` (maps to Temporal task queue)
  - **Name**: Your workflow name (e.g., `my-workflow`)
  - **Version**: `0.0.1`
- Optionally add title, summary, tags, and metadata
- Configure input/output schemas if needed

### 2. Add Tasks to Canvas
- Drag task types from the **Task Palette** (left sidebar) onto the canvas
- Available tasks:
  - **Set**: Set variables and data
  - **Call**: HTTP, gRPC, OpenAPI, AsyncAPI, A2A, MCP calls
  - **Wait**: Pause execution
  - **Do**: Execute tasks sequentially
  - **Fork**: Execute tasks concurrently
  - **For**: Loop over collections
  - **Switch**: Conditional branching
  - **Try**: Error handling
  - **Listen**: Event-driven behavior
  - **Emit**: Publish events
  - **Raise**: Trigger errors
  - **Run**: Execute containers, scripts, shells, or workflows

### 3. Connect Tasks
- Drag from the bottom handle of one task to the top handle of another
- This defines the execution flow

### 4. Configure Task Properties
- Click on a task to select it
- Edit properties in the **right sidebar**:
  - Task name
  - Task-specific configuration
  - Conditional execution (`if`)
  - Flow directives (`then`)

### 5. Save and Export
- **Save**: Click the Save button to store in browser (LocalStorage/IndexedDB)
- **Export**:
  - Click the Export button
  - Choose YAML or JSON format
  - Copy to clipboard or download the file

## Example: Simple HTTP Workflow

1. Set metadata:
   - Namespace: `zigflow`
   - Name: `fetch-user`
   - Version: `0.0.1`

2. Drag a **Call** task onto canvas

3. Select the task and configure:
   - Task Name: `getUser`
   - Call Type: `HTTP`
   - Method: `GET`
   - Endpoint: `https://jsonplaceholder.typicode.com/users/1`

4. Export as YAML

## Task Configuration Examples

### Set Task
```json
{
  "message": "Hello World",
  "timestamp": "${ now }"
}
```

### Call HTTP Task
- Method: `POST`
- Endpoint: `https://api.example.com/data`
- Headers: `{ "Content-Type": "application/json" }`
- Body: `{ "key": "value" }`

### Wait Task
- Seconds: `5`
- Or ISO 8601: `PT30S`

### For Task
- Each: `item`
- In: `${ $input.items }`
- At: `index`

## Keyboard Shortcuts

- **Delete**: Remove selected task or edge
- **Ctrl/Cmd + Z**: Undo (browser-level)
- **Space**: Pan canvas
- **Scroll**: Zoom in/out

## Tips

1. **Use Runtime Expressions**: Reference data with `${ expression }`
2. **Validate JSON**: The editor will help catch JSON syntax errors
3. **Check Examples**: See the `examples/` directory in the Zigflow repo
4. **Test Workflows**: Export and run with `zigflow -f workflow.yaml`

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari

## Troubleshooting

### Tasks not appearing
- Check that you're dragging from the Task Palette
- Ensure the canvas is ready (wait for React Flow to initialize)

### Export/Save not working
- Check browser console for errors
- Ensure you have set required workflow metadata

### JSON parsing errors
- Validate JSON syntax before saving
- Use online JSON validators if needed

## Next Steps

- Export your workflow
- Run it with Zigflow CLI: `zigflow -f workflow.yaml`
- View execution in Temporal UI
- Iterate and improve!

## Resources

- [Zigflow Documentation](https://zigflow.dev/docs)
- [Serverless Workflow Spec](https://serverlessworkflow.io)
- [Temporal Documentation](https://docs.temporal.io)
