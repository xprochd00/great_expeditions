// Question generation, selection and answer checking.
import type { ContentIndex, HandQuestion } from './content';
import { levelIndex } from './content';
import { bboxDist, distToRings, pointInRings } from './hittest';
import type { Rng } from './rng';
import { FAMILIARITY_BASE, FAMILIARITY_LEVEL, LANDMARK_TIME, RIDDLE_TIME, TIER_RULES } from './rules';
import type {
  Answer, AnswerResult, Category, ChoiceOption, GuideCategory, Level, Msg, PlayerState, Question,
  QuestionInput, Tier, Viewport,
} from './types';

const place = (id: string): Msg => ({ key: 'answer.place', params: { p: { place: id } } });
const maxLevel = (...ls: Level[]): Level => ls.reduce((a, b) => (levelIndex(b) > levelIndex(a) ? b : a));
const clampRating = (r: number) => Math.max(1, Math.min(12, r));

interface Candidate {
  ref: string;
  subject: string;
  region: string;
  rating: number;
  minLevel: Level;
  category: Category;
  guide: GuideCategory[];
  input: QuestionInput;
  hand?: string;
  build(rng: Rng, uid: string): Question | null;
}

export interface PickContext {
  ix: ContentIndex;
  rng: Rng;
  player: PlayerState;
  level: Level;
  band: [number, number];
  tier: Tier;
  guide?: GuideCategory;
  regions: { id: string; weight: number }[];
  uid: string;
  preferMap?: boolean;
}

// ------------------------------------------------------------------ candidates

function countryBase(ix: ContentIndex, id: string) {
  const r = ix.rating.get(id)!;
  return { base: FAMILIARITY_BASE[r.f], gate: FAMILIARITY_LEVEL[r.f], r };
}

function sample<T>(rng: Rng, items: T[], n: number): T[] {
  return rng.shuffle(items).slice(0, n);
}

function choiceQuestion(
  uid: string, c: Omit<Candidate, 'build'>, viewport: Viewport, prompt: Msg, correctIn: ChoiceOption | Msg, wrongIn: (ChoiceOption | Msg)[],
  rng: Rng, extra: Partial<Question> = {},
): Question | null {
  const norm = (o: ChoiceOption | Msg): ChoiceOption => ('label' in o ? o : { label: o });
  const correct = norm(correctIn);
  const wrong = wrongIn.map(norm);
  if (wrong.length < 3) return null;
  const options = rng.shuffle([correct, ...wrong.slice(0, 3)]);
  return {
    uid, ref: c.ref, category: c.category, rating: c.rating, subject: c.subject, region: c.region, input: 'choice',
    prompt, options, correct: options.indexOf(correct), viewport, timeLimit: 0, ...extra,
  };
}

function capitalFact(ix: ContentIndex, id: string): Msg | undefined {
  const r = ix.rating.get(id);
  if (!ix.country.get(id)?.hasCapital || r?.noCapital) return undefined;
  return { key: 'fact.capital', params: { capital: { place: `capital.${id}` }, country: { place: `country.${id}` } } };
}

