import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 4175,
  },

  preview: {
    host: true,
    port: 4175,
    allowedHosts: [
     'admin.trmmc.az' ,'stg-api-admin.trmmc.az'
    ]
  },
})


