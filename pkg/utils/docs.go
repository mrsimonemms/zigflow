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

package utils

import (
	"os"
	"path/filepath"
	"strings"
)

func FilePrepender(filename string) string {
	base := filepath.Base(filename)
	title := strings.TrimSuffix(base, filepath.Ext(base))
	title = strings.ReplaceAll(title, "_", " ")

	return `---
title: "` + title + `"
---

`
}

func fixIndentedCodeBlocks(content string) string {
	lines := strings.Split(content, "\n")

	var out []string
	inFence := false
	inIndentedBlock := false

	flushIndented := func() {
		if inIndentedBlock {
			out = append(out, "```")
			inIndentedBlock = false
		}
	}

	for _, line := range lines {
		trim := strings.TrimSpace(line)

		// Track existing fenced code blocks
		if strings.HasPrefix(trim, "```") {
			flushIndented()
			inFence = !inFence
			out = append(out, line)
			continue
		}

		// Detect indented code blocks (tabs or 4 spaces), outside fenced blocks
		if !inFence && (strings.HasPrefix(line, "\t") || strings.HasPrefix(line, "    ")) {
			if !inIndentedBlock {
				out = append(out, "```bash")
				inIndentedBlock = true
			}
			// Strip leading indentation
			out = append(out, strings.TrimLeft(line, "\t "))
			continue
		}

		// End indented block when indentation stops
		if inIndentedBlock {
			flushIndented()
		}

		out = append(out, line)
	}

	flushIndented()
	return strings.Join(out, "\n")
}

func LinkHandler(name string) string {
	base := strings.TrimSuffix(name, ".md")
	return base
}

func SanitizeForMDX(path string) error {
	b, err := os.ReadFile(path)
	if err != nil {
		return err
	}

	content := fixIndentedCodeBlocks(string(b))

	return os.WriteFile(path, []byte(content), 0o600)
}
