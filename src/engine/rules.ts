// Tunable game rules. Numbers come from the design document (docs/GAME_DESIGN.md).
import type { ExplorerId, ItemId, Level, Terrain, Tier } from './types';

export const START_LIVES = 3;
export const MAX_LIVES = 4;
export const PACK_SIZE = 3;
export const THREAT_START_BEHIND = 3;
export const STREAK_FOR_ITEM = 3;
export const CROSSROADS_EVERY = 3;
export const DEPOT_MAX = 3;
export const FORK_DECISION_DISTANCE = 6;

export const TIER_RULES: Record<Tier, { steps: number; near: number; penalty: number; time: number; offset: number }> = {
  scout: { steps: 1, near: 0, penalty: 1, time: 20, offset: 0 },
  navigator: { steps: 2, near: 1, penalty: 1, time: 25, offset: 1 },
  pathfinder: { steps: 3, near: 1, penalty: 2, time: 30, offset: 2 },
};

export const RIDDLE_STEPS = [4, 3, 2]; // after clue 1, 2, 3
export const RIDDLE_PENALTY = 2;
export const RIDDLE_TIME = 45;
export const FINAL_TIME = 60;
export const LANDMARK_TIME = 25;
export const CROSSROADS_BUZZ_TIME = 20;
export const CROSSROADS_ANSWER_TIME = 12;
export const CROSSROADS_HEAD_START = 1.5; // seconds per level below the highest-level player

export const LEVEL_WINDOW_START: Record<Level, number> = { beginner: 1, intermediate: 3, advanced: 5, expert: 7 };
export const TIMER_FACTOR = { normal: 1, long: 1.5, off: 0 };

/** Two-value rating band for a level, tier and act (design §3.4). */
export function ratingBand(level: Level, tier: Tier, act: number, extra = 0): [number, number] {
  const b = Math.min(11, LEVEL_WINDOW_START[level] + TIER_RULES[tier].offset + (act - 1) + extra);
  return [b, b + 1];
}

/** Familiarity 1..6 -> base rating, and the lowest level allowed to see the country. */
export const FAMILIARITY_BASE = [0, 1, 2, 3, 5, 7, 9];
export const FAMILIARITY_LEVEL: Level[] = ['beginner', 'beginner', 'beginner', 'beginner', 'intermediate', 'advanced', 'expert'];

export const ITEM_WEIGHTS: Record<ItemId, number> = {
  spyglass: 3, compass: 3, guide: 2, provisions: 3, medicine: 2, rumour: 1, porters: 1,
};
export const RIVAL_ITEMS: ItemId[] = ['rumour', 'porters'];

export interface ThreatRule {
  /** Steps the threat takes this round, before penalties, given the terrain under the threat. */
  base(terrain: Terrain, round: number): number;
}

export const THREATS: Record<ExplorerId, ThreatRule> = {
  // The Great Sandstorm: faster over deserts, stalls in the mountains.
  polo: { base: (t) => (t === 'desert' ? 2 : t === 'mountain' ? 0 : 1) },
  // The Portuguese Fleet: faster in Portuguese waters, stops in the Pacific.
  magellan: { base: (t) => (t === 'portuguese' ? 2 : t === 'pacific' ? 0 : 1) },
  // The Fever: faster on rivers, lakes and swamps; stalls in highlands and the dry Kalahari.
  livingstone: { base: (t) => (t === 'river' || t === 'lake' || t === 'swamp' ? 2 : t === 'highland' || t === 'desert' ? 0 : 1) },
  // The Polar Winter: still for two rounds, then surges three steps.
  amundsen: { base: (_t, round) => (round % 3 === 0 ? 3 : 0) },
};

export const ABILITY: Record<ExplorerId, 'paiza' | 'tradeWinds' | 'physician' | 'depot'> = {
  polo: 'paiza',
  magellan: 'tradeWinds',
  livingstone: 'physician',
  amundsen: 'depot',
};
