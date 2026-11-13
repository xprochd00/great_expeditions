// Content types and indexing. Content is plain data (JSON) supplied by the loader;
// the engine never imports content files directly, so it can run anywhere (browser, tests, server).
import { mainProjection, viewportOf } from './geo';
import type { Category, ExplorerId, Level, NodeType, Terrain, Viewport } from './types';
import { LEVELS } from './types';

export interface ShapeData {
  id: string;
  rings: number[][];
  bbox: [number, number, number, number];
  centroid: [number, number];
}
export interface CountryShape extends ShapeData {
  small: boolean;
}
export interface FeatureShape extends ShapeData {
  kind: 'line' | 'area';
}

export interface MapData {
  width: number;
  height: number;
  projection: { type: string; scale: number; translate: [number, number] };
  sphere: string;
  graticule: string;
  decor: { rivers: string; lakes: string };
  countries: CountryShape[];
  features: FeatureShape[];
  inset: {
    size: number;
    projection: { type: string; scale: number; translate: [number, number]; rotate: [number, number, number]; clipAngle: number };
    outline: string;
    graticule: string;
    land: string;
    ice: string;
    southernLand: string;
  };
}

export interface CountryInfo {
  id: string;
  cca2: string;
  region: string;
  subregion: string;
  borders: string[];
  landlocked: boolean;
  area: number;
  hasCapital: boolean;
}

export interface CountryRating {
  f: number; // familiarity 1 (famous) .. 6 (obscure)
  cap?: number;
  flag?: number;
  noCapital?: boolean;
  excluded?: boolean;
}

export interface FeatureInfo {
  id: string;
  layer: string;
  rating: number;
  minLevel: Level;
}

export interface RegionDef {
  id: string;
  bbox: [number, number, number, number];
}

export interface RouteNode {
  id: string;
  lon: number;
  lat: number;
  date: string;
  approx?: boolean;
  type: NodeType;
  terrain: Terrain;
  region: string;
  act: number;
  inset?: boolean;
}

export interface ForkBranch {
  id: string;
  historical: boolean;
  kind: 'safe' | 'perilous';
  nodes: string[];
}
export interface ForkDef {
  fork: string;
  branches: ForkBranch[];
}
export interface RouteDef {
  id: ExplorerId;
  nodes: RouteNode[];
  sequence: (string | ForkDef)[];
}

export interface HandQuestion {
  id: string;
  kind: 'mc' | 'riddle';
  category: Category;
  regions: string[];
  rating: number;
  minLevel: Level;
  places?: string[]; // multiple choice with place options; the first one is correct
  options?: number; // multiple choice with text options q.<id>.o1..oN; o1 is correct
  answer?: string; // riddle: place id to click
  landmark?: string; // "<route>.<node>"
  final?: ExplorerId;
  depth?: 'basic' | 'advanced';
  fact?: boolean;
}

export interface RawContent {
  map: MapData;
  countries: CountryInfo[];
  ratings: Record<string, CountryRating>;
  features: FeatureInfo[];
  regions: RegionDef[];
  routes: RouteDef[];
  questions: HandQuestion[];
  flagGroups: string[][];
}

export interface ContentIndex {
  raw: RawContent;
  map: MapData;
  country: Map<string, CountryInfo>;
  rating: Map<string, CountryRating>;
  countryShape: Map<string, CountryShape>;
  feature: Map<string, FeatureInfo>;
  featureShape: Map<string, FeatureShape>;
  regionViewport: Map<string, Viewport>;
  regionCountries: Map<string, string[]>;
  regionFeatures: Map<string, string[]>;
  route: Map<ExplorerId, RouteDef>;
  node: Map<string, RouteNode>; // key "<route>.<node>"
  handByRegion: Map<string, HandQuestion[]>;
  landmark: Map<string, HandQuestion[]>; // key "<route>.<node>"
  finals: Map<ExplorerId, HandQuestion[]>;
  flagGroup: Map<string, string[]>;
}

