import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

const sourceSchema = z.object({
  label: z.string().min(1),
  url: z.url(),
})

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string().min(1),
    slug: z.string().regex(/^[a-z0-9-]+$/),
    summary: z.string().min(1),
    period: z.string().min(1),
    status: z.enum(['standby', 'archived']),
    hero: z.string().startsWith('/'),
    heroAlt: z.string().min(1),
    challenge: z.string().min(1),
    response: z.string().min(1),
    outcome: z.string().min(1),
    order: z.number().int().nonnegative(),
    sources: z.array(sourceSchema).min(1),
  }),
})

export const collections = { projects }
