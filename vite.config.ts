/// <reference types="vitest" />
// Configure Vitest (https://vitest.dev/config/)

import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'nextjs-strapi-gateway',
      fileName: 'nextjs-strapi-gateway',
    },
  },

  plugins: [dts()],

  test: {
    coverage: {
      provider: 'c8',
    },
  },
});
