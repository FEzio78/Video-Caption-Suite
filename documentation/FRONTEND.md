# Frontend Architecture

Complete reference for the Vue 3 frontend application.

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Vue 3 | 3.4.15+ | UI framework (Composition API) |
| TypeScript | 5.3.3+ | Type safety |
| Pinia | 2.1.7+ | State management |
| Vue Router | 4.2.5+ | Routing (minimal use) |
| Tailwind CSS | 3.4.1+ | Styling |
| Vite | 5.0.12+ | Build tool |
| Vitest | 1.2.0+ | Testing |

## Project Structure

```
frontend/src/
├── main.ts                 # Application entry point
├── App.vue                 # Root component (464 lines)
├── components/
│   ├── base/               # Reusable UI primitives
│   │   ├── BaseButton.vue
│   │   ├── BaseInput.vue
│   │   ├── BaseSelect.vue
│   │   ├── BaseSlider.vue
│   │   ├── BaseToggle.vue
│   │   ├── BaseTextarea.vue
│   │   ├── BaseCard.vue
│   │   ├── LoadingSpinner.vue
│   │   └── EmptyState.vue
│   ├── layout/             # Structural components
│   │   ├── LayoutSidebar.vue
│   │   ├── ResizablePanel.vue
│   │   └── AppHeader.vue
│   ├── settings/           # Settings UI
│   │   ├── SettingsPanel.vue
│   │   ├── DirectorySettings.vue
│   │   ├── ModelSettings.vue
│   │   ├── InferenceSettings.vue
│   │   ├── PromptSettings.vue
│   │   └── PromptLibrary.vue
│   ├── video/              # Video display
│   │   ├── VideoTile.vue
│   │   ├── VideoGridToolbar.vue
│   │   └── VirtualGrid.vue
│   ├── caption/            # Caption display
│   │   ├── CaptionPanel.vue
│   │   └── CaptionViewer.vue
│   └── progress/           # Progress indicators
│       ├── StatusPanel.vue
│       ├── ProgressBar.vue
│       ├── ProgressRing.vue
│       ├── StageProgress.vue
│       └── TokenCounter.vue
├── stores/                 # Pinia state management
│   ├── videoStore.ts
│   ├── progressStore.ts
│   └── settingsStore.ts
├── composables/            # Reusable logic
│   ├── useApi.ts
│   ├── useWebSocket.ts
│   └── useResizable.ts
├── types/                  # TypeScript definitions
│   ├── settings.ts
│   ├── progress.ts
│   ├── video.ts
│   └── api.ts
└── utils/                  # Helper functions
    └── formatters.ts
```

---

## State Management (Pinia Stores)

### videoStore

**Purpose:** Manages video list, captions, and selection state.

**File:** `frontend/src/stores/videoStore.ts`

**State:**
```typescript
interface VideoState {
  videos: VideoInfo[]
  captions: Map<string, CaptionInfo>
  selectedVideos: Set<string>
  loading: boolean
  error: string | null
  loadingTotal: number
  loadingLoaded: number
}
```

**Getters:**
```typescript
// Videos with caption status merged
videosWithStatus: VideoWithStatus[]

// Count helpers
totalVideos: number
captionedVideos: number
pendingVideos: number

// Selection as array
selectedVideosList: string[]

// Loading progress (0-100)
loadingProgress: number
```

**Actions:**
```typescript
// Fetch videos via SSE streaming
fetchVideos(): Promise<void>

// Fetch captions list
fetchCaptions(): Promise<void>

// Toggle video selection
toggleVideoSelection(videoName: string): void

// Select/deselect all
selectAll(): void
deselectAll(): void

// Select only uncaptioned videos
selectUncaptioned(): void

// Mark video as captioned (after processing)
markVideoAsCaptioned(videoName: string): void

// Delete a caption
deleteCaption(videoName: string): Promise<void>
```

**SSE Streaming:**
The `fetchVideos()` action uses Server-Sent Events for progressive loading:

