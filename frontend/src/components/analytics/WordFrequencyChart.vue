<script setup lang="ts">
import { computed } from 'vue'
import type { WordFrequencyItem, NgramItem } from '@/types/analytics'

interface Props {
  data: WordFrequencyItem[] | NgramItem[]
  maxBars?: number
  showPercentage?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  maxBars: 25,
  showPercentage: true
})

// Normalize bar widths relative to the max count
const maxCount = computed(() => {
  if (props.data.length === 0) return 1
  return Math.max(...props.data.map(d => d.count))
})

const displayData = computed(() =>
  props.data.slice(0, props.maxBars).map(item => ({
    ...item,
    widthPercent: (item.count / maxCount.value) * 100,
    label: 'display' in item ? (item as NgramItem).display : (item as WordFrequencyItem).word
  }))
)
</script>

<template>
  <div class="space-y-1">
    <div
      v-for="(item, index) in displayData"
      :key="item.label"
      class="group flex items-center gap-2 py-0.5"
    >
      <!-- Rank number -->
      <div class="w-5 text-xs text-dark-500 text-right font-mono">
        {{ index + 1 }}
      </div>

      <!-- Label -->
      <div
        class="w-24 text-xs text-dark-300 truncate text-right"
        :title="item.label"
      >
        {{ item.label }}
      </div>

      <!-- Bar -->
      <div class="flex-1 h-5 bg-dark-700/50 rounded overflow-hidden">
        <div
          class="h-full bg-gradient-to-r from-primary-600 to-primary-400 transition-all duration-300 group-hover:from-primary-500 group-hover:to-primary-300 rounded"
          :style="{ width: `${item.widthPercent}%` }"
        />
      </div>

      <!-- Count -->
      <div class="w-14 text-xs text-dark-400 font-mono text-right">
        {{ item.count.toLocaleString() }}
      </div>

      <!-- Percentage -->
      <div v-if="showPercentage" class="w-12 text-xs text-dark-500 text-right">
        {{ (item.frequency * 100).toFixed(1) }}%
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-if="displayData.length === 0"
      class="py-8 text-center text-dark-500 text-sm"
    >
      No data to display
    </div>
  </div>
</template>
