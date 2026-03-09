<script setup lang="ts">
import type { Route } from '~/types/route'

definePageMeta({ middleware: 'admin', layout: 'admin' })

const { t } = useI18n()
const router = useRouter()
const { deleteRoute } = useAdminRoutes()
const toast = useToast()

const { data, pending, error, refresh } = useFetch<{ routes: Route[] }>('/api/routes', {
  query: { limit: 100 },
})

const routes = computed(() => data.value?.routes || [])

// Delete flow
const deleteTarget = ref<Route | null>(null)
const showDeleteDialog = ref(false)
const deleting = ref(false)

function handleDeleteClick(route: Route) {
  deleteTarget.value = route
  showDeleteDialog.value = true
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await deleteRoute(deleteTarget.value.id)
    toast.success(t('admin.toast.deleteSuccess'))
    showDeleteDialog.value = false
    deleteTarget.value = null
    await refresh()
  } catch {
    toast.error(t('admin.toast.error'))
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">{{ t('admin.routeManagement') }}</h1>
      <NuxtLink
        to="/admin/routes/create"
        class="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
      >
        + {{ t('admin.createRoute') }}
      </NuxtLink>
    </div>

    <div v-if="error" class="text-center py-12 text-red-500">
      {{ t('error.loadFailed') }}
    </div>

    <AdminRouteTable
      v-else
      :routes="routes"
      :loading="pending"
      @edit="(id) => router.push(`/admin/routes/${id}/edit`)"
      @delete="handleDeleteClick"
    />

    <AdminConfirmDialog
      :show="showDeleteDialog"
      :title="t('admin.deleteRoute')"
      :message="t('admin.deleteConfirm', { title: deleteTarget?.title })"
      :confirm-text="t('admin.delete')"
      danger
      @confirm="confirmDelete"
      @cancel="showDeleteDialog = false; deleteTarget = null"
    />
  </div>
</template>
