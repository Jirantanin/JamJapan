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
}
