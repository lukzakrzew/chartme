import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { quasar } from "@quasar/vite-plugin";
import { VitePWA } from "vite-plugin-pwa";
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
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
              },
            },
          },
        ],
        // Add custom notification logic to the generated service worker
        additionalManifestEntries: [],
        manifestTransforms: [],
      },
      injectRegister: "auto",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
      manifest: {
        name: "ChartMe",
        short_name: "ChartMe",
        description: "A personal tracking application with daily reminders",
        theme_color: "#000000",
        background_color: "#ffffff",
        display: "standalone",
        icons: [
          {
            src: "vite.svg",
            sizes: "any",
            type: "image/svg+xml",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
