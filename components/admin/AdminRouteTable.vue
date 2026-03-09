<script setup lang="ts">
import type { Route } from '~/types/route'

const { t } = useI18n()

defineProps<{
  routes: Route[]
  loading?: boolean
}>()

const emit = defineEmits<{
  edit: [id: string]
  delete: [route: Route]
}>()
</script>

<template>
  <!-- Loading skeleton -->
  <div v-if="loading" class="space-y-3">
    <div v-for="i in 3" :key="i" class="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
      <div class="h-6 bg-gray-200 rounded w-3/4 mb-2" />
      <div class="h-4 bg-gray-100 rounded w-1/2" />
    </div>
  </div>

  <!-- Empty state -->
  <div v-else-if="routes.length === 0" class="text-center py-12 text-gray-400">
    {{ t('admin.noRoutes') }}
  </div>

  <!-- Desktop Table -->
  <div v-else>
    <div class="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{{ t('admin.form.title') }}</th>
            <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{{ t('filter.city') }}</th>
            <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{{ t('filter.difficulty') }}</th>
            <th class="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{{ t('route.steps') }}</th>
            <th class="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{{ t('admin.actions') }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="route in routes" :key="route.id" class="hover:bg-gray-50">
            <td class="px-4 py-3">
              <p class="text-sm font-medium text-gray-900">{{ route.title }}</p>
              <p class="text-xs text-gray-400">{{ route.id }}</p>
            </td>
            <td class="px-4 py-3">
              <span class="text-sm text-gray-600">{{ t(`city.${route.city}`) }}</span>
            </td>
            <td class="px-4 py-3">
              <CommonDifficultyBadge :difficulty="route.difficulty" />
            </td>
            <td class="px-4 py-3 text-center">
              <span class="text-sm text-gray-600">{{ route.steps.length }}</span>
            </td>
            <td class="px-4 py-3 text-right">
              <div class="flex items-center justify-end gap-2">
                <NuxtLink
                  :to="`/routes/${route.id}`"
                  class="text-xs px-2.5 py-1.5 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                >
                  {{ t('admin.view') }}
                </NuxtLink>
                <button
                  class="text-xs px-2.5 py-1.5 text-primary-600 hover:text-primary-700 rounded-md hover:bg-primary-50 transition-colors"
                  @click="emit('edit', route.id)"
                >
                  {{ t('admin.edit') }}
                </button>
                <button
                  class="text-xs px-2.5 py-1.5 text-red-600 hover:text-red-700 rounded-md hover:bg-red-50 transition-colors"
                  @click="emit('delete', route)"
                >
                  {{ t('admin.delete') }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile Cards -->
    <div class="md:hidden space-y-3">
      <div
        v-for="route in routes"
        :key="route.id"
        class="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
      >
        <div class="flex items-start justify-between mb-2">
          <div class="min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">{{ route.title }}</p>
            <p class="text-xs text-gray-400">{{ route.id }}</p>
          </div>
          <CommonDifficultyBadge :difficulty="route.difficulty" />
        </div>
        <div class="flex items-center gap-3 text-xs text-gray-500 mb-3">
          <span>{{ t(`city.${route.city}`) }}</span>
          <span>·</span>
          <span>{{ route.steps.length }} {{ t('route.steps') }}</span>
        </div>
        <div class="flex items-center gap-2 border-t border-gray-100 pt-3">
          <NuxtLink
            :to="`/routes/${route.id}`"
            class="text-xs px-3 py-1.5 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
          >
            {{ t('admin.view') }}
          </NuxtLink>
          <button
            class="text-xs px-3 py-1.5 text-primary-600 hover:text-primary-700 rounded-md hover:bg-primary-50 transition-colors"
            @click="emit('edit', route.id)"
          >
            {{ t('admin.edit') }}
          </button>
          <button
            class="text-xs px-3 py-1.5 text-red-600 hover:text-red-700 rounded-md hover:bg-red-50 transition-colors ml-auto"
            @click="emit('delete', route)"
          >
            {{ t('admin.delete') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
