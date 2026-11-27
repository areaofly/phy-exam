import { defineConfig } from 'astro/config';

// 静态站点，可直接部署到 GitHub Pages / Cloudflare Pages
export default defineConfig({
  output: 'static',
});
