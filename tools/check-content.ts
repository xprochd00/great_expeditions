// Validates content: every referenced id exists and every message key has an English string.
// Usage: npm run check:content
import { indexContent } from '../src/engine';
import { rawContent } from '../src/content/load';
import { LOCALES } from '../src/i18n/locales';

const ix = indexContent(rawContent);
const en = LOCALES.en.catalog;
const problems: string[] = [];
const need = (key: string) => { if (!(key in en)) problems.push(`missing string: ${key}`); };
const place = (id: string) => {
  if (id.startsWith('country.')) { if (!ix.country.has(id.slice(8))) problems.push(`unknown country ${id}`); }
  else if (!ix.featureShape.has(id)) problems.push(`unknown feature ${id}`);
  need(`place.${id}`);
};

for (const q of rawContent.questions) {
  for (const r of q.regions) if (!ix.regionViewport.has(r)) problems.push(`${q.id}: unknown region ${r}`);
  if (q.kind === 'mc') {
    need(`q.${q.id}.prompt`);
    if (q.places) q.places.forEach(place);
    else for (let i = 1; i <= (q.options ?? 0); i++) need(`q.${q.id}.o${i}`);
    if ((q.places?.length ?? q.options ?? 0) < 4) problems.push(`${q.id}: fewer than 4 options`);
  } else {
    place(q.answer!);
    for (let i = 1; i <= 3; i++) need(`q.${q.id}.c${i}`);
  }
  if (q.landmark && !ix.node.has(q.landmark)) problems.push(`${q.id}: unknown landmark node ${q.landmark}`);
}
for (const route of rawContent.routes) {
  need(`explorer.${route.id}.name`);
  for (const n of route.nodes) {
    need(`node.${route.id}.${n.id}.name`);
    need(`node.${route.id}.${n.id}.note`);
    if ((n.type === 'landmark' || n.type === 'checkpoint') && !ix.landmark.has(`${route.id}.${n.id}`)) {
      problems.push(`${route.id}.${n.id}: ${n.type} without a landmark question`);
    }
  }
  if (!ix.finals.has(route.id)) problems.push(`${route.id}: no final challenge`);
  for (const s of route.sequence) {
    if (typeof s === 'string') continue;
    need(`fork.${route.id}.${s.fork}.question`);
    need(`fork.${route.id}.${s.fork}.truth`);
    for (const b of s.branches) { need(`fork.${route.id}.${s.fork}.${b.id}.name`); need(`fork.${route.id}.${s.fork}.${b.id}.desc`); }
  }
}
for (const r of rawContent.regions) need(`region.${r.id}`);
for (const c of rawContent.countries) need(`place.country.${c.id}`);
for (const f of rawContent.features) need(`place.${f.id}`);

if (problems.length) {
  console.error(problems.join('\n'));
  console.error(`\n${problems.length} problem(s)`);
  process.exit(1);
}
console.log(`content OK: ${rawContent.questions.length} hand-written questions, ${rawContent.features.length} features, ${rawContent.countries.length} countries`);
