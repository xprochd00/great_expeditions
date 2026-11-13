import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import {
  ABILITY, currentAct, nodeAt, pathOf, progressOf, type Command, type ContentIndex, type GameEvent, type GameState,
  type PlayerState, type Viewport,
} from '../engine';
import { useI18n } from '../i18n/react';
import type { Session } from '../session/session';
import { BonusPanel, CrossroadsPanel, PlanPanel, QuestionPanel, RewardPanel, ReviewPanel } from './Challenge';
import { Lives } from './common';
import { padViewport } from './geometry';
import { HistoryNotes } from './HistoryNotes';
import { Journal } from './Journal';
import { ITEM_ICON } from './theme';
import { WorldMap, type Reveal } from './WorldMap';

function useView(session: Session): GameState {
  return useSyncExternalStore((cb) => session.subscribe(cb), () => session.getView());
}

const TURN_STAGES = ['plan', 'question', 'review', 'reward'];
const BONUS_STAGES = ['bonus-question', 'bonus-review', 'reward'];

export function activePlayer(view: GameState): number | null {
  const stages = view.phase === 'turns' ? TURN_STAGES : view.phase === 'bonus' ? BONUS_STAGES : [];
  for (const id of view.turnOrder) if (stages.includes(view.players[id].turn.stage)) return id;
  return null;
}

function PlayerCard({ ix, p, active, round, onNotes }: { ix: ContentIndex; p: PlayerState; active: boolean; round: number; onNotes: () => void }) {
  const { t } = useI18n();
  const dist = p.position - p.threat;
  const danger = dist >= 5 ? 'safe' : dist >= 3 ? 'uneasy' : 'danger';
  const act = currentAct(ix, p);
  const ability = ABILITY[p.explorer];
  const abilityState =
    ability === 'depot' ? t('ability.depot', { n: p.depot })
      : ability === 'physician' ? (p.physicianAct === act ? t('ability.used') : t('ability.ready'))
        : p.abilityAct === act ? t('ability.used') : t('ability.ready');
  const progress = Math.round(progressOf(ix, p) * 100);
  const surge = p.explorer === 'amundsen' ? (3 - (round % 3)) % 3 : null;
  return (
    <article className={`player-card ink-${p.explorer}${active ? ' active' : ''}`} aria-current={active}>
      <header>
        <span className="portrait">{t(`explorer.${p.explorer}.name`).charAt(0)}</span>
        <div>
          <strong>{p.name}</strong>
          <span className="sub">{t(`explorer.${p.explorer}.name`)} · {t(`level.${p.level}`)}</span>
        </div>
        <button className="ghost small" onClick={onNotes} title={t('notes.open')}>📜</button>
      </header>
      <div className="row"><Lives n={p.lives} />{p.shield && <span title={t('reward.shelter.name')}>🛡️</span>}</div>
      <div className="progress" title={t('player.progress', { n: progress })}>
        <div style={{ width: `${progress}%` }} />
        <span>{progress}%</span>
      </div>
      <div className={`danger danger-${danger}`}>
        <span>{t(`threat.${p.explorer}.name`)}</span>
        <span>{p.threat < 0 && p.position === 0 ? t('danger.offboard') : t(`danger.${danger}`, { n: dist })}</span>
      </div>
      {surge !== null && <div className="muted small">{surge === 0 ? t('threat.surgeNow') : t('threat.surgeIn', { n: surge })}</div>}
      <div className="row items">
        {p.items.length ? p.items.map((it, i) => <span key={i} className="item" title={t(`item.${it}.name`)}>{ITEM_ICON[it]}</span>) : <span className="muted small">{t('player.noItems')}</span>}
      </div>
      <div className="muted small">{t(`ability.${p.explorer}.name`)}: {abilityState}</div>
    </article>
  );
}

function eventText(t: ReturnType<typeof useI18n>['t'], view: GameState, ix: ContentIndex, e: GameEvent): string | null {
  const name = (id: number) => view.players[id]?.name ?? '?';
  switch (e.type) {
    case 'roundStarted': return t('log.round', { n: e.round });
    case 'moved': return e.to > e.from ? t('log.moved', { name: name(e.player), n: e.to - e.from }) : null;
    case 'threatMoved': return t('log.threat', { name: name(e.player), threat: t(`threat.${view.players[e.player].explorer}.name`), n: e.to - e.from });
    case 'caught': return e.prevented ? t(`log.prevented.${e.prevented}`, { name: name(e.player) }) : t('log.caught', { name: name(e.player) });
    case 'stranded': return t('log.stranded', { name: name(e.player) });
    case 'checkpointUnlocked': return t('log.checkpoint', { name: name(e.player), place: t(`node.${view.players[e.player].explorer}.${e.node}.name`) });
    case 'itemGained': return t('log.item', { name: name(e.player), item: t(`item.${e.item}.name`) });
    case 'packFull': return t('log.packFull', { name: name(e.player) });
    case 'itemUsed': return e.target !== undefined ? t('log.itemOn', { name: name(e.player), item: t(`item.${e.item}.name`), target: name(e.target) }) : null;
    case 'blocked': return t('log.blocked', { name: name(e.player), item: t(`item.${e.item}.name`) });
    case 'forkChosen': return t(e.historical ? 'log.forkHistorical' : 'log.fork', { name: name(e.player), branch: t(`fork.${view.players[e.player].explorer}.${e.fork}.${e.branch}.name`) });
    case 'actStarted': return t('log.act', { name: name(e.player), act: e.act });
    case 'levelChanged': return t('log.level', { name: name(e.player), level: t(`level.${e.level}`) });
    case 'crossroadsWon': return t('log.crossroads', { name: name(e.player) });
    case 'lifeGained': return t('log.life', { name: name(e.player), n: e.amount });
    default: return null;
  }
  void ix;
}

