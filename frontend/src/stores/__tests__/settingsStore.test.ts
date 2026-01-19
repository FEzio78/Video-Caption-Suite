import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSettingsStore } from '../settingsStore'

// Mock fetch
global.fetch = vi.fn()

describe('settingsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('initializes with default settings', () => {
    const store = useSettingsStore()

    expect(store.settings.model_id).toBe('Qwen/Qwen3-VL-8B-Instruct')
    expect(store.settings.device).toBe('cuda')
    expect(store.settings.dtype).toBe('bfloat16')
    expect(store.settings.max_frames).toBe(16)
    expect(store.settings.temperature).toBe(0.3)
    expect(store.settings.use_torch_compile).toBe(true)
  })

  it('computes hasChanges correctly', () => {
    const store = useSettingsStore()

    // Initially no changes
    expect(store.hasChanges).toBe(false)

    // Make a change
    store.settings.max_frames = 8
    expect(store.hasChanges).toBe(true)
  })

  it('setLocalSetting updates single setting', () => {
    const store = useSettingsStore()

    store.setLocalSetting('max_frames', 32)
    expect(store.settings.max_frames).toBe(32)

    store.setLocalSetting('temperature', 0.7)
    expect(store.settings.temperature).toBe(0.7)

    store.setLocalSetting('use_torch_compile', false)
    expect(store.settings.use_torch_compile).toBe(false)
  })

  it('fetchSettings makes API call', async () => {
    const mockSettings = {
      model_id: 'test/model',
      device: 'cuda',
      dtype: 'float16',
      max_frames: 8,
      frame_size: 224,
      max_tokens: 256,
      temperature: 0.5,
      use_sage_attention: false,
      use_torch_compile: false,
      include_metadata: true,
      prompt: 'Test prompt',
    }

    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockSettings),
    })

    const store = useSettingsStore()
    await store.fetchSettings()

    expect(global.fetch).toHaveBeenCalledWith('/api/settings')
    expect(store.settings.model_id).toBe('test/model')
    expect(store.settings.max_frames).toBe(8)
  })

  it('fetchSettings handles errors', async () => {
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: false,
    })

    const store = useSettingsStore()
    await store.fetchSettings()

    expect(store.error).toBe('Failed to fetch settings')
  })

  it('updateSettings makes POST request', async () => {
    const mockResponse = {
      model_id: 'Qwen/Qwen3-VL-8B-Instruct',
      max_frames: 32,
    }

    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })

    const store = useSettingsStore()
    await store.updateSettings({ max_frames: 32 })

    expect(global.fetch).toHaveBeenCalledWith('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ max_frames: 32 }),
    })
  })

  it('resetSettings makes POST to reset endpoint', async () => {
    const defaultSettings = {
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
      prompt: 'Default prompt',
    }

    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(defaultSettings),
    })

    const store = useSettingsStore()

    // First change something
    store.settings.max_frames = 8

    // Then reset
    await store.resetSettings()

    expect(global.fetch).toHaveBeenCalledWith('/api/settings/reset', {
      method: 'POST',
    })
    expect(store.settings.max_frames).toBe(16)
  })

  it('loading state is managed correctly', async () => {
    ;(global.fetch as any).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve({}),
      }), 100))
    )

    const store = useSettingsStore()

    expect(store.loading).toBe(false)

    const promise = store.fetchSettings()
    expect(store.loading).toBe(true)

    await promise
    expect(store.loading).toBe(false)
  })
})
