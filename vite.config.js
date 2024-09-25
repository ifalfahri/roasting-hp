import {defineConfig, loadEnv} from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig(({command, mode}) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    define: {
      'process.env.GOOGLE_API_KEY': JSON.stringify(env.GOOGLE_API_KEY),
    },
    plugins: [react()],
  }
})
