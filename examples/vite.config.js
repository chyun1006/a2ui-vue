import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
export default defineConfig({
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        // target: "http://10.22.15.165:8080",
        target: "http://10.22.14.136:8080", // 浩哥
        changeOrigin: true,
        // pathRewrite: {
        //   "^/api": "",
        // },
      },
    },
  },
});
