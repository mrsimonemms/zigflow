# Zigflow Workflow Builder

A visual drag-and-drop workflow builder for creating Zigflow workflows based on the CNCF Serverless Workflow v1.x.x specification.

## Features

- Visual drag-and-drop interface for building workflows
- Support for all Serverless Workflow task types
- Real-time workflow validation
- Export workflows as YAML or JSON
- Browser-based storage (LocalStorage/IndexedDB)
- Intuitive task property editor

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Task Types Supported

- **Set**: Set variables and data
- **Call**: HTTP, gRPC, OpenAPI, AsyncAPI, A2A, MCP, and Function calls
- **Wait**: Pause workflow execution
- **Do**: Execute tasks sequentially
- **Fork**: Execute tasks concurrently
- **For**: Loop over collections
- **Switch**: Conditional branching
- **Try**: Error handling with catch blocks
- **Listen**: Event-driven behavior
- **Emit**: Publish events
- **Raise**: Trigger errors
- **Run**: Execute containers, scripts, shells, or sub-workflows

## Usage

1. Start with the workflow metadata (namespace, name, version)
2. Drag task nodes onto the canvas
3. Connect tasks to define execution flow
4. Configure task properties in the sidebar
5. Export your workflow as YAML or JSON
6. Run with Zigflow CLI

## License

Apache-2.0
