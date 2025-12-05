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
	"context"
	"fmt"
	"time"

	"github.com/mrsimonemms/zigflow/pkg/utils"
	"github.com/serverlessworkflow/sdk-go/v3/model"
	"go.temporal.io/sdk/activity"
	"go.temporal.io/sdk/temporal"
	"go.temporal.io/sdk/worker"
	"go.temporal.io/sdk/workflow"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

func init() {
	activities = append(activities, callGRPCActivity)
}

func NewCallGRPCTaskBuilder(
	temporalWorker worker.Worker,
	task *model.CallGRPC,
	taskName string,
	doc *model.Workflow,
) (*CallGRPCTaskBuilder, error) {
	return &CallGRPCTaskBuilder{
		builder: builder[*model.CallGRPC]{
			doc:            doc,
			name:           taskName,
			task:           task,
			temporalWorker: temporalWorker,
		},
	}, nil
}

type CallGRPCTaskBuilder struct {
	builder[*model.CallGRPC]
}

func (t *CallGRPCTaskBuilder) Build() (TemporalWorkflowFunc, error) {
	if t.task.With.Service.Host == "" {
		t.task.With.Service.Host = "localhost"
	}
	if t.task.With.Service.Port == 0 {
		t.task.With.Service.Port = 50051
	}

	return func(ctx workflow.Context, input any, state *utils.State) (output any, err error) {
		logger := workflow.GetLogger(ctx)
		logger.Debug("Calling gRPC endpoint", "name", t.name)

		var res any
		if err := workflow.ExecuteActivity(ctx, callGRPCActivity, t.task, input, state).Get(ctx, &res); err != nil {
			if temporal.IsCanceledError(err) {
				return nil, nil
			}

			logger.Error("Error calling gRPC task", "name", t.name, "error", err)
			return nil, fmt.Errorf("error calling grpc task: %w", err)
		}

		// Add the result to the state's data
		logger.Debug("Setting data to the state", "key", t.name)
		state.AddData(map[string]any{
			t.name: res,
		})

		return res, nil
	}, nil
}

func callGRPCActivity(ctx context.Context, task *model.CallGRPC, timeout time.Duration, state *utils.State) (res any, err error) {
	logger := activity.GetLogger(ctx)

	// endpoint := t.task.With.Proto.Endpoint.String()

	// u, err := url.Parse(endpoint)
	// if err != nil {
	// 	return nil, err
	// }

	// fmt.Println(u.Path)

	address := fmt.Sprintf("%s:%d", task.With.Service.Host, task.With.Service.Port)

	conn, err := grpc.NewClient(address, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		logger.Error("Error creating gRPC connection", "error", err)
		return nil, err
	}
	defer func() {
		err = conn.Close()
		if err != nil {
			logger.Error("Error closing body reader", "error", err)
		}
	}()

	res = address

	return
}
