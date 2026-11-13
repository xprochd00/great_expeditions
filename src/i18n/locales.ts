// Registered languages. To add one, create content/locales/<code>/ with the same files
// and add it here; missing strings fall back to English.
import type { Catalog } from './i18n';
import enUi from '../../content/locales/en/ui.json';
import enHistory from '../../content/locales/en/history.json';
import enQuestions from '../../content/locales/en/questions.json';
import enCountries from '../../content/locales/en/places.countries.json';
import enFeatures from '../../content/locales/en/places.features.json';

export const LOCALES: Record<string, { name: string; catalog: Catalog }> = {
  en: { name: 'English', catalog: { ...enUi, ...enHistory, ...enQuestions, ...enCountries, ...enFeatures } },
};
export const DEFAULT_LOCALE = 'en';