function countryCandidates(ix: ContentIndex, region: string): Candidate[] {
  const vp = ix.regionViewport.get(region)!;
  const ids = ix.regionCountries.get(region) ?? [];
  const withCapital = ids.filter((id) => ix.country.get(id)!.hasCapital && !ix.rating.get(id)!.noCapital);
  const out: Candidate[] = [];
  for (const id of ids) {
    const info = ix.country.get(id)!;
    const { base, gate, r } = countryBase(ix, id);
    const subject = `country.${id}`;
    const common = { subject, region };
    const fact = capitalFact(ix, id);
    const ans = place(subject);
    const others = ids.filter((o) => o !== id);

    out.push({
      ...common, ref: 'gen:locate_country', rating: clampRating(base), minLevel: gate, category: 'map', guide: ['map'], input: 'map',
      build: (_rng, uid) => ({
        uid, ref: 'gen:locate_country', category: 'map', rating: clampRating(base), subject, region, input: 'map',
        prompt: { key: 'gen.locateCountry', params: { country: { place: subject } } }, target: subject, answerLabel: ans,
        viewport: vp, timeLimit: 0, fact, chart: subject,
      }),
    });

    if (withCapital.includes(id)) {
      const capRating = clampRating(base + 1 + (r.cap ?? 0));
      const capGate = maxLevel(gate, (r.cap ?? 0) >= 2 ? 'intermediate' : 'beginner');
      const capC = { ...common, ref: 'gen:country_to_capital', rating: capRating, minLevel: capGate, category: 'capital' as Category, guide: ['capital'] as GuideCategory[], input: 'choice' as QuestionInput };
      out.push({
        ...capC,
        build: (rng, uid) => choiceQuestion(uid, capC, vp,
          { key: 'gen.countryToCapital', params: { country: { place: subject } } },
          place(`capital.${id}`), sample(rng, withCapital.filter((o) => o !== id), 3).map((o) => place(`capital.${o}`)), rng,
          { answerLabel: place(`capital.${id}`), fact, chart: subject }),
      });
      const c2 = { ...capC, ref: 'gen:capital_to_country' };
      out.push({
        ...c2,
        build: (rng, uid) => choiceQuestion(uid, c2, vp,
          { key: 'gen.capitalToCountry', params: { capital: { place: `capital.${id}` } } },
          ans, sample(rng, others, 3).map((o) => place(`country.${o}`)), rng, { answerLabel: ans, fact, chart: subject }),
      });
      const c3 = { ...common, ref: 'gen:capital_to_locate', rating: clampRating(base + 2 + (r.cap ?? 0)), minLevel: maxLevel(capGate, 'intermediate'), category: 'combined' as Category, guide: ['capital', 'map'] as GuideCategory[], input: 'map' as QuestionInput };
      out.push({
        ...c3,
        build: (_rng, uid) => ({
          uid, ref: c3.ref, category: 'combined', rating: c3.rating, subject, region, input: 'map',
          prompt: { key: 'gen.capitalToLocate', params: { capital: { place: `capital.${id}` } } },
          target: subject, answerLabel: ans, viewport: vp, timeLimit: 0, fact, chart: subject,
        }),
      });
    }

    const flagAdj = r.flag ?? 0;
    const flagC = { ...common, ref: 'gen:flag_to_country', rating: clampRating(base + 1 + flagAdj), minLevel: gate, category: 'flag' as Category, guide: ['flag'] as GuideCategory[], input: 'choice' as QuestionInput };
    const similar = (ix.flagGroup.get(id) ?? []).filter((o) => o !== id && ix.country.has(o));
    out.push({
      ...flagC,
      build: (rng, uid) => {
        const pool = [...rng.shuffle(similar), ...rng.shuffle(others.filter((o) => !similar.includes(o)))];
        return choiceQuestion(uid, flagC, vp, { key: 'gen.flagToCountry' }, ans, pool.slice(0, 3).map((o) => place(`country.${o}`)), rng,
          { flag: info.cca2, answerLabel: ans, fact, chart: subject });
      },
    });
    const flagLoc = { ...common, ref: 'gen:flag_to_locate', rating: clampRating(base + 2 + flagAdj), minLevel: maxLevel(gate, 'intermediate'), category: 'combined' as Category, guide: ['flag', 'map'] as GuideCategory[], input: 'map' as QuestionInput };
    out.push({
      ...flagLoc,
      build: (_rng, uid) => ({
        uid, ref: flagLoc.ref, category: 'combined', rating: flagLoc.rating, subject, region, input: 'map',
        prompt: { key: 'gen.flagToLocate' }, flag: info.cca2, target: subject, answerLabel: ans, viewport: vp, timeLimit: 0, fact, chart: subject,
      }),
    });
    const toFlag = { ...common, ref: 'gen:country_to_flag', rating: clampRating(base + 2 + flagAdj), minLevel: maxLevel(gate, 'intermediate'), category: 'flag' as Category, guide: ['flag'] as GuideCategory[], input: 'choice' as QuestionInput };
    out.push({
      ...toFlag,
      build: (rng, uid) => {
        const pool = [...rng.shuffle(similar), ...rng.shuffle(others.filter((o) => !similar.includes(o)))];
        const opt = (o: string): ChoiceOption => ({ label: place(`country.${o}`), flag: ix.country.get(o)!.cca2 });
        return choiceQuestion(uid, toFlag, vp, { key: 'gen.countryToFlag', params: { country: { place: subject } } },
          opt(id), pool.slice(0, 3).map(opt), rng, { answerLabel: ans, fact, chart: subject });
      },
    });

    const neighbours = info.borders.filter((b) => ids.includes(b));
    const strangers = others.filter((o) => !info.borders.includes(o));
    if (neighbours.length && strangers.length >= 3) {
      const worst = Math.max(...neighbours.map((n) => ix.rating.get(n)!.f), r.f);
      const bc = { ...common, ref: 'gen:borders', rating: clampRating(FAMILIARITY_BASE[worst] + 2), minLevel: FAMILIARITY_LEVEL[worst], category: 'knowledge' as Category, guide: ['knowledge'] as GuideCategory[], input: 'choice' as QuestionInput };
      out.push({
        ...bc,
        build: (rng, uid) => {
          const n = rng.pick(neighbours);
          return choiceQuestion(uid, bc, vp, { key: 'gen.borders', params: { country: { place: subject } } },
            place(`country.${n}`), sample(rng, strangers, 3).map((o) => place(`country.${o}`)), rng,
            { answerLabel: place(`country.${n}`), fact: { key: 'fact.borders', params: { a: { place: subject }, b: { place: `country.${n}` } } } });
        },
      });
    }
    if (info.landlocked) {
      const coastal = others.filter((o) => !ix.country.get(o)!.landlocked);
      if (coastal.length >= 3) {
        const lc = { ...common, ref: 'gen:landlocked', rating: clampRating(base + 2), minLevel: gate, category: 'knowledge' as Category, guide: ['knowledge'] as GuideCategory[], input: 'choice' as QuestionInput };
        out.push({
          ...lc,
          build: (rng, uid) => choiceQuestion(uid, lc, vp, { key: 'gen.landlocked' }, ans,
            sample(rng, coastal, 3).map((o) => place(`country.${o}`)), rng,
            { answerLabel: ans, fact: { key: 'fact.landlocked', params: { country: { place: subject } } }, chart: subject }),
        });
      }
    }
  }
  return out;
}

