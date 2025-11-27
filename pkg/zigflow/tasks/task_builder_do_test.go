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

func TestDoTaskBuilderWorkflowExecutor(t *testing.T) {
	t.Helper()

	tests := []struct {
		name         string
		initialState *utils.State
		expectedEnv  map[string]any
	}{
		{
			name:         "initialises new state when not provided",
			initialState: nil,
			expectedEnv: map[string]any{
				"APP_ENV": "test",
			},
		},
		{
			name: "reuses provided state without overriding env",
			initialState: func() *utils.State {
				s := utils.NewState()
				s.Env["from"] = "caller"
				return s
			}(),
			expectedEnv: map[string]any{
				"from": "caller",
			},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Helper()

			builder := &DoTaskBuilder{
				builder: builder[*model.DoTask]{
					doc:  &model.Workflow{},
					name: "test-workflow",
					task: &model.DoTask{},
				},
				opts: DoTaskOpts{
					Envvars: map[string]any{
						"APP_ENV": "test",
					},
				},
			}

			var capturedState *utils.State
			runOrder := make([]string, 0, 2)
			expectedOutput := map[string]any{
				"first": map[string]any{
					"value": "one",
				},
				"second": map[string]any{
					"value": "two",
				},
			}

			tasks := newOutputWorkflowFuncs(&runOrder, &capturedState)
			wf := builder.workflowExecutor(tasks)

			var s testsuite.WorkflowTestSuite
			env := s.NewTestWorkflowEnvironment()

			inputPayload := map[string]any{
				"request_id": tc.name,
			}
			workflowName := "workflow-" + tc.name

			env.RegisterWorkflowWithOptions(func(ctx workflow.Context) (any, error) {
				result, err := wf(ctx, inputPayload, tc.initialState)
				return result, err
			}, workflow.RegisterOptions{Name: workflowName})

			env.ExecuteWorkflow(workflowName)

			assert.NoError(t, env.GetWorkflowError())

			var workflowResult map[string]any
			assert.NoError(t, env.GetWorkflowResult(&workflowResult))
			assert.Equal(t, expectedOutput, workflowResult)

			assert.Equal(t, []string{"task-one", "task-two"}, runOrder)
			assert.NotNil(t, capturedState)
			if tc.initialState != nil {
				assert.Same(t, tc.initialState, capturedState)
			} else {
				assert.Equal(t, inputPayload, capturedState.Input)
			}
			assert.Equal(t, tc.expectedEnv, capturedState.Env)
			assert.Equal(t, expectedOutput, capturedState.Output)
		})
	}
}

func TestDoTaskBuilderIterateTasksFlowControl(t *testing.T) {
	t.Helper()

	tests := []struct {
		name        string
		setup       func(runOrder *[]string) []workflowFunc
		expectedRun []string
		expectErr   string
	}{
		{
			name: "non-enum flow directive jumps to named task",
			setup: func(runOrder *[]string) []workflowFunc {
				return []workflowFunc{
					newSimpleWorkflowFunc("task-a", &model.TaskBase{
						Then: &model.FlowDirective{
							Value: "task-c",
						},
					}, runOrder),
					newSimpleWorkflowFunc("task-b", &model.TaskBase{}, runOrder),
					newSimpleWorkflowFunc("task-c", &model.TaskBase{}, runOrder),
				}
			},
			expectedRun: []string{"task-a", "task-c"},
		},
		{
			name: "missing target returns descriptive error",
			setup: func(runOrder *[]string) []workflowFunc {
				return []workflowFunc{
					newSimpleWorkflowFunc("task-a", &model.TaskBase{
						Then: &model.FlowDirective{
							Value: "task-c",
						},
					}, runOrder),
					newSimpleWorkflowFunc("task-b", &model.TaskBase{}, runOrder),
				}
			},
			expectedRun: []string{"task-a"},
			expectErr:   "next target specified but not found: task-c",
		},
		{
			name: "termination directive stops iteration",
			setup: func(runOrder *[]string) []workflowFunc {
				return []workflowFunc{
					newSimpleWorkflowFunc("task-end", &model.TaskBase{
						Then: &model.FlowDirective{
							Value: string(model.FlowDirectiveEnd),
						},
					}, runOrder),
					newSimpleWorkflowFunc("task-b", &model.TaskBase{}, runOrder),
				}
			},
			expectedRun: []string{"task-end"},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Helper()

			builder := &DoTaskBuilder{
				builder: builder[*model.DoTask]{
					doc:  &model.Workflow{},
					name: "iterate-workflow",
					task: &model.DoTask{},
				},
			}

			runOrder := make([]string, 0)
			tasks := tc.setup(&runOrder)

			var s testsuite.WorkflowTestSuite
			env := s.NewTestWorkflowEnvironment()
			workflowName := "iterate-" + tc.name

			env.RegisterWorkflowWithOptions(func(ctx workflow.Context) (any, error) {
				err := builder.iterateTasks(ctx, tasks, nil, utils.NewState())
				return nil, err
			}, workflow.RegisterOptions{Name: workflowName})

			env.ExecuteWorkflow(workflowName)

			err := env.GetWorkflowError()
			if tc.expectErr != "" {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tc.expectErr)
			} else {
				assert.NoError(t, err)
			}

			assert.Equal(t, tc.expectedRun, runOrder)
		})
	}
}

