import { defineConfig } from "vite";
import deck from "@3sln/deck/vite-plugin";
import path from "path";

const moduleUrl = new URL(import.meta.url);

export default defineConfig({
  plugins: [deck()],
});
