// The game engine: (state, command) -> (new state, events). Deterministic and seeded.
import type { ContentIndex, ResolvedPath, RouteNode } from './content';
import { forkDef, levelIndex, resolvePath } from './content';
import {
  baseTime, checkAnswer, hintCircle, pickFinal, pickLandmark, pickQuestion, pickRevisit, pickRiddle, type PickContext,
} from './questions';
import { createRng, type Rng } from './rng';
import {
  ABILITY, CROSSROADS_EVERY, DEPOT_MAX, FINAL_TIME, FORK_DECISION_DISTANCE, ITEM_WEIGHTS, MAX_LIVES, PACK_SIZE, RIDDLE_PENALTY,
  RIDDLE_STEPS, RIVAL_ITEMS, START_LIVES, STREAK_FOR_ITEM, THREAT_START_BEHIND, THREATS, TIER_RULES, ratingBand,
} from './rules';
import {
  CommandError, LEVELS, type Answer, type Command, type GameConfig, type GameEvent, type GameState, type ItemId,
  type PlanChoice, type PlayerState, type Question, type RewardId, type Tier, type TurnState,
} from './types';

// ------------------------------------------------------------------ helpers

export function pathOf(ix: ContentIndex, p: PlayerState): ResolvedPath {
  return resolvePath(ix.route.get(p.explorer)!, p.forks);
}

export function nodeAt(ix: ContentIndex, p: PlayerState, index: number, path = pathOf(ix, p)): RouteNode {
  const i = Math.max(0, Math.min(index, path.nodes.length - 1));
  return ix.node.get(`${p.explorer}.${path.nodes[i]}`)!;
}

export function currentAct(ix: ContentIndex, p: PlayerState): number {
  return nodeAt(ix, p, p.position).act;
}

export function progressOf(ix: ContentIndex, p: PlayerState): number {
  const path = pathOf(ix, p);
  return p.position / (path.nodes.length - 1);
}

/** The id of a fork the player must decide before moving on, if any. */
export function pendingFork(ix: ContentIndex, p: PlayerState): string | null {
  const path = pathOf(ix, p);
  for (const [fork, at] of Object.entries(path.forkAt)) {
    if (!p.forks[fork] && at >= p.position && at - p.position <= FORK_DECISION_DISTANCE) return fork;
  }
  return null;
}

/** Ordered question regions for a player: current region (70%), next region on the route (20%), the rest (10%). */
export function regionsFor(ix: ContentIndex, p: PlayerState): { id: string; weight: number }[] {
  const path = pathOf(ix, p);
  const here = nodeAt(ix, p, p.position, path).region;
  let next = here;
  for (let i = p.position + 1; i < path.nodes.length; i++) {
    const r = nodeAt(ix, p, i, path).region;
    if (r !== here) { next = r; break; }
  }
  const all = [...new Set(path.nodes.map((_, i) => nodeAt(ix, p, i, path).region))].filter((r) => r !== here && r !== next);
  const out = [{ id: here, weight: next === here ? 0.9 : 0.7 }];
  if (next !== here) out.push({ id: next, weight: 0.2 });
  for (const r of all) out.push({ id: r, weight: 0.1 / all.length });
  return out;
}

function freshTurn(): TurnState {
  return { stage: 'plan', cluesShown: 0, earned: 0, penalty: 0, threatFrozen: false, usedCompass: false, usedPaiza: false, storeDepot: false, porters: 0 };
}

function uid(s: GameState): string {
  s.counter += 1;
  return `q${s.counter}`;
}

function drawItem(s: GameState, rng: Rng, rivalOnly = false): ItemId {
  const pool = (Object.keys(ITEM_WEIGHTS) as ItemId[]).filter((i) =>
    rivalOnly ? RIVAL_ITEMS.includes(i) : s.config.rivalItems || !RIVAL_ITEMS.includes(i),
  );
  return rng.weighted(pool, (i) => ITEM_WEIGHTS[i]);
}

function giveItem(s: GameState, p: PlayerState, item: ItemId, ev: GameEvent[]): void {
  if (p.items.length >= PACK_SIZE) {
    ev.push({ type: 'packFull', player: p.id, item });
    return;
  }
  p.items.push(item);
  ev.push({ type: 'itemGained', player: p.id, item });
}

