import type { Route, City, Difficulty } from '~/types/route'
import routesData from '~/data/routes.json'

export function useRoutes() {
  const routes = ref<Route[]>(routesData as Route[])

  function getRouteById(id: string): Route | undefined {
    return routes.value.find(r => r.id === id)
  }

  function filterRoutes(options?: { city?: City | 'all'; difficulty?: Difficulty | 'all'; query?: string }) {
    return computed(() => {
      let result = routes.value

      if (options?.city && options.city !== 'all') {
        result = result.filter(r => r.city === options.city)
      }

      if (options?.difficulty && options.difficulty !== 'all') {
        result = result.filter(r => r.difficulty === options.difficulty)
      }

      if (options?.query) {
        const q = options.query.toLowerCase()
        result = result.filter(r =>
          r.title.toLowerCase().includes(q)
          || r.description.toLowerCase().includes(q)
          || r.tags.some(t => t.toLowerCase().includes(q))
          || r.start.name?.toLowerCase().includes(q)
          || r.end.name?.toLowerCase().includes(q)
        )
      }

      return result
    })
  }

  function getPopularRoutes(count = 6) {
    return routes.value.slice(0, count)
  }

  function getCities(): City[] {
    const cities = new Set(routes.value.map(r => r.city))
    return Array.from(cities) as City[]
  }

  return {
    routes,
    getRouteById,
    filterRoutes,
    getPopularRoutes,
    getCities,
  }
}
