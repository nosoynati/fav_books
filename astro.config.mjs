import { defineConfig, envField, fontProviders } from 'astro/config';
import tailwind from '@astrojs/tailwind';

import vercel from '@astrojs/vercel';

export default defineConfig({
  // ...
  output: 'server',

  integrations: [tailwind()],

  // ...
  env: {
    schema: {
      SHOW_BUY_BUTTON: envField.boolean({ default: true, context: 'server', access: 'public'}),
      HARDCOVER_API_KEY: envField.string({ context: 'server', access: 'public' }),
      SCORE_API_ENDPOINT: envField.string({ context: 'server', access: 'public'})
    }
  },
  fonts: [{
    provider: fontProviders.local(),
    name: "IntelOne",
    cssVariable: "--font-intel-one",
    options: {
      variants: [{
        src: ["./src/assets/fonts/IntelOneMono_wght.ttf"],
        weight: "normal",
        style: "normal"
      }]
    }
  }],
  adapter: vercel({
    webAnalytics: {
      enabled: true
    }
  })
});