```typescript
const eventSource = new EventSource('/api/videos/stream')

eventSource.addEventListener('video', (event) => {
  const video = JSON.parse(event.data)
  this.videos.push(video)
  this.loadingLoaded++
})

eventSource.addEventListener('complete', (event) => {
  const { total } = JSON.parse(event.data)
  this.loadingTotal = total
  eventSource.close()
})
```

---

### progressStore

**Purpose:** Tracks processing progress from WebSocket updates.

**File:** `frontend/src/stores/progressStore.ts`

**State:**
```typescript
interface ProgressState {
  stage: ProcessingStage
  current_video: string | null
  video_index: number
  total_videos: number
  completed_videos: number
  tokens_generated: number
  tokens_per_sec: number
  model_loaded: boolean
  vram_used_gb: number
  substage: ProcessingSubstage
  substage_progress: number
  error_message: string | null
  elapsed_time: number
  batch_size: number
  workers: WorkerProgress[]
  wsConnected: boolean
}
```

**Getters:**
```typescript
// Stage checks
isIdle: boolean
isLoadingModel: boolean
isProcessing: boolean
isComplete: boolean
hasError: boolean

// Multi-GPU check
isMultiGPU: boolean  // batch_size > 1

// Overall progress (0-100)
overallProgress: number

// Current video progress within substages
currentVideoProgress: number

// Formatted elapsed time (MM:SS)
formattedElapsedTime: string

// Estimated time remaining
estimatedTimeRemaining: string | null
```

**Actions:**
```typescript
// Update from WebSocket message
updateFromWebSocket(data: Partial<ProgressState>): void

// Set WebSocket connection status
setWsConnected(connected: boolean): void

// Reset to initial state
reset(): void
```

**Progress Calculation:**
```typescript
overallProgress(): number {
  if (this.total_videos === 0) return 0

  const completedProgress = this.completed_videos / this.total_videos
  const currentProgress = this.substage_progress / this.total_videos

  return Math.round((completedProgress + currentProgress) * 100)
}
```

---

### settingsStore

**Purpose:** Manages application settings and GPU info.

**File:** `frontend/src/stores/settingsStore.ts`

**State:**
```typescript
interface SettingsState {
  settings: Settings
  originalSettings: Settings  // For change detection
  gpuInfo: SystemGPUInfo | null
  loading: boolean
  error: string | null
}
```

**Getters:**
```typescript
// Check if settings have been modified
hasChanges: boolean

// Multi-GPU availability
hasMultiGPU: boolean

// Maximum recommended batch size
maxBatchSize: number
```

**Actions:**
```typescript
// Fetch settings and GPU info
fetchSettings(): Promise<void>

// Update settings (partial)
updateSettings(updates: Partial<Settings>): Promise<void>

// Reset to defaults
resetSettings(): Promise<void>

// Fetch GPU information
fetchGPUInfo(): Promise<void>
```

---

## Composables

### useWebSocket

**Purpose:** WebSocket connection with auto-reconnect.

**File:** `frontend/src/composables/useWebSocket.ts`

**Usage:**
```typescript
const { isConnected, connect, disconnect, send } = useWebSocket({
  url: 'ws://localhost:8000/ws/progress',
  onMessage: (data) => {
    progressStore.updateFromWebSocket(data)
  },
  onConnect: () => {
    progressStore.setWsConnected(true)
  },
  onDisconnect: () => {
    progressStore.setWsConnected(false)
  }
})

// Connect on mount
onMounted(() => connect())

// Cleanup on unmount
onUnmounted(() => disconnect())
```

**Features:**
- Automatic reconnection with exponential backoff
- Ping/pong keep-alive (25 second interval)
- Max 5 reconnection attempts
- Cleanup on component unmount

**Reconnection Logic:**
```typescript
const reconnect = () => {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) return

  const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000)
  setTimeout(() => {
    reconnectAttempts++
    connect()
  }, delay)
}
```

---

### useApi

**Purpose:** HTTP request wrapper with error handling.

**File:** `frontend/src/composables/useApi.ts`

