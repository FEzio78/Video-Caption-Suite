<script setup lang="ts">
import { computed } from 'vue'
import type { NgramItem } from '@/types/analytics'

interface Props {
  ngrams: NgramItem[]
  maxItems?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxItems: 30
})

const displayNgrams = computed(() => props.ngrams.slice(0, props.maxItems))

const maxCount = computed(() => {
  if (props.ngrams.length === 0) return 1
  return Math.max(...props.ngrams.map(n => n.count))
})

function getBarWidth(count: number): string {
  return `${(count / maxCount.value) * 100}%`
}
</script>

<template>
  <div class="space-y-1 max-h-[500px] overflow-y-auto">
    <div
      v-for="(item, index) in displayNgrams"
      :key="item.display"
      class="group relative"
    >
      <!-- Background bar -->
      <div
        class="absolute inset-y-0 left-0 bg-primary-500/10 rounded transition-all"
        :style="{ width: getBarWidth(item.count) }"
      />

      <!-- Content -->
      <div class="relative flex items-center gap-3 py-2 px-3">
        <span class="text-xs text-dark-500 w-5 text-right">{{ index + 1 }}</span>
        <span class="text-sm text-dark-200 flex-1 font-medium">{{ item.display }}</span>
        <span class="text-xs text-dark-400 font-mono">{{ item.count }}</span>
        <span class="text-xs text-dark-500 w-14 text-right">
          {{ (item.frequency * 100).toFixed(2) }}%
        </span>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-if="displayNgrams.length === 0"
      class="py-12 text-center text-dark-500 text-sm"
    >
      No n-grams found. Try adjusting filters or analyze more captions.
    </div>
  </div>
</template>
