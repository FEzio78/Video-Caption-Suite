<script setup lang="ts">
interface Props {
  title: string
  description?: string
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
})

const iconSizeClasses: Record<string, string> = {
  sm: 'w-10 h-10',
  md: 'w-16 h-16',
  lg: 'w-20 h-20',
}

const titleSizeClasses: Record<string, string> = {
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-xl',
}

const descriptionSizeClasses: Record<string, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
}
</script>

<template>
  <div class="text-center">
    <!-- Icon slot with default video icon -->
    <div :class="['mx-auto text-dark-700 mb-4', iconSizeClasses[size]]">
      <slot name="icon">
        <svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      </slot>
    </div>

    <h3 :class="['font-medium text-dark-400 mb-1', titleSizeClasses[size]]">
      {{ title }}
    </h3>

    <p v-if="description" :class="['text-dark-600', descriptionSizeClasses[size]]">
      {{ description }}
    </p>

    <!-- Action slot for buttons -->
    <div v-if="$slots.action" class="mt-4">
      <slot name="action" />
    </div>
  </div>
</template>
