import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  base: process.env.EXAMPLE_BASE_PATH ?? '/',
  plugins: [react(), nodePolyfills()],
});
