import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: ['**/*.test.ts'],
        environment: 'node',
        setupFiles: [],
    },
    resolve: {
        alias: {
            '@src': path.resolve(__dirname, '../../src'),
        },
    },
});
