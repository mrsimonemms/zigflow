import React from 'react';

function EmitTaskEditor({ task, onChange }) {
  const emitConfig = task.emit || { event: { with: {} } };

  return (
    <div className="property-section">
      <h4>Emit Configuration</h4>

      <div className="form-group">
        <label>Event Source</label>
        <input
          type="text"
          value={emitConfig.event?.with?.source || ''}
          onChange={(e) => onChange({
            emit: {
              ...emitConfig,
              event: {
                ...emitConfig.event,
                with: {
                  ...emitConfig.event?.with,
                  source: e.target.value
                }
              }
            }
          })}
          placeholder="https://example.com/source"
        />
      </div>

      <div className="form-group">
        <label>Event Type</label>
        <input
          type="text"
          value={emitConfig.event?.with?.type || ''}
          onChange={(e) => onChange({
            emit: {
              ...emitConfig,
              event: {
                ...emitConfig.event,
                with: {
                  ...emitConfig.event?.with,
                  type: e.target.value
                }
              }
            }
          })}
          placeholder="com.example.event.type"
        />
      </div>

      <div className="form-group">
        <label>Event Data (JSON)</label>
        <textarea
          value={JSON.stringify(emitConfig.event?.with?.data || {}, null, 2)}
          onChange={(e) => {
            try {
              onChange({
                emit: {
                  ...emitConfig,
                  event: {
                    ...emitConfig.event,
                    with: {
                      ...emitConfig.event?.with,
                      data: JSON.parse(e.target.value)
                    }
                  }
                }
              });
            } catch {}
          }}
          placeholder='{ "key": "value" }'
          rows={6}
        />
      </div>

      <div className="form-group">
        <label>Full Event Configuration (JSON)</label>
        <textarea
          value={JSON.stringify(emitConfig, null, 2)}
          onChange={(e) => {
            try {
              onChange({ emit: JSON.parse(e.target.value) });
            } catch {}
          }}
          placeholder='{ "event": { "with": { "source": "...", "type": "...", "data": {...} } } }'
          rows={10}
        />
        <span className="help-text">Advanced: full emit configuration</span>
      </div>
    </div>
  );
}

export default EmitTaskEditor;
