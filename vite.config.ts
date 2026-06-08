import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

// base must match the GitHub Pages repo name so assets resolve at
// https://<user>.github.io/KEnjine/
export default defineConfig({
  base: "/KEnjine/",
  plugins: [react()],
  resolve: {
    alias: {
      // jsPDF lazily imports html2canvas (.html() API) and canvg (.svg() API),
      // neither of which KEnjine uses. Stub them so they don't bloat or break
      // the bundle (canvg pulls in core-js internals that Rollup can't resolve).
      html2canvas: fileURLToPath(
        new URL("./src/lib/html2canvas-stub.ts", import.meta.url)
      ),
      canvg: fileURLToPath(
        new URL("./src/lib/html2canvas-stub.ts", import.meta.url)
      ),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          konva: ["konva", "react-konva"],
          liveblocks: ["@liveblocks/client", "@liveblocks/react"],
          pdf: ["jspdf"],
        },
      },
    },
  },
});
