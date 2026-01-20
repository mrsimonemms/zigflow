import React from 'react';

function ListenTaskEditor({ task, onChange }) {
  const listenConfig = task.listen || { to: {} };

  return (
    <div className="property-section">
      <h4>Listen Configuration</h4>

      <div className="form-group">
        <label>Event Consumption Strategy (JSON)</label>
        <textarea
          value={JSON.stringify(listenConfig.to || {}, null, 2)}
          onChange={(e) => {
            try {
              onChange({
                listen: { ...listenConfig, to: JSON.parse(e.target.value) }
              });
            } catch {}
          }}
          placeholder={`{
  "one": {
    "with": {
      "source": "https://example.com",
      "type": "com.example.event"
    }
  }
}`}
          rows={10}
        />
        <span className="help-text">Event filter configuration (one, any, or all)</span>
      </div>

      <div className="form-group">
        <label>Read As</label>
        <select
          value={listenConfig.read || 'data'}
          onChange={(e) => onChange({
            listen: { ...listenConfig, read: e.target.value }
          })}
        >
          <option value="data">Data</option>
          <option value="envelope">Envelope</option>
          <option value="raw">Raw</option>
        </select>
        <span className="help-text">How to read events during listen operation</span>
      </div>

      <div className="form-group">
        <label>For Each Iterator (JSON)</label>
        <textarea
          value={JSON.stringify(task.foreach || {}, null, 2)}
          onChange={(e) => {
            try {
              onChange({ foreach: JSON.parse(e.target.value) });
            } catch {}
          }}
          placeholder={`{
  "item": "event",
  "at": "index",
  "do": [...]
}`}
          rows={8}
        />
        <span className="help-text">Optional iterator for processing consumed events</span>
      </div>
    </div>
  );
}

export default ListenTaskEditor;
