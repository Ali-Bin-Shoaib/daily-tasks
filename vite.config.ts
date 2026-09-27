import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

const onGitHubPages = process.env.GITHUB_PAGES === 'true'

export default defineConfig({
  base: onGitHubPages ? '/daily-tasks/' : '/',
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
  ],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
