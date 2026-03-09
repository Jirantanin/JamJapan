<script setup lang="ts">
const { t } = useI18n()

const props = defineProps<{
  modelValue: string[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const inputValue = ref('')

function addTag() {
  const tag = inputValue.value.trim().toLowerCase()
  if (tag && !props.modelValue.includes(tag)) {
    emit('update:modelValue', [...props.modelValue, tag])
  }
  inputValue.value = ''
}

function removeTag(tag: string) {
  emit('update:modelValue', props.modelValue.filter(t => t !== tag))
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault()
    addTag()
  }
}
</script>

<template>
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ t('admin.form.tags') }}</label>

    <!-- Tag chips -->
    <div v-if="modelValue.length > 0" class="flex flex-wrap gap-1.5 mb-2">
      <span
        v-for="tag in modelValue"
        :key="tag"
        class="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
      >
        {{ tag }}
        <button
          type="button"
          class="text-primary-400 hover:text-primary-600 ml-0.5"
          @click="removeTag(tag)"
        >
          &times;
        </button>
      </span>
    </div>

    <!-- Input -->
    <input
      v-model="inputValue"
      type="text"
      class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      :placeholder="t('admin.form.tagsHelp')"
      @keydown="handleKeydown"
    />
  </div>
</template>
