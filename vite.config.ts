// vite.config.ts
import { defineConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { analyzer } from "vite-bundle-analyzer";

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    tailwindcss(),
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tanstackStart({
      router: {
        autoCodeSplitting: true,
      },
    }),
    viteReact(),
    nitro(),
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    ...(process.env.ANALYZE ? [analyzer({ fileName: "stats.html" })] : []),
  ],
  build: {
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ["console.log", "console.info", "console.debug"],
      },
    },
  },

  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === "development"),
  },
});
