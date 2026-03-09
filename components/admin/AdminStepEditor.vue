<script setup lang="ts">
const { t } = useI18n()

interface StepFormData {
  order: number
  instruction: string
  image: string
  location: { lat: number | null; lng: number | null; name?: string }
  distanceFromPrev: number | null
  note: string
}

const props = defineProps<{
  modelValue: StepFormData[]
  errors?: Record<string, string>[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: StepFormData[]]
}>()

const expandedIndex = ref<number | null>(null)

function createEmptyStep(order: number): StepFormData {
  return {
    order,
    instruction: '',
    image: '',
    location: { lat: null, lng: null },
    distanceFromPrev: null,
    note: '',
  }
}

function addStep() {
  const newStep = createEmptyStep(props.modelValue.length + 1)
  const updated = [...props.modelValue, newStep]
  emit('update:modelValue', updated)
  expandedIndex.value = updated.length - 1
}

function removeStep(index: number) {
  if (props.modelValue.length <= 1) return
  const updated = props.modelValue
    .filter((_, i) => i !== index)
    .map((s, i) => ({ ...s, order: i + 1 }))
  emit('update:modelValue', updated)
  expandedIndex.value = null
}

function updateStep(index: number, step: StepFormData) {
  const updated = [...props.modelValue]
  updated[index] = step
  emit('update:modelValue', updated)
}

function moveStep(index: number, direction: 'up' | 'down') {
  const newIndex = direction === 'up' ? index - 1 : index + 1
  if (newIndex < 0 || newIndex >= props.modelValue.length) return

  const updated = [...props.modelValue]
  ;[updated[index], updated[newIndex]] = [updated[newIndex], updated[index]]
  updated.forEach((s, i) => s.order = i + 1)
  emit('update:modelValue', updated)
  expandedIndex.value = newIndex
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-3">
      <label class="text-sm font-medium text-gray-700">
        {{ t('admin.form.steps') }} * ({{ modelValue.length }})
      </label>
      <button
        type="button"
        class="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
        @click="addStep"
      >
        + {{ t('admin.form.addStep') }}
      </button>
    </div>

    <div class="space-y-2">
      <div v-for="(step, index) in modelValue" :key="index" class="relative">
        <!-- Action buttons -->
        <div class="absolute -left-10 top-3 hidden sm:flex flex-col gap-0.5">
          <button
            type="button"
            class="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
            :disabled="index === 0"
            title="Move up"
            @click="moveStep(index, 'up')"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button
            type="button"
            class="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
            :disabled="index === modelValue.length - 1"
            title="Move down"
            @click="moveStep(index, 'down')"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <AdminStepForm
          :model-value="step"
          :step-number="index + 1"
          :expanded="expandedIndex === index"
          :errors="errors?.[index]"
          @update:model-value="updateStep(index, $event)"
          @toggle-expand="expandedIndex = expandedIndex === index ? null : index"
        />

        <!-- Mobile move + delete -->
        <div class="flex items-center gap-1 mt-1 sm:hidden">
          <button
            type="button"
            class="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 disabled:opacity-30"
            :disabled="index === 0"
            @click="moveStep(index, 'up')"
          >
            Up
          </button>
          <button
            type="button"
            class="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 disabled:opacity-30"
            :disabled="index === modelValue.length - 1"
            @click="moveStep(index, 'down')"
          >
            Down
          </button>
          <button
            v-if="modelValue.length > 1"
            type="button"
            class="text-xs text-red-400 hover:text-red-600 px-2 py-1 ml-auto"
            @click="removeStep(index)"
          >
            {{ t('admin.delete') }}
          </button>
        </div>

        <!-- Desktop delete -->
        <button
          v-if="modelValue.length > 1"
          type="button"
          class="hidden sm:block absolute -right-8 top-3 p-0.5 text-gray-400 hover:text-red-500"
          title="Delete step"
          @click="removeStep(index)"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <p v-if="errors && !Array.isArray(errors)" class="text-xs text-red-500 mt-2">
      {{ t('admin.validation.minSteps') }}
    </p>
  </div>
</template>
