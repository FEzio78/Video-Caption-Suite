"""
Tests for Pydantic schemas
"""

import pytest
from pydantic import ValidationError

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from backend.schemas import (
    Settings, SettingsUpdate, ProgressUpdate, VideoInfo,
    ProcessingStage, ProcessingSubstage, DeviceType, DtypeType
)


class TestSettings:
    """Tests for Settings schema"""

    def test_default_settings(self):
        """Test default settings values"""
        settings = Settings()

        assert settings.model_id == "Qwen/Qwen3-VL-8B-Instruct"
        assert settings.device == DeviceType.CUDA
        assert settings.dtype == DtypeType.BFLOAT16
        assert settings.max_frames == 16
        assert settings.frame_size == 336
        assert settings.max_tokens == 512
        assert settings.temperature == 0.3
        assert settings.use_sage_attention is False
        assert settings.use_torch_compile is True
        assert settings.include_metadata is False

    def test_custom_settings(self):
        """Test settings with custom values"""
        settings = Settings(
            model_id="custom/model",
            device=DeviceType.CPU,
            dtype=DtypeType.FLOAT32,
            max_frames=8,
            frame_size=224,
            max_tokens=256,
            temperature=0.7,
        )

        assert settings.model_id == "custom/model"
        assert settings.device == DeviceType.CPU
        assert settings.dtype == DtypeType.FLOAT32
        assert settings.max_frames == 8
        assert settings.frame_size == 224
        assert settings.max_tokens == 256
        assert settings.temperature == 0.7

    def test_settings_validation_max_frames(self):
        """Test max_frames validation"""
        # Valid range
        Settings(max_frames=1)
        Settings(max_frames=128)

        # Invalid: too low
        with pytest.raises(ValidationError):
            Settings(max_frames=0)

        # Invalid: too high
        with pytest.raises(ValidationError):
            Settings(max_frames=129)

    def test_settings_validation_frame_size(self):
        """Test frame_size validation"""
        # Valid range
        Settings(frame_size=224)
        Settings(frame_size=672)

        # Invalid: too low
        with pytest.raises(ValidationError):
            Settings(frame_size=200)

        # Invalid: too high
        with pytest.raises(ValidationError):
            Settings(frame_size=700)

    def test_settings_validation_temperature(self):
        """Test temperature validation"""
        # Valid range
        Settings(temperature=0.0)
        Settings(temperature=2.0)

        # Invalid: negative
        with pytest.raises(ValidationError):
            Settings(temperature=-0.1)

        # Invalid: too high
        with pytest.raises(ValidationError):
            Settings(temperature=2.1)


class TestSettingsUpdate:
    """Tests for SettingsUpdate schema"""

    def test_partial_update(self):
        """Test partial settings update"""
        update = SettingsUpdate(max_frames=8)

        assert update.max_frames == 8
        assert update.model_id is None
        assert update.device is None

    def test_full_update(self):
        """Test full settings update"""
        update = SettingsUpdate(
            model_id="new/model",
            device=DeviceType.CPU,
            max_frames=32,
        )

        assert update.model_id == "new/model"
        assert update.device == DeviceType.CPU
        assert update.max_frames == 32

    def test_empty_update(self):
        """Test empty update"""
        update = SettingsUpdate()

        assert update.model_id is None
        assert update.device is None
        assert update.max_frames is None


class TestProgressUpdate:
    """Tests for ProgressUpdate schema"""

    def test_default_progress(self):
        """Test default progress values"""
        progress = ProgressUpdate()

        assert progress.stage == ProcessingStage.IDLE
        assert progress.current_video is None
        assert progress.video_index == 0
        assert progress.total_videos == 0
        assert progress.tokens_generated == 0
        assert progress.tokens_per_sec == 0.0
        assert progress.model_loaded is False
        assert progress.vram_used_gb == 0.0
        assert progress.substage == ProcessingSubstage.IDLE
        assert progress.substage_progress == 0.0

    def test_progress_during_processing(self):
        """Test progress during active processing"""
        progress = ProgressUpdate(
            stage=ProcessingStage.PROCESSING,
            current_video="test_video.mp4",
            video_index=2,
            total_videos=10,
            tokens_generated=500,
            tokens_per_sec=28.5,
            model_loaded=True,
            vram_used_gb=8.2,
            substage=ProcessingSubstage.GENERATING,
            substage_progress=0.75,
        )

        assert progress.stage == ProcessingStage.PROCESSING
        assert progress.current_video == "test_video.mp4"
        assert progress.video_index == 2
        assert progress.total_videos == 10
        assert progress.tokens_per_sec == 28.5
        assert progress.substage == ProcessingSubstage.GENERATING
        assert progress.substage_progress == 0.75

    def test_substage_progress_validation(self):
        """Test substage_progress must be 0-1"""
        # Valid range
        ProgressUpdate(substage_progress=0.0)
        ProgressUpdate(substage_progress=1.0)
        ProgressUpdate(substage_progress=0.5)

        # Invalid: negative
        with pytest.raises(ValidationError):
            ProgressUpdate(substage_progress=-0.1)

        # Invalid: over 1
        with pytest.raises(ValidationError):
            ProgressUpdate(substage_progress=1.1)


class TestVideoInfo:
    """Tests for VideoInfo schema"""

    def test_minimal_video_info(self):
        """Test video info with minimal data"""
        video = VideoInfo(
            name="test.mp4",
            path="/path/to/test.mp4",
            size_mb=25.5,
        )

        assert video.name == "test.mp4"
        assert video.path == "/path/to/test.mp4"
        assert video.size_mb == 25.5
        assert video.duration_sec is None
        assert video.has_caption is False

    def test_full_video_info(self):
        """Test video info with all fields"""
        video = VideoInfo(
            name="test.mp4",
            path="/path/to/test.mp4",
            size_mb=25.5,
            duration_sec=120.5,
            width=1920,
            height=1080,
            has_caption=True,
            caption_preview="This is a preview...",
        )

        assert video.duration_sec == 120.5
        assert video.width == 1920
        assert video.height == 1080
        assert video.has_caption is True
        assert video.caption_preview == "This is a preview..."


class TestEnums:
    """Tests for enum types"""

    def test_device_type_values(self):
        """Test DeviceType enum values"""
        assert DeviceType.CUDA.value == "cuda"
        assert DeviceType.CPU.value == "cpu"

    def test_dtype_type_values(self):
        """Test DtypeType enum values"""
        assert DtypeType.FLOAT16.value == "float16"
        assert DtypeType.BFLOAT16.value == "bfloat16"
        assert DtypeType.FLOAT32.value == "float32"

    def test_processing_stage_values(self):
        """Test ProcessingStage enum values"""
        assert ProcessingStage.IDLE.value == "idle"
        assert ProcessingStage.LOADING_MODEL.value == "loading_model"
        assert ProcessingStage.PROCESSING.value == "processing"
        assert ProcessingStage.COMPLETE.value == "complete"
        assert ProcessingStage.ERROR.value == "error"

    def test_processing_substage_values(self):
        """Test ProcessingSubstage enum values"""
        assert ProcessingSubstage.IDLE.value == "idle"
        assert ProcessingSubstage.EXTRACTING_FRAMES.value == "extracting_frames"
        assert ProcessingSubstage.ENCODING.value == "encoding"
        assert ProcessingSubstage.GENERATING.value == "generating"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
