import React from 'react';

function ForkTaskEditor({ task, onChange }) {
  const forkConfig = task.fork || { branches: [], compete: false };

  return (
    <div className="property-section">
      <h4>Fork Configuration</h4>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={forkConfig.compete || false}
            onChange={(e) => onChange({
              fork: { ...forkConfig, compete: e.target.checked }
            })}
          />
          {' '}Compete Mode
        </label>
        <span className="help-text">
          If enabled, branches race against each other with a single winner
        </span>
      </div>

      <div className="form-group">
        <label>Branches (JSON Array)</label>
        <textarea
          value={JSON.stringify(forkConfig.branches || [], null, 2)}
          onChange={(e) => {
            try {
              onChange({
                fork: { ...forkConfig, branches: JSON.parse(e.target.value) }
              });
            } catch {}
          }}
          placeholder='[{ "branch1": { "call": "http", "with": {...} } }]'
          rows={10}
        />
        <span className="help-text">Array of tasks to execute concurrently</span>
      </div>
    </div>
  );
}

export default ForkTaskEditor;
