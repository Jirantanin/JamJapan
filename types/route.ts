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

export type Difficulty = 'easy' | 'medium' | 'hard'

export type City = 'tokyo' | 'osaka' | 'kyoto' | 'nara' | 'fukuoka' | 'sapporo' | 'hiroshima' | 'other'

export type RouteStatus = 'draft' | 'published' | 'unpublished'
export type RouteSource = 'official' | 'community'
export type RequestStatus = 'pending' | 'fulfilled' | 'closed'

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
