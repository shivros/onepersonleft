import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node', // Pure TypeScript sim logic, no DOM
  },
})
