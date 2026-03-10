<script setup lang="ts">
import type { RouteStatus } from '~/types/route'

defineProps<{
  status: RouteStatus
}>()

const statusConfig = {
  draft: { label: 'แบบร่าง', class: 'bg-yellow-100 text-yellow-700' },
  published: { label: 'เผยแพร่แล้ว', class: 'bg-green-100 text-green-700' },
  unpublished: { label: 'ถูกระงับ', class: 'bg-red-100 text-red-700' },
}
</script>

<template>
  <span
    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
    :class="statusConfig[status].class"
  >
    {{ statusConfig[status].label }}
  </span>
</template>
