<script setup lang="ts">
import { ref } from 'vue'
import Login from './components/Login.vue'
import TodoList from './components/TodoList.vue'

const isAuthenticated = ref(false)

const handleConnected = () => {
  isAuthenticated.value = true
}
</script>

<template>
  <Login v-if="!isAuthenticated" @connected="handleConnected" />
  <TodoList v-else />
</template>
