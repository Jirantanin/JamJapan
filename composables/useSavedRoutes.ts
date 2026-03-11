import type { Route } from '~/types/route'

export function useSavedRoutes() {
  function fetchSavedRoutes(options?: { page?: number; limit?: number }) {
    return useFetch<{ routes: Route[]; total: number; page: number; limit: number }>(
      '/api/my/saved-routes',
      { query: options },
    )
  }

  const toggleSave = async (routeId: string) => {
    return $fetch<{ saved: boolean }>(`/api/routes/${routeId}/save`, { method: 'POST' })
  }

  return { fetchSavedRoutes, toggleSave }
}
