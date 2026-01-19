import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useProgressStore } from '../progressStore'
import type { ProgressState } from '@/types'

describe('progressStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with idle state', () => {
    const store = useProgressStore()

    expect(store.state.stage).toBe('idle')
    expect(store.state.current_video).toBeNull()
    expect(store.state.video_index).toBe(0)
    expect(store.state.total_videos).toBe(0)
    expect(store.state.model_loaded).toBe(false)
  })

  it('correctly computes isIdle', () => {
    const store = useProgressStore()

    expect(store.isIdle).toBe(true)
    expect(store.isProcessing).toBe(false)
    expect(store.isComplete).toBe(false)
  })

  it('correctly computes isProcessing', () => {
    const store = useProgressStore()
    store.state.stage = 'processing'

    expect(store.isIdle).toBe(false)
    expect(store.isProcessing).toBe(true)
    expect(store.isComplete).toBe(false)
  })

  it('correctly computes isComplete', () => {
    const store = useProgressStore()
    store.state.stage = 'complete'

    expect(store.isIdle).toBe(false)
    expect(store.isProcessing).toBe(false)
    expect(store.isComplete).toBe(true)
  })

  it('correctly computes hasError', () => {
    const store = useProgressStore()
    store.state.stage = 'error'
    store.state.error_message = 'Test error'

    expect(store.hasError).toBe(true)
    expect(store.state.error_message).toBe('Test error')
  })

  it('computes overallProgress correctly', () => {
    const store = useProgressStore()
    store.state.total_videos = 10
    store.state.video_index = 5
    store.state.substage_progress = 0.5

    // (5/10 + 0.5/10) * 100 = 55%
    expect(store.overallProgress).toBeCloseTo(55, 5)
  })

  it('computes overallProgress as 0 when no videos', () => {
    const store = useProgressStore()
    store.state.total_videos = 0

    expect(store.overallProgress).toBe(0)
  })

  it('computes currentVideoProgress correctly', () => {
    const store = useProgressStore()
    store.state.substage_progress = 0.75

    expect(store.currentVideoProgress).toBe(75)
  })

  it('formats elapsed time correctly', () => {
    const store = useProgressStore()

    store.state.elapsed_time = 65 // 1 minute 5 seconds
    expect(store.formattedElapsedTime).toBe('1:05')

    store.state.elapsed_time = 3661 // 1 hour, 1 minute, 1 second
    expect(store.formattedElapsedTime).toBe('61:01')
  })

  it('computes estimated time remaining', () => {
    const store = useProgressStore()
    store.state.video_index = 5
    store.state.total_videos = 10
    store.state.elapsed_time = 100 // 100 seconds for 5 videos = 20s per video

    // 5 remaining videos * 20s = 100s = 1:40
    expect(store.estimatedTimeRemaining).toBe('1:40')
  })

  it('returns null for estimated time when no progress', () => {
    const store = useProgressStore()
    store.state.video_index = 0

    expect(store.estimatedTimeRemaining).toBeNull()
  })

  it('updates from WebSocket data', () => {
    const store = useProgressStore()
    const update: Partial<ProgressState> = {
      stage: 'processing',
      current_video: 'test.mp4',
      video_index: 3,
      total_videos: 10,
      tokens_per_sec: 28.5,
    }

    store.updateFromWebSocket(update as ProgressState)

    expect(store.state.stage).toBe('processing')
    expect(store.state.current_video).toBe('test.mp4')
    expect(store.state.video_index).toBe(3)
    expect(store.state.tokens_per_sec).toBe(28.5)
  })

  it('sets WebSocket connected state', () => {
    const store = useProgressStore()

    expect(store.wsConnected).toBe(false)

    store.setWsConnected(true)
    expect(store.wsConnected).toBe(true)

    store.setWsConnected(false)
    expect(store.wsConnected).toBe(false)
  })

  it('resets state correctly', () => {
    const store = useProgressStore()

    // Modify state
    store.state.stage = 'processing'
    store.state.video_index = 5
    store.state.tokens_generated = 1000

    // Reset
    store.reset()

    expect(store.state.stage).toBe('idle')
    expect(store.state.video_index).toBe(0)
    expect(store.state.tokens_generated).toBe(0)
  })
})
