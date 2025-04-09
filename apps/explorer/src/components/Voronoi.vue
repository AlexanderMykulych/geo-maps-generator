<script setup lang="ts">
import { voronoi } from 'voronoi'
import { computed, ref } from 'vue'

const width = ref(600)
const height = ref(600)
const count = ref(500)
const pointsAlgorithm = ref<'random' | 'poisson'>('random')
const relaxationMode = ref<'voronoi' | 'lloyd' | 'points'>('lloyd')

const { delaunator, points, polygons } = voronoi({
  width,
  height,
  count,
  lloydIterations: 10,
  pointsAlgorithm,
  relaxationMode,
})

const hoveredSide = ref<number | null>(null)
const neighborSides = ref<number[]>([])

const handleMouseEnter = (index: number) => {
  hoveredSide.value = index
  neighborSides.value = Array.from(delaunator.value.neighbors(index))
}

function getSideFill(index: number) {
  if (hoveredSide.value === index) {
    return 'lightblue'
  }
  if (neighborSides.value.includes(index)) {
    return 'lightgreen'
  }
  return 'transparent'
}

const hidePoints = ref(false)

const togglePointsAlgorithm = () => {
  pointsAlgorithm.value = pointsAlgorithm.value === 'random' ? 'poisson' : 'random'
}
</script>

<template>
  <div class="w-full h-full text-blue flex flex-col items-center justify-center">
    <div class="flex gap-2 mb-2">
      <button @click="hidePoints = !hidePoints">Hide Points</button>
      <button @click="relaxationMode = 'points'">Points</button>
      <button @click="relaxationMode = 'voronoi'">Voronoi</button>
      <button @click="relaxationMode = 'lloyd'">Lloyd</button>
      <button @click="togglePointsAlgorithm">Toggle ({{ pointsAlgorithm }})</button>
      <div class="flex items-center gap-2">
        <label for="count-slider">Points: {{ count }}</label>
        <input
          id="count-slider"
          type="range"
          v-model="count"
          min="10"
          max="6000"
          step="40"
          class="w-32"
        />
      </div>
    </div>
    <div class="flex items-center gap-2 mb-2">
      <div class="flex items-center gap-2">
        <label for="width-slider">Width: {{ width }}</label>
        <input
          id="width-slider"
          type="range"
          v-model="width"
          min="200"
          max="1200"
          step="50"
          class="w-32"
        />
      </div>
      <div class="flex items-center gap-2">
        <label for="height-slider">Height: {{ height }}</label>
        <input
          id="height-slider"
          type="range"
          v-model="height"
          min="200"
          max="1200"
          step="50"
          class="w-32"
        />
      </div>
    </div>
    <div class="b-2 b-gray-500 b-solid" :style="{ width: `${width}px`, height: `${height}px` }">
      <svg class="w-full h-full" fill="none">
        <polygon
          v-if="relaxationMode !== 'points'"
          v-for="(polygon, index) in polygons"
          :key="index"
          :points="polygon.points"
          :fill="getSideFill(index)"
          stroke="black"
          stroke-width="1"
          @mouseenter="handleMouseEnter(index)"
        />

        <circle
          v-if="!hidePoints"
          v-for="(point, index) in points"
          :key="index"
          :cx="point[0]"
          :cy="point[1]"
          :r="2"
          fill="red"
        />
      </svg>
    </div>
  </div>
</template>