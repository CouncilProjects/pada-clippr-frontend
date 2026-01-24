import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { wuchale } from '@wuchale/vite-plugin'
import {visualizer} from 'rollup-plugin-visualizer'
import templates from 'rollup-plugin-visualizer/dist/plugin/template-types';


export default defineConfig(({ mode }) => ({
	plugins: [wuchale(), tailwindcss(), sveltekit(), 
		mode === 'analyze' && visualizer({ 
			template: 'flamegraph',
			filename:'./dist/stats.html',
			open: false, 
			gzipSize: true, 
			brotliSize: false,
			// @ts-ignore
			colorFn:(module)=>{
				if(!module.id) return "#cccccc"
				if (module.id.includes("src/lib")) return "#1e757d"
				if (module.id.includes("src/")) return "#10ad2d"
				if (module.id.includes("node_modules/@skeletonlabs")) return "#c9b412"
				if (module.id.includes("node_modules")) return "#c92112"
				return "#aa05e6" //unknown
			} 
		})],
	server: {
		proxy: {
			'/api': {
				target: 'http://localhost:8000',
				changeOrigin: true,
				secure: false
			}
		}
	}
}));

/*export default defineConfig({
	plugins: [wuchale(),tailwindcss(), sveltekit(), mode='analyze'&&visualizer({template:'flamegraph',open:false,gzipSize:true,brotliSize:false})],
	server:{
		proxy:{
			'/api' : {
				target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
			}
		}
	}
});*/
