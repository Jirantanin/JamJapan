<script setup lang="ts">
import type { City } from '~/types/route'
import { CITIES } from '~/config/constants'

const { t } = useI18n()
const toast = useToast()
const { loggedIn } = useUserSession()
const { fetchRequests, toggleVote } = useRouteRequests()

const selectedCity = ref<City | 'all'>('all')
const selectedSort = ref('votes')
const votingId = ref<string | null>(null)

const { data, pending, error, refresh } = fetchRequests({
  city: selectedCity,
  sort: selectedSort,
})

// Force re-fetch on every mount to avoid Nuxt's SSR payload cache serving stale data
// after client-side navigation back from the create page
onMounted(() => {
  refresh()
})

const requests = computed(() => data.value?.requests || [])

const cities = [
  { value: 'all' as const, label: t('city.all') },
  ...CITIES.filter(c => c !== 'other').map(value => ({ value, label: t(`city.${value}`) })),
]

const sortOptions = [
  { value: 'votes', label: t('request.sortVotes') },
  { value: 'newest', label: t('request.sortNewest') },
]

async function handleVote(id: string) {
  if (!loggedIn.value) {
    toast.error(t('request.loginToVote'))
    return
  }
  votingId.value = id
  try {
    await toggleVote(id)
    refresh()
  } catch (err: any) {
    toast.error(err?.data?.statusMessage || t('request.voteFailed'))
  } finally {
    votingId.value = null
  }
}
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{{ t('request.pageTitle') }}</h1>
        <p class="text-sm text-gray-500 mt-1">{{ t('request.pageSubtitle') }}</p>
      </div>
      <NuxtLink
        v-if="loggedIn"
        to="/route-requests/create"
        class="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        {{ t('request.requestRoute') }}
      </NuxtLink>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap items-center gap-4 mb-6">
      <div class="flex flex-wrap gap-2">
        <button
          v-for="city in cities"
          :key="city.value"
          class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
          :class="selectedCity === city.value
            ? 'bg-primary-600 text-white'
            : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'"
          @click="selectedCity = city.value"
        >
          {{ city.label }}
        </button>
      </div>
      <select
        v-model="selectedSort"
        class="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
      >
        <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="space-y-4">
      <div v-for="i in 5" :key="i" class="h-32 bg-gray-100 rounded-xl animate-pulse" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-16 text-red-400">
      <p>{{ t('request.loadFailed') }}</p>
    </div>

    <!-- List -->
    <div v-else-if="requests.length > 0" class="space-y-4">
      <RequestRequestCard
        v-for="req in requests"
        :key="req.id"
        :request="req"
        :voting-id="votingId"
        @vote="handleVote"
      />
    </div>

    <!-- Empty -->
    <div v-else class="text-center py-16">
      <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="text-gray-400 mb-4">{{ t('request.empty') }}</p>
      <NuxtLink
        v-if="loggedIn"
        to="/route-requests/create"
        class="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium"
      >
        {{ t('request.beFirst') }}
      </NuxtLink>
    </div>
  </div>
</template>
