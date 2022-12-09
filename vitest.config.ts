/// <reference types="vitest" />
import { defineConfig } from "vite";
import Vue from "@vitejs/plugin-vue";
import Markdown from "vite-plugin-md";
import code from "./src/index";

// used for testing, library code uses TSUP to build exports
export default defineConfig({

  plugins: [
    Markdown({
      builders: [ code() ],
    }),
    Vue({
      include: [/\.vue$/, /\.md$/],
    }),
  ],
});
