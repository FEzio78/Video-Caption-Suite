<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  showValue?: boolean
  color?: 'primary' | 'success' | 'warning' | 'danger'
}

const props = withDefaults(defineProps<Props>(), {
  max: 100,
  size: 80,
  strokeWidth: 8,
  showValue: true,
  color: 'primary',
})

const percentage = computed(() => {
  return Math.min(100, Math.max(0, (props.value / props.max) * 100))
})

const radius = computed(() => (props.size - props.strokeWidth) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const offset = computed(() => {
  return circumference.value - (percentage.value / 100) * circumference.value
})

const colorClasses = {
  primary: 'stroke-primary-500',
  success: 'stroke-green-500',
  warning: 'stroke-yellow-500',
  danger: 'stroke-red-500',
}
</script>

<template>
  <div class="relative inline-flex items-center justify-center">
    <svg
      :width="size"
      :height="size"
      class="transform -rotate-90"
    >
      <!-- Background circle -->
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        fill="none"
        class="stroke-dark-700"
        :stroke-width="strokeWidth"
      />
      <!-- Progress circle -->
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        fill="none"
        :class="colorClasses[color]"
        :stroke-width="strokeWidth"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="offset"
        class="transition-all duration-300 ease-out"
      />
    </svg>
    <div
      v-if="showValue"
      class="absolute inset-0 flex items-center justify-center"
    >
      <span class="text-sm font-semibold text-dark-200">
        {{ Math.round(percentage) }}%
      </span>
    </div>
  </div>
</template>
