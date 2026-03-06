<script setup lang="ts">
import type { Difficulty } from '~/types/route'

const props = defineProps<{
  difficulty: Difficulty
}>()

const { t } = useI18n()

const badgeClass = computed(() => {
  switch (props.difficulty) {
    case 'easy':
      return 'bg-green-100 text-green-700'
    case 'medium':
      return 'bg-yellow-100 text-yellow-700'
    case 'hard':
      return 'bg-red-100 text-red-700'
  }
})
</script>

<template>
  <span
    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
    :class="badgeClass"
  >
    {{ t(`difficulty.${difficulty}`) }}
  </span>
</template>
