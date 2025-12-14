<script setup lang="ts">
import { ref, watch } from 'vue'
import { Todo } from 'bun-test-structures'
import ConfirmDialog from './ConfirmDialog.vue'

const props = defineProps<{
  todo: Todo
  loading?: boolean
  isEditing?: boolean
}>()

const emit = defineEmits<{
  toggle: [todo: Todo]
  edit: [todo: Todo]
  save: [todo: Todo]
  cancel: []
  delete: [id: string]
}>()

const editTitle = ref(props.todo.title)
const editDescription = ref(props.todo.description || '')
const showDeleteConfirm = ref(false)

// Watch for prop changes when todo is updated
watch(() => props.todo, (newTodo) => {
  editTitle.value = newTodo.title
  editDescription.value = newTodo.description || ''
}, { deep: true })

const handleToggle = () => {
  emit('toggle', props.todo)
}

const handleEdit = () => {
  emit('edit', props.todo)
}

const handleSave = () => {
  if (!editTitle.value.trim()) {
    return
  }

  const updatedTodo = { ...props.todo }
  updatedTodo.title = editTitle.value.trim()
  updatedTodo.description = editDescription.value.trim()
  emit('save', updatedTodo)
}

const handleCancel = () => {
  // Reset edit values
  editTitle.value = props.todo.title
  editDescription.value = props.todo.description || ''
  emit('cancel')
}

const handleDeleteClick = () => {
  showDeleteConfirm.value = true
}

const handleDeleteConfirm = () => {
  if (props.todo.id) {
    emit('delete', props.todo.id)
  }
  showDeleteConfirm.value = false
}

const handleDeleteCancel = () => {
  showDeleteConfirm.value = false
}
</script>

<template>
  <div class="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 border border-white/20 hover:border-indigo-200/50" :class="{ 'opacity-75': todo.completed }">
    <!-- Editing mode -->
    <div v-if="isEditing" class="space-y-4">
      <input
        v-model="editTitle"
        type="text"
        class="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white text-slate-800 font-medium"
        placeholder="Todo title"
        :disabled="loading"
      />
      <textarea
        v-model="editDescription"
        rows="3"
        class="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white text-slate-700 resize-none"
        placeholder="Add description..."
        :disabled="loading"
      ></textarea>
      <div class="flex gap-3">
        <button
          @click="handleSave"
          :disabled="loading || !editTitle.trim()"
          class="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-2.5 px-5 rounded-xl font-semibold shadow-md hover:shadow-lg hover:from-emerald-600 hover:to-teal-700 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          Save
        </button>
        <button
          @click="handleCancel"
          :disabled="loading"
          class="flex-1 bg-slate-100 text-slate-700 py-2.5 px-5 rounded-xl font-semibold hover:bg-slate-200 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Cancel
        </button>
      </div>
    </div>

    <!-- View mode -->
    <div v-else class="flex items-start gap-4">
      <div class="flex-shrink-0 pt-1 relative group">
        <input
          type="checkbox"
          :checked="todo.completed"
          @change="handleToggle"
          :disabled="loading"
          class="w-6 h-6 text-indigo-600 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer disabled:cursor-not-allowed transition-all hover:border-indigo-600 hover:bg-indigo-100 hover:ring-2 hover:ring-indigo-300 hover:shadow-lg peer relative"
        />
        <!-- Hover checkmark -->
        <svg
          v-if="!todo.completed"
          class="absolute top-2 left-1 w-4 h-4 text-indigo-600 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div class="flex-1 min-w-0">
        <h3
          :class="[
            'text-lg font-bold mb-1.5 transition-all',
            todo.completed ? 'line-through text-slate-400' : 'text-slate-800'
          ]"
        >
          {{ todo.title }}
        </h3>
        <p
          v-if="todo.description"
          :class="[
            'text-slate-600 mb-4 text-sm leading-relaxed',
            todo.completed && 'line-through text-slate-400'
          ]"
        >
          {{ todo.description }}
        </p>
        <div class="flex gap-2">
          <button
            @click="handleEdit"
            :disabled="loading"
            class="bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-2 px-4 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg hover:from-indigo-600 hover:to-purple-700 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center gap-1.5"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          <button
            @click="handleDeleteClick"
            :disabled="loading"
            class="bg-gradient-to-r from-red-500 to-rose-600 text-white py-2 px-4 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg hover:from-red-600 hover:to-rose-700 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center gap-1.5"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <ConfirmDialog
      :show="showDeleteConfirm"
      title="Delete Todo"
      message="Are you sure you want to delete this todo? This action cannot be undone."
      confirm-text="Delete"
      cancel-text="Cancel"
      confirm-color="red"
      @confirm="handleDeleteConfirm"
      @cancel="handleDeleteCancel"
    />
  </div>
</template>