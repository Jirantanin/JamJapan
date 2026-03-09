<script setup lang="ts">
import type { Route } from '~/types/route'

definePageMeta({ middleware: 'admin', layout: 'admin' })

const { t } = useI18n()
const route = useRoute()
const routeId = route.params.id as string

const { data: routeData, pending, error } = useFetch<Route>(`/api/routes/${routeId}`)
</script>

<template>
  <div>
    <div class="flex items-center gap-3 mb-6">
      <NuxtLink to="/admin/routes" class="text-gray-400 hover:text-gray-600">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </NuxtLink>
      <h1 class="text-2xl font-bold text-gray-900">{{ t('admin.editRoute') }}</h1>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="space-y-4">
      <div v-for="i in 3" :key="i" class="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
        <div class="h-6 bg-gray-200 rounded w-1/3 mb-4" />
        <div class="h-10 bg-gray-100 rounded mb-3" />
        <div class="h-10 bg-gray-100 rounded" />
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-12">
      <p class="text-red-500">{{ t('error.notFound') }}</p>
      <NuxtLink to="/admin/routes" class="text-sm text-primary-600 hover:text-primary-700 mt-2 inline-block">
        {{ t('admin.back') }}
      </NuxtLink>
    </div>

    <!-- Form -->
    <AdminRouteForm v-else-if="routeData" mode="edit" :initial-route="routeData" />
  </div>
</template>
