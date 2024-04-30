import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
	testMatch: '**/*e2e.spec.ts',
	reporter: process.env.CI ? 'github' : 'list',
	webServer: {
		command: 'pnpm run preview',
		port: 4173
	}
};

export default config;
