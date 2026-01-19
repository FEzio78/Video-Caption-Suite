<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useProgressStore } from '@/stores/progressStore'
import { BaseCard } from '@/components/base'
import ProgressBar from './ProgressBar.vue'
import StageProgress from './StageProgress.vue'
import TokenCounter from './TokenCounter.vue'

const progressStore = useProgressStore()
const {
  state,
  wsConnected,
  isIdle,
  isLoadingModel,
  isProcessing,
  isComplete,
  hasError,
  overallProgress,
  currentVideoProgress,
  estimatedTimeRemaining,
} = storeToRefs(progressStore)

const statusText = computed(() => {
  if (hasError.value) return `Error: ${state.value.error_message}`
  if (isComplete.value) return 'Processing complete!'
  if (isLoadingModel.value) return 'Loading model...'
  if (isProcessing.value) {
    const substageText = {
      idle: 'Starting...',
      extracting_frames: 'Extracting frames...',
      encoding: 'Encoding...',
      generating: 'Generating caption...',
    }
    return substageText[state.value.substage] || 'Processing...'
  }
  return 'Ready'
})

const statusColor = computed(() => {
  if (hasError.value) return 'text-red-400'
  if (isComplete.value) return 'text-green-400'
  if (isProcessing.value || isLoadingModel.value) return 'text-primary-400'
  return 'text-dark-400'
})
</script>

<template>
  <BaseCard title="Status">
    <div class="space-y-4">
      <!-- Connection indicator -->
      <div class="flex items-center gap-2 text-sm">
        <div
          :class="[
            'w-2 h-2 rounded-full',
            wsConnected ? 'bg-green-500' : 'bg-red-500',
          ]"
        />
        <span class="text-dark-400">
          {{ wsConnected ? 'Connected' : 'Disconnected' }}
        </span>
      </div>

      <!-- Stage progress -->
      <StageProgress
        :stage="state.stage"
        :substage="state.substage"
        :model-loaded="state.model_loaded"
      />

      <!-- Status text -->
      <div class="text-center py-2">
        <p :class="['text-lg font-medium', statusColor]">
          {{ statusText }}
        </p>
        <p v-if="state.current_video" class="text-sm text-dark-400 mt-1">
          {{ state.current_video }}
        </p>
      </div>

      <!-- Overall progress -->
      <div v-if="isProcessing || isComplete">
        <ProgressBar
          :value="overallProgress"
          :animated="isProcessing"
          :color="isComplete ? 'success' : 'primary'"
        >
          <template #label>
            <span class="text-sm text-dark-300">
              Video {{ state.video_index + 1 }} of {{ state.total_videos }}
            </span>
          </template>
        </ProgressBar>
      </div>

      <!-- Current video progress -->
      <div v-if="isProcessing && state.substage !== 'idle'">
        <ProgressBar
          :value="currentVideoProgress"
          size="sm"
          :animated="true"
          :striped="true"
          :show-label="false"
        />
      </div>

      <!-- Token counter -->
      <TokenCounter
        v-if="isProcessing || isComplete"
        :tokens-generated="state.tokens_generated"
        :tokens-per-sec="state.tokens_per_sec"
        :elapsed-time="state.elapsed_time"
      />

      <!-- VRAM usage -->
      <div class="flex items-center justify-between text-sm">
        <span class="text-dark-400">VRAM Usage</span>
        <span class="font-mono text-dark-200">
          {{ state.vram_used_gb.toFixed(2) }} GB
        </span>
      </div>

      <!-- Estimated time remaining -->
      <div
        v-if="isProcessing && estimatedTimeRemaining"
        class="flex items-center justify-between text-sm"
      >
        <span class="text-dark-400">Est. Remaining</span>
        <span class="font-mono text-dark-200">
          {{ estimatedTimeRemaining }}
        </span>
      </div>
    </div>
  </BaseCard>
</template>