function takeItem(p: PlayerState, item: ItemId): void {
  const i = p.items.indexOf(item);
  if (i < 0) throw new CommandError(`no ${item} in pack`);
  p.items.splice(i, 1);
}

function addLives(p: PlayerState, n: number, ev: GameEvent[]): void {
  const before = p.lives;
  p.lives = Math.min(MAX_LIVES, p.lives + n);
  if (p.lives > before) ev.push({ type: 'lifeGained', player: p.id, amount: p.lives - before });
}

function pickCtx(ix: ContentIndex, s: GameState, rng: Rng, p: PlayerState, tier: Tier, extra = 0): PickContext {
  return {
    ix, rng, player: p, level: p.level, band: ratingBand(p.level, tier, currentAct(ix, p), extra), tier,
    regions: regionsFor(ix, p), uid: uid(s),
  };
}

function recordUse(p: PlayerState, q: Question): void {
  p.subjectsUsed[q.subject] = (p.subjectsUsed[q.subject] ?? 0) + 1;
  p.recent = [...p.recent, q.subject].slice(-4);
  if (!q.ref.startsWith('gen:')) p.usedQuestions.push(q.ref);
}

function actStartIndex(ix: ContentIndex, p: PlayerState, act: number): number {
  if (act <= 1) return 0;
  const path = pathOf(ix, p);
  let idx = 0;
  path.nodes.forEach((_, i) => { if (nodeAt(ix, p, i, path).act === act - 1) idx = i; });
  return idx;
}

function latestCheckpoint(ix: ContentIndex, p: PlayerState): number {
  const path = pathOf(ix, p);
  for (let i = Math.min(p.position, path.nodes.length - 1); i >= 0; i--) {
    if (p.unlocked.includes(path.nodes[i])) return i;
  }
  return 0;
}

// ------------------------------------------------------------------ creation

export function createGame(ix: ContentIndex, config: GameConfig): GameState {
  if (config.players.length < 1 || config.players.length > 4) throw new CommandError('1–4 players');
  const explorers = new Set(config.players.map((p) => p.explorer));
  if (explorers.size !== config.players.length) throw new CommandError('each player needs a different explorer');
  const players: PlayerState[] = config.players.map((setup, id) => {
    const route = ix.route.get(setup.explorer)!;
    return {
      id, name: setup.name, explorer: setup.explorer, level: setup.level, timer: setup.timer,
      position: 0, threat: -THREAT_START_BEHIND, lives: START_LIVES, items: [], shield: false, forks: {},
      unlocked: [route.sequence[0] as string], visited: [], depot: 0, streak: 0, abilityAct: null, physicianAct: null,
      hazardNext: false, forced: null, rumour: false, finished: null, charted: [], subjectsUsed: {}, recent: [],
      usedQuestions: [], revisits: [], journal: [],
      stats: { answered: 0, correct: 0, near: 0, riddlesSolved: 0, checkpoints: 0, caught: 0, historicalBranches: 0, forks: 0, byRegion: {}, actScore: [0, 0] },
      levelOffer: null, turn: freshTurn(), bonusQueue: [],
    };
  });
  return {
    version: 1, config, rng: config.seed | 0, round: 1, phase: 'turns', turnOrder: players.map((p) => p.id), players,
    crossroads: null, bonusThen: 'threat', winners: [], log: [{ type: 'roundStarted', round: 1 }], counter: 0,
  };
}

// ------------------------------------------------------------------ movement & threats

