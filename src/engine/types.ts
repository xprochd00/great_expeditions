// Core types of the game engine. The engine is pure TypeScript: no DOM, no React, no network.
// All display text is referenced by message keys (Msg) and resolved by the i18n layer.

export type Level = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export const LEVELS: Level[] = ['beginner', 'intermediate', 'advanced', 'expert'];

export type Tier = 'scout' | 'navigator' | 'pathfinder';
export const TIERS: Tier[] = ['scout', 'navigator', 'pathfinder'];

export type ExplorerId = 'polo' | 'magellan' | 'livingstone' | 'amundsen';
export const EXPLORERS: ExplorerId[] = ['polo', 'magellan', 'livingstone', 'amundsen'];

export type ItemId = 'spyglass' | 'compass' | 'guide' | 'provisions' | 'medicine' | 'rumour' | 'porters';
export type RewardId = 'life' | 'march' | 'supplies' | 'shelter';
export type GuideCategory = 'map' | 'capital' | 'flag' | 'knowledge';
export type Category = 'map' | 'capital' | 'flag' | 'knowledge' | 'combined' | 'riddle' | 'history' | 'histgeo';

export type NodeType = 'start' | 'path' | 'checkpoint' | 'landmark' | 'hazard' | 'discovery' | 'finish';
export type Terrain =
  | 'coast' | 'sea' | 'land' | 'desert' | 'mountain' | 'highland' | 'river' | 'lake' | 'swamp' | 'ice'
  | 'portuguese' | 'pacific';

/** A reference to a translatable message. Param values may themselves be place references. */
export interface Msg {
  key: string;
  params?: Record<string, string | number | PlaceRef>;
}
export interface PlaceRef {
  place: string; // e.g. "country.UZB", "capital.UZB", "river.amu-darya"
}

export type Viewport = [number, number, number, number]; // x0, y0, x1, y1 in projected map units

export interface ChoiceOption {
  label: Msg;
  flag?: string; // ISO alpha-2 code when the option is shown as a flag
}

export type QuestionInput = 'choice' | 'map';

export interface Question {
  uid: string;
  ref: string; // template id ("gen:locate_country") or hand-written question id
  category: Category;
  rating: number;
  subject: string; // place id or hand-written id; used for repeats and revisits
  region: string;
  input: QuestionInput;
  prompt: Msg;
  flag?: string; // flag shown with the prompt
  options?: ChoiceOption[];
  correct?: number; // SECRET until answered
  target?: string; // SECRET until answered: place id to click
  answerLabel?: Msg; // SECRET until answered
  viewport: Viewport;
  clues?: Msg[]; // Expedition Riddle clues
  timeLimit: number; // seconds, before assists
  fact?: Msg;
  chart?: string; // place id that becomes "charted" when answered correctly
  revisit?: boolean;
}

export type Answer =
  | { type: 'choice'; index: number }
  | { type: 'map'; x: number; y: number }
  | { type: 'timeout' };

export type Outcome = 'correct' | 'near' | 'wrong';

export interface AnswerResult {
  outcome: Outcome;
  clicked?: string; // place id of the country clicked, if any
  click?: [number, number];
}

export interface PlayerSetup {
  name: string;
  explorer: ExplorerId;
  level: Level;
  timer: 'normal' | 'long' | 'off';
}

export interface GameConfig {
  players: PlayerSetup[];
  seed: number;
  rivalItems: boolean;
  mode: 'hotseat' | 'online';
}

export type TurnStage =
  | 'plan'
  | 'question'
  | 'review'
  | 'done'
  | 'bonus-question'
  | 'bonus-review'
  | 'reward'
  | 'waiting';

export interface PlanChoice {
  tier: Tier | 'riddle' | 'camp';
  fork?: string;
  tradeWinds?: boolean;
  depotSpend?: number;
  provisions?: boolean;
  medicine?: boolean;
  guide?: GuideCategory;
  rumourTarget?: number;
  portersTarget?: number;
  levelChange?: -1 | 0 | 1;
}

export interface TurnState {
  stage: TurnStage;
  plan?: PlanChoice;
  question?: Question;
  result?: AnswerResult;
  riddleKind?: 'discovery' | 'final';
  cluesShown: number;
  spyglass?: { removed?: number[]; hint?: { x: number; y: number; r: number } };
  earned: number;
  penalty: number;
  threatFrozen: boolean;
  usedCompass: boolean;
  usedPaiza: boolean;
  storeDepot: boolean;
  porters: number;
  // bonus phase
  bonus?: { kind: 'checkpoint' | 'landmark'; node: string; question: Question; result?: AnswerResult; itemGained?: ItemId | null };
}

