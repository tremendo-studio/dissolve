import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { defineConfig } from "vite"

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "lib/index.ts"),
      name: "TremendoDissolve",
      fileName: "tremendo-dissolve",
      formats: ["iife"],
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {},
      },
    },
  },
})
