<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { fetchSavedRoutes } = useSavedRoutes()
const page = ref(1)

const { data, pending, error, refresh } = fetchSavedRoutes({ page: page.value })

const routes = computed(() => data.value?.routes || [])
const total = computed(() => data.value?.total || 0)
const limit = computed(() => data.value?.limit || 12)
const totalPages = computed(() => Math.ceil(total.value / limit.value))

watch(page, () => refresh())

function handleSaveToggle(routeId: string, isSaved: boolean) {
  if (!isSaved) {
    // Remove from list when unsaved
    refresh()
  }
}

// SEO - Hide from search engines (private user page)
useSeoMeta({
  robots: 'noindex,follow',
})
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">เส้นทางที่บันทึก</h1>
      <p v-if="!pending && total > 0" class="text-sm text-gray-500 mt-1">
        {{ total }} เส้นทาง
      </p>
    </div>

    <!-- Loading skeleton -->
    <div v-if="pending" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="i in 6"
        :key="i"
        class="bg-gray-100 rounded-xl animate-pulse"
      >
        <div class="aspect-video bg-gray-200 rounded-t-xl" />
        <div class="p-4 space-y-2">
          <div class="h-4 bg-gray-200 rounded w-3/4" />
          <div class="h-3 bg-gray-200 rounded w-full" />
          <div class="h-3 bg-gray-200 rounded w-2/3" />
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-16 text-red-400">
      <p>ไม่สามารถโหลดข้อมูลได้</p>
    </div>

    <!-- Route grid -->
    <div v-else-if="routes.length > 0">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="route in routes" :key="route.id" class="relative">
          <RouteCard :route="route" :is-saved="route.isSaved" />
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 mt-8">
        <button
          :disabled="page <= 1"
          class="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:border-primary-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          @click="page--"
        >
          ก่อนหน้า
        </button>
        <span class="text-sm text-gray-500">
          หน้า {{ page }} / {{ totalPages }}
        </span>
        <button
          :disabled="page >= totalPages"
          class="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:border-primary-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          @click="page++"
        >
          ถัดไป
        </button>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-16">
      <svg
        class="w-16 h-16 mx-auto text-gray-300 mb-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 4a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 20V4z" />
      </svg>
      <p class="text-gray-500 font-medium mb-1">ยังไม่มีเส้นทางที่บันทึก</p>
      <p class="text-sm text-gray-400 mb-6">เริ่มบันทึกเส้นทางที่คุณชื่นชอบ</p>
      <NuxtLink
        to="/routes"
        class="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
      >
        ดูเส้นทางทั้งหมด
      </NuxtLink>
    </div>
  </div>
</template>
