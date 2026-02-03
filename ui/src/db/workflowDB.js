import Dexie from 'dexie';

export const db = new Dexie('ZigflowWorkflows');

db.version(1).stores({
  workflows: '++id, name, namespace, version, updatedAt, createdAt'
});

export async function saveWorkflow(workflow) {
  const now = new Date().toISOString();
  const data = {
    ...workflow,
    updatedAt: now,
    createdAt: workflow.createdAt || now
  };

  if (workflow.id) {
    await db.workflows.update(workflow.id, data);
    return workflow.id;
  } else {
    return await db.workflows.add(data);
  }
}

export async function getWorkflow(id) {
  return await db.workflows.get(id);
}

export async function getAllWorkflows() {
  return await db.workflows.toArray();
}

export async function deleteWorkflow(id) {
  return await db.workflows.delete(id);
}

export async function searchWorkflows(query) {
  return await db.workflows
    .filter(wf =>
      wf.name?.includes(query) ||
      wf.namespace?.includes(query) ||
      wf.document?.title?.includes(query)
    )
    .toArray();
}
