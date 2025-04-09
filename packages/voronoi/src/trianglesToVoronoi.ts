
export function trianglesToVoronoi(triangles: Uint32Array, points: number[][]) {
  const circumcenters = [];
  const siteToCircumcenters = new Map();

  // Крок 1: обійти всі трикутники по 3 індекси
  for (let i = 0; i < triangles.length; i += 3) {
    const a = points[triangles[i]];
    const b = points[triangles[i + 1]];
    const c = points[triangles[i + 2]];

    const cc = getCircumcenter(a, b, c);
    circumcenters.push(cc);

    // Кожен сайт бере участь у кількох трикутниках → збираємо ці центри
    [triangles[i], triangles[i + 1], triangles[i + 2]].forEach(siteIndex => {
      if (!siteToCircumcenters.has(siteIndex)) {
        siteToCircumcenters.set(siteIndex, []);
      }
      siteToCircumcenters.get(siteIndex).push(cc);
    });
  }

  return {
    siteToCircumcenters,
    circumcenters,
  };
}

// Центр описаного кола трикутника
function getCircumcenter(a: number[], b: number[], c: number[]) {
  const [ax, ay] = a;
  const [bx, by] = b;
  const [cx, cy] = c;

  const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
  const ux = (
    ((ax ** 2 + ay ** 2) * (by - cy) +
      (bx ** 2 + by ** 2) * (cy - ay) +
      (cx ** 2 + cy ** 2) * (ay - by)) / d
  );
  const uy = (
    ((ax ** 2 + ay ** 2) * (cx - bx) +
      (bx ** 2 + by ** 2) * (ax - cx) +
      (cx ** 2 + cy ** 2) * (bx - ax)) / d
  );
  return [ux, uy];
}