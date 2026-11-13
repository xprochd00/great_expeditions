# Great Expeditions — Game Design Proposal

> A competitive geography adventure for 1–4 players. Each player becomes a famous explorer,
> races along a historically inspired route across a vintage world map, and is chased by a
> threat. You move by answering geography questions correctly, not by rolling dice.

**Design pillars**

1. **Geography moves you.** Every step forward comes from a geography answer. History and
   culture never move you directly. They give perks: lives, items, checkpoints, protection.
2. **Knowledge, not eyesight.** The map has no labels, and no question can be answered just
   by looking at it.
3. **Risk is your choice.** Each turn you choose how hard a question to take. Harder
   questions move you further but cost more when you get them wrong.
4. **Pressure from behind, rivals ahead.** The threat behind you punishes playing it safe,
   and the other explorers punish playing too slowly.
5. **You leave knowing more.** The game brings back what you got wrong, and after each game
   you get a personal atlas of what you learned.

---

## 1. Core gameplay loop and movement rules

### 1.1 The board

Each explorer has their own **route**: a chain of **nodes** drawn on the shared world map.
Routes are measured in **steps** (nodes), not kilometres, so every explorer has the same
number of steps to the finish no matter how far apart the places are on the map.

| | Full game | MVP |
|---|---|---|
| Steps per route | 36 | 24 |
| Acts (difficulty phases) | 3 × 12 steps | 3 × 8 steps |
| Checkpoints (incl. start) | 5 + finish | 3 + finish |
| Route forks | 2–3 | 1 |
| Target length (4 players) | 45–60 min | 25–35 min |

Node types (each has its own map symbol):

| Node | Symbol | Effect |
|---|---|---|
| Path | small ink dot | Nothing special |
| **Checkpoint** | fort / flag | Landmark challenge; becomes your respawn point when unlocked (§4) |
| **Landmark** | star | Optional culture bonus question for an item |
| **Hazard** | skull / storm glyph | If your move ends here, your next challenge must be Navigator or Pathfinder |
| **Discovery** | compass rose | Your next challenge is an Expedition Riddle (§3.4) |
| **Trading post** | anchor / coin | Swap one item for a new random one (full game) |
| **Fork** | split arrow | Choose your branch (§1.4) |

### 1.2 One round

Every player takes part in every round. Online, the challenge phase happens simultaneously.
On a shared screen, players answer one after another within the round.

```
┌─ 1. CHART YOUR COURSE ─────────────────────────────────────────────┐
│  Each player secretly picks a difficulty tier (and a branch at a   │
│  fork). Items that say "before the challenge" are played now.      │
├─ 2. CHALLENGE ─────────────────────────────────────────────────────┤
│  Each player answers one geography question from their CURRENT     │
│  region, at the tier they picked. There is a time limit.           │
├─ 3. MARCH ─────────────────────────────────────────────────────────┤
│  Correct: move forward. Near miss: partial move. Wrong: stay.      │
│  Passing a checkpoint or landmark triggers its bonus challenge.    │
├─ 4. THE THREAT ADVANCES ───────────────────────────────────────────┤
│  Each threat moves its base step plus any penalties and terrain    │
│  modifiers. If it reaches or passes the explorer: CAUGHT (§4.4).   │
├─ 5. CROSSROADS (every 3rd round) ──────────────────────────────────┤
│  One shared question that all players race to answer (§5.3).       │
└────────────────────────────────────────────────────────────────────┘
```

### 1.3 Difficulty tiers and movement

| Tier | Correct | Near miss* | Wrong | Time limit |
|---|---|---|---|---|
| **Scout** (easy) | +1 step | 0 steps, no penalty | threat +1 | 20 s |
| **Navigator** (medium) | +2 steps | +1 step, no penalty | threat +1 | 25 s |
| **Pathfinder** (hard) | +3 steps | +1 step, no penalty | threat +2 | 30 s |

