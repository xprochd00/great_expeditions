import { useEffect, useState } from 'react';
import {
  ABILITY, CROSSROADS_ANSWER_TIME, DEPOT_MAX, RIDDLE_STEPS, TIER_RULES, TIMER_FACTOR, currentAct, forkDef, nodeAt, pendingFork,
  type Command, type ContentIndex, type GameState, type GuideCategory, type ItemId, type PlanChoice, type PlayerState,
  type Question, type RewardId, type Tier,
} from '../engine';
import { useI18n } from '../i18n/react';
import { Flag, TimerBar, useCountdown } from './common';
import { ITEM_ICON } from './theme';

type Send = (cmd: Command) => void;

// ------------------------------------------------------------------ shared pieces

export function Prompt({ q, cluesShown, answered }: { q: Question; cluesShown?: number; answered?: boolean }) {
  const { msg, t } = useI18n();
  return (
    <div className="prompt">
      {q.flag && <Flag code={q.flag} className="prompt-flag" />}
      <div>
        <p className="prompt-text">{msg(q.prompt)}</p>
        {q.clues && (
          <ol className="clues">
            {q.clues.slice(0, cluesShown ?? 3).map((c, i) => <li key={i}>{msg(c)}</li>)}
          </ol>
        )}
        {q.input === 'map' && !answered && <p className="map-hint">{t('question.clickMap')}</p>}
      </div>
    </div>
  );
}

