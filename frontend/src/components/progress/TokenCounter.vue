<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  tokensGenerated: number
  tokensPerSec: number
  elapsedTime: number
}

const props = defineProps<Props>()

const formattedTokens = computed(() => {
  return props.tokensGenerated.toLocaleString()
})

const formattedSpeed = computed(() => {
  return props.tokensPerSec.toFixed(1)
})

const formattedTime = computed(() => {
  const seconds = Math.floor(props.elapsedTime)
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
})
</script>

<template>
  <div class="grid grid-cols-3 gap-4">
    <!-- Tokens Generated -->
    <div class="text-center p-3 bg-dark-800 rounded-lg">
      <div class="text-2xl font-bold text-primary-400 font-mono">
        {{ formattedTokens }}
      </div>
      <div class="text-xs text-dark-400 mt-1">Tokens</div>
    </div>

    <!-- Speed -->
    <div class="text-center p-3 bg-dark-800 rounded-lg">
      <div class="text-2xl font-bold text-green-400 font-mono">
        {{ formattedSpeed }}
      </div>
      <div class="text-xs text-dark-400 mt-1">tok/s</div>
    </div>

    <!-- Elapsed Time -->
    <div class="text-center p-3 bg-dark-800 rounded-lg">
      <div class="text-2xl font-bold text-yellow-400 font-mono">
        {{ formattedTime }}
      </div>
      <div class="text-xs text-dark-400 mt-1">Elapsed</div>
    </div>
  </div>
</template>
