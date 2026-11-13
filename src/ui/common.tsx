import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useI18n } from '../i18n/react';

const flagUrls = import.meta.glob('/node_modules/flag-icons/flags/4x3/*.svg', { query: '?url', import: 'default', eager: true }) as Record<string, string>;

export function Flag({ code, className }: { code: string; className?: string }) {
  const url = flagUrls[`/node_modules/flag-icons/flags/4x3/${code.toLowerCase()}.svg`];
  const { t } = useI18n();
  if (!url) return <span className={`flag missing ${className ?? ''}`}>?</span>;
  return <img src={url} alt={t('flag.alt')} className={`flag ${className ?? ''}`} draggable={false} />;
}

/** Counts down `seconds` (0 = no timer) and calls onExpire once. Restarts when `resetKey` changes. */
export function useCountdown(seconds: number, resetKey: string, onExpire: () => void, paused = false): number {
  const [left, setLeft] = useState(seconds);
  const expired = useRef(false);
  const cb = useRef(onExpire);
  cb.current = onExpire;
  useEffect(() => {
    setLeft(seconds);
    expired.current = false;
  }, [seconds, resetKey]);
  useEffect(() => {
    if (!seconds || paused) return;
    const id = setInterval(() => setLeft((l) => Math.max(0, l - 0.1)), 100);
    return () => clearInterval(id);
  }, [seconds, resetKey, paused]);
  useEffect(() => {
    if (seconds && left <= 0 && !expired.current) {
      expired.current = true;
      cb.current();
    }
  }, [left, seconds]);
  return left;
}

export function TimerBar({ left, total }: { left: number; total: number }) {
  const { t } = useI18n();
  if (!total) return <div className="timer off">{t('timer.off')}</div>;
  const f = Math.max(0, left / total);
  return (
    <div className={`timer${f < 0.25 ? ' low' : ''}`} role="timer" aria-label={t('timer.left', { s: Math.ceil(left) })}>
      <div className="timer-fill" style={{ width: `${f * 100}%` }} />
      <span>{Math.ceil(left)}s</span>
    </div>
  );
}

export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  const { t } = useI18n();
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <div className="modal-back" onClick={onClose}>
      <div className={`modal${wide ? ' wide' : ''}`} role="dialog" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <header>
          <h2>{title}</h2>
          <button className="ghost" onClick={onClose} aria-label={t('common.close')}>✕</button>
        </header>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export function Lives({ n }: { n: number }) {
  const { t } = useI18n();
  return (
    <span className="lives" aria-label={t('player.lives', { n })} title={t('player.lives', { n })}>
      {Array.from({ length: 4 }, (_, i) => <span key={i} className={i < n ? 'candle lit' : 'candle'} />)}
    </span>
  );
}
