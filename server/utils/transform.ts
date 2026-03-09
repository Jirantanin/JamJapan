import type { Route as PrismaRoute, Step as PrismaStep } from '../../generated/prisma/client'

// Transform Prisma flat model → nested frontend format
export function transformRoute(route: PrismaRoute & { steps?: PrismaStep[]; createdBy?: any }) {
  return {
    id: route.id,
    title: route.title,
    description: route.description,
    city: route.city,
    difficulty: route.difficulty,
    estimatedMinutes: route.estimatedMinutes,
    distanceMeters: route.distanceMeters,
    coverImage: route.coverImage,
    start: {
      lat: route.startLat,
      lng: route.startLng,
      name: route.startName,
    },
    end: {
      lat: route.endLat,
      lng: route.endLng,
      name: route.endName,
    },
    tags: typeof route.tags === 'string' ? JSON.parse(route.tags) : route.tags,
    steps: route.steps
      ? route.steps
          .sort((a, b) => a.order - b.order)
          .map(step => ({
            order: step.order,
            instruction: step.instruction,
            image: step.image,
            location: {
              lat: step.locationLat,
              lng: step.locationLng,
              name: step.locationName,
            },
            distanceFromPrev: step.distanceFromPrev,
            note: step.note,
          }))
      : [],
    createdAt: route.createdAt,
    updatedAt: route.updatedAt,
    status: route.status,
    source: route.source,
    createdBy: route.createdBy
      ? { id: route.createdBy.id, name: route.createdBy.name, avatar: route.createdBy.avatar }
      : null,
  }
}

export function transformRouteRequest(request: any, currentUserId?: string) {
  return {
    id: request.id,
    title: request.title,
    description: request.description,
    city: request.city,
    startPoint: request.startPoint,
    endPoint: request.endPoint,
    status: request.status,
    voteCount: request.voteCount,
    hasVoted: currentUserId
      ? request.votes?.some((v: any) => v.userId === currentUserId) ?? false
      : false,
    createdBy: {
      id: request.createdBy.id,
      name: request.createdBy.name,
      avatar: request.createdBy.avatar,
    },
    fulfilledRouteId: request.fulfilledRouteId,
    createdAt: request.createdAt,
  }
}
