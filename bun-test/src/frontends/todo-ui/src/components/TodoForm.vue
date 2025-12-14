<script setup lang="ts">
import { ref } from 'vue'

type ThemeClasses = {
  buttonGradient: string
  inputFocus: string
}

const props = defineProps<{
  show: boolean
  loading?: boolean
  themeClasses?: ThemeClasses
}>()

const emit = defineEmits<{
  create: [data: { title: string; description: string }]
  cancel: []
}>()

const title = ref('')
const description = ref('')

const handleSubmit = () => {
  if (!title.value.trim()) {
    return
  }

  emit('create', {
    title: title.value.trim(),
    description: description.value.trim()
  })

  // Clear form
  title.value = ''
  description.value = ''
}

const handleCancel = () => {
  title.value = ''
  description.value = ''
  emit('cancel')
}

const handleBackdropClick = (e: MouseEvent) => {
  if (e.target === e.currentTarget) {
    handleCancel()
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="show"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        @click="handleBackdropClick"
      >
        <Transition name="scale">
          <div
            v-if="show"
            class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-8 border border-white/20 dark:border-slate-700/20"
          >
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-3">
                <div :class="`w-10 h-10 ${props.themeClasses?.buttonGradient || 'bg-gradient-to-br from-indigo-500 to-purple-600'} rounded-xl flex items-center justify-center shadow-lg`">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h2 class="text-2xl font-bold text-slate-800 dark:text-slate-200">Add New Todo</h2>
              </div>
              <button
                @click="handleCancel"
                class="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                :disabled="loading"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form @submit.prevent="handleSubmit" class="space-y-5">
              <div>
                <label for="title" class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Title <span class="text-red-500 dark:text-red-400">*</span>
                </label>
                <input
                  id="title"
                  v-model="title"
                  type="text"
                  required
                  :class="`w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 ${props.themeClasses?.inputFocus || 'focus:ring-indigo-500 focus:border-indigo-500'} transition-all bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 disabled:bg-slate-50 dark:disabled:bg-slate-900 disabled:cursor-not-allowed`"
                  placeholder="What needs to be done?"
                  :disabled="loading"
                  autofocus
                />
              </div>
              <div>
                <label for="description" class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  v-model="description"
                  rows="3"
                  :class="`w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 ${props.themeClasses?.inputFocus || 'focus:ring-indigo-500 focus:border-indigo-500'} transition-all bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 resize-none disabled:bg-slate-50 dark:disabled:bg-slate-900 disabled:cursor-not-allowed`"
                  placeholder="Add any additional details..."
                  :disabled="loading"
                ></textarea>
              </div>
              <button
                type="submit"
                :disabled="loading || !title.trim()"
                :class="`w-full ${props.themeClasses?.buttonGradient || 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'} text-white py-3.5 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]`"
              >
                <span v-if="loading" class="flex items-center justify-center gap-2">
                  <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding...
                </span>
                <span v-else class="flex items-center justify-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Todo
                </span>
              </button>
            </form>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-enter-active,
.scale-leave-active {
  transition: all 0.2s ease;
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>