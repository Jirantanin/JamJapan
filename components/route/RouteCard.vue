<script setup lang="ts">
import type { Route } from '~/types/route'

defineProps<{
  route: Route
}>()

const { t } = useI18n()
</script>

<template>
  <NuxtLink
    :to="`/routes/${route.id}`"
    class="group block bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden"
  >
    <!-- Cover Image -->
    <div class="aspect-video bg-gray-200 relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      <div class="absolute top-3 right-3 z-10">
        <RouteSourceBadge :source="route.source" />
      </div>
      <div class="absolute bottom-3 left-3 right-3">
        <CommonDifficultyBadge :difficulty="route.difficulty" />
      </div>
      <!-- Placeholder when no image -->
      <div class="absolute inset-0 flex items-center justify-center text-gray-400">
        <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
    </div>

    <!-- Info -->
    <div class="p-4">
      <h3 class="font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
        {{ route.title }}
      </h3>
      <p class="text-sm text-gray-500 mt-1 line-clamp-2">
        {{ route.description }}
      </p>
      <div class="flex items-center gap-4 mt-3 text-xs text-gray-400">
        <span class="flex items-center gap-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ route.estimatedMinutes }} {{ t('route.minutes') }}
        </span>
        <span class="flex items-center gap-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          {{ route.distanceMeters }} {{ t('route.meters') }}
        </span>
        <span class="flex items-center gap-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          {{ route.steps.length }} {{ t('route.steps') }}
        </span>
      </div>
    </div>
  </NuxtLink>
</template>
