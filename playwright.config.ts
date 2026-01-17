import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: {
		command: 'npm run dev',
		port: 5173,          // MUST match Vite dev port
		reuseExistingServer: true,
	},
	testDir: 'e2e',
	timeout: 10_000 
});

