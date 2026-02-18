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
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
	commonpb "go.temporal.io/api/common/v1"
	"go.temporal.io/sdk/converter"
	"google.golang.org/protobuf/encoding/protojson"
)

func TestNewRemoteCodecDataConverter(t *testing.T) {
	t.Run("uses default parent when nil", func(t *testing.T) {
		r := NewRemoteCodecDataConverter("http://localhost:8081", nil)
		assert.NotNil(t, r.parent)
		assert.Equal(t, "http://localhost:8081", r.endpoint)
		assert.NotNil(t, r.client)
	})

	t.Run("uses provided parent", func(t *testing.T) {
		customParent := converter.GetDefaultDataConverter()
		r := NewRemoteCodecDataConverter("http://localhost:8082", customParent)
		assert.Equal(t, customParent, r.parent)
	})
}

func TestRemoteCodecDataConverter_EmptyPayloads(t *testing.T) {
	r := NewRemoteCodecDataConverter("http://localhost:8081", nil)

	t.Run("encode nil payloads", func(t *testing.T) {
		result, err := r.encode(nil)
		assert.NoError(t, err)
		assert.Nil(t, result)
	})

	t.Run("encode empty payloads", func(t *testing.T) {
		result, err := r.encode(&commonpb.Payloads{})
		assert.NoError(t, err)
		assert.NotNil(t, result)
	})

	t.Run("decode nil payloads", func(t *testing.T) {
		result, err := r.decode(nil)
		assert.NoError(t, err)
		assert.Nil(t, result)
	})
}

func TestRemoteCodecDataConverter_ServerCommunication(t *testing.T) {
	t.Run("successful encode/decode roundtrip", func(t *testing.T) {
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			assert.Equal(t, "application/json", r.Header.Get("Content-Type"))

			body, err := io.ReadAll(r.Body)
			assert.NoError(t, err)

			var payloads commonpb.Payloads
			err = protojson.Unmarshal(body, &payloads)
			assert.NoError(t, err)

			w.Header().Set("Content-Type", "application/json")
			resp, _ := protojson.Marshal(&payloads)
			_, _ = w.Write(resp)
		}))
		defer server.Close()

		r := NewRemoteCodecDataConverter(server.URL, nil)

		payloads, err := r.ToPayloads("test-value")
		assert.NoError(t, err)
		assert.NotNil(t, payloads)
		assert.NotEmpty(t, payloads.Payloads)

		var result string
		err = r.FromPayloads(payloads, &result)
		assert.NoError(t, err)
		assert.Equal(t, "test-value", result)
	})

	t.Run("server error response", func(t *testing.T) {
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
			w.WriteHeader(http.StatusInternalServerError)
			_, _ = w.Write([]byte("internal error"))
		}))
		defer server.Close()

		r := NewRemoteCodecDataConverter(server.URL, nil)

		_, err := r.ToPayloads("test")
		assert.Error(t, err)
	})

	t.Run("server unavailable", func(t *testing.T) {
		r := NewRemoteCodecDataConverter("http://localhost:59999", nil)

		_, err := r.ToPayloads("test")
		assert.Error(t, err)
	})
}

func TestRemoteCodecDataConverter_ToPayload(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		body, _ := io.ReadAll(r.Body)

		var payloads commonpb.Payloads
		_ = protojson.Unmarshal(body, &payloads)

		w.Header().Set("Content-Type", "application/json")
		resp, _ := protojson.Marshal(&payloads)
		_, _ = w.Write(resp)
	}))
	defer server.Close()

	r := NewRemoteCodecDataConverter(server.URL, nil)

	payload, err := r.ToPayload("single-value")
	assert.NoError(t, err)
	assert.NotNil(t, payload)

	var result string
	err = r.FromPayload(payload, &result)
	assert.NoError(t, err)
	assert.Equal(t, "single-value", result)
}

func TestRemoteCodecDataConverter_ToString(t *testing.T) {
	r := NewRemoteCodecDataConverter("http://localhost:8081", nil)

	payload := &commonpb.Payload{
		Metadata: map[string][]byte{"encoding": []byte("json/plain")},
		Data:     []byte(`"test"`),
	}

	str := r.ToString(payload)
	assert.NotEmpty(t, str)

	payloads := &commonpb.Payloads{Payloads: []*commonpb.Payload{payload}}
	strs := r.ToStrings(payloads)
	assert.Len(t, strs, 1)
}