export function Game({ ix, session, onExit }: { ix: ContentIndex; session: Session; onExit: () => void }) {
  const { t } = useI18n();
  const view = useView(session);
  const [error, setError] = useState<string | null>(null);
  const [notesFor, setNotesFor] = useState<PlayerState | null>(null);
  const [showLog, setShowLog] = useState(false);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);
  const send = (cmd: Command) => setError(session.send(cmd));
  const activeId = activePlayer(view);
  const active = activeId !== null ? view.players[activeId] : null;
  const c = view.crossroads;

  // what the map should show
  const world: Viewport = [0, 0, ix.map.width, ix.map.height];
  let focus: Viewport = world;
  let reveal: Reveal | null = null;
  let hint = null;
  let clickable = false;
  let onMapClick: ((x: number, y: number) => void) | undefined;
  if (view.phase === 'crossroads' && c) {
    focus = padViewport(c.question.viewport, 0.05);
    if (c.question.input === 'map' && c.active !== null && !c.resolved) {
      clickable = true;
      onMapClick = (x, y) => send({ type: 'crossroadsAnswer', player: c.active!, answer: { type: 'map', x, y } });
    }
    if (c.result?.click) reveal = { click: c.result.click, clicked: c.result.clicked, target: c.resolved ? c.question.target : undefined, outcome: c.result.outcome };
    else if (c.resolved && c.question.input === 'map') reveal = { target: c.question.target, outcome: 'correct' };
  } else if (active) {
    const turn = active.turn;
    const q = turn.question;
    if (q && (turn.stage === 'question' || turn.stage === 'review' || (turn.stage === 'reward' && view.phase === 'turns'))) {
      focus = padViewport(q.viewport, 0.05);
      if (turn.stage === 'question' && q.input === 'map') {
        clickable = true;
        onMapClick = (x, y) => send({ type: 'answer', player: active.id, answer: { type: 'map', x, y } });
        hint = turn.spyglass?.hint ?? null;
      }
      if (turn.stage === 'review' && q.input === 'map' && turn.result) {
        reveal = { target: q.target, clicked: turn.result.clicked, click: turn.result.click, outcome: turn.result.outcome };
      }
    } else {
      const n = nodeAt(ix, active, active.position);
      focus = padViewport(ix.regionViewport.get(n.region)!, 0.15);
    }
  }

  const log = useMemo(() => view.log.slice(-40).map((e) => eventText(t, view, ix, e)).filter(Boolean) as string[], [view, t, ix]);

  if (view.phase === 'over') {
    return <Journal ix={ix} view={view} onExit={onExit} />;
  }

  let panel: React.ReactNode = <div className="panel"><p className="muted">{t('panel.resolving')}</p></div>;
  if (view.phase === 'crossroads' && c) panel = <CrossroadsPanel ix={ix} view={view} send={send} now={now} />;
  else if (active) {
    const st = active.turn.stage;
    if (st === 'plan') panel = <PlanPanel key={`${active.id}-${view.round}`} ix={ix} view={view} p={active} send={send} />;
    else if (st === 'question') panel = <QuestionPanel key={active.turn.question!.uid} ix={ix} p={active} send={send} />;
    else if (st === 'review') panel = <ReviewPanel ix={ix} p={active} send={send} />;
    else if (st === 'reward') panel = <RewardPanel p={active} send={send} />;
    else if (st === 'bonus-question' || st === 'bonus-review') panel = <BonusPanel key={active.turn.bonus!.question.uid} p={active} send={send} />;
  }

  const phaseLabel = view.phase === 'crossroads' ? t('phase.crossroads') : view.phase === 'bonus' ? t('phase.bonus') : t('phase.turns');
  const nextCross = 3 - (view.round % 3);
  return (
    <div className="game">
      <header className="topbar">
        <h1>⚜ {t('app.title')} ⚜</h1>
        <span>{t('topbar.round', { n: view.round })} · {phaseLabel}</span>
        <span className="muted">{view.round % 3 === 0 ? t('topbar.crossroadsNow') : t('topbar.crossroadsIn', { n: nextCross })}</span>
        <span className="spacer" />
        <button className="ghost" onClick={() => setShowLog((v) => !v)}>{t('topbar.log')}</button>
        <button className="ghost" onClick={() => { if (confirm(t('topbar.quitConfirm'))) onExit(); }}>{t('topbar.quit')}</button>
      </header>
      <aside className="players">
        {view.turnOrder.map((id) => (
          <PlayerCard key={id} ix={ix} p={view.players[id]} active={id === activeId} round={view.round} onNotes={() => setNotesFor(view.players[id])} />
        ))}
        <p className="legend muted small">{t('legend.nodes')}</p>
      </aside>
      <main className="map-area">
        <WorldMap ix={ix} view={view} focus={focus} clickable={clickable} onMapClick={onMapClick} reveal={reveal} hint={hint} activePlayer={activeId} />
        {showLog && (
          <div className="log">
            <h3>{t('topbar.log')}</h3>
            <ul>{log.slice().reverse().map((l, i) => <li key={i}>{l}</li>)}</ul>
          </div>
        )}
      </main>
      <section className="challenge" aria-live="polite">
        {error && <p className="error" role="alert">{error}</p>}
        {panel}
      </section>
      {notesFor && <HistoryNotes ix={ix} explorer={notesFor.explorer} player={notesFor} onClose={() => setNotesFor(null)} />}
    </div>
  );
}

export { pathOf };
