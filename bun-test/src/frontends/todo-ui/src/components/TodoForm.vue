<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  loading?: boolean
}>()

const emit = defineEmits<{
  create: [data: { title: string; description: string }]
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
</script>

<template>
  <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-6 border border-white/20">
    <div class="flex items-center gap-3 mb-6">
      <div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
      </div>
      <h2 class="text-2xl font-bold text-slate-800">Add New Todo</h2>
    </div>
    <form @submit.prevent="handleSubmit" class="space-y-5">
      <div>
        <label for="title" class="block text-sm font-semibold text-slate-700 mb-2">
          Title <span class="text-red-500">*</span>
        </label>
        <input
          id="title"
          v-model="title"
          type="text"
          required
          class="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white text-slate-800 placeholder-slate-400 disabled:bg-slate-50 disabled:cursor-not-allowed"
          placeholder="What needs to be done?"
          :disabled="loading"
        />
      </div>
      <div>
        <label for="description" class="block text-sm font-semibold text-slate-700 mb-2">
          Description
        </label>
        <textarea
          id="description"
          v-model="description"
          rows="3"
          class="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white text-slate-800 placeholder-slate-400 resize-none disabled:bg-slate-50 disabled:cursor-not-allowed"
          placeholder="Add any additional details..."
          :disabled="loading"
        ></textarea>
      </div>
      <button
        type="submit"
        :disabled="loading || !title.trim()"
        class="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
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
</template>