**Methods:**
```typescript
// Generic request
request<T>(url: string, options?: RequestInit): Promise<T>

// Model operations
loadModel(): Promise<void>
unloadModel(): Promise<void>
getModelStatus(): Promise<ModelStatus>

// Processing
startProcessing(videoNames?: string[]): Promise<void>
stopProcessing(): Promise<void>

// Prompts
getPrompts(): Promise<PromptLibrary>
createPrompt(name: string, prompt: string): Promise<SavedPrompt>
updatePrompt(id: string, updates: object): Promise<SavedPrompt>
deletePrompt(id: string): Promise<void>

// Directory
browseDirectory(path?: string): Promise<DirectoryBrowse>
setDirectory(path: string, traverseSubfolders: boolean): Promise<void>
```

**Error Handling:**
```typescript
const request = async <T>(url: string, options?: RequestInit): Promise<T> => {
  try {
    const response = await fetch(url, options)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Request failed')
    }

    return response.json()
  } catch (err) {
    console.error(`API Error: ${url}`, err)
    throw err
  }
}
```

---

### useResizable

**Purpose:** Draggable panel resizing.

**File:** `frontend/src/composables/useResizable.ts`

**Usage:**
```typescript
const { width, isResizing, startResize } = useResizable({
  initialWidth: 320,
  minWidth: 200,
  maxWidth: 600
})
```

**Template:**
```vue
<div :style="{ width: `${width}px` }">
  <div
    class="resize-handle"
    @mousedown="startResize"
  />
</div>
```

---

## Key Components

### App.vue (Root Component)

**File:** `frontend/src/App.vue`

**Responsibilities:**
- WebSocket connection management
- Overall layout orchestration
- Model load/unload buttons
- Process start/stop buttons
- Video grid with virtual scrolling
- Caption panel display

**Key Sections:**
```vue
<template>
  <div class="app-container">
    <!-- Header with status -->
    <header>
      <StatusPanel />
      <ModelControls />
      <ProcessControls />
    </header>

    <!-- Main content -->
    <main>
      <!-- Left sidebar (settings) -->
      <LayoutSidebar>
        <SettingsPanel />
      </LayoutSidebar>

      <!-- Video grid -->
      <div class="video-grid">
        <VideoGridToolbar />
        <VirtualGrid :videos="videosWithStatus">
          <template #item="{ video }">
            <VideoTile :video="video" />
          </template>
        </VirtualGrid>
      </div>

      <!-- Right panel (captions) -->
      <CaptionPanel />
    </main>
  </div>
</template>
```

---

### VideoTile.vue

**Purpose:** Individual video card in the grid.

**Props:**
```typescript
interface Props {
  video: VideoWithStatus
  selected: boolean
}
```

**Features:**
- Thumbnail display with lazy loading
- Video preview on hover
- Selection checkbox
- Caption status indicator
- Metadata display (size, duration, resolution)
- Click to view caption

**Events:**
```typescript
emit('select', videoName: string)
emit('view-caption', videoName: string)
```

---

### SettingsPanel.vue

**Purpose:** Tabbed settings interface.

**Tabs:**
1. **Directory** - Working folder selection
2. **Model** - Model selection and loading
3. **Inference** - Max frames, tokens, temperature
4. **Prompt** - Custom captioning prompt
5. **Library** - Saved prompts management

---

### ProgressBar.vue / ProgressRing.vue

**Purpose:** Visual progress indicators.

**Props:**
```typescript
interface Props {
  progress: number      // 0-100
  showLabel?: boolean   // Show percentage text
  size?: 'sm' | 'md' | 'lg'
  color?: string        // Tailwind color class
}
```

---

## Type Definitions

### settings.ts

```typescript
type DeviceType = 'cuda' | 'cpu'
type DtypeType = 'float16' | 'bfloat16' | 'float32'

interface Settings {
  model_id: string
  device: DeviceType
  dtype: DtypeType
  max_frames: number
  frame_size: number
  max_tokens: number
  temperature: number
  prompt: string
  include_metadata: boolean
  use_sage_attention: boolean
  use_torch_compile: boolean
  batch_size: number
}

interface GPUInfo {
  index: number
  name: string
  memory_total_gb: number
  memory_free_gb: number
}

interface SystemGPUInfo {
  cuda_available: boolean
  gpu_count: number
  gpus: GPUInfo[]
  max_batch_size: number
}
```

