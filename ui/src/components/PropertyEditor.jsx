import React from 'react';
import { useWorkflowStore } from '../store/workflowStore';
import { TASK_TYPES } from '../constants/taskTypes';
import SetTaskEditor from './editors/SetTaskEditor';
import CallTaskEditor from './editors/CallTaskEditor';
import WaitTaskEditor from './editors/WaitTaskEditor';
import DoTaskEditor from './editors/DoTaskEditor';
import ForkTaskEditor from './editors/ForkTaskEditor';
import ForTaskEditor from './editors/ForTaskEditor';
import SwitchTaskEditor from './editors/SwitchTaskEditor';
import TryTaskEditor from './editors/TryTaskEditor';
import ListenTaskEditor from './editors/ListenTaskEditor';
import EmitTaskEditor from './editors/EmitTaskEditor';
import RaiseTaskEditor from './editors/RaiseTaskEditor';
import RunTaskEditor from './editors/RunTaskEditor';
import './PropertyEditor.css';

const editorComponents = {
  [TASK_TYPES.SET]: SetTaskEditor,
  [TASK_TYPES.CALL]: CallTaskEditor,
  [TASK_TYPES.WAIT]: WaitTaskEditor,
  [TASK_TYPES.DO]: DoTaskEditor,
  [TASK_TYPES.FORK]: ForkTaskEditor,
  [TASK_TYPES.FOR]: ForTaskEditor,
  [TASK_TYPES.SWITCH]: SwitchTaskEditor,
  [TASK_TYPES.TRY]: TryTaskEditor,
  [TASK_TYPES.LISTEN]: ListenTaskEditor,
  [TASK_TYPES.EMIT]: EmitTaskEditor,
  [TASK_TYPES.RAISE]: RaiseTaskEditor,
  [TASK_TYPES.RUN]: RunTaskEditor
};

function PropertyEditor() {
  const { tasks, selectedTaskId, updateTask } = useWorkflowStore();

  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  if (!selectedTask) {
    return (
      <div className="property-editor">
        <div className="property-editor-empty">
          <p>Select a task to edit its properties</p>
        </div>
      </div>
    );
  }

  const EditorComponent = editorComponents[selectedTask.taskType];

  return (
    <div className="property-editor">
      <div className="property-editor-header">
        <h3>Task Properties</h3>
        <div className="property-editor-task-type">{selectedTask.taskType}</div>
      </div>

      <div className="property-editor-body">
        {/* Task name editor */}
        <div className="form-group">
          <label>Task Name</label>
          <input
            type="text"
            value={selectedTask.taskName || ''}
            onChange={(e) => updateTask(selectedTaskId, { taskName: e.target.value })}
            placeholder="Enter task name"
          />
        </div>

        {/* Task-specific editor */}
        {EditorComponent && (
          <EditorComponent
            task={selectedTask}
            onChange={(updates) => updateTask(selectedTaskId, updates)}
          />
        )}

        {/* Common task properties */}
        <div className="property-section">
          <h4>Common Properties</h4>

          <div className="form-group">
            <label>If Condition</label>
            <input
              type="text"
              value={selectedTask.if || ''}
              onChange={(e) => updateTask(selectedTaskId, { if: e.target.value })}
              placeholder="${ condition }"
            />
            <span className="help-text">Runtime expression to determine if task should run</span>
          </div>

          <div className="form-group">
            <label>Then (Flow Directive)</label>
            <input
              type="text"
              value={selectedTask.then || ''}
              onChange={(e) => updateTask(selectedTaskId, { then: e.target.value })}
              placeholder="continue, exit, end, or task name"
            />
            <span className="help-text">What to do after task completes</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertyEditor;
