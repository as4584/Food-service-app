import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [["html", { open: "never", outputFolder: "playwright-report" }]],
  use: {
    baseURL: "http://localhost:3082",
    trace: "on-first-retry",
  },
  projects: [
    { name: "iPhone 12", use: { ...devices["iPhone 12"], defaultBrowserType: "chromium" } },
  ],
  webServer: {
    command: "npx serve dist -p 3082 --no-clipboard",
    port: 3082,
    timeout: 30_000,
    reuseExistingServer: !process.env.CI,
  },
});
