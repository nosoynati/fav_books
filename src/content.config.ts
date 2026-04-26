import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
// z -> zod, libreria para validar schemas

const books = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/books"}),
  schema: z.object({
    title: z.string(),
    id: z.int(),
    author: z.string(),
    img: z.string(),
    publisher: z.string(),
    description: z.string(),
    buy: z.object({
      argnetina: z.string().url({normalize: true}),
      usa: z.string().url({normalize: true}),
    }),
  })
})
export const collections = { books };