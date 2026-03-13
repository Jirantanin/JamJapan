<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: number
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
  maxRating?: number
}>(), {
  readonly: false,
  size: 'md',
  maxRating: 5,
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const hoverRating = ref(0)

const sizeClass = computed(() => {
  if (props.size === 'sm') return 'text-base'
  if (props.size === 'lg') return 'text-3xl'
  return 'text-2xl'
})

function getStarClass(star: number) {
  const active = props.readonly ? props.modelValue : (hoverRating.value || props.modelValue)
  return star <= active ? 'text-yellow-400' : 'text-gray-300'
}

function handleClick(star: number) {
  if (!props.readonly) {
    emit('update:modelValue', star)
  }
}
</script>

<template>
  <div class="flex items-center gap-0.5">
    <button
      v-for="star in maxRating"
      :key="star"
      type="button"
      :class="[sizeClass, getStarClass(star), readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform']"
      :disabled="readonly"
      @click="handleClick(star)"
      @mouseenter="!readonly && (hoverRating = star)"
      @mouseleave="!readonly && (hoverRating = 0)"
    >
      ★
    </button>
  </div>
</template>
