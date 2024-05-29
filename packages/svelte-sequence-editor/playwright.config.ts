import { defineConfig, devices } from '@playwright/test';

const config = defineConfig({
	testMatch: '**/*e2e.spec.ts',

	// Fail the build on CI if you accidentally left test.only in the source code.
	forbidOnly: !!process.env.CI,

	// Retry on CI only.
	retries: process.env.CI ? 2 : 0,

	use: {
		// Base URL to use in actions like `await page.goto('/')`.
		baseURL: 'http://127.0.0.1:3000',
	
		// Collect trace when retrying the failed test.
		trace: 'on-first-retry',
	  },
	projects: [
		{
		  name: 'chromium',
		  use: { ...devices['Desktop Chrome'] },
		},
	],

	reporter: process.env.CI ? 'github' : 'list',
	webServer: {
		command: 'pnpm run preview',
		port: 4173
	}
});

export default config;
