import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJSX from "@vitejs/plugin-vue-jsx";
import { resolve } from "path";
import { createStyleImportPlugin, ElementPlusResolve, AndDesignVueResolve } from "vite-plugin-style-import";
import { visualizer } from "rollup-plugin-visualizer";
// https://vitejs.dev/config/
console.log(process.env.TAURI_PLATFORM, "process.env.TAURI_PLATFORM");
export default defineConfig(async () => ({
  plugins: [
    vue(),
    vueJSX(),
    createStyleImportPlugin({
      resolves: [AndDesignVueResolve(), ElementPlusResolve()],
    }),
    visualizer(),
  ],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  // prevent vite from obscuring rust errors
  clearScreen: false,
  // tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
  },

  resolve: {
    alias: [{ find: /@src/, replacement: resolve(__dirname, "src") }],
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  // to make use of `TAURI_DEBUG` and other env variables
  // https://tauri.studio/v1/api/config#buildconfig.beforedevcommand
  envPrefix: ["VITE_", "TAURI_"],
  build: {
    // Tauri supports es2021
    target: "chrome63",
    // don't minify for debug builds
    minify: !process.env.TAURI_DEBUG ? "esbuild" : false,
    // produce sourcemaps for debug builds
    sourcemap: !!process.env.TAURI_DEBUG,
    rollupOptions: {
      manualChunks: (id) => {
        if (id.includes("pinia")) {
          return "vendor_pinia";
        }
        if (id.includes("vue-router")) {
          return "vendor_vue-router";
        }
        if (id.includes("vue-runtime-core")) {
          return "vendor_vue-runtime-core";
        }
        if (id.includes("ant-design-vue")) {
          return "vendor_ant-design-vue";
        }
        if (id.includes("lodash")) {
          return "vendor_lodash";
        }
        if (id.includes("element-plus")) {
          return "vendor_element-plus";
        }
        if (id.includes("node_modules")) {
          return "vendor";
        }
      },
    },
  },
}));
