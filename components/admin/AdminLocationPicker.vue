<script setup lang="ts">
const { t } = useI18n()

const props = defineProps<{
  modelValue: { lat: number | null; lng: number | null; name?: string } | null
  label: string
  otherMarkers?: Array<{ lat: number; lng: number; label: string }>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: { lat: number; lng: number; name?: string }]
}>()

const defaultCenter = ref<[number, number]>([35.6812, 139.7671]) // Tokyo
const defaultZoom = ref(13)

const mapCenter = computed(() => {
  if (props.modelValue?.lat && props.modelValue?.lng) {
    return [props.modelValue.lat, props.modelValue.lng] as [number, number]
  }
  return defaultCenter.value
})

const mapZoom = computed(() => {
  return props.modelValue?.lat ? 16 : defaultZoom.value
})

const locationName = ref(props.modelValue?.name || '')

watch(() => props.modelValue?.name, (newName) => {
  locationName.value = newName || ''
})

function handleMapClick(e: any) {
  const { lat, lng } = e.latlng
  emit('update:modelValue', {
    lat: Math.round(lat * 1000000) / 1000000,
    lng: Math.round(lng * 1000000) / 1000000,
    name: locationName.value || undefined,
  })
}

function handleNameChange() {
  if (props.modelValue?.lat != null && props.modelValue?.lng != null) {
    emit('update:modelValue', {
      lat: props.modelValue.lat,
      lng: props.modelValue.lng,
      name: locationName.value || undefined,
    })
  }
}
</script>

<template>
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ label }}</label>

    <div class="h-[250px] rounded-lg overflow-hidden border border-gray-200 mb-2">
      <ClientOnly>
        <LMap
          :zoom="mapZoom"
          :center="mapCenter"
          :use-global-leaflet="false"
          class="w-full h-full z-0"
          @click="handleMapClick"
        >
          <LTileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap"
            layer-type="base"
            name="OpenStreetMap"
          />

          <!-- Selected location marker -->
          <LMarker
            v-if="modelValue?.lat != null && modelValue?.lng != null"
            :lat-lng="[modelValue.lat, modelValue.lng]"
          >
            <LIcon :icon-size="[32, 32]" :icon-anchor="[16, 16]" class-name="custom-marker">
              <div class="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg ring-3 ring-primary-200">
                +
              </div>
            </LIcon>
          </LMarker>

          <!-- Other markers for context -->
          <LMarker
            v-for="(marker, idx) in otherMarkers"
            :key="idx"
            :lat-lng="[marker.lat, marker.lng]"
          >
            <LIcon :icon-size="[22, 22]" :icon-anchor="[11, 11]" class-name="custom-marker">
              <div class="w-[22px] h-[22px] bg-gray-400 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow">
                {{ marker.label }}
              </div>
            </LIcon>
            <LTooltip>{{ marker.label }}</LTooltip>
          </LMarker>
        </LMap>

        <template #fallback>
          <div class="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
            Loading map...
          </div>
        </template>
      </ClientOnly>
    </div>

    <p class="text-xs text-gray-400 mb-2">{{ t('admin.form.clickMap') }}</p>

    <div class="grid grid-cols-2 gap-2 mb-2">
      <div>
        <label class="block text-xs text-gray-500">Lat</label>
        <input
          type="text"
          :value="modelValue?.lat ?? ''"
          readonly
          class="w-full px-2.5 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-600"
        />
      </div>
      <div>
        <label class="block text-xs text-gray-500">Lng</label>
        <input
          type="text"
          :value="modelValue?.lng ?? ''"
          readonly
          class="w-full px-2.5 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-600"
        />
      </div>
    </div>

    <div>
      <label class="block text-xs text-gray-500">{{ t('admin.form.locationName') }}</label>
      <input
        v-model="locationName"
        type="text"
        class="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        :placeholder="t('admin.form.locationName')"
        @blur="handleNameChange"
      />
    </div>
  </div>
</template>
