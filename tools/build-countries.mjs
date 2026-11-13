// Builds content/questions/countries.json and content/locales/en/places.countries.json
// from the `world-countries` dataset (ODbL). Usage: npm run build:countries
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const world = require('world-countries');

// Names that read better in a quiz than the dataset's common name.
const NAME_OVERRIDES = { UNK: 'Kosovo', PSE: 'Palestine', COD: 'DR Congo', COG: 'Republic of the Congo', CIV: 'Ivory Coast', CZE: 'Czechia', MKD: 'North Macedonia', VAT: 'Vatican City', FSM: 'Micronesia' };
const CAPITAL_OVERRIDES = { ZAF: 'Pretoria', BOL: 'Sucre', PSE: 'Ramallah', ISR: 'Jerusalem' };

const countries = [];
const names = {};
for (const c of world) {
  if (!c.independent && !['PSE', 'UNK', 'ESH', 'TWN'].includes(c.cca3)) continue;
  const capital = CAPITAL_OVERRIDES[c.cca3] ?? c.capital?.[0] ?? null;
  countries.push({
    id: c.cca3,
    cca2: c.cca2.toLowerCase(),
    region: c.region,
    subregion: c.subregion,
    borders: c.borders,
    landlocked: c.landlocked,
    area: c.area,
    hasCapital: !!capital,
  });
  names[`place.country.${c.cca3}`] = NAME_OVERRIDES[c.cca3] ?? c.name.common;
  if (capital) names[`place.capital.${c.cca3}`] = capital;
}
countries.sort((a, b) => a.id.localeCompare(b.id));
fs.writeFileSync('content/questions/countries.json', JSON.stringify(countries, null, 1) + '\n');
fs.writeFileSync('content/locales/en/places.countries.json', JSON.stringify(names, null, 1) + '\n');
console.log(countries.length, 'countries');