function applyMovement(ix: ContentIndex, s: GameState, p: PlayerState, steps: number, reason: 'answer' | 'crossroads' | 'reward', ev: GameEvent[]): void {
  if (steps <= 0 || p.finished) return;
  const path = pathOf(ix, p);
  const last = path.nodes.length - 1;
  const from = p.position;
  let to = Math.min(from + steps, last);
  for (const [fork, at] of Object.entries(path.forkAt)) {
    if (!p.forks[fork] && at >= from && to > at) to = at; // must choose a branch first
  }
  if (to === from) return;
  const startAct = nodeAt(ix, p, from, path).act;
  p.position = to;
  ev.push({ type: 'moved', player: p.id, from, to, reason });
  for (let i = from + 1; i <= to; i++) {
    const n = nodeAt(ix, p, i, path);
    if (n.type === 'checkpoint' && !p.unlocked.includes(n.id) && !p.bonusQueue.some((b) => b.node === n.id)) {
      p.bonusQueue.push({ kind: 'checkpoint', node: n.id });
    }
    if (n.type === 'landmark' && !p.visited.includes(n.id)) {
      p.visited.push(n.id);
      p.bonusQueue.push({ kind: 'landmark', node: n.id });
    }
    if (n.type === 'discovery' && !p.visited.includes(n.id)) {
      p.visited.push(n.id);
      if (p.forced !== 'final') p.forced = 'discovery';
    }
  }
  const endNode = nodeAt(ix, p, to, path);
  if (endNode.act > startAct) {
    ev.push({ type: 'actStarted', player: p.id, act: endNode.act });
    const [c, n] = p.stats.actScore;
    const li = levelIndex(p.level);
    const suggest = n >= 3 && c / n > 0.85 && li < 3 ? 'up' : n >= 3 && c / n < 0.45 && li > 0 ? 'down' : null;
    p.levelOffer = { suggest };
    p.stats.actScore = [0, 0];
  }
  p.hazardNext = endNode.type === 'hazard';
  if (to === last) p.forced = 'final';
}

function catchCheck(ix: ContentIndex, s: GameState, p: PlayerState, ev: GameEvent[]): void {
  if (p.finished || p.threat < p.position) return;
  if (p.shield) {
    p.shield = false;
    p.threat = p.position - 2;
    ev.push({ type: 'caught', player: p.id, lifeLost: false, to: p.position, prevented: 'shelter' });
    return;
  }
  const act = currentAct(ix, p);
  p.stats.caught += 1;
  let prevented: 'physician' | undefined;
  if (ABILITY[p.explorer] === 'physician' && p.physicianAct !== act) {
    p.physicianAct = act;
    prevented = 'physician';
  } else {
    p.lives -= 1;
  }
  p.forced = null;
  p.hazardNext = false;
  if (p.lives <= 0) {
    p.position = actStartIndex(ix, p, act);
    p.items = [];
    p.lives = 1;
    ev.push({ type: 'stranded', player: p.id, to: p.position });
  } else {
    p.position = latestCheckpoint(ix, p);
    ev.push({ type: 'caught', player: p.id, lifeLost: !prevented, to: p.position, prevented });
  }
  p.threat = p.position - THREAT_START_BEHIND;
}

function moveThreat(ix: ContentIndex, s: GameState, p: PlayerState, steps: number, ev: GameEvent[]): void {
  if (steps <= 0 || p.finished) return;
  const from = p.threat;
  p.threat += steps;
  ev.push({ type: 'threatMoved', player: p.id, from, to: p.threat });
  catchCheck(ix, s, p, ev);
}

// ------------------------------------------------------------------ phases

function allDone(s: GameState): boolean {
  return s.players.every((p) => p.turn.stage === 'done');
}

function resolveTurns(ix: ContentIndex, s: GameState, rng: Rng, ev: GameEvent[]): void {
  const finishers = s.players.filter((p) => p.finished && p.finished.round === s.round);
  if (finishers.length) {
    const score = (p: PlayerState) => [p.finished!.clues, -p.lives, -p.charted.length];
    finishers.sort((a, b) => {
      const x = score(a), y = score(b);
      return x[0] - y[0] || x[1] - y[1] || x[2] - y[2];
    });
    const best = score(finishers[0]).join();
    s.winners = finishers.filter((p) => score(p).join() === best).map((p) => p.id);
    s.phase = 'over';
    ev.push({ type: 'gameOver', winners: s.winners });
    return;
  }
  const prog = s.players.map((p) => progressOf(ix, p));
  const min = Math.min(...prog), max = Math.max(...prog);
  for (const id of s.turnOrder) {
    const p = s.players[id];
    const t = p.turn;
    let steps = t.earned;
    const correct = t.result?.outcome === 'correct' && t.plan?.tier !== 'camp';
    if (correct && s.players.length > 1 && prog[id] === min && min < max) steps += 1; // Second Wind
    if (t.plan?.depotSpend) steps += t.plan.depotSpend;
    if (t.storeDepot && steps > 0) { steps -= 1; p.depot += 1; }
    applyMovement(ix, s, p, steps, 'answer', ev);
  }
  startBonusOrNext(ix, s, rng, ev, 'threat');
}

