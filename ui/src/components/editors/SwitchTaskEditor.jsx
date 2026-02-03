import React from 'react';

function SwitchTaskEditor({ task, onChange }) {
  return (
    <div className="property-section">
      <h4>Switch Configuration</h4>

      <div className="form-group">
        <label>Cases (JSON Array)</label>
        <textarea
          value={JSON.stringify(task.switch || [], null, 2)}
          onChange={(e) => {
            try {
              onChange({ switch: JSON.parse(e.target.value) });
            } catch {}
          }}
          placeholder={`[
  { "case1": { "when": "\${ condition }", "then": "taskName" } },
  { "default": { "then": "continue" } }
]`}
          rows={12}
        />
        <span className="help-text">
          Array of cases with conditions and flow directives
        </span>
      </div>
    </div>
  );
}

export default SwitchTaskEditor;
