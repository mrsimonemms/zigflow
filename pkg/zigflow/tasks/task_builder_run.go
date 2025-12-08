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
	"bytes"
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"slices"
	"strings"

	"github.com/mrsimonemms/zigflow/pkg/utils"
	swUtil "github.com/serverlessworkflow/sdk-go/v3/impl/utils"
	"github.com/serverlessworkflow/sdk-go/v3/model"
	"go.temporal.io/api/enums/v1"
	"go.temporal.io/sdk/activity"
	"go.temporal.io/sdk/temporal"
	"go.temporal.io/sdk/worker"
	"go.temporal.io/sdk/workflow"
)

func init() {
	activities = append(activities, callScriptActivity, callShellActivity)
}

func NewRunTaskBuilder(
	temporalWorker worker.Worker,
	task *model.RunTask,
	taskName string,
	doc *model.Workflow,
) (*RunTaskBuilder, error) {
	return &RunTaskBuilder{
		builder: builder[*model.RunTask]{
			doc:            doc,
			name:           taskName,
			task:           task,
			temporalWorker: temporalWorker,
		},
	}, nil
}

type RunTaskBuilder struct {
	builder[*model.RunTask]
}

func (t *RunTaskBuilder) Build() (TemporalWorkflowFunc, error) {
	if t.task.Run.Await == nil {
		// Default to true
		t.task.Run.Await = utils.Ptr(true)
	}

	var factory TemporalWorkflowFunc
	if s := t.task.Run.Script; s != nil {
		if !slices.Contains([]string{"js", "python"}, s.Language) {
			return nil, fmt.Errorf("unknown script language '%s' for task: %s", s.Language, t.GetTaskName())
		}
		if !*t.task.Run.Await {
			return nil, fmt.Errorf("run scripts must be run with await: %s", t.GetTaskName())
		}
		if s.InlineCode == nil || *s.InlineCode == "" {
			return nil, fmt.Errorf("run script has no code defined: %s", t.GetTaskName())
		}
		factory = t.runScript
	} else if t.task.Run.Shell != nil {
		factory = t.runShell
	} else if t.task.Run.Workflow != nil {
		factory = t.runWorkflow
	} else {
		return nil, fmt.Errorf("unsupported run task: %s", t.GetTaskName())
	}

	return func(ctx workflow.Context, input any, state *utils.State) (any, error) {
		logger := workflow.GetLogger(ctx)
		logger.Debug("Run await status", "await", *t.task.Run.Await, "task", t.GetTaskName())

		res, err := factory(ctx, input, state)
		if err != nil {
			return nil, err
		}

		// Add the result to the state's data
		logger.Debug("Setting data to the state", "key", t.name)
		state.AddData(map[string]any{
			t.name: res,
		})

		return res, nil
	}, nil
}

func (t *RunTaskBuilder) executeCommand(ctx workflow.Context, activityFn, input any, state *utils.State) (any, error) {
	logger := workflow.GetLogger(ctx)
	logger.Debug("Executing a command", "task", t.GetTaskName())

	var res any
	if err := workflow.ExecuteActivity(ctx, activityFn, t.task, input, state).Get(ctx, &res); err != nil {
		if temporal.IsCanceledError(err) {
			return nil, nil
		}

		logger.Error("Error calling executing command task", "name", t.name, "error", err)
		return nil, fmt.Errorf("error calling executing command task: %w", err)
	}

	return res, nil
}

func (t *RunTaskBuilder) runScript(ctx workflow.Context, input any, state *utils.State) (any, error) {
	return t.executeCommand(ctx, callScriptActivity, input, state)
}

func (t *RunTaskBuilder) runShell(ctx workflow.Context, input any, state *utils.State) (any, error) {
	return t.executeCommand(ctx, callShellActivity, input, state)
}

func (t *RunTaskBuilder) runWorkflow(ctx workflow.Context, input any, state *utils.State) (any, error) {
	logger := workflow.GetLogger(ctx)
	logger.Debug("Running a child workflow", "task", t.GetTaskName())

	await := *t.task.Run.Await

	opts := workflow.ChildWorkflowOptions{}
	if !await {
		opts.ParentClosePolicy = enums.PARENT_CLOSE_POLICY_ABANDON
	}

	ctx = workflow.WithChildOptions(ctx, opts)

	future := workflow.ExecuteChildWorkflow(ctx, t.task.Run.Workflow.Name, input, state)

	if !await {
		logger.Warn("Not waiting for child workspace response", "task", t.GetTaskName())
		return nil, nil
	}

	var res any
	if err := future.Get(ctx, &res); err != nil {
		logger.Error("Error executiing child workflow", "error", err)
		return nil, fmt.Errorf("error executiing child workflow: %w", err)
	}
	logger.Debug("Child workflow completed", "task", t.GetTaskName())

	return res, nil
}

