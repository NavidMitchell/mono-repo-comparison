<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

type Theme = 'purple' | 'blue' | 'green' | 'orange' | 'rose'

const props = defineProps<{
  theme: Theme
}>()

const emit = defineEmits<{
  'update:theme': [theme: Theme]
}>()

const isOpen = ref(false)

const themes: { name: Theme; label: string; colors: { primary: string; secondary: string; gradient: string } }[] = [
  {
    name: 'purple',
    label: 'Purple',
    colors: {
      primary: 'indigo',
      secondary: 'purple',
      gradient: 'from-indigo-600 via-purple-600 to-pink-600'
    }
  },
  {
    name: 'blue',
    label: 'Blue',
    colors: {
      primary: 'blue',
      secondary: 'cyan',
      gradient: 'from-blue-600 via-cyan-600 to-teal-600'
    }
  },
  {
    name: 'green',
    label: 'Green',
    colors: {
      primary: 'emerald',
      secondary: 'teal',
      gradient: 'from-emerald-600 via-teal-600 to-green-600'
    }
  },
  {
    name: 'orange',
    label: 'Orange',
    colors: {
      primary: 'orange',
      secondary: 'amber',
      gradient: 'from-orange-600 via-amber-600 to-yellow-600'
    }
  },
  {
    name: 'rose',
    label: 'Rose',
    colors: {
      primary: 'rose',
      secondary: 'pink',
      gradient: 'from-rose-600 via-pink-600 to-red-600'
    }
  }
]

const selectTheme = (theme: Theme) => {
  emit('update:theme', theme)
  isOpen.value = false
}

// Close on outside click
const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('.theme-picker-container')) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

watch(isOpen, (newValue) => {
  if (newValue) {
    document.addEventListener('click', handleClickOutside)
  } else {
    document.removeEventListener('click', handleClickOutside)
  }
})
</script>

<template>
  <div class="theme-picker-container fixed right-4 top-4 z-40">
    <!-- Toggle Button -->
    <button
      @click.stop="isOpen = !isOpen"
      class="w-12 h-12 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl border-2 border-white/20 dark:border-slate-700/20 hover:border-indigo-300 dark:hover:border-indigo-600 flex items-center justify-center transition-all duration-200 hover:scale-110"
    >
      <svg class="w-6 h-6 text-slate-700 dark:text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    </button>

        <!-- Theme Options -->
    <Transition name="slide-left">
      <div
        v-if="isOpen"
        class="absolute right-0 top-14 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-2xl p-4 border border-white/20 dark:border-slate-700/20 min-w-[180px]"
        style="max-width: calc(100vw - 2rem)"
      >
        <div class="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Choose Theme</div>
        <div class="space-y-2">
          <button
            v-for="themeOption in themes"
            :key="themeOption.name"
            @click.stop="selectTheme(themeOption.name)"
            class="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            :class="{ 'bg-slate-100 dark:bg-slate-700': theme === themeOption.name }"
          >
            <div
              class="w-8 h-8 rounded-lg flex-shrink-0"
              :class="`bg-gradient-to-br ${themeOption.colors.gradient}`"
            ></div>
            <span class="text-sm font-medium text-slate-700 dark:text-slate-200">{{ themeOption.label }}</span>
            <svg
              v-if="theme === themeOption.name"
              class="w-4 h-4 text-slate-600 dark:text-slate-300 ml-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.2s ease;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(10px);
}
</style>