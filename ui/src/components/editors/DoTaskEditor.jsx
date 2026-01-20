import React from 'react';

function DoTaskEditor({ task, onChange }) {
  return (
    <div className="property-section">
      <h4>Do Configuration</h4>
      <p className="help-text">
        The Do task executes a list of tasks sequentially. Configure the tasks in the 'do' array using JSON.
      </p>

      <div className="form-group">
        <label>Tasks (JSON Array)</label>
        <textarea
          value={JSON.stringify(task.do || [], null, 2)}
          onChange={(e) => {
            try {
              onChange({ do: JSON.parse(e.target.value) });
            } catch {}
          }}
          placeholder='[{ "taskName": { "set": { "key": "value" } } }]'
          rows={10}
        />
        <span className="help-text">Array of task objects to execute sequentially</span>
      </div>
    </div>
  );
}

export default DoTaskEditor;
