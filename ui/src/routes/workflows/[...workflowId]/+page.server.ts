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
import { env } from '$env/dynamic/public';
import { Generator } from '$lib/classes/generator';
import { error } from '@sveltejs/kit';
import path from 'node:path';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const directory = path.join(
    env.PUBLIC_DATA_DIR,
    path.dirname(params.workflowId),
  );
  const filename = path.basename(params.workflowId);
  const entries = await Generator.loadDir(directory);

  const workflow = entries.find(
    ({ path: dir, name }) => dir === directory && name === filename,
  );

  if (!workflow) {
    throw error(404, 'Workflow file not found');
  }

  return {
    entries,
    workflow,
  };
};
