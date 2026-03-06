<script setup lang="ts">
const { t } = useI18n()
const { getCities } = useRoutes()

const cities = getCities()
</script>

<template>
  <div>
    <HomeHeroSection />

    <!-- City Categories -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 class="text-xl font-bold text-gray-900 mb-6">
        เลือกตามเมือง
      </h2>
      <div class="flex flex-wrap gap-3">
        <NuxtLink
          v-for="city in cities"
          :key="city"
          :to="{ path: '/routes', query: { city } }"
          class="px-5 py-2.5 bg-white rounded-full shadow-sm hover:shadow-md border border-gray-200 hover:border-primary-300 text-gray-700 hover:text-primary-600 transition-all font-medium text-sm"
        >
          {{ t(`city.${city}`) }}
        </NuxtLink>
      </div>
    </section>

    <HomePopularRoutes />
  </div>
</template>
