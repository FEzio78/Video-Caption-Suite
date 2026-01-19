export type DeviceType = 'cuda' | 'cpu'
export type DtypeType = 'float16' | 'bfloat16' | 'float32'

export interface Settings {
  model_id: string
  device: DeviceType
  dtype: DtypeType
  max_frames: number
  frame_size: number
  max_tokens: number
  temperature: number
  use_sage_attention: boolean
  use_torch_compile: boolean
  include_metadata: boolean
  prompt: string
}

export interface SettingsUpdate {
  model_id?: string
  device?: DeviceType
  dtype?: DtypeType
  max_frames?: number
  frame_size?: number
  max_tokens?: number
  temperature?: number
  use_sage_attention?: boolean
  use_torch_compile?: boolean
  include_metadata?: boolean
  prompt?: string
}

export const defaultSettings: Settings = {
  model_id: 'Qwen/Qwen3-VL-8B-Instruct',
  device: 'cuda',
  dtype: 'bfloat16',
  max_frames: 16,
  frame_size: 336,
  max_tokens: 512,
  temperature: 0.3,
  use_sage_attention: false,
  use_torch_compile: true,
  include_metadata: false,
  prompt: `Describe this video in detail. Include:
- The main subject and their actions
- The setting and environment
- Any notable objects or elements
- The overall mood or atmosphere
- Any text visible in the video`,
}

// Prompt Library types
export interface SavedPrompt {
  id: string
  name: string
  prompt: string
  created_at: string
}

export interface PromptLibrary {
  prompts: SavedPrompt[]
}

export interface CreatePromptRequest {
  name: string
  prompt: string
}

export interface UpdatePromptRequest {
  name?: string
  prompt?: string
}

// Directory types
export interface DirectoryRequest {
  directory: string
}

export interface DirectoryResponse {
  directory: string
  video_count?: number
}

export interface DirectoryBrowseResponse {
  current: string
  parent: string | null
  directories: { name: string; path: string }[]
}
