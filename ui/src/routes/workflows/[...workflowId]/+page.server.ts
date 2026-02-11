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
import { detectTaskTypeFromNode } from '$lib/export/taskTypeDetector';
import {
  type TranslationOptions,
  filterSystemNodes,
  translateGraph,
} from '$lib/export/workflowTranslator';
import { fromYAML } from '$lib/tasks';

import type { PageServerLoad } from './$types';

const workflowContent = `# This is a simple Serverless Workflow that will be
# translated into a Temporal workflow
document:
  dsl: 1.0.0
  namespace: zigflow # Mapped to the task queue
  name: example # Workflow name
  version: 0.0.1
  title: Example Workflow
  summary: An example of how to use Serverless Workflow to define Temporal Workflows
timeout:
  after:
    minutes: 1
# Validate the input schema
input:
  schema:
    format: json
    document:
      type: object
      required:
        - userId
      properties:
        userId:
          type: number
do:
  # Set some data to the state
  - step1:
      export:
        as:
          data: \${ . }
      set:
        # Set a variable from an envvar
        envvar: \${ $env.EXAMPLE_ENVVAR }
        # Generate a UUID at a workflow level
        uuid: \${ uuid }
  # Pause the workflow
  - wait:
      wait:
        seconds: 5
  # Make an HTTP call, using the userId received from the input
  - getUser:
      call: http
      # Expose the response to the output
      output:
        as: '\${ $context + { user: . }}'
      with:
        method: get
        endpoint: \${ "https://jsonplaceholder.typicode.com/users/" + ($input.userId | tostring) }
`;

export const load: PageServerLoad = () => {
  const workflow = fromYAML(workflowContent);
  const graph = workflow.toGraph();

  // Configure translation options for Zigflow tasks
  const translationOptions: TranslationOptions = {
    nodeSpacing: { horizontal: 250, vertical: 150 },
    autoLayout: true,
    nodeDataExtractor: (node) => {
      // Extract task-specific data
      const nodeData = node as Record<string, unknown>;

      return {
        label: nodeData.label || nodeData.id || 'Unnamed Node',
        // Preserve any additional metadata
        ...((nodeData.data as Record<string, unknown>) || {}),
      };
    },
  };

  // Translate the graph with Zigflow-specific options
  const translatedGraph = translateGraph(graph, translationOptions);

  // Filter out system entry/exit nodes for cleaner visualization
  const filteredGraph = filterSystemNodes(translatedGraph, {
    keepEntry: false,
    keepExit: false,
  });

  // Detect and apply proper task types to nodes
  const enhancedNodes = filteredGraph.nodes.map((node) => {
    const taskType = detectTaskTypeFromNode(node as Record<string, unknown>);
    return {
      ...node,
      type: taskType,
    };
  });

  return {
    graph: {
      ...filteredGraph,
      nodes: enhancedNodes,
    },
  };
};
