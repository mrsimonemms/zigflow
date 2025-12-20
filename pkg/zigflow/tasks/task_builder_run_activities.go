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
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/mrsimonemms/zigflow/pkg/utils"
	swUtil "github.com/serverlessworkflow/sdk-go/v3/impl/utils"
	"github.com/serverlessworkflow/sdk-go/v3/model"
	"go.temporal.io/sdk/activity"
	"go.temporal.io/sdk/temporal"
	batchv1 "k8s.io/api/batch/v1"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/clientcmd"
)

func init() {
	activitiesRegistry = append(activitiesRegistry, &RunActivities{})
}

type RunActivities struct{}

func (r *RunActivities) CallContainerActivity(
	ctx context.Context, task *model.RunTask, input any, state *utils.State,
) (any, error) {
	logger := activity.GetLogger(ctx)
	logger.Debug("Running call container activity")

	// _, hasServiceHost := os.LookupEnv("KUBERNETES_SERVICE_HOST")
	// _, hasServicePort := os.LookupEnv("KUBERNETES_SERVICE_PORT")
	hasServiceHost := true
	hasServicePort := true

	if hasServiceHost && hasServicePort {
		logger.Debug("Detecting as Kubernetes")
		return r.runKubernetesCommand(ctx, task, state)
	}

	return r.runDockerCommand(ctx, task, state)
}

func (r *RunActivities) CallScriptActivity(ctx context.Context, task *model.RunTask, input any, state *utils.State) (any, error) {
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

func (r *RunActivities) CallShellActivity(ctx context.Context, task *model.RunTask, input any, state *utils.State) (any, error) {
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

func (r *RunActivities) runDockerCommand(ctx context.Context, task *model.RunTask, state *utils.State) (any, error) {
	logger := activity.GetLogger(ctx)
	logger.Debug("Running Docker container")

	info := activity.GetInfo(ctx)

	if _, err := exec.LookPath("docker"); err != nil {
		return nil, temporal.NewNonRetryableApplicationError("Docker not installed", "container", err)
	}

	containerName := uuid.NewString()
	if n := task.Run.Container.Name; n != "" {
		containerName = n
	}

	cmd := []string{
		"docker",
		"run",
		"--pull=always",
		fmt.Sprintf("--label=workflowId=%s", info.WorkflowExecution.ID),
		fmt.Sprintf("--label=runId=%s", info.WorkflowExecution.RunID),
		fmt.Sprintf("--label=activityId=%s", info.ActivityID),
		fmt.Sprintf("--name=%s", containerName),
	}

	if c := task.Run.Container.Command; c != "" {
		cmd = append(cmd, fmt.Sprintf("--entrypoint=%s", c))
	}

	if task.Run.Container.Lifetime == nil || task.Run.Container.Lifetime.Cleanup == "always" {
		cmd = append(cmd, "--rm")
	}

	if envs := task.Run.Container.Environment; envs != nil {
		for k, v := range envs {
			cmd = append(cmd, fmt.Sprintf("--env=%s=%s", k, v))
		}
	}

	if vols := task.Run.Container.Volumes; vols != nil {
		for k, remote := range vols {
			local, err := filepath.Abs(k)
			if err != nil {
				return nil, fmt.Errorf("error getting volume absolute path: %w", err)
			}

			cmd = append(cmd, fmt.Sprintf("--volume=%s:%s", local, remote))
		}
	}

	// Add in the image
	cmd = append(cmd, task.Run.Container.Image)

	// Add in arguments
	cmd = append(cmd, task.Run.Container.Arguments...)

	return r.runExecCommand(ctx, []string{cmd[0]}, &model.RunArguments{Value: cmd[1:]}, nil, state, "")
}

// runExecCommand a general purpose function to build and execute a command in an activity
func (r *RunActivities) runExecCommand(
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

	// Cast the arg to a string
	for _, v := range data["args"].([]any) {
		command = append(command, fmt.Sprintf("%v", v))
	}

	// Set the ambient envvars - this allows us to access things in $PATH, $HOME,
	// Docker credentials etc
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
			respOut := strings.TrimSpace(stdout.String())
			respErr := strings.TrimSpace(stderr.String())
			logger.Error("Shell error", "error", err, "stdout", respOut, "stderr", respErr)

			return nil, temporal.NewApplicationErrorWithCause(
				"Error calling command",
				"command",
				exitErr,
				map[string]string{
					"stdout": respOut,
					"stderr": respErr,
				},
			)
		}
		logger.Error("Error running command", "error", err)
		return nil, fmt.Errorf("error running command: %w", err)
	}

	return strings.TrimSpace(stdout.String()), nil
}

