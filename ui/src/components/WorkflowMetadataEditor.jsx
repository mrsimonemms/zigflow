import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useWorkflowStore } from '../store/workflowStore';

function WorkflowMetadataEditor({ onClose }) {
  const { document, updateDocument, input, setInput, output, setOutput } = useWorkflowStore();
  const [localDoc, setLocalDoc] = useState({ ...document });
  const [localInput, setLocalInput] = useState(input ? JSON.stringify(input, null, 2) : '');
  const [localOutput, setLocalOutput] = useState(output ? JSON.stringify(output, null, 2) : '');

  const handleSave = () => {
    updateDocument(localDoc);

    // Parse and set input
    if (localInput.trim()) {
      try {
        setInput(JSON.parse(localInput));
      } catch (e) {
        alert('Invalid input JSON');
        return;
      }
    } else {
      setInput(null);
    }

    // Parse and set output
    if (localOutput.trim()) {
      try {
        setOutput(JSON.parse(localOutput));
      } catch (e) {
        alert('Invalid output JSON');
        return;
      }
    } else {
      setOutput(null);
    }

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Workflow Metadata</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label>DSL Version *</label>
              <input
                type="text"
                value={localDoc.dsl}
                onChange={(e) => setLocalDoc({ ...localDoc, dsl: e.target.value })}
                placeholder="1.0.0"
              />
            </div>

            <div className="form-group">
              <label>Version *</label>
              <input
                type="text"
                value={localDoc.version}
                onChange={(e) => setLocalDoc({ ...localDoc, version: e.target.value })}
                placeholder="0.0.1"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Namespace *</label>
              <input
                type="text"
                value={localDoc.namespace}
                onChange={(e) => setLocalDoc({ ...localDoc, namespace: e.target.value })}
                placeholder="zigflow"
              />
              <span className="help-text">Mapped to Temporal task queue</span>
            </div>

            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                value={localDoc.name}
                onChange={(e) => setLocalDoc({ ...localDoc, name: e.target.value })}
                placeholder="my-workflow"
              />
              <span className="help-text">Workflow type name</span>
            </div>
          </div>

          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={localDoc.title || ''}
              onChange={(e) => setLocalDoc({ ...localDoc, title: e.target.value })}
              placeholder="My Workflow"
            />
          </div>

          <div className="form-group">
            <label>Summary</label>
            <textarea
              value={localDoc.summary || ''}
              onChange={(e) => setLocalDoc({ ...localDoc, summary: e.target.value })}
              placeholder="Workflow description in Markdown"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Tags (JSON)</label>
            <textarea
              value={JSON.stringify(localDoc.tags || {}, null, 2)}
              onChange={(e) => {
                try {
                  setLocalDoc({ ...localDoc, tags: JSON.parse(e.target.value) });
                } catch {}
              }}
              placeholder='{ "environment": "production" }'
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Metadata (JSON)</label>
            <textarea
              value={JSON.stringify(localDoc.metadata || {}, null, 2)}
              onChange={(e) => {
                try {
                  setLocalDoc({ ...localDoc, metadata: JSON.parse(e.target.value) });
                } catch {}
              }}
              placeholder='{ "author": "John Doe" }'
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Input Schema (JSON)</label>
            <textarea
              value={localInput}
              onChange={(e) => setLocalInput(e.target.value)}
              placeholder='{ "schema": { "format": "json", "document": {...} } }'
              rows={6}
            />
            <span className="help-text">Define workflow input validation</span>
          </div>

          <div className="form-group">
            <label>Output Configuration (JSON)</label>
            <textarea
              value={localOutput}
              onChange={(e) => setLocalOutput(e.target.value)}
              placeholder='{ "as": { "result": "${ . }" } }'
              rows={4}
            />
            <span className="help-text">Define workflow output transformation</span>
          </div>
        </div>

        <div className="modal-footer">
          <button className="secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="primary" onClick={handleSave}>
            Save Metadata
          </button>
        </div>
      </div>
    </div>
  );
}

export default WorkflowMetadataEditor;
