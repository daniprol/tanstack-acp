import { defineConfig } from 'tsup'
import path from 'path'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: {
    resolve: true,
    entry: './src/index.ts',
  },
  splitting: false,
  sourcemap: true,
  clean: true,
  external: [
    'react',
    'react-dom',
    '@tanstack/ai',
    '@tanstack/ai-react',
    '@agentclientprotocol/sdk'
  ],
  esbuildOptions(options) {
    options.alias = {
      '@agentclientprotocol/sdk': path.resolve(__dirname, '../../../typescript-sdk/dist/acp.js'),
    }
  },
})
