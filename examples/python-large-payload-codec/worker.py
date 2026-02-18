# Copyright 2025 - 2026 Zigflow authors <https://github.com/mrsimonemms/zigflow/graphs/contributors>
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""Python Temporal worker for large payload activities."""

from __future__ import annotations

import asyncio
import dataclasses
import logging
import os
import sys
from typing import Any, Dict

from temporalio.client import Client
from temporalio.worker import Worker
import temporalio.converter

from activities import (
    generate_large_data,
    process_large_data,
    generate_large_string,
    process_large_string,
)
from codec import LargePayloadCodec


async def main() -> None:
    logging.basicConfig(level=logging.INFO)

    address = os.getenv("TEMPORAL_ADDRESS", "localhost:7233")
    namespace = os.getenv("TEMPORAL_NAMESPACE", "default")
    api_key = os.getenv("TEMPORAL_API_KEY")
    tls_enabled = os.getenv("TEMPORAL_TLS", "false").lower() == "true"

    connect_kwargs: Dict[str, Any] = {"namespace": namespace}
    if tls_enabled:
        connect_kwargs["tls"] = True
    if api_key:
        connect_kwargs["api_key"] = api_key

    data_converter = dataclasses.replace(
        temporalio.converter.default(), payload_codec=LargePayloadCodec()
    )
    connect_kwargs["data_converter"] = data_converter

    client = await Client.connect(address, **connect_kwargs)

    worker = Worker(
        client,
        task_queue="python-activities",
        activities=[
            generate_large_data,
            process_large_data,
            generate_large_string,
            process_large_string,
        ],
    )

    print("Python activity worker started")
    await worker.run()


def _run() -> None:
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nWorker stopped", file=sys.stderr)
        sys.exit(0)
    except Exception as exc:
        print(exc, file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    _run()