\* **Near miss** applies to map-click questions only. You clicked a country that borders the
correct one, or a feature within a small tolerance of it. It rewards being "almost right",
which matters in geography, and it makes guessing on the map less harsh than guessing on
multiple choice.

**Why these numbers.** The threat moves 1 step every round, so:

- A correct **Scout** answer only keeps you level with the threat. It is safe, but it won't
  win a race.
- A correct **Navigator** answer gains 1 step on the threat. A correct **Pathfinder** answer
  gains 2.
- Expected progress per round with typical accuracy (90% / 70% / 45%) is 0.9 / 1.4 / 1.35
  steps. Navigator is the default good choice. Pathfinder is the best choice once you know a
  region (at 60% accuracy it is worth 1.8). Scout is for escaping when the threat is one
  step behind you.

This means **the best tier depends on how well you know the region you're in**. That is the
core decision of the game, and it rewards real knowledge.

### 1.4 Route forks

Each fork offers two branches:

- **Safe road:** 2–3 more steps, but it has a landmark or trading post, and the threat moves
  normally.
- **Perilous shortcut:** fewer steps, but it has hazard nodes (forcing Navigator or harder)
  and terrain that speeds up that explorer's threat.

Players pick a branch in phase 1, so opponents can see who is gambling.

### 1.5 Winning

1. When you reach the **final node**, you face the **Final Expedition Challenge**: an
   Expedition Riddle about your destination region.
2. If you solve it, **you win**. If not, you stay on the final node, the threat keeps coming,
   and you try again next round.
3. If several players finish in the same round, the tie-break is (a) the fewest clues used
   on the final riddle, then (b) the most lives left, then (c) the most regions charted.

After the game, everyone gets a **Renown** score (steps, checkpoints unlocked, regions
charted, riddles solved). Players who didn't win still have a personal result to compare.

---

## 2. The four explorers and their routes

Each explorer has a **route**, a **pursuing threat** with its own terrain behaviour, and a
**signature ability**. All threats average about 1 step per round, so they are equally
dangerous overall, but each one feels different. The routes go through very different
regions, so each explorer leads to different geography questions.

Routes follow the real expeditions closely. Where the history doesn't fit a single race
track, we simplify, and these places are marked *(liberty)*.

### 2.1 Marco Polo — "The Silk Road" (1271–1275)

*Venice → Khanbaliq (Beijing)*

| Act | Regions (question pools) | Key nodes |
|---|---|---|
| I | Mediterranean & Levant · Anatolia & Caucasus | **Venice** (start) → Acre ★ → Ayas → Sivas → **Tabriz** (CP) |
| II | Persia & Persian Gulf · Central Asia | Kerman → **Hormuz** (CP, trading post) → Balkh → Badakhshan → **Kashgar** (CP) |
| III | Tarim Basin & Western China · Mongolia & Northern China | Khotan → Lop Nur ⚠ → **Dunhuang** (CP) → Ganzhou → Shangdu (Xanadu) ★ → **Khanbaliq** (finish) |

Forks:

- **Tabriz:** *Hormuz road* (safe, historical, trading post) or *crossing the Dasht-e Kavir*
  (shortcut, desert hazards).
- **Badakhshan:** *Pamir crossing, "Roof of the World"* (short, mountain hazards) or
  *northern road via Samarkand* ★ (longer, Registan landmark) *(liberty)*.
- **Kashgar:** *southern Tarim via Khotan* (historical) or *northern Tarim via Kucha and
  Turpan*.

**Threat — The Great Sandstorm.** +1 extra on desert nodes (Kavir, Taklamakan, Lop, Gobi).
It does not take its base step on mountain nodes.

