import React from 'react';

function ForTaskEditor({ task, onChange }) {
  const forConfig = task.for || { in: '' };

  return (
    <div className="property-section">
      <h4>For Loop Configuration</h4>

      <div className="form-group">
        <label>Each (Variable Name)</label>
        <input
          type="text"
          value={forConfig.each || 'item'}
          onChange={(e) => onChange({
            for: { ...forConfig, each: e.target.value }
          })}
          placeholder="item"
        />
        <span className="help-text">Variable name for the current item</span>
      </div>

      <div className="form-group">
        <label>In (Collection Expression)</label>
        <input
          type="text"
          value={forConfig.in || ''}
          onChange={(e) => onChange({
            for: { ...forConfig, in: e.target.value }
          })}
          placeholder="${ $input.items }"
        />
        <span className="help-text">Runtime expression to get the collection</span>
      </div>

      <div className="form-group">
        <label>At (Index Variable Name)</label>
        <input
          type="text"
          value={forConfig.at || 'index'}
          onChange={(e) => onChange({
            for: { ...forConfig, at: e.target.value }
          })}
          placeholder="index"
        />
        <span className="help-text">Variable name for the current index</span>
      </div>

      <div className="form-group">
        <label>While Condition</label>
        <input
          type="text"
          value={task.while || ''}
          onChange={(e) => onChange({ while: e.target.value })}
          placeholder="${ condition }"
        />
        <span className="help-text">Optional condition to continue iteration</span>
      </div>

      <div className="form-group">
        <label>Do Tasks (JSON Array)</label>
        <textarea
          value={JSON.stringify(task.do || [], null, 2)}
          onChange={(e) => {
            try {
              onChange({ do: JSON.parse(e.target.value) });
            } catch {}
          }}
          placeholder='[{ "taskName": { "set": { "key": "${ $data.item }" } } }]'
          rows={8}
        />
        <span className="help-text">Tasks to execute for each iteration</span>
      </div>
    </div>
  );
}

export default ForTaskEditor;
