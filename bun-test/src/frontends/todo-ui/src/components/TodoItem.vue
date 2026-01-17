<script setup lang="ts">
import { ref, watch } from 'vue'
import { Todo } from 'bun-test-structures'
import ConfirmDialog from './ConfirmDialog.vue'

type ThemeClasses = {
  buttonGradient?: string
  editButtonGradient?: string
  inputFocus: string
  checkboxColor: string
  checkboxHover: string
  checkboxRing: string
  borderHover: string
}

const props = defineProps<{
  todo: Todo
  loading?: boolean
  isEditing?: boolean
  themeClasses?: ThemeClasses
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
const editCompleted = ref(props.todo.completed || false)
const showDeleteConfirm = ref(false)
const isExpanded = ref(false)

// Watch for prop changes when todo is updated
watch(() => props.todo, (newTodo) => {
  editTitle.value = newTodo.title
  editDescription.value = newTodo.description || ''
  editCompleted.value = newTodo.completed || false
}, { deep: true })

// Collapse when editing starts
watch(() => props.isEditing, (editing) => {
  if (editing) {
    isExpanded.value = false
  }
})

const handleToggle = (e?: Event) => {
  if (e) {
    e.stopPropagation() // Prevent expanding when toggling checkbox
  }
  emit('toggle', props.todo)
}

const handleTodoClick = () => {
  if (!props.isEditing) {
    isExpanded.value = !isExpanded.value
  }
}

const handleEdit = (e?: Event) => {
  if (e) {
    e.stopPropagation() // Prevent expanding when clicking edit
  }
  isExpanded.value = false // Collapse when editing
  emit('edit', props.todo)
}

const handleSave = () => {
  if (!editTitle.value.trim()) {
    return
  }

  const updatedTodo = { ...props.todo }
  updatedTodo.title = editTitle.value.trim()
  updatedTodo.description = editDescription.value.trim()
  updatedTodo.completed = editCompleted.value
  emit('save', updatedTodo)
}

const handleCancel = () => {
  // Reset edit values
  editTitle.value = props.todo.title
  editDescription.value = props.todo.description || ''
  editCompleted.value = props.todo.completed || false
  emit('cancel')
}

const handleDeleteClick = (e?: Event) => {
  if (e) {
    e.stopPropagation() // Prevent expanding when clicking delete
  }
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
  <div 
    :class="[
      'bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border border-white/20 dark:border-slate-700/20 cursor-pointer',
      props.themeClasses?.borderHover || 'hover:border-indigo-200/50 dark:hover:border-indigo-700/50',
      { 'opacity-75': todo.completed },
      { 'p-4': !isExpanded && !isEditing, 'p-6': isExpanded || isEditing }
    ]"
    @click="handleTodoClick"
  >
    <!-- Editing mode -->
    <div v-if="isEditing" class="space-y-4">
      <input
        v-model="editTitle"
        type="text"
        :class="`w-full px-4 py-3 border-2 border-indigo-200 dark:border-slate-700 rounded-xl focus:ring-2 ${props.themeClasses?.inputFocus || 'focus:ring-indigo-500 focus:border-indigo-500'} transition-all bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium`"
        placeholder="Todo title"
        :disabled="loading"
      />
      <textarea
        v-model="editDescription"
        rows="3"
        :class="`w-full px-4 py-3 border-2 border-indigo-200 dark:border-slate-700 rounded-xl focus:ring-2 ${props.themeClasses?.inputFocus || 'focus:ring-indigo-500 focus:border-indigo-500'} transition-all bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 resize-none`"
        placeholder="Add description..."
        :disabled="loading"
      ></textarea>
      <!-- Completed checkbox -->
      <div class="flex items-center gap-3">
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            v-model="editCompleted"
            :disabled="loading"
            :class="`w-5 h-5 ${props.themeClasses?.checkboxColor || 'text-indigo-600'} border-2 border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 ${props.themeClasses?.checkboxRing || 'focus:ring-indigo-500'} focus:ring-offset-2 dark:focus:ring-offset-slate-800 cursor-pointer disabled:cursor-not-allowed transition-all ${props.themeClasses?.checkboxHover || 'hover:border-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:ring-2 hover:ring-indigo-300 dark:hover:ring-indigo-600'}`"
          />
          <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Completed</span>
        </label>
      </div>
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
          class="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 py-2.5 px-5 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Cancel
        </button>
      </div>
    </div>

    <!-- View mode -->
    <div v-else class="flex items-start gap-4">
      <div class="flex-shrink-0 pt-1 relative group" @click.stop>
        <input
          type="checkbox"
          :checked="todo.completed"
          @change="handleToggle"
          :disabled="loading"
          :class="`w-6 h-6 ${props.themeClasses?.checkboxColor || 'text-indigo-600'} border-2 border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 ${props.themeClasses?.checkboxRing || 'focus:ring-indigo-500'} focus:ring-offset-2 dark:focus:ring-offset-slate-800 cursor-pointer disabled:cursor-not-allowed transition-all ${props.themeClasses?.checkboxHover || 'hover:border-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:ring-2 hover:ring-indigo-300 dark:hover:ring-indigo-600'} hover:shadow-lg peer relative`"
        />
        <!-- Hover checkmark -->
        <svg
          v-if="!todo.completed"
          :class="`absolute top-2 left-1 w-4 h-4 ${props.themeClasses?.checkboxColor || 'text-indigo-600'} opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity`"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-2">
          <h3
          :class="[
            'text-lg font-bold transition-all flex-1',
            todo.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-100'
          ]"
          >
            {{ todo.title }}
          </h3>
          <div class="flex items-center gap-1">
            <!-- Edit button -->
            <button
              @click.stop="handleEdit"
              :disabled="loading"
              :class="`${props.themeClasses?.editButtonGradient || props.themeClasses?.buttonGradient || 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'} text-white p-1.5 rounded-lg shadow-sm hover:shadow-md disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200 transform hover:scale-110 active:scale-95`"
              title="Edit"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <!-- Delete button -->
            <button
              @click.stop="handleDeleteClick"
              :disabled="loading"
              class="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white p-1.5 rounded-lg shadow-sm hover:shadow-md disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200 transform hover:scale-110 active:scale-95"
              title="Delete"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <!-- Expand/collapse chevron -->
            <svg
              :class="[
                'w-5 h-5 text-slate-400 dark:text-slate-500 transition-transform duration-200 flex-shrink-0 cursor-pointer hover:text-slate-600 dark:hover:text-slate-400',
                isExpanded && 'transform rotate-180'
              ]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        
        <!-- Expanded content - Table view -->
        <Transition name="expand">
          <div v-if="isExpanded" class="mt-4">
            <div class="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
              <table class="w-full text-sm min-w-full">
                <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
                  <tr>
                    <td class="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200 bg-slate-100/50 dark:bg-slate-700/50 w-32">
                      ID
                    </td>
                    <td class="px-4 py-3 text-slate-600 dark:text-slate-300 font-mono text-xs">
                      {{ todo.id || 'N/A' }}
                    </td>
                  </tr>
                  <tr>
                    <td class="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200 bg-slate-100/50 dark:bg-slate-700/50">
                      Title
                    </td>
                    <td class="px-4 py-3 text-slate-800 dark:text-slate-100 font-medium">
                      {{ todo.title }}
                    </td>
                  </tr>
                  <tr>
                    <td class="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200 bg-slate-100/50 dark:bg-slate-700/50">
                      Description
                    </td>
                    <td class="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {{ todo.description || 'No description' }}
                    </td>
                  </tr>
                  <tr>
                    <td class="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200 bg-slate-100/50 dark:bg-slate-700/50">
                      Status
                    </td>
                    <td class="px-4 py-3">
                      <span
                        :class="[
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          todo.completed
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                            : 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300'
                        ]"
                      >
                        {{ todo.completed ? 'Completed' : 'Pending' }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="flex gap-2 mt-4 border-t border-slate-200 dark:border-slate-700 pt-4">
              <button
                @click.stop="handleEdit"
                :disabled="loading"
                :class="`${props.themeClasses?.editButtonGradient || props.themeClasses?.buttonGradient || 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'} text-white py-2 px-4 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center gap-1.5`"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
              <button
                @click.stop="handleDeleteClick"
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
        </Transition>
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

<style scoped>
.expand-enter-active {
  transition: opacity 0.3s ease-out, transform 0.3s ease-out;
}

.expand-leave-active {
  transition: opacity 0.2s ease-in, transform 0.2s ease-in;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>