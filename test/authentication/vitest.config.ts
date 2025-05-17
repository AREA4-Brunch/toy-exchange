import { defineConfig } from 'vitest/config';
import path from 'path';

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
