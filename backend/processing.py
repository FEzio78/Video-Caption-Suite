"""
Processing manager for video captioning with progress callbacks
"""

import asyncio
import time
import torch
from pathlib import Path
from typing import Callable, Optional, List, Any, Dict
from dataclasses import dataclass, field

import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

from backend.schemas import (
    Settings, ProgressUpdate, ProcessingStage, ProcessingSubstage, VideoInfo
)


@dataclass
class ProcessingState:
    """Mutable state for tracking processing progress"""
    stage: ProcessingStage = ProcessingStage.IDLE
    current_video: Optional[str] = None
    video_index: int = 0
    total_videos: int = 0
    tokens_generated: int = 0
    tokens_per_sec: float = 0.0
    model_loaded: bool = False
    vram_used_gb: float = 0.0
    substage: ProcessingSubstage = ProcessingSubstage.IDLE
    substage_progress: float = 0.0
    error_message: Optional[str] = None
    start_time: float = 0.0

    def to_progress_update(self) -> ProgressUpdate:
        elapsed = time.time() - self.start_time if self.start_time > 0 else 0.0
        return ProgressUpdate(
            stage=self.stage,
            current_video=self.current_video,
            video_index=self.video_index,
            total_videos=self.total_videos,
            tokens_generated=self.tokens_generated,
            tokens_per_sec=self.tokens_per_sec,
            model_loaded=self.model_loaded,
            vram_used_gb=self.vram_used_gb,
            substage=self.substage,
            substage_progress=self.substage_progress,
            error_message=self.error_message,
            elapsed_time=elapsed,
        )