export const levelIndex = (l: Level) => LEVELS.indexOf(l);

function inVp(v: Viewport, p: [number, number]) {
  return p[0] >= v[0] && p[0] <= v[2] && p[1] >= v[1] && p[1] <= v[3];
}

export function indexContent(raw: RawContent): ContentIndex {
  const proj = mainProjection(raw.map);
  const country = new Map(raw.countries.map((c) => [c.id, c]));
  const rating = new Map(Object.entries(raw.ratings));
  const countryShape = new Map(raw.map.countries.map((c) => [c.id, c]));
  const feature = new Map(raw.features.map((f) => [f.id, f]));
  const featureShape = new Map(raw.map.features.map((f) => [f.id, f]));
  const regionViewport = new Map<string, Viewport>();
  const regionCountries = new Map<string, string[]>();
  const regionFeatures = new Map<string, string[]>();
  for (const r of raw.regions) {
    const vp = viewportOf(proj, r.bbox);
    regionViewport.set(r.id, vp);
    regionCountries.set(
      r.id,
      raw.countries
        .filter((c) => {
          const s = countryShape.get(c.id);
          const rt = rating.get(c.id);
          return s && rt && !rt.excluded && inVp(vp, s.centroid);
        })
        .map((c) => c.id),
    );
    regionFeatures.set(
      r.id,
      raw.map.features.filter((f) => feature.has(f.id) && inVp(vp, f.centroid)).map((f) => f.id),
    );
  }
  const route = new Map(raw.routes.map((r) => [r.id, r]));
  const node = new Map<string, RouteNode>();
  for (const r of raw.routes) for (const n of r.nodes) node.set(`${r.id}.${n.id}`, n);

  const handByRegion = new Map<string, HandQuestion[]>();
  const landmark = new Map<string, HandQuestion[]>();
  const finals = new Map<ExplorerId, HandQuestion[]>();
  for (const q of raw.questions) {
    if (q.landmark) {
      landmark.set(q.landmark, [...(landmark.get(q.landmark) ?? []), q]);
    } else if (q.final) {
      finals.set(q.final, [...(finals.get(q.final) ?? []), q]);
    } else {
      for (const r of q.regions) handByRegion.set(r, [...(handByRegion.get(r) ?? []), q]);
    }
  }
  const flagGroup = new Map<string, string[]>();
  for (const g of raw.flagGroups) for (const id of g) if (!flagGroup.has(id)) flagGroup.set(id, g);

  return {
    raw, map: raw.map, country, rating, countryShape, feature, featureShape,
    regionViewport, regionCountries, regionFeatures, route, node, handByRegion, landmark, finals, flagGroup,
  };
}

// ---------------------------------------------------------------- route paths

export interface ResolvedPath {
  nodes: string[];
  /** fork id -> index of the node where the fork starts (the last node before the branches) */
  forkAt: Record<string, number>;
  /** fork id -> whether a branch has been chosen */
  chosen: Record<string, string | undefined>;
}

/** Resolves a route into a list of node ids, using chosen branches (or the historical one as a preview). */
export function resolvePath(route: RouteDef, choices: Record<string, string>): ResolvedPath {
  const nodes: string[] = [];
  const forkAt: Record<string, number> = {};
  const chosen: Record<string, string | undefined> = {};
  for (const item of route.sequence) {
    if (typeof item === 'string') {
      nodes.push(item);
      continue;
    }
    forkAt[item.fork] = nodes.length - 1;
    chosen[item.fork] = choices[item.fork];
    const branch = item.branches.find((b) => b.id === choices[item.fork]) ?? item.branches.find((b) => b.historical)!;
    nodes.push(...branch.nodes);
  }
  return { nodes, forkAt, chosen };
}

export function forkDef(route: RouteDef, forkId: string): ForkDef | undefined {
  return route.sequence.find((s): s is ForkDef => typeof s !== 'string' && s.fork === forkId);
}
