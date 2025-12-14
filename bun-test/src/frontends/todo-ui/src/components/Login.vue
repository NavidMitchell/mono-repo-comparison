<script setup lang="ts">
import { ref } from 'vue'
import { Continuum, type ConnectionInfo } from '@kinotic/continuum-client'

const emit = defineEmits<{
  connected: []
}>()

const host = ref('localhost')
const port = ref(58503)
const login = ref('admin')
const passcode = ref('structures')
const loading = ref(false)
const error = ref<string | null>(null)

const handleLogin = async () => {
  loading.value = true
  error.value = null

  try {
    const connectionInfo: ConnectionInfo = {
      host: host.value,
      port: port.value,
      connectHeaders: {
        login: login.value,
        passcode: passcode.value
      }
    }

    await Continuum.connect(connectionInfo)
    emit('connected')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to connect. Please check your credentials and try again.'
    console.error('Connection error:', err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center py-12 px-4">
    <div class="max-w-md w-full">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          Todo App
        </h1>
        <p class="text-slate-600">Sign in to access your todos</p>
      </div>

      <!-- Login Card -->
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Error message -->
          <div v-if="error" class="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
            <div class="flex items-center">
              <svg class="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              <p class="text-red-700 font-medium text-sm">{{ error }}</p>
            </div>
          </div>

          <!-- Host -->
          <div>
            <label for="host" class="block text-sm font-semibold text-slate-700 mb-2">
              Host
            </label>
            <input
              id="host"
              v-model="host"
              type="text"
              required
              class="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white text-slate-800 placeholder-slate-400"
              placeholder="localhost"
              :disabled="loading"
            />
          </div>

          <!-- Port -->
          <div>
            <label for="port" class="block text-sm font-semibold text-slate-700 mb-2">
              Port
            </label>
            <input
              id="port"
              v-model.number="port"
              type="number"
              required
              class="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white text-slate-800 placeholder-slate-400"
              placeholder="58503"
              :disabled="loading"
            />
          </div>

          <!-- Login -->
          <div>
            <label for="login" class="block text-sm font-semibold text-slate-700 mb-2">
              Username
            </label>
            <input
              id="login"
              v-model="login"
              type="text"
              required
              class="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white text-slate-800 placeholder-slate-400"
              placeholder="admin"
              :disabled="loading"
            />
          </div>

          <!-- Passcode -->
          <div>
            <label for="passcode" class="block text-sm font-semibold text-slate-700 mb-2">
              Password
            </label>
            <input
              id="passcode"
              v-model="passcode"
              type="password"
              required
              class="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white text-slate-800 placeholder-slate-400"
              placeholder="Enter password"
              :disabled="loading"
            />
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <span v-if="loading" class="flex items-center justify-center gap-2">
              <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Connecting...
            </span>
            <span v-else class="flex items-center justify-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Sign In
            </span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>