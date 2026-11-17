import fs from 'node:fs';
import { defineConfig } from 'tsdown';

export default defineConfig([
	// ESM bundle and types
	{
		entry: ['./src/index.ts'],
		format: ['esm'],
		outDir: 'dist',
		clean: true,
		dts: true,
		deps: {
			neverBundle: ['vue']
		},
		outExtensions: () => ({
			js: '.mjs',
			dts: '.d.mts'
		}),
		plugins: [
			{
				name: 'copy-dmts',
				writeBundle() {
					fs.copyFileSync('dist/index.d.ts', 'dist/index.d.mts');
				}
			}
		]
	},

	// CJS types only
	{
		entry: {
			index: './src/index.umd.ts'
		},
		format: ['cjs'],
		outDir: 'dist',
		clean: false,
		dts: {
			cjsDefault: true,
			emitDtsOnly: true
		},
		deps: {
			neverBundle: ['vue']
		},
		outExtensions: () => ({
			dts: '.d.ts'
		})
	},

	// UMD bundle
	{
		entry: ['./src/index.umd.ts'],
		format: ['umd'],
		outDir: 'dist',
		clean: false, // Don't wipe the ESM and dts files!
		dts: false,
		deps: {
			neverBundle: ['vue']
		},
		outputOptions: {
			entryFileNames: 'index.js',
			name: 'DataTableVue',
			globals: {
				vue: 'Vue'
			}
		}
	}
]);
