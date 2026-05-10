import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const isTauri = process.env.TAURI_ENV_PLATFORM != null;

export default defineConfig({
  base: isTauri ? './' : '/mini-golf/',
    plugins: [
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
});