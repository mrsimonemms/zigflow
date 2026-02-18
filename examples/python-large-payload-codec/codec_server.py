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

from functools import partial
from typing import Awaitable, Callable, Iterable, List

from aiohttp import hdrs, web
from google.protobuf import json_format
from temporalio.api.common.v1 import Payload, Payloads

from codec import LargePayloadCodec


def build_codec_server() -> web.Application:
    # Health check endpoint
    async def health_check(req: web.Request) -> web.Response:
        return web.json_response({"status": "healthy", "service": "codec-server"})

    # Cors handler
    async def cors_options(req: web.Request) -> web.Response:
        resp = web.Response()
        # Allow requests from the Temporal Web UI (default typically at 8233)
        origin = req.headers.get(hdrs.ORIGIN)
        if origin:
            resp.headers[hdrs.ACCESS_CONTROL_ALLOW_ORIGIN] = origin
            resp.headers[hdrs.ACCESS_CONTROL_ALLOW_METHODS] = "POST, OPTIONS"
            resp.headers[hdrs.ACCESS_CONTROL_ALLOW_HEADERS] = "content-type,x-namespace"
        return resp

    # General purpose payloads-to-payloads
    async def apply(
        fn: Callable[[Iterable[Payload]], Awaitable[List[Payload]]], req: web.Request
    ) -> web.Response:
        # Read payloads as JSON
        assert req.content_type == "application/json"
        body = await req.read()
        payloads = json_format.Parse(body, Payloads())

        # Apply
        new_payloads = Payloads(payloads=await fn(payloads.payloads))

        # Apply CORS and return JSON
        resp = await cors_options(req)
        resp.content_type = "application/json"

        # We must use proper proto-json printing
        resp.text = json_format.MessageToJson(new_payloads)
        return resp

    # Build app
    codec = LargePayloadCodec()
    app = web.Application()
    app.add_routes(
        [
            web.get("/health", health_check),
            web.post("/encode", partial(apply, codec.encode)),
            web.post("/decode", partial(apply, codec.decode)),
            web.options("/decode", cors_options),
            web.options("/encode", cors_options),
        ]
    )
    return app


if __name__ == "__main__":
    print("Codec server starting on http://127.0.0.1:8081")
    web.run_app(build_codec_server(), host="127.0.0.1", port=8081)
