import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // <--- AGREGAR ESTO

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // <--- AGREGAR ESTO
  ],
  base: './',
})