function featureCandidates(ix: ContentIndex, region: string): Candidate[] {
  const vp = ix.regionViewport.get(region)!;
  return (ix.regionFeatures.get(region) ?? []).map((fid) => {
    const f = ix.feature.get(fid)!;
    return {
      ref: 'gen:locate_feature', subject: fid, region, rating: f.rating, minLevel: f.minLevel, category: 'map', guide: ['map'], input: 'map',
      build: (_rng, uid) => ({
        uid, ref: 'gen:locate_feature', category: 'map', rating: f.rating, subject: fid, region, input: 'map',
        prompt: { key: 'gen.locateFeature', params: { feature: { place: fid } } }, target: fid, answerLabel: place(fid),
        viewport: vp, timeLimit: 0, chart: fid,
      }),
    } satisfies Candidate;
  });
}

const GUIDE_OF: Record<Category, GuideCategory[]> = {
  map: ['map'], capital: ['capital'], flag: ['flag'], knowledge: ['knowledge'], combined: ['map'],
  riddle: ['map'], history: ['knowledge'], histgeo: ['knowledge'],
};

/** Builds a Question from a hand-written record. */
export function buildHand(q: HandQuestion, region: string, vp: Viewport, rng: Rng, uid: string): Question {
  const base = { uid, ref: q.id, category: q.category, rating: q.rating, subject: q.id, region, viewport: vp, timeLimit: 0 };
  const fact = q.fact ? { key: `q.${q.id}.fact` } : undefined;
  if (q.kind === 'riddle') {
    return {
      ...base, input: 'map', prompt: { key: 'riddle.prompt' }, target: q.answer!, answerLabel: place(q.answer!),
      clues: [1, 2, 3].map((n) => ({ key: `q.${q.id}.c${n}` })), chart: q.answer, fact,
    };
  }
  const labels: ChoiceOption[] = q.places
    ? q.places.map((p) => ({ label: place(p) }))
    : Array.from({ length: q.options ?? 4 }, (_, i) => ({ label: { key: `q.${q.id}.o${i + 1}` } }));
  const correct = labels[0];
  const options = rng.shuffle(labels);
  const chartable = q.places?.[0];
  return {
    ...base, input: 'choice', prompt: { key: `q.${q.id}.prompt` }, options, correct: options.indexOf(correct),
    answerLabel: correct.label, fact,
    chart: chartable && !chartable.startsWith('capital.') ? chartable : undefined,
  };
}

