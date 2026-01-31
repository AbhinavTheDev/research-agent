import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  compatibilityDate: "2025-04-01",
  preset: "cloudflare_module",
  cloudflare: {
    deployConfig: true,
    nodeCompat: true,
  },
});
