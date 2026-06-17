<script setup lang="ts">
import { ref } from 'vue'
import TimerView from './views/TimerView.vue'
import StatsView from './views/StatsView.vue'
import { useTrayBridge } from './composables/useTrayBridge'
import { useSessionRecorder } from './composables/useSessionRecorder'

type ViewKey = 'timer' | 'stats'

useTrayBridge()
useSessionRecorder()

const activeView = ref<ViewKey>('timer')
const tabs: { key: ViewKey; label: string }[] = [
  { key: 'timer', label: 'Timer' },
  { key: 'stats', label: 'Stats' },
]
</script>

<template>
  <main class="app">
    <nav class="app__nav">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        class="app__tab"
        :class="{ 'app__tab--active': activeView === tab.key }"
        @click="activeView = tab.key"
      >
        {{ tab.label }}
      </button>
    </nav>
    <TimerView v-if="activeView === 'timer'" />
    <StatsView v-else />
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
  align-items: stretch;
}

.app__nav {
  display: flex;
  gap: 0.25rem;
  padding: 0.75rem 1rem 0;
  justify-content: center;
}

.app__tab {
  font: inherit;
  font-size: 0.75rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  padding: 0.4rem 0.9rem;
  border-radius: 999px;
  border: 1px solid transparent;
  background: transparent;
  color: inherit;
  opacity: 0.55;
  cursor: pointer;
  transition: opacity 0.15s ease, background 0.15s ease;
}

.app__tab:hover {
  opacity: 0.85;
}

.app__tab--active {
  opacity: 1;
  background: color-mix(in srgb, currentColor 10%, transparent);
}
</style>
