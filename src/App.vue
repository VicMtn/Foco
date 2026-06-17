<script setup lang="ts">
import TimerView from './views/TimerView.vue'
</script>

<template>
  <main class="app">
    <header class="app__header">
      <h1>Foco</h1>
    </header>
    <TimerView />
  </main>
</template>

<style>
:root {
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', Avenir, Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: #111;
  background-color: #f6f5f1;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  --btn-bg: #111;
  --btn-fg: #f6f5f1;
}

body {
  margin: 0;
}

@media (prefers-color-scheme: dark) {
  :root {
    color: #f6f5f1;
    background-color: #16161a;
    --btn-bg: #f6f5f1;
    --btn-fg: #16161a;
  }
}
</style>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.app__header {
  padding: 1.5rem 0 0.5rem;
}

.app__header h1 {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  opacity: 0.7;
}
</style>
