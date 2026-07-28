import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // GitHub Pages serves this from /baseball-rankings/ rather than the domain
  // root, so asset URLs need that prefix. Change it if the repo is renamed.
  base: '/baseball-rankings/',
  plugins: [react(), tailwindcss()],
})
