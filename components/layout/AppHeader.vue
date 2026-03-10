<script setup lang="ts">
const { t } = useI18n()
const { loggedIn, user, clear: logout } = useUserSession()

const mobileMenuOpen = ref(false)
const userMenuOpen = ref(false)

async function handleLogout() {
  await logout()
  userMenuOpen.value = false
  navigateTo('/')
}
</script>

<template>
  <header class="bg-white shadow-sm sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2">
          <span class="text-2xl">⛩️</span>
          <span class="text-xl font-bold text-primary-600">JamJapan</span>
        </NuxtLink>

        <!-- Desktop Nav -->
        <nav class="hidden md:flex items-center gap-6">
          <NuxtLink
            to="/"
            class="text-gray-600 hover:text-primary-600 transition-colors font-medium"
          >
            {{ t('nav.home') }}
          </NuxtLink>
          <NuxtLink
            to="/routes"
            class="text-gray-600 hover:text-primary-600 transition-colors font-medium"
          >
            {{ t('nav.routes') }}
          </NuxtLink>
          <NuxtLink
            to="/route-requests"
            class="text-gray-600 hover:text-primary-600 transition-colors font-medium"
          >
            คำขอเส้นทาง
          </NuxtLink>

          <!-- Auth: Login or User menu -->
          <div v-if="loggedIn && user" class="relative">
            <button
              class="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
              @click="userMenuOpen = !userMenuOpen"
            >
              <img
                v-if="user.avatar"
                :src="user.avatar as string"
                :alt="user.name as string"
                class="w-8 h-8 rounded-full border-2 border-gray-200"
              />
              <span v-else class="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-bold">
                {{ (user.name as string)?.charAt(0) || '?' }}
              </span>
            </button>

            <!-- Dropdown menu -->
            <div
              v-if="userMenuOpen"
              class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50"
            >
              <div class="px-4 py-2 border-b border-gray-100">
                <p class="text-sm font-medium text-gray-900 truncate">{{ user.name }}</p>
                <p class="text-xs text-gray-500 truncate">{{ user.email }}</p>
              </div>
              <NuxtLink
                to="/my/routes"
                class="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary-600"
                @click="userMenuOpen = false"
              >
                เส้นทางของฉัน
              </NuxtLink>
              <NuxtLink
                to="/routes/create"
                class="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary-600"
                @click="userMenuOpen = false"
              >
                สร้างเส้นทาง
              </NuxtLink>
              <NuxtLink
                v-if="user.role === 'ADMIN'"
                to="/admin"
                class="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary-600"
                @click="userMenuOpen = false"
              >
                {{ t('nav.admin') }}
              </NuxtLink>
              <button
                class="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary-600"
                @click="handleLogout"
              >
                ออกจากระบบ
              </button>
            </div>
          </div>

          <a
            v-else
            href="/api/auth/google"
            class="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0012.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z" />
            </svg>
            เข้าสู่ระบบ
          </a>
        </nav>

        <!-- Mobile menu button -->
        <button
          class="md:hidden p-2 rounded-md text-gray-600 hover:text-primary-600"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              v-if="!mobileMenuOpen"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
            <path
              v-else
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Mobile Nav -->
      <nav v-if="mobileMenuOpen" class="md:hidden pb-4 space-y-2">
        <NuxtLink
          to="/"
          class="block px-3 py-2 rounded-md text-gray-600 hover:bg-primary-50 hover:text-primary-600"
          @click="mobileMenuOpen = false"
        >
          {{ t('nav.home') }}
        </NuxtLink>
        <NuxtLink
          to="/routes"
          class="block px-3 py-2 rounded-md text-gray-600 hover:bg-primary-50 hover:text-primary-600"
          @click="mobileMenuOpen = false"
        >
          {{ t('nav.routes') }}
        </NuxtLink>
        <NuxtLink
          to="/route-requests"
          class="block px-3 py-2 rounded-md text-gray-600 hover:bg-primary-50 hover:text-primary-600"
          @click="mobileMenuOpen = false"
        >
          คำขอเส้นทาง
        </NuxtLink>

        <!-- Mobile Auth -->
        <div v-if="loggedIn && user" class="border-t border-gray-100 pt-2 mt-2">
          <div class="flex items-center gap-3 px-3 py-2">
            <img
              v-if="user.avatar"
              :src="user.avatar as string"
              :alt="user.name as string"
              class="w-8 h-8 rounded-full"
            />
            <div>
              <p class="text-sm font-medium text-gray-900">{{ user.name }}</p>
              <p class="text-xs text-gray-500">{{ user.email }}</p>
            </div>
          </div>
          <NuxtLink
            to="/my/routes"
            class="block px-3 py-2 rounded-md text-gray-600 hover:bg-primary-50 hover:text-primary-600"
            @click="mobileMenuOpen = false"
          >
            เส้นทางของฉัน
          </NuxtLink>
          <NuxtLink
            to="/routes/create"
            class="block px-3 py-2 rounded-md text-gray-600 hover:bg-primary-50 hover:text-primary-600"
            @click="mobileMenuOpen = false"
          >
            สร้างเส้นทาง
          </NuxtLink>
          <NuxtLink
            v-if="user.role === 'ADMIN'"
            to="/admin"
            class="block px-3 py-2 rounded-md text-gray-600 hover:bg-primary-50 hover:text-primary-600"
            @click="mobileMenuOpen = false"
          >
            {{ t('nav.admin') }}
          </NuxtLink>
          <button
            class="block w-full text-left px-3 py-2 rounded-md text-gray-600 hover:bg-primary-50 hover:text-primary-600"
            @click="handleLogout(); mobileMenuOpen = false"
          >
            ออกจากระบบ
          </button>
        </div>
        <a
          v-else
          href="/api/auth/google"
          class="block px-3 py-2 rounded-md text-primary-600 font-medium hover:bg-primary-50"
          @click="mobileMenuOpen = false"
        >
          เข้าสู่ระบบด้วย Google
        </a>
      </nav>
    </div>
  </header>
</template>
