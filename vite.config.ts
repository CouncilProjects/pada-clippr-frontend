import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { wuchale } from '@wuchale/vite-plugin'
export default defineConfig({
	plugins: [wuchale(),tailwindcss(), sveltekit()],
	server:{
		proxy:{
			'/api' : {
				target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
			}
		}
	}
});
