import type { ContentIndex, ExplorerId, PlayerState } from '../engine';
import { useI18n } from '../i18n/react';
import { Modal } from './common';

export function HistoryNotes({ ix, explorer, player, onClose }: { ix: ContentIndex; explorer: ExplorerId; player?: PlayerState; onClose: () => void }) {
  const { t, has } = useI18n();
  const route = ix.route.get(explorer)!;
  const forks = route.sequence.filter((s): s is Exclude<typeof s, string> => typeof s !== 'string');
  const notes = [1, 2, 3, 4, 5, 6].map((i) => `notes.${explorer}.${i}`).filter(has);
  return (
    <Modal title={t('notes.title', { explorer: t(`explorer.${explorer}.name`) })} onClose={onClose}>
      <p className="lead">{t(`explorer.${explorer}.summary`)}</p>
      <h3>{t('notes.forks')}</h3>
      {forks.map((f) => {
        const chosen = player?.forks[f.fork];
        return (
          <div key={f.fork} className="truth">
            <strong>{t(`fork.${explorer}.${f.fork}.question`)}</strong>
            {chosen && (
              <p className="muted">
                {t('notes.youChose', { branch: t(`fork.${explorer}.${f.fork}.${chosen}.name`) })}
              </p>
            )}
            <p>{t(`fork.${explorer}.${f.fork}.truth`)}</p>
          </div>
        );
      })}
      <h3>{t('notes.simplifications')}</h3>
      <ul>{notes.map((k) => <li key={k}>{t(k)}</li>)}</ul>
    </Modal>
  );
}
