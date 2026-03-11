import type { Route } from '~/types/route'

interface CreateRouteData {
  id: string
  title: string
  description: string
  city: string
  difficulty: string
  estimatedMinutes: number
  distanceMeters: number
  coverImage?: string | null
  start: { lat: number; lng: number; name?: string }
  end: { lat: number; lng: number; name?: string }
  tags: string[]
  steps: Array<{
    order: number
    instruction: string
    image?: string | null
    location: { lat: number; lng: number; name?: string }
    distanceFromPrev?: number | null
    note?: string | null
  }>
}

type UpdateRouteData = Partial<Omit<CreateRouteData, 'id'>>

export function useAdminRoutes() {
  async function createRoute(data: CreateRouteData): Promise<Route> {
    return $fetch<Route>('/api/routes', { method: 'POST', body: data })
  }

  async function updateRoute(id: string, data: UpdateRouteData): Promise<Route> {
    return $fetch<Route>(`/api/routes/${id}`, { method: 'PUT', body: data })
  }

  async function deleteRoute(id: string): Promise<void> {
    await $fetch<void>(`/api/routes/${id}`, { method: 'DELETE' })
  }

  return { createRoute, updateRoute, deleteRoute }
}
