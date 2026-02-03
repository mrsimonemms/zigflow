import React, { useState } from 'react';
import WorkflowCanvas from './components/WorkflowCanvas';
import Sidebar from './components/Sidebar';
import Toolbar from './components/Toolbar';
import TaskPalette from './components/TaskPalette';
import PropertyEditor from './components/PropertyEditor';
import WorkflowMetadataEditor from './components/WorkflowMetadataEditor';
import ExportDialog from './components/ExportDialog';
import './App.css';

function App() {
  const [showMetadataEditor, setShowMetadataEditor] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showTaskPalette, setShowTaskPalette] = useState(true);

  return (
    <div className="app">
      <Toolbar
        onShowMetadata={() => setShowMetadataEditor(true)}
        onShowExport={() => setShowExportDialog(true)}
        onTogglePalette={() => setShowTaskPalette(!showTaskPalette)}
      />

      <div className="app-content">
        {showTaskPalette && <TaskPalette />}

        <div className="canvas-container">
          <WorkflowCanvas />
        </div>

        <Sidebar>
          <PropertyEditor />
        </Sidebar>
      </div>

      {showMetadataEditor && (
        <WorkflowMetadataEditor onClose={() => setShowMetadataEditor(false)} />
      )}

      {showExportDialog && (
        <ExportDialog onClose={() => setShowExportDialog(false)} />
      )}
    </div>
  );
}

export default App;
