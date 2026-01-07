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

package activities

import (
	"bytes"
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"github.com/mrsimonemms/zigflow/pkg/utils"
	swUtil "github.com/serverlessworkflow/sdk-go/v3/impl/utils"
	"github.com/serverlessworkflow/sdk-go/v3/model"
	"go.temporal.io/sdk/activity"
	"go.temporal.io/sdk/temporal"
)

func init() {
	Registry = append(Registry, &Run{})
}

type Run struct{}

func (r *Run) CallScriptActivity(ctx context.Context, task *model.RunTask, input any, state *utils.State) (any, error) {
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

	return r.runExecCommand(
		ctx,
		command,
		task.Run.Script.Arguments,
		task.Run.Script.Environment,
		state,
		dir,
	)
}

func (r *Run) CallShellActivity(ctx context.Context, task *model.RunTask, input any, state *utils.State) (any, error) {
	logger := activity.GetLogger(ctx)
	logger.Debug("Running call script activity")

	return r.runExecCommand(
		ctx,
		[]string{task.Run.Shell.Command},
		task.Run.Shell.Arguments,
		task.Run.Shell.Environment,
		state,
		"",
	)
}

// runExecCommand a general purpose function to build and execute a command in an activity
func (r *Run) runExecCommand(
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
	d, err := utils.TraverseAndEvaluateObj(model.NewObjectOrRuntimeExpr(map[string]any{
		"args": swUtil.DeepCloneValue(args.AsSlice()),
		"env":  swUtil.DeepCloneValue(env),
	}), nil, state)
	if err != nil {
		return nil, fmt.Errorf("error traversing task parameters: %w", err)
	}
	data := d.(map[string]any)

	// Cast the arg to a string
	for _, v := range data["args"].([]any) {
		command = append(command, fmt.Sprintf("%v", v))
	}

	envvars := os.Environ()
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
			logger.Error("Shell error",
				"error", err,
				"command", command,
				"stderr", r.stdToString(stdout),
				"stdout", r.stdToString(stdout),
			)
			return nil, temporal.NewApplicationErrorWithCause(
				"Error calling command",
				"command",
				exitErr,
				map[string]any{
					"command": command,
					"stderr":  r.stdToString(stderr),
					"stdout":  r.stdToString(stdout),
				},
			)
		}
		logger.Error("Error running command", "error", err)
		return nil, fmt.Errorf("error running command: %w", err)
	}

	return r.stdToString(stdout), nil
}

func (r *Run) stdToString(std bytes.Buffer) string {
	return strings.TrimSpace(std.String())
}
