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

package codec

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/rs/zerolog/log"
	commonpb "go.temporal.io/api/common/v1"
	"go.temporal.io/sdk/converter"
	"google.golang.org/protobuf/encoding/protojson"
)

// RemoteCodecDataConverter is a DataConverter that delegates encoding and decoding
// to a remote codec server via HTTP. This allows using custom codecs (e.g., compression,
// encryption) implemented in any language without embedding them in the Zigflow binary.
//
// The remote codec server must implement two endpoints:
//   - POST /encode - accepts Payloads, returns encoded Payloads
//   - POST /decode - accepts Payloads, returns decoded Payloads
//
// Both endpoints expect and return Temporal Payloads in JSON format.
type RemoteCodecDataConverter struct {
	parent   converter.DataConverter
	endpoint string
	client   *http.Client
}

// NewRemoteCodecDataConverter creates a new RemoteCodecDataConverter that sends
// encoding/decoding requests to the specified HTTP endpoint.
//
// The parent DataConverter is used for the initial serialisation before encoding
// and final deserialization after decoding. If nil, the default Temporal converter is used.
func NewRemoteCodecDataConverter(endpoint string, parent converter.DataConverter) *RemoteCodecDataConverter {
	if parent == nil {
		parent = converter.GetDefaultDataConverter()
	}

	return &RemoteCodecDataConverter{
		parent:   parent,
		endpoint: endpoint,
		client: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// ToPayloads converts a list of values to payloads and applies remote encoding.
func (r *RemoteCodecDataConverter) ToPayloads(values ...interface{}) (*commonpb.Payloads, error) {
	// First, convert values to payloads using the parent converter
	payloads, err := r.parent.ToPayloads(values...)
	if err != nil {
		return nil, fmt.Errorf("parent converter ToPayloads failed: %w", err)
	}

	// Then, apply remote encoding
	encoded, err := r.encode(payloads)
	if err != nil {
		return nil, fmt.Errorf("remote encoding failed: %w", err)
	}

	return encoded, nil
}

// FromPayloads applies remote decoding and converts payloads back to values.
func (r *RemoteCodecDataConverter) FromPayloads(payloads *commonpb.Payloads, valuePtrs ...interface{}) error {
	// First, apply remote decoding
	decoded, err := r.decode(payloads)
	if err != nil {
		return fmt.Errorf("remote decoding failed: %w", err)
	}

	// Then, convert payloads back to values using the parent converter
	if err := r.parent.FromPayloads(decoded, valuePtrs...); err != nil {
		return fmt.Errorf("parent converter FromPayloads failed: %w", err)
	}

	return nil
}

// ToString converts a single payload to a string representation.
// This is primarily used for debugging and logging.
func (r *RemoteCodecDataConverter) ToString(payload *commonpb.Payload) string {
	return r.parent.ToString(payload)
}

// ToStrings converts payloads to string representations.
// This is primarily used for debugging and logging.
func (r *RemoteCodecDataConverter) ToStrings(payloads *commonpb.Payloads) []string {
	return r.parent.ToStrings(payloads)
}

// encode sends payloads to the remote codec server for encoding.
func (r *RemoteCodecDataConverter) encode(payloads *commonpb.Payloads) (*commonpb.Payloads, error) {
	return r.callCodecServer("/encode", payloads)
}

// decode sends payloads to the remote codec server for decoding.
func (r *RemoteCodecDataConverter) decode(payloads *commonpb.Payloads) (*commonpb.Payloads, error) {
	return r.callCodecServer("/decode", payloads)
}

// callCodecServer makes an HTTP POST request to the remote codec server.
//
// Note: This uses context.Background() because the Temporal DataConverter interface
// does not pass context through ToPayloads/FromPayloads. The HTTP client timeout
// (30 seconds) provides protection against hung requests.
func (r *RemoteCodecDataConverter) callCodecServer(path string, payloads *commonpb.Payloads) (*commonpb.Payloads, error) {
	if payloads == nil || len(payloads.Payloads) == 0 {
		return payloads, nil
	}

	// Marshal payloads to JSON using protojson to handle protobuf properly
	jsonData, err := protojson.Marshal(payloads)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal payloads to JSON: %w", err)
	}

	// Create HTTP request
	url := r.endpoint + path
	req, err := http.NewRequestWithContext(context.Background(), "POST", url, bytes.NewReader(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create HTTP request to %s: %w", url, err)
	}
	req.Header.Set("Content-Type", "application/json")

	log.Trace().
		Str("url", url).
		Str("method", "POST").
		Msg("Calling remote codec server")

	// Make the request
	resp, err := r.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to call codec server at %s: %w", url, err)
	}
	defer func() {
		if err := resp.Body.Close(); err != nil {
			log.Warn().Err(err).Msg("Failed to close response body")
		}
	}()

	// Check response status
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("codec server returned HTTP %d: %s", resp.StatusCode, string(body))
	}

	// Read response body
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read codec server response: %w", err)
	}

	// Unmarshal response
	var result commonpb.Payloads
	if err := protojson.Unmarshal(respBody, &result); err != nil {
		return nil, fmt.Errorf("failed to unmarshal codec server response: %w", err)
	}

	log.Trace().
		Int("inputPayloads", len(payloads.Payloads)).
		Int("outputPayloads", len(result.Payloads)).
		Msg("Remote codec server call successful")

	return &result, nil
}

// ToPayload converts a single value to a payload.
// This implements the PayloadConverter interface.
func (r *RemoteCodecDataConverter) ToPayload(value interface{}) (*commonpb.Payload, error) {
	payloads, err := r.ToPayloads(value)
	if err != nil {
		return nil, err
	}
	if len(payloads.Payloads) == 0 {
		return nil, fmt.Errorf("no payload produced")
	}
	return payloads.Payloads[0], nil
}

// FromPayload converts a payload back to a value.
// This implements the PayloadConverter interface.
func (r *RemoteCodecDataConverter) FromPayload(payload *commonpb.Payload, valuePtr interface{}) error {
	payloads := &commonpb.Payloads{Payloads: []*commonpb.Payload{payload}}
	return r.FromPayloads(payloads, valuePtr)
}
