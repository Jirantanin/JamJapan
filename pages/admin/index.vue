<script setup lang="ts">
definePageMeta({ middleware: 'admin', layout: 'admin' })

const { t } = useI18n()
const { data: stats, pending, error } = useFetch('/api/admin/stats')
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">{{ t('admin.dashboard') }}</h1>
      <NuxtLink
        to="/admin/routes/create"
        class="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
      >
        + {{ t('admin.createRoute') }}
      </NuxtLink>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="i in 3" :key="i" class="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
        <div class="h-12 bg-gray-200 rounded" />
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-12 text-red-500">
      {{ t('error.loadFailed') }}
    </div>

    <!-- Stats -->
    <template v-else-if="stats">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <AdminStatsCard
          :label="t('admin.totalRoutes')"
          :value="stats.totalRoutes"
          icon="🗺️"
        />
        <AdminStatsCard
          :label="t('admin.totalCities')"
          :value="stats.byCity.length"
          icon="🏙️"
        />
        <AdminStatsCard
          label="Easy / Medium / Hard"
          :value="stats.byDifficulty.map((d: any) => d.count).join(' / ')"
          icon="📊"
        />
      </div>

      <!-- By City -->
      <div class="bg-white rounded-xl border border-gray-200 p-5 shadow-sm mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-3">{{ t('filter.city') }}</h2>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="c in stats.byCity"
            :key="c.city"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-700"
          >
            {{ t(`city.${c.city}`) }}
            <span class="text-xs font-semibold text-primary-600">({{ c.count }})</span>
          </span>
        </div>
      </div>

      <!-- Recent Routes -->
      <div class="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h2 class="text-lg font-semibold text-gray-900 mb-3">{{ t('admin.recentRoutes') }}</h2>
        <div v-if="stats.recentRoutes.length === 0" class="text-sm text-gray-400 py-4 text-center">
          {{ t('admin.noRoutes') }}
        </div>
        <div v-else class="divide-y divide-gray-100">
          <div
            v-for="route in stats.recentRoutes"
            :key="route.id"
            class="flex items-center justify-between py-3"
          >
            <div class="min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ route.title }}</p>
              <p class="text-xs text-gray-500">
                {{ t(`city.${route.city}`) }} · {{ route.steps.length }} {{ t('route.steps') }}
              </p>
            </div>
            <NuxtLink
              :to="`/admin/routes/${route.id}/edit`"
              class="text-xs text-primary-600 hover:text-primary-700 font-medium shrink-0 ml-4"
            >
              {{ t('admin.edit') }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