### progress.ts

```typescript
type ProcessingStage =
  | 'idle'
  | 'loading_model'
  | 'processing'
  | 'complete'
  | 'error'

type ProcessingSubstage =
  | 'idle'
  | 'extracting_frames'
  | 'encoding'
  | 'generating'

interface WorkerProgress {
  worker_id: number
  device: string
  current_video: string | null
  substage: ProcessingSubstage
  substage_progress: number
}

interface ProgressState {
  stage: ProcessingStage
  current_video: string | null
  video_index: number
  total_videos: number
  completed_videos: number
  tokens_generated: number
  tokens_per_sec: number
  model_loaded: boolean
  vram_used_gb: number
  substage: ProcessingSubstage
  substage_progress: number
  error_message: string | null
  elapsed_time: number
  batch_size: number
  workers: WorkerProgress[]
}
```

### video.ts

```typescript
interface VideoInfo {
  name: string
  path: string
  size_bytes: number
  size_mb: number
  duration_seconds: number
  width: number
  height: number
  fps: number
  has_caption: boolean
}

interface CaptionInfo {
  video_name: string
  caption_path: string
  caption_text: string
  created_at: string
}

type VideoStatus = 'pending' | 'captioned' | 'processing'

interface VideoWithStatus extends VideoInfo {
  status: VideoStatus
}
```

---

## Styling

### Tailwind Configuration

**File:** `frontend/tailwind.config.js`

**Custom Colors:**
```javascript
colors: {
  primary: {
    50: '#faf5ff',
    // ... purple gradient
    950: '#2e1065'
  },
  dark: {
    50: '#f8fafc',
    // ... dark theme
    850: '#1a1f2e',  // Custom shade
    950: '#0f1219'
  }
}
```

**Custom Animations:**
```javascript
animation: {
  'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite'
}
```

### Common Classes

```css
/* Card styling */
.card {
  @apply bg-dark-800 rounded-lg border border-dark-700;
}

/* Button variants */
.btn-primary {
  @apply bg-primary-600 hover:bg-primary-700 text-white;
}

.btn-danger {
  @apply bg-red-600 hover:bg-red-700 text-white;
}

.btn-ghost {
  @apply bg-transparent hover:bg-dark-700 text-gray-300;
}
```

---

## Testing

### Test Setup

**File:** `frontend/vitest.config.ts`

```typescript
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts']
  }
})
```

### Component Tests

**Location:** `frontend/src/components/**/__tests__/`

**Example:**
```typescript
// BaseButton.test.ts
import { mount } from '@vue/test-utils'
import BaseButton from '../BaseButton.vue'

describe('BaseButton', () => {
  it('renders slot content', () => {
    const wrapper = mount(BaseButton, {
      slots: { default: 'Click me' }
    })
    expect(wrapper.text()).toBe('Click me')
  })

  it('emits click event', async () => {
    const wrapper = mount(BaseButton)
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })
})
```

### Store Tests

```typescript
// settingsStore.test.ts
import { setActivePinia, createPinia } from 'pinia'
import { useSettingsStore } from '../settingsStore'

describe('settingsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('fetches settings from API', async () => {
    const store = useSettingsStore()
    await store.fetchSettings()
    expect(store.settings.model_id).toBeDefined()
  })
})
```

---

## Build & Development

### Scripts

```bash
# Development server (hot reload)
npm run dev

# Production build
npm run build

# Type checking
npm run build:check

# Run tests
npm run test

# Test with UI
npm run test:ui

# Coverage report
npm run test:coverage

# Linting
npm run lint
```

### Environment

Development proxy configured in `vite.config.ts`:

```typescript
server: {
  port: 5173,
  proxy: {
    '/api': 'http://localhost:8000',
    '/ws': {
      target: 'ws://localhost:8000',
      ws: true
    }
  }
}
```
