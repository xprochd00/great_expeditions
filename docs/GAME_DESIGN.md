# Great Expeditions — Game Design Proposal

> A competitive geography adventure for 1–4 players. Each player becomes a famous explorer
> and follows the real route of one documented expedition across a vintage world map, chased
> by a threat. You move by answering geography questions correctly, not by rolling dice.

**Design pillars**

1. **Geography moves you.** Every step forward comes from a geography answer. History and
   culture never move you directly. They give perks: lives, items, checkpoints, protection.
2. **Knowledge, not eyesight.** The map has no labels, and no question can be answered just
   by looking at it.
3. **Risk is your choice.** Each turn you choose how hard a question to take. Harder
   questions move you further but cost more when you get them wrong.
4. **Real expeditions, told accurately.** Each explorer follows one historically documented
   expedition. Wherever gameplay simplifies something, the game says so.
5. **Everyone at the right level.** A child learning capitals and a geography enthusiast can
   play at the same table, each against questions set to their own level.
6. **You leave knowing more.** The game brings back what you got wrong, and after each game
   you get a personal atlas and a historical journal of what you learned.

**Terms used in this document**

| Term | Meaning | Who sets it, and when |
|---|---|---|
| **Level** | How much a player knows: Beginner, Intermediate, Advanced or Expert | Each player (or the whole table) before the game; can be changed between acts |
| **Tier** | How big a risk a player takes this round: Scout, Navigator or Pathfinder | Each player, every round |
| **Rating** | How hard an individual question is, on a scale of 1–12 | Content authors; later recalibrated from answer data |

---

## 1. Core gameplay loop and movement rules

### 1.1 The board

Each explorer has their own **route**: a chain of **nodes** drawn on the shared world map.
Every node is a place the expedition really passed through. Routes are measured in
**steps** (nodes), not kilometres, so every explorer has the same number of steps to the
finish no matter how long the real journey was.

| | Full game | MVP |
|---|---|---|
| Steps per route | 36 | 24 |
| Acts (difficulty phases) | 3 × 12 steps | 3 × 8 steps |
| Checkpoints (incl. start) | 5 + finish | 3 + finish |
| Route forks | 1–2 (only where history offers a real choice) | 1 |
| Target length (4 players, hot-seat) | 45–60 min | 25–35 min |

Node types (each has its own map symbol):

| Node | Symbol | Effect |
|---|---|---|
| Path | small ink dot | Nothing special. Shows the date the expedition was here. |
| **Checkpoint** | fort / flag | Landmark challenge; becomes your respawn point when unlocked (§4) |
| **Landmark** | star | Optional history or culture bonus question for an item |
| **Hazard** | skull / storm glyph | If your move ends here, your next challenge must be Navigator or Pathfinder |
| **Discovery** | compass rose | Your next challenge is an Expedition Riddle (§3.5) |
| **Trading post** | anchor / coin | Swap one item for a new random one (full game) |
| **Fork** | split arrow | Choose your branch (§1.4) |

### 1.2 One round

Every phase works by **first collecting every player's choice and then resolving them all
together**. Hot-seat collects the choices one player at a time on one screen. Online collects
them from all players at the same moment. The rules are identical, so online play can be
added without changing the game (§8).

```
┌─ 1. CHART YOUR COURSE ─────────────────────────────────────────────┐
│  Each player picks a tier (and a branch at a fork). Items that say │
│  "before the challenge" are played now.                            │
├─ 2. CHALLENGE ─────────────────────────────────────────────────────┤
│  Each player answers one geography question about their CURRENT    │
│  region, at their own level and the tier they picked. There is a   │
│  time limit.                                                       │
├─ 3. MARCH ─────────────────────────────────────────────────────────┤
│  Correct: move forward. Near miss: partial move. Wrong: stay.      │
│  Passing a checkpoint or landmark triggers its bonus challenge.    │
├─ 4. THE THREAT ADVANCES ───────────────────────────────────────────┤
│  Each threat moves its base step plus any penalties and terrain    │
│  modifiers. If it reaches or passes the explorer: CAUGHT (§4.4).   │
├─ 5. CROSSROADS (every 3rd round) ──────────────────────────────────┤
│  One shared question that all players race to answer (§5.4).       │
└────────────────────────────────────────────────────────────────────┘
```

### 1.3 Tiers and movement

| Tier | Correct | Near miss* | Wrong | Time limit |
|---|---|---|---|---|
| **Scout** (easy) | +1 step | 0 steps, no penalty | threat +1 | 20 s |
| **Navigator** (medium) | +2 steps | +1 step, no penalty | threat +1 | 25 s |
| **Pathfinder** (hard) | +3 steps | +1 step, no penalty | threat +2 | 30 s |

\* **Near miss** applies to map-click questions only. You clicked a country that borders the
correct one, or a feature within a small tolerance of it.

Time limits can be lengthened or switched off for individual players (§3.4).

**Why these numbers.** The threat moves 1 step every round, so:

- A correct **Scout** answer only keeps you level with the threat. It is safe, but it won't
  win a race.
- A correct **Navigator** answer gains 1 step on the threat. A correct **Pathfinder** answer
  gains 2.
- Expected progress per round with typical accuracy (90% / 70% / 45%) is 0.9 / 1.4 / 1.35
  steps. Navigator is the default good choice. Pathfinder is the best choice in a region you
  know well. Scout is for escaping when the threat is right behind you.

Tiers are always **relative to your level**. A Beginner's Pathfinder question and an
Expert's Pathfinder question are equally risky *for that player*, so players at different
levels compete fairly.

### 1.4 Route forks: real historical choices

Forks appear only where the expedition faced a **real, documented choice**, or where a real
route of the same period ran alongside the one the expedition took.

- The **historical branch** carries a wax seal: "The expedition went this way."
- The **alternative** is always a real route of the time, never an invented one. Choosing it
  is presented as "what if?", and the journal explains what actually happened.
