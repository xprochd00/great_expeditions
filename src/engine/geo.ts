import { geoAzimuthalEquidistant, geoNaturalEarth1, type GeoProjection } from 'd3-geo';
import type { MapData } from './content';
import type { Viewport } from './types';

export function mainProjection(map: MapData): GeoProjection {
  return geoNaturalEarth1().scale(map.projection.scale).translate(map.projection.translate);
}

export function insetProjection(map: MapData): GeoProjection {
  const p = map.inset.projection;
  return geoAzimuthalEquidistant().scale(p.scale).translate(p.translate).rotate(p.rotate).clipAngle(p.clipAngle);
}

/** Projects a lon/lat bounding box [west, south, east, north] to a viewport in map units. */
export function viewportOf(proj: GeoProjection, bbox: [number, number, number, number]): Viewport {
  const [w, s, e, n] = bbox;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const add = (lon: number, lat: number) => {
    const p = proj([lon, lat]);
    if (!p) return;
    x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]);
    y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]);
  };
  for (let lon = w; lon <= e; lon += 2) { add(lon, s); add(lon, n); }
  for (let lat = s; lat <= n; lat += 2) { add(w, lat); add(e, lat); }
  add(e, s); add(e, n);
  return [x0, y0, x1, y1];
}

export function inViewport(v: Viewport, x: number, y: number): boolean {
  return x >= v[0] && x <= v[2] && y >= v[1] && y <= v[3];
}
