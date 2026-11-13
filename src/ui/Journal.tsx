import { useState } from 'react';
import { levelIndex, type ContentIndex, type GameState, type PlayerState } from '../engine';
import { useI18n } from '../i18n/react';
import { HistoryNotes } from './HistoryNotes';

export function renown(p: PlayerState): number {
  return p.position + p.stats.checkpoints * 3 + p.charted.length + p.stats.riddlesSolved * 2 + p.stats.historicalBranches * 2 + levelIndex(p.level) * 3;
}

export function Journal({ ix, view, onExit }: { ix: ContentIndex; view: GameState; onExit: () => void }) {
  const { t, msg } = useI18n();
  const [selected, setSelected] = useState(view.winners[0] ?? 0);
  const [notes, setNotes] = useState(false);
  const p = view.players[selected];
  const winners = view.winners.map((id) => view.players[id].name).join(', ');
  const ranked = [...view.players].sort((a, b) => renown(b) - renown(a));
  const missed = p.journal.filter((j) => j.outcome !== 'correct' && !j.bonus);
  return (
    <div className="journal-screen">
      <header className="journal-head">
        <h1>⚜ {t('journal.title')} ⚜</h1>
        <p className="lead">{t('journal.winner', { names: winners, count: view.winners.length })}</p>
      </header>
      <div className="journal-grid">
        <section>
          <h2>{t('journal.renown')}</h2>
          <table className="table">
            <thead><tr><th>{t('journal.player')}</th><th>{t('journal.score')}</th><th>{t('journal.accuracy')}</th><th>{t('journal.charted')}</th></tr></thead>
            <tbody>
              {ranked.map((x) => (
                <tr key={x.id} className={x.id === selected ? 'on' : ''} onClick={() => setSelected(x.id)}>
                  <td className={`ink-${x.explorer}`}>{x.name} <span className="muted">({t(`explorer.${x.explorer}.name`)})</span></td>
                  <td>{renown(x)}</td>
                  <td>{x.stats.answered ? Math.round((x.stats.correct / x.stats.answered) * 100) : 0}%</td>
                  <td>{x.charted.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="muted small">{t('journal.renownHelp')}</p>
          <h2>{t('journal.byRegion', { name: p.name })}</h2>
          <ul className="regions">
            {Object.entries(p.stats.byRegion).map(([r, [c, n]]) => (
              <li key={r}><span>{t(`region.${r}`)}</span><span>{c}/{n}</span></li>
            ))}
          </ul>
          <h2>{t('journal.revisit')}</h2>
          {missed.length ? (
            <ul className="revisit">{missed.map((j, i) => <li key={i}>{msg(j.answer)}</li>)}</ul>
          ) : <p className="muted">{t('journal.noMisses')}</p>}
          <div className="actions">
            <button onClick={() => setNotes(true)}>{t('journal.whatHappened')}</button>
            <button className="primary" onClick={onExit}>{t('journal.newGame')}</button>
          </div>
        </section>
        <section>
          <h2>{t('journal.entries', { name: p.name })}</h2>
          <ol className="entries">
            {p.journal.map((j, i) => (
              <li key={i} className={`entry ${j.outcome}`}>
                <span className="mark">{j.outcome === 'correct' ? '✓' : j.outcome === 'near' ? '≈' : '✗'}</span>
                <div>
                  <p>{msg(j.prompt)}</p>
                  <p className="muted">{t('journal.answer', { answer: msg(j.answer) })}{j.bonus ? ` · ${t('journal.bonus')}` : ''}</p>
                  {j.fact && <p className="fact">{msg(j.fact)}</p>}
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
      {notes && <HistoryNotes ix={ix} explorer={p.explorer} player={p} onClose={() => setNotes(false)} />}
    </div>
  );
}