function startBonusTask(ix: ContentIndex, s: GameState, rng: Rng, p: PlayerState, ev: GameEvent[]): void {
  while (p.bonusQueue.length) {
    const task = p.bonusQueue[0];
    const key = `${p.explorer}.${task.node}`;
    const node = ix.node.get(key)!;
    const q = pickLandmark(ix, key, node.region, p.level, rng, uid(s));
    if (q) {
      p.turn.bonus = { kind: task.kind, node: task.node, question: q };
      p.turn.stage = 'bonus-question';
      return;
    }
    // no content for this node: checkpoints unlock automatically
    if (task.kind === 'checkpoint') {
      p.unlocked.push(task.node);
      ev.push({ type: 'checkpointUnlocked', player: p.id, node: task.node });
    }
    p.bonusQueue.shift();
  }
  p.turn.bonus = undefined;
  p.turn.stage = 'waiting';
}

function startBonusOrNext(ix: ContentIndex, s: GameState, rng: Rng, ev: GameEvent[], then: 'threat' | 'next'): void {
  if (s.players.some((p) => p.bonusQueue.length)) {
    s.phase = 'bonus';
    s.bonusThen = then;
    for (const p of s.players) startBonusTask(ix, s, rng, p, ev);
    if (s.players.every((p) => p.turn.stage === 'waiting')) finishBonus(ix, s, rng, ev);
    return;
  }
  if (then === 'threat') threatPhase(ix, s, rng, ev);
  else nextRound(ix, s, ev);
}

function finishBonus(ix: ContentIndex, s: GameState, rng: Rng, ev: GameEvent[]): void {
  if (s.bonusThen === 'threat') threatPhase(ix, s, rng, ev);
  else nextRound(ix, s, ev);
}

function threatPhase(ix: ContentIndex, s: GameState, rng: Rng, ev: GameEvent[]): void {
  for (const id of s.turnOrder) {
    const p = s.players[id];
    if (p.finished) continue;
    const t = p.turn;
    if (t.threatFrozen) continue;
    const terrain = nodeAt(ix, p, Math.max(0, p.threat)).terrain;
    const steps = THREATS[p.explorer].base(terrain, s.round) + t.penalty + t.porters;
    moveThreat(ix, s, p, steps, ev);
  }
  if (s.round % CROSSROADS_EVERY === 0) startCrossroads(ix, s, rng, ev);
  else nextRound(ix, s, ev);
}

function startCrossroads(ix: ContentIndex, s: GameState, rng: Rng, ev: GameEvent[]): void {
  const prog = s.players.map((p) => progressOf(ix, p));
  const last = s.turnOrder.reduce((a, b) => (prog[b] < prog[a] ? b : a));
  const p = s.players[last];
  const level = LEVELS[Math.min(...s.players.map((x) => levelIndex(x.level)))];
  const ctx: PickContext = {
    ix, rng, player: p, level, band: ratingBand(level, 'navigator', currentAct(ix, p)), tier: 'navigator',
    regions: regionsFor(ix, p).slice(0, 1), uid: uid(s), preferMap: true,
  };
  const q = pickQuestion(ctx);
  s.crossroads = { question: q, region: q.region, forPlayer: last, level, active: null, lockedOut: [], winner: null, resolved: false };
  s.phase = 'crossroads';
  for (const pl of s.players) pl.turn.stage = 'waiting';
}

function nextRound(ix: ContentIndex, s: GameState, ev: GameEvent[]): void {
  s.round += 1;
  s.phase = 'turns';
  s.crossroads = null;
  s.turnOrder = [...s.turnOrder.slice(1), s.turnOrder[0]];
  for (const p of s.players) p.turn = freshTurn();
  ev.push({ type: 'roundStarted', round: s.round });
}

