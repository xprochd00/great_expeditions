// Loads the content packs (map, countries, regions, routes, questions) into a typed RawContent.
// Only data lives in /content; nothing there is code.
import type { HandQuestion, RawContent, RouteDef } from '../engine';
import map from '../../content/map/world.json';
import features from '../../content/map/features.catalog.json';
import countries from '../../content/questions/countries.json';
import ratings from '../../content/questions/country-ratings.json';
import flagGroups from '../../content/questions/flag-groups.json';
import regions from '../../content/questions/regions.json';
import questions from '../../content/questions/handwritten.json';
import polo from '../../content/history/polo.json';
import magellan from '../../content/history/magellan.json';
import livingstone from '../../content/history/livingstone.json';
import amundsen from '../../content/history/amundsen.json';

export const rawContent = {
  map,
  countries,
  ratings,
  features,
  regions,
  routes: [polo, magellan, livingstone, amundsen] as RouteDef[],
  questions: questions as HandQuestion[],
  flagGroups,
} as unknown as RawContent;
