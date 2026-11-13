import { useState } from 'react';
import { EXPLORERS, LEVELS, type ContentIndex, type ExplorerId, type GameConfig, type Level, type PlayerSetup } from '../engine';
import { useI18n } from '../i18n/react';
import { HistoryNotes } from './HistoryNotes';

const DEFAULT_NAMES = ['Player 1', 'Player 2', 'Player 3', 'Player 4'];

export function Setup({ ix, onStart, onContinue }: { ix: ContentIndex; onStart: (c: GameConfig) => void; onContinue?: () => void }) {
  const { t } = useI18n();
  const [count, setCount] = useState(2);
  const [tableLevel, setTableLevel] = useState<Level>('intermediate');
  const [rivalItems, setRivalItems] = useState(true);
  const [players, setPlayers] = useState<PlayerSetup[]>(
    EXPLORERS.map((e, i) => ({ name: DEFAULT_NAMES[i], explorer: e, level: 'intermediate', timer: 'normal' })),
  );
  const [notes, setNotes] = useState<ExplorerId | null>(null);
  const active = players.slice(0, count);
  const taken = (e: ExplorerId, idx: number) => active.some((p, i) => i !== idx && p.explorer === e);
  const update = (i: number, patch: Partial<PlayerSetup>) => setPlayers((ps) => ps.map((p, j) => (j === i ? { ...p, ...patch } : p)));
  const valid = new Set(active.map((p) => p.explorer)).size === active.length && active.every((p) => p.name.trim());

  return (
    <div className="setup">
      <header className="setup-head">
        <h1>⚜ {t('app.title')} ⚜</h1>
        <p className="lead">{t('app.tagline')}</p>
        {onContinue && <button className="primary" onClick={onContinue}>{t('setup.continue')}</button>}
      </header>

      <section className="explorers">
        {EXPLORERS.map((e) => (
          <article key={e} className={`explorer-card ink-${e}`}>
            <h2>{t(`explorer.${e}.name`)}</h2>
            <p className="sub">{t(`explorer.${e}.title`)} · {t(`explorer.${e}.years`)}</p>
            <p className="route">{t(`explorer.${e}.route`)}</p>
            <p>{t(`explorer.${e}.summary`)}</p>
            <dl>
              <dt>{t('setup.threat')}</dt>
              <dd><strong>{t(`threat.${e}.name`)}</strong> — {t(`threat.${e}.desc`)}</dd>
              <dt>{t('setup.ability')}</dt>
              <dd><strong>{t(`ability.${e}.name`)}</strong> — {t(`ability.${e}.desc`)}</dd>
            </dl>
            <button className="ghost" onClick={() => setNotes(e)}>📜 {t('notes.open')}</button>
          </article>
        ))}
      </section>

      <section className="setup-form">
        <div className="field-row">
          <label>{t('setup.players')}
            <select value={count} onChange={(e) => setCount(Number(e.target.value))}>
              {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
          <label>{t('setup.tableLevel')}
            <select value={tableLevel} onChange={(e) => {
              const l = e.target.value as Level;
              setTableLevel(l);
              setPlayers((ps) => ps.map((p) => ({ ...p, level: l })));
            }}>
              {LEVELS.map((l) => <option key={l} value={l}>{t(`level.${l}`)}</option>)}
            </select>
          </label>
          <label className="check">
            <input type="checkbox" checked={rivalItems} onChange={(e) => setRivalItems(e.target.checked)} />
            {t('setup.rivalItems')}
          </label>
        </div>
        <p className="muted small">{t(`level.${tableLevel}.desc`)}</p>

        <table className="table players-table">
          <thead>
            <tr><th>{t('setup.name')}</th><th>{t('setup.explorer')}</th><th>{t('setup.level')}</th><th>{t('setup.timer')}</th></tr>
          </thead>
          <tbody>
            {active.map((p, i) => (
              <tr key={i}>
                <td><input value={p.name} maxLength={20} onChange={(e) => update(i, { name: e.target.value })} aria-label={t('setup.name')} /></td>
                <td>
                  <select value={p.explorer} onChange={(e) => update(i, { explorer: e.target.value as ExplorerId })} aria-label={t('setup.explorer')}>
                    {EXPLORERS.map((e) => <option key={e} value={e} disabled={taken(e, i)}>{t(`explorer.${e}.name`)}</option>)}
                  </select>
                </td>
                <td>
                  <select value={p.level} onChange={(e) => update(i, { level: e.target.value as Level })} aria-label={t('setup.level')}>
                    {LEVELS.map((l) => <option key={l} value={l}>{t(`level.${l}`)}</option>)}
                  </select>
                </td>
                <td>
                  <select value={p.timer} onChange={(e) => update(i, { timer: e.target.value as PlayerSetup['timer'] })} aria-label={t('setup.timer')}>
                    {(['normal', 'long', 'off'] as const).map((x) => <option key={x} value={x}>{t(`timer.${x}`)}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!valid && <p className="error">{t('setup.invalid')}</p>}
        <button className="primary big" disabled={!valid} onClick={() => onStart({
          players: active.map((p) => ({ ...p, name: p.name.trim() })), seed: (Math.random() * 2 ** 31) | 0, rivalItems, mode: 'hotseat',
        })}>{t('setup.start')}</button>

        <details className="howto">
          <summary>{t('howto.title')}</summary>
          <ul>
            {[1, 2, 3, 4, 5, 6, 7].map((i) => <li key={i}>{t(`howto.${i}`)}</li>)}
          </ul>
        </details>
      </section>
      {notes && <HistoryNotes ix={ix} explorer={notes} onClose={() => setNotes(null)} />}
      <footer className="credits muted small">{t('app.credits')}</footer>
    </div>
  );
}
