import { resolve, dirname } from 'path';
import yaml from 'js-yaml';
import fglob from 'fast-glob';
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';
import cloudflare from "@astrojs/cloudflare";
import netlify from "@astrojs/netlify";
import vercel from "@astrojs/vercel";
import node from '@astrojs/node';
import { consoleInfo, readFirstExistingFile } from './src/utils/build.js';
import {
  CONTENT_PATH_PREFIX,
  CONTENT_DIR,
  WORKING_DIR,
  WORKING_DIR_ABSOLUTE,
  FILES_OUTPUT_DIR,
  FILES_LIBRARY_OUTPUT_DIR,
  GLOBAL_PARTIALS_PREFIX,
  LOCAL_BUILD,
  PREFERRED_HOSTING,
  NETLIFY_BUILD,
  CLOUDFLARE_BUILD,
  VERCEL_BUILD,
  INTERNAL_SYMLINK_PATH,
} from "./env.config.js";

const cloudflareOptions = {
  platformProxy: { enabled: true, configPath: 'wrangler.jsonc', experimentalJsonConfig: true }
}

const nodeOptions = { mode: 'standalone' }

// NOTE: Cloudflare workaround for Error:
// `Failed to publish your Function. Got error: Uncaught ReferenceError: MessageChannel is not defined`
// https://github.com/withastro/adapters/pull/436#issuecomment-2525190557
// https://github.com/withastro/astro/issues/12824#issuecomment-2563095382
const cloudflareViteConfig = {
  resolve: {
    // Use react-dom/server.edge instead of react-dom/server.browser for React 19.
    // Without this, MessageChannel from node:worker_threads needs to be polyfilled.
    alias: (import.meta.env.PROD || import.meta.env.NODE_ENV === 'production') && {
      "react-dom/server": "react-dom/server.edge",
    },
  },
  // ssr: { external: ['node:process'] }, // To activate node compat for specific packages
}

const adapterConfig = {
  ...((LOCAL_BUILD && PREFERRED_HOSTING === 'cloudflare' && cloudflareOptions) || {}),
  ...((LOCAL_BUILD && PREFERRED_HOSTING === 'node' && nodeOptions) || {}),
}

const adapter = LOCAL_BUILD
  ? { netlify, cloudflare, vercel, node }[PREFERRED_HOSTING](adapterConfig)
  : (NETLIFY_BUILD && netlify()) ||
  (CLOUDFLARE_BUILD && cloudflare(cloudflareOptions)) ||
  (VERCEL_BUILD && vercel());

// Retrieve User preferences
let globalSettings;
try {
  const globalSettingsYaml = await readFirstExistingFile([
    `${WORKING_DIR}/_data/globalSettings.yaml`,
    `${CONTENT_DIR}/_data/globalSettings.yaml`,
  ]);
  
  if (globalSettingsYaml) {
    globalSettings = yaml.load(globalSettingsYaml);
    consoleInfo(`Global settings loaded successfully for ${globalSettings?.siteName}`);
  } else {
    consoleInfo('Global settings file not found, skipping...');
  }
} catch (e) {
  consoleInfo(`Error loading global settings: ${e.message}`);
}

// Retrieve global partials
let globalPartials;
try {
  globalPartials = await fglob('**/*.mdoc', {
    cwd: 'src/config-markdoc/partials',
    // objectMode: true
  });
} catch (e) {
  consoleInfo(`Error loading global partials: ${e.message}`);
}

/** @type {import('vite').UserConfig} */
const viteConfig = {
  // TODO: need to find a way to include files that are excluded by .gitignore
  // server: {
  //   watch: {
  //     ignored: ['node_modules/**', `!./${WORKING_DIR}/**`],
  //     usePolling: true,
  //     interval: 1000
  //   },
  //   fs: {
  //     strict: false,
  //     allow: [
  //       // Allow serving files from the project root
  //       '.',
  //       // Allow serving files from one level up (if needed)
  //       // '..',
  //       // Explicitly allow the content directory with absolute path
  //       new URL(`./${WORKING_DIR}`, import.meta.url).pathname
  //     ]
  //   }
  // },
  // To be able to work with local libraries
  ...(LOCAL_BUILD ? {
    server: {
      fs: {
        allow: [
          ".",
          "../../libraries/",
        ],
      },
    },
  } : {}),
  define: {
    'import.meta.env.LOCAL_BUILD': JSON.stringify(LOCAL_BUILD),
    'import.meta.env.PREFERRED_HOSTING': JSON.stringify(PREFERRED_HOSTING),
    'import.meta.env.NETLIFY_BUILD': JSON.stringify(NETLIFY_BUILD),
    'import.meta.env.CLOUDFLARE_BUILD': JSON.stringify(CLOUDFLARE_BUILD),
    'import.meta.env.VERCEL_BUILD': JSON.stringify(VERCEL_BUILD),
    'import.meta.env.GLOBAL_SETTINGS': JSON.stringify(globalSettings || {}),
    'import.meta.env.GLOBAL_PARTIALS': JSON.stringify(globalPartials || []),
    // Content preferences
    'import.meta.env.CONTENT_PATH_PREFIX': JSON.stringify(CONTENT_PATH_PREFIX),
    'import.meta.env.CONTENT_DIR': JSON.stringify(CONTENT_DIR),
    'import.meta.env.WORKING_DIR': JSON.stringify(WORKING_DIR),
    'import.meta.env.INTERNAL_SYMLINK_PATH': JSON.stringify(INTERNAL_SYMLINK_PATH),
    'import.meta.env.FILES_OUTPUT_DIR': JSON.stringify(FILES_OUTPUT_DIR),
    'import.meta.env.FILES_LIBRARY_OUTPUT_DIR': JSON.stringify(FILES_LIBRARY_OUTPUT_DIR),
    'import.meta.env.GLOBAL_PARTIALS_PREFIX': JSON.stringify(GLOBAL_PARTIALS_PREFIX),
  },
  resolve: {
    alias: {
      "#contentDir": resolve(dirname(new URL(import.meta.url).pathname), CONTENT_DIR),
      "#workingDir": resolve(dirname(new URL(import.meta.url).pathname), WORKING_DIR),
      "#workingDirAbsolute": resolve(dirname(new URL(import.meta.url).pathname), WORKING_DIR_ABSOLUTE),
      // "#content-ext": resolve(dirname(new URL(import.meta.url).pathname), INTERNAL_SYMLINK_PATH),
    },
  },
  ...((LOCAL_BUILD && PREFERRED_HOSTING === 'cloudflare') || CLOUDFLARE_BUILD) ? cloudflareViteConfig : {}
}

// https://astro.build/config
export default defineConfig({
  srcDir: './cms',
  integrations: [
    // ...(CONTENT_IS_SYMLINK ? [contentSymlinkIntegration()] : []),
    react(),
    markdoc(),
    keystatic()
  ],
  adapter,
  vite: viteConfig
});
