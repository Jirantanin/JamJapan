import type { Route, City, Difficulty } from '~/types/route'

export function useRoutes() {
  // Fetch routes from API with optional filters
  function fetchRoutes(options?: {
    city?: Ref<City | 'all'> | City | 'all'
    difficulty?: Ref<Difficulty | 'all'> | Difficulty | 'all'
    query?: Ref<string> | string
    page?: Ref<number> | number
    limit?: number
  }) {
    const params = computed(() => {
      const p: Record<string, string> = {}
      const city = unref(options?.city)
      const difficulty = unref(options?.difficulty)
      const query = unref(options?.query)
      const page = unref(options?.page)

      if (city && city !== 'all') p.city = city
      if (difficulty && difficulty !== 'all') p.difficulty = difficulty
      if (query) p.q = query
      if (page) p.page = String(page)
      if (options?.limit) p.limit = String(options.limit)

      return p
    })

    return useFetch<{ routes: Route[]; total: number; page: number; limit: number }>('/api/routes', {
      params,
    })
  }

  // Fetch single route by ID
  function fetchRouteById(id: string) {
    return useFetch<Route>(`/api/routes/${id}`)
  }

  // Fetch popular routes (first N)
  function fetchPopularRoutes(count = 6) {
    return useFetch<{ routes: Route[] }>('/api/routes', {
      params: { limit: String(count) },
    })
  }

  // Fetch cities with counts
  function fetchCities() {
    return useFetch<{ city: string; count: number }[]>('/api/cities')
  }

  return {
    fetchRoutes,
    fetchRouteById,
    fetchPopularRoutes,
    fetchCities,
  }
}