- Sometimes the historical branch is the safe one (the Polos' detour to Hormuz) and
  sometimes it is the daring shortcut (Amundsen's unknown glacier). Players can't win by
  always choosing the same type of branch.

Each branch is either a **safe road** (longer, with a landmark or trading post, and normal
threat speed) or a **perilous shortcut** (shorter, with hazard nodes and terrain that speeds
up the threat). Branch choices are public.

### 1.5 Winning

1. When you reach the **final node**, you face the **Final Expedition Challenge**: an
   Expedition Riddle about your destination region.
2. If you solve it, **you win**. If not, you stay on the final node, the threat keeps coming,
   and you try again next round.
3. If several players finish in the same round, the tie-break is (a) the fewest clues used
   on the final riddle, then (b) the most lives left, then (c) the most regions charted.

After the game, everyone gets a **Renown** score (steps, checkpoints unlocked, regions
charted, riddles solved, and the share of historical branches taken). Players who didn't win
still have a personal result to compare.

---

## 2. The four explorers and their expeditions

### 2.0 Historical accuracy policy

Each explorer follows **one specific, documented expedition**. The route is built from the
expedition's primary sources and from established scholarship.

| Allowed simplification | Not allowed |
|---|---|
| Leaving out minor stops, or merging nearby ones into one node | Visiting places the expedition never reached |
| Step counts not matching real distance or time | Combining separate expeditions into one route |
| Shortening a return leg along the same road into a few nodes | Inventing events, people or motives |
| Threats as dramatised forms of real dangers | Presenting the alternative branch of a fork as what happened |

Rules for the content:

- **Every node has a date** (month and year). The date is shown on the map, so players see
  the expedition's timeline as they move.
- **Disputed details are labelled as disputed.** For example, parts of Marco Polo's route
  are reconstructed from his book, and historians disagree about some of them. Any question
  that touches disputed history says "according to Polo's account".
- **Every simplification is listed** in a "History notes" panel for each explorer, which can
  be opened from the explorer selection screen and from the journal.
- **Fact-checking and source attribution come in a later phase** and are not part of the
  MVP (§7.3). The content format already has a `sources` field, so references can be added
  later without changing anything else.

### 2.1 Marco Polo — the journey to Kublai Khan (1271–1275)

*Venice → Shangdu (Xanadu).* Sources: Polo's *The Travels* (*Il Milione*) and modern
reconstructions of the route.

The Polos met Kublai Khan at his summer capital, **Shangdu**, not at Khanbaliq (Beijing).
So the route ends at Shangdu.

| Act | Regions (question pools) | Nodes (★ landmark, ⚠ hazard, **CP** checkpoint) |
|---|---|---|
| I | Mediterranean & Levant · Anatolia & Armenia | **Venice** (start, 1271) → **Acre** ★ (1271: Pope Gregory X is elected while the Polos are there and gives them letters for Kublai) → Ayas → Sivas → Erzurum → **Tabriz** (CP) |
| II | Persia & Persian Gulf · Afghanistan & Pamir | Saveh ★ (Polo's account of the tombs of the Magi) → Yazd → **Kerman** (CP) → fork → Balkh → **Badakhshan** (CP; Polo writes that he spent a year recovering from illness here) → Wakhan → Pamir ⚠ |
| III | Tarim Basin · Hexi Corridor · Mongolia & Northern China | **Kashgar** (CP) → Yarkand → Khotan → Charchan → Lop ⚠ (desert of Lop) → **Shazhou / Dunhuang** (CP) → Suzhou (Jiuquan) → Ganzhou (Zhangye) → **Shangdu** (finish, 1275) |

Forks:

- **Kerman (full game):** *down to Hormuz* (historical: the Polos went to the port meaning
  to sail to China, decided the ships were unsafe, and returned inland; the longer, safe road
  with a trading post) or *straight north on the Khorasan caravan road* (the shorter
  alternative across the edge of the Dasht-e Lut, with desert hazards).
- **Kashgar (MVP):** *the southern Tarim road through Khotan and Lop* (historical) or *the
  northern Tarim road through Aksu, Kucha and Turpan* (the other main Silk Road branch of
  the period). The two rejoin at Shazhou.

**Threat — The Great Sandstorm.** +1 extra on desert nodes (Lut, Taklamakan, Lop, Gobi
edge). It does not take its base step on mountain nodes.

**Ability — Golden Paiza.** Kublai gave Niccolò and Maffeo Polo a golden tablet of safe
passage on their first journey. Once per act, you can cancel a wrong answer's penalty: the
threat doesn't advance, and you still move 1 step.

### 2.2 Ferdinand Magellan — the first circumnavigation (1519–1522)

*Sanlúcar de Barrameda → around the world → Sanlúcar de Barrameda.* Source: Antonio
Pigafetta's account, plus the ships' logs and depositions.

| Act | Regions | Nodes |
|---|---|---|
| I | Iberia & Macaronesia · West Africa · Brazil | **Sanlúcar** (start, Sept 1519) → Tenerife → fork → **Rio de Janeiro** (CP, the bay the expedition called Santa Lucía, Dec 1519) |
| II | Río de la Plata & Patagonia · Pacific Ocean | Río de la Plata → **Puerto San Julián** (CP ★, the mutiny of Apr 1520) → Santa Cruz → Cape of the Virgins → Strait ⚠ (Oct–Nov 1520; the *San Antonio* deserts) → Pacific crossing ⚠⚠ → **Guam** (CP, Mar 1521) |
| III | Philippines & Maritime SE Asia · Indian Ocean & Southern Africa | Homonhon → Limasawa → Cebu → Mactan ★ (Apr 1521) → Palawan → Brunei → **Tidore** (CP, Nov 1521) → Timor → fork → Cape of Good Hope ⚠ (May 1522) → Cape Verde ★ (July 1522) → **Sanlúcar** (finish, Sept 1522) |

History built into the route:

- **Mactan:** Magellan is killed in the battle of Mactan. The fleet's command passes through
  several hands.
- **Tidore:** the *Victoria* and the *Trinidad* separate. Here the player's token becomes
  **Juan Sebastián Elcano**, who captains the *Victoria* home. (The journal tells what
  happened to the *Trinidad*: it tried to sail back east across the Pacific and was captured
  by the Portuguese.)
- **Cape Verde:** the crew discover their log is one day behind the local calendar, the
  "lost day". This leads to a geography question about the International Date Line.

Forks:

- **Atlantic (MVP):** *south along the African coast* (historical: Magellan's choice, which
  caused open conflict with the Spanish captain Juan de Cartagena) or *the direct crossing*
  (the usual course, which Cartagena demanded; shorter, through Portuguese waters).
- **Return (full game):** *the open southern Indian Ocean, avoiding all ports* (historical;
  a shortcut with scurvy hazards) or *the Portuguese coastal trade route* (a real route via
  Malacca and India; safer for supplies, but the Fleet is faster there).

**Threat — The Portuguese Fleet.** King Manuel I of Portugal really did order the expedition
to be intercepted. +1 extra in Portuguese waters (the African Atlantic and the Indian
Ocean). It stops completely in the Pacific, but every Pacific node is a hazard node (scurvy
and thirst).

**Ability — Trade Winds.** Once per act, declare it *before* answering: a correct answer
moves you double. A wrong answer adds +1 threat on top of the normal penalty.

### 2.3 David Livingstone — the crossing of Africa (1852–1856)

*Cape Town → Luanda → Quelimane.* Sources: Livingstone's *Missionary Travels and Researches
in South Africa* (1857) and his journals.

Livingstone's first great journey went from the Atlantic coast to the Indian Ocean coast.
He was the first European known to cross south-central Africa from coast to coast.

| Act | Regions | Nodes |
|---|---|---|
| I | Southern Africa · Kalahari & Okavango–Chobe | **Cape Town** (start, June 1852) → Kuruman → Kalahari ⚠ → Chobe River → **Linyanti** (CP, May 1853; the Makololo chief Sekeletu provides porters) |
| II | Upper Zambezi · Angola & Congo watershed | Barotse Valley → Lake Dilolo ★ (the watershed between the Zambezi and Congo basins) → Kasai River ⚠ → Kwango River → Cassange → **Luanda** (CP, May 1854) |
| III | Return through Angola · Zambezi Valley · Mozambique | Return leg, shortened to 3 nodes → **Linyanti** (Sept 1855) → **Victoria Falls / Mosi-oa-Tunya** (CP ★, Nov 1855) → fork → Zumbo → Tete (Mar 1856) → **Quelimane** (finish, May 1856) |

Forks:

- **East of Victoria Falls (MVP):** *over the Batoka plateau, away from the river*
  (historical; highland nodes, so the Fever is slower) or *following the Zambezi* (river
  nodes, and the Kebrabasa (Cahora Bassa) rapids hazard). Taking the historical branch means
  Livingstone never sees Kebrabasa. The journal explains that this later doomed his plan to
  use the Zambezi as a navigable "highway" into Africa.
- **Full game:** Livingstone did not take any second real branch on this journey, so his
  full route has one fork. Extra Landmark and Discovery nodes balance this.

**Threat — The Fever (malaria).** Livingstone suffered repeated bouts of fever, especially
in Angola. +1 extra on river, lake and swamp nodes. It does not take its base step on
highland and Kalahari nodes.

**Ability — Physician.** Livingstone was a trained doctor. The first time in each act that
you would lose a life, you don't. You are still sent back to your checkpoint. Medicine
Chests restore 2 lives for Livingstone instead of 1.

### 2.4 Roald Amundsen — the South Pole expedition (1910–1911)

*Kristiania (Oslo) → Bay of Whales → South Pole.* Sources: Amundsen's *The South Pole*
(1912) and the expedition diaries.

| Act | Regions | Nodes |
|---|---|---|
| I | Scandinavia & North Sea · Eastern Atlantic & West Africa | **Kristiania** (start, June 1910) → Kristiansand (departure, Aug 1910) → North Sea → **Funchal, Madeira** (CP ★, Sept 1910: Amundsen reveals to his crew that they are going south, not north) → crossing the Equator |
| II | South Atlantic · Southern Ocean (south of Africa and Australia) | South Atlantic → Roaring Forties ⚠ → south of the Cape of Good Hope → Southern Indian Ocean ⚠ → south of Australia → Ross Sea pack ice ⚠ → **Framheim, Bay of Whales** (CP, Jan 1911) |
| III | Antarctica & Ross Ice Shelf · Southern Hemisphere | Depots at 80°, 81° and 82° S (laid Feb–Mar 1911) → **82° depot** (CP) → fork → Polar Plateau ⚠ → **South Pole** (finish, 14 Dec 1911) |

The open-ocean nodes in Act II are positions along Fram's track, not ports, because Fram
sailed from Madeira to the Bay of Whales without landing. Antarctica has no countries, so
Act III questions come from a **Southern Hemisphere** pool (Argentina, Chile, New Zealand,
Australia, South Africa, sub-Antarctic islands), plus polar geography: ice shelves, seas,
mountain ranges, territorial claims and research stations.

Fork (MVP and full game) — **the road to the Pole**:

- ***Amundsen's gamble*** (historical): up the unknown **Axel Heiberg Glacier** and across
  the crevassed "Devil's Ballroom". Shorter, with hazards.
- ***The known road***: the **Beardmore Glacier**, the route Shackleton found in 1908 and
  Scott used in 1911–12. Longer and safer.

The real context is part of the story. Amundsen built his base on the ice shelf at the Bay of
Whales, roughly a degree of latitude (about 100 km) closer to the Pole than Scott's base
on Ross Island. From there he had to find a new way up through the mountains.

**Threat — The Polar Winter.** The expedition was always racing the seasons. It had to
reach the ice before the short summer ended, and then reach the Pole and return before the
winter. The Polar Winter doesn't move steadily. It stays still for 2 rounds, then surges
3 steps on the 3rd round. The surge is shown in advance, so Amundsen's player can plan
around it. (The journal includes the real "false start" of September 1911, when early cold
forced the polar party to turn back.)

**Ability — Depot Laying.** After a correct answer, you may store up to 1 of the steps
earned in a supply depot (holding up to 3 steps) instead of moving them. You can spend
depot steps at any time, including right before a surge. This is based on the method
Amundsen used to win.

### 2.5 Balance notes

- Regional difficulty is handled by **question ratings and levels** (§3), not by region. A
  Scout question about Central Asia is as easy as a Scout question about Western Europe.
- Threats are tuned so each averages 1.0 ± 0.1 steps per round over a typical route.
- The number of forks differs between explorers because history differs. Explorers with
  fewer forks get extra Landmark and Discovery nodes. Track win rate per explorer and aim
  for 22–28% in 4-player games.

---

## 3. Question system, levels and difficulty progression

### 3.1 The "no free answers" rules

1. **Unlabelled map.** The map has no country, city or feature names. A name appears only
   after the place has been asked about and answered ("charted").
2. **Visibility test.** If someone who knows no geography could answer by looking at the
   map ("click the largest island", "which country is on the coast?"), the question is
   rejected or rewritten.
3. **Map clicks need a busy viewport.** The map zooms to the region, but the view always
   includes at least about 12 candidate countries or features.
4. **Plausible distractors.** Multiple-choice wrong answers come from the same region or
   category: neighbouring countries, former capitals, largest-but-not-capital cities,
   similar-looking flags.
5. **Region focus.** 70% of questions come from your current region, 20% from the *next*
   region on your route, and 10% from a route-wide or global pool.
6. **No repeats.** No country or feature is the subject of more than 2 of one player's
   questions in a game, unless it is a deliberate **revisit** (§3.6).
7. **No typed answers.** Every answer is a map click or a multiple-choice option. This makes
   answers easy to check in any language (§9) and fair for younger players.

### 3.2 Question types

| Type | Formats | Example |
|---|---|---|
| **Map identification** | Click a country, island, mountain range, river, lake, sea, strait or desert | "Click **Kyrgyzstan**." · "Click the **Amu Darya**." · "Click the **Kasai River**." · "Click **Mindanao**." |
| **Capitals** | Capital → country (multiple choice, or click it on the map); country → capital (multiple choice) | "**Ashgabat** is a capital. Click its country." · "Capital of **Zambia**?" Lusaka / Ndola / Kitwe / Livingstone (the town of Livingstone was the capital of Northern Rhodesia until 1935, which makes it a good distractor) |
| **Flags** | Flag → country (multiple choice); flag → click the country; country → choose its flag from 4 similar ones | Show the flag of Kazakhstan → click it · "Which is the flag of **Chad**?" (alongside Romania, Andorra, Moldova) |
| **Geographical knowledge** | Facts that cannot be read off a map: river systems, highest and deepest, landlocked status, borders, sources and mouths, climate | "Besides the Syr Darya, which river once fed the Aral Sea?" · "Which of these is **not** landlocked: Malawi, Zambia, Tanzania, Zimbabwe?" · "Which river forms most of the border between **Zambia and Zimbabwe**?" |
| **Combined challenges** | Use clues to identify a place, then click it | "Its capital lies across the Río de la Plata from Montevideo. Click the country." · "The Zambezi rises in this country. Click it." |
| **Historical geography** (Expert) | Historical place names and regions, routes, and how borders have changed | "Polo's *Badakhshan* is divided today between which two countries? Click either one." · "Click the region the ancient Greeks called *Bactria*." |
| **Expedition Riddle** | Clues revealed one at a time, answered by clicking the map (§3.5) | — |

**Hit zones for map clicks.** Each country's clickable area is its polygon. Microstates and
small islands get a larger circular target. Rivers and mountain ranges get a buffered hit
zone. A "near-miss ring" decides when a near miss applies.

### 3.3 Levels: what each player knows

Before the game, the host chooses a **table level**. Each player can then **override it for
themselves**. Levels decide two things:

1. **Content gates**: which subjects a player can be asked about at all.
2. **Rating window**: how hard the questions are.

| Level | Content (cumulative: each level adds to the ones above) | Rating window |
|---|---|---|
| **Beginner** | Well-known countries (about the 60 most familiar), their capitals and distinctive flags; continents and oceans; famous rivers and mountains *as multiple choice only* | 1–6 |
| **Intermediate** | Every sovereign country in the region, less familiar capitals and flags; major rivers, lakes and mountain ranges as map clicks | 3–8 |
| **Advanced** | Small states and microstates, islands and archipelagos, smaller rivers, ranges and deserts; similar-looking flags; harder geographical facts; Expedition Riddles with fewer clues | 5–10 |
| **Expert** | Obscure features (passes, straits, tributaries, plateaus), historical geography, the trickiest flags, and four-step combined challenges | 7–12 |

Each question has a rating from 1 to 12 and a **minimum level**. A question about the
Wakhan Corridor, for example, can never reach a Beginner, however its rating is set.

### 3.4 Difficulty progression within a game

Within a player's rating window, the **tier** they choose and the current **act** decide the
two-value band a question is drawn from:

```
band = window start + tier offset + act offset   (two values: [b, b+1])

window start:  Beginner 1 · Intermediate 3 · Advanced 5 · Expert 7
tier offset:   Scout 0 · Navigator 1 · Pathfinder 2
act offset:    Act I 0 · Act II 1 · Act III 2
```

Examples: Beginner, Act I, Scout → ratings 1–2. Intermediate, Act II, Navigator → 5–6.
Expert, Act III, Pathfinder → 11–12.

The question **format** also gets harder with the tier. Scout questions are mostly multiple
choice. Navigator mixes in map clicks. Pathfinder leans towards feature map clicks, flags →
locate, and combined challenges.

**Changing levels.** Levels can be changed for one player or for the whole table:

- **Before the game:** set the table level, then override it per player.
- **Between acts:** any player may move up or down one level. The game suggests a change
  when it seems useful, for example "You answered 88% correctly in Act I — try Advanced?"
  (above 85% accuracy) or "Try Intermediate?" (below 45%). A level change takes effect at the
  start of the next act.
- **Assist options** (per player, independent of level): longer time limits or no timer,
  hints that narrow the map region, and read-aloud for questions (future). These help only
  the player who uses them, and they don't change movement.

Because tiers are relative to level, the race stays fair at a mixed table. Renown
(post-game only) gives a small bonus for higher levels, so experienced players still have a
reason to choose Expert.

### 3.5 Expedition Riddles

These are used at Discovery nodes, in the Final Expedition Challenge, and in some Crossroads
rounds. Up to 3 clues are revealed one at a time, and **you may lock in one map click at any
moment**:

| Answered after | Clue 1 | Clue 2 | Clue 3 | Wrong |
|---|---|---|---|---|
| Movement | +4 | +3 | +2 | threat +2 |

Riddles are written in versions for each level. Higher levels use less obvious clues.

Example (Marco Polo, Act II, Intermediate):
1. "I am one of only two *doubly landlocked* countries in the world."
2. "The Amu Darya forms part of my southern border."
3. "Samarkand and Bukhara lie within my borders."
→ *Click Uzbekistan.*

Example (Livingstone, Act II, Advanced):
1. "My currency is named after one of my rivers."
2. "A small part of me, Cabinda, is separated from the rest by another country."
3. "Livingstone reached my capital in May 1854 after crossing from the Zambezi."
→ *Click Angola.*

### 3.6 Learning layer

- **Revisits:** if you get a subject wrong, it comes back 3–5 rounds later in a *different
  format*. For example, if you couldn't locate Kyrgyzstan, you later get "Bishkek is the
  capital of…?" A correct revisit earns +1 bonus step.
- **Charting:** every correctly answered country or feature becomes inked in your colour on
  the map and is labelled from then on.
- **Explorer's Journal:** after the game, a summary of every question with a one-line fact,
  your accuracy by region, places to revisit, **the true historical route with its dates**,
  and notes on each fork you chose ("What really happened").

---

## 4. Checkpoints, rewards and threat mechanics

### 4.1 Checkpoints

When you reach or pass a checkpoint, you face a **Landmark Challenge**. This is a bonus
question about the **history, culture, people, landmarks or traditions** of that place, or
about the expedition's time there. It is set to your level. Your remaining steps still
count; you don't have to stop at the checkpoint.

- **Correct:** the checkpoint is **unlocked** as your respawn point, **and** you choose 1
  reward (§4.2).
- **Wrong:** you pass the checkpoint but it stays unclaimed, so your respawn point is still
  the previous one. If you later respawn there, or decide to **make camp** (skip a round's
  movement while standing on it), you can try again.

Example landmark questions:

| Explorer | Place | Beginner / Intermediate | Advanced / Expert |
|---|---|---|---|
| Polo | Acre | "Which Mongol ruler were the Polos travelling to meet?" (Kublai Khan) | "Who was elected pope while the Polos were in Acre and sent letters with them to Kublai?" (Gregory X) |
| Polo | Shangdu | "Which English poet made 'Xanadu' famous?" (Coleridge) | "Shangdu was Kublai's *summer* capital. What was his main capital called?" (Khanbaliq / Dadu) |
| Magellan | Puerto San Julián | "How many ships did the expedition leave Spain with?" (five) | "Which captain was marooned after the San Julián mutiny?" (Juan de Cartagena) |
| Magellan | Sanlúcar | "Which ship completed the voyage around the world?" (*Victoria*) | "Whose day-by-day chronicle is our main source for the voyage?" (Antonio Pigafetta) |
| Livingstone | Victoria Falls | "Who was the waterfall named after?" (Queen Victoria) | "What does the local name *Mosi-oa-Tunya* mean?" ("the smoke that thunders") |
| Livingstone | Linyanti | "What was Livingstone's profession besides missionary?" (doctor) | "Which Makololo chief supplied the porters for the crossing?" (Sekeletu) |
| Amundsen | Framheim | "Which animals pulled Amundsen's sledges?" (dogs) | "Which ice shelf was Framheim built on?" (the Ross Ice Shelf) |
| Amundsen | South Pole | "Whose British expedition reached the Pole after Amundsen?" (Robert Falcon Scott) | "What did Amundsen name his camp at the Pole?" (Polheim) |

**Landmark nodes** (★, not checkpoints) offer the same kind of question as an *optional*
side activity. A correct answer gives you an item draw.

### 4.2 Rewards (choose one after a successful Landmark Challenge)

| Reward | Effect |
|---|---|
| **Restore a life** | +1 life (up to the maximum of 4) |
| **Forced march** | +2 steps immediately |
| **Supplies** | Draw an item |
| **Shelter** | A shield token: the next time you would be caught, you aren't, and the threat is pushed back 2 steps |

### 4.3 Items

Your pack holds up to 3 items. You get items from landmarks, rewards, trading posts, and
**streaks** (3 correct answers in a row = 1 item draw).

| Item | Timing | Effect |
|---|---|---|
| **Spyglass** | before answering | Multiple choice: remove 2 wrong answers. Map click: highlight the right sub-region. |
| **Compass** | after a wrong answer | Retry with a new question of the same tier |
| **Local Guide** | phase 1 | Choose the question *type* for this round |
| **Provisions** | phase 4 | Your threat doesn't move this round |
| **Medicine Chest** | any time | +1 life |
| **Rumour** *(rival)* | phase 1, on an opponent | Their question comes from one band higher; the reward is unchanged |
| **Spooked Porters** *(rival)* | phase 4, on an opponent | Their threat +1 |

Rival items come mainly from Crossroads wins (§5.4). A Shelter shield also blocks one rival
item. Rival items can be switched off in the game setup (for example, for classrooms or
young children).

### 4.4 Threat mechanics

- **Start:** the threat starts **3 steps behind** your starting node, off the board.
- **Movement each round:** **base 1 step** + **penalties** (wrong answers, §1.3) +
  **terrain modifier** (explorer-specific, §2) − **effects** (Provisions, abilities).
- **Danger meter:** each player card shows the distance to the threat: *Safe* (5+),
  *Uneasy* (3–4), *Danger* (1–2).
- **Caught** (the threat reaches or passes you):
  1. Lose 1 life (Shelter or Physician can prevent this).
  2. Return to your **latest unlocked checkpoint**.
  3. The threat resets to 3 steps behind that checkpoint.
- **Out of lives — "Stranded":** there is no elimination. You return to the checkpoint at the
  **start of your current act**, lose all items, and continue with 1 life.
- **Second Wind (catch-up rule):** the player furthest behind (in steps) gets +1 step on any
  correct answer.

---

## 5. Multiplayer rules

### 5.1 Setup

- **1–4 players.** Each chooses a different explorer. Solo play is a race against your own
  threat, with a "beat your best round count" goal.
- All routes are drawn on one **shared world map**, so everyone can see each other's
  progress (as a percentage of the route) at all times.
- Setup options:
  - table level, with per-player overrides (§3.3)
  - per-player assist options
  - route length (short or full)
  - whether rival items are on

### 5.2 Desktop hot-seat (MVP)

- One computer and one screen. Each phase asks the players one at a time.
- **Turn order rotates** every round, so no player always chooses first.
- Each player gets a *different* question from their own region, so watching someone else's
  turn never gives away your answer.
- The threats move and all tokens animate together at the end of the round.

### 5.3 Online multiplayer (after the MVP; the architecture is ready for it from the start)

- Each player uses their own computer. One player creates a game and shares a **room code**
  or link.
- Phases 1 and 2 happen **simultaneously**. Tier choices stay hidden until everyone has
  locked in, and all players answer at the same time. Then everyone watches the same round
  resolve on their own map.
- The **server decides everything**: it checks answers, runs the timers, and orders buzzes.
  Clients never receive the correct answer before they have answered.
- If a player disconnects, they can rejoin the game in progress. A player who misses a
  timer counts as having given a wrong answer at Scout tier.

### 5.4 Crossroads Challenges (direct competition)

Every 3rd round, one **shared question** is asked to everyone. It is taken from the region
of whoever is currently last, rotating so every region comes up.

- The question is set to the **lowest level at the table**. To keep a mixed table fair,
  players at a lower level can **buzz earlier**: they get a 1.5-second head start for each
  level they are below the highest-level player.
- Players **buzz in** (a key per player in hot-seat, a button online), then answer within
  10 seconds.
- **1st correct:** +2 steps and a rival item (or a normal item, if rival items are off).
  **2nd correct:** +1 step. **Wrong buzz:** your threat +1, and the question stays open for
  the others.

---

## 6. Visual interface concept

### 6.1 Art direction: "the explorer's atlas"

- **Map:** an aged-parchment world map on a **Natural Earth** projection. It uses sepia
  coastlines, hatched mountain ranges, wavy sea lines, **portolan rhumb lines** fanning from
  compass roses, a decorative title cartouche, and a few small sea monsters in the empty
  oceans.
- **Antarctica:** the projection distorts the poles, so Amundsen's Act III is shown in a
  circular **polar inset** that the map zooms into.
- **Ink colours for players:** crimson (Polo), indigo (Magellan), verdigris green
  (Livingstone), ochre (Amundsen). Each also has its own line pattern. Routes are dashed ink
  lines that turn solid where the player has travelled. Charted countries are tinted in that
  player's ink.
- **Historical layer:** each node shows its date, written as a small note in the margin. A
  timeline ribbon under the map shows where each expedition is in its own real calendar
  ("Polo: 1273 · Magellan: Nov 1520 …").
- **Typography:** a display serif and a readable text serif, both with full **Latin
  Extended** (and ideally Cyrillic and Greek) coverage so other languages are possible later
  (e.g., *EB Garamond* or *Cormorant Garamond*).
- **Threats** (animated SVG): a swirling ochre sandstorm, a red-sailed caravel, a sickly
  green miasma cloud, and a creeping white wall of blizzard.
- **Controls:** wax seals for the tier choice, a brass compass for the timer, and parchment
  "letters" for question cards.

### 6.2 Screen layout (desktop, landscape)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  ⚜ GREAT EXPEDITIONS ⚜     Act II · Round 9      ⚔ Crossroads in 2 rounds    │
├───────────────┬──────────────────────────────────────────────────────────────┤
│ PLAYER CARDS  │                                                              │
│ ┌───────────┐ │          (shared world map: routes, dated nodes, tokens,     │
│ │ ◉ M. Polo │ │           threats, charted countries in ink colours)         │
│ │ Advanced  │ │                                                              │
│ │ ♥♥♥  ▣▣□  │ │   zooms smoothly to the active player's region during        │
│ │ ███████░  │ │   their challenge; Antarctic inset in bottom-right cartouche │
│ │ Sandstorm │ │                                                              │
│ │ ▓▓░ Uneasy│ │                                                              │
│ └───────────┘ │──────────────────────────────────────────────────────────────│
│  (× 4 players)│  TIMELINE  Polo 1273 ▸ · Magellan Nov 1520 ▸ · …             │
├───────────────┴──────────────────────────────────────────────────────────────┤
│  CHALLENGE LETTER:  "Ashgabat is a capital city. Click its country."         │
│  [ Scout · 1 ]  [ Navigator · 2 ]  [ Pathfinder · 3 ]     ⏱ 25 s   🎒 items │
└──────────────────────────────────────────────────────────────────────────────┘
```

Each player card shows: portrait, level badge, lives, the item pack, a route progress bar,
the threat's name, a danger meter, and whether the explorer's ability is still available
this act.

### 6.3 Feedback moments

- **Correct:** the token moves node by node with a quill-scratch sound, and the country is
  inked in.
- **Near miss:** the correct and clicked places are outlined together, with "So close: that
  was Tajikistan's neighbour."
- **Wrong:** the correct answer is shown with a one-line fact, *then* the threat lurches
  forward.
- **Caught:** the threat sweeps over the token, a candle goes out, and the camera pans back
  to the checkpoint.
- **Checkpoint unlocked:** a wax seal is stamped onto the node, with a one-line historical
  note ("Victoria Falls, 16 Nov 1855: Livingstone first sees the falls").

### 6.4 Accessibility

- The design must not depend on colour alone. Each player's ink also has its own pattern.
- Text needs strong contrast against the parchment, and there is an option to remove the
  parchment texture.
- Timers can be lengthened or switched off per player.
- Map clicks have generous hit zones, and the map can be zoomed.
- Every map-click question has a keyboard alternative: Tab cycles through the candidate
  regions in the current view.

---

## 7. MVP scope

**Goal:** a short, fully playable **desktop hot-seat** game for 1–4 players. It tests the
core loop (levels, tiers, geography questions, moving, the threat chasing you, checkpoints,
and the race between players). It is built on the architecture described in §8, so online
play and other languages can be added later without rewriting the game.

### 7.1 In the MVP

| Area | Included |
|---|---|
| Platform | Single-page web app; desktop browser; SVG map; no backend |
| Explorers | **All 4 historical expeditions**, with short routes (24 steps, 3 acts, 3 checkpoints + finish, **1 historical fork each**) |
| Rounds | All five phases, including Crossroads (keyboard buzz-in) |
| Levels | **All 4 levels**, table-wide with per-player overrides, and level changes between acts |
| Tiers | Scout / Navigator / Pathfinder, plus near-miss scoring |
| Question types | All seven, including Expedition Riddles. For Expert, historical geography has a smaller pool of questions. |
| Threats | All 4, with terrain and behaviour rules; danger meter; catching, respawn, Stranded |
| Checkpoints | Landmark Challenges at every level, unlocking, camping, the 4 rewards |
| Items | Spyglass, Compass, Provisions, Medicine Chest, Rumour (rival items can be switched off) |
| History | Dated nodes, History notes panel, "What really happened" in the journal |
| Learning | Charting, revisits, end-of-game journal |
| Language | English only, but **all interface text and question wording is in localisation files from the start** (§9) |
| Visuals | Vintage map style, route and node symbols, animated tokens and threats, polar inset |

### 7.2 Content budget for the MVP

- **Generated from data** (one country dataset with ISO codes, capitals, flags,
  per-country ratings and minimum levels): country-location, capital and flag questions for
  about 120 countries along the 4 routes. This gives several hundred questions across all
  four levels with little writing effort.
- **Hand-written, per route:**
  - about 35 feature map-clicks
  - about 25 geography-fact questions
  - about 10 historical-geography questions (Expert)
  - about 8 Expedition Riddles, each in 2 level versions
  - about 8 Landmark Challenges, each in 2 level versions
- **Shared:** about 25 Crossroads questions.
- **In total, roughly 470 hand-written items.** Fact-checking and source references are not
  part of the MVP.
- **Map data:** Natural Earth 1:50m countries, plus selected rivers, lakes, mountain ranges
  and historical regions (simplified, with hit zones), and an Antarctic inset.

### 7.3 Left for after the MVP

- **Online multiplayer:** server, lobby with room codes, reconnecting, simultaneous hidden
  choices
- **Historical fact-checking and source attribution** for all history content (nodes,
  landmark challenges, historical-geography questions, History notes)
- More languages, in the order Slovak, Czech, German, Spanish, French (§9)
- Full-length routes (36 steps, a second fork where history provides one), trading posts,
  more items
- Recalibrating question ratings from real answer data
- More expeditions, each opening a new region: for example Ibn Battuta, Zheng He's voyages,
  Lewis & Clark, Abel Tasman, and Amundsen's own Northwest Passage voyage (1903–06)
- Classroom mode (the teacher chooses regions and levels; progress reports)

### 7.4 What playtests should measure

| Metric | Target |
|---|---|
| Length of a 4-player MVP game | 25–35 min |
| Tier choices across all rounds | No tier above 55% (all three should be used) |
| Catches per player per game | 1–2 on average |
| Win rate per explorer | 22–28% |
| Win rate at mixed-level tables | No level wins more than 35% of the games it appears in |
| Final gap between 1st and last place | Usually within 6 steps |
| Players saying they "learned a new place" / "learned something about the expedition" | ≥ 80% / ≥ 70% |

---

## 8. Architecture for hot-seat now and online later

The key decision is that **game rules live in a pure, deterministic engine that knows
nothing about screens, players' devices or networks**. Hot-seat and online play are just two
ways of delivering player commands to the same engine.

```
          ┌──────────────── UI (SVG map, cards, animations) ────────────────┐
          │      renders a PlayerView · sends Commands · plays Events       │
          └───────────────▲─────────────────────────────┬───────────────────┘
                          │ PlayerView + Events         │ Commands
          ┌───────────────┴─────────────────────────────▼───────────────────┐
          │                 Session (transport adapter)                     │
          │   LocalSession: in-browser (MVP hot-seat)                       │
          │   RemoteSession: WebSocket client (online, later)               │
          └───────────────▲─────────────────────────────┬───────────────────┘
                          │                             │
          ┌───────────────┴─────────────────────────────▼───────────────────┐
          │  Game Engine (pure TypeScript, no DOM, no network)              │
          │  (state, command) → (new state, events) · seeded random numbers │
          │  viewFor(state, playerId) → PlayerView (hides secret data)      │
          └───────────────────────────────▲─────────────────────────────────┘
                                          │ reads
                       Content packs: routes, questions, strings (JSON, versioned)
```

Principles:

1. **Commands in, events out.** Every player action is a serialisable command, such as
   `ChooseTier`, `SubmitAnswer`, `UseItem` or `Buzz`. The engine validates it and returns
   events, such as `PlayerMoved`, `ThreatAdvanced` or `PlayerCaught`. The UI animates the
   events; it never changes the game state itself.
2. **Every phase collects choices, then resolves them** (§1.2). Hot-seat fills in the
   choices one player at a time; online fills them in all at once. The engine treats both
   the same way.
3. **Deterministic and seeded.** All randomness (question draws, item draws) comes from a
   seeded random-number generator stored in the game state. The same commands always give
   the same game. This lets us replay games, write tests, debug, and later check games on
   the server.
4. **Player views from day one.** The UI only ever sees `viewFor(playerId)`. It never sees
   the correct answer to an open question or other players' hidden choices. In hot-seat,
   the session shows the active player's view. Online, the server sends each client only
   their own view, so nobody can cheat.
5. **Timers belong to the session.** Locally they use the browser clock; online the server
   runs them. The engine only receives "time expired" commands.
6. **Hit-testing is shared.** A map click is sent as a projected coordinate or a feature ID.
   The engine checks it against the answer's feature IDs and near-miss rings, so the result
   is the same everywhere.
7. **Online later = add a server, not rewrite the game.** A small Node server runs the same
   engine, keeps the authoritative state for each room, and adds a lobby, reconnecting
   (by replaying events) and buzz ordering by server receipt time.

### 8.1 Tech stack

| Part | Choice |
|---|---|
| Language and build | **TypeScript**, **Vite** |
| UI | **React**. The map is rendered as React SVG components (countries, routes, nodes, tokens), so map elements are ordinary components with props and event handlers. |
| UI state | A small store (e.g., Zustand) that holds the current `PlayerView` from the session. It holds no game rules. |
| Map preparation | d3-geo + TopoJSON in a **build-time script** that projects Natural Earth data into ready-made SVG paths, hit zones and near-miss rings. The browser doesn't project anything while playing. |
| Localisation | An ICU MessageFormat library (e.g., FormatJS / react-intl) |
| Tests | Vitest for the engine and content checks; Playwright for a few end-to-end smoke tests |
| Online (later) | A Node server with WebSockets that imports the same `engine` module |

### 8.2 Modules

Gameplay rules, map data, questions and historical content are kept in separate modules.
Content is data, not code.

```
src/
  engine/          game rules: state, commands, events, seeded random numbers
                   (pure TypeScript: no React, no DOM, no network)
  session/         LocalSession (hot-seat); RemoteSession later
  ui/              React components: map, player cards, challenge letter, journal
  i18n/            loading messages, ICU formatting, switching language
content/
  map/             generated SVG geometry, feature IDs, hit zones, near-miss rings
  questions/       language-neutral question records + generators (capitals, flags, locate)
  history/         expeditions: routes, nodes, dates, forks, landmark challenges, history notes
  locales/
    en/            ui.json · questions.json · history.json · places.json
    sk/ …          (added later, same files)
tools/             build scripts: map generation, content checks, missing-translation report
```

Dependency rules:

- `engine` reads content only through typed loaders. It never imports `ui`, `session` or
  `i18n`, and it never handles display text, only message keys.
- `ui` depends on `session` and `i18n`. It never changes game state directly.
- `content` has no code at all; a content check in `tools/` validates it (IDs exist, every
  question has an English string, routes are connected).
- Adding a language means adding a `content/locales/<lang>/` folder. Adding an expedition
  means adding data to `content/history/` and `content/questions/`. Neither requires
  changing the engine.

---

## 9. Localisation

English is the only MVP language, but nothing in the code or content assumes English.

- **No text in code or SVG.** Every UI string goes through a message catalogue (ICU
  MessageFormat, so plurals and grammatical gender work in other languages). Map labels are
  overlays drawn from the catalogue, never baked into the map artwork.
- **Content is separate from wording.** A question record holds language-neutral data:
  type, answer feature IDs, distractor IDs, rating, minimum level, sources. Its wording lives
  in per-language text files that use the same key. Answers are checked **by ID**, never by
  comparing text, which is one reason there are no typed answers.
- **Generated questions use localised data.** Country names and capitals come from CLDR
  (Unicode's locale data) or a translated dataset, so generated questions work in any
  language as soon as the templates are translated.
- **Historical names** (Kristiania, Khanbaliq, Quelimane, Santa Lucía bay) are stored with a
  name for each language plus the modern name. Names often differ between languages (Venice
  is "Benátky" in Slovak and Czech and "Venedig" in German).
- **Difficulty can differ by language.** How well-known a place is depends on where the
  player lives (Central European players know Central Europe better). Ratings can be
  overridden per language, and fall back to the global rating.
- **The layout allows for longer text** (+35%) in buttons and cards, uses fonts with broad
  script coverage (§6.1), and is direction-aware, so right-to-left scripts are possible
  later.
- **Translation process:** content packs are versioned; missing strings fall back to
  English and are reported. Each language gets a native-speaker review of its history
  content.
- **Language roadmap:** English (MVP) → **Slovak** → Czech → German → Spanish → French.
  All of these use the Latin alphabet, so the fonts must cover Latin Extended-A, including
  the Slovak and Czech letters ľ ĺ ŕ ť ď ň ô ä ř ů ě. EB Garamond and Cormorant Garamond both
  do. Slovak and Czech have grammatical cases ("v Benátkach", "do Benátok"), so templates
  that put a place name inside a sentence must use ICU `select` or a separate string per
  question, never string concatenation.

---

## Appendix A — Question record (sketch)

```json
{
  "id": "polo-ca-0142",
  "route": "polo",
  "region": "central-asia",
  "type": "capital_to_locate",
  "rating": 5,
  "minLevel": "intermediate",
  "answer": { "kind": "country", "iso": "TKM" },
  "nearMiss": ["UZB", "IRN", "AFG", "KAZ"],
  "text": "q.polo-ca-0142",
  "fact": "f.polo-ca-0142",
  "revisitAs": ["locate_country", "flag_to_country"],
  "sources": []
}
```

```jsonc
// locales/en/questions.json
{
  "q.polo-ca-0142": "{capital} is a capital city. Click its country.",
  "f.polo-ca-0142": "Ashgabat holds a world record for the most white-marble buildings."
}
```

## Appendix B — Decisions made

| Topic | Decision |
|---|---|
| Platform | Desktop hot-seat for the MVP; online multiplayer with each player on their own computer added later on the same engine (§8). No TV + phones setup. |
| Audience | Broad: from schoolchildren to geography enthusiasts. Four levels (Beginner, Intermediate, Advanced, Expert), set for the whole table or per player, adjustable between acts (§3.3–3.4). |
| Language | English for the MVP, with all interface text and questions stored outside the code from the start. Then Slovak, Czech, German, Spanish, French (§9). |
| Tech stack | TypeScript + Vite + React, with separate modules for engine, map data, questions, history content and localisation (§8). |
| Fact-checking | Not part of the MVP. Historical verification and source attribution come in a later phase (§7.3). |
| History | One documented expedition per explorer. Simplifications are labelled, and fork alternatives are real routes of the period (§2.0). |

## Appendix C — Next step

All design decisions for the MVP are made. The next step is an implementation plan: set up
the project and modules, build the engine with tests, generate the map, then build the
hot-seat UI and the first content pack.
