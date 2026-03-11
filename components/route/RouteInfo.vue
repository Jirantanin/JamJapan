<script setup lang="ts">
import type { Route } from '~/types/route'

const props = defineProps<{
  route: Route
  isSaved?: boolean
}>()

const { t } = useI18n()
const { loggedIn } = useUserSession()

const savedState = ref(props.isSaved ?? props.route.isSaved ?? false)

watch(() => props.isSaved, (v) => {
  if (v !== undefined) savedState.value = v
})
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm p-6">
    <div class="flex items-start justify-between gap-3">
      <h1 class="text-2xl font-bold text-gray-900">
        {{ route.title }}
      </h1>
      <RouteSaveButton
        v-if="loggedIn"
        :route-id="route.id"
        :is-saved="savedState"
        size="md"
        @toggle="(v) => savedState = v"
      />
    </div>
    <!-- Source badge + Creator info -->
    <div class="flex items-center gap-3 mt-2">
      <RouteSourceBadge :source="route.source" />
      <RouteCreatorInfo v-if="route.createdBy" :creator="route.createdBy" size="sm" />
    </div>
    <p class="text-gray-500 mt-2">
      {{ route.description }}
    </p>

    <!-- Info grid -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
      <div class="text-center p-3 bg-gray-50 rounded-lg">
        <div class="text-2xl font-bold text-primary-600">
          {{ route.estimatedMinutes }}
        </div>
        <div class="text-xs text-gray-500 mt-1">
          {{ t('route.minutes') }}
        </div>
      </div>
      <div class="text-center p-3 bg-gray-50 rounded-lg">
        <div class="text-2xl font-bold text-primary-600">
          {{ route.distanceMeters }}
        </div>
        <div class="text-xs text-gray-500 mt-1">
          {{ t('route.meters') }}
        </div>
      </div>
      <div class="text-center p-3 bg-gray-50 rounded-lg">
        <div class="text-2xl font-bold text-primary-600">
          {{ route.steps.length }}
        </div>
        <div class="text-xs text-gray-500 mt-1">
          {{ t('route.steps') }}
        </div>
      </div>
      <div class="text-center p-3 bg-gray-50 rounded-lg">
        <CommonDifficultyBadge :difficulty="route.difficulty" />
        <div class="text-xs text-gray-500 mt-1">
          {{ t('route.difficulty') }}
        </div>
      </div>
    </div>

    <!-- Start / End -->
    <div class="flex items-center gap-3 mt-6 text-sm">
      <div class="flex items-center gap-2 flex-1 bg-green-50 p-3 rounded-lg">
        <span class="w-3 h-3 bg-green-500 rounded-full flex-shrink-0" />
        <div>
          <div class="text-xs text-green-600 font-medium">{{ t('route.start') }}</div>
          <div class="text-gray-700">{{ route.start.name }}</div>
        </div>
      </div>
      <svg class="w-5 h-5 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
      </svg>
      <div class="flex items-center gap-2 flex-1 bg-red-50 p-3 rounded-lg">
        <span class="w-3 h-3 bg-red-500 rounded-full flex-shrink-0" />
        <div>
          <div class="text-xs text-red-600 font-medium">{{ t('route.end') }}</div>
          <div class="text-gray-700">{{ route.end.name }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
