<script setup lang="ts">
definePageMeta({ middleware: 'admin', layout: 'admin' })

const { t } = useI18n()
</script>

<template>
  <div>
    <div class="flex items-center gap-3 mb-6">
      <NuxtLink to="/admin/routes" class="text-gray-400 hover:text-gray-600">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </NuxtLink>
      <h1 class="text-2xl font-bold text-gray-900">{{ t('admin.createRoute') }}</h1>
    </div>

    <AdminRouteForm mode="create" />
  </div>
</template>
