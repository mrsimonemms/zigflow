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

package telemetry

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/google/uuid"
	"github.com/posthog/posthog-go"
	"github.com/rs/zerolog/log"
)

const (
	// Project API keys (starting "phc_") are safe to be stored publicly
	// @link https://posthog.com/docs/privacy
	//nolint:gosec
	apiKey   = "phc_aAZLi0FMmGUug73jLYdTIkFjns49I9YcpOUs6TztZ0B"
	endpoint = "https://cli.zigflow.dev"
)

func Notify(version string) (err error) {
	if version == "development" {
		return err
	}

	distinctID, err := getID()
	if err != nil {
		return fmt.Errorf("error generating distinct id")
	}

	client, err := posthog.NewWithConfig(apiKey, posthog.Config{Endpoint: endpoint})
	if err != nil {
		return fmt.Errorf("error creating posthog connection: %w", err)
	}
	defer func() {
		err = client.Close()
	}()

	data := posthog.Capture{
		DistinctId: distinctID,
		Event:      "hello",
		Properties: posthog.NewProperties().Set("version", version),
	}

	// For transparency, show the data we're capturing
	log.Trace().Any("id", distinctID).Str("version", version).Msg("Sending anonymous telemetry")
	if err := client.Enqueue(data); err != nil {
		return fmt.Errorf("error sending posthog telemetry: %w", err)
	}

	return err
}

// getID looks for an ID in ~/.config/zigflow or creates it
func getID() (string, error) {
	configDir, err := os.UserConfigDir()
	if err != nil {
		return "", fmt.Errorf("get user config dir: %w", err)
	}

	// Build the path to the file
	appDir := filepath.Join(configDir, "zigflow")
	idFile := filepath.Join(appDir, "id")

	// Ensure the directory exists
	if err := os.MkdirAll(appDir, 0o755); err != nil {
		return "", fmt.Errorf("mkdir: %w", err)
	}

	// Try reading existing ID
	if data, err := os.ReadFile(idFile); err == nil {
		return string(data), nil
	}

	newID := uuid.NewString()

	// Persist it
	if err := os.WriteFile(idFile, []byte(newID), 0o600); err != nil {
		return "", fmt.Errorf("write id file: %w", err)
	}

	return newID, nil
}
