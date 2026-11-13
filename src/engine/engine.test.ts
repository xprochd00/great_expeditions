import { describe, expect, it } from 'vitest';
import { rawContent } from '../content/load';
import {
  applyCommand, createGame, indexContent, pathOf, pendingFork, type Answer, type Command, type ExplorerId, type GameState,
  type Level, type Question,
} from './index';
import { createRng } from './rng';
import { allCandidates, checkAnswer } from './questions';
import { viewFor } from './view';

const ix = indexContent(rawContent);

function targetPoint(q: Question): [number, number] {
  const t = q.target!;
  if (t.startsWith('country.')) return ix.countryShape.get(t.slice(8))!.centroid;
  const f = ix.featureShape.get(t)!;
  return f.kind === 'line' ? [f.rings[0][0], f.rings[0][1]] : f.centroid;
}

function answerFor(q: Question, good: boolean, rng: ReturnType<typeof createRng>): Answer {
  if (q.input === 'choice') return { type: 'choice', index: good ? q.correct! : (q.correct! + 1) % q.options!.length };
  if (good) {
    const [x, y] = targetPoint(q);
    return { type: 'map', x, y };
  }
  return { type: 'map', x: rng.int(2000), y: rng.int(1000) };
}

/** A simple bot that answers correctly with probability `skill`. */
function botStep(s: GameState, skill: number, rng: ReturnType<typeof createRng>): Command {
  if (s.phase === 'crossroads') {
    const c = s.crossroads!;
    if (c.resolved) return { type: 'continue' };
    if (c.active === null) {
      const free = s.players.filter((p) => !c.lockedOut.includes(p.id));
      return free.length && rng.next() < 0.9 ? { type: 'buzz', player: rng.pick(free).id } : { type: 'crossroadsClose' };
    }
    return { type: 'crossroadsAnswer', player: c.active, answer: answerFor(c.question, rng.next() < skill, rng) };
  }
  for (const id of s.turnOrder) {
    const p = s.players[id];
    const t = p.turn;
    switch (t.stage) {
      case 'plan': {
        const fork = pendingFork(ix, p);
        const def = fork ? (ix.route.get(p.explorer)!.sequence.find((x) => typeof x !== 'string' && x.fork === fork) as { branches: { id: string }[] }) : null;
        const tiers = p.hazardNext ? (['navigator', 'pathfinder'] as const) : (['scout', 'navigator', 'pathfinder'] as const);
        return {
          type: 'plan', player: id,
          plan: {
            tier: rng.pick(tiers),
            fork: def ? rng.pick(def.branches).id : undefined,
            provisions: p.items.includes('provisions') && rng.next() < 0.3 ? true : undefined,
            medicine: p.items.includes('medicine') && p.lives < 3 ? true : undefined,
            levelChange: p.levelOffer && rng.next() < 0.3 ? 1 : undefined,
            tradeWinds: p.explorer === 'magellan' && p.abilityAct === null && rng.next() < 0.3 ? true : undefined,
            depotSpend: p.depot > 0 && rng.next() < 0.5 ? p.depot : undefined,
            rumourTarget: p.items.includes('rumour') && s.players.length > 1 ? (id + 1) % s.players.length : undefined,
          },
        };
      }
      case 'question':
        if (t.plan?.tier === 'riddle' && t.cluesShown < 3 && rng.next() < 0.5) return { type: 'revealClue', player: id };
        if (p.items.includes('spyglass') && !t.spyglass && rng.next() < 0.3) return { type: 'useSpyglass', player: id };
        return { type: 'answer', player: id, answer: answerFor(t.question!, rng.next() < skill, rng) };
      case 'review':
        if (t.result?.outcome === 'wrong' && p.items.includes('compass') && !t.usedCompass && t.plan?.tier !== 'riddle' && t.plan?.tier !== 'camp') {
          return { type: 'useCompass', player: id };
        }
        return { type: 'endTurn', player: id };
      case 'reward':
        return { type: 'chooseReward', player: id, reward: rng.pick(['life', 'march', 'supplies', 'shelter'] as const) };
      case 'bonus-question':
        return { type: 'bonusAnswer', player: id, answer: answerFor(t.bonus!.question, rng.next() < skill, rng) };
      case 'bonus-review':
        return { type: 'bonusContinue', player: id };
      default:
        break;
    }
  }
  throw new Error(`bot stuck in phase ${s.phase}: ${s.players.map((p) => p.turn.stage).join(',')}`);
}

