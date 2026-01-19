<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '@/stores/settingsStore'
import { BaseToggle } from '@/components/base'

const settingsStore = useSettingsStore()
const { settings } = storeToRefs(settingsStore)

function updateSageAttention(value: boolean) {
  settingsStore.setLocalSetting('use_sage_attention', value)
}

function updateTorchCompile(value: boolean) {
  settingsStore.setLocalSetting('use_torch_compile', value)
}

function updateIncludeMetadata(value: boolean) {
  settingsStore.setLocalSetting('include_metadata', value)
}
</script>

<template>
  <div class="space-y-4">
    <BaseToggle
      :model-value="settings.use_torch_compile"
      label="torch.compile"
      description="10-30% faster after warmup"
      @update:model-value="updateTorchCompile"
    />

    <BaseToggle
      :model-value="settings.use_sage_attention"
      label="SageAttention"
      description="Not compatible with Qwen3-VL (head dim 80)"
      :disabled="true"
      @update:model-value="updateSageAttention"
    />

    <BaseToggle
      :model-value="settings.include_metadata"
      label="Include Metadata"
      description="Add timing and token info to captions"
      @update:model-value="updateIncludeMetadata"
    />
  </div>
</template>
