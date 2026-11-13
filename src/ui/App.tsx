import { useMemo, useState } from 'react';
import { indexContent, type GameConfig } from '../engine';
import { rawContent } from '../content/load';
import { clearSaved, loadSaved, LocalSession } from '../session/session';
import { Game } from './Game';
import { Setup } from './Setup';

export function App() {
  const ix = useMemo(() => indexContent(rawContent), []);
  const [session, setSession] = useState<LocalSession | null>(null);
  const [saved, setSaved] = useState(() => loadSaved());
  if (session) {
    return <Game ix={ix} session={session} onExit={() => { clearSaved(); setSaved(null); setSession(null); }} />;
  }
  return (
    <Setup
      ix={ix}
      onStart={(config: GameConfig) => setSession(new LocalSession(ix, config))}
      onContinue={saved ? () => setSession(new LocalSession(ix, saved)) : undefined}
    />
  );
}
