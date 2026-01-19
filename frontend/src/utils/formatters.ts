/**
 * Format duration in seconds to mm:ss format
 */
export function formatDuration(seconds: number | null | undefined): string | null {
  if (seconds == null) return null
  const totalSeconds = Math.floor(seconds)
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Format file size in MB to human readable format (KB, MB, GB)
 */
export function formatFileSize(mb: number): string {
  if (mb < 1) return `${(mb * 1024).toFixed(0)} KB`
  if (mb > 1024) return `${(mb / 1024).toFixed(1)} GB`
  return `${mb.toFixed(1)} MB`
}

/**
 * Format number with locale-aware separators
 */
export function formatNumber(num: number): string {
  return num.toLocaleString()
}

/**
 * Format decimal to fixed precision
 */
export function formatDecimal(num: number, precision: number = 1): string {
  return num.toFixed(precision)
}

/**
 * Format VRAM usage in GB
 */
export function formatVram(gb: number, precision: number = 1): string {
  return `${gb.toFixed(precision)} GB`
}

/**
 * Format frame count with 'f' suffix
 */
export function formatFrameCount(count: number | null | undefined): string | null {
  if (count == null) return null
  return `${count.toLocaleString()}f`
}
