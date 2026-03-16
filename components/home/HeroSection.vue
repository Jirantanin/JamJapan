<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <section class="relative text-white overflow-hidden">
    <!-- Background Image -->
    <img
      src="/images/generated/hero-bg.jpg"
      alt=""
      class="absolute inset-0 w-full h-full object-cover"
    />
    <div class="absolute inset-0 bg-gradient-to-br from-primary-900/70 via-primary-800/60 to-primary-700/50" />

    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
      <div class="text-center max-w-3xl mx-auto">
        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
          {{ t('hero.title') }}
          <br>
          <span class="text-sakura-300">{{ t('hero.subtitle') }}</span>
        </h1>
        <p class="mt-6 text-lg sm:text-xl text-primary-100 max-w-2xl mx-auto">
          {{ t('hero.description') }}
        </p>

        <!-- Search -->
        <div class="mt-10 flex justify-center">
          <CommonSearchBar />
        </div>

        <!-- CTA -->
        <div class="mt-8">
          <NuxtLink
            to="/routes"
            class="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-700 font-semibold rounded-full hover:bg-primary-50 transition-colors shadow-lg"
          >
            {{ t('hero.cta') }}
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>
