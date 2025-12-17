/*
 * Copyright 2025 Zigflow authors <https://github.com/mrsimonemms/zigflow/graphs/contributors>
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

package tasks

import (
	"fmt"

	"github.com/mrsimonemms/zigflow/pkg/utils"
	"github.com/serverlessworkflow/sdk-go/v3/model"
	"go.temporal.io/sdk/temporal"
	"go.temporal.io/sdk/worker"
	"go.temporal.io/sdk/workflow"
)

// @link: https://github.com/serverlessworkflow/specification/blob/main/dsl-reference.md#http-response
type HTTPResponse struct {
	Request    HTTPRequest       `json:"request"`
	StatusCode int               `json:"statusCode"`
	Headers    map[string]string `json:"headers,omitempty"`
	Content    any               `json:"content,omitempty"`
}

// @link: https://github.com/serverlessworkflow/specification/blob/main/dsl-reference.md#http-request
type HTTPRequest struct {
	Method  string            `json:"method"`
	URI     string            `json:"uri"`
	Headers map[string]string `json:"headers,omitempty"`
}

func NewCallHTTPTaskBuilder(
	temporalWorker worker.Worker,
	task *model.CallHTTP,
	taskName string,
	doc *model.Workflow,
) (*CallHTTPTaskBuilder, error) {
	return &CallHTTPTaskBuilder{
		builder: builder[*model.CallHTTP]{
			doc:            doc,
			name:           taskName,
			task:           task,
			temporalWorker: temporalWorker,
		},
	}, nil
}

type CallHTTPTaskBuilder struct {
	builder[*model.CallHTTP]
}

func (t *CallHTTPTaskBuilder) Build() (TemporalWorkflowFunc, error) {
	return func(ctx workflow.Context, input any, state *utils.State) (any, error) {
		logger := workflow.GetLogger(ctx)
		logger.Debug("Calling HTTP endpoint", "name", t.name)

		var res any
		if err := workflow.ExecuteActivity(ctx, (*CallActivities).CallHTTPActivity, t.task, input, state).Get(ctx, &res); err != nil {
			if temporal.IsCanceledError(err) {
				return nil, nil
			}

			logger.Error("Error calling HTTP task", "name", t.name, "error", err)
			return nil, fmt.Errorf("error calling http task: %w", err)
		}

		// Add the result to the state's data
		logger.Debug("Setting data to the state", "key", t.name)
		state.AddData(map[string]any{
			t.name: res,
		})

		return res, nil
	}, nil
}
