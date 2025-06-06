import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/main/ts/index.ts'],
    format: ['esm', 'cjs'],
    outDir: 'dist',
    dts: true,          // Generate .d.ts files
    sourcemap: true,
    clean: true         // Clean output before building
});