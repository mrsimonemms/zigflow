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

// API endpoint for server-side workflow validation

import { json } from '@sveltejs/kit';
import { getValidator } from '$lib/core/schema/validator';
import { readFile } from 'fs/promises';
import { join } from 'path';
import type { RequestHandler } from './$types';

// Load schema once on server startup
let schemaLoaded = false;
let schemaLoadError: string | null = null;

async function ensureSchemaLoaded() {
  if (schemaLoaded) return;

  try {
    const schemaPath = join(process.cwd(), 'static', 'schema.yaml');
    const schemaYaml = await readFile(schemaPath, 'utf-8');
    const validator = getValidator();
    await validator.loadSchema(schemaYaml);
    schemaLoaded = true;
  } catch (error) {
    schemaLoadError = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to load schema: ${schemaLoadError}`);
  }
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    // Ensure schema is loaded
    await ensureSchemaLoaded();

    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== 'string') {
      return json({ error: 'Content is required' }, { status: 400 });
    }

    // Validate workflow
    const validator = getValidator();
    const result = validator.validate(content);

    return json({
      success: true,
      validation: result,
    });
  } catch (error) {
    console.error('Error validating workflow:', error);
    return json(
      {
        error: 'Failed to validate workflow',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
};
