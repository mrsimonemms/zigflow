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
)

type RetryPolicy struct {
	InitialInterval        *model.Duration `json:"initialInterval"`
	BackoffCoefficient     *float64        `json:"backoffCoefficient"`
	MaximumInterval        *model.Duration `json:"maximumInterval"`
	MaximumAttempts        *int32          `json:"maximumAttempts"`
	NonRetryableErrorTypes []string        `json:"nonRetryableErrorTypes"`
}

func (r *RetryPolicy) ToTemporal() *temporal.RetryPolicy {
	retry := &temporal.RetryPolicy{}

	if r.InitialInterval != nil {
		retry.InitialInterval = utils.ToDuration(r.InitialInterval)
	}
	if r.BackoffCoefficient != nil {
		retry.BackoffCoefficient = *r.BackoffCoefficient
	}
	if r.MaximumInterval != nil {
		retry.MaximumInterval = utils.ToDuration(r.MaximumInterval)
	}
	if r.MaximumAttempts != nil {
		retry.MaximumAttempts = *r.MaximumAttempts
	}
	if len(r.NonRetryableErrorTypes) > 0 {
		retry.NonRetryableErrorTypes = r.NonRetryableErrorTypes
	}

	return retry
}
