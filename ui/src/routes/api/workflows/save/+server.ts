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

// API endpoint for saving workflows to the file system

import { json } from '@sveltejs/kit';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import type { RequestHandler } from './$types';

// Base data directory
const DATA_DIR = process.env.DATA_DIR || '/data';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const { filename, content, publish = false } = body;

    // Validate input
    if (!filename || typeof filename !== 'string') {
      return json({ error: 'Filename is required' }, { status: 400 });
    }

    if (!content || typeof content !== 'string') {
      return json({ error: 'Content is required' }, { status: 400 });
    }

    // Sanitize filename (remove any path traversal attempts)
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    if (
      !sanitizedFilename.endsWith('.yaml') &&
      !sanitizedFilename.endsWith('.yml')
    ) {
      return json(
        { error: 'Filename must end with .yaml or .yml' },
        { status: 400 }
      );
    }

    // Determine target directory
    const targetDir = publish
      ? join(DATA_DIR, 'published')
      : join(DATA_DIR, 'drafts');

    // Ensure directory exists
    await mkdir(targetDir, { recursive: true });

    // Write file
    const filepath = join(targetDir, sanitizedFilename);
    await writeFile(filepath, content, 'utf-8');

    return json({
      success: true,
      filepath,
      message: `Workflow saved to ${publish ? 'published' : 'drafts'} directory`,
    });
  } catch (error) {
    console.error('Error saving workflow:', error);
    return json(
      {
        error: 'Failed to save workflow',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
};
