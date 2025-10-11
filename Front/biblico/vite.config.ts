import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {

    proxy: {
      
      '/api': {
        // Será redirecionada para a URL do seu backend Spring Boot
        target: 'http://localhost:8081', 
        // Necessário para requisições baseadas em nomes
        changeOrigin: true, 
        // Opcional: Para remover o prefixo /api na chamada final,
        // mas é melhor mantê-lo para que o mapeamento do seu controller funcione.
        // rewrite: (path) => path.replace(/^\/api/, ''), 
      },
    },
  },
})