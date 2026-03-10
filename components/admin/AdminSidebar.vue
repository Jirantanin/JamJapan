<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const { user } = useUserSession()

const sidebarOpen = ref(false)

const navItems = [
  { to: '/admin', label: () => t('admin.dashboard'), icon: '📊' },
  { to: '/admin/routes', label: () => t('admin.routeManagement'), icon: '🗺️' },
  { to: '/admin/route-requests', label: () => t('admin.routeRequests'), icon: '📬' },
]

function isActive(path: string) {
  if (path === '/admin') return route.path === '/admin'
  return route.path.startsWith(path)
}
</script>

<template>
  <!-- Mobile toggle button -->
  <button
    class="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md text-gray-600 hover:text-primary-600"
    @click="sidebarOpen = !sidebarOpen"
  >
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path v-if="!sidebarOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  </button>

  <!-- Overlay (mobile) -->
  <div
    v-if="sidebarOpen"
    class="lg:hidden fixed inset-0 bg-black/50 z-40"
    @click="sidebarOpen = false"
  />

  <!-- Sidebar -->
  <aside
    class="fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-40 flex flex-col transition-transform duration-200"
    :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
  >
    <!-- Logo -->
    <div class="px-6 py-5 border-b border-gray-100">
      <NuxtLink to="/admin" class="flex items-center gap-2" @click="sidebarOpen = false">
        <span class="text-2xl">⛩️</span>
        <span class="text-xl font-bold text-primary-600">JamJapan</span>
      </NuxtLink>
      <p class="text-xs text-gray-400 mt-1">{{ t('admin.panel') }}</p>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-3 py-4 space-y-1">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
        :class="isActive(item.to)
          ? 'bg-primary-50 text-primary-700'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
        @click="sidebarOpen = false"
      >
        <span>{{ item.icon }}</span>
        <span>{{ item.label() }}</span>
      </NuxtLink>
    </nav>

    <!-- User info -->
    <div class="px-4 py-4 border-t border-gray-100">
      <div class="flex items-center gap-3">
        <img
          v-if="user?.avatar"
          :src="user.avatar as string"
          :alt="user.name as string"
          class="w-8 h-8 rounded-full"
        />
        <span v-else class="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-bold">
          {{ (user?.name as string)?.charAt(0) || '?' }}
        </span>
        <div class="min-w-0">
          <p class="text-sm font-medium text-gray-900 truncate">{{ user?.name }}</p>
          <p class="text-xs text-gray-500 truncate">Admin</p>
        </div>
      </div>
    </div>
  </aside>
</template>
