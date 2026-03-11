import type { Review } from '~/types/route'

export function useReviews() {
  const fetchReviews = (routeId: string, options?: { page?: number; limit?: number }) => {
    return useFetch<{ reviews: Review[]; total: number; page: number; limit: number }>(
      `/api/routes/${routeId}/reviews`,
      { query: options }
    )
  }

  const createReview = (routeId: string, data: { rating: number; comment?: string }) => {
    return $fetch<Review>(`/api/routes/${routeId}/reviews`, { method: 'POST', body: data })
  }

  const updateReview = (reviewId: string, data: { rating?: number; comment?: string }) => {
    return $fetch<Review>(`/api/reviews/${reviewId}`, { method: 'PUT', body: data })
  }

  const deleteReview = (reviewId: string) => {
    return $fetch<{ success: boolean }>(`/api/reviews/${reviewId}`, { method: 'DELETE' })
  }

  return { fetchReviews, createReview, updateReview, deleteReview }
}
