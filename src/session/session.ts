// A Session delivers player commands to the engine and publishes player views.
// LocalSession runs the engine in the browser (hot-seat). A future RemoteSession would send
// the same commands over a WebSocket to a server running the same engine.
import {
  applyCommand, CommandError, createGame, viewFor, type Command, type ContentIndex, type GameConfig, type GameEvent,
  type GameState,
} from '../engine';

export interface Session {
  getView(): GameState;
  send(cmd: Command): string | null; // returns an error message, or null
  subscribe(listener: (events: GameEvent[]) => void): () => void;
}

const SAVE_KEY = 'great-expeditions.save.v1';

export class LocalSession implements Session {
  private state: GameState;
  private view: GameState;
  private listeners = new Set<(events: GameEvent[]) => void>();

  constructor(private ix: ContentIndex, configOrState: GameConfig | GameState) {
    this.state = 'version' in configOrState ? configOrState : createGame(ix, configOrState);
    this.view = viewFor(this.state, null);
  }

  getView(): GameState {
    return this.view;
  }

  send(cmd: Command): string | null {
    try {
      const { state, events } = applyCommand(this.ix, this.state, cmd);
      this.state = state;
      this.view = viewFor(state, null);
      save(state);
      this.listeners.forEach((l) => l(events));
      return null;
    } catch (e) {
      if (e instanceof CommandError) return e.message;
      throw e;
    }
  }

  subscribe(listener: (events: GameEvent[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

function save(state: GameState): void {
  try {
    if (state.phase === 'over') localStorage.removeItem(SAVE_KEY);
    else localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable: saving is a convenience only */
  }
}

export function loadSaved(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as GameState;
    return s.version === 1 ? s : null;
  } catch {
    return null;
  }
}

export function clearSaved(): void {
  try { localStorage.removeItem(SAVE_KEY); } catch { /* ignore */ }
}
