import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// Public technical docs at /docs/<id>/.
const docs = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/docs" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number(),
    updated: z.coerce.date(),
  }),
});

// Legal & privacy pages at /legal/<id>/.
// status: "in-effect" applies to the site today; "standby" is a plan that's ready for when it's needed.
const legal = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/legal" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number(),
    status: z.enum(["in-effect", "standby"]),
    updated: z.coerce.date(),
  }),
});

export const collections = { docs, legal };
