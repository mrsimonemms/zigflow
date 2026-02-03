export const TASK_TYPES = {
  SET: 'set',
  CALL: 'call',
  WAIT: 'wait',
  DO: 'do',
  FORK: 'fork',
  FOR: 'for',
  SWITCH: 'switch',
  TRY: 'try',
  LISTEN: 'listen',
  EMIT: 'emit',
  RAISE: 'raise',
  RUN: 'run'
};

export const TASK_METADATA = {
  [TASK_TYPES.SET]: {
    label: 'Set',
    description: 'Set variables and data',
    color: '#3b82f6',
    icon: '='
  },
  [TASK_TYPES.CALL]: {
    label: 'Call',
    description: 'Call external services (HTTP, gRPC, OpenAPI, etc.)',
    color: '#8b5cf6',
    icon: '📞'
  },
  [TASK_TYPES.WAIT]: {
    label: 'Wait',
    description: 'Pause workflow execution',
    color: '#f59e0b',
    icon: '⏸'
  },
  [TASK_TYPES.DO]: {
    label: 'Do',
    description: 'Execute tasks sequentially',
    color: '#10b981',
    icon: '→'
  },
  [TASK_TYPES.FORK]: {
    label: 'Fork',
    description: 'Execute tasks concurrently',
    color: '#06b6d4',
    icon: '⑃'
  },
  [TASK_TYPES.FOR]: {
    label: 'For',
    description: 'Loop over collections',
    color: '#ec4899',
    icon: '🔁'
  },
  [TASK_TYPES.SWITCH]: {
    label: 'Switch',
    description: 'Conditional branching',
    color: '#f97316',
    icon: '⚡'
  },
  [TASK_TYPES.TRY]: {
    label: 'Try',
    description: 'Error handling with catch blocks',
    color: '#ef4444',
    icon: '🛡'
  },
  [TASK_TYPES.LISTEN]: {
    label: 'Listen',
    description: 'Listen for events',
    color: '#14b8a6',
    icon: '👂'
  },
  [TASK_TYPES.EMIT]: {
    label: 'Emit',
    description: 'Publish events',
    color: '#a855f7',
    icon: '📡'
  },
  [TASK_TYPES.RAISE]: {
    label: 'Raise',
    description: 'Trigger errors',
    color: '#dc2626',
    icon: '⚠'
  },
  [TASK_TYPES.RUN]: {
    label: 'Run',
    description: 'Execute containers, scripts, shells, or workflows',
    color: '#64748b',
    icon: '▶'
  }
};

export const CALL_TYPES = {
  HTTP: 'http',
  GRPC: 'grpc',
  OPENAPI: 'openapi',
  ASYNCAPI: 'asyncapi',
  A2A: 'a2a',
  MCP: 'mcp',
  FUNCTION: 'function'
};

export const RUN_TYPES = {
  CONTAINER: 'container',
  SCRIPT: 'script',
  SHELL: 'shell',
  WORKFLOW: 'workflow'
};
