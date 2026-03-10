<script setup lang="ts">

defineProps<{
  count: number
  hasVoted: boolean
  loading?: boolean
  disabled?: boolean
}>()

defineEmits<{
  vote: []
}>()
</script>

<template>
  <button
    type="button"
    class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors"
    :class="hasVoted
      ? 'bg-primary-50 border-primary-300 text-primary-700 hover:bg-primary-100'
      : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
    :disabled="loading || disabled"
    @click="$emit('vote')"
  >
    <svg
      class="w-4 h-4 transition-transform"
      :class="{ 'scale-110': hasVoted }"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M5 15l7-7 7 7"
      />
    </svg>
    <span>{{ count }}</span>
  </button>
</template>