function handCandidates(ix: ContentIndex, region: string): Candidate[] {
  const vp = ix.regionViewport.get(region)!;
  return (ix.handByRegion.get(region) ?? [])
    .filter((q) => q.kind === 'mc')
    .map((q) => ({
      ref: q.id, subject: q.id, region, rating: q.rating, minLevel: q.minLevel, category: q.category,
      guide: GUIDE_OF[q.category], input: 'choice' as QuestionInput, hand: q.id,
      build: (rng: Rng, uid: string) => buildHand(q, region, vp, rng, uid),
    }));
}

export function allCandidates(ix: ContentIndex, region: string): Candidate[] {
  return [...countryCandidates(ix, region), ...featureCandidates(ix, region), ...handCandidates(ix, region)];
}

// ------------------------------------------------------------------ selection

function usable(c: Candidate, ctx: PickContext): boolean {
  const p = ctx.player;
  if (levelIndex(c.minLevel) > levelIndex(ctx.level)) return false;
  if ((p.subjectsUsed[c.subject] ?? 0) >= 2) return false;
  if (p.recent.includes(c.subject)) return false;
  if (c.hand && p.usedQuestions.includes(c.hand)) return false;
  if (ctx.guide && !c.guide.includes(ctx.guide)) return false;
  return true;
}

function weightOf(c: Candidate, ctx: PickContext): number {
  const map = c.input === 'map';
  let w = ctx.tier === 'scout' ? (map ? 1 : 3) : ctx.tier === 'navigator' ? 2 : map ? 3 : 1;
  if (ctx.preferMap) w = map ? 6 : 1;
  if (c.hand) w *= 1.6;
  return w;
}

function chooseFrom(cands: Candidate[], ctx: PickContext): Question | null {
  const [lo, hi] = ctx.band;
  for (const widen of [0, 1, 2, 3]) {
    let pool = cands.filter((c) => c.rating >= lo - widen && c.rating <= hi + widen);
    while (pool.length) {
      const c = ctx.rng.weighted(pool, (x) => weightOf(x, ctx));
      const q = c.build(ctx.rng, ctx.uid);
      if (q) return q;
      pool = pool.filter((x) => x !== c);
    }
  }
  // nothing near the band: take the closest rating
  const sorted = [...cands].sort((a, b) => Math.abs(a.rating - lo) - Math.abs(b.rating - lo));
  for (const c of sorted) {
    const q = c.build(ctx.rng, ctx.uid);
    if (q) return q;
  }
  return null;
}

export function pickQuestion(ctx: PickContext): Question {
  const first = ctx.rng.weighted(ctx.regions, (r) => r.weight).id;
  const order = [first, ...ctx.regions.map((r) => r.id).filter((r) => r !== first)];
  for (const region of order) {
    const cands = allCandidates(ctx.ix, region).filter((c) => usable(c, ctx));
    const q = chooseFrom(cands, ctx);
    if (q) return q;
  }
  // last resort: ignore repeat limits
  for (const region of order) {
    const cands = allCandidates(ctx.ix, region).filter((c) => levelIndex(c.minLevel) <= levelIndex(ctx.level));
    const q = chooseFrom(cands, { ...ctx, guide: undefined });
    if (q) return q;
  }
  throw new Error('no question available');
}

