import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Trash2 } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';
import './TaskNode.css';

function TaskNode({ data, selected }) {
  const { removeTask } = useWorkflowStore();

  const handleDelete = (e) => {
    e.stopPropagation();
    if (confirm(`Delete task "${data.taskName}"?`)) {
      removeTask(data.taskId);
    }
  };

  return (
    <div className={`task-node ${selected ? 'selected' : ''}`}>
      <Handle
        type="target"
        position={Position.Top}
        className="task-handle"
      />

      <div className="task-node-header" style={{ background: data.color }}>
        <span className="task-node-icon">{data.icon}</span>
        <span className="task-node-type">{data.label}</span>
        <button
          className="task-node-delete"
          onClick={handleDelete}
          title="Delete task"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="task-node-body">
        <div className="task-node-name">{data.taskName}</div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="task-handle"
      />
    </div>
  );
}

export default memo(TaskNode);
