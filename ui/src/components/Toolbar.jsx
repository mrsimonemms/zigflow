import React from 'react';
import { useWorkflowStore } from '../store/workflowStore';
import { Save, Download, FileText, Grid3x3, Trash2 } from 'lucide-react';
import { saveWorkflow } from '../db/workflowDB';
import './Toolbar.css';

function Toolbar({ onShowMetadata, onShowExport, onTogglePalette }) {
  const { document, generateWorkflow, reset } = useWorkflowStore();

  const handleSave = async () => {
    try {
      const workflow = generateWorkflow();
      await saveWorkflow({
        ...workflow,
        name: document.name,
        namespace: document.namespace,
        version: document.version
      });
      alert('Workflow saved successfully!');
    } catch (error) {
      console.error('Error saving workflow:', error);
      alert('Failed to save workflow');
    }
  };

  const handleNew = () => {
    if (confirm('Create new workflow? Any unsaved changes will be lost.')) {
      reset();
    }
  };

  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <div className="toolbar-logo">
          <img src="/ziggy.svg" alt="Zigflow" className="logo-icon" />
          <span className="logo-text">Zigflow Builder</span>
        </div>
        <div className="toolbar-title">
          {document.title || document.name}
        </div>
      </div>

      <div className="toolbar-right">
        <button className="toolbar-btn" onClick={onTogglePalette} title="Toggle Task Palette">
          <Grid3x3 size={18} />
        </button>

        <button className="toolbar-btn" onClick={onShowMetadata} title="Workflow Metadata">
          <FileText size={18} />
          Metadata
        </button>

        <button className="toolbar-btn" onClick={handleSave} title="Save Workflow">
          <Save size={18} />
          Save
        </button>

        <button className="toolbar-btn" onClick={onShowExport} title="Export Workflow">
          <Download size={18} />
          Export
        </button>

        <button className="toolbar-btn danger" onClick={handleNew} title="New Workflow">
          <Trash2 size={18} />
          New
        </button>
      </div>
    </div>
  );
}

export default Toolbar;
