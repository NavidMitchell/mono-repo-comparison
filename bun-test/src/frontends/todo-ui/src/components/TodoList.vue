<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { Todo, TodoEntityService } from 'bun-test-structures'
  import { Pageable } from '@kinotic/continuum-client'
  import TodoForm from './TodoForm.vue'
  import TodoItem from './TodoItem.vue'

  const todoService = new TodoEntityService()
  const todos = ref<Todo[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const editingTodoId = ref<string | null>(null)

  // Load all todos
  const loadTodos = async () => {
    loading.value = true
    error.value = null
    try {
      const page = await todoService.findAll(Pageable.create(0, 1000))
      todos.value = page.content || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load todos'
      console.error('Error loading todos:', err)
    } finally {
      loading.value = false
    }
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
      await loadTodos()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create todo'
      console.error('Error creating todo:', err)
    } finally {
      loading.value = false
    }
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

      <!-- Create todo form -->
      <TodoForm :loading="loading" @create="handleCreate" />

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
          <p class="text-slate-600 text-lg font-medium mb-1">No todos yet</p>
          <p class="text-slate-500">Create your first todo above to get started!</p>
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