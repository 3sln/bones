import { defineConfig } from "vite";
import reel from "@3sln/reel/vite-plugin";
import path from "path";

const moduleUrl = new URL(import.meta.url);

export default defineConfig({
  plugins: [reel()],
});