export function Options({ q, onPick, removed, disabled, reveal, picked }: {
  q: Question; onPick?: (i: number) => void; removed?: number[]; disabled?: boolean; reveal?: boolean; picked?: number;
}) {
  const { msg } = useI18n();
  useEffect(() => {
    if (disabled || !onPick) return;
    const k = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      const i = Number(e.key) - 1;
      if (i >= 0 && i < (q.options?.length ?? 0) && !removed?.includes(i)) onPick(i);
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [q.uid, disabled, onPick, removed, q.options?.length]);
  if (!q.options) return null;
  return (
    <div className={`options${q.options.some((o) => o.flag) ? ' flags' : ''}`}>
      {q.options.map((o, i) => {
        const cls = ['option'];
        if (reveal && i === q.correct) cls.push('correct');
        if (reveal && i === picked && i !== q.correct) cls.push('wrong');
        return (
          <button key={i} className={cls.join(' ')} disabled={disabled || removed?.includes(i)} onClick={() => onPick?.(i)}>
            <kbd>{i + 1}</kbd>
            {o.flag ? <Flag code={o.flag} /> : <span>{msg(o.label)}</span>}
          </button>
        );
      })}
    </div>
  );
}

function ResultLine({ outcome, timeout }: { outcome?: string; timeout?: boolean }) {
  const { t } = useI18n();
  if (!outcome) return null;
  const key = timeout ? 'result.timeout' : `result.${outcome}`;
  return <p className={`result result-${outcome}`}>{t(key)}</p>;
}

function Who({ p, children }: { p: PlayerState; children?: React.ReactNode }) {
  const { t } = useI18n();
  return (
    <div className={`who ink-${p.explorer}`}>
      <span className="who-name">{p.name}</span>
      <span className="who-explorer">{t(`explorer.${p.explorer}.name`)}</span>
      {children}
    </div>
  );
}

function Location({ ix, p }: { ix: ContentIndex; p: PlayerState }) {
  const { t, date } = useI18n();
  const n = nodeAt(ix, p, p.position);
  return (
    <div className="location">
      <strong>{t(`node.${p.explorer}.${n.id}.name`)}</strong>
      {n.date && <span className="date">{date(n.date, n.approx)}</span>}
      <span className="region-tag">{t(`region.${n.region}`)} · {t('act.label', { act: n.act })}</span>
      <p className="note">{t(`node.${p.explorer}.${n.id}.note`)}</p>
    </div>
  );
}

// ------------------------------------------------------------------ plan

export function PlanPanel({ ix, view, p, send }: { ix: ContentIndex; view: GameState; p: PlayerState; send: Send }) {
  const { t } = useI18n();
  const act = currentAct(ix, p);
  const route = ix.route.get(p.explorer)!;
  const forkId = pendingFork(ix, p);
  const fork = forkId ? forkDef(route, forkId) : undefined;
  const node = nodeAt(ix, p, p.position);
  const canCamp = node.type === 'checkpoint' && !p.unlocked.includes(node.id) && !p.forced;
  const ability = ABILITY[p.explorer];
  const others = view.players.filter((o) => o.id !== p.id);

  const [branch, setBranch] = useState<string | undefined>();
  const [provisions, setProvisions] = useState(false);
  const [medicine, setMedicine] = useState(false);
  const [guide, setGuide] = useState<GuideCategory | ''>('');
  const [rumour, setRumour] = useState<number | ''>('');
  const [porters, setPorters] = useState<number | ''>('');
  const [tradeWinds, setTradeWinds] = useState(false);
  const [depotSpend, setDepotSpend] = useState(0);
  const [levelChange, setLevelChange] = useState<-1 | 0 | 1>(0);
  useEffect(() => {
    setBranch(undefined); setProvisions(false); setMedicine(false); setGuide(''); setRumour(''); setPorters('');
    setTradeWinds(false); setDepotSpend(0); setLevelChange(0);
  }, [p.id, view.round]);

  const has = (i: ItemId) => p.items.includes(i);
  const go = (tier: PlanChoice['tier']) => {
    send({
      type: 'plan', player: p.id,
      plan: {
        tier, fork: branch,
        provisions: provisions || undefined, medicine: medicine || undefined, guide: guide || undefined,
        rumourTarget: rumour === '' ? undefined : rumour, portersTarget: porters === '' ? undefined : porters,
        tradeWinds: tradeWinds || undefined, depotSpend: depotSpend || undefined, levelChange: levelChange || undefined,
      },
    });
  };
  const needBranch = !!fork && !branch;

  return (
    <div className="panel plan">
      <Who p={p}><span className="level-badge">{t(`level.${p.level}`)}</span></Who>
      <Location ix={ix} p={p} />

      {p.levelOffer && (
        <div className="callout">
          <strong>{t('plan.newAct', { act })}</strong>{' '}
          {p.levelOffer.suggest && t(`plan.suggest.${p.levelOffer.suggest}`)}
          <div className="seg">
            {([-1, 0, 1] as const).map((d) => (
              <button key={d} className={levelChange === d ? 'on' : ''} onClick={() => setLevelChange(d)}
                disabled={(d === -1 && p.level === 'beginner') || (d === 1 && p.level === 'expert')}>
                {t(`plan.level.${d}`)}
              </button>
            ))}
          </div>
        </div>
      )}

      {fork && (
        <div className="fork">
          <h3>{t(`fork.${p.explorer}.${fork.fork}.question`)}</h3>
          <div className="branches">
            {fork.branches.map((b) => (
              <button key={b.id} className={`branch${branch === b.id ? ' on' : ''}`} onClick={() => setBranch(b.id)}>
                <span className={`kind kind-${b.kind}`}>{t(`branch.${b.kind}`)}</span>
                <strong>{t(`fork.${p.explorer}.${fork.fork}.${b.id}.name`)}</strong>
                <span>{t(`fork.${p.explorer}.${fork.fork}.${b.id}.desc`)}</span>
                <span className="steps">{t('branch.steps', { n: b.nodes.length })}</span>
                {b.historical && <span className="seal" title={t('branch.historicalHint')}>{t('branch.historical')}</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {p.forced ? (
        <div className="forced">
          <h3>{t(`forced.${p.forced}.title`)}</h3>
          <p>{t(`forced.${p.forced}.desc`)}</p>
          <button className="primary" disabled={needBranch} onClick={() => go('riddle')}>{t('forced.open')}</button>
        </div>
      ) : (
        <>
          {p.hazardNext && <p className="callout hazard">{t('plan.hazard')}</p>}
          <div className="tiers" role="group" aria-label={t('plan.chooseTier')}>
            {(['scout', 'navigator', 'pathfinder'] as Tier[]).map((tier) => {
              const r = TIER_RULES[tier];
              return (
                <button key={tier} className={`seal-btn tier-${tier}`} disabled={needBranch || (p.hazardNext && tier === 'scout')} onClick={() => go(tier)}>
                  <span className="seal-name">{t(`tier.${tier}`)}</span>
                  <span className="seal-steps">{t('tier.steps', { n: r.steps * (tradeWinds ? 2 : 1) })}</span>
                  <span className="seal-risk">{t('tier.risk', { n: r.penalty + (tradeWinds ? 1 : 0) })}</span>
                </button>
              );
            })}
            {canCamp && (
              <button className="seal-btn camp" disabled={needBranch} onClick={() => go('camp')}>
                <span className="seal-name">{t('tier.camp')}</span>
                <span className="seal-steps">{t('tier.campDesc')}</span>
              </button>
            )}
          </div>
          {needBranch && <p className="muted">{t('plan.chooseBranchFirst')}</p>}
        </>
      )}

      <div className="extras">
        {ability === 'tradeWinds' && (
          <label className={`toggle${p.abilityAct === act ? ' used' : ''}`} title={t('ability.magellan.desc')}>
            <input type="checkbox" checked={tradeWinds} disabled={p.abilityAct === act || !!p.forced} onChange={(e) => setTradeWinds(e.target.checked)} />
            {t('ability.magellan.name')} {p.abilityAct === act && `(${t('ability.used')})`}
          </label>
        )}
        {ability === 'depot' && p.depot > 0 && (
          <label className="toggle" title={t('ability.amundsen.desc')}>
            {t('plan.depotSpend', { n: p.depot })}
            <input type="number" min={0} max={p.depot} value={depotSpend} onChange={(e) => setDepotSpend(Math.max(0, Math.min(p.depot, Number(e.target.value))))} />
          </label>
        )}
        {has('provisions') && (
          <label className="toggle"><input type="checkbox" checked={provisions} onChange={(e) => setProvisions(e.target.checked)} />{ITEM_ICON.provisions} {t('item.provisions.use')}</label>
        )}
        {has('medicine') && (
          <label className="toggle"><input type="checkbox" checked={medicine} onChange={(e) => setMedicine(e.target.checked)} />{ITEM_ICON.medicine} {t('item.medicine.use')}</label>
        )}
        {has('guide') && !p.forced && (
          <label className="toggle">{ITEM_ICON.guide} {t('item.guide.use')}
            <select value={guide} onChange={(e) => setGuide(e.target.value as GuideCategory | '')}>
              <option value="">—</option>
              {(['map', 'capital', 'flag', 'knowledge'] as GuideCategory[]).map((g) => <option key={g} value={g}>{t(`guide.${g}`)}</option>)}
            </select>
          </label>
        )}
        {has('rumour') && others.length > 0 && (
          <label className="toggle">{ITEM_ICON.rumour} {t('item.rumour.use')}
            <select value={rumour} onChange={(e) => setRumour(e.target.value === '' ? '' : Number(e.target.value))}>
              <option value="">—</option>
              {others.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </label>
        )}
        {has('porters') && others.length > 0 && (
          <label className="toggle">{ITEM_ICON.porters} {t('item.porters.use')}
            <select value={porters} onChange={(e) => setPorters(e.target.value === '' ? '' : Number(e.target.value))}>
              <option value="">—</option>
              {others.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </label>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ question

export function QuestionPanel({ ix, p, send }: { ix: ContentIndex; p: PlayerState; send: Send }) {
  const { t } = useI18n();
  const turn = p.turn;
  const q = turn.question!;
  const total = Math.round(q.timeLimit * TIMER_FACTOR[p.timer]);
  const left = useCountdown(total, q.uid, () => send({ type: 'answer', player: p.id, answer: { type: 'timeout' } }));
  const riddle = turn.plan?.tier === 'riddle';
  const tier = turn.plan?.tier;
  return (
    <div className="panel question">
      <Who p={p}>
        <span className="tier-badge">{tier === 'riddle' ? t(`forced.${turn.riddleKind}.title`) : tier === 'camp' ? t('tier.camp') : t(`tier.${tier}`)}</span>
        {q.revisit && <span className="tier-badge revisit">{t('question.revisit')}</span>}
        <span className="region-tag">{t(`region.${q.region}`)}</span>
      </Who>
      <TimerBar left={left} total={total} />
      <Prompt q={q} cluesShown={turn.cluesShown} />
      {q.input === 'choice' && (
        <Options q={q} removed={turn.spyglass?.removed} onPick={(i) => send({ type: 'answer', player: p.id, answer: { type: 'choice', index: i } })} />
      )}
      <div className="actions">
        {riddle && turn.riddleKind === 'discovery' && (
          <span className="muted">{t('riddle.worth', { n: RIDDLE_STEPS[turn.cluesShown - 1] })}</span>
        )}
        {riddle && turn.cluesShown < 3 && (
          <button onClick={() => send({ type: 'revealClue', player: p.id })}>{t('riddle.nextClue')}</button>
        )}
        {p.items.includes('spyglass') && !turn.spyglass && (
          <button onClick={() => send({ type: 'useSpyglass', player: p.id })}>{ITEM_ICON.spyglass} {t('item.spyglass.use')}</button>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ review

export function ReviewPanel({ ix, p, send }: { ix: ContentIndex; p: PlayerState; send: Send }) {
  const { t, msg } = useI18n();
  const turn = p.turn;
  const q = turn.question!;
  const res = turn.result!;
  const tier = turn.plan!.tier;
  const act = currentAct(ix, p);
  const canCompass = res.outcome === 'wrong' && p.items.includes('compass') && !turn.usedCompass && !turn.usedPaiza && tier !== 'riddle' && tier !== 'camp';
  const canPaiza = ABILITY[p.explorer] === 'paiza' && res.outcome !== 'correct' && p.abilityAct !== act && !turn.usedPaiza && tier !== 'camp' && turn.riddleKind !== 'final';
  const canDepot = ABILITY[p.explorer] === 'depot' && turn.earned >= 1 && (p.depot < DEPOT_MAX || turn.storeDepot);
  const timeout = !res.click && q.input === 'map' && res.outcome === 'wrong';
  const picked = res.picked;
  return (
    <div className="panel review">
      <Who p={p} />
      <ResultLine outcome={res.outcome} timeout={timeout && !res.clicked} />
      <Prompt q={q} cluesShown={3} answered />
      {q.input === 'choice' ? <Options q={q} disabled reveal picked={picked} /> : (
        <p className="answer-line">
          {t('review.answer', { answer: msg(q.answerLabel) })}
          {res.clicked && res.outcome !== 'correct' && <> · {t('review.clicked', { place: t(`place.${res.clicked}`) })}</>}
        </p>
      )}
      {q.fact && <p className="fact">📜 {msg(q.fact)}</p>}
      <p className="consequence">
        {p.finished ? t('review.finished') : null}
        {turn.earned > 0 && t('review.earned', { n: turn.earned })}
        {turn.penalty > 0 && t('review.penalty', { n: turn.penalty })}
        {turn.usedPaiza && ` ${t('review.paiza')}`}
        {tier === 'camp' && res.outcome !== 'correct' && t('review.campFailed')}
      </p>
      <div className="actions">
        {canCompass && <button onClick={() => send({ type: 'useCompass', player: p.id })}>{ITEM_ICON.compass} {t('item.compass.use')}</button>}
        {canPaiza && <button onClick={() => send({ type: 'usePaiza', player: p.id })}>{t('ability.polo.name')}</button>}
        {canDepot && (
          <label className="toggle">
            <input type="checkbox" checked={turn.storeDepot} onChange={(e) => send({ type: 'setDepotStore', player: p.id, store: e.target.checked })} />
            {t('review.storeDepot', { n: p.depot })}
          </label>
        )}
        <button className="primary" onClick={() => send({ type: 'endTurn', player: p.id })}>{t('review.endTurn')}</button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ rewards and bonus challenges

export function RewardPanel({ p, send }: { p: PlayerState; send: Send }) {
  const { t } = useI18n();
  const node = p.turn.bonus?.node ?? p.unlocked[p.unlocked.length - 1];
  return (
    <div className="panel reward">
      <Who p={p} />
      <p className="result result-correct">{t('reward.unlocked', { place: t(`node.${p.explorer}.${node}.name`) })}</p>
      <p>{t('reward.choose')}</p>
      <div className="rewards">
        {(['life', 'march', 'supplies', 'shelter'] as RewardId[]).map((r) => (
          <button key={r} className="reward-btn" onClick={() => send({ type: 'chooseReward', player: p.id, reward: r })}>
            <strong>{t(`reward.${r}.name`)}</strong>
            <span>{t(`reward.${r}.desc`)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function BonusPanel({ p, send }: { p: PlayerState; send: Send }) {
  const { t } = useI18n();
  const b = p.turn.bonus!;
  const q = b.question;
  const total = Math.round(q.timeLimit * TIMER_FACTOR[p.timer]);
  const asking = p.turn.stage === 'bonus-question';
  const left = useCountdown(total, q.uid, () => asking && send({ type: 'bonusAnswer', player: p.id, answer: { type: 'timeout' } }), !asking);
  const [picked, setPicked] = useState<number | undefined>();
  useEffect(() => setPicked(undefined), [q.uid]);
  return (
    <div className="panel bonus">
      <Who p={p}><span className="tier-badge">{t(`bonus.${b.kind}`)}</span></Who>
      <p className="bonus-place">{t(`bonus.${b.kind}.intro`, { place: t(`node.${p.explorer}.${b.node}.name`) })}</p>
      {asking && <TimerBar left={left} total={total} />}
      <Prompt q={q} />
      <Options q={q} disabled={!asking} reveal={!asking} picked={b.result?.picked ?? picked}
        onPick={(i) => { setPicked(i); send({ type: 'bonusAnswer', player: p.id, answer: { type: 'choice', index: i } }); }} />
      {!asking && (
        <>
          <ResultLine outcome={b.result?.outcome} />
          <p className="consequence">
            {b.result?.outcome === 'correct'
              ? b.kind === 'landmark' && (b.itemGained ? t('bonus.item', { item: t(`item.${b.itemGained}.name`) }) : t('bonus.packFull'))
              : t(`bonus.${b.kind}.missed`)}
          </p>
          <div className="actions">
            <button className="primary" onClick={() => send({ type: 'bonusContinue', player: p.id })}>{t('common.continue')}</button>
          </div>
        </>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ crossroads

const BUZZ_KEYS = ['q', 'p', 'z', 'm'];

export function CrossroadsPanel({ ix, view, send, now }: { ix: ContentIndex; view: GameState; send: Send; now: number }) {
  const { t, msg } = useI18n();
  const c = view.crossroads!;
  const q = c.question;
  const [opened] = useState(() => Date.now());
  const levels = ['beginner', 'intermediate', 'advanced', 'expert'];
  const minIdx = Math.min(...view.players.map((p) => levels.indexOf(p.level)));
  const openAt = (p: PlayerState) => (levels.indexOf(p.level) - minIdx) * 1500;
  const elapsed = Math.max(0, now - opened, Date.now() - opened);
  const canBuzz = (p: PlayerState) => !c.resolved && c.active === null && !c.lockedOut.includes(p.id) && elapsed >= openAt(p);
  const buzzLeft = useCountdown(c.active === null && !c.resolved ? 20 : 0, `${q.uid}-${c.lockedOut.length}`, () => send({ type: 'crossroadsClose' }));
  const answerLeft = useCountdown(c.active !== null ? CROSSROADS_ANSWER_TIME : 0, `${q.uid}-a-${c.active}`, () => {
    if (c.active !== null) send({ type: 'crossroadsAnswer', player: c.active, answer: { type: 'timeout' } });
  });
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const i = BUZZ_KEYS.indexOf(e.key.toLowerCase());
      const p = view.players[i];
      if (p && canBuzz(p)) send({ type: 'buzz', player: p.id });
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  });
  const active = c.active !== null ? view.players[c.active] : null;
  const winner = c.winner !== null ? view.players[c.winner] : null;
  return (
    <div className="panel crossroads">
      <h3>⚔ {t('crossroads.title')} <span className="region-tag">{t(`region.${c.region}`)}</span></h3>
      <p className="muted">{t('crossroads.rules', { level: t(`level.${c.level}`) })}</p>
      <Prompt q={q} answered={c.resolved} />
      {!c.resolved && (active ? (
        <>
          <p className="callout">{t('crossroads.answering', { name: active.name })}</p>
          <TimerBar left={answerLeft} total={CROSSROADS_ANSWER_TIME} />
          {q.input === 'choice' && <Options q={q} onPick={(i) => send({ type: 'crossroadsAnswer', player: active.id, answer: { type: 'choice', index: i } })} />}
        </>
      ) : (
        <>
          <TimerBar left={buzzLeft} total={20} />
          <div className="buzzers">
            {view.players.map((p, i) => {
              const wait = Math.max(0, openAt(p) - elapsed);
              return (
                <button key={p.id} className={`buzzer ink-${p.explorer}`} disabled={!canBuzz(p)} onClick={() => send({ type: 'buzz', player: p.id })}>
                  <kbd>{BUZZ_KEYS[i].toUpperCase()}</kbd> {p.name}
                  {c.lockedOut.includes(p.id) ? ` · ${t('crossroads.out')}` : wait > 0 ? ` · ${(wait / 1000).toFixed(1)}s` : ''}
                </button>
              );
            })}
          </div>
        </>
      ))}
      {c.result && c.result.outcome !== 'correct' && !c.resolved && (
        <p className="result result-wrong">{t('crossroads.wrong', { name: view.players[c.result.player].name })}</p>
      )}
      {c.resolved && (
        <>
          {winner ? (
            <p className="result result-correct">
              {t('crossroads.won', { name: winner.name })}{' '}
              {c.itemGained ? t('bonus.item', { item: t(`item.${c.itemGained}.name`) }) : ''}
            </p>
          ) : <p className="result result-wrong">{t('crossroads.nobody')}</p>}
          <p className="answer-line">{t('review.answer', { answer: msg(q.answerLabel) })}</p>
          {q.input === 'choice' && <Options q={q} disabled reveal />}
          <div className="actions"><button className="primary" onClick={() => send({ type: 'continue' })}>{t('common.continue')}</button></div>
        </>
      )}
    </div>
  );
}
