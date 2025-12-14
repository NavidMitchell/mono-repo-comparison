<script setup lang="ts">
  import { ref, onMounted, watch } from 'vue'
  import { Todo, TodoEntityService } from 'bun-test-structures'
  import { Pageable, Sort, Order, Direction } from '@kinotic/continuum-client'
  import TodoForm from './TodoForm.vue'
  import TodoItem from './TodoItem.vue'

  const todoService = new TodoEntityService()
  const todos = ref<Todo[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const editingTodoId = ref<string | null>(null)
  const showForm = ref(false)
  const searchQuery = ref('')
  let searchTimeout: ReturnType<typeof setTimeout> | null = null

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
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4">
    <div class="max-w-3xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-10">
        <h1 class="text-5xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
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
            class="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white text-slate-800 placeholder-slate-400"
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
          class="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add New Todo
        </button>
      </div>

      <!-- Create todo form modal -->
      <TodoForm :show="showForm" :loading="loading" @create="handleCreate" @cancel="handleFormCancel" />

      <!-- Todos list -->
      <div class="space-y-3">
        <div v-if="loading && todos.length === 0" class="text-center py-16">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
          <p class="mt-4 text-slate-600 font-medium">Loading your todos...</p>
        </div>

        <div v-else-if="todos.length === 0" class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-12 text-center border border-white/20">
          <div class="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
            <svg class="w-10 h-10 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div class="animate-spin rounded-full h-8 w-8 border-4 border-indigo-200 border-t-indigo-600"></div>
          <span class="text-slate-700 font-medium">Processing...</span>
        </div>
      </div>
    </div>
  </div>
</template>