// config/constants.ts — Single source of truth for all enum values
// These are used as TypeScript types AND runtime validation arrays

// ---- City ----
export const CITIES = ['tokyo', 'osaka', 'kyoto', 'nara', 'fukuoka', 'sapporo', 'hiroshima', 'other'] as const
export type City = (typeof CITIES)[number]

// ---- Difficulty ----
export const DIFFICULTIES = ['easy', 'medium', 'hard'] as const
export type Difficulty = (typeof DIFFICULTIES)[number]

// ---- Route Status ----
export const ROUTE_STATUSES = ['draft', 'published', 'unpublished'] as const
export type RouteStatus = (typeof ROUTE_STATUSES)[number]

// ---- Route Source ----
export const ROUTE_SOURCES = ['official', 'community'] as const
export type RouteSource = (typeof ROUTE_SOURCES)[number]

// ---- Request Status ----
export const REQUEST_STATUSES = ['pending', 'fulfilled', 'closed'] as const
export type RequestStatus = (typeof REQUEST_STATUSES)[number]
