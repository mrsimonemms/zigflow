package events

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"sync"

	cloudevents "github.com/cloudevents/sdk-go/v2"
	"github.com/cloudevents/sdk-go/v2/binding"
	"github.com/cloudevents/sdk-go/v2/protocol"
)

func (c *ClientConfig) loadFileClient() (cloudevents.Client, error) {
	f, err := os.OpenFile(c.Target, os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0o644)
	if err != nil {
		return nil, err
	}

	p := &fileProtocol{
		file: f,
		enc:  json.NewEncoder(f),
	}

	client, err := cloudevents.NewClient(p)
	if err != nil {
		_ = f.Close()
		return nil, err
	}

	return client, nil
}

var _ protocol.Sender = &fileProtocol{}

type fileProtocol struct {
	mu   sync.Mutex
	file *os.File
	enc  *json.Encoder
}

// Send implements protocol.Sender
func (p *fileProtocol) Send(ctx context.Context, m binding.Message, transformers ...binding.Transformer) error {
	fmt.Println(222)
	p.mu.Lock()
	defer p.mu.Unlock()

	// Convert the binding.Message to an Event
	event, err := binding.ToEvent(ctx, m)
	if err != nil {
		return err
	}

	// Finish the message after processing
	defer m.Finish(nil)

	// Encode the event to JSON and write to file
	if err := p.enc.Encode(event); err != nil {
		return err
	}

	return nil
}

// Close implements protocol.Closer
func (p *fileProtocol) Close(ctx context.Context) error {
	p.mu.Lock()
	defer p.mu.Unlock()

	if p.file != nil {
		return p.file.Close()
	}
	return nil
}
