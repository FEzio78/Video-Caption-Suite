# API Reference

Complete reference for the Video Caption Suite REST and WebSocket APIs.

**Base URL:** `http://localhost:8000`
**WebSocket:** `ws://localhost:8000/ws/progress`

## Table of Contents

- [Settings Endpoints](#settings-endpoints)
- [System Endpoints](#system-endpoints)
- [Directory Endpoints](#directory-endpoints)
- [Prompt Library Endpoints](#prompt-library-endpoints)
- [Video Endpoints](#video-endpoints)
- [Caption Endpoints](#caption-endpoints)
- [Model Endpoints](#model-endpoints)
- [Processing Endpoints](#processing-endpoints)
- [WebSocket API](#websocket-api)

---

## Settings Endpoints

### GET /api/settings

Retrieve current application settings.

**Response:**
```json
{
  "model_id": "Qwen/Qwen3-VL-8B-Instruct",
  "device": "cuda",
  "dtype": "bfloat16",
  "max_frames": 32,
  "frame_size": 336,
  "max_tokens": 512,
  "temperature": 0.3,
  "prompt": "Describe this video in detail...",
  "include_metadata": false,
  "use_sage_attention": false,
  "use_torch_compile": true,
  "batch_size": 1
}
```

**File Reference:** `backend/api.py:650-670`

---

### POST /api/settings

Update settings (partial update supported).

**Request Body:** (all fields optional)
```json
{
  "max_frames": 64,
  "temperature": 0.5,
  "batch_size": 2
}
```

**Response:**
```json
{
  "model_id": "Qwen/Qwen3-VL-8B-Instruct",
  "device": "cuda",
  "dtype": "bfloat16",
  "max_frames": 64,
  "frame_size": 336,
  "max_tokens": 512,
  "temperature": 0.5,
  "prompt": "...",
  "include_metadata": false,
  "use_sage_attention": false,
  "use_torch_compile": true,
  "batch_size": 2
}
```

**File Reference:** `backend/api.py:673-710`

---

### POST /api/settings/reset

Reset all settings to defaults.

**Response:**
```json
{
  "model_id": "Qwen/Qwen3-VL-8B-Instruct",
  "device": "cuda",
  "dtype": "bfloat16",
  "max_frames": 32,
  "frame_size": 336,
  "max_tokens": 512,
  "temperature": 0.3,
  "prompt": "Describe this video...",
  "include_metadata": false,
  "use_sage_attention": false,
  "use_torch_compile": true,
  "batch_size": 1
}
```

**File Reference:** `backend/api.py:713-730`

---

## System Endpoints

### GET /api/system/gpu

Get GPU information and system capabilities.

**Response:**
```json
{
  "cuda_available": true,
  "gpu_count": 2,
  "gpus": [
    {
      "index": 0,
      "name": "NVIDIA GeForce RTX 4090",
      "memory_total_gb": 24.0,
      "memory_free_gb": 22.5
    },
    {
      "index": 1,
      "name": "NVIDIA GeForce RTX 4090",
      "memory_total_gb": 24.0,
      "memory_free_gb": 23.8
    }
  ],
  "max_batch_size": 2
}
```

**File Reference:** `backend/api.py:580-600`

---

## Directory Endpoints

### GET /api/directory

Get current working directory and subfolder setting.

**Response:**
```json
{
  "directory": "C:/Videos/MyProject",
  "traverse_subfolders": true
}
```

**File Reference:** `backend/api.py:280-295`

---

### POST /api/directory

Set working directory.

**Request Body:**
```json
{
  "directory": "C:/Videos/NewProject",
  "traverse_subfolders": false
}
```

**Response:**
```json
{
  "directory": "C:/Videos/NewProject",
  "traverse_subfolders": false
}
```

**Errors:**
- `400 Bad Request`: Directory does not exist
- `400 Bad Request`: Path contains invalid characters (`..`)

**File Reference:** `backend/api.py:298-330`

---

### GET /api/directory/browse

Browse directories for the folder picker UI.

**Query Parameters:**
- `path` (optional): Directory path to browse. If omitted, returns root drives (Windows) or `/` (Unix).

**Response:**
```json
{
  "current_path": "C:/Videos",
  "parent_path": "C:/",
  "directories": [
    {"name": "Project1", "path": "C:/Videos/Project1"},
    {"name": "Project2", "path": "C:/Videos/Project2"}
  ]
}
```

**File Reference:** `backend/api.py:333-390`

---

## Prompt Library Endpoints

### GET /api/prompts

List all saved prompts.

**Response:**
```json
{
  "prompts": [
    {
      "id": "abc123",
      "name": "Detailed Description",
      "prompt": "Describe this video in detail including...",
      "created_at": "2025-01-15T10:30:00Z",
      "updated_at": "2025-01-15T10:30:00Z"
    }
  ]
}
```

**File Reference:** `backend/api.py:200-220`

---

### POST /api/prompts

Create a new prompt.

**Request Body:**
```json
{
  "name": "Action Scene",
  "prompt": "Describe the action and movement in this video..."
}
```

**Response:**
```json
{
  "id": "xyz789",
  "name": "Action Scene",
  "prompt": "Describe the action and movement...",
  "created_at": "2025-01-20T15:00:00Z",
  "updated_at": "2025-01-20T15:00:00Z"
}
```

**File Reference:** `backend/api.py:223-245`

---

### GET /api/prompts/{prompt_id}

Get a specific prompt by ID.

**Response:**
```json
{
  "id": "abc123",
  "name": "Detailed Description",
  "prompt": "Describe this video...",
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T10:30:00Z"
}
```

**Errors:**
- `404 Not Found`: Prompt not found

**File Reference:** `backend/api.py:248-260`

---

### PUT /api/prompts/{prompt_id}

Update an existing prompt.

**Request Body:**
```json
{
  "name": "Updated Name",
  "prompt": "Updated prompt text..."
}
```

**Response:** Updated prompt object

**File Reference:** `backend/api.py:263-280`

---

### DELETE /api/prompts/{prompt_id}

Delete a prompt.

**Response:**
```json
{
  "success": true
}
```

**File Reference:** `backend/api.py:283-295`

---

## Video Endpoints

### GET /api/videos

List all videos in the working directory.

**Response:**
```json
{
  "videos": [
    {
      "name": "video1.mp4",
      "path": "C:/Videos/video1.mp4",
      "size_bytes": 104857600,
      "size_mb": 100.0,
      "duration_seconds": 120.5,
      "width": 1920,
      "height": 1080,
      "fps": 30.0,
      "has_caption": true
    }
  ],
  "total": 150,
  "directory": "C:/Videos"
}
```

**File Reference:** `backend/api.py:400-450`

---

### GET /api/videos/stream

Stream video list via Server-Sent Events (SSE). Preferred for large libraries.

**Response:** SSE stream with events:
```
event: video
data: {"name": "video1.mp4", "size_bytes": 104857600, ...}

event: video
data: {"name": "video2.mp4", "size_bytes": 52428800, ...}

event: complete
data: {"total": 150}
```

**File Reference:** `backend/api.py:453-510`

---

### POST /api/videos/upload

Upload a video file.

**Request:** `multipart/form-data` with `file` field

**Response:**
```json
{
  "success": true,
  "video": {
    "name": "uploaded_video.mp4",
    "path": "C:/Videos/uploaded_video.mp4",
    "size_bytes": 52428800
  }
}
```

**File Reference:** `backend/api.py:513-545`

---

### DELETE /api/videos/{video_name}

Delete a video file.

**Response:**
```json
{
  "success": true
}
```

**Errors:**
- `404 Not Found`: Video not found
- `400 Bad Request`: Invalid filename

**File Reference:** `backend/api.py:548-570`

---

### GET /api/videos/{video_name}/thumbnail

Get video thumbnail (generated and cached).

**Response:** JPEG image (`image/jpeg`)

**Caching:** Thumbnails are cached in `.thumbnails/` directory with MD5-based filenames.

**File Reference:** `backend/api.py:573-610`

---

### GET /api/videos/{video_name}/stream

Stream video for preview playback.

**Response:** Video stream with range request support (`video/mp4`)

**File Reference:** `backend/api.py:613-645`

---

## Caption Endpoints

### GET /api/captions

List all generated captions.

**Response:**
```json
{
  "captions": [
    {
      "video_name": "video1.mp4",
      "caption_path": "C:/Videos/video1.txt",
      "caption_text": "This video shows...",
      "created_at": "2025-01-20T14:30:00Z"
    }
  ]
}
```

**File Reference:** `backend/api.py:733-760`

---

### GET /api/captions/{video_name}

Get caption for a specific video.

**Response:**
```json
{
  "video_name": "video1.mp4",
  "caption_path": "C:/Videos/video1.txt",
  "caption_text": "This video shows a person walking...",
  "created_at": "2025-01-20T14:30:00Z"
}
```

**Errors:**
- `404 Not Found`: Caption not found

**File Reference:** `backend/api.py:763-785`

---

### DELETE /api/captions/{video_name}

Delete a caption file.

**Response:**
```json
{
  "success": true
}
```

**File Reference:** `backend/api.py:788-805`

---

## Model Endpoints

### GET /api/model/status

Get current model loading status.

**Response:**
```json
{
  "loaded": true,
  "model_id": "Qwen/Qwen3-VL-8B-Instruct",
  "device": "cuda:0",
  "devices_loaded": ["cuda:0", "cuda:1"],
  "vram_used_gb": 32.5,
  "sage_attention_active": false,
  "torch_compiled": true
}
```

**File Reference:** `backend/api.py:808-830`

---

### POST /api/model/load

Pre-load model to VRAM (optional - happens automatically on first process).

**Response:**
```json
{
  "success": true,
  "message": "Model loaded successfully"
}
```

**File Reference:** `backend/api.py:833-860`

---

### POST /api/model/unload

Unload model and free VRAM.

**Response:**
```json
{
  "success": true,
  "message": "Model unloaded"
}
```

**Errors:**
- `409 Conflict`: Processing in progress

**File Reference:** `backend/api.py:777-788`

---

## Processing Endpoints

### POST /api/process/start

Start video processing.

**Request Body:** (all fields optional)
```json
{
  "video_names": ["video1.mp4", "video2.mp4"],
  "settings": {
    "max_frames": 64,
    "temperature": 0.5
  }
}
```

If `video_names` is omitted, processes all uncaptioned videos.

**Response:**
```json
{
  "success": true,
  "message": "Processing started",
  "total_videos": 5
}
```

**Errors:**
- `409 Conflict`: Processing already in progress

**File Reference:** `backend/api.py:800-870`

---

### POST /api/process/stop

Stop current processing.

**Response:**
```json
{
  "success": true,
  "message": "Processing stopped"
}
```

**File Reference:** `backend/api.py:873-890`

---

### GET /api/process/status

Get current processing status.

**Response:**
```json
{
  "stage": "processing",
  "current_video": "video3.mp4",
  "video_index": 2,
  "total_videos": 10,
  "completed_videos": 2,
  "tokens_generated": 1547,
  "tokens_per_sec": 45.2,
  "model_loaded": true,
  "vram_used_gb": 16.8,
  "substage": "generating",
  "substage_progress": 0.65,
  "elapsed_time": 125.4,
  "batch_size": 2,
  "workers": [
    {
      "worker_id": 0,
      "device": "cuda:0",
      "current_video": "video3.mp4",
      "substage": "generating",
      "substage_progress": 0.65
    },
    {
      "worker_id": 1,
      "device": "cuda:1",
      "current_video": "video4.mp4",
      "substage": "extracting_frames",
      "substage_progress": 0.3
    }
  ]
}
```

**File Reference:** `backend/api.py:893-910`

---

## WebSocket API

### Connection

```javascript
const ws = new WebSocket('ws://localhost:8000/ws/progress');
```

### Messages Received

**Progress Update:**
```json
{
  "type": "progress",
  "data": {
    "stage": "processing",
    "current_video": "video1.mp4",
    "video_index": 0,
    "total_videos": 5,
    "completed_videos": 0,
    "tokens_generated": 256,
    "tokens_per_sec": 42.5,
    "model_loaded": true,
    "vram_used_gb": 16.5,
    "substage": "generating",
    "substage_progress": 0.45,
    "elapsed_time": 30.2,
    "batch_size": 1,
    "workers": []
  }
}
```

**File Reference:** `backend/api.py:120-180`

### Ping/Pong

The frontend sends periodic pings to keep the connection alive:

```javascript
// Client sends
ws.send(JSON.stringify({ type: 'ping' }));

// Server responds
{ "type": "pong" }
```

### Reconnection

The frontend automatically reconnects with exponential backoff:
- Initial delay: 1 second
- Max delay: 30 seconds
- Max attempts: 5

**File Reference:** `frontend/src/composables/useWebSocket.ts`

---

## Error Responses

All error responses follow this format:

```json
{
  "detail": "Error message describing the problem"
}
```

**Common HTTP Status Codes:**
- `400 Bad Request`: Invalid input or parameters
- `404 Not Found`: Resource not found
- `409 Conflict`: Operation conflicts with current state
- `500 Internal Server Error`: Server-side error

---

## Rate Limiting

Currently no rate limiting is implemented. The API is designed for local use.

---

## CORS Configuration

CORS is configured to allow all origins in development:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

For production deployment, restrict `allow_origins` to specific domains.

**File Reference:** `backend/api.py:50-60`
