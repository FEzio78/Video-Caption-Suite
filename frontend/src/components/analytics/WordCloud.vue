<script setup lang="ts">
import { computed } from 'vue'
import type { WordFrequencyItem } from '@/types/analytics'

interface Props {
  words: WordFrequencyItem[]
  maxWords?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxWords: 60
})

const emit = defineEmits<{
  wordClick: [word: string]
}>()

// Calculate font sizes based on frequency
const minSize = 11
const maxSize = 36

const displayWords = computed(() => {
  const items = props.words.slice(0, props.maxWords)
  if (items.length === 0) return []

  const maxCount = Math.max(...items.map(w => w.count))
  const minCount = Math.min(...items.map(w => w.count))
  const range = maxCount - minCount || 1

  return items
    .map((word, index) => ({
      ...word,
      fontSize: minSize + ((word.count - minCount) / range) * (maxSize - minSize),
      opacity: 0.6 + ((word.count - minCount) / range) * 0.4,
      // Use index for deterministic but varied rotation
      rotation: ((index * 7) % 11) - 5
    }))
    .sort(() => 0.5 - Math.random()) // Shuffle for visual variety
})

// Color based on relative frequency
function getColor(frequency: number, maxFreq: number): string {
  const ratio = frequency / maxFreq
  // Purple to blue-purple gradient
  const hue = 270 - ratio * 30
  const sat = 60 + ratio * 20
  const light = 60 + ratio * 15
  return `hsl(${hue}, ${sat}%, ${light}%)`
}

const maxFrequency = computed(() => {
  if (props.words.length === 0) return 1
  return Math.max(...props.words.map(w => w.frequency))
})
</script>

<template>
  <div class="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 p-4 min-h-[250px]">
    <span
      v-for="word in displayWords"
      :key="word.word"
      class="inline-block cursor-pointer transition-all duration-200 hover:scale-110 hover:drop-shadow-lg"
      :style="{
        fontSize: `${word.fontSize}px`,
        opacity: word.opacity,
        color: getColor(word.frequency, maxFrequency),
        transform: `rotate(${word.rotation}deg)`
      }"
      :title="`${word.word}: ${word.count.toLocaleString()} (${(word.frequency * 100).toFixed(1)}%)`"
      @click="emit('wordClick', word.word)"
    >
      {{ word.word }}
    </span>

    <!-- Empty state -->
    <div
      v-if="displayWords.length === 0"
      class="py-8 text-center text-dark-500 text-sm w-full"
    >
      No words to display
    </div>
  </div>
</template>
