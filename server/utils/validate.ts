import { z } from 'zod'

const locationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  name: z.string().optional(),
})

const stepSchema = z.object({
  order: z.number().int().positive(),
  instruction: z.string().min(1),
  image: z.string().url().optional().nullable(),
  location: locationSchema,
  distanceFromPrev: z.number().int().nonnegative().optional().nullable(),
  note: z.string().optional().nullable(),
})

const CITIES = ['tokyo', 'osaka', 'kyoto', 'nara', 'fukuoka', 'sapporo', 'hiroshima', 'other'] as const
const DIFFICULTIES = ['easy', 'medium', 'hard'] as const

export const createRouteSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'id must be kebab-case slug'),
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  city: z.enum(CITIES),
  difficulty: z.enum(DIFFICULTIES),
  estimatedMinutes: z.number().int().positive(),
  distanceMeters: z.number().int().positive(),
  coverImage: z.string().url().optional().nullable(),
  start: locationSchema,
  end: locationSchema,
  tags: z.array(z.string()).default([]),
  steps: z.array(stepSchema).min(1),
})

export const updateRouteSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).optional(),
  city: z.enum(CITIES).optional(),
  difficulty: z.enum(DIFFICULTIES).optional(),
  estimatedMinutes: z.number().int().positive().optional(),
  distanceMeters: z.number().int().positive().optional(),
  coverImage: z.string().url().optional().nullable(),
  start: locationSchema.optional(),
  end: locationSchema.optional(),
  tags: z.array(z.string()).optional(),
  steps: z.array(stepSchema).optional(),
})

export const createRouteRequestSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  city: z.enum(CITIES),
  startPoint: z.string().min(1).max(200),
  endPoint: z.string().min(1).max(200),
})

export const updateRouteRequestSchema = createRouteRequestSchema.partial()

export type CreateRouteInput = z.infer<typeof createRouteSchema>
export type UpdateRouteInput = z.infer<typeof updateRouteSchema>
export type CreateRouteRequestInput = z.infer<typeof createRouteRequestSchema>
export type UpdateRouteRequestInput = z.infer<typeof updateRouteRequestSchema>
