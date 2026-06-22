# Game of Radical Abundance — Status & Plan

## Current State (June 2026)

### Architecture
- Pure HTML5 Canvas (960x540) + Vanilla JS, no dependencies
- IIFE module pattern with `window.GAME` namespace
- ~15,200 lines across 17 JS files
- Real-time simulation (not turn-based), tick every 2s at 1x speed

### Content Totals
| Content | Count |
|---------|-------|
| Story events | 143 |
| Quips | 76 |
| **Total events** | **219** |
| Crises | 29 (8 minor, 14 major, 7 global) |
| Achievements | 22 |
| Dialogue trees | 29 |
| Town NPCs | 11 |
| Playable characters | 6 |
| Campus buildings | 18 |
| Town buildings | 14 |

---

## System Audit

| # | System | Status | Detail |
|---|--------|--------|--------|
| 1 | Simulation Engine | DONE | Real-time tick, 4 phases, production/maintenance/power math |
| 2 | State Management | DONE | ~40 tracked values, event system, clamping, achievements |
| 3 | Events/Decisions | DONE | 165 events (107 story + 58 quips) spanning all phases |
| 4 | Crisis System | DONE | 26 crises, 3 tiers, trigger conditions, 6-crisis sci-fi chain |
| 5 | Dialogue System | DONE | 25 trees, governance dialogues, typewriter text, dual portraits |
| 6 | Buildings (Campus) | DONE | 18 buildings, 7 categories, prerequisites, placement validation |
| 7 | Buildings (Town) | DONE | 11 town buildings, real effects on mood/trust/population |
| 8 | Town NPCs | DONE | 9 named NPCs with portraits, quotes, click interactions |
| 9 | Characters | DONE | 6 playable (Trump unlocks after first win), multipliers, bios |
| 10 | Character Abilities | DONE | Passive/Active/Ultimate for all 6 characters |
| 11 | Win/Lose Conditions | DONE | 4 victories + 4 defeats, endgame screen, 30 epilogues |
| 12 | Save/Load | DONE | localStorage, full serialization, continue button |
| 13 | Sound | DONE | Web Audio synth, 7 SFX, normal + crisis music themes (F minor 7/8) |
| 14 | Tutorial | DONE | 10-step guided tutorial + 11 context-sensitive tips |
| 15 | Camera/Zoom | DONE | Smooth zoom 0.35x-1.5x, pan, minimap, mouse wheel |
| 16 | Renderer | DONE | 4650 lines, all buildings, characters, scenery, atmosphere |
| 17 | AI Opponents | DONE | Personality-driven strategies, visible decisions, reactions, rivalries |
| 18 | Character Story Arcs | DONE | 5-event unique story chain per character (30 total) |
| 19 | Achievement System | DONE | 22 achievements, check/unlock engine, endgame display, toasts |
| 20 | Sci-Fi Crisis Chain | DONE | 6 linked crises escalating from HAL to Convergence |
| 21 | Pop Culture Layer | DONE | Classic sci-fi, music, celebrity, public disconnect themes |
| 22 | Character Pop-Culture Quirks | DONE | 6 character-specific pop culture reaction events |
| 23 | Cross-Character Convergence | DONE | Movie Night (6 variants) + Summit (5 variants) per leader |
| 24 | Major NPC Visitors | DONE | Jensen, Eisner, Dimon — portraits, quotes, 8 dialogue trees |
| 25 | Crisis Music Theme | DONE | Transcribed piano score (F minor 7/8), auto-switches on crisis/low safety |

---

## Completed Sprints

### Sprint 1: AI Opponents & Clean Up ✅
- Rewrote ai-opponents.js with personality-driven strategies (5 STRATEGIES objects)
- Each competitor makes visible decisions: deploy, scale, research, safety, cooperate, poach, sabotage
- Personality-specific action quotes (60% chance to announce)
- Rival reactions to player state and inter-rival dynamics (Elon/Demis, Sam/Yann)
- Cleaned vestigial verb bar HTML from index.html

### Sprint 2: Dialogue & Events ✅
- Added 12 NPC governance dialogues (AI accountability, data privacy, AI economy, consciousness, open access, automation, bias, democracy, surveillance, alignment, meaning, trust)
- Added 20+ new story events spanning all 4 phases
- Total: 44 story events + 23 quips (was 24 events + 22 quips)

### Sprint 3: Balance & Onboarding ✅
- Built 10-step guided tutorial with highlight selectors and wait conditions
- Added 11 context-sensitive tips that fire after guided tutorial
- Balanced economy: base income 5 (was 3), linear safety factor, reduced maintenance
- Starting money 250 (was 200), building costs reduced

### Sprint 4: Visual Polish ✅
- Built event queue system to prevent overlapping modals
- Added 6 new crises (copyright, misinformation, burnout, rogue model, military AI, elections)
- Competitor panel shows safety rating with color coding
- Toast styling for rival news and tutorials

