import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ProgressState, ProcessingStage } from '@/types'
import { initialProgressState } from '@/types'

export const useProgressStore = defineStore('progress', () => {
  const state = ref<ProgressState>({ ...initialProgressState })
  const wsConnected = ref(false)

  const isIdle = computed(() => state.value.stage === 'idle')
  const isLoadingModel = computed(() => state.value.stage === 'loading_model')
  const isProcessing = computed(() => state.value.stage === 'processing')
  const isComplete = computed(() => state.value.stage === 'complete')
  const hasError = computed(() => state.value.stage === 'error')

  const overallProgress = computed(() => {
    if (state.value.total_videos === 0) return 0
    const videoProgress = state.value.video_index / state.value.total_videos
    const substageProgress = state.value.substage_progress / state.value.total_videos
    return Math.min(100, (videoProgress + substageProgress) * 100)
  })

  const currentVideoProgress = computed(() => {
    return state.value.substage_progress * 100
  })

  const formattedElapsedTime = computed(() => {
    const seconds = Math.floor(state.value.elapsed_time)
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  })

  const estimatedTimeRemaining = computed(() => {
    if (state.value.video_index === 0 || state.value.elapsed_time === 0) return null

    const avgTimePerVideo = state.value.elapsed_time / state.value.video_index
    const remainingVideos = state.value.total_videos - state.value.video_index
    const remainingSeconds = Math.floor(avgTimePerVideo * remainingVideos)

    const mins = Math.floor(remainingSeconds / 60)
    const secs = remainingSeconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  })

  function updateFromWebSocket(data: ProgressState) {
    state.value = { ...state.value, ...data }
  }

  function setWsConnected(connected: boolean) {
    wsConnected.value = connected
  }

  function reset() {
    state.value = { ...initialProgressState }
  }

  return {
    state,
    wsConnected,
    isIdle,
    isLoadingModel,
    isProcessing,
    isComplete,
    hasError,
    overallProgress,
    currentVideoProgress,
    formattedElapsedTime,
    estimatedTimeRemaining,
    updateFromWebSocket,
    setWsConnected,
    reset,
  }
})
