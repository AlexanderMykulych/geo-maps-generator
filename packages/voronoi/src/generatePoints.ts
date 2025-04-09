import { computed, MaybeRef, toValue } from "vue";
import { generatePoissonDiscPoints } from "./generatePoissonDiscPoints";
import { generateRandomPoints } from "./generateRandomPoints";

type GeneratePointsOptions = {
  pointsAlgorithm?: MaybeRef<'random' | 'poisson'>
  count: MaybeRef<number>
  width: MaybeRef<number>
  height: MaybeRef<number>
  seed: number
}
export function generatePoints(options: GeneratePointsOptions) {
  return computed(() => toValue(options.pointsAlgorithm) === 'poisson'
    ? generatePoissonDiscPoints(options).value
    : generateRandomPoints(options).value)
}
