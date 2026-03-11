<script setup lang="ts">
useHead({ title: 'API Documentation — JamJapan' })

const endpoints = [
  { method: 'GET', path: '/api/routes', desc: 'List routes' },
  { method: 'POST', path: '/api/routes', desc: 'Create route' },
  { method: 'GET', path: '/api/routes/:id', desc: 'Get route' },
  { method: 'PUT', path: '/api/routes/:id', desc: 'Update route' },
  { method: 'DELETE', path: '/api/routes/:id', desc: 'Delete route' },
  { method: 'GET', path: '/api/routes/:id/reviews', desc: 'List reviews' },
  { method: 'POST', path: '/api/routes/:id/reviews', desc: 'Create review' },
  { method: 'PUT', path: '/api/reviews/:id', desc: 'Update review' },
  { method: 'DELETE', path: '/api/reviews/:id', desc: 'Delete review' },
  { method: 'POST', path: '/api/routes/:id/save', desc: 'Toggle save' },
  { method: 'GET', path: '/api/my/routes', desc: "User's routes" },
  { method: 'GET', path: '/api/my/saved-routes', desc: 'Saved routes' },
  { method: 'GET', path: '/api/route-requests', desc: 'List requests' },
  { method: 'POST', path: '/api/route-requests', desc: 'Create request' },
  { method: 'POST', path: '/api/route-requests/:id/vote', desc: 'Toggle vote' },
  { method: 'GET', path: '/api/cities', desc: 'List cities' },
]

function methodClass(m: string) {
  return {
    GET: 'bg-green-100 text-green-700',
    POST: 'bg-blue-100 text-blue-700',
    PUT: 'bg-yellow-100 text-yellow-700',
    DELETE: 'bg-red-100 text-red-700',
  }[m] ?? 'bg-gray-100 text-gray-700'
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-12">
    <h1 class="text-3xl font-bold text-gray-900 mb-2">API Documentation</h1>
    <p class="text-gray-600 mb-8">JamJapan REST API — เส้นทางเดินเท้าในญี่ปุ่น</p>

    <div class="grid gap-4 sm:grid-cols-2 mb-10">
      <a
        href="/_openapi.json"
        target="_blank"
        class="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-primary-400 hover:bg-primary-50 transition-colors"
      >
        <span class="text-2xl">📄</span>
        <div>
          <p class="font-semibold text-gray-800">OpenAPI JSON</p>
          <p class="text-sm text-gray-500">Raw OpenAPI 3.0 spec</p>
        </div>
      </a>
      <a
        href="/_swagger"
        target="_blank"
        class="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-primary-400 hover:bg-primary-50 transition-colors"
      >
        <span class="text-2xl">🔍</span>
        <div>
          <p class="font-semibold text-gray-800">Swagger UI</p>
          <p class="text-sm text-gray-500">Interactive API explorer</p>
        </div>
      </a>
    </div>

    <h2 class="text-xl font-semibold text-gray-800 mb-4">Endpoints</h2>
    <div class="space-y-2 text-sm">
      <div
        v-for="ep in endpoints"
        :key="ep.path"
        class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg font-mono"
      >
        <span :class="methodClass(ep.method)" class="px-2 py-0.5 rounded text-xs font-bold uppercase">
          {{ ep.method }}
        </span>
        <span class="text-gray-700">{{ ep.path }}</span>
        <span class="ml-auto text-gray-400 font-sans">{{ ep.desc }}</span>
      </div>
    </div>
  </div>
</template>
