<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex items-center gap-3 mb-6">
      <NuxtLink to="/my/routes" class="text-gray-400 hover:text-gray-600">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </NuxtLink>
      <h1 class="text-2xl font-bold text-gray-900">สร้างเส้นทางใหม่</h1>
    </div>

    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-700">
      เส้นทางที่สร้างจะเริ่มเป็น "แบบร่าง" คุณสามารถเผยแพร่ได้เมื่อพร้อม
    </div>

    <AdminRouteForm mode="create" redirect-to="/my/routes" />
  </div>
</template>
