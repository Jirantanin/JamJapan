<script setup lang="ts">
const { toasts } = useToast()

const iconMap = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
}

const colorMap = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
}
</script>

<template>
  <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
    <TransitionGroup
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="translate-x-full opacity-0"
      enter-to-class="translate-x-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="translate-x-0 opacity-100"
      leave-to-class="translate-x-full opacity-0"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="flex items-center gap-2 px-4 py-3 rounded-lg border shadow-lg min-w-[280px] max-w-sm"
        :class="colorMap[toast.type]"
      >
        <span class="font-bold text-lg leading-none">{{ iconMap[toast.type] }}</span>
        <span class="text-sm">{{ toast.message }}</span>
      </div>
    </TransitionGroup>
  </div>
</template>
