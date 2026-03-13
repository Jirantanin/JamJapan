<script setup lang="ts">
import { CITIES } from '~/config/constants'

definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const router = useRouter()
const toast = useToast()
const { createRequest } = useRouteRequests()

const form = reactive({
  title: '',
  description: '',
  city: '',
  startPoint: '',
  endPoint: '',
})

const errors = reactive<Record<string, string>>({})
const saving = ref(false)

const cities = CITIES.map(value => ({ value, label: t(`city.${value}`) }))

function validate(): boolean {
  Object.keys(errors).forEach(key => delete errors[key])
  let valid = true

  if (!form.title.trim()) { errors.title = t('request.validation.titleRequired'); valid = false }
  if (!form.description.trim()) { errors.description = t('request.validation.descRequired'); valid = false }
  if (!form.city) { errors.city = t('request.validation.cityRequired'); valid = false }
  if (!form.startPoint.trim()) { errors.startPoint = t('request.validation.startRequired'); valid = false }
  if (!form.endPoint.trim()) { errors.endPoint = t('request.validation.endRequired'); valid = false }

  return valid
}

async function handleSubmit() {
  if (!validate()) return

  saving.value = true
  try {
    await createRequest(form)
    toast.success(t('request.submitSuccess'))
    // Clear Nuxt's data cache so the listing page fetches fresh data
    await refreshNuxtData()
    router.push('/route-requests')
  } catch (err: any) {
    toast.error(err?.data?.statusMessage || t('error.generic'))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex items-center gap-3 mb-6">
      <NuxtLink to="/route-requests" class="text-gray-400 hover:text-gray-600">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </NuxtLink>
      <h1 class="text-2xl font-bold text-gray-900">{{ t('request.createTitle') }}</h1>
    </div>

    <form class="space-y-6" @submit.prevent="handleSubmit">
      <div class="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
        <!-- Title -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('request.routeTitle') }} *</label>
          <input
            v-model="form.title"
            type="text"
            class="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            :class="errors.title ? 'border-red-300' : 'border-gray-200'"
            :placeholder="t('request.routeTitlePlaceholder')"
          />
          <p v-if="errors.title" class="text-xs text-red-500 mt-1">{{ errors.title }}</p>
        </div>

        <!-- City -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('request.city') }} *</label>
          <select
            v-model="form.city"
            class="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            :class="errors.city ? 'border-red-300' : 'border-gray-200'"
          >
            <option value="">{{ t('request.selectCity') }}</option>
            <option v-for="c in cities" :key="c.value" :value="c.value">{{ c.label }}</option>
          </select>
          <p v-if="errors.city" class="text-xs text-red-500 mt-1">{{ errors.city }}</p>
        </div>

        <!-- Start / End points -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('request.startPoint') }} *</label>
            <input
              v-model="form.startPoint"
              type="text"
              class="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              :class="errors.startPoint ? 'border-red-300' : 'border-gray-200'"
              :placeholder="t('request.startPointPlaceholder')"
            />
            <p v-if="errors.startPoint" class="text-xs text-red-500 mt-1">{{ errors.startPoint }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('request.endPoint') }} *</label>
            <input
              v-model="form.endPoint"
              type="text"
              class="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              :class="errors.endPoint ? 'border-red-300' : 'border-gray-200'"
              :placeholder="t('request.endPointPlaceholder')"
            />
            <p v-if="errors.endPoint" class="text-xs text-red-500 mt-1">{{ errors.endPoint }}</p>
          </div>
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('request.description') }} *</label>
          <textarea
            v-model="form.description"
            rows="4"
            class="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            :class="errors.description ? 'border-red-300' : 'border-gray-200'"
            :placeholder="t('request.descriptionPlaceholder')"
          />
          <p v-if="errors.description" class="text-xs text-red-500 mt-1">{{ errors.description }}</p>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-3">
        <button
          type="submit"
          :disabled="saving"
          class="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium disabled:opacity-50"
        >
          {{ saving ? t('request.submitting') : t('request.submit') }}
        </button>
        <NuxtLink
          to="/route-requests"
          class="px-6 py-2.5 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          {{ t('request.cancel') }}
        </NuxtLink>
      </div>
    </form>
  </div>
</template>
