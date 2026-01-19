<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useVideoStore } from '@/stores/videoStore'
import { useProgressStore } from '@/stores/progressStore'
import { BaseCard, BaseButton } from '@/components/base'
import VideoCard from './VideoCard.vue'

const videoStore = useVideoStore()
const progressStore = useProgressStore()

const { videos, selectedVideos, loading, totalVideos, captionedVideos, pendingVideos } = storeToRefs(videoStore)
const { state, isProcessing } = storeToRefs(progressStore)

const emit = defineEmits<{
  viewCaption: [videoName: string]
}>()

const processingVideoName = computed(() => {
  return isProcessing.value ? state.value.current_video : null
})

async function refreshVideos() {
  await videoStore.fetchVideos()
}

async function handleDelete(videoName: string) {
  if (confirm(`Delete "${videoName}"?`)) {
    await videoStore.deleteVideo(videoName)
  }
}

function isSelected(name: string): boolean {
  return selectedVideos.value.has(name)
}

function toggleSelection(name: string) {
  videoStore.toggleVideoSelection(name)
}

onMounted(() => {
  refreshVideos()
})
</script>

<template>
  <BaseCard>
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div class="flex items-center gap-3">
          <h3 class="text-sm font-semibold text-dark-200">Videos</h3>
          <div class="flex items-center gap-2 text-xs text-dark-400">
            <span>{{ totalVideos }} total</span>
            <span class="text-dark-600">|</span>
            <span class="text-green-400">{{ captionedVideos }} done</span>
            <span class="text-dark-600">|</span>
            <span class="text-yellow-400">{{ pendingVideos }} pending</span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <BaseButton variant="ghost" size="sm" @click="videoStore.selectAll()">
            All
          </BaseButton>
          <BaseButton variant="ghost" size="sm" @click="videoStore.selectNone()">
            None
          </BaseButton>
          <BaseButton variant="ghost" size="sm" @click="videoStore.selectPending()">
            Pending
          </BaseButton>
          <BaseButton
            variant="secondary"
            size="sm"
            :loading="loading"
            @click="refreshVideos"
          >
            Refresh
          </BaseButton>
        </div>
      </div>
    </template>

    <!-- Empty state -->
    <div
      v-if="videos.length === 0 && !loading"
      class="py-12 text-center"
    >
      <svg
        class="w-16 h-16 mx-auto text-dark-600 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
      </svg>
      <h4 class="text-lg font-medium text-dark-300 mb-2">No videos found</h4>
      <p class="text-sm text-dark-500">
        Add videos to the input_videos folder
      </p>
    </div>

    <!-- Loading state -->
    <div
      v-else-if="loading && videos.length === 0"
      class="py-12 text-center"
    >
      <svg
        class="w-8 h-8 mx-auto text-primary-500 animate-spin mb-4"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      <p class="text-sm text-dark-400">Loading videos...</p>
    </div>

    <!-- Video grid -->
    <div
      v-else
      class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[500px] overflow-y-auto"
    >
      <VideoCard
        v-for="video in videos"
        :key="video.name"
        :video="video"
        :selected="isSelected(video.name)"
        :processing="processingVideoName === video.name"
        @select="toggleSelection(video.name)"
        @delete="handleDelete(video.name)"
        @view-caption="emit('viewCaption', video.name)"
      />
    </div>

    <template #footer>
      <div class="flex items-center justify-between text-sm text-dark-400">
        <span>{{ selectedVideos.size }} selected</span>
        <span v-if="selectedVideos.size > 0">
          Click "Start Processing" to caption selected videos
        </span>
      </div>
    </template>
  </BaseCard>
</template>
