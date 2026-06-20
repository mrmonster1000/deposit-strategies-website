# Art Design Guide — Game of Radical Abundance

Reference standard: **Thimbleweed Park** (Ron Gilbert, 2017)

This document defines the minimum quality bar for all visual assets.
Every new building, character, or scene element MUST meet these standards.
Existing assets below standard MUST be upgraded before new features are added.

---

## 1. SCALE & PROPORTION

### Buildings
- **Minimum height**: 80px at final render (after any scale transform)
- **Character-to-building ratio**: Characters should be ~1/3 to 1/4 the height of the building they stand in front of
- **Width**: Buildings should be at least 60px wide at render scale. Major landmarks (stadium, theme park) can be 200px+
- **All buildings render at 2x scale** via ctx.scale(2,2) — no 1x buildings in the world

### Characters (World Sprites)
- **Named NPCs**: minimum sz=3.0 (current standard)
- **Player character**: minimum sz=3.0 (currently 2.8 — needs upgrade)
- **Generic townspeople**: minimum sz=2.2 (currently 2.0 — needs upgrade)
- **Total character height**: ~50-60px at render (head + body + legs)
- **Head-to-body ratio**: Head is ~35% of total height (slightly oversized for readability, matching Thimbleweed Park style)

### Characters (Portraits)
- **Portrait canvas**: 96x96px minimum
- **Pixel grid**: 16x16 logical pixels, each rendered at 6px
- **Must include**: hair, eyes with whites, mouth expression, shoulders, distinguishing feature (glasses/beard/hat)

---

## 2. BUILDING DETAIL REQUIREMENTS

Every building MUST have ALL of the following:

### Structure (minimum 8 elements)
- [ ] **Foundation/base** — visible ground connection (steps, curb, concrete pad)
- [ ] **Walls** — at least 2 color layers (base + lighter inset or darker shadow)
- [ ] **Roof** — distinct from walls, with overhang or architectural detail
- [ ] **Door** — visible entrance with frame, handle detail, possible glass/interior peek
- [ ] **Windows** — individual windows with frames (not a grid pattern), some showing interior
- [ ] **Signage** — text or icon identifying the building's purpose
- [ ] **Shadow** — drop shadow behind the building (3px offset, rgba black)
- [ ] **Depth element** — awning, balcony, chimney, antenna, or other z-axis detail

### Atmosphere (minimum 4 elements)
- [ ] **Interior visibility** — at least one window showing something inside (shelf, light, furniture)
- [ ] **Exterior furniture** — bench, planter, bin, sign board, or other street-level object
- [ ] **Lighting** — lamp, neon sign, window glow, or other light source with visible glow area
- [ ] **Unique feature** — one thing that makes this building instantly recognizable at a glance

### Animation (minimum 1 element)
- [ ] **Movement** — at least one animated element (blinking light, smoke, flickering sign, flag, spinning fan)

### Minimum drawRect calls
- **Small buildings**: 40+ calls minimum
- **Medium buildings**: 60+ calls minimum  
- **Large/landmark buildings**: 100+ calls minimum
- **Current comedy club**: ~50 calls (this is the MINIMUM acceptable standard)
- **Current research lab**: ~15 calls (BELOW STANDARD — must be rebuilt)

---

## 3. CHARACTER DETAIL REQUIREMENTS

### World Sprites (drawPerson / drawNamedNPC / drawPlayer)

Every character MUST have:
- [ ] **Head** with distinct shape (not a square — use 2-3 rects for jawline/chin)
- [ ] **Eyes** with white sclera and dark pupil (2px minimum each)
- [ ] **Hair** with at least 2 color tones (base + highlight or shadow)
- [ ] **Shirt/jacket** with collar or lapel detail
- [ ] **Distinct silhouette** — recognizable at 50% zoom by outline alone
- [ ] **Arms** that swing with walking animation
- [ ] **Legs** with knee-bend walk cycle (not just vertical offset)
- [ ] **Shoes** in a different color from pants
- [ ] **Shadow** on the ground beneath them

### Named NPC Extras
Named NPCs (Betty, Frank, Mayor, etc.) must ALSO have:
- [ ] **Occupational detail** — apron, hat, tool, badge, or costume element
- [ ] **Facial feature** — beard, glasses, distinctive hairstyle
- [ ] **Idle animation** — subtle movement when standing (head turn, weight shift, gesture)

### Portrait Sprites (dialogue/bio screens)
- [ ] **Expression variants**: minimum 2 per character (neutral + one emotion)
- [ ] **Clothing detail** — collar, buttons, or pattern visible
- [ ] **Background context** — subtle color or element suggesting their environment

---

## 4. ENVIRONMENT REQUIREMENTS

### Every Zone Must Have

**Ground plane:**
- [ ] At least 2 ground colors (base + variation patches)
- [ ] Edge detail where ground meets buildings (curb, step, crack)
- [ ] Scattered small details (leaves, stones, puddles, litter)

**Vertical layering (3 planes minimum):**
- [ ] **Background** — hills, sky, distant structures (parallax)
- [ ] **Midground** — buildings, trees, major features
- [ ] **Foreground** — street furniture, foliage edges, signs

