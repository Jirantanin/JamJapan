import type { Location } from '~/types/route'

export function useMapSync() {
  const activeStepIndex = ref<number | null>(null)
  const mapCenter = ref<[number, number]>([35.6762, 139.6503]) // default: Tokyo
  const mapZoom = ref(14)

  function setActiveStep(index: number, location: Location) {
    activeStepIndex.value = index
    mapCenter.value = [location.lat, location.lng]
    mapZoom.value = 17
  }

  function clearActiveStep() {
    activeStepIndex.value = null
  }

  function fitBounds(locations: Location[]) {
    if (locations.length === 0) return

    const lats = locations.map(l => l.lat)
    const lngs = locations.map(l => l.lng)

    const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2
    const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2

    mapCenter.value = [centerLat, centerLng]

    // Rough zoom calculation based on bounding box
    const latDiff = Math.max(...lats) - Math.min(...lats)
    const lngDiff = Math.max(...lngs) - Math.min(...lngs)
    const maxDiff = Math.max(latDiff, lngDiff)

    if (maxDiff > 0.1) mapZoom.value = 13
    else if (maxDiff > 0.05) mapZoom.value = 14
    else if (maxDiff > 0.01) mapZoom.value = 15
    else mapZoom.value = 16
  }

  return {
    activeStepIndex,
    mapCenter,
    mapZoom,
    setActiveStep,
    clearActiveStep,
    fitBounds,
  }
}