**Ability — Golden Paiza (the Khan's safe-conduct tablet).** Once per act, cancel a wrong
answer's penalty: the threat doesn't advance and you still move 1 step. Polo also chooses
from 2 items at trading posts instead of drawing 1.

### 2.2 Ferdinand Magellan — "Around the World" (1519–1522)

*Sanlúcar de Barrameda → around the globe → Sanlúcar de Barrameda*

| Act | Regions | Key nodes |
|---|---|---|
| I | Iberia & Macaronesia · Atlantic & West Africa · Brazil | **Sanlúcar** (start) → Tenerife → Cape Verde → Atlantic crossing → **Rio de Janeiro** (CP) |
| II | Río de la Plata & Patagonia · Pacific Ocean | Río de la Plata → **Puerto San Julián** (CP, mutiny ★) → Strait of Magellan ⚠ → Pacific crossing ⚠⚠ → Guam |
| III | Philippines & Maritime SE Asia · Indian Ocean & Southern Africa | Cebu → **Mactan** (CP ★) → Brunei → **Tidore** (CP, Spice Islands) → Timor → Cape of Good Hope ⚠ → Cape Verde → **Sanlúcar** (finish) |

Story beat: at Mactan, where Magellan was killed, the token changes to **Juan Sebastián
Elcano**, who completed the voyage. This is a memorable history moment that doesn't need its
own rule.

Forks:

- **Atlantic:** *follow the African coast* (safe, more West African questions) or *direct
  crossing* (shortcut through Portuguese waters).
- **Return:** *through Portuguese-controlled ports* (resupply, but the Fleet speeds up) or
  *the open Indian Ocean* (shortcut, scurvy hazards).

**Threat — The Portuguese Fleet.** Historically, Portugal sent ships to intercept the
expedition. +1 extra in "Portuguese waters" (African Atlantic, Indian Ocean). It stops
completely in the Pacific, but every Pacific node is a hazard node (scurvy and thirst).

**Ability — Trade Winds.** Once per act, declare it *before* answering: a correct answer
moves you double. A wrong answer adds +1 threat on top of the normal penalty.

### 2.3 David Livingstone — "Into the Heart of Africa" (1849–1871)

*Cape Town → Ujiji (Lake Tanganyika)*

This route combines several of Livingstone's journeys into one *(liberty)*.

| Act | Regions | Key nodes |
|---|---|---|
| I | Southern Africa · Kalahari & Okavango | **Cape Town** (start) → Kuruman → Kolobeng → Lake Ngami ★ → **Linyanti** (CP) |
| II | Angola & Congo Basin · Zambezi Valley | (fork) → **Victoria Falls / Mosi-oa-Tunya** (CP ★) → Tete → Cabora Bassa rapids ⚠ |
| III | Mozambique coast & Zanzibar · African Great Lakes | Shire Highlands → **Lake Malawi** (CP) → Rovuma → Lake Tanganyika → **Ujiji** (finish, "Dr. Livingstone, I presume?") |

Forks:

- **Linyanti:** *the trek west to Luanda and back* (historical 1854; long, but it reaches the
  coast and a trading post) or *straight down the Zambezi* (shortcut, river and swamp
  terrain).
- **Tete:** *the coast via Quelimane and Zanzibar* (resupply, Stone Town landmark ★) or
  *inland through the Shire Highlands* (shortcut).

**Threat — The Fever (malaria).** +1 extra on river, lake and swamp nodes. It does not take
its base step on highland and Kalahari nodes. This links the threat to real geography:
players learn where the wet lowlands are.

**Ability — Physician.** The first time in each act that you would lose a life, you don't.
You are still sent back to your checkpoint. Medicine Chests restore 2 lives for Livingstone
instead of 1.

### 2.4 Roald Amundsen — "Both Ends of the Earth" (1903–1911)

*Kristiania (Oslo) → Northwest Passage → South Pole*

| Act | Regions | Key nodes |
|---|---|---|
| I | Scandinavia & North Atlantic · Greenland & the Canadian Arctic | **Kristiania** (start) → Tromsø → Godhavn (Greenland) → Lancaster Sound → **Gjøa Haven** (CP ★) |
| II | Arctic Canada & Alaska · Atlantic voyage south | Herschel Island → **Nome** (CP) → *"Homeward"* chapter jump → Kristiania → **Madeira** (CP ★, "Turn south!") |
| III | Southern Ocean & Southern Hemisphere · Antarctica | South Atlantic ⚠ → **Framheim, Bay of Whales** (CP) → 80°S depot → Axel Heiberg Glacier ⚠ → Polar Plateau ⚠ → **South Pole** (finish) |

The jump from Nome to Kristiania is free: you move straight on to the next step *(liberty)*.
Antarctica has no countries, so Act III draws questions from a **Southern Hemisphere** pool
(Argentina, Chile, New Zealand, Australia, South Africa, sub-Antarctic islands), plus polar
features such as ice shelves, seas, ranges and research-station nations.

Forks:

- **Northwest Passage:** *the shallow Rae and Simpson straits* (Gjøa's real route, safe) or
  *McClintock Channel* (shortcut, pack-ice hazards).
- **Antarctica:** ***Beardmore Glacier*** (Shackleton's known route, used later by Scott;
  safe and long) or ***Axel Heiberg Glacier*** (Amundsen's unknown shortcut). This is the
  real choice that won the race to the Pole.

**Threat — The Closing Ice.** It doesn't move steadily. It freezes in place for 2 rounds,
then surges 3 steps on the 3rd round ("freeze-up"). The surge is shown in advance, so
Amundsen's player plans around it.

**Ability — Depot Laying.** After a correct answer, you may store up to 1 of the steps
earned in a supply depot (holding up to 3 steps) instead of moving them. You can spend
depot steps at any time, including right before the threat moves, to escape a surge. This
is based on how Amundsen actually won.

### 2.5 Balance notes

- Regional difficulty is handled by **per-question ratings** (§3.3), not by region. A
  Scout question about Central Asia is as easy as a Scout question about Western Europe.
  Players who know Asia are not punished for picking Polo.
- Threats are tuned so each averages 1.0 ± 0.1 steps per round over a typical route.
- Abilities can each be used once per act, or are passive, so they can be tuned
  independently in playtesting. Track win rate per explorer and aim for 22–28% in 4-player
  games.

---

## 3. Question system and difficulty progression

### 3.1 The "no free answers" rules

Every question must pass these authoring rules:

1. **Unlabelled map.** The map has no country, city or feature names. A name appears only
   after the place has been asked about and answered ("charted").
2. **Visibility test.** If someone who knows no geography could answer by looking at the
   map ("click the largest island", "which country is on the coast?"), the question is
   rejected or rewritten.
3. **Map clicks need a busy viewport.** The map zooms to the region, but the view always
   includes at least about 12 candidate countries or features, so the zoom doesn't give the
   answer away.
4. **Plausible distractors.** Multiple-choice wrong answers come from the same region or
   category: neighbouring countries, former capitals, largest-but-not-capital cities,
   similar-looking flags.
5. **Region focus.** 70% of questions come from your current region, 20% from the *next*
   region on your route (a preview), and 10% from a route-wide or global pool.
6. **No repeats.** No country or feature is the subject of more than 2 of one player's
   questions in a game, unless it is a deliberate **revisit** (§3.5).

### 3.2 Question types

| Type | Formats | Example (region) |
|---|---|---|
| **Map identification** | Click a country, island, mountain range, river, lake, sea, strait or desert | "Click **Kyrgyzstan**." (Central Asia) · "Click the **Amu Darya**." · "Click **Mindanao**." · "Click the **Drakensberg**." |
| **Capitals** | Capital → country (multiple choice, or click it on the map); country → capital (multiple choice) | "**Ashgabat** is a capital. Click its country." · "Capital of **Malawi**?" Lilongwe / Blantyre / Zomba / Mzuzu (Zomba was the former capital, which makes a good distractor) |
| **Flags** | Flag → country (multiple choice); flag → click the country; country → choose its flag from 4 similar ones | Show the flag of Kazakhstan → click it on the map · "Which is the flag of **Chad**?" (alongside Romania, Andorra, Moldova) |
| **Geographical knowledge** | Facts that cannot be read off a map: river systems, highest and deepest, landlocked status, borders, sources and mouths, climate | "Besides the Syr Darya, which river once fed the Aral Sea?" · "Which of these is **not** landlocked: Malawi, Zambia, Tanzania, Zimbabwe?" · "Which river forms most of the border between **Zambia and Zimbabwe**?" |
| **Combined challenges** | Use clues to identify a place, then click it | "Its capital is Montevideo's neighbour across the Río de la Plata. Click the country." (Argentina) · "This country contains the source of the Blue Nile. Click it." (Ethiopia) |
| **Expedition Riddle** (special) | Clues revealed one at a time, answered by clicking the map (§3.4) | — |

**Hit zones for map clicks.** Each country's clickable area is its polygon. Microstates and
small islands get a larger circular target. Rivers and mountain ranges get a buffered hit
zone. A "near-miss ring" (neighbouring countries, or a wider buffer around features) decides
when a near miss applies.

### 3.3 Difficulty ratings and progression

Every question has a **difficulty rating from 1 to 10**. At first, writers set the rating
from how well-known the subject is (country size, how often it appears in the media and
schools, how distinctive its flag is). Later, it is recalibrated from real answer rates.

The chosen **tier** and the current **act** together decide the rating band a question is
drawn from:

| | Scout | Navigator | Pathfinder |
|---|---|---|---|
| **Act I** | 1–2 | 3–4 | 5–6 |
| **Act II** | 2–3 | 4–5 | 6–7 |
| **Act III** | 3–4 | 5–7 | 7–9 |

- A **game difficulty** setting (Novice / Explorer / Cartographer) shifts every band by
  −1 / 0 / +1. This lets families, classrooms and geography enthusiasts all play.
- The question **type** also scales with the tier. Scout questions are mostly multiple
  choice. Navigator mixes in map clicks. Pathfinder leans towards map clicks of features
  (rivers, ranges), flags → locate, and combined challenges.
- *(Full game)* A hidden per-player skill rating can nudge the band by ±1 within a tier, so
  experts and beginners at the same table both feel challenged.

### 3.4 Expedition Riddles

These are used at Discovery nodes, in the Final Expedition Challenge, and in some Crossroads
rounds. Up to 3 clues are revealed one at a time, and **you may lock in one map click at any
moment**:

| Answered after | Clue 1 | Clue 2 | Clue 3 | Wrong |
|---|---|---|---|---|
| Movement | +4 | +3 | +2 | threat +2 |

Example (Marco Polo, Act II):
1. "I am one of only two *doubly landlocked* countries in the world."
2. "The Amu Darya forms part of my southern border."
3. "Samarkand and Bukhara lie within my borders."
→ *Click Uzbekistan.*

Example (Livingstone, Act III):
1. "My name is often traced to *Maravi*, an old word linked to 'flames'."
2. "A single lake covers about a fifth of my area."
3. "My capital is Lilongwe."
→ *Click Malawi.*

### 3.5 Learning layer

- **Revisits:** if you get a subject wrong, it comes back 3–5 rounds later in a *different
  format*. For example, if you couldn't locate Kyrgyzstan, you later get "Bishkek is the
  capital of…?" A correct revisit earns +1 bonus step.
- **Charting:** every correctly answered country or feature becomes inked in your colour on
  the map and is labelled from then on. Each player builds their own atlas as they play.
- **Explorer's Journal:** after the game, a summary of every question with a one-line fact,
  your accuracy by region, and "places to revisit".

---

## 4. Checkpoints, rewards and threat mechanics

### 4.1 Checkpoints

When you reach or pass a checkpoint, you face a **Landmark Challenge**. This is a bonus
question about **history, culture, famous people, landmarks or local traditions**. Your
remaining steps still count; you don't have to stop at the checkpoint.

- **Correct:** the checkpoint is **unlocked** as your respawn point, **and** you choose 1
  reward (§4.2).
- **Wrong:** you pass the checkpoint but it stays unclaimed, so your respawn point is still
  the previous one. If you later respawn there, or decide to **make camp** (skip a round's
  movement while standing on it), you can try again.

The choice between camping and pressing on without a safety net is one of the game's most
interesting decisions.

Example landmark questions:

| Explorer | Checkpoint | Question |
|---|---|---|
| Polo | Khanbaliq approach | "Which Mongol ruler did Marco Polo serve?" (Kublai Khan) |
| Polo | Samarkand ★ | "What is the name of Samarkand's great square of three madrasas?" (the Registan) |
| Magellan | Mactan | "Who led the expedition home after Magellan's death?" (Elcano) |
| Magellan | Sanlúcar | "How many of the five ships completed the circumnavigation?" (one, the *Victoria*) |
| Livingstone | Zanzibar ★ | "Which spice made Zanzibar famous?" (cloves) |
| Livingstone | Ujiji | "Which journalist found Livingstone at Ujiji in 1871?" (Henry Morton Stanley) |
| Amundsen | Framheim | "What pulled Amundsen's sledges to the Pole?" (dogs) |
| Amundsen | South Pole | "Whose British expedition reached the Pole 34 days after Amundsen?" (Scott) |

**Landmark nodes** (★, not checkpoints) offer the same kind of question as an *optional*
side activity. Answering costs nothing. A correct answer gives you an item draw.

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
| **Rumour** *(rival)* | phase 1, on an opponent | Their question is drawn from one band higher; the reward is unchanged |
| **Spooked Porters** *(rival)* | phase 4, on an opponent | Their threat +1 |

Rival items come mainly from Crossroads wins (§5.3). A Shelter shield also blocks one rival
item.

### 4.4 Threat mechanics

- **Start:** the threat starts **3 steps behind** your starting node, off the board.
- **Movement each round:** **base 1 step** + **penalties** (wrong answers, §1.3) +
  **terrain modifier** (explorer-specific, §2) − **effects** (Provisions, abilities).
- **Danger meter:** each player card shows the distance to the threat: *Safe* (5+),
  *Uneasy* (3–4), *Danger* (1–2). The threat token on the map grows and animates more as it
  gets closer.
- **Caught** (the threat reaches or passes you):
  1. Lose 1 life (Shelter or Physician can prevent this).
  2. Return to your **latest unlocked checkpoint**.
  3. The threat resets to 3 steps behind that checkpoint ("the storm passes").
- **Out of lives — "Stranded":** there is no elimination. You return to the checkpoint at the
  **start of your current act**, lose all items, and continue with 1 life. This is a heavy
  setback that still keeps everyone in the game, and it keeps the story going instead of
  ending it.
- **Second Wind (catch-up rule):** the player furthest behind (in steps) gets +1 step on any
  correct answer. This keeps the race close without punishing the leader.

---

## 5. Multiplayer rules

### 5.1 Setup

- **1–4 players.** Each chooses a different explorer. Solo play is a race against your own
  threat, with a "beat your best round count" goal.
- All routes are drawn on one **shared world map**, so everyone can see each other's
  progress (as a percentage of the route) at all times.
- Choose the game difficulty (Novice / Explorer / Cartographer) and the game length (full or
  short routes).

### 5.2 Play modes

| Mode | How rounds work | Version |
|---|---|---|
| **Shared screen (hot-seat)** | Tier choices are made in turn order, each player answers their own question in turn, then all moves and threats resolve together with one animation | **MVP** |
| **Online / party** | One shared map on a TV or laptop; each player uses their own phone. Tier choices are hidden and made at the same time, and everyone answers at once | Post-MVP |

In both modes, each player gets a *different* question from their own region, so watching
someone else's turn never gives away your answer. It also shows everyone some geography from
other regions.

### 5.3 Crossroads Challenges (direct competition)

Every 3rd round, one **shared question** is asked to everyone. It is a map click or a short
riddle taken from the region of whoever is currently last, rotating so every region comes up.

- Players **buzz in** (a key per player on a shared screen, or a button on their phone
  online), then answer within 10 seconds.
- **1st correct:** +2 steps and a rival item. **2nd correct:** +1 step. **Wrong buzz:** your
  threat +1, and the question stays open for the others.

This is the main moment of head-to-head competition, where players can directly overtake
and slow each other down.

### 5.4 Interaction summary

- **Racing:** progress bars and Crossroads.
- **Sabotage:** rival items (light and limited, blocked by shields).
- **Showing your gamble:** branch choices are public, so you can see who is taking risks.
- **Catch-up:** Second Wind keeps the trailing player in contention.

---

## 6. Visual interface concept

### 6.1 Art direction: "the explorer's atlas"

- **Map:** an aged-parchment world map on a **Natural Earth** projection. It uses sepia
  coastlines, hatched mountain ranges, wavy sea lines, **portolan rhumb lines** fanning from
  compass roses, a decorative title cartouche, and a few small sea monsters in the empty
  oceans.
- **Antarctica:** the Natural Earth projection distorts the poles, so the South Pole leg is
  shown in a circular **polar inset**, styled like the inset maps in old atlases. The map
  zooms into it when Amundsen reaches Act III.
- **Ink colours for players:** crimson (Polo), indigo (Magellan), verdigris green
  (Livingstone), ochre (Amundsen). Routes are dashed ink lines. Parts of a route already
  travelled are redrawn as solid lines, and charted countries are tinted in that player's
  ink.
- **Typography:** an engraved-style serif for titles (e.g., *IM Fell English*) and a clean
  serif for questions, so they stay easy to read.
- **Threats** (animated SVG): a swirling ochre sandstorm, a red-sailed caravel, a sickly
  green miasma cloud, and a creeping white ice front with cracks.
- **Controls:** wax seals for the tier choice, a brass compass for the timer, and parchment
  "letters" for question cards.

### 6.2 Screen layout (desktop / TV, landscape)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  ⚜ GREAT EXPEDITIONS ⚜     Act II · Round 9      ⚔ Crossroads in 2 rounds    │
├───────────────┬──────────────────────────────────────────────────────────────┤
│ PLAYER CARDS  │                                                              │
│ ┌───────────┐ │          (shared world map: routes, nodes, tokens,           │
│ │ ◉ M. Polo │ │           threats, charted countries in ink colours)         │
│ │ ♥♥♥  ▣▣□  │ │                                                              │
│ │ ███████░  │ │   zooms smoothly to the active player's region during        │
│ │ Sandstorm │ │   their challenge; Antarctic inset in bottom-right cartouche │
│ │ ▓▓░ Uneasy│ │                                                              │
│ └───────────┘ │                                                              │
│  (× 4 players)│                                                              │
├───────────────┴──────────────────────────────────────────────────────────────┤
│  CHALLENGE LETTER:  "Ashgabat is a capital city. Click its country."         │
│  [ Scout · 1 ]  [ Navigator · 2 ]  [ Pathfinder · 3 ]     ⏱ 25 s   🎒 items │
└──────────────────────────────────────────────────────────────────────────────┘
```

Each player card shows: portrait, lives (as candles or hearts), the item pack, a route
progress bar, the threat's name, a danger meter, and whether the explorer's ability is still
available this act.

### 6.3 Feedback moments (the "juice")

- **Correct:** the token moves node by node with a quill-scratch sound, and the country is
  inked in.
- **Near miss:** the correct and clicked places are outlined together, with "So close: that
  was Tajikistan's neighbour."
- **Wrong:** the correct answer is shown with a one-line fact, *then* the threat lurches
  forward.
- **Caught:** the threat sweeps over the token, a candle goes out, and the camera pans back
  to the checkpoint.
- **Checkpoint unlocked:** a wax seal is stamped onto the node.

### 6.4 Accessibility

- The design must not depend on colour alone. Each player's ink also has its own pattern
  (dashes, dots).
- Text needs strong contrast against the parchment, and there is an option to remove the
  parchment texture.
- The timer can be turned off for learners.
- Map clicks have generous hit zones and pinch-zoom on touch screens.

---

## 7. MVP scope

**Goal:** a short, fully playable **hot-seat** game for 2–4 players that tests the core loop:
choosing a tier, answering geography questions, moving, the threat chasing you, checkpoints,
and the race between players.

### 7.1 In the MVP

| Area | Included |
|---|---|
| Platform | Single-page web app; SVG map; no backend; runs in a desktop browser |
| Explorers | **All 4**, with **short routes** (24 steps, 3 acts, 3 checkpoints + finish, **1 fork each**). The four different explorers are the main draw, so all of them are included. |
| Rounds | All five phases, including Crossroads (keyboard buzz-in) |
| Tiers | Scout / Navigator / Pathfinder, plus near-miss scoring |
| Question types | Map identification, capitals, flags, geographical knowledge, combined challenges, Expedition Riddles (Discovery nodes and the final challenge) |
| Threats | All 4, with terrain and behaviour rules; danger meter; catching, respawn, Stranded |
| Checkpoints | Landmark Challenges, unlocking, camping, the 4 rewards |
| Items | Spyglass, Compass, Provisions, Medicine Chest, Rumour |
| Abilities | All 4 signature abilities |
| Learning | Charting (inked countries with labels), revisits, a simple end-of-game journal |
| Visuals | Vintage map style, route and node symbols, animated tokens and threats, polar inset |

### 7.2 Content budget for the MVP

- **Generated from data** (one country dataset with names, capitals, flags and per-country
  difficulty ratings): country-location, capital and flag questions for about 120 countries
  along the 4 routes. This gives several hundred questions with little writing effort.
- **Hand-written:** about 30 feature map-clicks per route (rivers, ranges, lakes, islands,
  straits), about 25 geography-fact questions per route, about 8 Expedition Riddles per
  route, about 6 Landmark Challenges per route, and about 20 Crossroads questions.
  **Roughly 380 hand-written items in total.**
- **Map data:** Natural Earth 1:50m countries, plus selected rivers, lakes and mountain
  ranges (simplified, with hit zones), and an Antarctic inset.

### 7.3 Left for after the MVP

- Online and phone-controller multiplayer, and simultaneous hidden choices
- Full-length routes (36 steps, 2–3 forks), trading posts, more items
- An adaptive per-player skill rating, and recalibrating question ratings from answer data
- More explorers (e.g., Ibn Battuta, Zheng He, Lewis & Clark, Mary Kingsley, Abel Tasman),
  each opening a new region
- Localisation, classroom mode (teacher picks regions), and a solo campaign

### 7.4 What playtests should measure

| Metric | Target |
|---|---|
| Length of a 4-player MVP game | 25–35 min |
| Tier choices across all rounds | No tier above 55% (all three should be used) |
| Catches per player per game | 1–2 on average (the threat is felt but isn't crushing) |
| Win rate per explorer | 22–28% |
| Final gap between 1st and last place | Usually within 6 steps (the race stays close) |
| Players saying they "learned a new place" | ≥ 80% |

---

## Appendix A — Question record (sketch)

```json
{
  "id": "polo-ca-0142",
  "route": "polo",
  "region": "central-asia",
  "type": "capital_to_locate",
  "difficulty": 4,
  "prompt": "Ashgabat is a capital city. Click its country.",
  "answer": { "kind": "country", "iso": "TKM" },
  "nearMiss": ["UZB", "IRN", "AFG", "KAZ"],
  "fact": "Ashgabat holds a world record for the most white-marble buildings.",
  "revisitAs": ["locate_country", "flag_to_country"]
}
```

## Appendix B — Decisions to confirm before building

1. **Main platform:** is desktop hot-seat the right first target, or should we go straight to
   a TV + phones party setup?
2. **Audience and age:** this decides the default difficulty and the tone of the rival items.
3. **Language:** English only for the MVP, or localised from day one (which affects question
   writing)?
4. **Historical liberties:** are the combined routes for Livingstone and Amundsen acceptable,
   or should each explorer follow a single expedition?
