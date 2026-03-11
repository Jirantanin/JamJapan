<script setup lang="ts">
const props = defineProps<{
  routeId: string
  isSaved: boolean
  size?: 'sm' | 'md'
}>()

const emit = defineEmits<{ toggle: [saved: boolean] }>()

const { loggedIn } = useUserSession()
const toast = useToast()
const loading = ref(false)
const saved = ref(props.isSaved)

watch(() => props.isSaved, (v) => {
  saved.value = v
})

async function handleClick() {
  if (!loggedIn.value) {
    toast.error('กรุณาเข้าสู่ระบบเพื่อบันทึกเส้นทาง')
    return
  }
  loading.value = true
  try {
    const result = await $fetch<{ saved: boolean }>(`/api/routes/${props.routeId}/save`, {
      method: 'POST',
    })
    saved.value = result.saved
    emit('toggle', result.saved)
    toast.success(result.saved ? 'บันทึกเส้นทางแล้ว' : 'ยกเลิกการบันทึกแล้ว')
  } catch {
    toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่')
  } finally {
    loading.value = false
  }
}

const iconSize = computed(() => props.size === 'sm' ? 'w-4 h-4' : 'w-5 h-5')
const btnSize = computed(() => props.size === 'sm' ? 'p-1.5' : 'p-2')
</script>

<template>
  <button
    :title="saved ? 'ยกเลิกการบันทึก' : 'บันทึกเส้นทาง'"
    :disabled="loading"
    :class="[
      'rounded-full bg-white/90 shadow hover:bg-white transition-all focus:outline-none focus:ring-2 focus:ring-primary-400 disabled:opacity-60',
      btnSize,
    ]"
    @click.prevent.stop="handleClick"
  >
    <!-- Loading spinner -->
    <svg
      v-if="loading"
      :class="['animate-spin text-primary-400', iconSize]"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>

    <!-- Saved (filled bookmark) -->
    <svg
      v-else-if="saved"
      :class="['text-primary-600', iconSize]"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M5 4a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 20V4z" />
    </svg>

    <!-- Not saved (outline bookmark) -->
    <svg
      v-else
      :class="['text-gray-400 hover:text-primary-600 transition-colors', iconSize]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="M5 4a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 20V4z" />
    </svg>
  </button>
</template>
