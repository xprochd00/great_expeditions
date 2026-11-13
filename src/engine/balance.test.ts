// Balance report (not an assertion suite): run with  npm run balance
import { it } from 'vitest';
import { rawContent } from '../content/load';
import { applyCommand, createGame, indexContent, pendingFork, type Command, type ExplorerId, type GameState, type Tier } from './index';
import { createRng } from './rng';

const ix = indexContent(rawContent);

function decide(s: GameState, rng: ReturnType<typeof createRng>, skill: Record<Tier | 'riddle', number>): Command {
  if (s.phase === 'crossroads') {
    const c = s.crossroads!;
    if (c.resolved) return { type: 'continue' };
    if (c.active === null) {
      const free = s.players.filter((p) => !c.lockedOut.includes(p.id));
      return free.length ? { type: 'buzz', player: rng.pick(free).id } : { type: 'crossroadsClose' };
    }
    const good = rng.next() < 0.6;
    return { type: 'crossroadsAnswer', player: c.active, answer: good ? (c.question.input === 'choice' ? { type: 'choice', index: c.question.correct! } : { type: 'map', ...pt(c.question.target!) }) : { type: 'timeout' } };
  }
  for (const id of s.turnOrder) {
    const p = s.players[id];
    const t = p.turn;
    if (t.stage === 'plan') {
      const fork = pendingFork(ix, p);
      const def = fork ? (ix.route.get(p.explorer)!.sequence.find((x) => typeof x !== 'string' && x.fork === fork) as { branches: { id: string; historical: boolean }[] }) : null;
      const gap = p.position - p.threat;
      const tier: Tier = p.hazardNext ? 'navigator' : gap <= 2 ? 'scout' : rng.next() < 0.6 ? 'navigator' : 'pathfinder';
      return { type: 'plan', player: id, plan: { tier, fork: def ? def.branches.find((b) => b.historical)!.id : undefined, medicine: p.items.includes('medicine') && p.lives < 3 || undefined } };
    }
    if (t.stage === 'question') {
      const q = t.question!;
      const tier = t.plan!.tier === 'camp' ? 'scout' : t.plan!.tier;
      const good = rng.next() < skill[tier as Tier | 'riddle'];
      if (!good) return { type: 'answer', player: id, answer: { type: 'timeout' } };
      return { type: 'answer', player: id, answer: q.input === 'choice' ? { type: 'choice', index: q.correct! } : { type: 'map', ...pt(q.target!) } };
    }
    if (t.stage === 'review') return { type: 'endTurn', player: id };
    if (t.stage === 'reward') return { type: 'chooseReward', player: id, reward: p.lives < 3 ? 'life' : 'shelter' };
    if (t.stage === 'bonus-question') return { type: 'bonusAnswer', player: id, answer: rng.next() < 0.6 ? { type: 'choice', index: t.bonus!.question.correct! } : { type: 'timeout' } };
    if (t.stage === 'bonus-review') return { type: 'bonusContinue', player: id };
  }
  throw new Error('stuck');
}

function pt(target: string) {
  if (target.startsWith('country.')) { const [x, y] = ix.countryShape.get(target.slice(8))!.centroid; return { x, y }; }
  const f = ix.featureShape.get(target)!;
  const [x, y] = f.kind === 'line' ? [f.rings[0][0], f.rings[0][1]] : f.centroid;
  return { x, y };
}

it.skipIf(!process.env.BALANCE)('balance report', { timeout: 120000 }, () => {
  const skill = { scout: 0.9, navigator: 0.7, pathfinder: 0.5, riddle: 0.6 };
  const all: ExplorerId[] = ['polo', 'magellan', 'livingstone', 'amundsen'];
  const wins: Record<string, number> = {}; let rounds = 0; let catches = 0; let n = 0; const gaps: number[] = [];
  for (let seed = 1; seed <= 200; seed++) {
    let s = createGame(ix, { seed, rivalItems: true, mode: 'hotseat', players: all.map((e, i) => ({ name: `P${i}`, explorer: e, level: 'intermediate', timer: 'normal' })) });
    const rng = createRng({ rng: seed * 13 });
    let guard = 0;
    while (s.phase !== 'over' && guard++ < 8000) s = applyCommand(ix, s, decide(s, rng, skill)).state;
    for (const w of s.winners) wins[s.players[w].explorer] = (wins[s.players[w].explorer] ?? 0) + 1 / s.winners.length;
    rounds += s.round; n++;
    catches += s.players.reduce((a, p) => a + p.stats.caught, 0) / 4;
    const prog = s.players.map((p) => p.position);
    gaps.push(Math.max(...prog) - Math.min(...prog));
  }
  process.stdout.write('\nBALANCE ' + JSON.stringify({ avgRounds: rounds / n, catchesPerPlayer: catches / n, winShare: Object.fromEntries(Object.entries(wins).map(([k, v]) => [k, Math.round((v / n) * 100) + '%'])), medianGap: gaps.sort((a, b) => a - b)[n >> 1] }) + '\n');
});
