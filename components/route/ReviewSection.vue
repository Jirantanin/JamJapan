<script setup lang="ts">
import type { Review } from '~/types/route'

const props = defineProps<{
  routeId: string
  currentUserId?: string
}>()

const { t } = useI18n()
const { fetchReviews, createReview, deleteReview } = useReviews()

const page = ref(1)
const limit = 10

const { data, pending, refresh } = fetchReviews(props.routeId, { page: page.value, limit })

const reviews = computed(() => data.value?.reviews as Review[] ?? [])
const total = computed(() => data.value?.total ?? 0)
const totalPages = computed(() => Math.ceil(total.value / limit))

// Check if current user already reviewed
const hasReviewed = computed(() =>
  props.currentUserId
    ? reviews.value.some((r) => r.createdBy?.id === props.currentUserId)
    : false
)

// Create review form state
const newRating = ref(0)
const newComment = ref('')
const submitting = ref(false)
const submitError = ref('')
const submitSuccess = ref('')

async function handleSubmit() {
  if (newRating.value < 1) {
    submitError.value = t('review.error_rating')
    return
  }
  submitting.value = true
  submitError.value = ''
  submitSuccess.value = ''
  try {
    await createReview(props.routeId, {
      rating: newRating.value,
      comment: newComment.value || undefined,
    })
    submitSuccess.value = t('review.success_create')
    newRating.value = 0
    newComment.value = ''
    await refresh()
  }
  catch {
    submitError.value = t('review.error_generic')
  }
  finally {
    submitting.value = false
  }
}

async function handleDelete(reviewId: string) {
  if (!confirm(t('review.delete_confirm'))) return
  try {
    await deleteReview(reviewId)
    await refresh()
  }
  catch {
    // silently ignore or could show toast
  }
}

async function goToPage(p: number) {
  page.value = p
  await refresh()
}

// Average rating display
const avgRating = computed(() => {
  if (!reviews.value.length) return 0
  const sum = reviews.value.reduce((acc, r) => acc + r.rating, 0)
  return Math.round((sum / reviews.value.length) * 10) / 10
})
</script>

<template>
  <section class="mt-10">
    <!-- Section header -->
    <h2 class="text-xl font-bold text-gray-900 mb-6">
      {{ t('review.title') }}
      <span class="text-sm font-normal text-gray-500 ml-2">
        ({{ total }} {{ t('review.count') }})
      </span>
    </h2>

    <!-- Loading skeleton -->
    <div v-if="pending" class="space-y-3 animate-pulse">
      <div v-for="i in 3" :key="i" class="h-24 bg-gray-100 rounded-xl" />
    </div>

    <template v-else>
      <!-- Average rating display (only if there are reviews) -->
      <div v-if="total > 0" class="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
        <div class="text-4xl font-bold text-gray-900">{{ avgRating }}</div>
        <div>
          <RouteStarRating :model-value="avgRating" readonly size="lg" />
          <p class="text-sm text-gray-500 mt-1">
            {{ t('review.out_of') }} &bull; {{ total }} {{ t('review.count') }}
          </p>
        </div>
      </div>

      <!-- Create review form (logged in + not yet reviewed) -->
      <div v-if="currentUserId && !hasReviewed" class="mb-6 p-4 bg-white border border-gray-200 rounded-xl">
        <h3 class="font-semibold text-gray-800 mb-3">{{ t('review.write') }}</h3>

        <div class="mb-3">
          <p class="text-sm text-gray-600 mb-1">{{ t('review.rating_label') }}</p>
          <RouteStarRating v-model="newRating" size="lg" />
        </div>

        <textarea
          v-model="newComment"
          :placeholder="t('review.comment_placeholder')"
          maxlength="1000"
          rows="3"
          class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
        />

        <div v-if="submitError" class="mt-2 text-sm text-red-500">{{ submitError }}</div>
        <div v-if="submitSuccess" class="mt-2 text-sm text-green-600">{{ submitSuccess }}</div>

        <button
          type="button"
          :disabled="submitting"
          class="mt-3 px-5 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          @click="handleSubmit"
        >
          {{ submitting ? '...' : t('review.submit') }}
        </button>
      </div>

      <!-- Already reviewed notice -->
      <div v-else-if="currentUserId && hasReviewed" class="mb-4 text-sm text-gray-500 italic">
        {{ t('review.already_reviewed') }}
      </div>

      <!-- Login prompt -->
      <div v-else-if="!currentUserId" class="mb-4 text-sm text-gray-500">
        {{ t('review.login_to_review') }}
      </div>

      <!-- Reviews list -->
      <div v-if="reviews.length > 0" class="space-y-3">
        <RouteReviewCard
          v-for="review in reviews"
          :key="review.id"
          :review="review"
          :current-user-id="currentUserId"
          @delete="handleDelete"
        />
      </div>

      <!-- Empty state -->
      <div v-else class="py-10 text-center text-gray-400">
        <p>{{ t('review.empty') }}</p>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-6">
        <button
          v-for="p in totalPages"
          :key="p"
          type="button"
          :class="[
            'w-8 h-8 rounded-full text-sm font-medium transition-colors',
            p === page
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
          @click="goToPage(p)"
        >
          {{ p }}
        </button>
      </div>
    </template>
  </section>
</template>
