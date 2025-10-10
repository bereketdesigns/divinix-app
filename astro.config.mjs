import { defineConfig } from 'astro/config';
import vercel from "@astrojs/vercel/serverless";

// https://astro.build/config
export default defineConfig({
  // This tells Astro to build for a server environment
  output: "server",

  // This adapter configures Astro to deploy as a Vercel Serverless Function
  adapter: vercel()
});