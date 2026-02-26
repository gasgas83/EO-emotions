import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import FullReload from "vite-plugin-full-reload";

export default defineConfig({
  plugins: [svelte({}), FullReload("src/**")],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        // Agrega [hash] al nombre del archivo (ej: "eo-emotions.a1b2c3.js")
        entryFileNames: 'eo-emotions.[hash].js',
        // Opcional: También puedes aplicar hash a los assets (CSS, imágenes, etc.)
        assetFileNames: 'assets/[name].[hash][extname]'
      }
    }
  }
})