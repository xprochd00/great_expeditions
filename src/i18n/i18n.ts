// Message formatting. All visible text goes through t(); place references in params are
// translated first, so a question template never concatenates strings itself.
import { IntlMessageFormat } from 'intl-messageformat';
import type { Msg, PlaceRef } from '../engine';

export type Catalog = Record<string, string>;

export interface I18n {
  locale: string;
  t(key: string, params?: Msg['params']): string;
  msg(m: Msg | undefined): string;
  has(key: string): boolean;
  date(value: string, approx?: boolean): string;
}

const isPlace = (v: unknown): v is PlaceRef => typeof v === 'object' && v !== null && 'place' in v;

export function createI18n(locale: string, catalog: Catalog, fallback: Catalog = {}): I18n {
  const cache = new Map<string, IntlMessageFormat>();
  const missing = new Set<string>();
  const raw = (key: string): string | undefined => catalog[key] ?? fallback[key];
  const t = (key: string, params?: Msg['params']): string => {
    const source = raw(key);
    if (source === undefined) {
      if (!missing.has(key)) { missing.add(key); console.warn(`[i18n] missing ${locale} string: ${key}`); }
      return key;
    }
    if (!params) return source.includes('{') ? format(key, source, {}) : source;
    const resolved: Record<string, string | number> = {};
    for (const [k, v] of Object.entries(params)) resolved[k] = isPlace(v) ? t(`place.${v.place}`) : v;
    return format(key, source, resolved);
  };
  const format = (key: string, source: string, values: Record<string, string | number>) => {
    let f = cache.get(key);
    if (!f) { f = new IntlMessageFormat(source, locale); cache.set(key, f); }
    return String(f.format(values));
  };
  const dateFmt = new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric' });
  return {
    locale,
    t,
    msg: (m) => (m ? t(m.key, m.params) : ''),
    has: (key) => raw(key) !== undefined,
    date: (value, approx) => {
      if (!value) return '';
      const [y, m] = value.split('-').map(Number);
      const text = m ? dateFmt.format(new Date(Date.UTC(y, m - 1, 15))) : String(y);
      return approx ? t('date.approx', { date: text }) : text;
    },
  };
}
