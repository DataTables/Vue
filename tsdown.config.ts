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
			dts: '.d.ts'
		})
	},

	// UMD bundle
	{
		entry: ['./src/index.ts'],
		format: ['umd'],
		outDir: 'dist',
		clean: false, // Don't wipe the ESM and dts files!
		deps: {
			neverBundle: ['vue']
		},
		outputOptions: {
			entryFileNames: 'index.js',
			name: 'DataTable',
			globals: {
				vue: 'Vue'
			}
		}
	}
]);