**Lighting:**
- [ ] Street lamps with visible light cones (not just a yellow dot)
- [ ] Building light spill onto ground (window glow reaching sidewalk)
- [ ] At least one neon/illuminated sign per 400px of developed zone

---

## 5. COLOR PALETTE RULES

### Shading
- Every surface needs **minimum 3 tones**: shadow, base, highlight
- Use `darkenColor(base, 0.7)` for shadow, `lightenColor(base, 20)` for highlight
- NO flat single-color surfaces larger than 10x10px

### Neon Signs
- Glow color at full brightness for the text/shape
- Glow halo: same color at 0.15-0.3 alpha, 2-4px larger than the sign
- Reflection on ground below: same color at 0.05-0.1 alpha

### Windows
- Frame: 1px darker border around each window
- Glass: dark interior color (#182040 range)
- Lit windows: warm yellow/orange (#ffdd60 to #ff9930)
- NOT a uniform grid — vary window sizes, skip some, show curtains

### Materials Reference
| Material | Shadow | Base | Highlight |
|----------|--------|------|-----------|
| Brick | #4a2020 | #6a3030 | #7a4040 |
| Concrete | #505058 | #707078 | #808088 |
| Wood | #3a2010 | #5a3820 | #6a4830 |
| Metal | #3a3a40 | #5a5a60 | #7a7a80 |
| Glass | #102030 | #1a3050 | #2a4060 |
| Neon red | #601010 | #ff2020 | #ff6060 |
| Neon blue | #101060 | #2040ff | #6080ff |
| Neon green | #106010 | #20ff40 | #60ff80 |

---

## 6. ANIMATION STANDARDS

### Building Animations
- Smoke: use `spawnSmoke()` — max 0.08-0.12 probability per frame
- Neon flicker: `Math.sin(time * 0.004)` range for gentle pulse
- Mechanical: `Math.floor(time * 0.01) % N` for stepped/ratcheting motion
- Glow: `0.3 + Math.sin(time * 0.003) * 0.15` for ambient glow pulse

### Character Animations
- Walk cycle: `Math.sin(time * 0.012)` for smooth leg swing
- Idle bob: `Math.sin(time * 0.003) * 0.5` for breathing motion
- Head turn: `Math.sin(time * 0.002 + seed)` switching direction every ~3 seconds

---

## 7. QUALITY CHECKLIST — USE BEFORE COMMITTING

Before any visual code is committed, verify:

```
BUILDING CHECKLIST:
[ ] Building is at least 80px tall at render
[ ] Has foundation/base visible
[ ] Has 2+ wall color layers  
[ ] Has distinct roof
[ ] Has detailed door (not just a rectangle)
[ ] Has individual windows (not grid pattern)
[ ] Has signage or identifying feature
[ ] Has drop shadow
[ ] Has at least 1 depth element (awning/chimney/etc)
[ ] Has interior visible through at least 1 window
[ ] Has exterior furniture/props
[ ] Has lighting element with glow
[ ] Has at least 1 animation
[ ] Uses 40+ drawRect calls minimum
[ ] Character stands at 1/3 to 1/4 building height

CHARACTER CHECKLIST:
[ ] Head has jawline shape (not perfect square)
[ ] Eyes have white sclera + dark pupil
[ ] Hair has 2+ color tones
[ ] Has collar/lapel detail on clothing
[ ] Arms swing during walk
[ ] Legs have knee-bend walk cycle
[ ] Has ground shadow
[ ] Named NPCs have occupational detail
[ ] Named NPCs have idle animation
```

---

## 8. REFERENCE COMPARISON

### What Thimbleweed Park Gets Right
1. Buildings are LARGE — they dominate the scene, characters are small by comparison
2. Every surface has 3+ shade layers — nothing is flat
3. Interiors are visible through windows and doors — the world feels inhabited
4. Signage is readable and characterful — you know what every building is
5. Street-level detail is dense — curbs, cracks, plants, debris, machines
6. Light sources cast visible areas of illumination on surrounding surfaces
7. Characters have proportional heads (~40% of height) with readable expressions
8. Foreground elements (plants, fences) create depth framing

### What We Must Fix (Priority Order)
1. **Campus buildings** — currently 15-20 drawRect calls, need 60+. Too small, too flat
2. **Background houses** — currently tiny rectangles, need full Thimbleweed treatment
3. **Player character** — needs jawline, collar, better proportions
4. **Generic NPCs** — need occupational variety, not just recolored clones
5. **Street-level detail** — light cones from lamps, foliage, curbing around buildings
6. **Window treatment** — individual framed windows showing interiors, not grids

---

## 9. TOWN EVOLUTION TIERS

Buildings should visually upgrade as abundance level increases:

### Tier 0 (Seedy — Game Start)
- Rundown aesthetic: cracked walls, broken signs, dark windows
- Litter and graffiti
- Dim/broken street lights

### Tier 1 (Improving — townMood 40-60)
- Fresh paint on some surfaces
- Signs repaired and lit
- Some new street furniture

### Tier 2 (Prosperous — townMood 60-80)  
- Awnings and planters appear
- Windows show warm interiors
- New buildings: library, sports ground, market

### Tier 3 (Abundant — townMood 80+)
- Gleaming surfaces, decorative elements
- Public art, fountains, gardens
- Landmark buildings: stadium, museum, theme park
- Flying drones, monorail, futuristic elements
