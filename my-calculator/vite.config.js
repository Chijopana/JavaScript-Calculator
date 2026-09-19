import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  // El plugin oficial de Tailwind v4 sustituye a postcss.config.cjs +
  // autoprefixer + tailwind.config.cjs: en la v4 el tema se declara en el CSS
  // y la detección de clases es automática.
  plugins: [react(), tailwindcss()],
});