function journal(p: PlayerState, s: GameState, q: Question, outcome: 'correct' | 'near' | 'wrong', bonus = false): void {
  p.journal.push({
    round: s.round, region: q.region, category: q.category, prompt: q.prompt, answer: q.answerLabel!, outcome, fact: q.fact, bonus,
  });
  if (bonus) return;
  p.stats.answered += 1;
  if (outcome === 'correct') p.stats.correct += 1;
  if (outcome === 'near') p.stats.near += 1;
  const r = (p.stats.byRegion[q.region] ??= [0, 0]);
  r[1] += 1;
  if (outcome === 'correct') r[0] += 1;
  p.stats.actScore[1] += 1;
  if (outcome === 'correct') p.stats.actScore[0] += 1;
}

// ------------------------------------------------------------------ commands

function player(s: GameState, id: number): PlayerState {
  const p = s.players[id];
  if (!p) throw new CommandError('unknown player');
  return p;
}

function expectStage(p: PlayerState, ...stages: TurnState['stage'][]): void {
  if (!stages.includes(p.turn.stage)) throw new CommandError(`player ${p.id} is in stage ${p.turn.stage}`);
}

function doPlan(ix: ContentIndex, s: GameState, rng: Rng, p: PlayerState, plan: PlanChoice, ev: GameEvent[]): void {
  if (s.phase !== 'turns') throw new CommandError('not the turns phase');
  expectStage(p, 'plan');
  const act = currentAct(ix, p);
  const t = p.turn;
  const route = ix.route.get(p.explorer)!;

  // level change offered at the start of an act
  if (plan.levelChange) {
    if (!p.levelOffer) throw new CommandError('level change only at the start of an act');
    const li = Math.max(0, Math.min(3, levelIndex(p.level) + plan.levelChange));
    p.level = LEVELS[li];
    ev.push({ type: 'levelChanged', player: p.id, level: p.level });
  }
  p.levelOffer = null;

  // fork
  const fork = pendingFork(ix, p);
  if (fork) {
    const def = forkDef(route, fork)!;
    const branch = def.branches.find((b) => b.id === plan.fork);
    if (!branch) throw new CommandError('choose a branch at the fork');
    p.forks[fork] = branch.id;
    p.stats.forks += 1;
    if (branch.historical) p.stats.historicalBranches += 1;
    ev.push({ type: 'forkChosen', player: p.id, fork, branch: branch.id, historical: branch.historical });
  }

  // tier validation
  let tier = plan.tier;
  if (p.forced) tier = 'riddle';
  if (tier === 'riddle' && !p.forced) throw new CommandError('riddles only at discovery nodes or the finish');
  if (tier === 'camp') {
    const n = nodeAt(ix, p, p.position);
    if (n.type !== 'checkpoint' || p.unlocked.includes(n.id)) throw new CommandError('can only camp on an unclaimed checkpoint');
  }
  if (p.hazardNext && tier === 'scout') throw new CommandError('a hazard requires Navigator or Pathfinder');
  p.hazardNext = false;

  // items and abilities
  if (plan.medicine) {
    takeItem(p, 'medicine');
    ev.push({ type: 'itemUsed', player: p.id, item: 'medicine' });
    addLives(p, ABILITY[p.explorer] === 'physician' ? 2 : 1, ev);
  }
  if (plan.provisions) {
    takeItem(p, 'provisions');
    t.threatFrozen = true;
    ev.push({ type: 'itemUsed', player: p.id, item: 'provisions' });
  }
  if (plan.guide) {
    takeItem(p, 'guide');
    ev.push({ type: 'itemUsed', player: p.id, item: 'guide' });
  }
  for (const [item, target] of [['rumour', plan.rumourTarget], ['porters', plan.portersTarget]] as const) {
    if (target === undefined) continue;
    if (target === p.id || !s.players[target]) throw new CommandError('invalid target');
    takeItem(p, item);
    const victim = s.players[target];
    ev.push({ type: 'itemUsed', player: p.id, item, target });
    if (victim.shield) {
      victim.shield = false;
      ev.push({ type: 'blocked', player: target, item, by: p.id });
    } else if (item === 'rumour') victim.rumour = true;
    else victim.turn.porters += 1;
  }
  if (plan.tradeWinds) {
    if (ABILITY[p.explorer] !== 'tradeWinds' || p.abilityAct === act) throw new CommandError('Trade Winds not available');
    if (tier === 'camp') throw new CommandError('Trade Winds needs a challenge');
    p.abilityAct = act;
  }
  if (plan.depotSpend) {
    if (ABILITY[p.explorer] !== 'depot' || plan.depotSpend > p.depot || plan.depotSpend < 0) throw new CommandError('not enough in the depot');
    p.depot -= plan.depotSpend;
  }
  t.plan = { ...plan, tier };

  // build the challenge
  let q: Question;
  if (tier === 'camp') {
    const n = nodeAt(ix, p, p.position);
    q = pickLandmark(ix, `${p.explorer}.${n.id}`, n.region, p.level, rng, uid(s))!;
  } else if (tier === 'riddle') {
    const ctx = pickCtx(ix, s, rng, p, 'navigator');
    t.riddleKind = p.forced!;
    q = p.forced === 'final' ? { ...pickFinal(ctx, p.explorer), timeLimit: FINAL_TIME } : pickRiddle(ctx);
    t.cluesShown = 1;
  } else {
    const ctx = pickCtx(ix, s, rng, p, tier, p.rumour ? 1 : 0);
    if (plan.guide) ctx.guide = plan.guide;
    p.rumour = false;
    const due = p.revisits.find((r) => r.due <= s.round);
    let rq: Question | null = null;
    if (due && !plan.guide) {
      rq = pickRevisit(ctx, due.subject, due.avoidRef);
      p.revisits = p.revisits.filter((r) => r !== due);
    }
    q = rq ?? pickQuestion(ctx);
    q.timeLimit = baseTime(tier);
  }
  recordUse(p, q);
  t.question = q;
  t.stage = 'question';
}

