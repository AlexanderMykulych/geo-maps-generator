import { computed, ComputedRef, MaybeRef, toValue } from "vue"

type GenerateRandomPointsOptions = {
  count: MaybeRef<number>
  width: MaybeRef<number>
  height: MaybeRef<number>
  seed: number
}

export function generateRandomPoints(options: GenerateRandomPointsOptions): ComputedRef<number[][]> {
  const { count, width, height, seed } = options
  const points = computed(() => {
    const points = []
    const countValue = toValue(count)
    for (let i = 0; i < countValue; i++) {
      points.push([Math.random() * toValue(width), Math.random() * toValue(height)])
    }
    return points
  })

  return points
}