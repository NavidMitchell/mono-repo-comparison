<script setup lang="ts">
  import { ref, onMounted, watch, computed } from 'vue'
  import { Todo, TodoEntityService } from 'bun-test-structures'
  import { Pageable, Sort, Order, Direction } from '@kinotic/continuum-client'
  import TodoForm from './TodoForm.vue'
  import TodoItem from './TodoItem.vue'
  import ThemePicker from './ThemePicker.vue'

  type Theme = 'purple' | 'blue' | 'green' | 'orange' | 'rose'

  const todoService = new TodoEntityService()
  const todos = ref<Todo[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const editingTodoId = ref<string | null>(null)
  const showForm = ref(false)
  const searchQuery = ref('')
  let searchTimeout: ReturnType<typeof setTimeout> | null = null

  // Theme management
  const theme = ref<Theme>((localStorage.getItem('todo-theme') as Theme) || 'purple')

  const themeClasses = computed(() => {
    const themes = {
      purple: {
        bgGradient: 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50',
        headerGradient: 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600',
        buttonGradient: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700',
        inputFocus: 'focus:ring-indigo-500 focus:border-indigo-500',
        iconBg: 'bg-gradient-to-br from-indigo-100 to-purple-100',
        iconText: 'text-indigo-500',
        spinner: 'border-indigo-200 border-t-indigo-600',
        iconBgEmpty: 'from-indigo-100 to-purple-100',
        checkboxColor: 'text-indigo-600',
        checkboxHover: 'hover:border-indigo-600 hover:bg-indigo-100 hover:ring-2 hover:ring-indigo-300',
        checkboxRing: 'focus:ring-indigo-500',
        borderHover: 'hover:border-indigo-200/50',
        editButtonGradient: 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'
      },
      blue: {
        bgGradient: 'bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50',
        headerGradient: 'bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600',
        buttonGradient: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700',
        inputFocus: 'focus:ring-blue-500 focus:border-blue-500',
        iconBg: 'bg-gradient-to-br from-blue-100 to-cyan-100',
        iconText: 'text-blue-500',
        spinner: 'border-blue-200 border-t-blue-600',
        iconBgEmpty: 'from-blue-100 to-cyan-100',
        checkboxColor: 'text-blue-600',
        checkboxHover: 'hover:border-blue-600 hover:bg-blue-100 hover:ring-2 hover:ring-blue-300',
        checkboxRing: 'focus:ring-blue-500',
        borderHover: 'hover:border-blue-200/50',
        editButtonGradient: 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700'
      },
      green: {
        bgGradient: 'bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50',
        headerGradient: 'bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600',
        buttonGradient: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700',
        inputFocus: 'focus:ring-emerald-500 focus:border-emerald-500',
        iconBg: 'bg-gradient-to-br from-emerald-100 to-teal-100',
        iconText: 'text-emerald-500',
        spinner: 'border-emerald-200 border-t-emerald-600',
        iconBgEmpty: 'from-emerald-100 to-teal-100',
        checkboxColor: 'text-emerald-600',
        checkboxHover: 'hover:border-emerald-600 hover:bg-emerald-100 hover:ring-2 hover:ring-emerald-300',
        checkboxRing: 'focus:ring-emerald-500',
        borderHover: 'hover:border-emerald-200/50',
        editButtonGradient: 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700'
      },
      orange: {
        bgGradient: 'bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50',
        headerGradient: 'bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600',
        buttonGradient: 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700',
        inputFocus: 'focus:ring-orange-500 focus:border-orange-500',
        iconBg: 'bg-gradient-to-br from-orange-100 to-amber-100',
        iconText: 'text-orange-500',
        spinner: 'border-orange-200 border-t-orange-600',
        iconBgEmpty: 'from-orange-100 to-amber-100',
        checkboxColor: 'text-orange-600',
        checkboxHover: 'hover:border-orange-600 hover:bg-orange-100 hover:ring-2 hover:ring-orange-300',
        checkboxRing: 'focus:ring-orange-500',
        borderHover: 'hover:border-orange-200/50',
        editButtonGradient: 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700'
      },
      rose: {
        bgGradient: 'bg-gradient-to-br from-slate-50 via-rose-50 to-pink-50',
        headerGradient: 'bg-gradient-to-r from-rose-600 via-pink-600 to-red-600',
        buttonGradient: 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700',
        inputFocus: 'focus:ring-rose-500 focus:border-rose-500',
        iconBg: 'bg-gradient-to-br from-rose-100 to-pink-100',
        iconText: 'text-rose-500',
        spinner: 'border-rose-200 border-t-rose-600',
        iconBgEmpty: 'from-rose-100 to-pink-100',
        checkboxColor: 'text-rose-600',
        checkboxHover: 'hover:border-rose-600 hover:bg-rose-100 hover:ring-2 hover:ring-rose-300',
        checkboxRing: 'focus:ring-rose-500',
        borderHover: 'hover:border-rose-200/50',
        editButtonGradient: 'bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700'
      }
    }
    return themes[theme.value]
  })

  // Theme classes for child components
  const childThemeClasses = computed(() => ({
    buttonGradient: themeClasses.value.buttonGradient,
    editButtonGradient: themeClasses.value.editButtonGradient,
    inputFocus: themeClasses.value.inputFocus,
    checkboxColor: themeClasses.value.checkboxColor,
    checkboxHover: themeClasses.value.checkboxHover,
    checkboxRing: themeClasses.value.checkboxRing,
    borderHover: themeClasses.value.borderHover
  }))

  const updateTheme = (newTheme: Theme) => {
    theme.value = newTheme
    localStorage.setItem('todo-theme', newTheme)
  }

  // Load all todos or search
  const loadTodos = async () => {
    loading.value = true
    error.value = null
    try {
      // Sort by completed field ascending (false first, true last)
      const sort = { orders: [new Order('completed', Direction.ASC)]}
      const pageable = Pageable.create(0, 1000, sort)
      let page 
      
      if (searchQuery.value.trim()) {
        // Use search with Lucene syntax
        page = await todoService.search(searchQuery.value.trim(), pageable)
      } else {
        // Load all todos
        page = await todoService.findAll(pageable)
      }
      
      todos.value = page.content || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load todos'
      console.error('Error loading todos:', err)
    } finally {
      loading.value = false
    }
  }

  // Debounced search
  const handleSearch = () => {
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }
    
    searchTimeout = setTimeout(() => {
      loadTodos()
    }, 300) // 300ms debounce
  }

  // Handle todo creation from TodoForm
  const handleCreate = async (data: { title: string; description: string }) => {
    loading.value = true
    error.value = null
    try {
      const todo = new Todo()
      todo.title = data.title
      todo.description = data.description
      todo.completed = false

      await todoService.save(todo)
      showForm.value = false
      await loadTodos()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create todo'
      console.error('Error creating todo:', err)
    } finally {
      loading.value = false
    }
  }

  // Toggle form visibility
  const toggleForm = () => {
    showForm.value = !showForm.value
  }

  // Handle form cancel
  const handleFormCancel = () => {
    showForm.value = false
  }

  // Handle todo toggle from TodoItem
  const handleToggle = async (todo: Todo) => {
    loading.value = true
    error.value = null
    try {
      todo.completed = !todo.completed
      await todoService.save(todo)
      await loadTodos()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update todo'
      console.error('Error updating todo:', err)
    } finally {
      loading.value = false
    }
  }

  // Handle edit start from TodoItem
  const handleEdit = (todo: Todo) => {
    editingTodoId.value = todo.id || null
  }

  // Handle edit cancel from TodoItem
  const handleCancelEdit = () => {
    editingTodoId.value = null
  }

  // Handle edit save from TodoItem
  const handleSaveEdit = async (todo: Todo) => {
    loading.value = true
    error.value = null
    try {
      await todoService.save(todo)
      editingTodoId.value = null
      await loadTodos()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update todo'
      console.error('Error updating todo:', err)
    } finally {
      loading.value = false
    }
  }

  // Handle todo deletion from TodoItem
  const handleDelete = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      await todoService.deleteById(id)
      if (editingTodoId.value === id) {
        editingTodoId.value = null
      }
      await loadTodos()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete todo'
      console.error('Error deleting todo:', err)
    } finally {
      loading.value = false
    }
  }

  // Watch for search query changes
  watch(searchQuery, () => {
    handleSearch()
  })

  onMounted(() => {
    loadTodos()
  })
