/*
 * Copyright 2025 - 2026 Zigflow authors <https://github.com/mrsimonemms/zigflow/graphs/contributors>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// Zigflow Visual Editor — Pure Validation Logic
//
// All functions are pure and operate on the IR only.
// Errors carry a path array (breadcrumb into the model) for precise reporting.
import type {
  FlowGraph,
  ForkNode,
  LoopNode,
  NamedWorkflow,
  Node,
  SwitchNode,
  TryNode,
  WorkflowFile,
} from './model';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ValidationError = {
  path: string[];
  message: string;
};

export type ValidationResult = {
  valid: boolean;
  errors: ValidationError[];
};

// ---------------------------------------------------------------------------
// Entry points
// ---------------------------------------------------------------------------

export function validateWorkflowFile(file: WorkflowFile): ValidationResult {
  const errors: ValidationError[] = [];

  if (file.order.length === 0) {
    errors.push({
      path: ['workflows'],
      message: 'At least one workflow is required',
    });
  }

  for (const id of file.order) {
    const workflow = file.workflows[id];
    if (!workflow) {
      errors.push({
        path: ['workflows', id],
        message: `Workflow ${id} referenced in order[] but not found in workflows`,
      });
      continue;
    }
    errors.push(...validateNamedWorkflow(workflow, ['workflows', id]));
  }

  // Detect workflow IDs in workflows map that are not in order[]
  for (const id of Object.keys(file.workflows)) {
    if (!file.order.includes(id)) {
      errors.push({
        path: ['workflows', id],
        message: `Workflow ${id} is in workflows map but missing from order[]`,
      });
    }
  }

  return { valid: errors.length === 0, errors };
}

// ---------------------------------------------------------------------------
// Internal validators
// ---------------------------------------------------------------------------

function validateNamedWorkflow(
  workflow: NamedWorkflow,
  path: string[],
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!workflow.name.trim()) {
    errors.push({
      path: [...path, 'name'],
      message: 'Workflow name is required',
    });
  }

  errors.push(...validateFlowGraph(workflow.root, [...path, 'root']));
  return errors;
}

function validateFlowGraph(
  graph: FlowGraph,
  path: string[],
): ValidationError[] {
  const errors: ValidationError[] = [];
  const nodeIds = new Set(Object.keys(graph.nodes));

  // order[] must only reference IDs that exist in nodes
  for (const id of graph.order) {
    if (!nodeIds.has(id)) {
      errors.push({
        path: [...path, 'order'],
        message: `Node ${id} in order[] is not present in nodes`,
      });
    }
  }

  // Every node in nodes must appear in order[]
  const orderSet = new Set(graph.order);
  for (const id of nodeIds) {
    if (!orderSet.has(id)) {
      errors.push({
        path: [...path, 'nodes', id],
        message: `Node ${id} is in nodes but missing from order[]`,
      });
    }
  }

  // Validate each node
  for (const id of graph.order) {
    const node = graph.nodes[id];
    if (node) {
      errors.push(...validateNode(node, [...path, 'nodes', id]));
    }
  }

  return errors;
}

function validateNode(node: Node, path: string[]): ValidationError[] {
  switch (node.type) {
    case 'task':
      return validateTaskNode(path);
    case 'switch':
      return validateSwitchNode(node, path);
    case 'fork':
      return validateForkNode(node, path);
    case 'try':
      return validateTryNode(node, path);
    case 'loop':
      return validateLoopNode(node, path);
  }
}

function validateTaskNode(path: string[]): ValidationError[] {
  // Task nodes are validated at the config level; structural checks go here.
  // Name is validated by the FlowGraph level (nodes have IDs, not names).
  // For now, no additional structural rules on leaf tasks.
  void path;
  return [];
}

function validateSwitchNode(
  node: SwitchNode,
  path: string[],
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (node.branches.length === 0) {
    errors.push({
      path,
      message: 'Switch node must have at least one branch',
    });
    return errors;
  }

  const defaultBranches = node.branches.filter(
    (b) => b.condition === undefined,
  );
  if (defaultBranches.length > 1) {
    errors.push({
      path,
      message: 'Switch node may have at most one default branch (no condition)',
    });
  }

  for (const branch of node.branches) {
    if (!branch.label.trim()) {
      errors.push({
        path: [...path, 'branches', branch.id],
        message: 'Branch label is required',
      });
    }
    errors.push(
      ...validateFlowGraph(branch.graph, [
        ...path,
        'branches',
        branch.id,
        'graph',
      ]),
    );
  }

  return errors;
}

function validateForkNode(node: ForkNode, path: string[]): ValidationError[] {
  const errors: ValidationError[] = [];

  if (node.branches.length < 2) {
    errors.push({
      path,
      message: 'Fork node must have at least two branches',
    });
  }

  for (const branch of node.branches) {
    if (!branch.label.trim()) {
      errors.push({
        path: [...path, 'branches', branch.id],
        message: 'Branch label is required',
      });
    }
    errors.push(
      ...validateFlowGraph(branch.graph, [
        ...path,
        'branches',
        branch.id,
        'graph',
      ]),
    );
  }

  return errors;
}

function validateTryNode(node: TryNode, path: string[]): ValidationError[] {
  const errors: ValidationError[] = [];
  errors.push(...validateFlowGraph(node.tryGraph, [...path, 'tryGraph']));
  if (node.catchGraph) {
    errors.push(...validateFlowGraph(node.catchGraph, [...path, 'catchGraph']));
  }
  return errors;
}

function validateLoopNode(node: LoopNode, path: string[]): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!node.in.trim()) {
    errors.push({
      path: [...path, 'in'],
      message: "Loop 'in' expression is required",
    });
  }

  errors.push(...validateFlowGraph(node.bodyGraph, [...path, 'bodyGraph']));
  return errors;
}
