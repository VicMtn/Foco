<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  progress: number
  label: string
  caption?: string
}>()

const SIZE = 240
const STROKE = 12
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const clamped = computed(() => Math.min(1, Math.max(0, props.progress)))
const dashOffset = computed(() => CIRCUMFERENCE * (1 - clamped.value))
</script>

<template>
  <div class="ring">
    <svg :width="SIZE" :height="SIZE" :viewBox="`0 0 ${SIZE} ${SIZE}`">
      <circle
        class="ring__track"
        :cx="SIZE / 2"
        :cy="SIZE / 2"
        :r="RADIUS"
        :stroke-width="STROKE"
        fill="none"
      />
      <circle
        class="ring__progress"
        :cx="SIZE / 2"
        :cy="SIZE / 2"
        :r="RADIUS"
        :stroke-width="STROKE"
        fill="none"
        :stroke-dasharray="CIRCUMFERENCE"
        :stroke-dashoffset="dashOffset"
        :transform="`rotate(-90 ${SIZE / 2} ${SIZE / 2})`"
      />
    </svg>
    <div class="ring__center">
      <span class="ring__label">{{ label }}</span>
      <span v-if="caption" class="ring__caption">{{ caption }}</span>
    </div>
  </div>
</template>

<style scoped>
.ring {
  position: relative;
  width: 240px;
  height: 240px;
}

.ring__track {
  stroke: color-mix(in srgb, currentColor 12%, transparent);
}

.ring__progress {
  stroke: currentColor;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.25s linear;
}

.ring__center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.ring__label {
  font-size: 3rem;
  font-variant-numeric: tabular-nums;
  font-weight: 300;
  letter-spacing: 0.02em;
}

.ring__caption {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  opacity: 0.6;
}
</style>