function doAnswer(ix: ContentIndex, s: GameState, rng: Rng, p: PlayerState, answer: Answer, ev: GameEvent[]): void {
  expectStage(p, 'question');
  const t = p.turn;
  const q = t.question!;
  const res = checkAnswer(ix, q, answer);
  t.result = res;
  const tier = t.plan!.tier;
  const outcome = res.outcome;
  if (tier === 'riddle') {
    if (outcome === 'correct') {
      p.stats.riddlesSolved += 1;
      if (t.riddleKind === 'final') p.finished = { round: s.round, clues: t.cluesShown };
      else t.earned = RIDDLE_STEPS[t.cluesShown - 1];
    } else if (outcome === 'wrong') {
      t.penalty = t.riddleKind === 'final' ? 1 : RIDDLE_PENALTY;
    }
    if (t.riddleKind === 'discovery') p.forced = null;
  } else if (tier === 'camp') {
    if (outcome === 'correct') {
      const n = nodeAt(ix, p, p.position);
      p.unlocked.push(n.id);
      p.stats.checkpoints += 1;
      p.bonusQueue = p.bonusQueue.filter((b) => b.node !== n.id);
      ev.push({ type: 'checkpointUnlocked', player: p.id, node: n.id });
    }
  } else {
    const rule = TIER_RULES[tier];
    const tw = !!t.plan!.tradeWinds;
    if (outcome === 'correct') t.earned = rule.steps * (tw ? 2 : 1) + (q.revisit ? 1 : 0);
    else if (outcome === 'near') t.earned = rule.near;
    else t.penalty = rule.penalty + (tw ? 1 : 0);
  }
  if (outcome === 'correct') {
    if (q.chart && !p.charted.includes(q.chart)) p.charted.push(q.chart);
    p.streak += 1;
    if (p.streak >= STREAK_FOR_ITEM) {
      p.streak = 0;
      giveItem(s, p, drawItem(s, rng), ev);
    }
  } else {
    p.streak = 0;
    if (tier !== 'riddle' && tier !== 'camp' && q.chart && !q.revisit) {
      p.revisits.push({ subject: q.subject, due: s.round + 3 + rng.int(3), avoidRef: q.ref });
    }
  }
  journal(p, s, q, outcome, tier === 'camp');
  t.stage = tier === 'camp' && outcome === 'correct' ? 'reward' : 'review';
}

