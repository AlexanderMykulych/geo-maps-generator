
import { defineConfig } from 'vite'
import { externalizeDeps } from 'vite-plugin-externalize-deps'
import { resolve } from 'node:path'

const isDev = !!process.env.NODE_ENV;
export default defineConfig({
  plugins: [
    externalizeDeps({
      include: [/node_modules/],
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, './src/index.ts'),
      name: 'voronoi',
      fileName: (format) => `voronoi.${format}.js`,
      formats: ['es'],
    },
    minify: !isDev,
    sourcemap: isDev,
  },
});