func newOutputWorkflowFuncs(runOrder *[]string, capturedState **utils.State) []workflowFunc {
	taskOneBase := &model.TaskBase{
		Export: &model.Export{
			As: model.NewObjectOrRuntimeExpr("first"),
		},
	}
	taskTwoBase := &model.TaskBase{
		Export: &model.Export{
			As: model.NewObjectOrRuntimeExpr("second"),
		},
	}

	taskOneBuilder := newFakeTaskBuilder("task-one", taskOneBase)
	taskTwoBuilder := newFakeTaskBuilder("task-two", taskTwoBase)

	return []workflowFunc{
		{
			TaskBuilder: taskOneBuilder,
			Name:        taskOneBuilder.GetTaskName(),
			Func: func(ctx workflow.Context, input any, state *utils.State) (any, error) {
				*capturedState = state
				*runOrder = append(*runOrder, "task-one")
				return map[string]any{
					"value": "one",
				}, nil
			},
		},
		{
			TaskBuilder: taskTwoBuilder,
			Name:        taskTwoBuilder.GetTaskName(),
			Func: func(ctx workflow.Context, input any, state *utils.State) (any, error) {
				*runOrder = append(*runOrder, "task-two")
				return map[string]any{
					"value": "two",
				}, nil
			},
		},
	}
}

func newSimpleWorkflowFunc(name string, base *model.TaskBase, runOrder *[]string) workflowFunc {
	tb := newFakeTaskBuilder(name, base)
	return workflowFunc{
		TaskBuilder: tb,
		Name:        name,
		Func: func(ctx workflow.Context, input any, state *utils.State) (any, error) {
			*runOrder = append(*runOrder, name)
			return nil, nil
		},
	}
}

type fakeTaskBuilder struct {
	name         string
	task         model.Task
	shouldRun    bool
	shouldRunErr error
	parseErr     error
}

func newFakeTaskBuilder(name string, base *model.TaskBase) *fakeTaskBuilder {
	return &fakeTaskBuilder{
		name:      name,
		task:      &mockTask{base: base},
		shouldRun: true,
	}
}

func (f *fakeTaskBuilder) Build() (TemporalWorkflowFunc, error) {
	return nil, nil
}

func (f *fakeTaskBuilder) GetTask() model.Task {
	return f.task
}

func (f *fakeTaskBuilder) GetTaskName() string {
	return f.name
}

func (f *fakeTaskBuilder) ParseMetadata(workflow.Context, *utils.State) error {
	return f.parseErr
}

func (f *fakeTaskBuilder) PostLoad() error {
	return nil
}

func (f *fakeTaskBuilder) ShouldRun(*utils.State) (bool, error) {
	if f.shouldRunErr != nil {
		return false, f.shouldRunErr
	}
	return f.shouldRun, nil
}
