<script setup lang="ts">
import type { City, Difficulty } from '~/types/route'

const { t } = useI18n()
const route = useRoute()

const selectedCity = ref<City | 'all'>((route.query.city as City) || 'all')
const selectedDifficulty = ref<Difficulty | 'all'>('all')

const { filterRoutes } = useRoutes()

const filteredRoutes = filterRoutes({
  city: selectedCity.value,
  difficulty: selectedDifficulty.value,
})

// Re-filter when selections change
watch([selectedCity, selectedDifficulty], () => {
  // filterRoutes returns a computed, so we need to re-create it
  // For simplicity in Phase 1A, we handle this with a direct computed
})

const { routes: allRoutes } = useRoutes()

const displayRoutes = computed(() => {
  let result = allRoutes.value

  if (selectedCity.value !== 'all') {
    result = result.filter(r => r.city === selectedCity.value)
  }

  if (selectedDifficulty.value !== 'all') {
    result = result.filter(r => r.difficulty === selectedDifficulty.value)
  }

  return result
})

const cities: (City | 'all')[] = ['all', 'tokyo', 'osaka', 'kyoto', 'nara', 'fukuoka', 'sapporo', 'hiroshima']
const difficulties: (Difficulty | 'all')[] = ['all', 'easy', 'medium', 'hard']
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">
      {{ t('route.allRoutes') }}
    </h1>

    <!-- Filters -->
    <div class="flex flex-wrap gap-4 mb-8">
      <!-- City filter -->
      <div>
        <label class="block text-sm font-medium text-gray-600 mb-1">{{ t('filter.city') }}</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="city in cities"
            :key="city"
            class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
            :class="selectedCity === city
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'"
            @click="selectedCity = city"
          >
            {{ city === 'all' ? t('filter.all') : t(`city.${city}`) }}
          </button>
        </div>
      </div>

      <!-- Difficulty filter -->
      <div>
        <label class="block text-sm font-medium text-gray-600 mb-1">{{ t('filter.difficulty') }}</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="diff in difficulties"
            :key="diff"
            class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
            :class="selectedDifficulty === diff
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'"
            @click="selectedDifficulty = diff"
          >
            {{ diff === 'all' ? t('filter.all') : t(`difficulty.${diff}`) }}
          </button>
        </div>
      </div>
    </div>

    <!-- Route Grid -->
    <div v-if="displayRoutes.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <RouteCard
        v-for="r in displayRoutes"
        :key="r.id"
        :route="r"
      />
    </div>

    <div v-else class="text-center py-16 text-gray-400">
      <svg class="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p>{{ t('search.noResults') }}</p>
    </div>
  </div>
</template>
