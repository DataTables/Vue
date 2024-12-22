import path from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

import { name as packageName } from './package.json';

// https://vitejs.dev/config/
export default defineConfig(() => ({
  plugins: [vue()],
  build: {
    // minify: false,
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: packageName,
      formats: ['es', 'cjs', 'umd'],
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          'vue': 'Vue',
        },
        exports: 'named'
      }
    },
  },
}));