function applyReward(ix: ContentIndex, s: GameState, rng: Rng, p: PlayerState, reward: RewardId, ev: GameEvent[]): void {
  if (reward === 'life') addLives(p, 1, ev);
  else if (reward === 'march') applyMovement(ix, s, p, 2, 'reward', ev);
  else if (reward === 'supplies') giveItem(s, p, drawItem(s, rng), ev);
  else if (reward === 'shelter') p.shield = true;
}

function maybeFinishBonus(ix: ContentIndex, s: GameState, rng: Rng, ev: GameEvent[]): void {
  if (s.phase === 'bonus' && s.players.every((p) => p.turn.stage === 'waiting')) finishBonus(ix, s, rng, ev);
}

function execute(ix: ContentIndex, s: GameState, rng: Rng, cmd: Command, ev: GameEvent[]): void {
  if (s.phase === 'over') throw new CommandError('the game is over');
  switch (cmd.type) {
    case 'plan':
      return doPlan(ix, s, rng, player(s, cmd.player), cmd.plan, ev);
    case 'answer':
      return doAnswer(ix, s, rng, player(s, cmd.player), cmd.answer, ev);
    case 'revealClue': {
      const p = player(s, cmd.player);
      expectStage(p, 'question');
      if (p.turn.plan?.tier !== 'riddle' || p.turn.cluesShown >= 3) throw new CommandError('no more clues');
      p.turn.cluesShown += 1;
      return;
    }
    case 'useSpyglass': {
      const p = player(s, cmd.player);
      expectStage(p, 'question');
      if (p.turn.spyglass) throw new CommandError('spyglass already used');
      takeItem(p, 'spyglass');
      const q = p.turn.question!;
      if (q.input === 'choice') {
        const wrong = q.options!.map((_, i) => i).filter((i) => i !== q.correct);
        p.turn.spyglass = { removed: rng.shuffle(wrong).slice(0, 2) };
      } else {
        p.turn.spyglass = { hint: hintCircle(ix, q, rng) };
      }
      ev.push({ type: 'itemUsed', player: p.id, item: 'spyglass' });
      return;
    }
    case 'useCompass': {
      const p = player(s, cmd.player);
      expectStage(p, 'review');
      const t = p.turn;
      const tier = t.plan!.tier;
      if (t.result?.outcome !== 'wrong' || tier === 'riddle' || tier === 'camp' || t.usedCompass || t.usedPaiza) {
        throw new CommandError('compass not usable now');
      }
      takeItem(p, 'compass');
      t.usedCompass = true;
      const ctx = pickCtx(ix, s, rng, p, tier);
      const q = pickQuestion(ctx);
      q.timeLimit = baseTime(tier);
      recordUse(p, q);
      Object.assign(t, { question: q, result: undefined, penalty: 0, earned: 0, spyglass: undefined, stage: 'question' });
      ev.push({ type: 'itemUsed', player: p.id, item: 'compass' });
      return;
    }
    case 'usePaiza': {
      const p = player(s, cmd.player);
      expectStage(p, 'review');
      const act = currentAct(ix, p);
      const t = p.turn;
      if (ABILITY[p.explorer] !== 'paiza' || p.abilityAct === act || t.result?.outcome === 'correct' || t.plan?.tier === 'camp' || t.riddleKind === 'final') {
        throw new CommandError('Golden Paiza not usable now');
      }
      p.abilityAct = act;
      t.usedPaiza = true;
      t.penalty = 0;
      t.earned = Math.max(1, t.earned);
      t.threatFrozen = true;
      return;
    }
    case 'setDepotStore': {
      const p = player(s, cmd.player);
      expectStage(p, 'review');
      if (ABILITY[p.explorer] !== 'depot' || p.turn.earned < 1 || (cmd.store && p.depot >= DEPOT_MAX)) throw new CommandError('cannot store');
      p.turn.storeDepot = cmd.store;
      return;
    }
    case 'endTurn': {
      const p = player(s, cmd.player);
      expectStage(p, 'review');
      p.turn.stage = 'done';
      if (allDone(s)) resolveTurns(ix, s, rng, ev);
      return;
    }
    case 'bonusAnswer': {
      const p = player(s, cmd.player);
      expectStage(p, 'bonus-question');
      const b = p.turn.bonus!;
      b.result = checkAnswer(ix, b.question, cmd.answer);
      journal(p, s, b.question, b.result.outcome, true);
      if (b.result.outcome === 'correct') {
        if (b.kind === 'checkpoint') {
          p.unlocked.push(b.node);
          p.stats.checkpoints += 1;
          ev.push({ type: 'checkpointUnlocked', player: p.id, node: b.node });
          p.turn.stage = 'reward';
          return;
        }
        const item = drawItem(s, rng);
        b.itemGained = p.items.length < PACK_SIZE ? item : null;
        giveItem(s, p, item, ev);
      }
      p.turn.stage = 'bonus-review';
      return;
    }
    case 'chooseReward': {
      const p = player(s, cmd.player);
      expectStage(p, 'reward');
      applyReward(ix, s, rng, p, cmd.reward, ev);
      p.turn.stage = s.phase === 'bonus' ? 'bonus-review' : 'review';
      return;
    }
    case 'bonusContinue': {
      const p = player(s, cmd.player);
      expectStage(p, 'bonus-review');
      p.bonusQueue.shift();
      startBonusTask(ix, s, rng, p, ev);
      maybeFinishBonus(ix, s, rng, ev);
      return;
    }
    case 'buzz': {
      const c = s.crossroads;
      if (s.phase !== 'crossroads' || !c || c.resolved || c.active !== null) throw new CommandError('cannot buzz now');
      if (c.lockedOut.includes(cmd.player)) throw new CommandError('locked out');
      player(s, cmd.player);
      c.active = cmd.player;
      return;
    }
    case 'crossroadsAnswer': {
      const c = s.crossroads;
      if (s.phase !== 'crossroads' || !c || c.resolved || c.active !== cmd.player) throw new CommandError('not your answer');
      const p = player(s, cmd.player);
      const res = checkAnswer(ix, c.question, cmd.answer);
      c.result = { ...res, player: p.id };
      journal(p, s, c.question, res.outcome === 'correct' ? 'correct' : 'wrong');
      if (res.outcome === 'correct') {
        c.winner = p.id;
        c.resolved = true;
        if (c.question.chart && !p.charted.includes(c.question.chart)) p.charted.push(c.question.chart);
        applyMovement(ix, s, p, 2, 'crossroads', ev);
        const item = drawItem(s, rng, s.config.rivalItems && s.players.length > 1);
        c.itemGained = p.items.length < PACK_SIZE ? item : null;
        giveItem(s, p, item, ev);
        ev.push({ type: 'crossroadsWon', player: p.id });
      } else {
        c.lockedOut.push(p.id);
        c.active = null;
        moveThreat(ix, s, p, 1, ev);
        if (c.lockedOut.length >= s.players.length) c.resolved = true;
      }
      return;
    }
    case 'crossroadsClose': {
      const c = s.crossroads;
      if (s.phase !== 'crossroads' || !c) throw new CommandError('no crossroads');
      c.resolved = true;
      c.active = null;
      return;
    }
    case 'continue': {
      if (s.phase !== 'crossroads' || !s.crossroads?.resolved) throw new CommandError('nothing to continue');
      startBonusOrNext(ix, s, rng, ev, 'next');
      return;
    }
  }
}

/** Applies a command and returns the new state and the events it produced. The input state is not modified. */
export function applyCommand(ix: ContentIndex, state: GameState, cmd: Command): { state: GameState; events: GameEvent[] } {
  const s: GameState = structuredClone(state);
  const rng = createRng(s);
  const events: GameEvent[] = [];
  execute(ix, s, rng, cmd, events);
  s.log = [...s.log, ...events].slice(-200);
  return { state: s, events };
}

export { ABILITY } from './rules';
