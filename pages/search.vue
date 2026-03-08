<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const { fetchRoutes } = useRoutes()

const query = computed(() => (route.query.q as string) || '')

const { data: searchData, pending, error } = fetchRoutes({
  query,
})

const results = computed(() => searchData.value?.routes || [])
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-2">
      {{ t('search.title') }}
    </h1>
    <p v-if="query && !pending" class="text-gray-500 mb-8">
      "{{ query }}" — {{ t('search.resultsCount', { count: results.length }) }}
    </p>

    <!-- Search bar -->
    <div class="mb-8">
      <CommonSearchBar />
    </div>

    <!-- Error -->
    <div v-if="error" class="text-center py-16 text-red-400">
      <p>{{ t('error.loadFailed') }}</p>
    </div>

    <!-- Loading skeleton -->
    <div v-else-if="pending" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 6" :key="i" class="h-64 bg-gray-100 rounded-2xl animate-pulse" />
    </div>

    <!-- Results -->
    <div v-else-if="results.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <RouteCard
        v-for="r in results"
        :key="r.id"
        :route="r"
      />
    </div>

    <!-- Empty state -->
    <div v-else-if="query" class="text-center py-16 text-gray-400">
      <svg class="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <p>{{ t('search.noResults') }}</p>
    </div>
  </div>
</template>
