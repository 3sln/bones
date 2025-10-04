import { defineConfig } from 'vite';
import reel from '@3sln/reel/vite-plugin';

const importMap = {
  imports: {
    "@3sln/dodo": "/node_modules/@3sln/dodo/index.js",
    "@3sln/dodo/": "/node_modules/@3sln/dodo/",
    "@3sln/bones/": "/node_modules/@3sln/bones/src/",
  }
};

export default defineConfig({
  plugins: [reel({ entry: './doc.md', importMap })],
});
