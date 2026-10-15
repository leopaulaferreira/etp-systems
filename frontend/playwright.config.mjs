import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: true,
  workers: 2,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:5178',
    browserName: 'chromium',
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : {},
    hasTouch: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'mobile-320', use: { viewport: { width: 320, height: 568 }, isMobile: true } },
    { name: 'mobile-390', use: { viewport: { width: 390, height: 844 }, isMobile: true } },
    { name: 'landscape', use: { viewport: { width: 844, height: 390 }, isMobile: true } },
    { name: 'tablet', use: { viewport: { width: 768, height: 1024 }, isMobile: true } },
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 }, isMobile: false } },
  ],
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 5178 --strictPort',
    url: 'http://127.0.0.1:5178',
    reuseExistingServer: false,
  },
})
