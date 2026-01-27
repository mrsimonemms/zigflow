import React from 'react';

function RaiseTaskEditor({ task, onChange }) {
  const raiseConfig = task.raise || { error: {} };

  return (
    <div className="property-section">
      <h4>Raise Configuration</h4>

      <div className="form-group">
        <label>Error Type</label>
        <input
          type="text"
          value={typeof raiseConfig.error === 'string' ? raiseConfig.error : raiseConfig.error?.type || ''}
          onChange={(e) => {
            if (typeof raiseConfig.error === 'string') {
              onChange({ raise: { error: e.target.value } });
            } else {
              onChange({
                raise: {
                  error: { ...raiseConfig.error, type: e.target.value }
                }
              });
            }
          }}
          placeholder="https://example.com/errors/my-error"
        />
        <span className="help-text">URI reference identifying the error type</span>
      </div>

      <div className="form-group">
        <label>Status Code</label>
        <input
          type="number"
          value={raiseConfig.error?.status || ''}
          onChange={(e) => onChange({
            raise: {
              error: { ...raiseConfig.error, status: parseInt(e.target.value) || 500 }
            }
          })}
          placeholder="500"
        />
      </div>

      <div className="form-group">
        <label>Title</label>
        <input
          type="text"
          value={raiseConfig.error?.title || ''}
          onChange={(e) => onChange({
            raise: {
              error: { ...raiseConfig.error, title: e.target.value }
            }
          })}
          placeholder="Short, human-readable summary"
        />
      </div>

      <div className="form-group">
        <label>Detail</label>
        <textarea
          value={raiseConfig.error?.detail || ''}
          onChange={(e) => onChange({
            raise: {
              error: { ...raiseConfig.error, detail: e.target.value }
            }
          })}
          placeholder="Human-readable explanation"
          rows={3}
        />
      </div>

      <div className="form-group">
        <label>Instance (JSON Pointer)</label>
        <input
          type="text"
          value={raiseConfig.error?.instance || ''}
          onChange={(e) => onChange({
            raise: {
              error: { ...raiseConfig.error, instance: e.target.value }
            }
          })}
          placeholder="/path/to/component"
        />
        <span className="help-text">JSON Pointer to the component origin</span>
      </div>
    </div>
  );
}

export default RaiseTaskEditor;
