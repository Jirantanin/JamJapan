import type { RouteRequest, City } from '~/types/route'

export function useRouteRequests() {
  function fetchRequests(options?: {
    city?: Ref<City | 'all'> | City | 'all'
    sort?: Ref<string> | string
    page?: Ref<number> | number
    limit?: number
  }) {
    const params = computed(() => {
      const p: Record<string, string> = {}
      const city = unref(options?.city)
      const sort = unref(options?.sort)
      const page = unref(options?.page)
      if (city && city !== 'all') p.city = city
      if (sort) p.sort = sort
      if (page) p.page = String(page)
      if (options?.limit) p.limit = String(options.limit)
      return p
    })

    return useFetch<{ requests: RouteRequest[]; total: number; page: number; limit: number }>('/api/route-requests', {
      params,
    })
  }

  async function createRequest(data: {
    title: string
    description: string
    city: string
    startPoint: string
    endPoint: string
  }): Promise<RouteRequest> {
    return $fetch('/api/route-requests', { method: 'POST', body: data })
  }

  async function toggleVote(id: string): Promise<{ voted: boolean; voteCount: number }> {
    return $fetch(`/api/route-requests/${id}/vote`, { method: 'POST' })
  }

  async function deleteRequest(id: string): Promise<void> {
    await $fetch(`/api/route-requests/${id}`, { method: 'DELETE' })
  }

  return { fetchRequests, createRequest, toggleVote, deleteRequest }
}
