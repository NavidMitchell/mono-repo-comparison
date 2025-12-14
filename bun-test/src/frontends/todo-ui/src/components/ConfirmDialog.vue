<script setup lang="ts">
const props = defineProps<{
  show: boolean
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmColor?: 'red' | 'blue' | 'green'
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const confirmColorClasses = {
  red: 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700',
  blue: 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700',
  green: 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700'
}

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
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
            class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-white/20 dark:border-slate-700/20"
          >
            <!-- Icon -->
            <div class="flex justify-center mb-4">
              <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <svg class="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>

            <!-- Title -->
            <h3 v-if="title" class="text-xl font-bold text-slate-800 dark:text-slate-200 text-center mb-3">
              {{ title }}
            </h3>

            <!-- Message -->
            <p class="text-slate-600 dark:text-slate-400 text-center mb-6">
              {{ message }}
            </p>

            <!-- Actions -->
            <div class="flex gap-3">
              <button
                @click="handleCancel"
                class="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 py-2.5 px-5 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {{ cancelText || 'Cancel' }}
              </button>
              <button
                @click="handleConfirm"
                :class="[
                  'flex-1 text-white py-2.5 px-5 rounded-xl font-semibold shadow-md hover:shadow-lg disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]',
                  confirmColorClasses[confirmColor || 'red']
                ]"
              >
                {{ confirmText || 'Confirm' }}
              </button>
            </div>
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