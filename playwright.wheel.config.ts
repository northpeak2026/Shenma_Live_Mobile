import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests', testMatch: 'lucky-wheel.spec.ts', timeout: 30000, workers: 1,
  use: { baseURL: 'http://127.0.0.1:4180', viewport: { width: 1100, height: 1100 }, launchOptions: { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' } },
  webServer: { command: 'VITE_WHEEL_MODE=api node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 4180', url: 'http://127.0.0.1:4180', reuseExistingServer: false },
});
