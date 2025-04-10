import { Delaunay } from "d3-delaunay";
import { computed, MaybeRef, toValue } from "vue";
import { Polygon } from ".";
type Point = {
  index: number
  height: number
}
type GenerateHightMapOptions = {
  polygons: MaybeRef<Polygon[]>
  delaunator: MaybeRef<Delaunay<Delaunay.Point>>

  initialPoints: MaybeRef<Point[]>
}

export function generateHightMap(options: GenerateHightMapOptions) {
  const { polygons: polygonsRef, delaunator: delaunatorRef, initialPoints: initialPointsRef } = options;

  const result = computed(() => {
    const polygons = toValue(polygonsRef)
    const initialPoints = toValue(initialPointsRef)
    const delaunator = toValue(delaunatorRef)

    const newPolygons = [...polygons.map(x => ({ ...x, height: 0 }))]
    const queue = [...initialPoints]
    const visited = new Set<number>()

    const maxIterations = Infinity
    let iterations = 0
    while (queue.length > 0 && iterations < maxIterations) {
      const point = queue.shift()

      if (!point) {
        continue
      }

      if (visited.has(point.index)) {
        continue
      }

      visited.add(point.index)

      newPolygons[point.index] = {
        ...newPolygons[point.index],
        height: point.height,
      }

      const neighbors = delaunator.neighbors(point.index)

      for (const neighbor of neighbors) {
        const neighborPoint = polygons[neighbor]

        if (!neighborPoint || visited.has(neighbor)) {
          continue
        }

        const neighborHeight = newPolygons[neighbor].height

        if (neighborHeight > point.height) {
          continue
        }

        const randomStep = Math.random() * (0.09 - 0.01) + 0.01

        queue.push({
          index: neighbor,
          height: point.height - randomStep,
        })
      }

      iterations++
    }

    return newPolygons
  })

  return result
}
