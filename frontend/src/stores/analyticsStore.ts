/**
 * Analytics store for word frequency analysis
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  WordFrequencyRequest,
  WordFrequencyResponse,
  NgramRequest,
  NgramResponse,
  CorrelationRequest,
  CorrelationResponse,
  AnalyticsSummary,
  StopwordPreset,
  VisualizationType,
  AnalyticsSettings
} from '@/types/analytics'

const STORAGE_KEY = 'analyticsSettings'

const defaultSettings: AnalyticsSettings = {
  stopwordPreset: 'english',
  customStopwords: [],
  minWordLength: 2,
  topN: 50,
  ngramSize: 2,
  visualizationType: 'bar',
  selectedVideos: null
}

export const useAnalyticsStore = defineStore('analytics', () => {
  // State
  const loading = ref(false)
  const error = ref<string | null>(null)

  const wordFrequency = ref<WordFrequencyResponse | null>(null)
  const ngrams = ref<NgramResponse | null>(null)
  const correlations = ref<CorrelationResponse | null>(null)
  const summary = ref<AnalyticsSummary | null>(null)

  const settings = ref<AnalyticsSettings>({ ...defaultSettings })

  // Computed
  const hasData = computed(() =>
    wordFrequency.value !== null ||
    ngrams.value !== null ||
    correlations.value !== null
  )

  const captionsAnalyzed = computed(() =>
    wordFrequency.value?.captions_analyzed ??
    ngrams.value?.captions_analyzed ??
    correlations.value?.captions_analyzed ?? 0
  )

  const hasSummary = computed(() => summary.value !== null && summary.value.total_captions > 0)

  // Actions
  async function fetchSummary(): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const response = await fetch('/api/analytics/summary')
      if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: 'Failed to fetch summary' }))
        throw new Error(err.detail || 'Failed to fetch summary')
      }
      summary.value = await response.json()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
      console.error('[analyticsStore] fetchSummary error:', e)
    } finally {
      loading.value = false
    }
  }

  async function fetchWordFrequency(request?: Partial<WordFrequencyRequest>): Promise<void> {
    loading.value = true
    error.value = null

    const payload: WordFrequencyRequest = {
      video_names: settings.value.selectedVideos ?? undefined,
      stopword_preset: settings.value.stopwordPreset,
      custom_stopwords: settings.value.customStopwords.length > 0
        ? settings.value.customStopwords
        : undefined,
      min_word_length: settings.value.minWordLength,
      top_n: settings.value.topN,
      ...request
    }

    try {
      const response = await fetch('/api/analytics/wordfreq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: 'Failed to analyze' }))
        throw new Error(err.detail || 'Failed to analyze word frequency')
      }
      wordFrequency.value = await response.json()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
      console.error('[analyticsStore] fetchWordFrequency error:', e)
    } finally {
      loading.value = false
    }
  }

  async function fetchNgrams(request?: Partial<NgramRequest>): Promise<void> {
    loading.value = true
    error.value = null

    const payload: NgramRequest = {
      video_names: settings.value.selectedVideos ?? undefined,
      n: settings.value.ngramSize,
      stopword_preset: settings.value.stopwordPreset,
      top_n: settings.value.topN,
      ...request
    }

    try {
      const response = await fetch('/api/analytics/ngrams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: 'Failed to analyze' }))
        throw new Error(err.detail || 'Failed to analyze n-grams')
      }
      ngrams.value = await response.json()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
      console.error('[analyticsStore] fetchNgrams error:', e)
    } finally {
      loading.value = false
    }
  }

  async function fetchCorrelations(request?: Partial<CorrelationRequest>): Promise<void> {
    loading.value = true
    error.value = null

    const payload: CorrelationRequest = {
      video_names: settings.value.selectedVideos ?? undefined,
      ...request
    }

    try {
      const response = await fetch('/api/analytics/correlations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: 'Failed to analyze' }))
        throw new Error(err.detail || 'Failed to analyze correlations')
      }
      correlations.value = await response.json()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
      console.error('[analyticsStore] fetchCorrelations error:', e)
    } finally {
      loading.value = false
    }
  }

  function clearData(): void {
    wordFrequency.value = null
    ngrams.value = null
    correlations.value = null
    error.value = null
  }

  function updateSettings(updates: Partial<AnalyticsSettings>): void {
    settings.value = { ...settings.value, ...updates }
    saveSettings()
  }

  function saveSettings(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings.value))
    } catch (e) {
      console.warn('[analyticsStore] Failed to save settings:', e)
    }
  }

  function loadSettings(): void {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        settings.value = { ...defaultSettings, ...parsed }
      }
    } catch (e) {
      console.warn('[analyticsStore] Failed to load settings:', e)
    }
  }

  function resetSettings(): void {
    settings.value = { ...defaultSettings }
    saveSettings()
  }

  return {
    // State
    loading,
    error,
    wordFrequency,
    ngrams,
    correlations,
    summary,
    settings,

    // Computed
    hasData,
    captionsAnalyzed,
    hasSummary,

    // Actions
    fetchSummary,
    fetchWordFrequency,
    fetchNgrams,
    fetchCorrelations,
    clearData,
    updateSettings,
    loadSettings,
    resetSettings
  }
})
