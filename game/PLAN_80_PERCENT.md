# Plan: 28/100 → 80/100 vs Thimbleweed Park

## Current State
- Buildings: 23-32 drawRect calls each (need 60-100+)
- No foreground foliage layer at all
- Ground plane: flat color bands with minimal texture
- Walls: flat single-color, no gradients or depth
- Characters: crude rectangles, no curves
- Lighting: basic glow rects, no light spill on ground
- No canvas gradients used anywhere

## Target: 80/100
Thimbleweed Park's quality comes from 6 pillars. Each commit targets one.

---

### COMMIT 1: Wall Depth & Gradients (28→38)
**Impact: +10 points — biggest single improvement**

Every building wall currently uses 1-2 flat colors. Add:
- Canvas `createLinearGradient` for wall fills (dark at base, lighter at top)
- 3-tone shading on every surface: shadow edge, base, highlight edge
- Weathering: stain patches, crack lines, paint peel marks
- Apply to ALL 8 seedy buildings + church

### COMMIT 2: Ground Plane & Curbing (38→46)
**Impact: +8 points**

Ground is currently flat green. Add:
- Sidewalk with individual slab joints, cracks, wear marks
- Curbing where sidewalk meets road/grass (raised 3D edge)
- Ground texture: scattered pebbles, dirt patches, grass variation
- Puddle reflections that show building colors above
- Drain grates near buildings
- Road markings (center line, crosswalk at road zone)

### COMMIT 3: Foreground Foliage Layer (46→54)
**Impact: +8 points**

Thimbleweed ALWAYS has foreground plants framing the scene. Add:
- New render pass AFTER all world objects, BEFORE HUD
- Dense bush shapes at screen edges (dark green, overlapping rects)
- Scattered foreground grass blades (tall, slightly swaying)
- Fence posts/railings in front of some buildings
- Chain-link fence at car factory
- Flower planters outside supermarket

### COMMIT 4: Window & Interior Detail (54→60)
**Impact: +6 points**

Windows currently show flat dark or glow rects. Upgrade to:
- Individual window frames (1px border with sill)
- Curtains (partial coverage, different colors per window)
- Visible interior items: shelves, chairs, ceiling light, figures
- Some windows open, some closed
- Warm light gradient spilling DOWN from lit windows onto wall below
- Bar: visible bottles on shelf, bar counter through window
- Arcade: visible screen glow patterns through glass

### COMMIT 5: Neon Signs & Lighting (60→67)
**Impact: +7 points**

Current neon is just colored text. Thimbleweed neon has:
- Glow halo: same color at 15-30% alpha, 4-8px larger than sign
- Ground reflection: sign color at 5% alpha on sidewalk below
- Tube thickness: signs drawn as thick outlines, not filled text
- Flicker variation: different letters flicker independently  
- Light cones from ALL sources hitting nearby surfaces
- Bar doorway: warm light spill rectangle on sidewalk
- Arcade: multi-color ground glow from cabinet screens

### COMMIT 6: Building Exterior Props (67→72)
**Impact: +5 points**

Each building needs unique street-level objects:
- Bar: outdoor table with ashtray, neon "OPEN" sign in window, trash bags
- Video: return slot, promotional standee, "BE KIND REWIND" poster
- Arcade: bicycle rack, vending machine, dropped coins
- Supermarket: trolley bay shelter, ATM machine, notice board
- Comedy: velvet rope, ticket booth, star on pavement
- Gun Shop: sandbags, ammo crates, security bollard
- Factory: oil drums, forklift, stack of pallets, chain fence
- Motel: vending machine, lawn chairs, BBQ grill, dumpster

### COMMIT 7: Character Detail Uplift (72→77)
**Impact: +5 points**

Characters need more visual features:
- Head shape: use 3-4 rects for rounded jawline instead of 2
- Hair: 3 tone layers (shadow, base, highlight) + distinct styles per NPC
- Eyes: larger with eyelid line above
- Clothing: add pocket, button row, collar points, tie for some
- Shoes: distinct shape (not just colored rect), heel visible
- Named NPCs: occupational props (Betty=apron, Mick=bar towel, Mayor=sash)
- Idle animations: weight shift, head turn, hand gesture

### COMMIT 8: Atmosphere & Polish (77→80)
**Impact: +3 points**

Final polish pass:
- Parallax on hills (slight movement when camera pans)
- Atmospheric haze between foreground and background (subtle blue overlay at distance)
- Ambient particles: fireflies near lamps, dust motes in light cones
- Building shadows cast on ground (dark trapezoid extending right)
- Subtle vignette darkening at screen edges
- Background houses upgraded: individual windows, varied rooflines, chimneys

---

## Execution Order
Each commit builds on the previous. Total: 8 commits.
Estimated drawRect calls per building after all commits: 80-120.
