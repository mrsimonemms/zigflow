import React, { useCallback, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useWorkflowStore } from '../store/workflowStore';
import { TASK_METADATA } from '../constants/taskTypes';
import TaskNode from './nodes/TaskNode';
import { v4 as uuidv4 } from '../utils/uuid';
import './WorkflowCanvas.css';

const nodeTypes = {
  task: TaskNode
};

let id = 0;
const getId = () => `node_${id++}`;

function WorkflowCanvas() {
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const { addTask, setSelectedTaskId } = useWorkflowStore();

  const onConnect = useCallback(
    (params) => {
      const edge = {
        ...params,
        type: 'smoothstep',
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20
        }
      };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const taskType = event.dataTransfer.getData('application/reactflow');
      if (!taskType) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top
      });

      const taskId = uuidv4();
      const metadata = TASK_METADATA[taskType];

      const newNode = {
        id: getId(),
        type: 'task',
        position,
        data: {
          taskId,
          taskType,
          taskName: `${taskType}-task`,
          label: metadata.label,
          color: metadata.color,
          icon: metadata.icon
        }
      };

      setNodes((nds) => nds.concat(newNode));

      // Add task to store
      addTask({
        id: taskId,
        taskType,
        taskName: `${taskType}-task`,
        [taskType]: {} // Initialize with empty config
      });
    },
    [reactFlowInstance, addTask, setNodes]
  );

  const onNodeClick = useCallback(
    (event, node) => {
      if (node.data.taskId) {
        setSelectedTaskId(node.data.taskId);
      }
    },
    [setSelectedTaskId]
  );

  return (
    <div className="workflow-canvas" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
      >
        <Background color="#e5e7eb" gap={16} />
        <Controls />
        <MiniMap
          nodeColor={(node) => node.data.color || '#3b82f6'}
          maskColor="rgba(0, 0, 0, 0.1)"
        />
      </ReactFlow>
    </div>
  );
}

export default WorkflowCanvas;
