<script setup lang="ts">
import type { Route } from '~/types/route'
import { CITIES, DIFFICULTIES } from '~/config/constants'

const { t } = useI18n()
const router = useRouter()
const toast = useToast()
const { createRoute, updateRoute } = useAdminRoutes()

const props = defineProps<{
  mode: 'create' | 'edit'
  initialRoute?: Route
  redirectTo?: string
}>()

const { form, errors, stepErrors, saving, validate, toCreatePayload, toUpdatePayload, slugify } =
  useRouteForm(props.mode, props.initialRoute)

const cities = CITIES.map(value => ({ value, label: () => t(`city.${value}`) }))
const difficulties = DIFFICULTIES.map(value => ({ value, label: () => t(`difficulty.${value}`) }))

function autoSlug() {
  if (props.mode === 'create' && form.title && !form.id) {
    form.id = slugify(form.title)
  }
}

async function handleSubmit() {
  if (!validate()) return

  saving.value = true
  try {
    if (props.mode === 'create') {
      await createRoute(toCreatePayload())
      toast.success(t('admin.toast.createSuccess'))
    } else {
      await updateRoute(props.initialRoute!.id, toUpdatePayload())
      toast.success(t('admin.toast.updateSuccess'))
    }
    router.push(props.redirectTo || '/admin/routes')
  } catch (err: any) {
    const message = err?.data?.statusMessage || err?.message || t('admin.toast.error')
    toast.error(message)
  } finally {
    saving.value = false
  }
}

function errorText(key: string) {
  const code = errors[key]
  if (!code) return ''
  return t(`admin.validation.${code}`)
}
</script>

<template>
  <form class="max-w-4xl space-y-8" @submit.prevent="handleSubmit">
    <!-- Section: Basic Info -->
    <section class="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">{{ t('admin.form.basicInfo') }}</h2>

      <div class="space-y-4">
        <!-- ID (create only) -->
        <div v-if="mode === 'create'">
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('admin.form.id') }} *</label>
          <input
            v-model="form.id"
            type="text"
            class="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            :class="errors.id ? 'border-red-300' : 'border-gray-200'"
            placeholder="shinjuku-to-golden-gai"
          />
          <p class="text-xs text-gray-400 mt-1">{{ t('admin.form.idHelp') }}</p>
          <p v-if="errors.id" class="text-xs text-red-500 mt-1">{{ errorText('id') }}</p>
        </div>

        <!-- Title -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('admin.form.title') }} *</label>
          <input
            v-model="form.title"
            type="text"
            class="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            :class="errors.title ? 'border-red-300' : 'border-gray-200'"
            @blur="autoSlug"
          />
          <p v-if="errors.title" class="text-xs text-red-500 mt-1">{{ errorText('title') }}</p>
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('admin.form.description') }} *</label>
          <textarea
            v-model="form.description"
            rows="3"
            class="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            :class="errors.description ? 'border-red-300' : 'border-gray-200'"
          />
          <p v-if="errors.description" class="text-xs text-red-500 mt-1">{{ errorText('description') }}</p>
        </div>

        <!-- City + Difficulty -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('admin.form.city') }} *</label>
            <select
              v-model="form.city"
              class="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              :class="errors.city ? 'border-red-300' : 'border-gray-200'"
            >
              <option value="">{{ t('admin.form.selectCity') }}</option>
              <option v-for="c in cities" :key="c.value" :value="c.value">{{ c.label() }}</option>
            </select>
            <p v-if="errors.city" class="text-xs text-red-500 mt-1">{{ errorText('city') }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('admin.form.difficulty') }} *</label>
            <select
              v-model="form.difficulty"
              class="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              :class="errors.difficulty ? 'border-red-300' : 'border-gray-200'"
            >
              <option value="">{{ t('admin.form.selectDifficulty') }}</option>
              <option v-for="d in difficulties" :key="d.value" :value="d.value">{{ d.label() }}</option>
            </select>
            <p v-if="errors.difficulty" class="text-xs text-red-500 mt-1">{{ errorText('difficulty') }}</p>
          </div>
        </div>

        <!-- Minutes + Distance -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('admin.form.estimatedMinutes') }} *</label>
            <input
              v-model.number="form.estimatedMinutes"
              type="number"
              min="1"
              class="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              :class="errors.estimatedMinutes ? 'border-red-300' : 'border-gray-200'"
            />
            <p v-if="errors.estimatedMinutes" class="text-xs text-red-500 mt-1">{{ errorText('estimatedMinutes') }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('admin.form.distanceMeters') }} *</label>
            <input
              v-model.number="form.distanceMeters"
              type="number"
              min="1"
              class="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              :class="errors.distanceMeters ? 'border-red-300' : 'border-gray-200'"
            />
            <p v-if="errors.distanceMeters" class="text-xs text-red-500 mt-1">{{ errorText('distanceMeters') }}</p>
          </div>
        </div>

        <!-- Cover Image URL -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('admin.form.coverImage') }}</label>
          <input
            v-model="form.coverImage"
            type="url"
            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="https://..."
          />
        </div>
      </div>
    </section>

    <!-- Section: Locations -->
    <section class="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">{{ t('admin.form.location') }}</h2>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <AdminLocationPicker
            :model-value="form.start"
            :label="t('admin.form.startPoint') + ' *'"
            :other-markers="form.end.lat != null ? [{ lat: form.end.lat!, lng: form.end.lng!, label: 'End' }] : []"
            @update:model-value="form.start = $event"
          />
          <p v-if="errors.start" class="text-xs text-red-500 mt-1">{{ errorText('start') }}</p>
        </div>
        <div>
          <AdminLocationPicker
            :model-value="form.end"
            :label="t('admin.form.endPoint') + ' *'"
            :other-markers="form.start.lat != null ? [{ lat: form.start.lat!, lng: form.start.lng!, label: 'Start' }] : []"
            @update:model-value="form.end = $event"
          />
          <p v-if="errors.end" class="text-xs text-red-500 mt-1">{{ errorText('end') }}</p>
        </div>
      </div>
    </section>

    <!-- Section: Tags -->
    <section class="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <AdminTagInput v-model="form.tags" />
    </section>

    <!-- Section: Steps -->
    <section class="bg-white rounded-xl border border-gray-200 p-5 shadow-sm sm:pl-14 sm:pr-12">
      <AdminStepEditor
        v-model="form.steps"
        :errors="stepErrors"
      />
      <p v-if="errors.steps" class="text-xs text-red-500 mt-2">{{ errorText('steps') }}</p>
    </section>

    <!-- Actions -->
    <div class="flex items-center gap-3 pb-8">
      <button
        type="submit"
        :disabled="saving"
        class="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium disabled:opacity-50"
      >
        {{ saving ? t('admin.saving') : t('admin.save') }}
      </button>
      <NuxtLink
        :to="redirectTo || '/admin/routes'"
        class="px-6 py-2.5 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
      >
        {{ t('admin.cancel') }}
      </NuxtLink>
    </div>
  </form>
</template>