const ALL: ExplorerId[] = ['polo', 'magellan', 'livingstone', 'amundsen'];

function play(seed: number, n: number, level: Level, skill: number) {
  const explorers = createRng({ rng: seed }).shuffle(ALL).slice(0, n);
  let s = createGame(ix, {
    seed, rivalItems: true, mode: 'hotseat',
    players: explorers.map((e, i) => ({ name: `P${i}`, explorer: e, level, timer: 'normal' })),
  });
  const rng = createRng({ rng: seed * 7 + 1 });
  let steps = 0;
  while (s.phase !== 'over' && steps < 6000) {
    s = applyCommand(ix, s, botStep(s, skill, rng)).state;
    steps++;
    for (const p of s.players) {
      if (!p.finished) expect(p.threat).toBeLessThan(p.position === 0 ? 1 : p.position + 1);
      expect(p.lives).toBeGreaterThanOrEqual(1);
      expect(p.position).toBeLessThan(pathOf(ix, p).nodes.length);
    }
  }
  return s;
}

describe('content index', () => {
  it('every region has enough countries for questions', () => {
    for (const r of rawContent.regions) {
      expect(ix.regionCountries.get(r.id)!.length, r.id).toBeGreaterThanOrEqual(4);
    }
  });
  it('every route node references a known region', () => {
    for (const route of rawContent.routes) for (const n of route.nodes) expect(ix.regionViewport.has(n.region), `${route.id}.${n.id}`).toBe(true);
  });
  it('a click on the centroid of every country answers a locate question', () => {
    for (const r of rawContent.regions) {
      for (const c of allCandidates(ix, r.id).filter((x) => x.ref === 'gen:locate_country')) {
        const q = c.build(createRng({ rng: 1 }), 'x')!;
        const [x, y] = targetPoint(q);
        expect(checkAnswer(ix, q, { type: 'map', x, y }).outcome, q.target).toBe('correct');
      }
    }
  });
});

describe('engine', () => {
  it('bots finish games for every player count and level', () => {
    const levels: Level[] = ['beginner', 'intermediate', 'advanced', 'expert'];
    let rounds = 0;
    for (let seed = 1; seed <= 24; seed++) {
      const s = play(seed, (seed % 4) + 1, levels[seed % 4], 0.65);
      expect(s.phase, `seed ${seed}`).toBe('over');
      expect(s.winners.length).toBeGreaterThan(0);
      rounds += s.round;
    }
    expect(rounds / 24).toBeLessThan(60);
  });

  it('is deterministic for the same seed and commands', () => {
    const a = play(99, 3, 'intermediate', 0.6);
    const b = play(99, 3, 'intermediate', 0.6);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it('views hide the answer of open questions', () => {
    let s = createGame(ix, { seed: 5, rivalItems: true, mode: 'hotseat', players: [{ name: 'A', explorer: 'polo', level: 'beginner', timer: 'normal' }] });
    s = applyCommand(ix, s, { type: 'plan', player: 0, plan: { tier: 'scout' } }).state;
    const q = viewFor(s, 0).players[0].turn.question!;
    expect(q.correct).toBeUndefined();
    expect(q.target).toBeUndefined();
    expect(s.players[0].turn.question!.answerLabel).toBeDefined();
  });

  it('rejects Scout on a hazard and a missing fork choice', () => {
    let s = createGame(ix, { seed: 5, rivalItems: true, mode: 'hotseat', players: [{ name: 'A', explorer: 'magellan', level: 'beginner', timer: 'normal' }] });
    expect(() => applyCommand(ix, s, { type: 'plan', player: 0, plan: { tier: 'scout' } })).toThrow(/branch/);
    s = applyCommand(ix, s, { type: 'plan', player: 0, plan: { tier: 'scout', fork: 'coast' } }).state;
    expect(s.players[0].forks.atlantic).toBe('coast');
  });
});
