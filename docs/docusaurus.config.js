/*
 * Copyright 2025 Zigflow authors <https://github.com/mrsimonemms/zigflow/graphs/contributors>
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
// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config
import { themes as prismThemes } from 'prism-react-renderer';

const organizationName = 'mrsimonemms';
const projectName = 'zigflow';
const githubDomain = `${organizationName}/${projectName}`;

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Zigflow',
  tagline:
    'Turn your declarative YAML into production-ready Temporal workflows',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://zigflow.dev',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName, // Usually your GitHub org/user name.
  projectName, // Usually your repo name.

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: `https://github.com/${githubDomain}/tree/main/docs/`,
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/social.png',
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'Zigflow',
        logo: {
          alt: 'Zigflow',
          src: 'img/logo.png',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'docsSidebar',
            position: 'left',
            label: 'Docs',
          },
          {
            type: 'docSidebar',
            sidebarId: 'dslSidebar',
            position: 'left',
            label: 'DSL',
          },
          {
            type: 'docSidebar',
            sidebarId: 'deploymentSidebar',
            position: 'left',
            label: 'Deploying',
          },
          {
            label: '❤️ Sponsor',
            position: 'right',
            href: 'https://buymeacoffee.com/mrsimonemms',
          },
          {
            label: 'Temporal',
            position: 'right',
            href: 'https://temporal.io',
          },
          {
            href: `https://github.com/${githubDomain}`,
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Community',
            items: [
              {
                label: 'Slack',
                href: 'https://temporalio.slack.com/archives/C09UMNG4YP7',
              },
              {
                label: 'GitHub Discussions',
                href: `https://github.com/${githubDomain}/discussions`,
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Temporal',
                href: 'https://temporal.io',
              },
              {
                label: 'Serverless Workflow',
                href: 'https://serverlessworkflow.io',
              },
              {
                label: 'GitHub',
                href: `https://github.com/${githubDomain}`,
              },
            ],
          },
        ],
        copyright: `Licenced under <a href="https://github.com/mrsimonemms/zigflow/blob/main/LICENSE" target="_blank">Apache-2.0</a>
        <br />
        Ziggy mascot &copy; <a href="https://temporal.io" target="_blank">Temporal Technologies</a>
        <br />
        Copyright &copy; ${new Date().getFullYear()} <a href="https://github.com/mrsimonemms/zigflow/graphs/contributors" target="_blank">Zigflow authors</a>.
        Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
