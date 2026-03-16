<script setup lang="ts">
import type { Route } from '~/types/route'

const props = defineProps<{
  route: Route
  isSaved?: boolean
}>()

const emit = defineEmits<{
  (e: 'cover-updated', route: Route): void
}>()

const { t } = useI18n()
const { loggedIn, user } = useUserSession()

const savedState = ref(props.isSaved ?? props.route.isSaved ?? false)
const isGenerating = ref(false)
const generateError = ref('')

watch(() => props.isSaved, (v) => {
  if (v !== undefined) savedState.value = v
})

async function generateCover() {
  isGenerating.value = true
  generateError.value = ''
  try {
    const updated = await $fetch<Route>(`/api/routes/${props.route.id}/generate-cover`, {
      method: 'POST',
    })
    emit('cover-updated', updated)
  } catch (err: any) {
    generateError.value = err?.data?.statusMessage || 'เกิดข้อผิดพลาดในการสร้างรูปปก'
  } finally {
    isGenerating.value = false
  }
}
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
    <!-- Generate Cover Button (Admin only) -->
    <div v-if="user?.role === 'ADMIN'" class="mt-3">
      <button
        :disabled="isGenerating"
        class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors"
        :class="isGenerating
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-primary-50 text-primary-700 hover:bg-primary-100'"
        @click="generateCover"
      >
        <svg v-if="isGenerating" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {{ isGenerating ? 'กำลังสร้างรูปปก...' : 'สร้างรูปปก AI' }}
      </button>
      <p v-if="generateError" class="mt-1 text-xs text-red-500">{{ generateError }}</p>
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
