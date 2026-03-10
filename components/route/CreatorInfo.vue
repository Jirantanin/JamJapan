<script setup lang="ts">

defineProps<{
  creator: {
    id: string
    name: string
    avatar?: string
  }
  size?: 'sm' | 'md'
}>()
</script>

<template>
  <div class="flex items-center gap-2" :class="size === 'md' ? 'text-sm' : 'text-xs text-gray-500'">
    <img
      v-if="creator.avatar"
      :src="creator.avatar"
      :alt="creator.name"
      class="rounded-full"
      :class="size === 'md' ? 'w-6 h-6' : 'w-4 h-4'"
    />
    <div
      v-else
      class="rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium"
      :class="size === 'md' ? 'w-6 h-6 text-xs' : 'w-4 h-4 text-[10px]'"
    >
      {{ creator.name?.charAt(0)?.toUpperCase() || '?' }}
    </div>
    <span>{{ creator.name || 'ไม่ระบุชื่อ' }}</span>
  </div>
</template>
