<script setup lang="ts">
defineProps<{
  days: number
}>()
</script>

<template>
  <div class="streak" :class="{ 'streak--active': days > 0 }">
    <span class="streak__count">{{ days }}</span>
    <span class="streak__label">{{ days === 1 ? 'day streak' : 'day streak' }}</span>
  </div>
</template>

<style scoped>
.streak {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
  background: color-mix(in srgb, currentColor 4%, transparent);
}

.streak--active {
  color: #d24d3a;
}

.streak__count {
  font-size: 1.75rem;
  font-weight: 600;
  line-height: 1;
}

.streak__label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  opacity: 0.7;
}
</style>