/**
 **************
 * Activities *
 **************
 */

func callScriptActivity(ctx context.Context, task *model.RunTask, input any, state *utils.State) (any, error) {
	command := make([]string, 0)
	var file string

	logger := activity.GetLogger(ctx)
	logger.Debug("Running call script activity")

	logger.Debug("Creating temporary directory")
	dir, err := os.MkdirTemp("", "script")
	if err != nil {
		logger.Error("Error making temp dir", "error", err)
		return nil, fmt.Errorf("error making temp dir: %w", err)
	}
	defer func() {
		if err := os.RemoveAll(dir); err != nil {
			logger.Warn("Generated script not deleted", "dir", dir, "error", err)
		}
	}()

	lang := task.Run.Script.Language
	logger.Debug("Detecting script language", "language", lang)
	switch lang {
	case "js":
		command = append(command, "node")
		file = "script.js"
	case "python":
		command = append(command, "python")
		file = "script.py"
	default:
		logger.Error("Unknown script language", "language", lang)
		return nil, fmt.Errorf("unknown script language: %s", lang)
	}

	fname := filepath.Join(dir, file)
	logger.Debug("Writing script to disk", "file", fname)
	command = append(command, fname)
	if err := os.WriteFile(fname, []byte(*task.Run.Script.InlineCode), 0o600); err != nil {
		logger.Error("Error writing script to disk", "file", fname, "error", err)
		return nil, fmt.Errorf("error writing code to script: %w", err)
	}

	return runExecCommand(
		ctx,
		command,
		task.Run.Script.Arguments,
		task.Run.Script.Environment,
		state,
		dir,
	)
}

func callShellActivity(ctx context.Context, task *model.RunTask, input any, state *utils.State) (any, error) {
	logger := activity.GetLogger(ctx)
	logger.Debug("Running call script activity")

	return runExecCommand(
		ctx,
		[]string{task.Run.Shell.Command},
		task.Run.Shell.Arguments,
		task.Run.Shell.Environment,
		state,
		"",
	)
}

// runExecCommand a general purpose function to build and execute a command in an activity
func runExecCommand(
	ctx context.Context,
	command []string,
	args *model.RunArguments,
	env map[string]string,
	state *utils.State,
	dir string,
) (any, error) {
	logger := activity.GetLogger(ctx)

	if args == nil {
		args = &model.RunArguments{}
	}
	if env == nil {
		env = map[string]string{}
	}

	state = state.Clone().AddActivityInfo(ctx)

	logger.Debug("Interpolating command arguments and envvars")
	data, err := utils.TraverseAndEvaluateObj(model.NewObjectOrRuntimeExpr(map[string]any{
		"args": swUtil.DeepCloneValue(args.AsSlice()),
		"env":  swUtil.DeepCloneValue(env),
	}), state)
	if err != nil {
		return nil, fmt.Errorf("error traversing task parameters: %w", err)
	}

	command = append(command, data["args"].([]string)...)

	envvars := make([]string, 0)
	for k, v := range data["env"].(map[string]string) {
		envvars = append(envvars, fmt.Sprintf("%s=%v", k, v))
	}

	var stderr bytes.Buffer
	var stdout bytes.Buffer
	//nolint:gosec // Allow dynamic commands
	cmd := exec.CommandContext(ctx, command[0], command[1:]...)
	cmd.Env = envvars
	cmd.Stderr = &stderr
	cmd.Stdout = &stdout

	if dir != "" {
		cmd.Dir = dir
	}

	logger.Info("Running command on worker", "command", command)
	if err := cmd.Run(); err != nil {
		if exitErr, ok := err.(*exec.ExitError); ok {
			// The command received an exit code above 0 - return as-is
			logger.Error("Shell error", "error", err)
			return nil, temporal.NewApplicationErrorWithCause("Error calling command", "command", exitErr, stderr.String())
		}
		logger.Error("Error running command", "error", err)
		return nil, fmt.Errorf("error running command: %w", err)
	}

	return strings.TrimSpace(stdout.String()), nil
}
