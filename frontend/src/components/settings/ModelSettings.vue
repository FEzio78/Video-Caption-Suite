<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '@/stores/settingsStore'
import { BaseInput, BaseSelect } from '@/components/base'
import type { DeviceType, DtypeType } from '@/types'

const settingsStore = useSettingsStore()
const { settings } = storeToRefs(settingsStore)

const deviceOptions = [
  { value: 'cuda', label: 'CUDA (GPU)' },
  { value: 'cpu', label: 'CPU' },
]

const dtypeOptions = [
  { value: 'bfloat16', label: 'BFloat16 (Recommended)' },
  { value: 'float16', label: 'Float16' },
  { value: 'float32', label: 'Float32' },
]

function updateDevice(value: string) {
  settingsStore.setLocalSetting('device', value as DeviceType)
}

function updateDtype(value: string) {
  settingsStore.setLocalSetting('dtype', value as DtypeType)
}

function updateModelId(value: string | number) {
  settingsStore.setLocalSetting('model_id', String(value))
}
</script>

<template>
  <div class="space-y-4">
    <BaseInput
      :model-value="settings.model_id"
      label="Model ID"
      placeholder="Qwen/Qwen3-VL-8B-Instruct"
      hint="HuggingFace model identifier"
      @update:model-value="updateModelId"
    />

    <BaseSelect
      :model-value="settings.device"
      :options="deviceOptions"
      label="Device"
      hint="GPU (CUDA) is strongly recommended"
      @update:model-value="updateDevice"
    />

    <BaseSelect
      :model-value="settings.dtype"
      :options="dtypeOptions"
      label="Precision"
      hint="BFloat16 is fastest on modern GPUs"
      @update:model-value="updateDtype"
    />
  </div>
</template>
