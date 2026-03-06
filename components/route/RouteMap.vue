<script setup lang="ts">
import type { Step, Location } from '~/types/route'

const props = defineProps<{
  steps: Step[]
  center: [number, number]
  zoom: number
  activeStepIndex: number | null
}>()

const emit = defineEmits<{
  markerClick: [index: number, step: Step]
}>()

// Polyline coordinates for the route path
const polylineLatLngs = computed(() =>
  props.steps.map(s => [s.location.lat, s.location.lng] as [number, number])
)
</script>

<template>
  <ClientOnly>
    <LMap
      :zoom="zoom"
      :center="center"
      :use-global-leaflet="false"
      class="w-full h-full rounded-xl z-0"
    >
      <LTileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a>"
        layer-type="base"
        name="OpenStreetMap"
      />

      <!-- Route polyline -->
      <LPolyline
        :lat-lngs="polylineLatLngs"
        :color="'#e22020'"
        :weight="4"
        :opacity="0.7"
        :dash-array="'10, 6'"
      />

      <!-- Step markers -->
      <LMarker
        v-for="(step, index) in steps"
        :key="step.order"
        :lat-lng="[step.location.lat, step.location.lng]"
        @click="emit('markerClick', index, step)"
      >
        <LIcon
          :icon-size="activeStepIndex === index ? [36, 36] : [28, 28]"
          :icon-anchor="activeStepIndex === index ? [18, 18] : [14, 14]"
          class-name="custom-marker"
        >
          <div
            class="flex items-center justify-center rounded-full font-bold text-white shadow-lg transition-all"
            :class="activeStepIndex === index
              ? 'w-9 h-9 bg-primary-600 ring-4 ring-primary-200 text-sm'
              : 'w-7 h-7 bg-primary-500 text-xs'"
          >
            {{ step.order }}
          </div>
        </LIcon>
        <LTooltip>
          {{ step.location.name || `Step ${step.order}` }}
        </LTooltip>
      </LMarker>
    </LMap>

    <template #fallback>
      <div class="w-full h-full rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
        <span>กำลังโหลดแผนที่...</span>
      </div>
    </template>
  </ClientOnly>
</template>
