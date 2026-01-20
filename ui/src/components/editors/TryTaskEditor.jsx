import React from 'react';

function TryTaskEditor({ task, onChange }) {
  const catchConfig = task.catch || {};

  return (
    <div className="property-section">
      <h4>Try Configuration</h4>

      <div className="form-group">
        <label>Try Tasks (JSON Array)</label>
        <textarea
          value={JSON.stringify(task.try || [], null, 2)}
          onChange={(e) => {
            try {
              onChange({ try: JSON.parse(e.target.value) });
            } catch {}
          }}
          placeholder='[{ "taskName": { "call": "http", "with": {...} } }]'
          rows={6}
        />
        <span className="help-text">Tasks to attempt</span>
      </div>

      <h4>Catch Configuration</h4>

      <div className="form-group">
        <label>As (Error Variable Name)</label>
        <input
          type="text"
          value={catchConfig.as || 'error'}
          onChange={(e) => onChange({
            catch: { ...catchConfig, as: e.target.value }
          })}
          placeholder="error"
        />
      </div>

      <div className="form-group">
        <label>When Condition</label>
        <input
          type="text"
          value={catchConfig.when || ''}
          onChange={(e) => onChange({
            catch: { ...catchConfig, when: e.target.value }
          })}
          placeholder="${ condition }"
        />
        <span className="help-text">Runtime expression to determine whether to catch</span>
      </div>

      <div className="form-group">
        <label>Error Filter (JSON)</label>
        <textarea
          value={JSON.stringify(catchConfig.errors?.with || {}, null, 2)}
          onChange={(e) => {
            try {
              onChange({
                catch: {
                  ...catchConfig,
                  errors: { with: JSON.parse(e.target.value) }
                }
              });
            } catch {}
          }}
          placeholder='{ "type": "https://example.com/errors/api-error" }'
          rows={4}
        />
        <span className="help-text">Filter which errors to catch</span>
      </div>

      <div className="form-group">
        <label>Catch Do Tasks (JSON Array)</label>
        <textarea
          value={JSON.stringify(catchConfig.do || [], null, 2)}
          onChange={(e) => {
            try {
              onChange({
                catch: { ...catchConfig, do: JSON.parse(e.target.value) }
              });
            } catch {}
          }}
          placeholder='[{ "handleError": { "set": { "handled": true } } }]'
          rows={6}
        />
        <span className="help-text">Tasks to execute when catching an error</span>
      </div>
    </div>
  );
}

export default TryTaskEditor;
