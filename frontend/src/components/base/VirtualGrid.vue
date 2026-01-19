<script setup lang="ts" generic="T">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'

interface Props {
  items: T[]
  itemMinWidth: number
  gap?: number
  buffer?: number
  columns?: number // External column override
}

const props = withDefaults(defineProps<Props>(), {
  gap: 12,
  buffer: 2,
  columns: 0, // 0 = auto-calculate
})

const emit = defineEmits<{
  itemClick: [item: T, index: number]
  columnsChanged: [columns: number]
}>()

const containerRef = ref<HTMLElement | null>(null)
const scrollTop = ref(0)
const containerHeight = ref(0)
const containerWidth = ref(0)

// Calculate columns - use prop if provided, otherwise auto-calculate
const autoColumns = computed(() => {
  if (containerWidth.value === 0) return 1
  const availableWidth = containerWidth.value
  const cols = Math.floor((availableWidth + props.gap) / (props.itemMinWidth + props.gap))
  return Math.max(1, cols)
})

const columns = computed(() => {
  return props.columns > 0 ? props.columns : autoColumns.value
})

// Emit when auto-columns changes (for syncing slider)
watch(autoColumns, (newVal) => {
  if (props.columns === 0) {
    emit('columnsChanged', newVal)
  }
})

// Calculate actual item width
const itemWidth = computed(() => {
  const totalGaps = (columns.value - 1) * props.gap
  return (containerWidth.value - totalGaps) / columns.value
})

// Item height: aspect ratio 16:9 for video + 64px for info area (name + metadata rows)
const itemHeight = computed(() => {
  const videoHeight = itemWidth.value * (9 / 16)
  const infoHeight = 64 // Fixed info area height (increased for metadata)
  return videoHeight + infoHeight
})

// Total rows
const totalRows = computed(() => Math.ceil(props.items.length / columns.value))

// Total height of all content
const totalHeight = computed(() => {
  return totalRows.value * itemHeight.value + (totalRows.value - 1) * props.gap
})

// Calculate visible range
const visibleRange = computed(() => {
  const rowHeight = itemHeight.value + props.gap
  const startRow = Math.max(0, Math.floor(scrollTop.value / rowHeight) - props.buffer)
  const visibleRows = Math.ceil(containerHeight.value / rowHeight) + 2 * props.buffer
  const endRow = Math.min(totalRows.value, startRow + visibleRows)

  const startIndex = startRow * columns.value
  const endIndex = Math.min(props.items.length, endRow * columns.value)

  return { startRow, startIndex, endIndex }
})

// Visible items with position data
const visibleItems = computed(() => {
  const { startIndex, endIndex } = visibleRange.value
  const result: Array<{ item: T; index: number; style: Record<string, string> }> = []

  for (let i = startIndex; i < endIndex; i++) {
    const row = Math.floor(i / columns.value)
    const col = i % columns.value
    const x = col * (itemWidth.value + props.gap)
    const y = row * (itemHeight.value + props.gap)

    result.push({
      item: props.items[i],
      index: i,
      style: {
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        width: `${itemWidth.value}px`,
        height: `${itemHeight.value}px`,
      },
    })
  }

  return result
})

function handleScroll(e: Event) {
  const target = e.target as HTMLElement
  scrollTop.value = target.scrollTop
}

function updateDimensions() {
  if (containerRef.value) {
    containerHeight.value = containerRef.value.clientHeight
    containerWidth.value = containerRef.value.clientWidth
  }
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  updateDimensions()

  resizeObserver = new ResizeObserver(() => {
    updateDimensions()
  })

  if (containerRef.value) {
    resizeObserver.observe(containerRef.value)
  }
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})

// Re-measure when items change significantly
watch(() => props.items.length, () => {
  nextTick(updateDimensions)
})
</script>

<template>
  <div
    ref="containerRef"
    class="virtual-grid-container"
    @scroll="handleScroll"
  >
    <div
      class="virtual-grid-content"
      :style="{ height: `${totalHeight}px` }"
    >
      <div
        v-for="{ item, index, style } in visibleItems"
        :key="index"
        :style="style"
        @click="emit('itemClick', item, index)"
      >
        <slot :item="item" :index="index" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.virtual-grid-container {
  overflow-y: auto;
  overflow-x: hidden;
  height: 100%;
  width: 100%;
}

.virtual-grid-content {
  position: relative;
  width: 100%;
}
</style>
