import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/playwright',
  timeout: 60_000,
  use: {
    headless: true,
    baseURL: 'http://localhost:3000',
    actionTimeout: 10_000,
  },
});
