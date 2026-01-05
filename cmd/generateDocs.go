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

package cmd

import (
	"os"
	"path"
	"path/filepath"
	"strings"

	"github.com/mrsimonemms/zigflow/pkg/utils"
	"github.com/rs/zerolog/log"
	"github.com/spf13/cobra"
	"github.com/spf13/cobra/doc"
)

// generateDocsCmd represents the generateDocs command
var generateDocsCmd = &cobra.Command{
	Use:    "generate-docs",
	Short:  "Generate documentation",
	Hidden: true,
	Run: func(cmd *cobra.Command, args []string) {
		root, err := os.Getwd()
		if err != nil {
			log.Fatal().Err(err).Msg("Error getting working directory")
		}

		outDir := path.Join(root, "docs", "docs", "cli")

		if err := os.MkdirAll(outDir, 0o755); err != nil {
			log.Fatal().Err(err).Msg("Error creating directory")
		}

		if err := doc.GenMarkdownTreeCustom(rootCmd, outDir, utils.FilePrepender, utils.LinkHandler); err != nil {
			log.Fatal().Err(err).Msg("Error generating documentation")
		}

		// Post-process all generated files
		if err := filepath.Walk(outDir, func(path string, info os.FileInfo, err error) error {
			if strings.HasSuffix(path, ".md") {
				return utils.SanitizeForMDX(path)
			}
			return nil
		}); err != nil {
			log.Fatal().Err(err).Msg("Error post-processing documentation")
		}
	},
}

func init() {
	rootCmd.AddCommand(generateDocsCmd)
}
