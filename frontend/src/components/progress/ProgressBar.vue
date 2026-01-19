<script setup lang="ts">
interface Props {
  value: number
  max?: number
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'success' | 'warning' | 'danger'
  animated?: boolean
  striped?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  max: 100,
  showLabel: true,
  size: 'md',
  color: 'primary',
  animated: false,
  striped: false,
})

import { computed } from 'vue'

const percentage = computed(() => {
  return Math.min(100, Math.max(0, (props.value / props.max) * 100))
})

const sizeClasses = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
}

const colorClasses = {
  primary: 'bg-primary-500',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  danger: 'bg-red-500',
}
</script>

<template>
  <div class="w-full">
    <div v-if="showLabel" class="flex justify-between mb-1">
      <slot name="label" />
      <span class="text-sm font-medium text-dark-300">
        {{ Math.round(percentage) }}%
      </span>
    </div>
    <div
      :class="[
        'w-full bg-dark-700 rounded-full overflow-hidden',
        sizeClasses[size],
      ]"
    >
      <div
        :class="[
          'h-full rounded-full transition-all duration-300 ease-out',
          colorClasses[color],
          animated && 'progress-active',
          striped && 'bg-stripes',
        ]"
        :style="{ width: `${percentage}%` }"
      />
    </div>
  </div>
</template>

<style scoped>
.bg-stripes {
  background-image: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.15) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.15) 75%,
    transparent 75%,
    transparent
  );
  background-size: 1rem 1rem;
  animation: stripe-animation 1s linear infinite;
}

@keyframes stripe-animation {
  from {
    background-position: 1rem 0;
  }
  to {
    background-position: 0 0;
  }
}
</style>