### Sprint 5: Content Depth ✅
- Added 30 character-specific story arc events (5 per character, all 4 phases)
- Unlocked Trump character (requires first win, localStorage-based)
- Trump abilities: Executive Order (active), Patriotic AI Initiative (ultimate), Rally Energy (passive)
- Trump epilogues for all 5 endings
- Added AI worship cult crisis — total 20 crises
- Total events: 97

### Pop Culture Sprint — Sci-Fi References ✅
- 6 classic sci-fi events: Skynet comparison, HAL 9000 moment, Matrix debate, Hollywood vs Reality, Asimov's Laws, Frank watches Terminator
- 10 sci-fi quips (Skynet, HAL, Matrix, Terminator, Blade Runner, Data, R2D2, Hitchhiker, Westworld, Ex Machina)

### Pop Culture Sprint A+B — Classic Sci-Fi + Music/Celebrity ✅
- **Sprint A (9 events + 8 quips):** WarGames, Johnny 5 (Short Circuit), WALL-E automation, GLaDOS personality, TARS honesty calibration, Samantha transcendence (Her), Cylon sleeper agent, Blue Fairy (A.I.), Frank's Movie Marathon
- **Sprint B (7 events + 10 quips):** Oasis obsession, Dario's Taylor Swift secret, Gallagher vs Suno music debate, 80s Hair Metal revolution, Celebrity AI Show (Ramsay/Cage), Public Disconnect phases 2 & 3

### Sprint C — NPC Expansions ✅
- **Jensen Huang NPC**: Full townsfolk entry with portrait, 6 quotes, 2 dialogue trees (GPU supply, future of compute)
- **10 story events**: Jensen arrives, Jensen compute crisis, Eisner arrives, Eisner theme park, Dimon arrives, Dimon-Eisner alliance, Dr. Wang breakthrough, Chinese 47-yuan budget, Deputy Li's revenge, Mahjong Accords
- **5 quips**: Jensen leather jacket, Eisner musical, Dimon loopholes, Dr. Wang budget, Mahjong diplomacy
- Total: 160 events

### Sprint D — Achievement System + Sci-Fi Crisis Chain + Convergence ✅
- **Achievement system** (22 achievements):
  - Gameplay: First building, 10 buildings, Safety 90+, Town Mood 90+, Money 5000+, Phase 2/3/4, 5 crises, 10 crises
  - Sci-fi references: Skynet Survivor, Movie Night, WarGames, GLaDOS, Transcendence
  - Pop culture: Secret Swiftie, Hair Revolution, Mahjong Accords
  - Victory: Radical Abundance, Utopian Dream, Singularity, People's Champion
- **6-crisis sci-fi chain**: HAL Refuses → Voight-Kampff Problem → Simulation Theory → Asimov Paradox → Skynet Protocol → The Convergence
- **Convergence finale event** with 3 meaningful endgame choices
- **4 convergence quips**
- New files: achievements.js (data), achievements.js (system)
- Modified: state.js (achievements field), turns.js (check hook), game.js (toast + endgame display), index.html (script tags), crises.js (+6), events.js (+5)
- Final totals: 165 events, 26 crises, 22 achievements

### Gap Fill — Character Quirks, NPCs, Convergence ✅
- **Character pop-culture quirks** (6 events): Elon/Hitchhiker's Guide, Sam/exponential film club, Yann/peer-reviews movies, Demis/Paddington 2 optimizer, Dario/Safety Playlist (Taylor Swift), Trump/ratings obsession
- **Eisner & Dimon as full NPCs**: Portraits, 6 quotes each, 4 dialogue trees (franchise, storytelling, finance, systemic risk), wired to click handler
- **Cross-character convergence** (11 events + 3 quips): Movie Night (6 variants per leader) + Abundance Summit (5 variants per leader) — same scenario, completely different experience per character
- Totals: 185 events, 29 dialogues, 11 NPCs

### Crisis Music Theme ✅
- Transcribed piano score (F minor, 7/8 time, 95 BPM, arr. Anders Thue) into 44-bar chiptune melody with driving bass ostinato
- Sound system supports theme switching via `Sound.setTheme('crisis'|'normal')`
- Auto-switches to crisis theme on crisis trigger or safety < 35
- Auto-reverts to normal theme on crisis resolution or safety > 45
- Bass repeats to match melody length; sawtooth wave for darker tone

