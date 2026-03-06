<script setup lang="ts">
const { t } = useI18n()
const routeParam = useRoute()
const { getRouteById } = useRoutes()
const { activeStepIndex, mapCenter, mapZoom, setActiveStep, fitBounds } = useMapSync()

const routeData = getRouteById(routeParam.params.id as string)

if (!routeData) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Route not found',
  })
}

// Set initial map view to fit all steps
const allLocations = routeData.steps.map(s => s.location)
fitBounds(allLocations)

function handleStepClick(step: any) {
  const index = routeData!.steps.findIndex(s => s.order === step.order)
  setActiveStep(index, step.location)
}

function handleMarkerClick(index: number, step: any) {
  setActiveStep(index, step.location)

  // Scroll to step card
  const el = document.getElementById(`step-${step.order}`)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}
</script>

<template>
  <div v-if="routeData" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
    <RouteInfo :route="routeData" />

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
  </div>
</template>
