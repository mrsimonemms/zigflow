import React from 'react';

function SetTaskEditor({ task, onChange }) {
  const setConfig = task.set || {};

  const handleChange = (updates) => {
    onChange({ set: { ...setConfig, ...updates } });
  };

  return (
    <div className="property-section">
      <h4>Set Configuration</h4>

      <div className="form-group">
        <label>Set Data (JSON)</label>
        <textarea
          value={typeof setConfig === 'string' ? setConfig : JSON.stringify(setConfig, null, 2)}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              onChange({ set: parsed });
            } catch {
              onChange({ set: e.target.value });
            }
          }}
          placeholder='{ "key": "value" } or runtime expression'
          rows={8}
        />
        <span className="help-text">Object with key-value pairs or runtime expression</span>
      </div>
    </div>
  );
}

export default SetTaskEditor;
