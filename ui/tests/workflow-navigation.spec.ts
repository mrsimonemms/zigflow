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
import { expect, test } from '@playwright/test';

const WORKFLOW = '/workflows/simple-workflow.yaml';

test.describe('Workflow navigation invariants', () => {
  test('selecting a root node updates query param', async ({ page }) => {
    await page.goto(WORKFLOW);

    await page.getByText('greet').click();

    const url = new URL(page.url());
    const selected = url.searchParams.get('selected');

    expect(selected).toBeTruthy();
    expect(selected?.split('/').length).toBe(1);
  });

  test('refresh preserves root selection', async ({ page }) => {
    await page.goto(WORKFLOW);

    await page.getByText('greet').click();
    const firstUrl = page.url();

    await page.reload();
    await expect(page).toHaveURL(firstUrl);

    await expect(page.getByText('greet')).toHaveAttribute(
      'data-selected',
      'true',
    );
  });

  test('selecting switch branch updates query param', async ({ page }) => {
    await page.goto(WORKFLOW);

    await page.getByText('route').click();
    await page.getByText('fast-path').click();

    const url = new URL(page.url());
    const selected = url.searchParams.get('selected');

    expect(selected).toBeTruthy();
    expect(selected?.split('/').length).toBe(2);
  });

  test('deep link restores branch context', async ({ page }) => {
    await page.goto(WORKFLOW);

    await page.getByText('route').click();
    await page.getByText('fast-path').click();

    const deepLink = page.url();

    const newPage = await page.context().newPage();
    await newPage.goto(deepLink);

    await expect(newPage).toHaveURL(deepLink);
    await expect(newPage.getByText(/Editing/i)).toContainText('fast-path');
  });

  test('browser back restores previous selection', async ({ page }) => {
    await page.goto(WORKFLOW);

    await page.getByText('greet').click();
    const firstUrl = page.url();

    await page.getByText('pause').click();
    const secondUrl = page.url();

    expect(firstUrl).not.toBe(secondUrl);

    await page.goBack();

    await expect(page).toHaveURL(firstUrl);
    await expect(page.getByText('greet')).toHaveAttribute(
      'data-selected',
      'true',
    );
  });
});
