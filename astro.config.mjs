import { defineConfig } from 'astro/config';
import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
  // This tells Astro to build for a server environment
  output: "server",

  // This adapter configures Astro to deploy as a Vercel Serverless Function
  // The configuration is now passed as an options object.
  adapter: vercel({
    webAnalytics: { enabled: true } // Optional: Enables Vercel's analytics
  })
});