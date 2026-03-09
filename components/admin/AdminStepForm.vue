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
  modelValue: StepFormData
  stepNumber: number
  expanded?: boolean
  errors?: Record<string, string>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: StepFormData]
  toggleExpand: []
}>()

function update(field: keyof StepFormData, value: any) {
  emit('update:modelValue', { ...props.modelValue, [field]: value })
}

function updateLocation(loc: { lat: number; lng: number; name?: string }) {
  emit('update:modelValue', { ...props.modelValue, location: loc })
}
</script>

<template>
  <div class="border border-gray-200 rounded-lg overflow-hidden">
    <!-- Header (always visible) -->
    <button
      type="button"
      class="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      @click="emit('toggleExpand')"
    >
      <span class="w-7 h-7 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">
        {{ stepNumber }}
      </span>
      <span class="text-sm text-gray-700 truncate flex-1">
        {{ modelValue.instruction || `${t('route.step')} ${stepNumber}` }}
      </span>
      <svg
        class="w-4 h-4 text-gray-400 transition-transform shrink-0"
        :class="expanded ? 'rotate-180' : ''"
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Expanded form -->
    <div v-if="expanded" class="p-4 space-y-4">
      <!-- Instruction -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('admin.form.instruction') }} *</label>
        <textarea
          :value="modelValue.instruction"
          rows="2"
          class="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          :class="errors?.instruction ? 'border-red-300' : 'border-gray-200'"
          @input="update('instruction', ($event.target as HTMLTextAreaElement).value)"
        />
        <p v-if="errors?.instruction" class="text-xs text-red-500 mt-1">{{ errors.instruction }}</p>
      </div>

      <!-- Location picker -->
      <AdminLocationPicker
        :model-value="modelValue.location"
        :label="t('admin.form.location') + ' *'"
        @update:model-value="updateLocation"
      />
      <p v-if="errors?.location" class="text-xs text-red-500 -mt-3">{{ errors.location }}</p>

      <!-- Distance from prev + Image URL -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('admin.form.distanceFromPrev') }}</label>
          <input
            type="number"
            :value="modelValue.distanceFromPrev"
            min="0"
            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            @input="update('distanceFromPrev', ($event.target as HTMLInputElement).value ? Number(($event.target as HTMLInputElement).value) : null)"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('admin.form.stepImage') }}</label>
          <input
            type="url"
            :value="modelValue.image"
            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="https://..."
            @input="update('image', ($event.target as HTMLInputElement).value)"
          />
        </div>
      </div>

      <!-- Note -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('admin.form.note') }}</label>
        <input
          type="text"
          :value="modelValue.note"
          class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          @input="update('note', ($event.target as HTMLInputElement).value)"
        />
      </div>
    </div>
  </div>
</template>
