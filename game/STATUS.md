# Game of Radical Abundance — Status & Plan

## Current State (June 2026)

### Architecture
- Pure HTML5 Canvas (960x540) + Vanilla JS, no dependencies
- IIFE module pattern with `window.GAME` namespace
- 10,455 lines across 14 JS files
- Real-time simulation (not turn-based), tick every 2s at 1x speed

---

## System Audit

| # | System | Status | Detail |
|---|--------|--------|--------|
| 1 | Simulation Engine | DONE | Real-time tick, 4 phases, production/maintenance/power math |
| 2 | State Management | DONE | ~40 tracked values, event system, clamping |
| 3 | Events/Decisions | DONE | 24 events + 22 quips, real effects on stats |
| 4 | Crisis System | DONE | 13 crises, 3 tiers, trigger conditions, resolution options |
| 5 | Dialogue System | DONE | 11 trees, 31 nodes, typewriter text, dual portraits |
| 6 | Buildings (Campus) | DONE | 18 buildings, 7 categories, prerequisites, placement validation |
| 7 | Buildings (Town) | DONE | 11 town buildings, real effects on mood/trust/population |
| 8 | Town NPCs | DONE | 8 named NPCs with portraits, quotes, click interactions |
| 9 | Characters | DONE | 5 playable + 1 locked, multipliers, bios, catchphrases |
| 10 | Character Abilities | DONE | Passive/Active/Ultimate for all 5 characters in game.js |
| 11 | Win/Lose Conditions | DONE | 4 victories + 4 defeats, endgame screen, 25 epilogues |
| 12 | Save/Load | DONE | localStorage, full serialization, continue button |
| 13 | Sound | DONE | Web Audio synth, 7 SFX, chiptune music loop |
| 14 | Tutorial | DONE | 8 context-sensitive tips |
| 15 | Camera/Zoom | DONE | Smooth zoom 0.35x-1.5x, pan, minimap, mouse wheel |
| 16 | Renderer | DONE | 4650 lines, all buildings, characters, scenery, atmosphere |
| 17 | AI Opponents | PARTIAL | Autopilot ADP growth + flavor quotes. No real strategy |
| 18 | Verb Bar HTML | VESTIGIAL | HTML has 6 buttons; runtime replaces with real-time controls |

**Bottom line: The core game is substantially complete and playable.**

---

## What's Missing / Needs Work

### P1 — Gameplay Gaps (blocks "finished game" feel)
- [ ] **1. AI Opponents need strategy** — rivals just auto-grow ADP. They should make visible decisions, react to player, compete for resources, build things, have personality-driven strategies
- [ ] **2. More dialogue depth** — only 11 trees with shallow branching. Need NPC-specific multi-turn conversations that teach AI governance concepts. Each NPC should have 3-4 dialogue trees unlocked by game phase
- [ ] **3. More events** — 24 is thin for a game spanning 2025-2045. Need 40+ events covering the AI race narrative arc: breakthroughs, scandals, international incidents, town stories
- [ ] **4. Balance pass** — economy may be too easy/hard. Need playtesting to tune: building costs, production rates, crisis frequency, victory thresholds
- [ ] **5. Clean up vestigial HTML** — verb bar HTML doesn't match runtime. Remove dead RESEARCH/DEPLOY/COOPERATE/REGULATE/ABILITY/END TURN buttons from index.html

### P2 — Polish (makes it feel like a real game)
- [ ] **6. Onboarding flow** — tutorial is just toast tips. Need a guided first 5 minutes: "Click PLAY to start time", "Click BUILD CAMPUS to construct your first lab", etc.
- [ ] **7. Building visual variety** — player-placed buildings all use generic drawGenericBuilding. Need 4-5 distinct visual styles for different building categories
- [ ] **8. Notification/event log UX** — events/crises can pile up. Need a queue system and clearer visual priority
- [ ] **9. Mobile touch UX** — touch input exists but building placement on mobile is awkward
- [ ] **10. Art quality uplift** — buildings are functional but blocky. Commits 6-8 of the art plan remain (exterior props, character detail, final polish)

### P3 — Content Expansion (makes it replayable)
- [ ] **11. More crises** — 13 is okay but needs 20+ for variety across multiple playthroughs
- [ ] **12. Character-specific story arcs** — each character should have a unique 5-event story chain
- [ ] **13. Unlock Trump character** — needs unlock condition and full ability/dialogue implementation
- [ ] **14. Achievement system** — track milestones, unlock cosmetics or gameplay modifiers
- [ ] **15. Multiple difficulty levels** — Easy/Normal/Hard affecting crisis frequency, starting money, AI opponent aggression

---

## Execution Plan

### Sprint 1: AI Opponents & Clean Up (items 1, 5)
Make rivals feel like real competitors. Clean dead HTML.

### Sprint 2: Dialogue & Events (items 2, 3)
Double the event count. Add NPC dialogue trees that teach AI governance.

### Sprint 3: Balance & Onboarding (items 4, 6)
Playtest, tune economy. Build guided tutorial flow.

### Sprint 4: Visual Polish (items 7, 8, 10)
Building variety, notification UX, remaining art commits.

### Sprint 5: Content Depth (items 11, 12, 13)
More crises, character arcs, unlock Trump.

---

*Last updated: 2026-06-20*
