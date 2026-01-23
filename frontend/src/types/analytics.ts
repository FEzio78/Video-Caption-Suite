/**
 * Analytics types for word frequency analysis
 */

export type StopwordPreset = 'none' | 'english' | 'minimal'

export interface WordFrequencyItem {
  word: string
  count: number
  frequency: number // 0-1 percentage
}

export interface WordFrequencyRequest {
  video_names?: string[]
  stopword_preset?: StopwordPreset
  custom_stopwords?: string[]
  min_word_length?: number
  top_n?: number
}

export interface WordFrequencyResponse {
  words: WordFrequencyItem[]
  total_words: number
  total_unique_words: number
  captions_analyzed: number
  analysis_time_ms: number
}

export interface NgramItem {
  ngram: string[]
  display: string
  count: number
  frequency: number
}

export interface NgramRequest {
  video_names?: string[]
  n?: number // 2=bigrams, 3=trigrams, 4=4-grams
  stopword_preset?: StopwordPreset
  top_n?: number
  min_count?: number
}

export interface NgramResponse {
  ngrams: NgramItem[]
  n: number
  total_ngrams: number
  captions_analyzed: number
}

export interface CorrelationItem {
  word1: string
  word2: string
  co_occurrence: number
  pmi_score: number // Pointwise Mutual Information
}

export interface CorrelationRequest {
  video_names?: string[]
  target_words?: string[]
  window_size?: number
  min_co_occurrence?: number
  top_n?: number
}

export interface CorrelationResponse {
  correlations: CorrelationItem[]
  nodes: string[] // Unique words for network visualization
  captions_analyzed: number
}

export interface AnalyticsSummary {
  total_captions: number
  total_words: number
  unique_words: number
  avg_words_per_caption: number
  top_words: WordFrequencyItem[]
}

export type VisualizationType = 'bar' | 'wordcloud' | 'correlation'
export type AnalyticsTab = 'frequency' | 'ngrams' | 'correlations'

export interface AnalyticsSettings {
  stopwordPreset: StopwordPreset
  customStopwords: string[]
  minWordLength: number
  topN: number
  ngramSize: number
  visualizationType: VisualizationType
  selectedVideos: string[] | null // null = all videos
}
