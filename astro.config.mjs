// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://miguelzgobbo.github.io',
  base: '/portifolio-miguelzg/',
  build: {
    inlineStylesheets: 'always',
  },
  integrations: [sitemap()],
});
