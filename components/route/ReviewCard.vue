<script setup lang="ts">
import type { Review } from '~/types/route'

const props = defineProps<{
  review: Review
  currentUserId?: string
}>()

const emit = defineEmits<{
  delete: [reviewId: string]
}>()

const formattedDate = computed(() =>
  new Date(props.review.createdAt).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
)

const isOwner = computed(() => props.review.createdBy?.id === props.currentUserId)
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
    <div class="flex items-start justify-between gap-3">
      <!-- User info + rating -->
      <div class="flex items-start gap-3 min-w-0">
        <!-- Avatar -->
        <img
          v-if="review.createdBy?.avatar"
          :src="review.createdBy.avatar"
          :alt="review.createdBy.name"
          class="w-9 h-9 rounded-full object-cover flex-shrink-0"
        />
        <div v-else class="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 text-primary-600 font-semibold text-sm">
          {{ review.createdBy?.name?.charAt(0)?.toUpperCase() ?? '?' }}
        </div>

        <div class="min-w-0">
          <p class="font-medium text-gray-900 text-sm truncate">{{ review.createdBy?.name ?? 'Anonymous' }}</p>
          <RouteStarRating :model-value="review.rating" readonly size="sm" />
        </div>
      </div>

      <!-- Date + delete button -->
      <div class="flex items-center gap-2 flex-shrink-0">
        <span class="text-xs text-gray-400">{{ formattedDate }}</span>
        <button
          v-if="isOwner"
          type="button"
          class="text-red-400 hover:text-red-600 transition-colors p-1"
          :title="$t('review.delete')"
          @click="emit('delete', review.id)"
        >
          <!-- Trash icon -->
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Comment -->
    <p v-if="review.comment" class="mt-3 text-sm text-gray-700 leading-relaxed">
      {{ review.comment }}
    </p>
  </div>
</template>
