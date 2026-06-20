# Game of Radical Abundance — Status & Plan

## Current State (June 2026)

### Architecture
- Pure HTML5 Canvas (960x540) + Vanilla JS, no dependencies
- IIFE module pattern with `window.GAME` namespace
- ~14,400 lines across 17 JS files
- Real-time simulation (not turn-based), tick every 2s at 1x speed

### Content Totals
| Content | Count |
|---------|-------|
| Story events | 107 |
| Quips | 58 |
| **Total events** | **165** |
| Crises | 26 (8 minor, 12 major, 6 global) |
| Achievements | 22 |
| Dialogue trees | 25 |
| Town NPCs | 9 |
| Playable characters | 6 |
| Campus buildings | 18 |
| Town buildings | 11 |

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
| 13 | Sound | DONE | Web Audio synth, 7 SFX, chiptune music loop |
| 14 | Tutorial | DONE | 10-step guided tutorial + 11 context-sensitive tips |
| 15 | Camera/Zoom | DONE | Smooth zoom 0.35x-1.5x, pan, minimap, mouse wheel |
| 16 | Renderer | DONE | 4650 lines, all buildings, characters, scenery, atmosphere |
| 17 | AI Opponents | DONE | Personality-driven strategies, visible decisions, reactions, rivalries |
| 18 | Character Story Arcs | DONE | 5-event unique story chain per character (30 total) |
| 19 | Achievement System | DONE | 22 achievements, check/unlock engine, endgame display, toasts |
| 20 | Sci-Fi Crisis Chain | DONE | 6 linked crises escalating from HAL to Convergence |
| 21 | Pop Culture Layer | DONE | Classic sci-fi, music, celebrity, public disconnect themes |

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

---

## Next Steps (Prioritized)

### High Impact — Gameplay Depth
1. **Difficulty Levels** — Easy/Normal/Hard affecting crisis frequency, starting money, AI aggression, victory thresholds. Low effort, high replayability.
2. **Character-Specific Pop Culture Quirks** — Each leader reacts differently to the same pop culture events (e.g., Elon quotes Hitchhiker's Guide, Dario hums Taylor Swift during crises). Some groundwork exists in characterSpecific events.
3. **Cross-Character Convergence Events** — Events where 2+ AI leaders interact during the same scenario with different dialogue depending on who you're playing. Would add emergent storytelling.

### Medium Impact — Polish
4. **Mobile Touch UX** — Touch input exists but building placement on mobile is awkward. Needs tap-to-select-then-tap-to-place flow.
5. **Achievement Persistence** — Save unlocked achievements to localStorage so they persist across playthroughs. Add an achievements gallery on the title screen.
6. **Art Quality Uplift** — Exterior props, character detail, building visual variety, final polish passes on the renderer.
7. **Music Variety** — Additional chiptune tracks that change per phase or during crises.

### Nice-to-Have — Expansion Content
8. **More NPCs** — Bob Iger (Eisner's rival), Lisa Su (AMD counter to Jensen), additional townsfolk with dialogue trees.
9. **Branching Crisis Outcomes** — Crisis resolution affects which future crises/events can trigger (e.g., siding with Gerald in robot rights unlocks a Gerald advisor event later).
10. **New Game+ Mode** — After first win, start with bonus resources but harder crises. Synergizes with Trump unlock mechanic.
11. **Mod Support** — Document the event/crisis/NPC data formats so players can add their own content via JSON injection.

---

*Last updated: 2026-06-20*