</script>

<template>
  <div :class="`min-h-screen ${themeClasses.bgGradient} py-12 px-4`">
    <!-- Theme Picker -->
    <ThemePicker :theme="theme" @update:theme="updateTheme" />

    <div class="max-w-3xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-10">
        <h1 :class="`text-5xl font-extrabold ${themeClasses.headerGradient} bg-clip-text text-transparent mb-2`">
          Todo List
        </h1>
        <p class="text-slate-600 text-lg">Stay organized and get things done</p>
      </div>

      <!-- Error message -->
      <div v-if="error" class="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg shadow-sm">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <p class="text-red-700 font-medium">{{ error }}</p>
        </div>
      </div>

      <!-- Search and Add Todo Section -->
      <div class="mb-6 space-y-4">
        <!-- Search Input -->
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            v-model="searchQuery"
            type="text"
            :class="`w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 ${themeClasses.inputFocus} transition-all bg-white text-slate-800 placeholder-slate-400`"
            placeholder="Search todos (supports Lucene syntax, e.g., title:work OR completed:false)"
          />
          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Add Todo Button -->
        <button
          @click="toggleForm"
          :class="`w-full ${themeClasses.buttonGradient} text-white py-3.5 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2`"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add New Todo
        </button>
      </div>

      <!-- Create todo form modal -->
      <TodoForm :show="showForm" :loading="loading" :theme-classes="childThemeClasses" @create="handleCreate" @cancel="handleFormCancel" />

      <!-- Todos list -->
      <div class="space-y-3">
        <div v-if="loading && todos.length === 0" class="text-center py-16">
          <div :class="`inline-block animate-spin rounded-full h-12 w-12 border-4 ${themeClasses.spinner}`"></div>
          <p class="mt-4 text-slate-600 font-medium">Loading your todos...</p>
        </div>

        <div v-else-if="todos.length === 0" class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-12 text-center border border-white/20">
          <div :class="`w-20 h-20 mx-auto mb-4 bg-gradient-to-br ${themeClasses.iconBgEmpty} rounded-full flex items-center justify-center`">
            <svg :class="`w-10 h-10 ${themeClasses.iconText}`" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p class="text-slate-600 text-lg font-medium mb-1">
            {{ searchQuery ? 'No todos found' : 'No todos yet' }}
          </p>
          <p class="text-slate-500">
            {{ searchQuery ? 'Try adjusting your search query' : 'Click the button above to create your first todo!' }}
          </p>
        </div>

        <TodoItem
          v-for="todo in todos"
          :key="todo.id"
          :todo="todo"
          :loading="loading"
          :is-editing="editingTodoId === todo.id"
          :theme-classes="childThemeClasses"
          @toggle="handleToggle"
          @edit="handleEdit"
          @save="handleSaveEdit"
          @cancel="handleCancelEdit"
          @delete="handleDelete"
        />
      </div>

      <!-- Loading overlay for updates -->
      <div v-if="loading && todos.length > 0" class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
        <div class="bg-white rounded-2xl shadow-2xl p-6 flex items-center gap-4 border border-white/20">
          <div :class="`animate-spin rounded-full h-8 w-8 border-4 ${themeClasses.spinner}`"></div>
          <span class="text-slate-700 font-medium">Processing...</span>
        </div>
      </div>
    </div>
  </div>
</template>