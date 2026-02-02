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

// API endpoint for loading workflows from the file system

import { json } from '@sveltejs/kit';
import { readFile, access } from 'fs/promises';
import { join } from 'path';
import type { RequestHandler } from './$types';

// Base data directory
const DATA_DIR = process.env.DATA_DIR || '/data';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const filename = url.searchParams.get('filename');

    if (!filename) {
      return json({ error: 'Filename parameter is required' }, { status: 400 });
    }

    // Sanitize filename
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');

    // Try to load from published first, then drafts
    const publishedPath = join(DATA_DIR, 'published', sanitizedFilename);
    const draftsPath = join(DATA_DIR, 'drafts', sanitizedFilename);

    let content: string;
    let source: string;

    try {
      await access(publishedPath);
      content = await readFile(publishedPath, 'utf-8');
      source = 'published';
    } catch {
      // File not in published, try drafts
      try {
        await access(draftsPath);
        content = await readFile(draftsPath, 'utf-8');
        source = 'drafts';
      } catch {
        return json(
          {
            error: 'Workflow file not found in published or drafts directories',
          },
          { status: 404 }
        );
      }
    }

    return json({
      success: true,
      filename: sanitizedFilename,
      content,
      source,
    });
  } catch (error) {
    console.error('Error loading workflow:', error);
    return json(
      {
        error: 'Failed to load workflow',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
};