/** A question about a subject the player got wrong earlier, in a different format. */
export function pickRevisit(ctx: PickContext, subject: string, avoidRef: string): Question | null {
  for (const r of ctx.regions) {
    const cands = allCandidates(ctx.ix, r.id).filter(
      (c) => c.subject === subject && c.ref !== avoidRef && levelIndex(c.minLevel) <= levelIndex(ctx.level),
    );
    if (cands.length) {
      const q = ctx.rng.pick(cands).build(ctx.rng, ctx.uid);
      if (q) return { ...q, revisit: true };
    }
  }
  return null;
}

/** Expedition Riddle for a Discovery node: hand-written if possible, otherwise generated from data. */
export function pickRiddle(ctx: PickContext): Question {
  for (const r of ctx.regions) {
    const vp = ctx.ix.regionViewport.get(r.id)!;
    const hand = (ctx.ix.handByRegion.get(r.id) ?? []).filter(
      (q) => q.kind === 'riddle' && levelIndex(q.minLevel) <= levelIndex(ctx.level) && !ctx.player.usedQuestions.includes(q.id),
    );
    if (hand.length) {
      const near = [...hand].sort((a, b) => Math.abs(a.rating - ctx.band[0]) - Math.abs(b.rating - ctx.band[0]));
      const q = buildHand(near[0], r.id, vp, ctx.rng, ctx.uid);
      return { ...q, timeLimit: RIDDLE_TIME };
    }
  }
  return generatedRiddle(ctx, ctx.regions[0].id);
}

export function generatedRiddle(ctx: PickContext, region: string): Question {
  const ix = ctx.ix;
  const vp = ix.regionViewport.get(region)!;
  const ids = (ix.regionCountries.get(region) ?? []).filter((id) => {
    const c = ix.country.get(id)!;
    const r = ix.rating.get(id)!;
    return c.hasCapital && !r.noCapital && c.borders.length > 0 && levelIndex(FAMILIARITY_LEVEL[r.f]) <= levelIndex(ctx.level)
      && (ctx.player.subjectsUsed[`country.${id}`] ?? 0) < 2;
  });
  const pool = ids.length ? ids : ix.regionCountries.get(region)!.filter((id) => ix.country.get(id)!.hasCapital && ix.country.get(id)!.borders.length);
  const sorted = [...pool].sort((a, b) => Math.abs(FAMILIARITY_BASE[ix.rating.get(a)!.f] + 2 - ctx.band[0]) - Math.abs(FAMILIARITY_BASE[ix.rating.get(b)!.f] + 2 - ctx.band[0]));
  const id = ctx.rng.pick(sorted.slice(0, 4));
  const c = ix.country.get(id)!;
  const subject = `country.${id}`;
  const n = ctx.rng.pick(c.borders.filter((b) => ix.country.has(b)));
  return {
    uid: ctx.uid, ref: 'gen:riddle', category: 'riddle', rating: FAMILIARITY_BASE[ix.rating.get(id)!.f] + 2, subject, region,
    input: 'map', prompt: { key: 'riddle.prompt' }, target: subject, answerLabel: place(subject), viewport: vp, timeLimit: RIDDLE_TIME,
    clues: [
      { key: c.landlocked ? 'gen.riddle.c1.landlocked' : 'gen.riddle.c1.coastal', params: { count: c.borders.length } },
      { key: 'gen.riddle.c2', params: { neighbour: { place: `country.${n}` } } },
      { key: 'gen.riddle.c3', params: { capital: { place: `capital.${id}` } } },
    ],
    chart: subject,
  };
}

/** Landmark / checkpoint bonus question for a node: basic for Beginner/Intermediate, advanced otherwise. */
export function pickLandmark(ix: ContentIndex, key: string, region: string, level: Level, rng: Rng, uid: string): Question | null {
  const list = ix.landmark.get(key) ?? [];
  if (!list.length) return null;
  const depth = levelIndex(level) >= 2 ? 'advanced' : 'basic';
  const q = list.find((x) => x.depth === depth) ?? list[0];
  return { ...buildHand(q, region, ix.regionViewport.get(region)!, rng, uid), timeLimit: LANDMARK_TIME };
}

