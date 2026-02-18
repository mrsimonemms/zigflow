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

import json
import uuid
from pathlib import Path
from typing import Iterable, List
import tempfile
from temporalio.api.common.v1 import Payload
from temporalio.converter import PayloadCodec

# Directory where large payloads will be stored.
# In a real environment, this should be a shared volume, S3 bucket, etc.
STORAGE_DIR = Path(tempfile.gettempdir()) / "temporal_large_payloads"
# Threshold in bytes. 10KB for demo purposes.
SIZE_THRESHOLD = 10 * 1024


class LargePayloadCodec(PayloadCodec):
    def __init__(self) -> None:
        STORAGE_DIR.mkdir(parents=True, exist_ok=True)

    async def encode(self, payloads: Iterable[Payload]) -> List[Payload]:
        encoded_payloads = []
        for p in payloads:
            # We handle any payload types.
            # If the raw data size is larger than threshold, offload it.
            if len(p.data) > SIZE_THRESHOLD:
                # 1. Generate unique ID for offloaded file
                file_id = str(uuid.uuid4())
                file_path = STORAGE_DIR / file_id

                # 2. Persist the ENTIRE payload (metadata + data) to disk
                #    This preserves encoding metadata from previous converters (e.g. JSON/Protobuf)
                with open(file_path, "wb") as f:
                    f.write(p.SerializeToString())

                # 3. Create a reference payload
                #    We use a custom encoding type to identify it during decode
                ref_obj = {"_large_payload_ref": file_id}
                ref_data = json.dumps(ref_obj).encode("utf-8")

                encoded_payloads.append(
                    Payload(
                        metadata={"encoding": b"binary/large-payload-ref"},
                        data=ref_data,
                    )
                )
            else:
                encoded_payloads.append(p)

        return encoded_payloads

    async def decode(self, payloads: Iterable[Payload]) -> List[Payload]:
        decoded_payloads = []
        for p in payloads:
            # Check if this is our reference type
            if p.metadata.get("encoding") == b"binary/large-payload-ref":
                try:
                    ref = json.loads(p.data.decode("utf-8"))
                    file_id = ref["_large_payload_ref"]
                    file_path = STORAGE_DIR / file_id

                    if not file_path.exists():
                        # In production, you might want to handle this gracefully or retry
                        raise RuntimeError(f"Large payload file not found: {file_path}")

                    # 1. Read the bytes
                    with open(file_path, "rb") as f:
                        serialized_payload = f.read()

                    # 2. Deserialize back into a Payload object
                    original_payload = Payload()
                    original_payload.ParseFromString(serialized_payload)

                    decoded_payloads.append(original_payload)

                except Exception as e:
                    # Log error and potentially return original (ref) payload or raise
                    print(f"Error decoding large payload: {e}")
                    decoded_payloads.append(p)
            else:
                decoded_payloads.append(p)
        return decoded_payloads
