import React from 'react';

function WaitTaskEditor({ task, onChange }) {
  const waitConfig = task.wait || {};

  return (
    <div className="property-section">
      <h4>Wait Configuration</h4>

      <div className="form-row">
        <div className="form-group">
          <label>Days</label>
          <input
            type="number"
            value={waitConfig.days || ''}
            onChange={(e) => onChange({
              wait: { ...waitConfig, days: parseInt(e.target.value) || undefined }
            })}
            min="0"
          />
        </div>

        <div className="form-group">
          <label>Hours</label>
          <input
            type="number"
            value={waitConfig.hours || ''}
            onChange={(e) => onChange({
              wait: { ...waitConfig, hours: parseInt(e.target.value) || undefined }
            })}
            min="0"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Minutes</label>
          <input
            type="number"
            value={waitConfig.minutes || ''}
            onChange={(e) => onChange({
              wait: { ...waitConfig, minutes: parseInt(e.target.value) || undefined }
            })}
            min="0"
          />
        </div>

        <div className="form-group">
          <label>Seconds</label>
          <input
            type="number"
            value={waitConfig.seconds || ''}
            onChange={(e) => onChange({
              wait: { ...waitConfig, seconds: parseInt(e.target.value) || undefined }
            })}
            min="0"
          />
        </div>
      </div>

      <div className="form-group">
        <label>Milliseconds</label>
        <input
          type="number"
          value={waitConfig.milliseconds || ''}
          onChange={(e) => onChange({
            wait: { ...waitConfig, milliseconds: parseInt(e.target.value) || undefined }
          })}
          min="0"
        />
      </div>

      <div className="form-group">
        <label>ISO 8601 Duration</label>
        <input
          type="text"
          value={typeof waitConfig === 'string' ? waitConfig : ''}
          onChange={(e) => onChange({ wait: e.target.value })}
          placeholder="P1DT2H30M or ${ expression }"
        />
        <span className="help-text">Alternative: ISO 8601 duration string or runtime expression</span>
      </div>
    </div>
  );
}

export default WaitTaskEditor;
