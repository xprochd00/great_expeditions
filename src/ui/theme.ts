import type { ExplorerId, ItemId } from '../engine';

export const INK: Record<ExplorerId, { color: string; dash: string; soft: string }> = {
  polo: { color: '#9b2226', dash: '', soft: 'rgba(155,34,38,0.28)' },
  magellan: { color: '#2b3f7a', dash: '7 4', soft: 'rgba(43,63,122,0.28)' },
  livingstone: { color: '#23735a', dash: '2 3', soft: 'rgba(35,115,90,0.28)' },
  amundsen: { color: '#a8741a', dash: '9 3 2 3', soft: 'rgba(168,116,26,0.30)' },
};

export const ITEM_ICON: Record<ItemId, string> = {
  spyglass: '🔭', compass: '🧭', guide: '🗺️', provisions: '🥖', medicine: '⚕️', rumour: '🗣️', porters: '🎒',
};
