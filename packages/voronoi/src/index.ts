import { Delaunay } from 'd3-delaunay'
import { scaleSequential } from 'd3-scale'
import { interpolateSpectral } from 'd3-scale-chromatic'
import type { MaybeRef } from 'vue'
import { computed, toValue } from 'vue'
import { generatePoints } from './generatePoints'
import { generateHightMap } from './generateHightMap'

type VoronoiOptions = {
  width: MaybeRef<number>
  height: MaybeRef<number>
  count: MaybeRef<number>
  lloydIterations: number
  pointsAlgorithm?: MaybeRef<'random' | 'poisson'>
  relaxationMode?: MaybeRef<'voronoi' | 'lloyd' | 'points'>
}

export type Polygon = {
  coords: number[][]
  points: string
  index: number
}

export function voronoi(options: VoronoiOptions) {
  const basePoints = generatePoints({
    count: options.count,
    width: options.width,
    height: options.height,
    seed: 1,
    pointsAlgorithm: options.pointsAlgorithm,
  })

  const baseDelaunator = computed(() => {
    return Delaunay.from(basePoints.value as Delaunay.Point[])
  })

  let lloydPoints = computed(() => {
    let lloydPoints = [...basePoints.value]
    for (let i = 0; i < options.lloydIterations; i++) {
      const voronoi = baseDelaunator.value.voronoi([0, 0, toValue(options.width), toValue(options.height)])
      lloydPoints = lloydPoints.map((_, i) => voronoi.cellPolygon(i))
        .map(poly => getCentroid(poly));
    }

    return lloydPoints
  })
  const lloydDelaunator = computed(() => {
    return Delaunay.from(lloydPoints.value as Delaunay.Point[])
  })

  const delaunator = computed(() => {
    return toValue(options.relaxationMode) === 'lloyd' ? lloydDelaunator.value : baseDelaunator.value
  })

  const points = computed(() => {
    return toValue(options.relaxationMode) === 'lloyd' ? lloydPoints.value : basePoints.value
  })

  const polygonsIterator = computed(() => delaunator.value.voronoi([0, 0, toValue(options.width), toValue(options.height)]).cellPolygons())
  const polygons = computed<Polygon[]>(() => Array.from(polygonsIterator.value).map((x, index) => ({
    coords: x,
    points: x.join(' '),
    index,
  })))

  const hightMap = generateHightMap({
    polygons,
    delaunator,
    initialPoints: computed(() => [{
      index: Math.floor(polygons.value.length / 2),
      height: 1,
    }]),
  })

  const color = scaleSequential(interpolateSpectral)

  return {
    delaunator,
    points,
    polygons: hightMap,
    color,
  }
}

function getCentroid(polygon: number[][]) {
  const x = polygon.reduce((acc, [x, _]) => acc + x, 0) / polygon.length
  const y = polygon.reduce((acc, [_, y]) => acc + y, 0) / polygon.length
  return [x, y]
}


