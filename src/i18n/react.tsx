import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { createI18n, type I18n } from './i18n';
import { DEFAULT_LOCALE, LOCALES } from './locales';

const Ctx = createContext<I18n | null>(null);

export function I18nProvider({ locale = DEFAULT_LOCALE, children }: { locale?: string; children: ReactNode }) {
  const i18n = useMemo(() => {
    const entry = LOCALES[locale] ?? LOCALES[DEFAULT_LOCALE];
    return createI18n(locale, entry.catalog, LOCALES[DEFAULT_LOCALE].catalog);
  }, [locale]);
  return <Ctx.Provider value={i18n}>{children}</Ctx.Provider>;
}

export function useI18n(): I18n {
  const v = useContext(Ctx);
  if (!v) throw new Error('I18nProvider missing');
  return v;
}
