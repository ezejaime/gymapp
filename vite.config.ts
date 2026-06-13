import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vitest/config";

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const base = isGitHubPages ? "/gymapp/" : "/";

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "icon.svg",
        "icon-192.png",
        "icon-512.png",
        "icon-maskable-192.png",
        "icon-maskable-512.png",
        "apple-touch-icon.png"
      ],
      manifest: {
        name: "Rutinas",
        short_name: "Rutinas",
        description: "Cuaderno local para rutinas de gimnasio.",
        lang: "es-AR",
        id: base,
        scope: base,
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        start_url: base,
        orientation: "portrait",
        icons: [
          {
            src: `${base}icon.svg`,
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any"
          },
          {
            src: `${base}icon-192.png`,
            sizes: "192x192",
            type: "image/png",
            purpose: "any"
          },
          {
            src: `${base}icon-512.png`,
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          },
          {
            src: `${base}icon-maskable-192.png`,
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable"
          },
          {
            src: `${base}icon-maskable-512.png`,
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,webmanifest}"],
        navigateFallback: "index.html",
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "google-fonts-stylesheets"
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-webfonts",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          }
        ]
      }
    })
  ],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts"
  }
});
