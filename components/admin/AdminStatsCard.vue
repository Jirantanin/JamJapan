<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  icon: string
}>()
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
    <div class="flex items-center gap-3">
      <span class="text-2xl">{{ icon }}</span>
      <div>
        <p class="text-2xl font-bold text-gray-900">{{ value }}</p>
        <p class="text-sm text-gray-500">{{ label }}</p>
      </div>
    </div>
  </div>
</template>
