<script setup lang="ts">
const { t } = useI18n()

const mobileMenuOpen = ref(false)
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
      </nav>
    </div>
  </header>
</template>
