<script setup lang="ts">
const { t } = useI18n()
const router = useRouter()

const query = ref('')

function handleSearch() {
  if (query.value.trim()) {
    router.push({ path: '/search', query: { q: query.value.trim() } })
  }
}
</script>

<template>
  <form class="relative w-full max-w-xl" @submit.prevent="handleSearch">
    <input
      v-model="query"
      type="text"
      :placeholder="t('hero.searchPlaceholder')"
      class="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none text-gray-700 bg-white shadow-sm transition-all"
    >
    <svg
      class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  </form>
</template>
