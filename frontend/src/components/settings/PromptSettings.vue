<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '@/stores/settingsStore'
import { BaseTextarea } from '@/components/base'
import PromptLibrary from './PromptLibrary.vue'

const settingsStore = useSettingsStore()
const { settings } = storeToRefs(settingsStore)

function updatePrompt(value: string) {
  settingsStore.setLocalSetting('prompt', value)
}

function handleLoadPrompt(prompt: string) {
  settingsStore.setLocalSetting('prompt', prompt)
}
</script>

<template>
  <div class="space-y-3">
    <!-- Prompt Library controls -->
    <div class="flex items-center justify-between">
      <label class="text-sm font-medium text-dark-200">Caption Prompt</label>
      <PromptLibrary :current-prompt="settings.prompt" @load-prompt="handleLoadPrompt" />
    </div>

    <!-- Prompt textarea -->
    <BaseTextarea
      :model-value="settings.prompt"
      :rows="8"
      :min-rows="4"
      :max-rows="30"
      :resizable="true"
      placeholder="Enter the prompt for video captioning..."
      hint="Drag the bottom edge to resize. This prompt is sent to the model with each video."
      @update:model-value="updatePrompt"
    />
  </div>
</template>