export interface BonusTask {
  kind: 'checkpoint' | 'landmark';
  node: string;
}

export interface Revisit {
  subject: string;
  due: number;
  avoidRef: string;
}

export interface JournalEntry {
  round: number;
  region: string;
  category: Category;
  prompt: Msg;
  answer: Msg;
  outcome: Outcome;
  fact?: Msg;
  bonus?: boolean;
}

export interface PlayerStats {
  answered: number;
  correct: number;
  near: number;
  riddlesSolved: number;
  checkpoints: number;
  caught: number;
  historicalBranches: number;
  forks: number;
  byRegion: Record<string, [number, number]>; // [correct, answered]
  actScore: [number, number]; // current act [correct, answered]
}

export interface PlayerState {
  id: number;
  name: string;
  explorer: ExplorerId;
  level: Level;
  timer: 'normal' | 'long' | 'off';
  position: number; // index along the resolved path
  threat: number; // index along the resolved path (may be negative: off the board)
  lives: number;
  items: ItemId[];
  shield: boolean;
  forks: Record<string, string>; // fork id -> chosen branch id
  unlocked: string[]; // node ids of unlocked checkpoints
  visited: string[]; // landmark / discovery nodes already triggered
  depot: number;
  streak: number;
  abilityAct: number | null; // act in which the once-per-act ability was used
  physicianAct: number | null;
  hazardNext: boolean;
  forced: 'discovery' | 'final' | null;
  rumour: boolean;
  finished: { round: number; clues: number } | null;
  charted: string[];
  subjectsUsed: Record<string, number>;
  recent: string[];
  usedQuestions: string[];
  revisits: Revisit[];
  journal: JournalEntry[];
  stats: PlayerStats;
  levelOffer: { suggest: 'up' | 'down' | null } | null;
  turn: TurnState;
  bonusQueue: BonusTask[];
}

export type Phase = 'turns' | 'bonus' | 'crossroads' | 'over';

export interface CrossroadsState {
  question: Question;
  region: string;
  forPlayer: number; // whose region the question comes from
  level: Level;
  active: number | null; // player currently answering
  lockedOut: number[];
  winner: number | null;
  resolved: boolean;
  result?: AnswerResult & { player: number };
  itemGained?: ItemId | null;
}

export interface GameState {
  version: 1;
  config: GameConfig;
  rng: number;
  round: number;
  phase: Phase;
  turnOrder: number[];
  players: PlayerState[];
  crossroads: CrossroadsState | null;
  bonusThen: 'threat' | 'next';
  winners: number[];
  log: GameEvent[];
  counter: number;
}

export type GameEvent =
  | { type: 'roundStarted'; round: number }
  | { type: 'moved'; player: number; from: number; to: number; reason: 'answer' | 'crossroads' | 'reward' }
  | { type: 'threatMoved'; player: number; from: number; to: number }
  | { type: 'caught'; player: number; lifeLost: boolean; to: number; prevented?: 'shelter' | 'physician' }
  | { type: 'stranded'; player: number; to: number }
  | { type: 'checkpointUnlocked'; player: number; node: string }
  | { type: 'itemGained'; player: number; item: ItemId }
  | { type: 'packFull'; player: number; item: ItemId }
  | { type: 'itemUsed'; player: number; item: ItemId; target?: number }
  | { type: 'blocked'; player: number; item: ItemId; by: number }
  | { type: 'lifeGained'; player: number; amount: number }
  | { type: 'forkChosen'; player: number; fork: string; branch: string; historical: boolean }
  | { type: 'actStarted'; player: number; act: number }
  | { type: 'levelChanged'; player: number; level: Level }
  | { type: 'crossroadsWon'; player: number }
  | { type: 'gameOver'; winners: number[] };

export type Command =
  | { type: 'plan'; player: number; plan: PlanChoice }
  | { type: 'answer'; player: number; answer: Answer }
  | { type: 'revealClue'; player: number }
  | { type: 'useSpyglass'; player: number }
  | { type: 'useCompass'; player: number }
  | { type: 'usePaiza'; player: number }
  | { type: 'setDepotStore'; player: number; store: boolean }
  | { type: 'endTurn'; player: number }
  | { type: 'bonusAnswer'; player: number; answer: Answer }
  | { type: 'chooseReward'; player: number; reward: RewardId }
  | { type: 'bonusContinue'; player: number }
  | { type: 'buzz'; player: number }
  | { type: 'crossroadsAnswer'; player: number; answer: Answer }
  | { type: 'crossroadsClose' }
  | { type: 'continue' };

export class CommandError extends Error {}
