// Builds content/map/world.json from Natural Earth (public domain) data.
// Usage: npm run build:map   (downloads source files into tools/.cache on first run)
import fs from 'node:fs';
import path from 'node:path';
import * as d3 from 'd3-geo';

const CACHE = 'tools/.cache';
const NE = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/';
const LAYERS = {
  countries: 'ne_50m_admin_0_countries',
  rivers: 'ne_50m_rivers_lake_centerlines',
  lakes: 'ne_50m_lakes',
  regions: 'ne_50m_geography_regions_polys',
  marine: 'ne_50m_geography_marine_polys',
  iceshelves: 'ne_50m_antarctic_ice_shelves_polys',
};

// Natural Earth codes that differ from ISO 3166 alpha-3 used by the game.
const CODE_FIX = { SDS: 'SSD', SOL: 'SOM', SAH: 'ESH', KOS: 'UNK', PSX: 'PSE', ALD: 'ALA', CYN: 'CYP' };
const CODE_DROP = new Set(['IOA', 'ATC', 'KAS']);

async function load(layer) {
  const file = path.join(CACHE, LAYERS[layer] + '.geojson');
  if (!fs.existsSync(file)) {
    fs.mkdirSync(CACHE, { recursive: true });
    console.log('downloading', LAYERS[layer]);
    const res = await fetch(NE + LAYERS[layer] + '.geojson');
    if (!res.ok) throw new Error('download failed ' + res.status);
    fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

const WIDTH = 2000;
const sphere = { type: 'Sphere' };
const projection = d3.geoNaturalEarth1().fitWidth(WIDTH, sphere);
const [[, y0], [, y1]] = d3.geoPath(projection).bounds(sphere);
const HEIGHT = Math.ceil(y1 - y0);
const r1 = (v) => Math.round(v * 10) / 10;

/** Projects a GeoJSON object into flat rings [x0,y0,x1,y1,...] (polylines for line geometry). */
function ringsOf(geo, proj, minStep = 0.35) {
  const rings = [];
  let cur = null;
  const ctx = {
    moveTo(x, y) { cur = [r1(x), r1(y)]; rings.push(cur); },
    lineTo(x, y) {
      const px = cur[cur.length - 2], py = cur[cur.length - 1];
      if (Math.hypot(x - px, y - py) >= minStep) cur.push(r1(x), r1(y));
    },
    closePath() {},
    arc() {}, rect() {},
  };
  d3.geoPath(proj, ctx)(geo);
  return rings.filter((r) => r.length >= 4);
}

function bboxOf(rings) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const r of rings) for (let i = 0; i < r.length; i += 2) {
    x0 = Math.min(x0, r[i]); x1 = Math.max(x1, r[i]);
    y0 = Math.min(y0, r[i + 1]); y1 = Math.max(y1, r[i + 1]);
  }
  return [r1(x0), r1(y0), r1(x1), r1(y1)];
}

function inside(rings, x, y) {
  let res = false;
  for (const r of rings) for (let i = 0, j = r.length - 2; i < r.length; j = i, i += 2) {
    const xi = r[i], yi = r[i + 1], xj = r[j], yj = r[j + 1];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) res = !res;
  }
  return res;
}

function largestRingCentroid(rings) {
  let best = null, bestA = -1;
  for (const r of rings) {
    let a = 0, cx = 0, cy = 0;
    for (let i = 0, j = r.length - 2; i < r.length; j = i, i += 2) {
      const f = r[j] * r[i + 1] - r[i] * r[j + 1];
      a += f; cx += (r[j] + r[i]) * f; cy += (r[j + 1] + r[i + 1]) * f;
    }
    if (Math.abs(a) > bestA) { bestA = Math.abs(a); best = [cx / (3 * a), cy / (3 * a)]; }
  }
  return best;
}

function pathString(geo, proj, digits = 1) {
  const p = d3.geoPath(proj).digits(digits)(geo);
  return p ?? '';
}

const countriesGeo = await load('countries');
const byId = new Map();
for (const f of countriesGeo.features) {
  const raw = f.properties.ADM0_A3;
  if (CODE_DROP.has(raw)) continue;
  const id = CODE_FIX[raw] ?? raw;
  const entry = byId.get(id) ?? { id, geoms: [], label: null, labelRank: 99 };
  entry.geoms.push(f.geometry);
  // keep the label point of the main (lowest LABELRANK) feature
  if (f.properties.LABELRANK < entry.labelRank || entry.label === null) {
    entry.label = [f.properties.LABEL_X, f.properties.LABEL_Y];
    entry.labelRank = f.properties.LABELRANK;
  }
  byId.set(id, entry);
}

