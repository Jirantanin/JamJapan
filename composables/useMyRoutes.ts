import type { Route } from '~/types/route'

export function useMyRoutes() {
  function fetchMyRoutes(options?: {
    status?: Ref<string> | string
    page?: Ref<number> | number
    limit?: number
  }) {
    const params = computed(() => {
      const p: Record<string, string> = {}
      const status = unref(options?.status)
      const page = unref(options?.page)
      if (status && status !== 'all') p.status = status
      if (page) p.page = String(page)
      if (options?.limit) p.limit = String(options.limit)
      return p
    })

    return useFetch<{ routes: Route[]; total: number; page: number; limit: number }>('/api/my/routes', {
      params,
    })
  }

  async function publishRoute(id: string): Promise<Route> {
    return $fetch<Route>(`/api/routes/${id}/status`, {
      method: 'PUT',
      body: { status: 'published' },
    })
  }

  async function unpublishRoute(id: string): Promise<Route> {
    return $fetch<Route>(`/api/routes/${id}/status`, {
      method: 'PUT',
      body: { status: 'draft' },
    })
  }

  async function deleteRoute(id: string): Promise<void> {
    await $fetch<void>(`/api/routes/${id}`, { method: 'DELETE' })
  }

  return { fetchMyRoutes, publishRoute, unpublishRoute, deleteRoute }
}
