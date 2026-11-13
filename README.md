# Great Expeditions

A competitive geography adventure for 1–4 players. Each player follows a real, documented
expedition (Marco Polo, Magellan, Livingstone, Amundsen) across a vintage world map and
moves forward by answering geography questions while a threat closes in.

The game design is in [docs/GAME_DESIGN.md](docs/GAME_DESIGN.md).

## Run it

```bash
npm install
```

```bash
npm run dev
```

Then open the printed local URL. The MVP is desktop hot-seat: players take turns on one computer.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Typecheck and production build into `dist/` |
| `npm test` | Engine tests, including bots playing complete games |
| `npm run check:content` | Validates content: ids, routes, landmark questions and English strings |
| `npm run balance` | Simulates 200 four-player games and prints length and win share per explorer |
| `npm run build:map` | Rebuilds `content/map/world.json` from Natural Earth (downloads on first run) |
| `npm run build:countries` | Rebuilds the country list and English country/capital names |

## Project structure

```
src/
  engine/      game rules: state, commands, events, seeded RNG, question selection,
               map hit-testing, player views (pure TypeScript: no React, no DOM, no network)
  session/     LocalSession (hot-seat); a RemoteSession can later send the same commands to a server
  ui/          React components: setup, vintage SVG map, player cards, challenge panels, journal
  i18n/        message formatting (ICU MessageFormat) and the locale registry
  content/     loader that turns the JSON content packs into typed data
content/
  map/         generated map geometry + the authored feature catalogue (ratings, levels)
  questions/   countries, difficulty ratings, regions, similar-flag groups, hand-written questions
  history/     the four routes: dated nodes, terrain, regions, historical forks
  locales/en/  every visible string: UI, history, questions, place names
tools/         map and country build scripts, content checker
```

The engine never handles display text, only message keys, and the UI never changes game state
directly: it sends commands to a session and renders the view it gets back.

## Adding a language

Create `content/locales/<code>/` with the same files as `content/locales/en/`, then register it in
`src/i18n/locales.ts`. Missing strings fall back to English. Answers are checked by id, never by
text, so questions work in any language. Place names inside sentences are always passed as
parameters to a complete sentence, so languages with grammatical cases can phrase them correctly.

## Data and credits

- Map data: [Natural Earth](https://www.naturalearthdata.com/) (public domain).
- Country data: [mledoze/countries](https://github.com/mledoze/countries) via `world-countries` (ODbL).
- Flags: [flag-icons](https://github.com/lipis/flag-icons) (MIT).
