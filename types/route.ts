// Re-export enums from single source of truth
import type { City, Difficulty, RouteStatus, RouteSource, RequestStatus } from '../config/constants'
export type { City, Difficulty, RouteStatus, RouteSource, RequestStatus }

export interface Location {
  lat: number
  lng: number
  name?: string
}

export interface Step {
  order: number
  instruction: string
  image?: string
  location: Location
  distanceFromPrev?: number
  note?: string
}

export interface Review {
  id: string
  rating: number
  comment?: string
  createdBy: { id: string; name: string; avatar?: string }
  createdAt: string
  updatedAt: string
}

export interface Route {
  id: string
  title: string
  description: string
  city: City
  difficulty: Difficulty
  estimatedMinutes: number
  distanceMeters: number
  coverImage: string
  start: Location
  end: Location
  steps: Step[]
  tags: string[]
  status: RouteStatus
  source: RouteSource
  averageRating?: number
  reviewCount?: number
  isSaved?: boolean
  createdBy?: { id: string; name: string; avatar?: string }
  createdAt: string
  updatedAt: string
}

export interface RouteRequest {
  id: string
  title: string
  description: string
  city: City
  startPoint: string
  endPoint: string
  status: RequestStatus
  voteCount: number
  hasVoted: boolean
  createdBy: { id: string; name: string; avatar?: string }
  fulfilledRouteId?: string
  createdAt: string
}
