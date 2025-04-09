import { ComputedRef } from "vue";
import { computed, MaybeRef, toValue } from "vue";

type GeneratePoissonDiscPointsOptions = {
  width: MaybeRef<number>
  height: MaybeRef<number>
  count: MaybeRef<number>
  seed: number
}
export function generatePoissonDiscPoints(options: GeneratePoissonDiscPointsOptions): ComputedRef<number[][]> {

  const { width, height, count, seed } = options;

  return computed(() => {
    const widthValue = toValue(width);
    const heightValue = toValue(height);
    const countValue = toValue(count);

    // Implementation of Bridson's algorithm for Poisson disc sampling

    // Step 0: Initialize the algorithm parameters
    // The minimum distance between samples
    const r = Math.sqrt((widthValue * heightValue) / countValue) * 0.9;

    // Cell size for the background grid (used for acceleration)
    const cellSize = r / Math.sqrt(2);

    // Number of cells in the grid
    const gridWidth = Math.ceil(widthValue / cellSize);
    const gridHeight = Math.ceil(heightValue / cellSize);

    // Background grid to track sample positions
    const grid: (number[] | undefined)[][] = new Array(gridWidth);
    for (let i = 0; i < gridWidth; i++) {
      grid[i] = new Array(gridHeight);
    }

    // List to store the final samples
    const samples: number[][] = [];

    // List to store active samples (for sampling around them)
    const activeList: number[][] = [];

    // Step 1: Select the first sample randomly
    const firstPoint = [
      Math.random() * widthValue,
      Math.random() * heightValue
    ];

    // Add the first point to our data structures
    samples.push(firstPoint);
    activeList.push(firstPoint);

    const gridX = Math.floor(firstPoint[0] / cellSize);
    const gridY = Math.floor(firstPoint[1] / cellSize);
    grid[gridX][gridY] = firstPoint;

    // Step 2: While the active list is not empty
    while (activeList.length > 0 && samples.length < countValue) {
      // Choose a random index from the active list
      const randomIndex = Math.floor(Math.random() * activeList.length);
      const point = activeList[randomIndex];

      // Try to generate up to k new points around the current point
      let found = false;
      const k = 30; // Number of attempts before rejection

      for (let i = 0; i < k; i++) {
        // Generate a random point between r and 2r from the current point
        const theta = Math.random() * 2 * Math.PI;
        const radius = r + Math.random() * r;

        const newX = point[0] + radius * Math.cos(theta);
        const newY = point[1] + radius * Math.sin(theta);

        // Check if the new point is within bounds
        if (newX < 0 || newX >= widthValue || newY < 0 || newY >= heightValue) {
          continue;
        }

        // Check if the new point is far enough from existing samples
        const newGridX = Math.floor(newX / cellSize);
        const newGridY = Math.floor(newY / cellSize);

        let valid = true;

        // Check the surrounding cells in the grid
        for (let gx = Math.max(0, newGridX - 2); gx <= Math.min(gridWidth - 1, newGridX + 2); gx++) {
          for (let gy = Math.max(0, newGridY - 2); gy <= Math.min(gridHeight - 1, newGridY + 2); gy++) {
            const existingPoint = grid[gx][gy];
            if (existingPoint) {
              const dx = existingPoint[0] - newX;
              const dy = existingPoint[1] - newY;
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance < r) {
                valid = false;
                break;
              }
            }
          }
          if (!valid) break;
        }

        // If the point is valid, add it to our data structures
        if (valid) {
          const newPoint = [newX, newY];
          samples.push(newPoint);
          activeList.push(newPoint);
          grid[newGridX][newGridY] = newPoint;
          found = true;
          break;
        }
      }

      // If no valid point was found after k attempts, remove the current point from the active list
      if (!found) {
        activeList.splice(randomIndex, 1);
      }

      // Stop if we've reached the desired count
      if (samples.length >= countValue) {
        break;
      }
    }

    return samples;
  });
}