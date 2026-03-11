<script setup lang="ts">
const { t } = useI18n()
const routeParam = useRoute()
const { fetchRouteById } = useRoutes()
const { activeStepIndex, mapCenter, mapZoom, setActiveStep, fitBounds } = useMapSync()
const { user } = useUserSession()

const { data: routeData, pending, error } = fetchRouteById(routeParam.params.id as string)

watch(routeData, (val) => {
  if (val?.steps) {
    fitBounds(val.steps.map(s => s.location))
  }
}, { immediate: true })

function handleStepClick(step: any) {
  const index = routeData.value!.steps.findIndex(s => s.order === step.order)
  setActiveStep(index, step.location)
}

function handleMarkerClick(index: number, step: any) {
  setActiveStep(index, step.location)

  const el = document.getElementById(`step-${step.order}`)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Loading skeleton -->
    <div v-if="pending" class="animate-pulse">
      <div class="h-4 w-24 bg-gray-100 rounded mb-6" />
      <div class="h-8 w-96 bg-gray-100 rounded mb-4" />
      <div class="h-4 w-64 bg-gray-100 rounded mb-8" />
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="h-[400px] bg-gray-100 rounded-xl" />
        <div class="space-y-3">
          <div v-for="i in 5" :key="i" class="h-24 bg-gray-100 rounded-xl" />
        </div>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error || !routeData" class="text-center py-16 text-red-400">
      <svg class="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p>{{ t('error.notFound') }}</p>
      <NuxtLink to="/routes" class="mt-4 inline-block text-primary-600 hover:underline text-sm">
        {{ t('route.allRoutes') }}
      </NuxtLink>
    </div>

    <!-- Content -->
    <div v-else>
      <!-- Back button -->
      <NuxtLink
        to="/routes"
        class="inline-flex items-center gap-1 text-gray-500 hover:text-primary-600 text-sm mb-6 transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        {{ t('route.allRoutes') }}
      </NuxtLink>

      <!-- Route Info -->
      <RouteInfo :route="routeData" :is-saved="routeData.isSaved" />

      <!-- Map + Steps layout -->
      <div class="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Map -->
        <div class="h-[400px] lg:h-[600px] lg:sticky lg:top-24 rounded-xl overflow-hidden shadow-sm">
          <RouteMap
            :steps="routeData.steps"
            :center="mapCenter"
            :zoom="mapZoom"
            :active-step-index="activeStepIndex"
            @marker-click="handleMarkerClick"
          />
        </div>

        <!-- Steps -->
        <div>
          <h2 class="text-xl font-bold text-gray-900 mb-4">
            {{ t('route.steps') }} ({{ routeData.steps.length }})
          </h2>
          <div class="space-y-1">
            <RouteStepCard
              v-for="(step, index) in routeData.steps"
              :key="step.order"
              :step="step"
              :is-active="activeStepIndex === index"
              @click="handleStepClick"
            />
          </div>
        </div>
      </div>
      <!-- Reviews -->
      <RouteReviewSection :route-id="routeData.id" :current-user-id="user?.id" />
    </div>
  </div>
</template>
