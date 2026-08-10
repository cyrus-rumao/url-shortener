import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/api": "http://localhost:2000",
    },
  },
  plugins: [
    tailwindcss(),
    react(),

    babel({ presets: [reactCompilerPreset()] }),
  ], resolve: {
    tsconfigPaths: true,
  },
});
