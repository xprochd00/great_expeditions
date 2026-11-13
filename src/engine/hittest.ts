// Point-in-polygon and distance tests on projected rings (flat [x0,y0,x1,y1,...] arrays).

export function pointInRings(rings: number[][], x: number, y: number): boolean {
  let inside = false;
  for (const r of rings) {
    for (let i = 0, j = r.length - 2; i < r.length; j = i, i += 2) {
      const xi = r[i], yi = r[i + 1], xj = r[j], yj = r[j + 1];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
  }
  return inside;
}

function segDist(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax, dy = by - ay;
  const len = dx * dx + dy * dy;
  let t = len ? ((px - ax) * dx + (py - ay) * dy) / len : 0;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

/** Distance from a point to the outline of rings (closed polygons or open polylines). */
export function distToRings(rings: number[][], x: number, y: number, closed: boolean): number {
  let best = Infinity;
  for (const r of rings) {
    const n = r.length;
    for (let i = 0; i + 3 < n; i += 2) best = Math.min(best, segDist(x, y, r[i], r[i + 1], r[i + 2], r[i + 3]));
    if (closed && n >= 4) best = Math.min(best, segDist(x, y, r[n - 2], r[n - 1], r[0], r[1]));
  }
  return best;
}

export function bboxDist(b: [number, number, number, number], x: number, y: number): number {
  const dx = Math.max(b[0] - x, 0, x - b[2]);
  const dy = Math.max(b[1] - y, 0, y - b[3]);
  return Math.hypot(dx, dy);
}
