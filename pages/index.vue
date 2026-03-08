<script setup lang="ts">
const { t } = useI18n()
const { fetchCities } = useRoutes()

const { data: citiesData } = await fetchCities()
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
