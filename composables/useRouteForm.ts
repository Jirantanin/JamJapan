import type { Route } from '~/types/route'

export interface StepFormData {
  order: number
  instruction: string
  image: string
  location: { lat: number | null; lng: number | null; name?: string }
  distanceFromPrev: number | null
  note: string
}

export interface RouteFormState {
  id: string
  title: string
  description: string
  city: string
  difficulty: string
  estimatedMinutes: number | null
  distanceMeters: number | null
  coverImage: string
  start: { lat: number | null; lng: number | null; name?: string }
  end: { lat: number | null; lng: number | null; name?: string }
  tags: string[]
  steps: StepFormData[]
}

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const CITIES = ['tokyo', 'osaka', 'kyoto', 'nara', 'fukuoka', 'sapporo', 'hiroshima', 'other']
const DIFFICULTIES = ['easy', 'medium', 'hard']

function createEmptyState(): RouteFormState {
  return {
    id: '',
    title: '',
    description: '',
    city: '',
    difficulty: '',
    estimatedMinutes: null,
    distanceMeters: null,
    coverImage: '',
    start: { lat: null, lng: null },
    end: { lat: null, lng: null },
    tags: [],
    steps: [
      {
        order: 1,
        instruction: '',
        image: '',
        location: { lat: null, lng: null },
        distanceFromPrev: null,
        note: '',
      },
    ],
  }
}

function fromRoute(route: Route): RouteFormState {
  return {
    id: route.id,
    title: route.title,
    description: route.description,
    city: route.city,
    difficulty: route.difficulty,
    estimatedMinutes: route.estimatedMinutes,
    distanceMeters: route.distanceMeters,
    coverImage: route.coverImage || '',
    start: { lat: route.start.lat, lng: route.start.lng, name: route.start.name },
    end: { lat: route.end.lat, lng: route.end.lng, name: route.end.name },
    tags: route.tags || [],
    steps: route.steps.map(s => ({
      order: s.order,
      instruction: s.instruction,
      image: s.image || '',
      location: { lat: s.location.lat, lng: s.location.lng, name: s.location.name },
      distanceFromPrev: s.distanceFromPrev ?? null,
      note: s.note || '',
    })),
  }
}

export function useRouteForm(mode: 'create' | 'edit', initialRoute?: Route) {
  const form = reactive<RouteFormState>(
    initialRoute ? fromRoute(initialRoute) : createEmptyState()
  )

  const errors = reactive<Record<string, string>>({})
  const stepErrors = ref<Record<string, string>[]>([])
  const saving = ref(false)

  function clearErrors() {
    Object.keys(errors).forEach(key => delete errors[key])
    stepErrors.value = []
  }

  function validate(): boolean {
    clearErrors()
    let valid = true

    // Basic info
    if (mode === 'create') {
      if (!form.id) {
        errors.id = 'required'
        valid = false
      } else if (!SLUG_REGEX.test(form.id)) {
        errors.id = 'invalidSlug'
        valid = false
      }
    }

    if (!form.title.trim()) { errors.title = 'required'; valid = false }
    if (!form.description.trim()) { errors.description = 'required'; valid = false }
    if (!form.city || !CITIES.includes(form.city)) { errors.city = 'required'; valid = false }
    if (!form.difficulty || !DIFFICULTIES.includes(form.difficulty)) { errors.difficulty = 'required'; valid = false }

    if (!form.estimatedMinutes || form.estimatedMinutes <= 0) {
      errors.estimatedMinutes = 'positiveNumber'; valid = false
    }
    if (!form.distanceMeters || form.distanceMeters <= 0) {
      errors.distanceMeters = 'positiveNumber'; valid = false
    }

    // Locations
    if (form.start.lat == null || form.start.lng == null) {
      errors.start = 'selectLocation'; valid = false
    }
    if (form.end.lat == null || form.end.lng == null) {
      errors.end = 'selectLocation'; valid = false
    }

    // Steps
    if (form.steps.length === 0) {
      errors.steps = 'minSteps'; valid = false
    }

    const sErrors: Record<string, string>[] = []
    form.steps.forEach((step, i) => {
      const se: Record<string, string> = {}
      if (!step.instruction.trim()) { se.instruction = 'required'; valid = false }
      if (step.location.lat == null || step.location.lng == null) {
        se.location = 'selectLocation'; valid = false
      }
      sErrors.push(se)
    })
    stepErrors.value = sErrors

    return valid
  }

  function toCreatePayload() {
    return {
      id: form.id,
      title: form.title,
      description: form.description,
      city: form.city,
      difficulty: form.difficulty,
      estimatedMinutes: form.estimatedMinutes!,
      distanceMeters: form.distanceMeters!,
      coverImage: form.coverImage || null,
      start: { lat: form.start.lat!, lng: form.start.lng!, name: form.start.name },
      end: { lat: form.end.lat!, lng: form.end.lng!, name: form.end.name },
      tags: form.tags,
      steps: form.steps.map((s, i) => ({
        order: i + 1,
        instruction: s.instruction,
        image: s.image || null,
        location: { lat: s.location.lat!, lng: s.location.lng!, name: s.location.name },
        distanceFromPrev: s.distanceFromPrev,
        note: s.note || null,
      })),
    }
  }

  function toUpdatePayload() {
    return {
      title: form.title,
      description: form.description,
      city: form.city,
      difficulty: form.difficulty,
      estimatedMinutes: form.estimatedMinutes!,
      distanceMeters: form.distanceMeters!,
      coverImage: form.coverImage || null,
      start: { lat: form.start.lat!, lng: form.start.lng!, name: form.start.name },
      end: { lat: form.end.lat!, lng: form.end.lng!, name: form.end.name },
      tags: form.tags,
      steps: form.steps.map((s, i) => ({
        order: i + 1,
        instruction: s.instruction,
        image: s.image || null,
        location: { lat: s.location.lat!, lng: s.location.lng!, name: s.location.name },
        distanceFromPrev: s.distanceFromPrev,
        note: s.note || null,
      })),
    }
  }

  function slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  return {
    form,
    errors,
    stepErrors,
    saving,
    validate,
    clearErrors,
    toCreatePayload,
    toUpdatePayload,
    slugify,
  }
}
