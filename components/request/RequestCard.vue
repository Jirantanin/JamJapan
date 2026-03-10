<script setup lang="ts">
import type { RouteRequest } from '~/types/route'

const props = defineProps<{
  request: RouteRequest
  votingId?: string | null
}>()

defineEmits<{
  vote: [id: string]
}>()

const { loggedIn } = useUserSession()

const cityLabels: Record<string, string> = {
  tokyo: 'โตเกียว',
  osaka: 'โอซากะ',
  kyoto: 'เกียวโต',
  nara: 'นารา',
  fukuoka: 'ฟุกุโอกะ',
  sapporo: 'ซัปโปโร',
  hiroshima: 'ฮิโรชิมา',
  other: 'อื่นๆ',
}
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
    <div class="flex items-start gap-4">
      <!-- Vote button -->
      <div class="flex-shrink-0">
        <CommonVoteButton
          :count="request.voteCount"
          :has-voted="request.hasVoted"
          :loading="votingId === request.id"
          :disabled="!loggedIn"
          @vote="$emit('vote', request.id)"
        />
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <h3 class="font-semibold text-gray-900">{{ request.title }}</h3>
        <p class="text-sm text-gray-500 mt-1 line-clamp-2">{{ request.description }}</p>

        <!-- Route points -->
        <div class="flex items-center gap-2 mt-3 text-xs text-gray-500">
          <span class="inline-flex items-center gap-1">
            <span class="w-2 h-2 bg-green-500 rounded-full" />
            {{ request.startPoint }}
          </span>
          <svg class="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
          <span class="inline-flex items-center gap-1">
            <span class="w-2 h-2 bg-red-500 rounded-full" />
            {{ request.endPoint }}
          </span>
        </div>

        <!-- Meta -->
        <div class="flex items-center gap-3 mt-3 text-xs text-gray-400">
          <span class="px-2 py-0.5 bg-gray-100 rounded-full">{{ cityLabels[request.city] || request.city }}</span>
          <RouteCreatorInfo v-if="request.createdBy" :creator="request.createdBy" size="sm" />
        </div>
      </div>
    </div>
  </div>
</template>