export function pickFinal(ctx: PickContext, explorer: string): Question {
  const list = ctx.ix.finals.get(explorer as never) ?? [];
  const depth = levelIndex(ctx.level) >= 2 ? 'advanced' : 'basic';
  const q = list.find((x) => x.depth === depth) ?? list[0];
  if (q) {
    const region = q.regions[0] ?? ctx.regions[0].id;
    return { ...buildHand(q, region, ctx.ix.regionViewport.get(region)!, ctx.rng, ctx.uid), timeLimit: RIDDLE_TIME };
  }
  return generatedRiddle(ctx, ctx.regions[0].id);
}

export function baseTime(tier: Tier): number {
  return TIER_RULES[tier].time;
}

// ------------------------------------------------------------------ answer checking

function shapeOf(ix: ContentIndex, id: string) {
  if (id.startsWith('country.')) {
    const s = ix.countryShape.get(id.slice(8));
    return s ? { rings: s.rings, bbox: s.bbox, closed: true } : null;
  }
  const f = ix.featureShape.get(id);
  return f ? { rings: f.rings, bbox: f.bbox, closed: f.kind === 'area' } : null;
}

export function countryAt(ix: ContentIndex, x: number, y: number, tol: number): string | undefined {
  for (const c of ix.map.countries) {
    if (bboxDist(c.bbox, x, y) > 0) continue;
    if (pointInRings(c.rings, x, y)) return `country.${c.id}`;
  }
  let best: string | undefined;
  let bestD = tol;
  for (const c of ix.map.countries) {
    if (bboxDist(c.bbox, x, y) > bestD) continue;
    const d = distToRings(c.rings, x, y, true);
    if (d < bestD) { bestD = d; best = `country.${c.id}`; }
  }
  return best;
}

export function checkAnswer(ix: ContentIndex, q: Question, answer: Answer): AnswerResult {
  if (answer.type === 'timeout') return { outcome: 'wrong' };
  if (q.input === 'choice') {
    if (answer.type !== 'choice') return { outcome: 'wrong' };
    return { outcome: answer.index === q.correct ? 'correct' : 'wrong' };
  }
  if (answer.type !== 'map') return { outcome: 'wrong' };
  const { x, y } = answer;
  const vw = q.viewport[2] - q.viewport[0];
  const tol = Math.max(1.2, vw * 0.009);
  const target = q.target!;
  const shape = shapeOf(ix, target)!;
  const clicked = countryAt(ix, x, y, tol);
  const res = (outcome: AnswerResult['outcome']): AnswerResult => ({ outcome, clicked, click: [x, y] });
  const inside = shape.closed && pointInRings(shape.rings, x, y);
  const dist = inside ? 0 : distToRings(shape.rings, x, y, shape.closed);
  const lineTol = shape.closed ? tol : tol * 1.6;
  if (inside || dist <= lineTol) return res('correct');
  if (target.startsWith('country.')) {
    const info = ix.country.get(target.slice(8));
    if (clicked && info?.borders.includes(clicked.slice(8))) return res('near');
    if (dist <= tol * 4) return res('near');
  } else if (dist <= lineTol * 4) {
    return res('near');
  }
  return res('wrong');
}

/** Spyglass hint for map questions: a circle that contains the target but is not centred on it. */
export function hintCircle(ix: ContentIndex, q: Question, rng: Rng): { x: number; y: number; r: number } {
  const s = shapeOf(ix, q.target!)!;
  const [x0, y0, x1, y1] = s.bbox;
  const vw = q.viewport[2] - q.viewport[0];
  const r = Math.max(Math.hypot(x1 - x0, y1 - y0) / 2 + vw * 0.04, vw * 0.12);
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const a = rng.next() * Math.PI * 2;
  const off = (r - Math.hypot(x1 - x0, y1 - y0) / 2) * 0.6 * rng.next();
  return { x: cx + Math.cos(a) * off, y: cy + Math.sin(a) * off, r };
}
