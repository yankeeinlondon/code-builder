/// <reference types="vitest" />
import { defineConfig } from "vite";
import Vue from "@vitejs/plugin-vue";
import Markdown from "vite-plugin-md";
import code from "./src/index";

// used for testing, library code uses TSUP to build exports
export default defineConfig({
  test: {
    dir: "test",
    exclude: ["**/*.spec.ts"],
    environment: "happy-dom",
    api: {
      host: "0.0.0.0",
    },
    coverage: {
      reporter: ["json", "html"]
    }
  },
  plugins: [
    Markdown({
      builders: [ code() ],
    }),
    Vue({
      include: [/\.vue$/, /\.md$/],
    }),
  ],
});
