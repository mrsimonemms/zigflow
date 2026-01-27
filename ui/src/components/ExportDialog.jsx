import React, { useState, useMemo } from 'react';
import { X, Download, Copy, Check } from 'lucide-react';
import { useWorkflowStore } from '../store/workflowStore';
import yaml from 'js-yaml';

function ExportDialog({ onClose }) {
  const { generateWorkflow } = useWorkflowStore();
  const [format, setFormat] = useState('yaml');
  const [copied, setCopied] = useState(false);

  const workflow = useMemo(() => generateWorkflow(), [generateWorkflow]);

  const exportedContent = useMemo(() => {
    if (format === 'yaml') {
      return yaml.dump(workflow, { indent: 2, lineWidth: -1 });
    } else {
      return JSON.stringify(workflow, null, 2);
    }
  }, [workflow, format]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(exportedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([exportedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflow.document.name}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px' }}>
        <div className="modal-header">
          <h2>Export Workflow</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Format</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                className={format === 'yaml' ? 'primary' : 'secondary'}
                onClick={() => setFormat('yaml')}
              >
                YAML
              </button>
              <button
                className={format === 'json' ? 'primary' : 'secondary'}
                onClick={() => setFormat('json')}
              >
                JSON
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Workflow Definition</label>
            <textarea
              value={exportedContent}
              readOnly
              style={{
                fontFamily: 'monospace',
                fontSize: '13px',
                minHeight: '400px',
                maxHeight: '500px'
              }}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="secondary" onClick={onClose}>
            Close
          </button>
          <button className="secondary" onClick={handleCopy}>
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button className="primary" onClick={handleDownload}>
            <Download size={18} />
            Download {format.toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExportDialog;
