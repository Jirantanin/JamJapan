<script setup lang="ts">
const { t } = useI18n()
const { fetchCities } = useRoutes()

const { data: citiesData, pending: citiesPending } = fetchCities()
</script>

<template>
  <div>
    <HomeHeroSection />

    <!-- City Categories -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 class="text-xl font-bold text-gray-900 mb-6">
        {{ t('home.citySection') }}
      </h2>
      <!-- Loading skeleton -->
      <div v-if="citiesPending" class="flex flex-wrap gap-3">
        <div v-for="i in 5" :key="i" class="h-10 w-28 bg-gray-100 rounded-full animate-pulse" />
      </div>
      <div v-else class="flex flex-wrap gap-3">
        <NuxtLink
          v-for="item in citiesData"
          :key="item.city"
          :to="{ path: '/routes', query: { city: item.city } }"
          class="px-5 py-2.5 bg-white rounded-full shadow-sm hover:shadow-md border border-gray-200 hover:border-primary-300 text-gray-700 hover:text-primary-600 transition-all font-medium text-sm"
        >
          {{ t(`city.${item.city}`) }} ({{ item.count }})
        </NuxtLink>
      </div>
    </section>

    <HomePopularRoutes />
  </div>
</template>
