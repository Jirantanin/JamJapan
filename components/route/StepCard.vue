<script setup lang="ts">
import type { Step } from '~/types/route'

const props = defineProps<{
  step: Step
  isActive: boolean
}>()

const emit = defineEmits<{
  click: [step: Step]
}>()

const { t } = useI18n()
</script>

<template>
  <div
    :id="`step-${step.order}`"
    class="relative flex gap-4 cursor-pointer group"
    :class="isActive ? 'bg-primary-50 -mx-4 px-4 py-3 rounded-xl' : 'py-3'"
    @click="emit('click', step)"
  >
    <!-- Step number -->
    <div
      class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors"
      :class="isActive ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600 group-hover:bg-primary-100 group-hover:text-primary-600'"
    >
      {{ step.order }}
    </div>

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <p class="text-gray-800 leading-relaxed">
        {{ step.instruction }}
      </p>

      <!-- Meta -->
      <div class="flex flex-wrap items-center gap-3 mt-2">
        <span v-if="step.distanceFromPrev" class="text-xs text-gray-400 flex items-center gap-1">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          {{ step.distanceFromPrev }}m {{ t('route.fromPrevStep') }}
        </span>
        <span v-if="step.location.name" class="text-xs text-gray-400 flex items-center gap-1">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {{ step.location.name }}
        </span>
      </div>

      <!-- Note -->
      <div
        v-if="step.note"
        class="mt-2 text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100"
      >
        💡 {{ step.note }}
      </div>
    </div>
  </div>
</template>
