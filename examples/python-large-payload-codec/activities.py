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

"""
Temporal activities for the large payload example.

These activities generate and process large data, demonstrating how
the custom codec transparently handles payloads exceeding 10KB.
"""

from __future__ import annotations

from temporalio import activity


@activity.defn
async def generate_large_data(size_kb: int) -> bytes:
    """
    Generate large binary data of the specified size.

    This activity returns data that will exceed the 10KB codec threshold,
    triggering automatic offloading to external storage.

    Args:
        size_kb: Size of data to generate in kilobytes

    Returns:
        Binary data of the specified size
    """
    activity.logger.info(f"Generating {size_kb}KB of data...")

    # Generate a repeated pattern of bytes
    data = b"a" * (size_kb * 1024)

    activity.logger.info(f"Generated {len(data)} bytes ({size_kb}KB)")
    return data


@activity.defn
async def process_large_data(data: bytes) -> str:
    """
    Process large binary data received from the workflow.

    The data is automatically decoded by the custom codec before
    this activity receives it (if it exceeded 10KB).

    Args:
        data: Binary data to process

    Returns:
        String describing the processed data
    """
    size = len(data)
    size_kb = size / 1024

    activity.logger.info(f"Processing data of size: {size} bytes ({size_kb:.2f}KB)")

    # Simulate some processing
    # In a real scenario, this might be data transformation, validation, etc.
    result = f"Processed {size} bytes ({size_kb:.2f}KB) of data"

    activity.logger.info(f"Processing complete: {result}")
    return result


@activity.defn
async def generate_large_string(size_kb: int) -> str:
    """
    Generate large string data of the specified size.

    This demonstrates that the codec works with different data types,
    not just binary data. The threshold for offload is 10KB.

    Args:
        size_kb: Size of string to generate in kilobytes

    Returns:
        String data of the specified size
    """
    activity.logger.info(f"Generating {size_kb}KB of string data...")

    # Generate a repeated pattern of characters
    data = "s" * (size_kb * 1024)

    activity.logger.info(f"Generated {len(data)} characters ({size_kb}KB)")
    return data


@activity.defn
async def process_large_string(data: str) -> str:
    """
    Process large string data received from the workflow (offloaded if >10KB).

    Args:
        data: String data to process

    Returns:
        String describing the processed data
    """
    size = len(data)
    size_kb = size / 1024

    activity.logger.info(
        f"Processing string data of size: {size} characters ({size_kb:.2f}KB)"
    )

    result = f"Processed {size} characters ({size_kb:.2f}KB) of string data"

    activity.logger.info(f"Processing complete: {result}")
    return result
