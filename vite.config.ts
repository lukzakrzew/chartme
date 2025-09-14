import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { quasar } from "@quasar/vite-plugin";
import path from "path";

export default defineConfig({
  base: "/chartme/",
  build: {
    outDir: "docs",
  },
  plugins: [
    vue(),
    quasar({
      sassVariables: "/src/quasar-variables.sass",
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
