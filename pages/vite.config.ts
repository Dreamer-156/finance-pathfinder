import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'node:url';
export default defineConfig({base:'./',root:fileURLToPath(new URL('./',import.meta.url)),plugins:[react()],resolve:{alias:{'@':fileURLToPath(new URL('../',import.meta.url))}},build:{outDir:fileURLToPath(new URL('../pages-dist',import.meta.url)),emptyOutDir:true}});
