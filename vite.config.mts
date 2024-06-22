import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import { externalizeDeps as external } from 'vite-plugin-externalize-deps';

/**
 * vite config
 * @see https://vitejs.dev/
 */
export default defineConfig({
  plugins: [
    checker({
      typescript: true,
    }),
    external(),
  ],
  build: {
    sourcemap: true,
    copyPublicDir: false,
    lib: {
      entry: ['src/main.ts'],
      formats: ['es'],
    },
  },
});