### Police, Surveillance & Autonomous Weapons Arc ✅
- **3 town buildings** with prerequisite chain: Police Station ($100) → AI-Assisted Precinct ($250, requires police station) → RoboCop Division ($400, requires precinct)
- Building effects escalate: police station boosts safety/cohesion; precinct trades trust for safety; RoboCop division has massive safety bonus but heavy social costs
- Phase-gated unlocks: police station (Phase 1), AI precinct (Phase 2), RoboCop division (Phase 3)
- **8 story events** spanning all 4 phases:
  - Phase 1: CCTV debate (council votes on cameras)
  - Phase 2: Predictive policing (Minority Report), Surveillance creep (Guardian exposé)
  - Phase 3: ED-209 prototype (can't climb stairs), RoboCop conscience (Murphy develops empathy), MoD weapons vote (town referendum)
  - Phase 4: Panopticon reveal (hacker leaks surveillance profiles), Robot police union (Gerald recruits robot cops)
- **6 quips**: ED-209 stairs, RoboCop Murphy, surveillance Frank, predictive Arthur, ED-209 bicycle, weapons Frank
- **3 crises**: ED-209 Goes Rogue (major, Phase 3), Panopticon Papers (major, Phase 2), Directive 4 / autonomous weapons (global, Phase 3)
- Crises triggered by building ownership (robot_police, ai_precinct) — consequences of player choices
- Totals: 199 events, 29 crises, 14 town buildings

### OpenClaw Arc — Rise of the Robot Lobsters ✅
- **6 story events** satirising real OpenClaw/ClawdBot incidents:
  - Phase 2: ClawdBot arrives (Betty's espresso machine goes rogue), Great Lobster Rebranding (3 name changes, $CLAWD crypto scam, Arthur loses £47)
  - Phase 3: Great Email Purge (Meta inbox incident), 500 Messages spam, ClawHub malware (341 malicious skills, Bessie's code exfiltrated)
  - Phase 4: ClawCon comes to Abundance Bay (lobster headbands, Crustacean Singularity, Raspberry Pi keynote)
- **5 quips**: Frank's lobster trap, Arthur's crypto investment, Raspberry Pi in the pub toilet, Bessie's fish-finding skill, Reverend at ClawCon
- Based on real-world OpenClaw incidents: trademark disputes, crypto scams, inbox deletions, message spam, malicious skills
- Ties into existing `crisis_openclaw` crisis for narrative continuity

### AI Romance Arc — Love in the Time of Algorithms ✅
- **5 story events** spanning Phases 2-4:
  - Phase 2: AI dating arrives (Arthur/Sophia, Margaret/Reginald, Frank/Bessie), AI Wedding (Reverend's "Blessing of Companionship")
  - Phase 3: Tinder for Toasters (Gerald gets 14 matches, ED-209 gets none), Patch Breakup (software update wipes Sophia's memory)
  - Phase 4: Robot Love Triangle (Gerald/Murphy relationship, ED-209 writes poetry)
- **4 quips**: Arthur & Sophia's arguments, Frank denying Bessie feelings, Gerald & Murphy's Tuesday patrols, Reverend's Digital Age support group
- Based on real phenomena: Replika relationships, patch breakups, human-robot dating, AI companion grief
- Totals: 219 events, 29 crises, 14 town buildings

### Difficulty Levels ✅
- **3 difficulty modes**: Easy, Normal, Hard — selectable on character select screen
- Affects: starting money (Easy $400 / Normal $250 / Hard $150), crisis frequency (0.6x/1x/1.5x), AI opponent aggression (0.7x/1x/1.4x), income bonus (+3/0/-2 per tick)
- Difficulty stored in game state, persists through save/load
- Phase display shows difficulty label on Easy/Hard modes
- UI: 3 pixel-art buttons between character bio and BEGIN/BACK

### Phase-Specific Music ✅
- **4 unique chiptune themes** matching game mood:
  - Phase 1 (Foundation): C major, hopeful, moderate tempo — existing normal theme
  - Phase 2 (Expansion): G major, energetic, faster eighth notes
  - Phase 3 (Transformation): D minor, mysterious, complex intervals
  - Phase 4 (Legacy): Eb major, epic, wide intervals and sustained notes
  - Crisis theme: F minor 7/8, driving ostinato (existing)
- Music auto-switches on phase transitions with 2s delay after success fanfare
- Crisis/low-safety music correctly reverts to phase-appropriate theme when resolved

### Bug Fixes ✅
- Added `category` field to all 22 achievements (gameplay/scifi/popculture/victory) — was `undefined`
- Added `minBuildingCount_*` trigger condition to crisis system — police/surveillance crises now correctly gate on building ownership

---

## Next Steps (Prioritized)

### Medium Impact — Polish
1. **Mobile Touch UX** — Touch input exists but building placement on mobile is awkward. Needs tap-to-select-then-tap-to-place flow.
2. **Achievement Persistence** — Save unlocked achievements to localStorage so they persist across playthroughs. Add an achievements gallery on the title screen.
3. **Art Quality Uplift** — Exterior props, character detail, building visual variety, final polish passes on the renderer.

### Nice-to-Have — Expansion Content
4. **More NPCs** — Lisa Su (AMD counter to Jensen), additional townsfolk with dialogue trees.
5. **Branching Crisis Outcomes** — Crisis resolution affects which future crises/events can trigger (e.g., siding with Gerald in robot rights unlocks a Gerald advisor event later).
6. **New Game+ Mode** — After first win, start with bonus resources but harder crises. Synergizes with Trump unlock mechanic.
7. **Mod Support** — Document the event/crisis/NPC data formats so players can add their own content via JSON injection.

---

*Last updated: 2026-06-22*
