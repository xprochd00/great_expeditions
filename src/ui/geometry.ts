import { geoPath } from 'd3-geo';
import { insetProjection, mainProjection, type ContentIndex, type ExplorerId, type Viewport } from '../engine';

export function ringsToPath(rings: number[][], closed: boolean): string {
  let d = '';
  for (const r of rings) {
    if (r.length < 4) continue;
    d += `M${r[0]},${r[1]}`;
    for (let i = 2; i < r.length; i += 2) d += `L${r[i]},${r[i + 1]}`;
    if (closed) d += 'Z';
  }
  return d;
}

export interface NodePoint {
  id: string;
  x: number;
  y: number;
  inset: boolean;
}

const cache = new WeakMap<ContentIndex, ReturnType<typeof build>>();

function build(ix: ContentIndex) {
  const proj = mainProjection(ix.map);
  const inset = insetProjection(ix.map);
  const mainPath = geoPath(proj);
  const insetPath = geoPath(inset);
  const points = new Map<string, NodePoint>();
  for (const route of ix.raw.routes) {
    for (const n of route.nodes) {
      const p = (n.inset ? inset : proj)([n.lon, n.lat])!;
      points.set(`${route.id}.${n.id}`, { id: n.id, x: p[0], y: p[1], inset: !!n.inset });
    }
  }
  const countryPaths = new Map(ix.map.countries.map((c) => [c.id, ringsToPath(c.rings, true)]));
  const featurePaths = new Map(ix.map.features.map((f) => [f.id, ringsToPath(f.rings, f.kind === 'area')]));
  return { proj, inset, mainPath, insetPath, points, countryPaths, featurePaths };
}

export function geo(ix: ContentIndex) {
  let g = cache.get(ix);
  if (!g) { g = build(ix); cache.set(ix, g); }
  return g;
}

export function nodePoint(ix: ContentIndex, explorer: ExplorerId, node: string): NodePoint {
  return geo(ix).points.get(`${explorer}.${node}`)!;
}

/** A curved line through lon/lat points, split correctly at the antimeridian. */
export function lineThrough(ix: ContentIndex, explorer: ExplorerId, nodes: string[], inset: boolean): string {
  if (nodes.length < 2) return '';
  const coords = nodes.map((id) => {
    const n = ix.node.get(`${explorer}.${id}`)!;
    return [n.lon, n.lat] as [number, number];
  });
  const g = geo(ix);
  return (inset ? g.insetPath : g.mainPath)({ type: 'LineString', coordinates: coords }) ?? '';
}

export function padViewport(v: Viewport, f: number): Viewport {
  const w = v[2] - v[0], h = v[3] - v[1];
  return [v[0] - w * f, v[1] - h * f, v[2] + w * f, v[3] + h * f];
}

export function fitAspect(v: Viewport, aspect: number, bounds: Viewport): Viewport {
  let [x0, y0, x1, y1] = v;
  let w = x1 - x0, h = y1 - y0;
  if (w / h < aspect) { const nw = h * aspect; x0 -= (nw - w) / 2; w = nw; }
  else { const nh = w / aspect; y0 -= (nh - h) / 2; h = nh; }
  // keep inside the world where possible
  const bw = bounds[2] - bounds[0], bh = bounds[3] - bounds[1];
  if (w > bw) { x0 = bounds[0] - (w - bw) / 2; } else { x0 = Math.max(bounds[0], Math.min(x0, bounds[2] - w)); }
  if (h > bh) { y0 = bounds[1] - (h - bh) / 2; } else { y0 = Math.max(bounds[1], Math.min(y0, bounds[3] - h)); }
  return [x0, y0, x0 + w, y0 + h];
}
