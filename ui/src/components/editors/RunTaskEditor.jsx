import React, { useState } from 'react';
import { RUN_TYPES } from '../../constants/taskTypes';

function RunTaskEditor({ task, onChange }) {
  const runConfig = task.run || {};
  const [runType, setRunType] = useState(
    runConfig.container ? RUN_TYPES.CONTAINER :
    runConfig.script ? RUN_TYPES.SCRIPT :
    runConfig.shell ? RUN_TYPES.SHELL :
    runConfig.workflow ? RUN_TYPES.WORKFLOW :
    RUN_TYPES.SHELL
  );

  const handleRunTypeChange = (newType) => {
    setRunType(newType);
    const base = { await: runConfig.await, return: runConfig.return };
    onChange({
      run: { ...base, [newType]: {} }
    });
  };

  return (
    <div className="property-section">
      <h4>Run Configuration</h4>

      <div className="form-group">
        <label>Run Type</label>
        <select value={runType} onChange={(e) => handleRunTypeChange(e.target.value)}>
          <option value={RUN_TYPES.CONTAINER}>Container</option>
          <option value={RUN_TYPES.SCRIPT}>Script</option>
          <option value={RUN_TYPES.SHELL}>Shell</option>
          <option value={RUN_TYPES.WORKFLOW}>Workflow</option>
        </select>
      </div>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={runConfig.await !== false}
            onChange={(e) => onChange({
              run: { ...runConfig, await: e.target.checked }
            })}
          />
          {' '}Await Completion
        </label>
      </div>

      <div className="form-group">
        <label>Return</label>
        <select
          value={runConfig.return || 'stdout'}
          onChange={(e) => onChange({
            run: { ...runConfig, return: e.target.value }
          })}
        >
          <option value="stdout">STDOUT</option>
          <option value="stderr">STDERR</option>
          <option value="code">Exit Code</option>
          <option value="all">All</option>
          <option value="none">None</option>
        </select>
      </div>

      {runType === RUN_TYPES.CONTAINER && (
        <>
          <div className="form-group">
            <label>Image</label>
            <input
              type="text"
              value={runConfig.container?.image || ''}
              onChange={(e) => onChange({
                run: {
                  ...runConfig,
                  container: { ...runConfig.container, image: e.target.value }
                }
              })}
              placeholder="nginx:latest"
            />
          </div>

          <div className="form-group">
            <label>Command</label>
            <input
              type="text"
              value={runConfig.container?.command || ''}
              onChange={(e) => onChange({
                run: {
                  ...runConfig,
                  container: { ...runConfig.container, command: e.target.value }
                }
              })}
              placeholder="bash -c 'echo hello'"
            />
          </div>

          <div className="form-group">
            <label>Environment Variables (JSON)</label>
            <textarea
              value={JSON.stringify(runConfig.container?.environment || {}, null, 2)}
              onChange={(e) => {
                try {
                  onChange({
                    run: {
                      ...runConfig,
                      container: {
                        ...runConfig.container,
                        environment: JSON.parse(e.target.value)
                      }
                    }
                  });
                } catch {}
              }}
              placeholder='{ "VAR": "value" }'
              rows={4}
            />
          </div>
        </>
      )}

      {runType === RUN_TYPES.SCRIPT && (
        <>
          <div className="form-group">
            <label>Language</label>
            <input
              type="text"
              value={runConfig.script?.language || ''}
              onChange={(e) => onChange({
                run: {
                  ...runConfig,
                  script: { ...runConfig.script, language: e.target.value }
                }
              })}
              placeholder="python, javascript, etc."
            />
          </div>

          <div className="form-group">
            <label>Code</label>
            <textarea
              value={runConfig.script?.code || ''}
              onChange={(e) => onChange({
                run: {
                  ...runConfig,
                  script: { ...runConfig.script, code: e.target.value }
                }
              })}
              placeholder="print('Hello World')"
              rows={10}
            />
          </div>
        </>
      )}

      {runType === RUN_TYPES.SHELL && (
        <>
          <div className="form-group">
            <label>Command</label>
            <input
              type="text"
              value={runConfig.shell?.command || ''}
              onChange={(e) => onChange({
                run: {
                  ...runConfig,
                  shell: { ...runConfig.shell, command: e.target.value }
                }
              })}
              placeholder="echo 'Hello World'"
            />
          </div>

          <div className="form-group">
            <label>Environment Variables (JSON)</label>
            <textarea
              value={JSON.stringify(runConfig.shell?.environment || {}, null, 2)}
              onChange={(e) => {
                try {
                  onChange({
                    run: {
                      ...runConfig,
                      shell: {
                        ...runConfig.shell,
                        environment: JSON.parse(e.target.value)
                      }
                    }
                  });
                } catch {}
              }}
              placeholder='{ "VAR": "value" }'
              rows={4}
            />
          </div>
        </>
      )}

      {runType === RUN_TYPES.WORKFLOW && (
        <>
          <div className="form-group">
            <label>Namespace</label>
            <input
              type="text"
              value={runConfig.workflow?.namespace || ''}
              onChange={(e) => onChange({
                run: {
                  ...runConfig,
                  workflow: { ...runConfig.workflow, namespace: e.target.value }
                }
              })}
              placeholder="zigflow"
            />
          </div>

          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={runConfig.workflow?.name || ''}
              onChange={(e) => onChange({
                run: {
                  ...runConfig,
                  workflow: { ...runConfig.workflow, name: e.target.value }
                }
              })}
              placeholder="child-workflow"
            />
          </div>

          <div className="form-group">
            <label>Version</label>
            <input
              type="text"
              value={runConfig.workflow?.version || 'latest'}
              onChange={(e) => onChange({
                run: {
                  ...runConfig,
                  workflow: { ...runConfig.workflow, version: e.target.value }
                }
              })}
              placeholder="latest"
            />
          </div>

          <div className="form-group">
            <label>Input (JSON)</label>
            <textarea
              value={JSON.stringify(runConfig.workflow?.input || {}, null, 2)}
              onChange={(e) => {
                try {
                  onChange({
                    run: {
                      ...runConfig,
                      workflow: {
                        ...runConfig.workflow,
                        input: JSON.parse(e.target.value)
                      }
                    }
                  });
                } catch {}
              }}
              placeholder='{ "param": "value" }'
              rows={6}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default RunTaskEditor;
