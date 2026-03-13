<script setup lang="ts">
import type { RouteStatus } from '~/types/route'

definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const toast = useToast()
const { fetchMyRoutes, publishRoute, deleteRoute } = useMyRoutes()

const selectedStatus = ref<RouteStatus | 'all'>('all')

const { data, pending, error, refresh } = fetchMyRoutes({
  status: selectedStatus,
})

const routes = computed(() => data.value?.routes || [])

const statusTabs = [
  { value: 'all' as const, label: 'ทั้งหมด' },
  { value: 'draft' as const, label: 'แบบร่าง' },
  { value: 'published' as const, label: 'เผยแพร่แล้ว' },
  { value: 'unpublished' as const, label: 'ถูกระงับ' },
]

// Confirm dialog state
const showConfirm = ref(false)
const confirmAction = ref<() => void>(() => {})
const confirmTitle = ref('')
const confirmMessage = ref('')

function confirmPublish(id: string) {
  confirmTitle.value = 'เผยแพร่เส้นทาง'
  confirmMessage.value = 'ต้องการเผยแพร่เส้นทางนี้ให้ทุกคนเห็นหรือไม่?'
  confirmAction.value = async () => {
    try {
      await publishRoute(id)
      toast.success('เผยแพร่เส้นทางสำเร็จ')
      refresh()
    } catch (err: any) {
      toast.error(err?.data?.statusMessage || 'เกิดข้อผิดพลาด')
    }
  }
  showConfirm.value = true
}

function confirmDelete(id: string) {
  confirmTitle.value = 'ลบเส้นทาง'
  confirmMessage.value = 'ต้องการลบเส้นทางนี้หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้'
  confirmAction.value = async () => {
    try {
      await deleteRoute(id)
      toast.success('ลบเส้นทางสำเร็จ')
      refresh()
    } catch (err: any) {
      toast.error(err?.data?.statusMessage || 'เกิดข้อผิดพลาด')
    }
  }
  showConfirm.value = true
}

// SEO - Hide from search engines (private user page)
useSeoMeta({
  robots: 'noindex,follow',
})
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-2xl font-bold text-gray-900">เส้นทางของฉัน</h1>
      <NuxtLink
        to="/routes/create"
        class="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        สร้างเส้นทางใหม่
      </NuxtLink>
    </div>

    <!-- Status tabs -->
    <div class="flex gap-2 mb-6">
      <button
        v-for="tab in statusTabs"
        :key="tab.value"
        class="px-4 py-2 rounded-full text-sm font-medium transition-colors"
        :class="selectedStatus === tab.value
          ? 'bg-primary-600 text-white'
          : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'"
        @click="selectedStatus = tab.value"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="space-y-4">
      <div v-for="i in 3" :key="i" class="h-24 bg-gray-100 rounded-xl animate-pulse" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-16 text-red-400">
      <p>ไม่สามารถโหลดข้อมูลได้</p>
    </div>

    <!-- Route list -->
    <div v-else-if="routes.length > 0" class="space-y-4">
      <div
        v-for="route in routes"
        :key="route.id"
        class="bg-white rounded-xl border border-gray-200 p-5 shadow-sm"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <NuxtLink
                :to="`/routes/${route.id}`"
                class="font-semibold text-gray-900 hover:text-primary-600 transition-colors truncate"
              >
                {{ route.title }}
              </NuxtLink>
              <RouteStatusBadge :status="route.status" />
              <RouteSourceBadge :source="route.source" />
            </div>
            <p class="text-sm text-gray-500 line-clamp-1">{{ route.description }}</p>
            <div class="flex items-center gap-4 mt-2 text-xs text-gray-400">
              <span>{{ route.estimatedMinutes }} นาที</span>
              <span>{{ route.distanceMeters }} เมตร</span>
              <span>{{ route.steps.length }} จุด</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 flex-shrink-0">
            <button
              v-if="route.status === 'draft'"
              class="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              @click="confirmPublish(route.id)"
            >
              เผยแพร่
            </button>
            <NuxtLink
              :to="`/my/routes/${route.id}/edit`"
              class="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              แก้ไข
            </NuxtLink>
            <button
              class="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              @click="confirmDelete(route.id)"
            >
              ลบ
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-16">
      <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
      <p class="text-gray-400 mb-4">ยังไม่มีเส้นทาง</p>
      <NuxtLink
        to="/routes/create"
        class="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
      >
        สร้างเส้นทางแรก
      </NuxtLink>
    </div>

    <!-- Confirm dialog -->
    <AdminConfirmDialog
      :show="showConfirm"
      :title="confirmTitle"
      :message="confirmMessage"
      @confirm="confirmAction(); showConfirm = false"
      @cancel="showConfirm = false"
    />
  </div>
</template>
