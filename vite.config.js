import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.VITE_GOOGLE_API_KEY': JSON.stringify(process.env.GOOGLE_API_KEY),
    'process.env.VITE_GROQ_API_KEY': JSON.stringify(process.env.GROQ_API_KEY),
  },
})