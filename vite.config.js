import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/ZebercedSolarOptimizer360/', // GitHub Pages için zorunlu
  plugins: [react()],
})
