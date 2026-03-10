<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const route = useRoute()
const { fetchRouteById } = useRoutes()

const { data: routeData, pending, error } = fetchRouteById(route.params.id as string)
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Loading -->
    <div v-if="pending" class="animate-pulse">
      <div class="h-8 w-64 bg-gray-100 rounded mb-6" />
      <div class="h-96 bg-gray-100 rounded-xl" />
    </div>

    <!-- Error -->
    <div v-else-if="error || !routeData" class="text-center py-16 text-red-400">
      <p>ไม่พบเส้นทาง</p>
      <NuxtLink to="/my/routes" class="mt-4 inline-block text-primary-600 hover:underline text-sm">
        กลับไปเส้นทางของฉัน
      </NuxtLink>
    </div>

    <!-- Form -->
    <div v-else>
      <div class="flex items-center gap-3 mb-6">
        <NuxtLink to="/my/routes" class="text-gray-400 hover:text-gray-600">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </NuxtLink>
        <h1 class="text-2xl font-bold text-gray-900">แก้ไขเส้นทาง</h1>
      </div>

      <AdminRouteForm mode="edit" :initial-route="routeData" redirect-to="/my/routes" />
    </div>
  </div>
</template>
