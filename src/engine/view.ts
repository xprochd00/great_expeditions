// Player views: what a client is allowed to see. Correct answers stay hidden until a question is answered,
// and in online games other players' choices stay hidden while the turns phase is running.
import type { GameState, Question } from './types';

function hide(q: Question): Question {
  const { correct: _c, target: _t, answerLabel: _a, ...rest } = q;
  return rest;
}

export function viewFor(state: GameState, viewer: number | null): GameState {
  const v: GameState = structuredClone(state);
  v.rng = 0;
  for (const p of v.players) {
    const t = p.turn;
    if (t.question && t.stage === 'question') t.question = hide(t.question);
    if (t.bonus && p.turn.stage === 'bonus-question') t.bonus.question = hide(t.bonus.question);
    if (v.config.mode === 'online' && viewer !== p.id && v.phase === 'turns' && t.stage !== 'done') {
      t.plan = undefined;
      t.question = undefined;
    }
    p.revisits = [];
  }
  if (v.crossroads && !v.crossroads.resolved) v.crossroads.question = hide(v.crossroads.question);
  return v;
}
