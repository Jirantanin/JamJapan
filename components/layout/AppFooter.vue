<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <footer class="bg-gray-900 text-gray-300 mt-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="flex flex-col md:flex-row justify-between gap-8">
        <!-- Brand -->
        <div class="max-w-sm">
          <div class="flex items-center gap-2 mb-3">
            <span class="text-2xl">⛩️</span>
            <span class="text-xl font-bold text-white">JamJapan</span>
          </div>
          <p class="text-sm text-gray-400">
            {{ t('footer.description') }}
          </p>
        </div>

        <!-- Links -->
        <div class="flex gap-12">
          <div>
            <h3 class="text-white font-medium mb-3">{{ t('nav.routes') }}</h3>
            <ul class="space-y-2 text-sm">
              <li>
                <NuxtLink to="/routes" class="hover:text-white transition-colors">
                  {{ t('route.allRoutes') }}
                </NuxtLink>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="border-t border-gray-800 mt-8 pt-8 text-sm text-gray-500 text-center">
        {{ t('footer.copyright') }}
      </div>
    </div>
  </footer>
</template>
