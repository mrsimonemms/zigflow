import React from 'react';
import { TASK_TYPES, TASK_METADATA } from '../constants/taskTypes';
import './TaskPalette.css';

function TaskPalette() {
  const onDragStart = (event, taskType) => {
    event.dataTransfer.setData('application/reactflow', taskType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="task-palette">
      <div className="palette-header">
        <h3>Task Palette</h3>
        <p>Drag tasks onto the canvas</p>
      </div>

      <div className="palette-tasks">
        {Object.values(TASK_TYPES).map(taskType => {
          const metadata = TASK_METADATA[taskType];
          return (
            <div
              key={taskType}
              className="palette-task"
              draggable
              onDragStart={(e) => onDragStart(e, taskType)}
              style={{ borderLeftColor: metadata.color }}
            >
              <div className="palette-task-icon" style={{ background: metadata.color }}>
                {metadata.icon}
              </div>
              <div className="palette-task-info">
                <div className="palette-task-label">{metadata.label}</div>
                <div className="palette-task-desc">{metadata.description}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TaskPalette;
