<script setup lang="ts">
import ResizablePanel from './ResizablePanel.vue'
import { SettingsPanel } from '@/components/settings'
import { StatusPanel } from '@/components/progress'

interface Props {
  initialWidth?: number
  minWidth?: number
  maxWidth?: number
}

withDefaults(defineProps<Props>(), {
  initialWidth: 384,
  minWidth: 320,
  maxWidth: 600,
})
</script>

<template>
  <ResizablePanel
    side="left"
    :initial-width="initialWidth"
    :min-width="minWidth"
    :max-width="maxWidth"
    class="bg-dark-850"
  >
    <!-- Scrollable settings area -->
    <div class="flex-1 overflow-y-auto min-h-0 p-4">
      <SettingsPanel />
    </div>

    <!-- Fixed StatusPanel at bottom -->
    <div class="flex-shrink-0 border-t border-dark-700 p-4 bg-dark-850">
      <StatusPanel />
    </div>
  </ResizablePanel>
</template>
