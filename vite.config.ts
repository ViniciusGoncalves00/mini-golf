import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "/mini-golf/",
    plugins: [
    tailwindcss(),
  ],
});