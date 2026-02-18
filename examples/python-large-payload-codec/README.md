# Large Payload Codec

Demonstrates using a custom PayloadCodec with Zigflow to handle large payloads
via the claim-check pattern. Payloads exceeding 10KB are automatically
offloaded to external storage.

<!-- toc -->

* [Getting started](#getting-started)

<!-- Regenerate with "pre-commit run -a markdown-toc" -->

<!-- tocstop -->

## Getting started

This example requires multiple terminals:

```sh
cd examples/python-large-payload-codec

# Terminal 1: Start codec server
uv run python codec_server.py

# Terminal 2: Start Python activity worker
uv run python worker.py

# Terminal 3: Start Zigflow worker
zigflow \
  --file workflow.yaml \
  --convert-data \
  --codec-endpoint http://localhost:8081

# Terminal 4: Run the starter
uv run python starter.py
```

This will trigger the workflow, generate large payloads that exceed the 500KB
threshold, and print the results to the console. You can configure the Temporal
UI to use the codec server at `http://localhost:8081` to view decoded payloads.
