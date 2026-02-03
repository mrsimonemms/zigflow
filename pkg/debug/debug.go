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

package debug

import (
	"fmt"
	"strings"

	"github.com/charmbracelet/lipgloss"
)

// Singleton
var debugger func(string, ...string)

func Log(title string, args ...string) {
	debugger(title, args...)
}

func New(enabled bool) {
	if !enabled {
		// Noop
		debugger = func(string, ...string) {}
	}

	style := lipgloss.NewStyle().
		Foreground(lipgloss.Color("#0A0A0A")). //nolint:misspell
		Background(lipgloss.Color("#CFEEDD")). //nolint:misspell
		Padding(2, 4, 0, 4).
		Width(50)

		// Actual debugger
	debugger = func(title string, args ...string) {
		fmt.Println(style.Bold(true).Render(
			fmt.Sprintf("Debug: %s", strings.ToUpper(title)),
		))

		lastIndex := len(args) - 1

		for i := 0; i < len(args); i += 2 {
			top := 0
			if i == 0 {
				top = 2
			}

			bottom := 0
			if i >= lastIndex-1 {
				bottom = 2
			}

			// If this is the last arg and there's no pair, print value only
			if i == lastIndex {
				fmt.Println(
					style.
						PaddingTop(top).
						PaddingBottom(bottom).
						Render(args[i]),
				)
				continue
			}

			key := args[i]
			value := args[i+1]

			fmt.Println(
				style.
					PaddingTop(top).
					PaddingBottom(bottom).
					Render(fmt.Sprintf("%s: %s", key, value)),
			)
		}
	}
}
