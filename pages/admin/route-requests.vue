<script setup lang="ts">
definePageMeta({ middleware: 'admin', layout: 'admin' })

const { t } = useI18n()
const toast = useToast()

const selectedStatus = ref('all')
const statusOptions = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'pending', label: 'รอดำเนินการ' },
  { value: 'fulfilled', label: 'สร้างแล้ว' },
  { value: 'closed', label: 'ปิดแล้ว' },
]

const { data, pending, error, refresh } = useFetch('/api/admin/route-requests', {
  params: computed(() => ({
    status: selectedStatus.value !== 'all' ? selectedStatus.value : undefined,
    sort: 'votes',
  })),
})

const requests = computed(() => (data.value as any)?.requests || [])

async function updateStatus(id: string, status: string) {
  try {
    await $fetch(`/api/admin/route-requests/${id}/status`, {
      method: 'PUT',
      body: { status },
    })
    toast.success('อัพเดทสถานะสำเร็จ')
    refresh()
  } catch (err: any) {
    toast.error(err?.data?.statusMessage || 'เกิดข้อผิดพลาด')
  }
}

async function deleteRequest(id: string) {
  try {
    await $fetch(`/api/route-requests/${id}`, { method: 'DELETE' })
    toast.success('ลบคำขอสำเร็จ')
    refresh()
  } catch (err: any) {
    toast.error(err?.data?.statusMessage || 'เกิดข้อผิดพลาด')
  }
}

const statusBadgeClass: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  fulfilled: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-500',
}

const statusLabel: Record<string, string> = {
  pending: 'รอดำเนินการ',
  fulfilled: 'สร้างแล้ว',
  closed: 'ปิดแล้ว',
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">คำขอเส้นทาง</h1>

    <!-- Status filter -->
    <div class="flex gap-2 mb-6">
      <button
        v-for="opt in statusOptions"
        :key="opt.value"
        class="px-4 py-2 rounded-full text-sm font-medium transition-colors"
        :class="selectedStatus === opt.value
          ? 'bg-primary-600 text-white'
          : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'"
        @click="selectedStatus = opt.value"
      >
        {{ opt.label }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="space-y-3">
      <div v-for="i in 5" :key="i" class="h-20 bg-gray-100 rounded-xl animate-pulse" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-16 text-red-400">
      <p>ไม่สามารถโหลดข้อมูลได้</p>
    </div>

    <!-- Table -->
    <div v-else-if="requests.length > 0" class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-gray-600">
          <tr>
            <th class="text-left px-4 py-3 font-medium">โหวต</th>
            <th class="text-left px-4 py-3 font-medium">คำขอ</th>
            <th class="text-left px-4 py-3 font-medium">เมือง</th>
            <th class="text-left px-4 py-3 font-medium">สถานะ</th>
            <th class="text-left px-4 py-3 font-medium">ผู้ขอ</th>
            <th class="text-right px-4 py-3 font-medium">จัดการ</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="req in requests" :key="req.id" class="hover:bg-gray-50">
            <td class="px-4 py-3">
              <span class="inline-flex items-center gap-1 text-gray-600 font-medium">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                </svg>
                {{ req.voteCount }}
              </span>
            </td>
            <td class="px-4 py-3">
              <div class="font-medium text-gray-900">{{ req.title }}</div>
              <div class="text-xs text-gray-400 mt-0.5">{{ req.startPoint }} → {{ req.endPoint }}</div>
            </td>
            <td class="px-4 py-3 text-gray-600">{{ req.city }}</td>
            <td class="px-4 py-3">
              <span
                class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                :class="statusBadgeClass[req.status]"
              >
                {{ statusLabel[req.status] }}
              </span>
            </td>
            <td class="px-4 py-3 text-gray-600">{{ req.createdBy?.name || '-' }}</td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-end gap-2">
                <button
                  v-if="req.status === 'pending'"
                  class="px-2 py-1 text-xs font-medium text-green-700 bg-green-50 rounded hover:bg-green-100"
                  @click="updateStatus(req.id, 'fulfilled')"
                >
                  สร้างแล้ว
                </button>
                <button
                  v-if="req.status === 'pending'"
                  class="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-50 rounded hover:bg-gray-100"
                  @click="updateStatus(req.id, 'closed')"
                >
                  ปิด
                </button>
                <button
                  class="px-2 py-1 text-xs font-medium text-red-600 bg-red-50 rounded hover:bg-red-100"
                  @click="deleteRequest(req.id)"
                >
                  ลบ
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty -->
    <div v-else class="text-center py-16 text-gray-400">
      <p>ยังไม่มีคำขอเส้นทาง</p>
    </div>
  </div>
</template>
