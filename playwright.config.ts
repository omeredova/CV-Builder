import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  // The local backend is reset per test; keep its scenarios isolated.
  workers: 1,
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:3100",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "node e2e/support/graphql-server.mjs",
      url: "http://127.0.0.1:4100/health",
      reuseExistingServer: false,
    },
    {
      command: "npm run build && npm run start -- --hostname localhost --port 3100",
      url: "http://localhost:3100/login",
      env: { VITE_GRAPHQL_URL: "http://127.0.0.1:4100/graphql" },
      reuseExistingServer: false,
      timeout: 180_000,
    },
  ],
});
