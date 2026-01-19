import { ref, onUnmounted } from 'vue'

export interface ResizableOptions {
  initialWidth: number
  minWidth: number
  maxWidth: number
  direction: 'left' | 'right' // 'left' = grows from left edge, 'right' = grows from right edge
}

export function useResizable(options: ResizableOptions) {
  const width = ref(options.initialWidth)
  const isResizing = ref(false)

  function startResize(e: MouseEvent) {
    e.preventDefault()
    isResizing.value = true
    document.addEventListener('mousemove', doResize)
    document.addEventListener('mouseup', stopResize)
    document.body.style.cursor = 'ew-resize'
    document.body.style.userSelect = 'none'
  }

  function doResize(e: MouseEvent) {
    if (!isResizing.value) return

    const newWidth =
      options.direction === 'left' ? e.clientX : window.innerWidth - e.clientX

    width.value = Math.min(options.maxWidth, Math.max(options.minWidth, newWidth))
  }

  function stopResize() {
    isResizing.value = false
    document.removeEventListener('mousemove', doResize)
    document.removeEventListener('mouseup', stopResize)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }

  // Cleanup on unmount
  onUnmounted(() => {
    document.removeEventListener('mousemove', doResize)
    document.removeEventListener('mouseup', stopResize)
  })

  return {
    width,
    isResizing,
    startResize,
  }
}
