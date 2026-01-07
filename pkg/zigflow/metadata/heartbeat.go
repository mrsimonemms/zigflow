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

package metadata

import (
	"context"
	"time"

	"github.com/mrsimonemms/zigflow/pkg/utils"
	"github.com/rs/zerolog/log"
	"github.com/serverlessworkflow/sdk-go/v3/model"
	"go.temporal.io/sdk/activity"
)

const HeartbeatDurationWarning = time.Second * 10

func StartActivityHeartbeat(ctx context.Context, task *model.TaskBase) (stop func()) {
	stop = func() {
		log.Trace().Msg("Activity heartbeat noop")
	}

	if hb, ok := task.Metadata[MetadataHeartbeat]; ok {
		var heartbeat *model.Duration
		if err := utils.ToType(hb, &heartbeat); err != nil {
			// Ignore an invalid heartbeat duration with warning
			log.Warn().Err(err).Any("heartbeat", hb).Msg("Heartbeat metadata not a Duration type")
			return stop
		}

		// Each heartbeat is one action. At scale, this may exceed your allocation and cost extra
		// @link https://temporal.io/pricing
		duration := utils.ToDuration(heartbeat)
		if duration < HeartbeatDurationWarning {
			log.Warn().
				Dur("duration", duration).
				Dur("threshold", HeartbeatDurationWarning).
				Msg("Heartbeat time is below warning threshold - this may increase your Temporal costs")
		}

		_, cancel := utils.ExecuteEvery(ctx, duration, func(hctx context.Context) {
			activity.RecordHeartbeat(hctx)
		})

		stop = cancel
	}

	return stop
}
