<script setup lang="ts">
const { t } = useI18n()
const { getPopularRoutes } = useRoutes()

const popularRoutes = getPopularRoutes(6)
</script>

<template>
  <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <div class="flex items-center justify-between mb-8">
      <h2 class="text-2xl font-bold text-gray-900">
        {{ t('route.popularRoutes') }}
      </h2>
      <NuxtLink
        to="/routes"
        class="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
      >
        {{ t('route.allRoutes') }}
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </NuxtLink>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <RouteCard
        v-for="route in popularRoutes"
        :key="route.id"
        :route="route"
      />
    </div>
  </section>
</template>
