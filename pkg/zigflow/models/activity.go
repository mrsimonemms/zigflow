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

package models

import (
	"github.com/mrsimonemms/zigflow/pkg/utils"
	"github.com/serverlessworkflow/sdk-go/v3/model"
	"go.temporal.io/sdk/temporal"
	"go.temporal.io/sdk/workflow"
)

type ActivityCallWith struct {
	Name      string                   `json:"name"`
	Arguments []any                    `json:"arguments"`
	Options   *ActivityCallWithOptions `json:"options,omitempty"`
}

type ActivityCallWithOptions struct {
	TaskQueue              string            `json:"taskQueue"`
	ScheduleToCloseTimeout *model.Duration   `json:"scheduleToCloseTimeout"`
	ScheduleToStartTimeout *model.Duration   `json:"scheduleToStartTimeout"`
	StartToCloseTimeout    *model.Duration   `json:"startToCloseTimeout"`
	HeartbeatTimeout       *model.Duration   `json:"heartbeatTimeout"`
	WaitForCancellation    *bool             `json:"waitForCancellation"`
	ActivityID             string            `json:"activityId"`
	RetryPolicy            *RetryPolicy      `json:"retryPolicy"`
	DisableEagerExecution  *bool             `json:"disableEagerExecution"`
	Summary                string            `json:"summary"`
	Priority               *ActivityPriority `json:"priority"`
}

func (a *ActivityCallWithOptions) ToTemporal(ctx workflow.Context) workflow.ActivityOptions {
	opts := workflow.GetActivityOptions(ctx)

	if a.TaskQueue != "" {
		opts.TaskQueue = a.TaskQueue
	}

	if a.ScheduleToCloseTimeout != nil {
		opts.ScheduleToCloseTimeout = utils.ToDuration(a.ScheduleToCloseTimeout)
	}

	if a.ScheduleToStartTimeout != nil {
		opts.ScheduleToStartTimeout = utils.ToDuration(a.ScheduleToStartTimeout)
	}

	if a.StartToCloseTimeout != nil {
		opts.StartToCloseTimeout = utils.ToDuration(a.StartToCloseTimeout)
	}

	if a.HeartbeatTimeout != nil {
		opts.HeartbeatTimeout = utils.ToDuration(a.HeartbeatTimeout)
	}

	if a.WaitForCancellation != nil {
		opts.WaitForCancellation = *a.WaitForCancellation
	}

	if a.ActivityID != "" {
		opts.ActivityID = a.ActivityID
	}

	if a.RetryPolicy != nil {
		opts.RetryPolicy = a.RetryPolicy.ToTemporal()
	}

	if a.DisableEagerExecution != nil {
		opts.DisableEagerExecution = *a.DisableEagerExecution
	}

	if a.Summary != "" {
		opts.Summary = a.Summary
	}

	if a.Priority != nil {
		opts.Priority = a.Priority.ToTemporal()
	}

	return opts
}

type ActivityPriority struct {
	PriorityKey    *int     `json:"priorityKey"`
	FairnessKey    string   `json:"fairnessKey"`
	FairnessWeight *float32 `json:"fairnessWeight"`
}

func (a *ActivityPriority) ToTemporal() temporal.Priority {
	priority := temporal.Priority{}
	if a.PriorityKey != nil {
		priority.PriorityKey = *a.PriorityKey
	}
	if a.FairnessKey != "" {
		priority.FairnessKey = a.FairnessKey
	}
	if a.FairnessWeight != nil {
		priority.FairnessWeight = *a.FairnessWeight
	}
	return priority
}
