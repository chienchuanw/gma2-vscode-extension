import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    include: ['test/unit/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['src/extension.ts'],
    },
  },
  resolve: {
    alias: {
      vscode: path.resolve(__dirname, 'test/helpers/vscode-mock.ts'),
    },
  },
});
