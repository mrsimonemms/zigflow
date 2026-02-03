import React, { useState } from 'react';
import { CALL_TYPES } from '../../constants/taskTypes';

function CallTaskEditor({ task, onChange }) {
  const [callType, setCallType] = useState(task.call || CALL_TYPES.HTTP);
  const withConfig = task.with || {};

  const handleCallTypeChange = (newType) => {
    setCallType(newType);
    onChange({ call: newType, with: {} });
  };

  const handleWithChange = (updates) => {
    onChange({ call: callType, with: { ...withConfig, ...updates } });
  };

  return (
    <div className="property-section">
      <h4>Call Configuration</h4>

      <div className="form-group">
        <label>Call Type</label>
        <select value={callType} onChange={(e) => handleCallTypeChange(e.target.value)}>
          <option value={CALL_TYPES.HTTP}>HTTP</option>
          <option value={CALL_TYPES.GRPC}>gRPC</option>
          <option value={CALL_TYPES.OPENAPI}>OpenAPI</option>
          <option value={CALL_TYPES.ASYNCAPI}>AsyncAPI</option>
          <option value={CALL_TYPES.A2A}>A2A</option>
          <option value={CALL_TYPES.MCP}>MCP</option>
          <option value="function">Function</option>
        </select>
      </div>

      {callType === CALL_TYPES.HTTP && (
        <>
          <div className="form-group">
            <label>Method</label>
            <select
              value={withConfig.method || 'get'}
              onChange={(e) => handleWithChange({ method: e.target.value })}
            >
              <option value="get">GET</option>
              <option value="post">POST</option>
              <option value="put">PUT</option>
              <option value="patch">PATCH</option>
              <option value="delete">DELETE</option>
              <option value="head">HEAD</option>
              <option value="options">OPTIONS</option>
            </select>
          </div>

          <div className="form-group">
            <label>Endpoint</label>
            <input
              type="text"
              value={typeof withConfig.endpoint === 'string' ? withConfig.endpoint : withConfig.endpoint?.uri || ''}
              onChange={(e) => handleWithChange({ endpoint: e.target.value })}
              placeholder="https://api.example.com/resource"
            />
          </div>

          <div className="form-group">
            <label>Headers (JSON)</label>
            <textarea
              value={JSON.stringify(withConfig.headers || {}, null, 2)}
              onChange={(e) => {
                try {
                  handleWithChange({ headers: JSON.parse(e.target.value) });
                } catch {}
              }}
              placeholder='{ "Content-Type": "application/json" }'
              rows={4}
            />
          </div>

          <div className="form-group">
            <label>Body (JSON)</label>
            <textarea
              value={typeof withConfig.body === 'string' ? withConfig.body : JSON.stringify(withConfig.body || {}, null, 2)}
              onChange={(e) => {
                try {
                  handleWithChange({ body: JSON.parse(e.target.value) });
                } catch {
                  handleWithChange({ body: e.target.value });
                }
              }}
              placeholder='{ "key": "value" }'
              rows={4}
            />
          </div>

          <div className="form-group">
            <label>Query Parameters (JSON)</label>
            <textarea
              value={JSON.stringify(withConfig.query || {}, null, 2)}
              onChange={(e) => {
                try {
                  handleWithChange({ query: JSON.parse(e.target.value) });
                } catch {}
              }}
              placeholder='{ "param": "value" }'
              rows={3}
            />
          </div>
        </>
      )}

      {callType === 'function' && (
        <>
          <div className="form-group">
            <label>Function Name</label>
            <input
              type="text"
              value={task.call || ''}
              onChange={(e) => onChange({ call: e.target.value, with: withConfig })}
              placeholder="myFunction"
            />
          </div>

          <div className="form-group">
            <label>Arguments (JSON)</label>
            <textarea
              value={JSON.stringify(withConfig || {}, null, 2)}
              onChange={(e) => {
                try {
                  onChange({ call: task.call, with: JSON.parse(e.target.value) });
                } catch {}
              }}
              placeholder='{ "arg1": "value1" }'
              rows={6}
            />
          </div>
        </>
      )}

      {callType === CALL_TYPES.GRPC && (
        <>
          <div className="form-group">
            <label>Proto Endpoint</label>
            <input
              type="text"
              value={withConfig.proto?.endpoint || ''}
              onChange={(e) => handleWithChange({
                proto: { ...withConfig.proto, endpoint: e.target.value }
              })}
              placeholder="https://example.com/proto/service.proto"
            />
          </div>

          <div className="form-group">
            <label>Service Name</label>
            <input
              type="text"
              value={withConfig.service?.name || ''}
              onChange={(e) => handleWithChange({
                service: { ...withConfig.service, name: e.target.value }
              })}
              placeholder="MyService"
            />
          </div>

          <div className="form-group">
            <label>Service Host</label>
            <input
              type="text"
              value={withConfig.service?.host || ''}
              onChange={(e) => handleWithChange({
                service: { ...withConfig.service, host: e.target.value }
              })}
              placeholder="grpc.example.com"
            />
          </div>

          <div className="form-group">
            <label>Service Port</label>
            <input
              type="number"
              value={withConfig.service?.port || ''}
              onChange={(e) => handleWithChange({
                service: { ...withConfig.service, port: parseInt(e.target.value) || 50051 }
              })}
              placeholder="50051"
            />
          </div>

          <div className="form-group">
            <label>Method</label>
            <input
              type="text"
              value={withConfig.method || ''}
              onChange={(e) => handleWithChange({ method: e.target.value })}
              placeholder="GetUser"
            />
          </div>

          <div className="form-group">
            <label>Arguments (JSON)</label>
            <textarea
              value={JSON.stringify(withConfig.arguments || {}, null, 2)}
              onChange={(e) => {
                try {
                  handleWithChange({ arguments: JSON.parse(e.target.value) });
                } catch {}
              }}
              placeholder='{ "id": 123 }'
              rows={4}
            />
          </div>
        </>
      )}

      {callType === CALL_TYPES.OPENAPI && (
        <>
          <div className="form-group">
            <label>Document Endpoint</label>
            <input
              type="text"
              value={withConfig.document?.endpoint || ''}
              onChange={(e) => handleWithChange({
                document: { ...withConfig.document, endpoint: e.target.value }
              })}
              placeholder="https://api.example.com/openapi.json"
            />
          </div>

          <div className="form-group">
            <label>Operation ID</label>
            <input
              type="text"
              value={withConfig.operationId || ''}
              onChange={(e) => handleWithChange({ operationId: e.target.value })}
              placeholder="getUserById"
            />
          </div>

          <div className="form-group">
            <label>Parameters (JSON)</label>
            <textarea
              value={JSON.stringify(withConfig.parameters || {}, null, 2)}
              onChange={(e) => {
                try {
                  handleWithChange({ parameters: JSON.parse(e.target.value) });
                } catch {}
              }}
              placeholder='{ "userId": 123 }'
              rows={4}
            />
          </div>
        </>
      )}

      {(callType === CALL_TYPES.HTTP || callType === CALL_TYPES.OPENAPI) && (
        <div className="form-group">
          <label>Output Format</label>
          <select
            value={withConfig.output || 'content'}
            onChange={(e) => handleWithChange({ output: e.target.value })}
          >
            <option value="content">Content (default)</option>
            <option value="raw">Raw</option>
            <option value="response">Response</option>
          </select>
        </div>
      )}
    </div>
  );
}

export default CallTaskEditor;