const countries = [];
for (const e of byId.values()) {
  const geo = { type: 'GeometryCollection', geometries: e.geoms };
  const rings = ringsOf(geo, projection);
  if (!rings.length) continue;
  const bbox = bboxOf(rings);
  let c = projection(e.label);
  if (!c || !inside(rings, c[0], c[1])) c = largestRingCentroid(rings);
  countries.push({
    id: e.id,
    rings,
    bbox,
    centroid: [r1(c[0]), r1(c[1])],
    small: bbox[2] - bbox[0] < 4 && bbox[3] - bbox[1] < 4,
  });
}
countries.sort((a, b) => a.id.localeCompare(b.id));

// Geographic features from the authored catalogue.
const catalog = JSON.parse(fs.readFileSync('content/map/features.catalog.json', 'utf8'));
const layers = {
  rivers: await load('rivers'),
  lakes: await load('lakes'),
  regions: await load('regions'),
  marine: await load('marine'),
};
const nameOf = (layer, p) => (layer === 'regions' ? p.NAME : p.name);
const features = [];
for (const item of catalog) {
  const src = layers[item.layer].features.filter((f) => item.match.includes(nameOf(item.layer, f.properties)));
  if (!src.length) throw new Error(`feature ${item.id}: no Natural Earth match for ${item.match}`);
  const geo = { type: 'GeometryCollection', geometries: src.map((f) => f.geometry) };
  const line = item.layer === 'rivers';
  const rings = ringsOf(geo, projection, line ? 0.5 : 0.35);
  const c = d3.geoPath(projection).centroid(geo);
  features.push({ id: item.id, kind: line ? 'line' : 'area', rings, bbox: bboxOf(rings), centroid: [r1(c[0]), r1(c[1])] });
}

// Decorative layers (unlabelled, never used for answers).
const decorRivers = { type: 'FeatureCollection', features: layers.rivers.features.filter((f) => f.properties.scalerank <= 6) };
const decorLakes = { type: 'FeatureCollection', features: layers.lakes.features.filter((f) => f.properties.scalerank <= 4) };
const graticule = d3.geoGraticule().step([20, 20])();

// Antarctic inset: azimuthal equidistant centred on the South Pole, 180° meridian at the top.
const INSET = 380;
const insetProj = d3.geoAzimuthalEquidistant().rotate([0, 90, 180]).clipAngle(31).precision(0.2);
insetProj.fitExtent([[6, 6], [INSET - 6, INSET - 6]], d3.geoCircle().center([0, -90]).radius(31)());
const antarctica = countriesGeo.features.filter((f) => f.properties.ADM0_A3 === 'ATA');
const ice = await load('iceshelves');
const insetGrat = d3.geoGraticule().step([30, 10]).extentMajor([[-180, -90], [180, -50]])();

const out = {
  attribution: 'Made with Natural Earth. Free vector and raster map data @ naturalearthdata.com.',
  width: WIDTH,
  height: HEIGHT,
  projection: { type: 'naturalEarth1', scale: projection.scale(), translate: projection.translate() },
  sphere: pathString(sphere, projection),
  graticule: pathString(graticule, projection),
  decor: {
    rivers: pathString(decorRivers, projection),
    lakes: pathString(decorLakes, projection),
  },
  countries,
  features,
  inset: {
    size: INSET,
    projection: { type: 'azimuthalEquidistant', scale: insetProj.scale(), translate: insetProj.translate(), rotate: insetProj.rotate(), clipAngle: 31 },
    outline: pathString(d3.geoCircle().center([0, -90]).radius(31)(), insetProj),
    graticule: pathString(insetGrat, insetProj),
    land: pathString({ type: 'FeatureCollection', features: antarctica }, insetProj),
    ice: pathString(ice, insetProj),
    southernLand: pathString({ type: 'FeatureCollection', features: countriesGeo.features.filter((f) => f.properties.ADM0_A3 !== 'ATA') }, insetProj),
  },
};

fs.mkdirSync('content/map', { recursive: true });
fs.writeFileSync('content/map/world.json', JSON.stringify(out));
const kb = (fs.statSync('content/map/world.json').size / 1024).toFixed(0);
console.log(`world.json: ${countries.length} countries, ${features.length} features, ${WIDTH}x${HEIGHT}, ${kb} KB`);