func (r *RunActivities) runKubernetesCommand(ctx context.Context, task *model.RunTask, state *utils.State) (any, error) {
	kubeconfig := "/home/vscode/.kube/config"
	config, err := clientcmd.BuildConfigFromFlags("", kubeconfig)
	if err != nil {
		return nil, fmt.Errorf("error getting kubeconfig: %w", err)
	}

	client, err := kubernetes.NewForConfig(config)
	if err != nil {
		return nil, fmt.Errorf("error connecting to kubernetes cluster: %w", err)
	}

	info := activity.GetInfo(ctx)

	var cmd []string
	fmt.Println(cmd)
	if c := task.Run.Container.Command; c != "" {
		cmd = []string{c}
	}

	envvars := make([]corev1.EnvVar, 0)
	if envs := task.Run.Container.Environment; envs != nil {
		for k, v := range envs {
			envvars = append(envvars, corev1.EnvVar{
				Name:  k,
				Value: v,
			})
		}
	}

	containerName := uuid.NewString()
	if n := task.Run.Container.Name; n != "" {
		containerName = n
	}

	// var ttlSecondsAfterFinished *int32
	// if l := task.Run.Container.Lifetime; l != nil {
	// 	switch l.Cleanup {
	// 	case "always":
	// 		ttlSecondsAfterFinished = utils.Ptr[int32](0)
	// 	case "eventually":
	// 		ttlSecondsAfterFinished = utils.Ptr(int32(utils.ToDuration(l.After).Seconds()))
	// 	}
	// }

	namespace := "default"

	job := &batchv1.Job{
		ObjectMeta: metav1.ObjectMeta{
			Name:      containerName,
			Namespace: namespace,
		},
		Spec: batchv1.JobSpec{
			BackoffLimit: utils.Ptr[int32](0),
			// TTLSecondsAfterFinished: ttlSecondsAfterFinished,
			Template: corev1.PodTemplateSpec{
				ObjectMeta: metav1.ObjectMeta{
					Labels: map[string]string{
						"workflowId": info.WorkflowExecution.ID,
						"runId":      info.WorkflowExecution.RunID,
						"activityId": info.ActivityID,
					},
				},
				Spec: corev1.PodSpec{
					RestartPolicy: corev1.RestartPolicyNever,
					Containers: []corev1.Container{
						{
							Name:            containerName,
							Image:           task.Run.Container.Image,
							ImagePullPolicy: corev1.PullAlways,
							Command:         cmd,
							Env:             envvars,
							Args:            task.Run.Container.Arguments,
						},
					},
				},
			},
		},
	}

	created, err := client.BatchV1().Jobs("default").Create(ctx, job, metav1.CreateOptions{})
	if err != nil {
		return nil, fmt.Errorf("error creating job: %w", err)
	}

	ticker := time.NewTicker(time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			if err := ctx.Err(); err != nil {
				return nil, fmt.Errorf("kubernetes job errored: %w", ctx.Err())
			}
			return nil, nil

		case <-ticker.C:
			job, err := client.BatchV1().Jobs(namespace).Get(ctx, containerName, metav1.GetOptions{})
			if err != nil {
				return nil, err
			}

			for _, c := range job.Status.Conditions {
				if c.Type == batchv1.JobComplete && c.Status == corev1.ConditionTrue {
					return nil, nil
				}
				if c.Type == batchv1.JobFailed && c.Status == corev1.ConditionTrue {
					return nil, fmt.Errorf("job failed: %s", c.Message)
				}
			}
		}
	}

	fmt.Printf("%+v\n", created)

	return nil, nil
}
