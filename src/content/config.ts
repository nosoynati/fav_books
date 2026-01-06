import { defineCollection, z } from "astro:content";
// z -> zod, libreria para validar schemas

const books = defineCollection({
  schema: z.object({
    title: z.string(),
    author: z.string(),
    img: z.string(),
    publisher: z.string(),
    description: z.string(),
    buy: z.object({
      argnetina: z.string().url(),
      usa: z.string().url(),
    }),
  })
})

export const collections = { books };