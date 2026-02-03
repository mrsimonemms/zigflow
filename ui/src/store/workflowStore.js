import { create } from 'zustand';
import { v4 as uuidv4 } from '../utils/uuid';

const initialWorkflowDocument = {
  dsl: '1.0.0',
  namespace: 'zigflow',
  name: 'untitled-workflow',
  version: '0.0.1',
  title: 'Untitled Workflow',
  summary: '',
  tags: {},
  metadata: {}
};

export const useWorkflowStore = create((set, get) => ({
  // Workflow document metadata
  document: { ...initialWorkflowDocument },

  // Workflow configuration
  input: null,
  output: null,
  timeout: null,
  schedule: null,
  use: {
    authentications: {},
    errors: {},
    extensions: [],
    functions: {},
    retries: {},
    secrets: [],
    timeouts: {},
    catalogs: {}
  },

  // Tasks (do section)
  tasks: [],

  // UI state
  selectedTaskId: null,
  nodes: [],
  edges: [],

  // Actions
  setDocument: (document) => set({ document }),

  updateDocument: (updates) => set((state) => ({
    document: { ...state.document, ...updates }
  })),

  setInput: (input) => set({ input }),
  setOutput: (output) => set({ output }),
  setTimeout: (timeout) => set({ timeout }),
  setSchedule: (schedule) => set({ schedule }),

  updateUse: (section, key, value) => set((state) => ({
    use: {
      ...state.use,
      [section]: {
        ...state.use[section],
        [key]: value
      }
    }
  })),

  addTask: (task) => set((state) => ({
    tasks: [...state.tasks, { id: uuidv4(), ...task }]
  })),

  updateTask: (taskId, updates) => set((state) => ({
    tasks: state.tasks.map(task =>
      task.id === taskId ? { ...task, ...updates } : task
    )
  })),

  removeTask: (taskId) => set((state) => ({
    tasks: state.tasks.filter(task => task.id !== taskId),
    selectedTaskId: state.selectedTaskId === taskId ? null : state.selectedTaskId
  })),

  setSelectedTaskId: (taskId) => set({ selectedTaskId: taskId }),

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  // Generate workflow YAML/JSON structure
  generateWorkflow: () => {
    const state = get();
    const workflow = {
      document: state.document
    };

    if (state.input) workflow.input = state.input;
    if (Object.keys(state.use.authentications).length > 0 ||
        Object.keys(state.use.errors).length > 0 ||
        state.use.extensions.length > 0 ||
        Object.keys(state.use.functions).length > 0 ||
        Object.keys(state.use.retries).length > 0 ||
        state.use.secrets.length > 0 ||
        Object.keys(state.use.timeouts).length > 0 ||
        Object.keys(state.use.catalogs).length > 0) {
      workflow.use = {};
      if (Object.keys(state.use.authentications).length > 0) workflow.use.authentications = state.use.authentications;
      if (Object.keys(state.use.errors).length > 0) workflow.use.errors = state.use.errors;
      if (state.use.extensions.length > 0) workflow.use.extensions = state.use.extensions;
      if (Object.keys(state.use.functions).length > 0) workflow.use.functions = state.use.functions;
      if (Object.keys(state.use.retries).length > 0) workflow.use.retries = state.use.retries;
      if (state.use.secrets.length > 0) workflow.use.secrets = state.use.secrets;
      if (Object.keys(state.use.timeouts).length > 0) workflow.use.timeouts = state.use.timeouts;
      if (Object.keys(state.use.catalogs).length > 0) workflow.use.catalogs = state.use.catalogs;
    }

    // Convert tasks to do array
    workflow.do = state.tasks.map(task => {
      const { id, taskName, taskType, ...taskData } = task;
      return { [taskName || taskType]: taskData };
    });

    if (state.timeout) workflow.timeout = state.timeout;
    if (state.output) workflow.output = state.output;
    if (state.schedule) workflow.schedule = state.schedule;

    return workflow;
  },

  // Load workflow from structure
  loadWorkflow: (workflow) => {
    set({
      document: workflow.document || { ...initialWorkflowDocument },
      input: workflow.input || null,
      output: workflow.output || null,
      timeout: workflow.timeout || null,
      schedule: workflow.schedule || null,
      use: workflow.use || {
        authentications: {},
        errors: {},
        extensions: [],
        functions: {},
        retries: {},
        secrets: [],
        timeouts: {},
        catalogs: {}
      },
      tasks: (workflow.do || []).map((taskObj, index) => {
        const [taskName, taskData] = Object.entries(taskObj)[0];
        return {
          id: uuidv4(),
          taskName,
          taskType: Object.keys(taskData)[0],
          ...taskData
        };
      })
    });
  },

  // Reset to initial state
  reset: () => set({
    document: { ...initialWorkflowDocument },
    input: null,
    output: null,
    timeout: null,
    schedule: null,
    use: {
      authentications: {},
      errors: {},
      extensions: [],
      functions: {},
      retries: {},
      secrets: [],
      timeouts: {},
      catalogs: {}
    },
    tasks: [],
    selectedTaskId: null,
    nodes: [],
    edges: []
  })
}));
