import { defineConfig, envField } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  // ...
  integrations: [tailwind()],
  // ...
  env: {
    schema: {
      SHOW_BUY_BUTTON: envField.boolean({ context: 'server', access: 'public'}),
      SCORE_API_ENDPOINT: envField.string({ context: 'server', access: 'public'})
    }
  }
});