class ProcessingManager:
    """
    Manages video processing with real-time progress updates.
    Wraps the existing model_loader and video_processor modules.
    """

    def __init__(self, progress_callback: Optional[Callable[[ProgressUpdate], Any]] = None):
        self.progress_callback = progress_callback
        self.model_info: Optional[Dict[str, Any]] = None
        self.should_stop = False
        self.is_processing = False
        self.state = ProcessingState()
        self._lock = asyncio.Lock()
        print("[ProcessingManager] Initialized")

    async def emit_progress(self):
        """Send current progress to callback"""
        if self.progress_callback:
            update = self.state.to_progress_update()
            if asyncio.iscoroutinefunction(self.progress_callback):
                await self.progress_callback(update)
            else:
                self.progress_callback(update)

    def _update_vram(self):
        """Update VRAM usage"""
        if torch.cuda.is_available():
            self.state.vram_used_gb = torch.cuda.memory_allocated() / (1024 ** 3)

    async def load_model(self, settings: Settings) -> bool:
        """
        Load the model with specified settings.
        Returns True on success, False on failure.
        """
        from model_loader import load_model, clear_cache

        print(f"[ProcessingManager] load_model called with model_id={settings.model_id}")

        async with self._lock:
            try:
                print("[ProcessingManager] Acquired lock, starting model load")
                self.state.stage = ProcessingStage.LOADING_MODEL
                self.state.substage = ProcessingSubstage.IDLE
                self.state.substage_progress = 0.0
                self.state.start_time = time.time()
                await self.emit_progress()

                # Clear existing model if any
                if self.model_info is not None:
                    clear_cache()
                    self.model_info = None

                self.state.substage_progress = 0.1
                await self.emit_progress()

                # Load model in thread pool to avoid blocking
                loop = asyncio.get_event_loop()
                self.model_info = await loop.run_in_executor(
                    None,
                    lambda: load_model(
                        model_id=settings.model_id,
                        device=settings.device.value,
                        dtype=settings.dtype.value,
                        use_sage_attention=settings.use_sage_attention,
                        use_torch_compile=settings.use_torch_compile,
                    )
                )

                self.state.model_loaded = True
                self.state.substage_progress = 1.0
                self._update_vram()
                self.state.stage = ProcessingStage.IDLE
                await self.emit_progress()

                print(f"[ProcessingManager] Model loaded successfully, VRAM: {self.state.vram_used_gb:.2f} GB")
                return True

            except Exception as e:
                print(f"[ProcessingManager] Model load FAILED: {e}")
                import traceback
                traceback.print_exc()
                self.state.stage = ProcessingStage.ERROR
                self.state.error_message = str(e)
                self.state.model_loaded = False
                await self.emit_progress()
                return False

    async def process_videos(
        self,
        videos: List[Path],
        settings: Settings,
    ) -> List[Dict[str, Any]]:
        """
        Process a list of videos and generate captions.
        Returns list of results for each video.
        """
        from model_loader import generate_caption
        from video_processor import process_video
        import config

        print(f"[ProcessingManager] process_videos called with {len(videos)} videos")
        for v in videos:
            print(f"  - {v}")

        results = []

        print(f"[ProcessingManager] Checking model state. model_loaded={self.state.model_loaded}, model_info={self.model_info is not None}")
        if not self.state.model_loaded or self.model_info is None:
            # Load model first (load_model acquires its own lock)
            print("[ProcessingManager] Model not loaded, loading now...")
            success = await self.load_model(settings)
            if not success:
                print("[ProcessingManager] Model load failed, returning early")
                return results
            print("[ProcessingManager] Model load succeeded")

        async with self._lock:
            print("[ProcessingManager] Acquired lock, starting video processing loop")
            self.is_processing = True
            self.should_stop = False
            self.state.stage = ProcessingStage.PROCESSING
            self.state.total_videos = len(videos)
            self.state.video_index = 0
            self.state.start_time = time.time()
            await self.emit_progress()

            loop = asyncio.get_event_loop()

            for i, video_path in enumerate(videos):
                if self.should_stop:
                    break

                self.state.video_index = i
                self.state.current_video = video_path.name
                self.state.substage = ProcessingSubstage.EXTRACTING_FRAMES
                self.state.substage_progress = 0.0
                await self.emit_progress()

                result = {
                    "video": video_path.name,
                    "success": False,
                    "error": None,
                    "caption": None,
                }

                try:
                    # Extract frames
                    self.state.substage_progress = 0.2
                    await self.emit_progress()

                    frames, video_meta = await loop.run_in_executor(
                        None,
                        lambda: process_video(
                            video_path,
                            max_frames=settings.max_frames,
                            frame_size=settings.frame_size,
                        )
                    )

                    self.state.substage = ProcessingSubstage.ENCODING
                    self.state.substage_progress = 0.4
                    await self.emit_progress()

                    # Generate caption
                    self.state.substage = ProcessingSubstage.GENERATING
                    self.state.substage_progress = 0.5
                    await self.emit_progress()

                    caption, gen_meta = await loop.run_in_executor(
                        None,
                        lambda: generate_caption(
                            model_info=self.model_info,
                            images=frames,
                            prompt=settings.prompt,
                            max_tokens=settings.max_tokens,
                            temperature=settings.temperature,
                        )
                    )

                    self.state.tokens_generated += gen_meta["output_tokens"]
                    self.state.tokens_per_sec = gen_meta["tokens_per_sec"]
                    self._update_vram()

                    # Save caption to same directory as video
                    self.state.substage_progress = 0.9
                    await self.emit_progress()

                    output_path = video_path.parent / (video_path.stem + config.OUTPUT_EXTENSION)
                    with open(output_path, "w", encoding="utf-8") as f:
                        f.write(caption)
                        if settings.include_metadata:
                            f.write("\n\n" + "=" * 60 + "\n")
                            f.write("METADATA\n")
                            f.write("=" * 60 + "\n")
                            f.write(f"Video: {video_path.name}\n")
                            f.write(f"Frames processed: {gen_meta['num_frames']}\n")
                            f.write(f"Output tokens: {gen_meta['output_tokens']}\n")
                            f.write(f"Tokens/sec: {gen_meta['tokens_per_sec']:.1f}\n")

                    result["success"] = True
                    result["caption"] = caption[:200] + "..." if len(caption) > 200 else caption
                    result["output_path"] = str(output_path)

                    self.state.substage_progress = 1.0
                    await self.emit_progress()

                except Exception as e:
                    result["error"] = str(e)
                    self.state.error_message = f"Error processing {video_path.name}: {e}"
                    await self.emit_progress()

                results.append(result)

            # Complete
            self.state.stage = ProcessingStage.COMPLETE
            self.state.substage = ProcessingSubstage.IDLE
            self.state.current_video = None
            self.is_processing = False
            await self.emit_progress()

        return results

    def stop(self):
        """Request processing to stop"""
        self.should_stop = True

    def get_model_status(self) -> Dict[str, Any]:
        """Get current model status"""
        self._update_vram()
        return {
            "loaded": self.state.model_loaded,
            "model_id": self.model_info.get("model_id") if self.model_info else None,
            "device": str(self.model_info.get("device")) if self.model_info else None,
            "vram_used_gb": self.state.vram_used_gb,
            "sage_attention_active": self.model_info.get("sage_attention", False) if self.model_info else False,
            "torch_compiled": self.model_info.get("torch_compiled", False) if self.model_info else False,
        }

    def reset(self):
        """Reset processing state"""
        self.state = ProcessingState()
        self.should_stop = False
        self.is_processing = False
