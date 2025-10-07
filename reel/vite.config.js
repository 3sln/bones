import { defineConfig } from 'vite';
import reel from '@3sln/reel/vite-plugin';

export default defineConfig({
  plugins: [reel()],
});
