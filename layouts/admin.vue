<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div class="min-h-screen flex bg-gray-50">
    <AdminSidebar />

    <div class="flex-1 flex flex-col min-h-screen lg:ml-64">
      <!-- Top bar -->
      <header class="bg-white shadow-sm px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <h2 class="text-lg font-semibold text-gray-800">
          {{ t('admin.panel') }}
        </h2>
        <NuxtLink to="/" class="text-sm text-gray-500 hover:text-primary-600 transition-colors">
          {{ t('admin.backToSite') }}
        </NuxtLink>
      </header>

      <!-- Main content -->
      <main class="flex-1 p-4 sm:p-6">
        <slot />
      </main>
    </div>

    <AdminToast />
  </div>
</template>
