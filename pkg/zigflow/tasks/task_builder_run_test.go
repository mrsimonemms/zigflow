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
	"testing"

	"github.com/mrsimonemms/zigflow/pkg/utils"
	"github.com/serverlessworkflow/sdk-go/v3/model"
	"github.com/stretchr/testify/assert"
	"go.temporal.io/sdk/testsuite"
	"go.temporal.io/sdk/workflow"
)

func TestRunTaskBuilderBuildSetsAwaitDefault(t *testing.T) {
	task := &model.RunTask{
		Run: model.RunTaskConfiguration{
			Workflow: &model.RunWorkflow{
				Namespace: "default",
				Name:      "child-runner",
				Version:   "1.0.0",
			},
		},
	}

	builder, err := NewRunTaskBuilder(nil, task, "run-task", nil)
	assert.NoError(t, err)

	fn, err := builder.Build()
	assert.NoError(t, err)
	assert.NotNil(t, fn)

	var s testsuite.WorkflowTestSuite
	env := s.NewTestWorkflowEnvironment()

	env.RegisterWorkflowWithOptions(func(ctx workflow.Context, input any, state *utils.State) (any, error) {
		return nil, nil
	}, workflow.RegisterOptions{Name: task.Run.Workflow.Name})

	env.RegisterWorkflowWithOptions(func(ctx workflow.Context) (any, error) {
		return fn(ctx, map[string]any{}, utils.NewState())
	}, workflow.RegisterOptions{Name: "run-default-await"})

	env.ExecuteWorkflow("run-default-await")
	assert.NoError(t, env.GetWorkflowError())
	assert.NotNil(t, task.Run.Await)
	assert.True(t, *task.Run.Await)
}

func TestRunTaskBuilderRunWorkflow(t *testing.T) {
	tests := []struct {
		name          string
		await         *bool
		expectNilResp bool
	}{
		{
			name:          "await child workflow result",
			await:         utils.Ptr(true),
			expectNilResp: false,
		},
		{
			name:          "skip await returns nil response",
			await:         utils.Ptr(false),
			expectNilResp: true,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			task := &model.RunTask{
				Run: model.RunTaskConfiguration{
					Await: tc.await,
					Workflow: &model.RunWorkflow{
						Namespace: "default",
						Name:      "child-runner",
						Version:   "1.0.0",
					},
				},
			}

			builder, err := NewRunTaskBuilder(nil, task, "run-task", nil)
			assert.NoError(t, err)

			fn, err := builder.Build()
			assert.NoError(t, err)

			var s testsuite.WorkflowTestSuite
			env := s.NewTestWorkflowEnvironment()

			env.RegisterWorkflowWithOptions(func(ctx workflow.Context, input any, state *utils.State) (any, error) {
				return map[string]any{
					"child": "done",
				}, nil
			}, workflow.RegisterOptions{Name: task.Run.Workflow.Name})

			env.RegisterWorkflowWithOptions(func(ctx workflow.Context) (any, error) {
				return fn(ctx, map[string]any{"request": "data"}, utils.NewState())
			}, workflow.RegisterOptions{Name: "run-" + tc.name})

			env.ExecuteWorkflow("run-" + tc.name)
			assert.NoError(t, env.GetWorkflowError())

			var result any
			err = env.GetWorkflowResult(&result)

			if tc.expectNilResp {
				assert.EqualError(t, err, "no data available")
				assert.Nil(t, result)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, map[string]any{"child": "done"}, result)
			}
		})
	}
}
