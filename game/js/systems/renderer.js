window.GAME = window.GAME || {};
window.GAME.Systems = window.GAME.Systems || {};

GAME.Systems.Renderer = (function() {
    'use strict';

    var canvas, ctx;
    var W = 960, H = 400;

    // Monkey Island inspired palette
    var COLORS = {
        sky: {
            top: '#0a0a2a',
            mid: '#101840',
            low: '#182858',
            horizon: '#203870'
        },
        sea: {
            deep: '#0a1030',
            mid: '#0c1840',
            surface: '#102050',
            foam: '#304878',
            highlight: '#406090'
        },
        hills: {
            far: '#0c2810',
            mid: '#143818',
            near: '#1c4820'
        },
        ground: {
            grass: '#1a3818',
            grassLight: '#204820',
            path: '#3a3020',
            pathLight: '#4a4030',
            dirt: '#2a2818'
        },
        ui: {
            panelBg: '#1a1a3a',
            panelBorder: '#5a5a8a',
            highlight: '#ffdd44',
            textPrimary: '#e0e0ff',
            textSecondary: '#a0a0c0'
        }
    };

    // Layout constants
    var GROUND_Y = 260;       // where the ground plane starts
    var WATER_X = 780;        // where the ocean begins (right edge)
    var ROAD_X = 460;         // center dividing line (campus | town)
    var ROAD_W = 20;          // road width
    var BUILDING_FLOOR = 370; // bottom of building area
    var CAMPUS_LEFT = 20;     // left edge of campus area
    var TOWN_RIGHT = 760;     // right edge of town area

    // Seagull state (persistent between frames)
    var seagulls = [];
    var seagullsInited = false;

    // Smoke particles
    var smokeParticles = [];

    function init(canvasId) {
        canvas = document.getElementById(canvasId);
        ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        W = canvas.width;
        H = canvas.height;
    }

    function clear() {
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, W, H);
    }

    function drawRect(x, y, w, h, color) {
        ctx.fillStyle = color;
        ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
    }

    function drawOutline(x, y, w, h, color, lineWidth) {
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth || 1;
        ctx.strokeRect(Math.floor(x) + 0.5, Math.floor(y) + 0.5, Math.floor(w), Math.floor(h));
    }

    function drawText(text, x, y, options) {
        var opts = options || {};
        ctx.font = (opts.size || 10) + 'px "Press Start 2P", monospace';
        ctx.fillStyle = opts.color || COLORS.ui.textPrimary;
        ctx.textAlign = opts.align || 'left';
        ctx.textBaseline = opts.baseline || 'top';
        ctx.fillText(text, Math.floor(x), Math.floor(y));
    }

    function darkenColor(hex, factor) {
        if (!hex || hex.length < 7) return hex || '#000000';
        var r = parseInt(hex.slice(1, 3), 16);
        var g = parseInt(hex.slice(3, 5), 16);
        var b = parseInt(hex.slice(5, 7), 16);
        r = Math.min(255, Math.floor(r * factor));
        g = Math.min(255, Math.floor(g * factor));
        b = Math.min(255, Math.floor(b * factor));
        return '#' + r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');
    }

    function lightenColor(hex, amount) {
        if (!hex || hex.length < 7) return hex || '#ffffff';
        var r = parseInt(hex.slice(1, 3), 16);
        var g = parseInt(hex.slice(3, 5), 16);
        var b = parseInt(hex.slice(5, 7), 16);
        r = Math.min(255, r + amount);
        g = Math.min(255, g + amount);
        b = Math.min(255, b + amount);
        return '#' + r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');
    }

    // Simple seeded random for deterministic placement
    function seededRandom(seed) {
        var x = Math.sin(seed) * 43758.5453123;
        return x - Math.floor(x);
    }

    // =========================================================================
    //  SKY, STARS, ATMOSPHERE
    // =========================================================================

    function drawSky(time) {
        // Gradient sky — four bands
        var bands = [
            { y: 0, h: 60, color: COLORS.sky.top },
            { y: 60, h: 60, color: COLORS.sky.mid },
            { y: 120, h: 70, color: COLORS.sky.low },
            { y: 190, h: 70, color: COLORS.sky.horizon }
        ];
        for (var i = 0; i < bands.length; i++) {
            drawRect(0, bands[i].y, W, bands[i].h + 1, bands[i].color);
        }

        // Moon (small, top right)
        var moonX = 820, moonY = 35;
        ctx.fillStyle = '#d0d8e8';
        ctx.beginPath();
        ctx.arc(moonX, moonY, 12, 0, Math.PI * 2);
        ctx.fill();
        // Moon shadow
        ctx.fillStyle = COLORS.sky.top;
        ctx.beginPath();
        ctx.arc(moonX + 4, moonY - 2, 10, 0, Math.PI * 2);
        ctx.fill();
    }

    function drawStars(time) {
        var seed = 12345;
        for (var i = 0; i < 80; i++) {
            seed = (seed * 16807 + 7) % 2147483647;
            var sx = seed % W;
            seed = (seed * 16807 + 7) % 2147483647;
            var sy = seed % 180;
            seed = (seed * 16807 + 7) % 2147483647;
            var twinkle = Math.sin(time * 0.001 + i * 1.7) > 0.2;
            if (twinkle) {
                var brightness = 0.3 + Math.sin(time * 0.002 + i * 0.5) * 0.4;
                var size = (seed % 4 === 0) ? 2 : 1;
                ctx.fillStyle = 'rgba(255,255,255,' + Math.max(0.1, brightness) + ')';
                ctx.fillRect(sx, sy, size, size);
            }
        }
    }

    // =========================================================================
    //  OCEAN / WATER
    // =========================================================================

    function drawOcean(time) {
        // Ocean fills the right edge of the scene behind/beside the town
        var oceanLeft = WATER_X;
        var oceanTop = 180; // starts at the horizon

        // Deep water base
        drawRect(oceanLeft, oceanTop, W - oceanLeft, H - oceanTop, COLORS.sea.deep);

        // Animated wave bands
        for (var row = 0; row < 30; row++) {
            var y = oceanTop + row * 7;
            if (y > H) break;
            var waveOffset = Math.sin(time * 0.0015 + row * 0.8) * 3;
            var alpha = 0.08 + Math.sin(time * 0.001 + row * 0.5) * 0.04;

            // Wave highlight line
            ctx.fillStyle = 'rgba(48, 72, 120, ' + alpha + ')';
            ctx.fillRect(oceanLeft + waveOffset, y, W - oceanLeft, 2);

            // Occasional foam
            if (row % 4 === 0) {
                var foamX = oceanLeft + 5 + Math.sin(time * 0.001 + row) * 8;
                ctx.fillStyle = 'rgba(80, 110, 160, ' + (alpha * 1.5) + ')';
                ctx.fillRect(foamX, y, 30 + Math.sin(row) * 10, 1);
            }
        }

        // Shore line where water meets land
        var shoreWave = Math.sin(time * 0.002) * 2;
        ctx.fillStyle = COLORS.sea.foam;
        ctx.fillRect(oceanLeft - 2 + shoreWave, GROUND_Y, 4, H - GROUND_Y);
    }

    // =========================================================================
    //  HILLS AND TERRAIN
    // =========================================================================

    function drawHills(time) {
        // Far hills (dark, behind everything)
        ctx.fillStyle = COLORS.hills.far;
        ctx.beginPath();
        ctx.moveTo(0, 230);
        for (var x = 0; x <= WATER_X + 20; x += 4) {
            var hx = 230 - Math.sin(x * 0.008) * 25 - Math.sin(x * 0.015 + 2) * 15 - Math.cos(x * 0.003) * 10;
            ctx.lineTo(x, hx);
        }
        ctx.lineTo(WATER_X + 20, H);
        ctx.lineTo(0, H);
        ctx.fill();

        // Mid hills
        ctx.fillStyle = COLORS.hills.mid;
        ctx.beginPath();
        ctx.moveTo(0, 250);
        for (var x2 = 0; x2 <= WATER_X + 10; x2 += 4) {
            var hy = 250 - Math.sin(x2 * 0.012 + 1) * 18 - Math.cos(x2 * 0.006) * 12;
            ctx.lineTo(x2, hy);
        }
        ctx.lineTo(WATER_X + 10, H);
        ctx.lineTo(0, H);
        ctx.fill();

        // Near hills / ground level
        ctx.fillStyle = COLORS.hills.near;
        ctx.beginPath();
        ctx.moveTo(0, GROUND_Y);
        for (var x3 = 0; x3 <= WATER_X + 5; x3 += 4) {
            var gy = GROUND_Y - Math.sin(x3 * 0.02 + 3) * 6 - Math.cos(x3 * 0.01) * 4;
            ctx.lineTo(x3, gy);
        }
        ctx.lineTo(WATER_X + 5, H);
        ctx.lineTo(0, H);
        ctx.fill();
    }

    function drawGround(time) {
        // Main ground plane
        drawRect(0, GROUND_Y, WATER_X, H - GROUND_Y, COLORS.ground.grass);

        // Grass texture strips
        for (var i = 0; i < 30; i++) {
            var gx = seededRandom(i * 37) * WATER_X;
            var gy = GROUND_Y + 5 + seededRandom(i * 53) * (H - GROUND_Y - 10);
            ctx.fillStyle = 'rgba(40, 90, 40, 0.3)';
            ctx.fillRect(gx, gy, 8 + seededRandom(i * 71) * 12, 1);
        }

        // Dirt patches
        for (var j = 0; j < 8; j++) {
            var dx = seededRandom(j * 97 + 200) * WATER_X;
            var dy = GROUND_Y + 20 + seededRandom(j * 113 + 200) * 80;
            ctx.fillStyle = 'rgba(42, 40, 24, 0.25)';
            ctx.fillRect(dx, dy, 15 + seededRandom(j * 127) * 20, 3);
        }
    }

    function drawRoad(time) {
        // Vertical road separating campus from town
        var rx = ROAD_X;
        // Main road surface
        drawRect(rx, GROUND_Y, ROAD_W, H - GROUND_Y, COLORS.ground.path);
        // Road edges
        drawRect(rx, GROUND_Y, 2, H - GROUND_Y, COLORS.ground.pathLight);
        drawRect(rx + ROAD_W - 2, GROUND_Y, 2, H - GROUND_Y, COLORS.ground.pathLight);
        // Center dashes
        for (var dy = GROUND_Y + 5; dy < H; dy += 16) {
            drawRect(rx + ROAD_W / 2 - 1, dy, 2, 8, '#5a5030');
        }
    }

    // =========================================================================
    //  SCENERY DETAILS (trees, lampposts, sign)
    // =========================================================================

    function drawTree(x, y, size) {
        var s = size || 1;
        // Trunk
        drawRect(x, y - 8 * s, 3 * s, 10 * s, '#3a2810');
        // Foliage layers
        drawRect(x - 4 * s, y - 16 * s, 11 * s, 6 * s, '#1a5020');
        drawRect(x - 3 * s, y - 20 * s, 9 * s, 5 * s, '#1d5a24');
        drawRect(x - 2 * s, y - 23 * s, 7 * s, 4 * s, '#206828');
    }

    function drawPalmTree(x, y) {
        // Trunk (curved)
        drawRect(x, y - 20, 3, 22, '#5a3818');
        drawRect(x - 1, y - 22, 3, 4, '#5a3818');
        // Fronds
        drawRect(x - 10, y - 26, 8, 2, '#1a6020');
        drawRect(x - 8, y - 28, 6, 2, '#1a6020');
        drawRect(x + 3, y - 26, 8, 2, '#186020');
        drawRect(x + 5, y - 28, 6, 2, '#186020');
        drawRect(x - 4, y - 30, 10, 2, '#1d6828');
        // Coconuts
        drawRect(x, y - 24, 2, 2, '#6a4020');
        drawRect(x + 2, y - 23, 2, 2, '#6a4020');
    }

    function drawLamppost(x, y, time) {
        // Pole
        drawRect(x, y - 24, 2, 24, '#505058');
        // Light fixture
        drawRect(x - 3, y - 26, 8, 3, '#606068');
        // Glow
        var glowAlpha = 0.15 + Math.sin(time * 0.003) * 0.05;
        ctx.fillStyle = 'rgba(255, 220, 120, ' + glowAlpha + ')';
        ctx.fillRect(x - 6, y - 30, 14, 10);
        // Bulb
        drawRect(x, y - 25, 2, 1, '#ffdd80');
    }

    function drawWelcomeSign(x, y) {
        // Posts
        drawRect(x, y - 28, 3, 28, '#5a3818');
        drawRect(x + 70, y - 28, 3, 28, '#5a3818');
        // Sign board
        drawRect(x - 2, y - 32, 78, 16, '#2a4a60');
        drawRect(x, y - 30, 74, 12, '#1a3a50');
        // Text
        ctx.font = '5px "Press Start 2P", monospace';
        ctx.fillStyle = '#e0d8a0';
        ctx.textAlign = 'center';
        ctx.fillText('WELCOME TO', x + 37, y - 29);
        ctx.fillStyle = '#ffd844';
        ctx.fillText('ABUNDANCE BAY', x + 37, y - 22);
    }

    function drawSceneryDetails(time) {
        // Trees scattered around
        drawTree(40, BUILDING_FLOOR, 1.2);
        drawTree(100, BUILDING_FLOOR + 5, 0.9);
        drawTree(440, BUILDING_FLOOR, 1.0);
        drawTree(500, BUILDING_FLOOR + 3, 0.8);
        drawTree(690, BUILDING_FLOOR - 2, 1.1);
        drawTree(750, BUILDING_FLOOR + 5, 0.7);

        // Palm trees near the coast
        drawPalmTree(770, BUILDING_FLOOR - 5);

        // Lampposts
        drawLamppost(200, BUILDING_FLOOR, time);
        drawLamppost(ROAD_X + ROAD_W / 2, BUILDING_FLOOR, time);
        drawLamppost(600, BUILDING_FLOOR, time);

        // Welcome sign near the road
        drawWelcomeSign(ROAD_X - 25, BUILDING_FLOOR + 15);
    }

    // =========================================================================
    //  SEAGULLS
    // =========================================================================

    function initSeagulls() {
        seagulls = [];
        for (var i = 0; i < 8; i++) {
            seagulls.push({
                x: seededRandom(i * 311) * W,
                y: 30 + seededRandom(i * 419) * 120,
                speed: 0.3 + seededRandom(i * 523) * 0.5,
                wingPhase: seededRandom(i * 631) * Math.PI * 2,
                dir: seededRandom(i * 739) > 0.5 ? 1 : -1
            });
        }
        seagullsInited = true;
    }

    function drawSeagulls(time) {
        if (!seagullsInited) initSeagulls();

        for (var i = 0; i < seagulls.length; i++) {
            var sg = seagulls[i];
            sg.x += sg.speed * sg.dir;
            sg.y += Math.sin(time * 0.001 + i * 2) * 0.15;

            // Wrap around
            if (sg.x > W + 20) { sg.x = -20; sg.y = 30 + seededRandom(time * 0.001 + i) * 100; }
            if (sg.x < -20) { sg.x = W + 20; sg.y = 30 + seededRandom(time * 0.001 + i) * 100; }

            var wing = Math.sin(time * 0.008 + sg.wingPhase) * 3;
            var bx = Math.floor(sg.x);
            var by = Math.floor(sg.y);

            // Body
            ctx.fillStyle = '#d0d0d8';
            ctx.fillRect(bx, by, 3, 1);
            // Wings
            ctx.fillRect(bx - 2, by - 1 + Math.floor(wing * 0.5), 2, 1);
            ctx.fillRect(bx + 3, by - 1 - Math.floor(wing * 0.5), 2, 1);
        }
    }

    // =========================================================================
    //  SMOKE / STEAM PARTICLES
    // =========================================================================

    function spawnSmoke(x, y) {
        if (smokeParticles.length > 60) return;
        smokeParticles.push({
            x: x + (Math.random() - 0.5) * 4,
            y: y,
            vx: (Math.random() - 0.5) * 0.3,
            vy: -0.3 - Math.random() * 0.3,
            life: 1.0,
            size: 2 + Math.random() * 3
        });
    }

    function updateAndDrawSmoke(time) {
        for (var i = smokeParticles.length - 1; i >= 0; i--) {
            var p = smokeParticles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.008;
            p.size += 0.05;

            if (p.life <= 0) {
                smokeParticles.splice(i, 1);
                continue;
            }

            var alpha = p.life * 0.3;
            ctx.fillStyle = 'rgba(140, 140, 160, ' + alpha + ')';
            ctx.fillRect(Math.floor(p.x), Math.floor(p.y), Math.floor(p.size), Math.floor(p.size));
        }
    }

    // =========================================================================
    //  BUILDING RENDERERS — Each type has a unique procedural look
    // =========================================================================

    // Helper: draw a window grid on a building face
    function drawWindows(bx, by, bw, bh, time, seed, litColor, unlitColor) {
        litColor = litColor || '#40ff80';
        unlitColor = unlitColor || '#203050';
        var winW = 4, winH = 5, padX = 6, padY = 8;

        for (var wy = by + 6; wy < by + bh - 8; wy += winH + padY) {
            for (var wx = bx + 5; wx < bx + bw - 6; wx += winW + padX) {
                var lit = Math.sin(time * 0.0008 + seed + wx * 0.3 + wy * 0.2) > -0.2;
                drawRect(wx, wy, winW, winH, lit ? litColor : unlitColor);
            }
        }
    }

    // Helper: draw server lights (blinking LEDs)
    function drawServerLights(bx, by, bw, bh, time, seed) {
        for (var ly = by + 4; ly < by + bh - 4; ly += 6) {
            for (var lx = bx + 3; lx < bx + bw - 3; lx += 5) {
                var phase = Math.sin(time * 0.003 + seed + lx * 0.7 + ly * 1.3);
                var color;
                if (phase > 0.6) color = '#40ff80';
                else if (phase > 0.2) color = '#ff4040';
                else if (phase > -0.2) color = '#4080ff';
                else color = '#203030';
                drawRect(lx, ly, 2, 2, color);
            }
        }
    }

    // --- CAMPUS BUILDINGS ---

    function drawResearchLab(bx, by, bw, bh, time) {
        var wallColor = '#2a3a6a';
        // Main body
        drawRect(bx, by, bw, bh, wallColor);
        drawRect(bx + 2, by + 2, bw - 4, bh - 4, lightenColor(wallColor, 15));
        // Roof
        drawRect(bx - 1, by - 2, bw + 2, 4, '#3a4a7a');
        // Antenna on top
        drawRect(bx + bw / 2 - 1, by - 14, 2, 14, '#6a6a8a');
        drawRect(bx + bw / 2 - 3, by - 16, 6, 3, '#8a8aaa');
        // Blinking antenna light
        var blink = Math.sin(time * 0.005) > 0;
        drawRect(bx + bw / 2 - 1, by - 17, 2, 2, blink ? '#ff4040' : '#601010');
        // Windows with blue tint
        drawWindows(bx, by, bw, bh, time, 100, '#4080ff', '#182848');
        // Door
        drawRect(bx + bw / 2 - 3, by + bh - 10, 6, 10, '#182040');
    }

    function drawSafetyDept(bx, by, bw, bh, time) {
        var wallColor = '#2a5a3a';
        drawRect(bx, by, bw, bh, wallColor);
        drawRect(bx + 2, by + 2, bw - 4, bh - 4, lightenColor(wallColor, 12));
        // Roof
        drawRect(bx - 1, by - 2, bw + 2, 4, '#3a6a4a');
        // Shield emblem on front (triangle shape)
        var sx = bx + bw / 2;
        var sy = by + 8;
        drawRect(sx - 5, sy, 10, 2, '#60c060');
        drawRect(sx - 4, sy + 2, 8, 2, '#60c060');
        drawRect(sx - 3, sy + 4, 6, 2, '#60c060');
        drawRect(sx - 2, sy + 6, 4, 2, '#60c060');
        drawRect(sx - 1, sy + 8, 2, 2, '#60c060');
        // Green accent stripe
        drawRect(bx, by + bh / 2, bw, 2, '#40a040');
        // Windows
        drawWindows(bx, by + 14, bw, bh - 14, time, 200, '#40ff80', '#183018');
        // Door
        drawRect(bx + bw / 2 - 3, by + bh - 10, 6, 10, '#183018');
    }

    function drawDataCenter(bx, by, bw, bh, time) {
        var wallColor = '#3a3a4a';
        // Tall industrial body
        drawRect(bx, by, bw, bh, wallColor);
        drawRect(bx + 1, by + 1, bw - 2, bh - 2, '#424252');
        // Roof with cooling fans
        drawRect(bx - 2, by - 3, bw + 4, 5, '#505060');
        // Fan units on roof
        for (var fx = bx + 4; fx < bx + bw - 6; fx += 10) {
            drawRect(fx, by - 8, 8, 6, '#606070');
            drawRect(fx + 2, by - 6, 4, 2, '#808090');
        }
        // Server rack lights (the signature look)
        drawServerLights(bx + 2, by + 4, bw - 4, bh - 8, time, 300);
        // Ventilation stripes
        for (var vy = by + 4; vy < by + bh - 4; vy += 3) {
            drawRect(bx, vy, 2, 1, '#505060');
            drawRect(bx + bw - 2, vy, 2, 1, '#505060');
        }
        // Spawn smoke from cooling
        if (Math.random() < 0.1) {
            spawnSmoke(bx + bw / 2, by - 10);
        }
    }

    function drawMegaDataCenter(bx, by, bw, bh, time) {
        var wallColor = '#3a3a50';
        drawRect(bx, by, bw, bh, wallColor);
        drawRect(bx + 1, by + 1, bw - 2, bh - 2, '#42425a');
        // Heavy industrial roof
        drawRect(bx - 3, by - 4, bw + 6, 6, '#585868');
        // Multiple cooling units
        for (var fx = bx + 3; fx < bx + bw - 8; fx += 12) {
            drawRect(fx, by - 10, 10, 7, '#606070');
            drawRect(fx + 3, by - 8, 4, 3, '#909098');
        }
        // Double server racks
        drawServerLights(bx + 2, by + 3, bw / 2 - 2, bh - 6, time, 350);
        drawServerLights(bx + bw / 2 + 2, by + 3, bw / 2 - 4, bh - 6, time, 370);
        // Thick cable conduit
        drawRect(bx + bw / 2 - 1, by, 2, bh, '#505060');
        // Smoke
        if (Math.random() < 0.15) {
            spawnSmoke(bx + bw * 0.3, by - 12);
            spawnSmoke(bx + bw * 0.7, by - 12);
        }
    }

    function drawPowerPlant(bx, by, bw, bh, time) {
        var wallColor = '#4a3a2a';
        drawRect(bx, by, bw, bh, wallColor);
        drawRect(bx + 2, by + 2, bw - 4, bh - 4, '#5a4a3a');
        // Smokestacks
        var stackW = 6, stackH = 20;
        drawRect(bx + bw * 0.3 - stackW / 2, by - stackH, stackW, stackH + 2, '#605040');
        drawRect(bx + bw * 0.7 - stackW / 2, by - stackH, stackW, stackH + 2, '#605040');
        // Stack tops
        drawRect(bx + bw * 0.3 - stackW / 2 - 1, by - stackH - 2, stackW + 2, 3, '#706050');
        drawRect(bx + bw * 0.7 - stackW / 2 - 1, by - stackH - 2, stackW + 2, 3, '#706050');
        // Smoke
        if (Math.random() < 0.12) {
            spawnSmoke(bx + bw * 0.3, by - stackH - 4);
            spawnSmoke(bx + bw * 0.7, by - stackH - 4);
        }
        // Power symbol (lightning bolt-ish)
        drawRect(bx + bw / 2 - 1, by + 10, 4, 2, '#ffcc00');
        drawRect(bx + bw / 2, by + 12, 3, 3, '#ffcc00');
        drawRect(bx + bw / 2 + 1, by + 15, 2, 3, '#ffcc00');
        // Industrial door
        drawRect(bx + bw / 2 - 5, by + bh - 14, 10, 14, '#3a2a1a');
        drawRect(bx + bw / 2, by + bh - 12, 1, 10, '#4a3a2a');
    }

    function drawFusionReactor(bx, by, bw, bh, time) {
        var wallColor = '#2a3a5a';
        // Dome-like structure
        drawRect(bx, by + bh * 0.3, bw, bh * 0.7, wallColor);
        drawRect(bx + 2, by + bh * 0.3 + 2, bw - 4, bh * 0.7 - 4, '#3a4a6a');
        // Dome top
        drawRect(bx + 4, by + bh * 0.15, bw - 8, bh * 0.2, '#3a4a6a');
        drawRect(bx + 8, by + bh * 0.05, bw - 16, bh * 0.15, '#4a5a7a');
        drawRect(bx + 12, by, bw - 24, bh * 0.1, '#5a6a8a');
        // Glowing core
        var glow = 0.4 + Math.sin(time * 0.004) * 0.2;
        ctx.fillStyle = 'rgba(100, 180, 255, ' + glow + ')';
        ctx.fillRect(bx + bw / 2 - 4, by + bh * 0.5, 8, 8);
        // Energy ring
        drawRect(bx - 2, by + bh * 0.4, bw + 4, 2, '#4488ff');
    }

    function drawChipFab(bx, by, bw, bh, time) {
        var wallColor = '#c0c0c8';
        // Clean white/silver exterior
        drawRect(bx, by, bw, bh, darkenColor(wallColor, 0.4));
        drawRect(bx + 1, by + 1, bw - 2, bh - 2, darkenColor(wallColor, 0.5));
        // Clean room stripe
        drawRect(bx, by + 4, bw, 2, '#4488cc');
        drawRect(bx, by + bh - 6, bw, 2, '#4488cc');
        // Precision equipment rectangles inside
        for (var ex = bx + 4; ex < bx + bw - 6; ex += 8) {
            drawRect(ex, by + 10, 5, 4, '#a0a0b0');
            drawRect(ex + 1, by + 11, 3, 2, '#8080a0');
        }
        // Clean room airlock door
        drawRect(bx + bw / 2 - 4, by + bh - 10, 8, 10, '#8888a0');
        drawRect(bx + bw / 2 - 3, by + bh - 9, 6, 8, '#a0a0b8');
    }

    function drawAdvancedChipFab(bx, by, bw, bh, time) {
        drawChipFab(bx, by, bw, bh, time);
        // Extra: golden accent + larger
        drawRect(bx, by + 2, bw, 2, '#cc9944');
        drawRect(bx, by + bh - 4, bw, 2, '#cc9944');
        // Spinning progress indicator
        var spin = Math.floor(time * 0.002) % 4;
        var indX = bx + bw - 8;
        var indY = by + 4;
        drawRect(indX + spin, indY, 2, 2, '#44ccff');
    }

    function drawCookieKitchen(bx, by, bw, bh, time) {
        var wallColor = '#6a4020';
        // Cozy warm building
        drawRect(bx, by, bw, bh, wallColor);
        drawRect(bx + 1, by + 1, bw - 2, bh - 2, '#7a5030');
        // Pointed roof
        drawRect(bx - 2, by - 2, bw + 4, 4, '#5a3018');
        drawRect(bx + 2, by - 5, bw - 4, 4, '#5a3018');
        // Chimney with warm glow
        drawRect(bx + bw - 10, by - 16, 6, 14, '#5a3018');
        // Warm orange glow from chimney
        var warmGlow = 0.3 + Math.sin(time * 0.003) * 0.15;
        ctx.fillStyle = 'rgba(255, 160, 40, ' + warmGlow + ')';
        ctx.fillRect(bx + bw - 12, by - 20, 10, 6);
        // Cookie smoke
        if (Math.random() < 0.08) spawnSmoke(bx + bw - 7, by - 18);
        // Window with warm light
        drawRect(bx + 4, by + 6, 8, 8, '#ff9930');
        drawRect(bx + 5, by + 7, 6, 6, '#ffbb60');
        // Door
        drawRect(bx + bw / 2 - 3, by + bh - 10, 6, 10, '#4a2810');
        // Door handle
        drawRect(bx + bw / 2 + 1, by + bh - 6, 1, 1, '#c0a040');
    }

    function drawTalentOffice(bx, by, bw, bh, time) {
        var wallColor = '#5a3060';
        drawRect(bx, by, bw, bh, wallColor);
        drawRect(bx + 1, by + 1, bw - 2, bh - 2, '#6a4070');
        // Flat roof
        drawRect(bx - 1, by - 2, bw + 2, 4, '#7a5080');
        // Windows
        drawWindows(bx, by, bw, bh, time, 700, '#ff88ff', '#301830');
        // HIRING sign
        var signFlash = Math.sin(time * 0.004) > 0;
        if (signFlash) {
            drawRect(bx + 2, by + bh - 18, bw - 4, 8, '#200020');
            ctx.font = '5px "Press Start 2P", monospace';
            ctx.fillStyle = '#ff44ff';
            ctx.textAlign = 'center';
            ctx.fillText('HIRING', bx + bw / 2, by + bh - 16);
        }
    }

    function drawPoachingDept(bx, by, bw, bh, time) {
        drawTalentOffice(bx, by, bw, bh, time);
        // Sunglasses icon on top (stealth)
        drawRect(bx + bw / 2 - 5, by + 4, 4, 2, '#101010');
        drawRect(bx + bw / 2 + 1, by + 4, 4, 2, '#101010');
        drawRect(bx + bw / 2 - 1, by + 5, 2, 1, '#101010');
    }

    function drawTrainingCenter(bx, by, bw, bh, time) {
        var wallColor = '#4a3868';
        drawRect(bx, by, bw, bh, wallColor);
        drawRect(bx + 2, by + 2, bw - 4, bh - 4, '#5a4878');
        drawRect(bx - 1, by - 2, bw + 2, 4, '#6a5888');
        drawWindows(bx, by, bw, bh, time, 720, '#cc88ff', '#281838');
        // Graduation cap icon
        drawRect(bx + bw / 2 - 4, by - 6, 8, 2, '#202020');
        drawRect(bx + bw / 2 - 2, by - 8, 4, 3, '#202020');
    }

    function drawDeploymentCenter(bx, by, bw, bh, time) {
        var wallColor = '#2a5a5a';
        drawRect(bx, by, bw, bh, wallColor);
        drawRect(bx + 1, by + 1, bw - 2, bh - 2, '#3a6a6a');
        drawRect(bx - 1, by - 2, bw + 2, 4, '#4a7a7a');
        // Antenna/rocket on top
        drawRect(bx + bw / 2 - 2, by - 18, 4, 18, '#5a8a8a');
        drawRect(bx + bw / 2 - 4, by - 8, 8, 3, '#6a9a9a');
        // Dish
        drawRect(bx + bw / 2 - 5, by - 20, 10, 3, '#7aaaaa');
        // Blinking top light
        var blink = Math.sin(time * 0.006) > 0;
        drawRect(bx + bw / 2 - 1, by - 21, 2, 2, blink ? '#44ffdd' : '#104030');
        // Windows
        drawWindows(bx, by, bw, bh, time, 800, '#44ffdd', '#103838');
    }

    function drawScaleCenter(bx, by, bw, bh, time) {
        drawDeploymentCenter(bx, by, bw, bh, time);
        // Extra satellite dishes
        drawRect(bx + 4, by - 12, 6, 2, '#6a9a9a');
        drawRect(bx + bw - 10, by - 14, 6, 2, '#6a9a9a');
    }

    function drawDiplomacyWing(bx, by, bw, bh, time) {
        var wallColor = '#5a5020';
        drawRect(bx, by, bw, bh, wallColor);
        drawRect(bx + 1, by + 1, bw - 2, bh - 2, '#6a6030');
        // Columns
        drawRect(bx + 2, by + 4, 3, bh - 4, '#8a7a40');
        drawRect(bx + bw - 5, by + 4, 3, bh - 4, '#8a7a40');
        // Grand entrance
        drawRect(bx + bw / 2 - 5, by + bh - 14, 10, 14, '#4a4018');
        drawRect(bx + bw / 2 - 4, by + bh - 12, 8, 10, '#5a5028');
        // Flag on top
        drawRect(bx + bw / 2, by - 12, 2, 12, '#8a7a40');
        drawRect(bx + bw / 2 + 2, by - 12, 6, 4, '#ffdd44');
        drawWindows(bx, by, bw, bh, time, 850, '#ffdd44', '#302810');
    }

    function drawRobotFactory(bx, by, bw, bh, time) {
        var wallColor = '#4a2020';
        drawRect(bx, by, bw, bh, wallColor);
        drawRect(bx + 1, by + 1, bw - 2, bh - 2, '#5a3030');
        drawRect(bx - 2, by - 3, bw + 4, 5, '#6a3030');
        // Robot eye
        var eyeGlow = Math.sin(time * 0.004) > 0 ? '#ff4040' : '#601010';
        drawRect(bx + bw / 2 - 4, by + 6, 3, 3, eyeGlow);
        drawRect(bx + bw / 2 + 1, by + 6, 3, 3, eyeGlow);
        // Assembly line (moving dots)
        var lineOffset = Math.floor(time * 0.01) % 8;
        for (var lx = bx + 4; lx < bx + bw - 4; lx += 8) {
            drawRect(lx + lineOffset, by + bh / 2, 3, 2, '#ff8844');
        }
        // Smoke
        if (Math.random() < 0.1) spawnSmoke(bx + bw / 2, by - 5);
    }

    function drawMarsLaunchpad(bx, by, bw, bh, time) {
        // Launch pad base
        drawRect(bx, by + bh * 0.6, bw, bh * 0.4, '#505058');
        drawRect(bx + 2, by + bh * 0.6 + 2, bw - 4, bh * 0.4 - 4, '#606068');
        // Rocket body
        var rocketX = bx + bw / 2 - 4;
        drawRect(rocketX, by - 10, 8, bh * 0.7, '#d0d0d8');
        drawRect(rocketX + 1, by - 8, 6, bh * 0.65, '#e0e0e8');
        // Nose cone
        drawRect(rocketX + 1, by - 16, 6, 4, '#ff4444');
        drawRect(rocketX + 2, by - 19, 4, 4, '#ff4444');
        drawRect(rocketX + 3, by - 21, 2, 3, '#ff4444');
        // Fins
        drawRect(rocketX - 3, by + bh * 0.5, 4, 8, '#cc3030');
        drawRect(rocketX + 7, by + bh * 0.5, 4, 8, '#cc3030');
        // Flame glow
        var flameAlpha = 0.2 + Math.sin(time * 0.008) * 0.1;
        ctx.fillStyle = 'rgba(255, 140, 40, ' + flameAlpha + ')';
        ctx.fillRect(rocketX + 1, by + bh * 0.55, 6, 10);
    }

    // --- TOWN BUILDINGS ---

    function drawCommunityCenter(bx, by, bw, bh, time) {
        var wallColor = '#5a6a3a';
        drawRect(bx, by, bw, bh, wallColor);
        drawRect(bx + 1, by + 1, bw - 2, bh - 2, '#6a7a4a');
        // Welcoming open door
        drawRect(bx + bw / 2 - 5, by + bh - 14, 10, 14, '#3a4a20');
        drawRect(bx + bw / 2 - 4, by + bh - 13, 3, 12, '#8a9a50');
        drawRect(bx + bw / 2 + 1, by + bh - 13, 3, 12, '#8a9a50');
        // Roof
        drawRect(bx - 2, by - 3, bw + 4, 5, '#7a8a5a');
        // Heart icon on front
        drawRect(bx + bw / 2 - 2, by + 6, 2, 2, '#ff6060');
        drawRect(bx + bw / 2 + 1, by + 6, 2, 2, '#ff6060');
        drawRect(bx + bw / 2 - 3, by + 7, 7, 2, '#ff6060');
        drawRect(bx + bw / 2 - 2, by + 9, 5, 2, '#ff6060');
        drawRect(bx + bw / 2 - 1, by + 11, 3, 1, '#ff6060');
        drawRect(bx + bw / 2, by + 12, 1, 1, '#ff6060');
        // Windows
        drawWindows(bx, by + 14, bw, bh - 20, time, 900, '#ffee88', '#3a3018');
    }

    function drawPub(bx, by, bw, bh, time) {
        var wallColor = '#5a3020';
        drawRect(bx, by, bw, bh, wallColor);
        drawRect(bx + 1, by + 1, bw - 2, bh - 2, '#6a4030');
        // Pitched roof
        drawRect(bx - 2, by - 2, bw + 4, 4, '#4a2818');
        drawRect(bx + 2, by - 5, bw - 4, 4, '#4a2818');
        // Pub sign hanging outside
        drawRect(bx - 6, by + 4, 2, 12, '#8a6040');
        drawRect(bx - 14, by + 6, 12, 8, '#2a1808');
        ctx.font = '4px "Press Start 2P", monospace';
        ctx.fillStyle = '#ffcc44';
        ctx.textAlign = 'center';
        ctx.fillText('PUB', bx - 8, by + 8);
        // Warm windows
        drawRect(bx + 4, by + 8, 10, 8, '#ff9930');
        drawRect(bx + 5, by + 9, 8, 6, '#ffbb60');
        drawRect(bx + bw - 14, by + 8, 10, 8, '#ff9930');
        drawRect(bx + bw - 13, by + 9, 8, 6, '#ffbb60');
        // Door
        drawRect(bx + bw / 2 - 4, by + bh - 12, 8, 12, '#3a1808');
        drawRect(bx + bw / 2 + 2, by + bh - 8, 1, 1, '#c0a040');
    }

    function drawFishChipShop(bx, by, bw, bh, time) {
        var wallColor = '#4a5a6a';
        drawRect(bx, by, bw, bh, wallColor);
        drawRect(bx + 1, by + 1, bw - 2, bh - 2, '#5a6a7a');
        // Awning
        for (var aw = bx; aw < bx + bw; aw += 6) {
            drawRect(aw, by - 3, 3, 5, '#cc4444');
            drawRect(aw + 3, by - 3, 3, 5, '#ffffff');
        }
        // Counter window
        drawRect(bx + 3, by + 6, bw - 6, 10, '#ffee88');
        drawRect(bx + 4, by + 7, bw - 8, 8, '#ffdd66');
        // Steam rising from shop
        if (Math.random() < 0.08) spawnSmoke(bx + bw / 2, by - 5);
        // Door
        drawRect(bx + bw / 2 - 3, by + bh - 10, 6, 10, '#3a4a5a');
        // Fish & Chips text
        ctx.font = '4px "Press Start 2P", monospace';
        ctx.fillStyle = '#ffe844';
        ctx.textAlign = 'center';
        ctx.fillText('FISH', bx + bw / 2, by + 20);
    }

    function drawHarbor(bx, by, bw, bh, time) {
        // Dock planks
        drawRect(bx, by + bh - 6, bw, 6, '#5a4020');
        for (var px = bx; px < bx + bw; px += 8) {
            drawRect(px, by + bh - 6, 1, 6, '#4a3018');
        }
        // Dock posts
        drawRect(bx, by, 4, bh, '#5a4020');
        drawRect(bx + bw - 4, by, 4, bh, '#5a4020');
        drawRect(bx + bw / 2 - 2, by + 4, 4, bh - 4, '#5a4020');
        // Rope
        drawRect(bx + 4, by + 6, bw - 8, 1, '#8a7a50');
        // Boat 1
        var boatBob = Math.sin(time * 0.002) * 2;
        drawRect(bx + 6, by + 12 + boatBob, 16, 4, '#6a3020');
        drawRect(bx + 8, by + 10 + boatBob, 12, 3, '#7a4030');
        drawRect(bx + 13, by + 4 + boatBob, 2, 8, '#8a7050'); // mast
        drawRect(bx + 13, by + 4 + boatBob, 6, 4, '#e0e0e0'); // sail
        // Boat 2
        var boat2Bob = Math.sin(time * 0.002 + 1.5) * 2;
        drawRect(bx + bw - 22, by + 14 + boat2Bob, 14, 3, '#5a2818');
        drawRect(bx + bw - 20, by + 12 + boat2Bob, 10, 3, '#6a3828');
    }

    function drawSchool(bx, by, bw, bh, time) {
        var wallColor = '#6a5040';
        drawRect(bx, by, bw, bh, wallColor);
        drawRect(bx + 1, by + 1, bw - 2, bh - 2, '#7a6050');
        // Roof
        drawRect(bx - 2, by - 2, bw + 4, 4, '#5a4030');
        // Clock tower
        drawRect(bx + bw / 2 - 5, by - 14, 10, 14, '#6a5040');
        drawRect(bx + bw / 2 - 6, by - 16, 12, 4, '#5a4030');
        // Clock face
        drawRect(bx + bw / 2 - 3, by - 12, 6, 6, '#e0e0d0');
        // Clock hands
        var cx = bx + bw / 2;
        var cy = by - 9;
        drawRect(cx - 1, cy - 1, 2, 2, '#202020'); // center
        // Playground (colored dots)
        var pgY = by + bh + 2;
        drawRect(bx + 4, pgY, 3, 3, '#ff4444'); // slide
        drawRect(bx + 10, pgY, 2, 4, '#4444ff'); // swing post
        drawRect(bx + 16, pgY + 1, 4, 2, '#44aa44'); // seesaw
        // Windows
        drawWindows(bx, by, bw, bh, time, 950, '#ffee88', '#3a2818');
    }

    function drawFiberInternet(bx, by, bw, bh, time) {
        // Antenna tower
        var towerX = bx + bw / 2 - 3;
        drawRect(towerX, by - 30, 6, bh + 30, '#707078');
        // Cross braces
        for (var br = by - 25; br < by + bh; br += 10) {
            drawRect(towerX - 4, br, 14, 2, '#606068');
        }
        // Satellite dish
        drawRect(towerX - 8, by - 20, 10, 3, '#9090a0');
        drawRect(towerX - 6, by - 24, 6, 5, '#a0a0b0');
        drawRect(towerX - 3, by - 26, 3, 3, '#b0b0c0');
        // Signal waves (animated)
        var wave = Math.floor(time * 0.003) % 3;
        for (var w = 0; w <= wave; w++) {
            var wAlpha = 0.3 - w * 0.1;
            ctx.fillStyle = 'rgba(100, 200, 255, ' + wAlpha + ')';
            ctx.fillRect(towerX - 10 - w * 6, by - 28 - w * 4, 2, 2);
            ctx.fillRect(towerX + 10 + w * 6, by - 28 - w * 4, 2, 2);
        }
        // Blinking top light
        var blink = Math.sin(time * 0.005) > 0;
        drawRect(towerX + 2, by - 32, 2, 2, blink ? '#ff2020' : '#400808');
        // Base
        drawRect(bx, by + bh - 8, bw, 8, '#505058');
    }

    function drawRenewableEnergy(bx, by, bw, bh, time) {
        // Solar panels on ground
        for (var sp = 0; sp < 3; sp++) {
            var spx = bx + sp * 12 + 2;
            drawRect(spx, by + bh - 8, 10, 6, '#2244aa');
            drawRect(spx + 1, by + bh - 7, 8, 4, '#3355bb');
            // Grid lines on panel
            drawRect(spx + 4, by + bh - 7, 1, 4, '#4466cc');
            drawRect(spx + 1, by + bh - 5, 8, 1, '#4466cc');
        }
        // Wind turbine
        var turbX = bx + bw / 2;
        drawRect(turbX - 1, by, 3, bh - 10, '#c0c0c8');
        // Blades (rotating)
        var angle = time * 0.003;
        for (var blade = 0; blade < 3; blade++) {
            var ba = angle + blade * (Math.PI * 2 / 3);
            var bladeEndX = Math.cos(ba) * 12;
            var bladeEndY = Math.sin(ba) * 12;
            ctx.strokeStyle = '#d0d0d8';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(turbX, by + 2);
            ctx.lineTo(turbX + bladeEndX, by + 2 + bladeEndY);
            ctx.stroke();
        }
        // Hub
        drawRect(turbX - 1, by, 3, 3, '#e0e0e8');
    }

    function drawHousing(bx, by, bw, bh, time) {
        // Row of small houses
        var houseW = Math.floor(bw / 3);
        var houseColors = ['#6a4030', '#5a5a3a', '#4a3a5a'];
        var roofColors = ['#8a3020', '#4a6a30', '#5a3a6a'];

        for (var hi = 0; hi < 3; hi++) {
            var hx = bx + hi * houseW;
            var hy = by;
            // Walls
            drawRect(hx, hy, houseW - 2, bh, houseColors[hi]);
            drawRect(hx + 1, hy + 1, houseW - 4, bh - 2, lightenColor(houseColors[hi], 20));
            // Pointed roof
            drawRect(hx - 1, hy - 2, houseW, 4, roofColors[hi]);
            drawRect(hx + 2, hy - 5, houseW - 6, 4, roofColors[hi]);
            // Window
            var winLit = Math.sin(time * 0.001 + hi * 3) > 0;
            drawRect(hx + 3, hy + 4, 4, 4, winLit ? '#ffdd60' : '#302818');
            // Door
            drawRect(hx + houseW - 7, hy + bh - 8, 4, 8, darkenColor(houseColors[hi], 0.6));
        }
    }

    function drawGarden(bx, by, bw, bh, time) {
        // Green space
        drawRect(bx, by, bw, bh, '#1a5020');
        drawRect(bx + 1, by + 1, bw - 2, bh - 2, '#206028');
        // Flowers (colored pixels scattered)
        var flowerColors = ['#ff4444', '#ffdd44', '#ff88ff', '#4488ff', '#ff8844', '#44ffaa'];
        for (var f = 0; f < 12; f++) {
            var fx = bx + 2 + seededRandom(f * 131) * (bw - 4);
            var fy = by + 2 + seededRandom(f * 157) * (bh - 4);
            var bloom = Math.sin(time * 0.002 + f * 1.2) > -0.5;
            if (bloom) {
                ctx.fillStyle = flowerColors[f % flowerColors.length];
                ctx.fillRect(Math.floor(fx), Math.floor(fy), 2, 2);
                // Stem
                ctx.fillStyle = '#107010';
                ctx.fillRect(Math.floor(fx), Math.floor(fy) + 2, 1, 2);
            }
        }
        // Fence
        for (var fenceX = bx; fenceX < bx + bw; fenceX += 6) {
            drawRect(fenceX, by - 2, 1, 4, '#6a5030');
        }
        drawRect(bx, by, bw, 1, '#6a5030');
    }

    function drawTownBeautification(bx, by, bw, bh, time) {
        // Fountain / park area
        drawRect(bx, by, bw, bh, '#1a4820');
        // Fountain base
        drawRect(bx + bw / 2 - 6, by + bh / 2 - 2, 12, 6, '#707080');
        drawRect(bx + bw / 2 - 4, by + bh / 2, 8, 3, '#8080a0');
        // Water spray
        var sprayH = 4 + Math.sin(time * 0.004) * 2;
        ctx.fillStyle = 'rgba(80, 140, 220, 0.5)';
        ctx.fillRect(bx + bw / 2 - 1, by + bh / 2 - sprayH, 2, sprayH);
        // Benches
        drawRect(bx + 3, by + bh - 4, 8, 2, '#5a4020');
        drawRect(bx + bw - 11, by + bh - 4, 8, 2, '#5a4020');
        // Decorative bushes
        drawRect(bx + 2, by + 2, 5, 4, '#1a6820');
        drawRect(bx + bw - 7, by + 2, 5, 4, '#1a6820');
    }

    function drawMedicalClinic(bx, by, bw, bh, time) {
        var wallColor = '#e0e0e8';
        drawRect(bx, by, bw, bh, darkenColor(wallColor, 0.35));
        drawRect(bx + 1, by + 1, bw - 2, bh - 2, darkenColor(wallColor, 0.45));
        drawRect(bx - 1, by - 2, bw + 2, 4, darkenColor(wallColor, 0.5));
        // Red cross
        drawRect(bx + bw / 2 - 1, by + 4, 3, 9, '#ff2020');
        drawRect(bx + bw / 2 - 4, by + 7, 9, 3, '#ff2020');
        // Door
        drawRect(bx + bw / 2 - 3, by + bh - 10, 6, 10, '#a0a0b0');
        drawWindows(bx, by + 14, bw, bh - 20, time, 980, '#eeeeff', '#4a4a58');
    }

    // Dispatch table: building type -> draw function
    var CAMPUS_DRAW = {
        small_lab: drawResearchLab,
        large_lab: drawResearchLab,
        safety_dept: drawSafetyDept,
        data_center: drawDataCenter,
        mega_data_center: drawMegaDataCenter,
        power_plant: drawPowerPlant,
        fusion_reactor: drawFusionReactor,
        chip_fab: drawChipFab,
        advanced_chip_fab: drawAdvancedChipFab,
        cookie_kitchen: drawCookieKitchen,
        talent_office: drawTalentOffice,
        poaching_dept: drawPoachingDept,
        training_center: drawTrainingCenter,
        deployment_center: drawDeploymentCenter,
        scale_center: drawScaleCenter,
        diplomacy_wing: drawDiplomacyWing,
        robot_factory: drawRobotFactory,
        mars_launchpad: drawMarsLaunchpad
    };

    var TOWN_DRAW = {
        community_center: drawCommunityCenter,
        pub_upgrade: drawPub,
        fish_chip_shop: drawFishChipShop,
        harbor_upgrade: drawHarbor,
        school_upgrade: drawSchool,
        fiber_internet: drawFiberInternet,
        renewable_energy: drawRenewableEnergy,
        housing_development: drawHousing,
        town_beautification: drawTownBeautification,
        medical_clinic: drawMedicalClinic
    };

    // =========================================================================
    //  BUILDING LAYOUT ENGINE
    // =========================================================================

    // Compute screen position for a campus building (left side)
    function campusBuildingPos(index, buildingData) {
        var bSize = buildingData && buildingData.size ? buildingData.size : { w: 1, h: 1 };
        var col = index % 4;
        var row = Math.floor(index / 4);
        var cellW = 100;
        var cellH = 55;
        var bw = Math.max(30, bSize.w * 38);
        var bh = Math.max(28, bSize.h * 30);
        var bx = CAMPUS_LEFT + col * cellW + (cellW - bw) / 2;
        var by = BUILDING_FLOOR - bh - row * cellH;
        return { x: bx, y: by, w: bw, h: bh };
    }

    // Compute screen position for a town building (right side)
    function townBuildingPos(index, buildingData) {
        var bSize = buildingData && buildingData.size ? buildingData.size : { w: 1, h: 1 };
        var col = index % 4;
        var row = Math.floor(index / 4);
        var cellW = 80;
        var cellH = 50;
        var bw = Math.max(28, bSize.w * 34);
        var bh = Math.max(24, bSize.h * 26);
        var bx = TOWN_RIGHT - col * cellW - bw + (cellW - bw) / 2;
        var by = BUILDING_FLOOR - bh - row * cellH;
        return { x: bx, y: by, w: bw, h: bh };
    }

    // =========================================================================
    //  FALLBACK BUILDING (generic, uses category color)
    // =========================================================================

    function drawGenericBuilding(bx, by, bw, bh, time, buildingData) {
        var cat = null;
        if (buildingData && GAME.DATA && GAME.DATA.BUILDING_CATEGORIES) {
            cat = GAME.DATA.BUILDING_CATEGORIES[buildingData.category];
        }
        var baseColor = cat ? cat.color : '#5a5a8a';

        // Shadow
        drawRect(bx + 3, by + 3, bw, bh, 'rgba(0,0,0,0.25)');
        // Body
        drawRect(bx, by, bw, bh, darkenColor(baseColor, 0.35));
        drawRect(bx + 1, by + 1, bw - 2, bh - 2, darkenColor(baseColor, 0.45));
        // Roof
        drawRect(bx - 1, by - 2, bw + 2, 4, darkenColor(baseColor, 0.55));
        // Windows
        drawWindows(bx, by, bw, bh, time, bx * 7 + by * 3, lightenColor(baseColor, 60), darkenColor(baseColor, 0.25));
        // Door
        drawRect(bx + bw / 2 - 3, by + bh - 8, 6, 8, darkenColor(baseColor, 0.2));
    }

    // =========================================================================
    //  RENDER ALL BUILDINGS
    // =========================================================================

    function drawAllBuildings(state, time) {
        if (!state) return;

        // --- Campus buildings (left side) ---
        if (state.buildings && state.buildings.length > 0) {
            for (var ci = 0; ci < state.buildings.length; ci++) {
                var placed = state.buildings[ci];
                var bData = null;
                if (GAME.DATA && GAME.DATA.BUILDINGS) {
                    bData = GAME.DATA.BUILDINGS[placed.type];
                }
                var pos = campusBuildingPos(ci, bData);

                var drawFn = CAMPUS_DRAW[placed.type];
                if (drawFn) {
                    drawFn(pos.x, pos.y, pos.w, pos.h, time);
                } else {
                    drawGenericBuilding(pos.x, pos.y, pos.w, pos.h, time, bData);
                }

                // Building label below
                var label = bData ? bData.name : placed.type;
                if (label.length > 10) label = label.substring(0, 10);
                drawText(label, pos.x + pos.w / 2, pos.y + pos.h + 2, {
                    size: 5,
                    color: '#8080a0',
                    align: 'center'
                });
            }
        }

        // --- Town buildings (right side) ---
        if (state.townBuildings && state.townBuildings.length > 0) {
            for (var ti = 0; ti < state.townBuildings.length; ti++) {
                var tPlaced = state.townBuildings[ti];
                var tData = null;
                if (GAME.DATA && GAME.DATA.TOWN && GAME.DATA.TOWN.buildings) {
                    tData = GAME.DATA.TOWN.buildings[tPlaced.type];
                }
                var tPos = townBuildingPos(ti, tData);

                var tDrawFn = TOWN_DRAW[tPlaced.type];
                if (tDrawFn) {
                    tDrawFn(tPos.x, tPos.y, tPos.w, tPos.h, time);
                } else {
                    drawGenericBuilding(tPos.x, tPos.y, tPos.w, tPos.h, time, tData);
                }

                var tLabel = tData ? tData.name : tPlaced.type;
                if (tLabel.length > 10) tLabel = tLabel.substring(0, 10);
                drawText(tLabel, tPos.x + tPos.w / 2, tPos.y + tPos.h + 2, {
                    size: 5,
                    color: '#8080a0',
                    align: 'center'
                });
            }
        }
    }

    // =========================================================================
    //  PERMANENT TOWN FEATURES (always visible, even before player builds)
    // =========================================================================

    function drawBaseTownFeatures(time) {
        // Small houses in the background (the town exists already)
        var bgHouses = [
            { x: 540, y: 248, w: 18, h: 14, color: '#5a4838' },
            { x: 570, y: 245, w: 22, h: 17, color: '#4a5a40' },
            { x: 610, y: 250, w: 16, h: 12, color: '#5a3a3a' },
            { x: 640, y: 244, w: 20, h: 18, color: '#4a4860' },
            { x: 680, y: 248, w: 18, h: 14, color: '#5a5040' },
            { x: 710, y: 246, w: 22, h: 16, color: '#4a4a3a' },
            { x: 745, y: 250, w: 16, h: 12, color: '#5a4a4a' },
        ];

        for (var i = 0; i < bgHouses.length; i++) {
            var h = bgHouses[i];
            drawRect(h.x, h.y, h.w, h.h, h.color);
            drawRect(h.x + 1, h.y + 1, h.w - 2, h.h - 2, lightenColor(h.color, 15));
            // Roof
            drawRect(h.x - 1, h.y - 2, h.w + 2, 3, darkenColor(h.color, 0.7));
            // Window
            var lit = Math.sin(time * 0.001 + i * 2.7) > 0.1;
            drawRect(h.x + 3, h.y + 3, 4, 4, lit ? '#ffdd60' : '#302818');
            drawRect(h.x + h.w - 7, h.y + 3, 4, 4, lit ? '#ffcc40' : '#302818');
        }

        // Church steeple (background, always there)
        drawRect(620, 228, 14, 24, '#5a5060');
        drawRect(618, 250, 18, 12, '#4a4050');
        drawRect(625, 218, 4, 12, '#6a6070');
        // Cross on top
        drawRect(626, 214, 2, 6, '#8a8090');
        drawRect(624, 217, 6, 2, '#8a8090');
        // Church window
        drawRect(625, 238, 4, 6, '#ffcc40');

        // Harbor/dock background (always visible at far right near water)
        drawRect(WATER_X - 30, GROUND_Y + 10, 28, 4, '#5a4020');
        drawRect(WATER_X - 10, GROUND_Y + 4, 4, 20, '#5a4020');
        // Small boat at rest
        var boatBob = Math.sin(time * 0.0015) * 1.5;
        drawRect(WATER_X + 5, GROUND_Y + 8 + boatBob, 20, 5, '#6a3828');
        drawRect(WATER_X + 8, GROUND_Y + 6 + boatBob, 14, 3, '#7a4838');
        drawRect(WATER_X + 14, GROUND_Y - 2 + boatBob, 2, 10, '#8a7050');
        drawRect(WATER_X + 14, GROUND_Y - 2 + boatBob, 8, 4, '#e0d8d0');
    }

    // =========================================================================
    //  BASE CAMPUS (always visible — a few starter structures)
    // =========================================================================

    function drawBaseCampus(time) {
        // Perimeter fence on the left campus side
        for (var fx = CAMPUS_LEFT; fx < ROAD_X - 10; fx += 12) {
            drawRect(fx, GROUND_Y - 2, 1, 6, '#404850');
        }
        drawRect(CAMPUS_LEFT, GROUND_Y, ROAD_X - CAMPUS_LEFT - 10, 1, '#404850');

        // "AI CAMPUS" sign
        drawRect(CAMPUS_LEFT + 4, GROUND_Y - 8, 60, 8, '#1a2040');
        ctx.font = '5px "Press Start 2P", monospace';
        ctx.fillStyle = '#6688ff';
        ctx.textAlign = 'left';
        ctx.fillText('AI CAMPUS', CAMPUS_LEFT + 8, GROUND_Y - 6);
    }

    // =========================================================================
    //  WALKING PEOPLE
    // =========================================================================

    function drawWorkers(state, time) {
        if (!state) return;
        var talentCount = state.totalTalent || 5;
        var workerCount = Math.min(25, Math.floor(talentCount / 2) + 3);

        var skinColors = ['#f0c890', '#d0a060', '#a07030', '#e8c090', '#c08850'];
        var shirtColors = ['#3060a0', '#a03030', '#30a060', '#606060', '#a06030',
                           '#6030a0', '#30a0a0', '#a06060', '#606030'];

        for (var i = 0; i < workerCount; i++) {
            var seed = i * 7919;
            var baseX = (seed * 13) % (WATER_X - 40);
            var walkSpeed = 15 + (seed % 25);
            var dir = (seed % 2 === 0) ? 1 : -1;
            var wx = (baseX + time * 0.015 * dir * (walkSpeed / 25)) % (WATER_X - 40);
            if (wx < 20) wx += WATER_X - 60;
            var wy = GROUND_Y + 15 + (seed % 70);
            var bounce = Math.abs(Math.sin(time * 0.006 + i * 2.3)) * 2;

            // Head
            ctx.fillStyle = skinColors[i % skinColors.length];
            ctx.fillRect(Math.floor(wx), Math.floor(wy - 8 - bounce), 4, 4);
            // Body
            ctx.fillStyle = shirtColors[i % shirtColors.length];
            ctx.fillRect(Math.floor(wx) - 1, Math.floor(wy - 4 - bounce), 6, 6);
            // Legs
            ctx.fillStyle = '#2a2a3a';
            var legFrame = Math.sin(time * 0.01 + i) > 0;
            ctx.fillRect(Math.floor(wx), Math.floor(wy + 2 - bounce), 2, 3);
            ctx.fillRect(Math.floor(wx) + 2, Math.floor(wy + 2 - bounce) + (legFrame ? 1 : 0), 2, 3);
        }

        // Town people (separate, right side)
        var townPop = state.townPopulation || 100;
        var townPeopleCount = Math.min(10, Math.floor(townPop / 30) + 2);
        for (var t = 0; t < townPeopleCount; t++) {
            var tseed = t * 3571 + 50000;
            var tbx = ROAD_X + ROAD_W + 20 + (tseed * 11) % (WATER_X - ROAD_X - ROAD_W - 60);
            var tDir = (tseed % 2 === 0) ? 1 : -1;
            var twx = (tbx + time * 0.01 * tDir * 0.8);
            // Keep in town area
            twx = ROAD_X + ROAD_W + 10 + (twx % (WATER_X - ROAD_X - ROAD_W - 50));
            if (twx < ROAD_X + ROAD_W + 10) twx += WATER_X - ROAD_X - ROAD_W - 50;
            var twy = GROUND_Y + 20 + (tseed % 50);
            var tbounce = Math.abs(Math.sin(time * 0.005 + t * 3.1)) * 1.5;

            ctx.fillStyle = skinColors[(t + 2) % skinColors.length];
            ctx.fillRect(Math.floor(twx), Math.floor(twy - 7 - tbounce), 3, 3);
            ctx.fillStyle = shirtColors[(t + 3) % shirtColors.length];
            ctx.fillRect(Math.floor(twx) - 1, Math.floor(twy - 4 - tbounce), 5, 5);
            ctx.fillStyle = '#2a2a3a';
            ctx.fillRect(Math.floor(twx), Math.floor(twy + 1 - tbounce), 2, 2);
            ctx.fillRect(Math.floor(twx) + 2, Math.floor(twy + 1 - tbounce), 2, 2);
        }
    }

    // =========================================================================
    //  YEAR / STATUS OVERLAY
    // =========================================================================

    function drawOverlay(state, time) {
        if (!state) return;

        // Year display (top left)
        var yearStr = 'Year: ' + (state.year || 2025);
        drawText(yearStr, 8, 6, { size: 7, color: '#6688aa' });

        // Population (top right-ish, near town)
        var popStr = 'Pop: ' + (state.townPopulation || 0);
        drawText(popStr, W - 170, 6, { size: 6, color: '#6688aa' });
    }

    // =========================================================================
    //  MAIN GAME SCENE — THE BIG ONE
    // =========================================================================

    function drawGameScene(state, time) {
        clear();

        // 1. Sky + stars
        drawSky(time);
        drawStars(time);

        // 2. Ocean (behind hills and buildings on the right)
        drawOcean(time);

        // 3. Hills and terrain
        drawHills(time);

        // 4. Ground plane
        drawGround(time);

        // 5. Base town features (always visible background buildings)
        drawBaseTownFeatures(time);

        // 6. Base campus features
        drawBaseCampus(time);

        // 7. Road dividing campus from town
        drawRoad(time);

        // 8. Player-placed buildings (campus + town)
        drawAllBuildings(state, time);

        // 9. Scenery details (trees, lampposts, sign)
        drawSceneryDetails(time);

        // 10. Walking people
        drawWorkers(state, time);

        // 11. Seagulls
        drawSeagulls(time);

        // 12. Smoke / steam particles
        updateAndDrawSmoke(time);

        // 13. UI overlay (year, status)
        drawOverlay(state, time);
    }

    // =========================================================================
    //  TITLE SCREEN SCENE
    // =========================================================================

    function drawTitleCityscape(time) {
        var groundY = H * 0.7;
        drawRect(0, groundY, W, H - groundY, '#1a2a1a');

        var buildings = [
            { x: 20, w: 60, h: 120 },
            { x: 100, w: 45, h: 80 },
            { x: 160, w: 70, h: 150 },
            { x: 250, w: 50, h: 100 },
            { x: 320, w: 80, h: 130 },
            { x: 420, w: 55, h: 90 },
            { x: 490, w: 90, h: 160 },
            { x: 600, w: 60, h: 110 },
            { x: 680, w: 70, h: 140 },
            { x: 770, w: 50, h: 95 },
            { x: 840, w: 80, h: 125 },
        ];

        buildings.forEach(function(b, idx) {
            var by = groundY - b.h;
            drawRect(b.x, by, b.w, b.h, '#3a3a5a');
            drawRect(b.x, by, b.w, 4, '#2a2a4a');
            drawOutline(b.x, by, b.w, b.h, '#4a4a6a');

            for (var wy = by + 12; wy < groundY - 16; wy += 18) {
                for (var wx = b.x + 8; wx < b.x + b.w - 10; wx += 14) {
                    var lit = Math.sin(time * 0.0005 + idx * 3 + wx * 0.1 + wy * 0.1) > 0;
                    drawRect(wx, wy, 8, 10, lit ? '#40ff80' : '#203050');
                }
            }
        });
    }

    function drawTitleScene(time) {
        clear();

        // Sky gradient
        var bandHeight = H / 4;
        var skyColors = ['#0a0a2a', '#101840', '#182860', '#203870'];
        for (var i = 0; i < skyColors.length; i++) {
            drawRect(0, i * bandHeight, W, bandHeight + 1, skyColors[i]);
        }

        drawStars(time);
        drawTitleCityscape(time);

        // Animated glow on buildings
        var glowAlpha = 0.3 + Math.sin(time * 0.002) * 0.15;
        ctx.fillStyle = 'rgba(64, 255, 128, ' + glowAlpha + ')';
        ctx.fillRect(0, H * 0.65, W, 3);
    }

    // =========================================================================
    //  TITLE PIXEL SCENE (mini canvas for title screen)
    // =========================================================================

    function drawTitlePixelScene(containerId, time) {
        var container = document.getElementById(containerId);
        if (!container) return;
        if (!container.querySelector('canvas')) {
            var c = document.createElement('canvas');
            c.width = 400;
            c.height = 200;
            c.style.width = '100%';
            c.style.height = '100%';
            c.style.imageRendering = 'pixelated';
            container.appendChild(c);
        }
        var tc = container.querySelector('canvas');
        var tctx = tc.getContext('2d');
        tctx.imageSmoothingEnabled = false;

        // Sky
        tctx.fillStyle = '#0a0a2a';
        tctx.fillRect(0, 0, 400, 200);

        // Stars
        for (var i = 0; i < 30; i++) {
            var sx = (i * 137 + 50) % 400;
            var sy = (i * 89 + 20) % 100;
            var tw = Math.sin(time * 0.003 + i) > 0;
            if (tw) {
                tctx.fillStyle = 'rgba(255,255,255,0.6)';
                tctx.fillRect(sx, sy, 1, 1);
            }
        }

        // Ground
        tctx.fillStyle = '#1a2818';
        tctx.fillRect(0, 140, 400, 60);

        // Mini AI lab buildings
        var labs = [
            { x: 30, w: 50, h: 70, color: '#44aaff', label: 'ANT' },
            { x: 100, w: 45, h: 55, color: '#ff8844', label: 'OAI' },
            { x: 165, w: 55, h: 80, color: '#44ffaa', label: 'DM' },
            { x: 240, w: 40, h: 50, color: '#aa44ff', label: 'META' },
            { x: 300, w: 50, h: 65, color: '#ff4444', label: 'xAI' },
        ];

        labs.forEach(function(lab) {
            var by = 140 - lab.h;
            tctx.fillStyle = darkenColor(lab.color, 0.3);
            tctx.fillRect(lab.x, by, lab.w, lab.h);
            tctx.fillStyle = darkenColor(lab.color, 0.5);
            tctx.fillRect(lab.x + 2, by + 2, lab.w - 4, lab.h - 4);
            tctx.fillStyle = lab.color;
            tctx.fillRect(lab.x, by, lab.w, 3);

            for (var wy = by + 10; wy < 135; wy += 12) {
                for (var wx = lab.x + 5; wx < lab.x + lab.w - 8; wx += 10) {
                    var lit = Math.sin(time * 0.002 + wx + wy) > 0;
                    tctx.fillStyle = lit ? '#40ff80' : '#203050';
                    tctx.fillRect(wx, wy, 5, 7);
                }
            }

            tctx.font = '7px "Press Start 2P", monospace';
            tctx.fillStyle = lab.color;
            tctx.textAlign = 'center';
            tctx.fillText(lab.label, lab.x + lab.w / 2, 155);
        });

        // Data streams
        var streamY = 120;
        for (var s = 0; s < 5; s++) {
            var sx2 = (time * 0.1 + s * 80) % 400;
            tctx.fillStyle = 'rgba(64, 255, 128, 0.3)';
            tctx.fillRect(sx2, streamY + s * 3, 20, 1);
        }

        // Bottom text
        tctx.font = '8px "Press Start 2P", monospace';
        tctx.fillStyle = '#a0a0c0';
        tctx.textAlign = 'center';
        tctx.fillText('THE AI RACE BEGINS...', 200, 185);
    }

    // =========================================================================
    //  CHARACTER PORTRAITS (procedural pixel art) — PRESERVED EXACTLY
    // =========================================================================

    function drawPortrait(charId, targetCanvas, size) {
        var charData = GAME.DATA.CHARACTERS[charId];
        if (!charData) return;
        var p = charData.portrait;
        var c = targetCanvas.getContext('2d');
        c.imageSmoothingEnabled = false;
        var s = size || targetCanvas.width;
        var px = s / 16; // pixel size

        c.clearRect(0, 0, s, s);

        // Background
        c.fillStyle = '#1a1a3a';
        c.fillRect(0, 0, s, s);

        // Shoulders/body
        c.fillStyle = p.shirtColor;
        c.fillRect(px * 3, px * 12, px * 10, px * 4);

        // Neck
        c.fillStyle = p.skinTone;
        c.fillRect(px * 6, px * 10, px * 4, px * 3);

        // Head shape
        c.fillStyle = p.skinTone;
        c.fillRect(px * 4, px * 3, px * 8, px * 8);

        // Hair
        c.fillStyle = p.hairColor;
        switch (p.hairStyle) {
            case 'short':
                c.fillRect(px * 4, px * 2, px * 8, px * 3);
                c.fillRect(px * 3, px * 3, px * 1, px * 3);
                c.fillRect(px * 12, px * 3, px * 1, px * 3);
                break;
            case 'receding':
                c.fillRect(px * 5, px * 2, px * 6, px * 2);
                c.fillRect(px * 3, px * 3, px * 1, px * 4);
                c.fillRect(px * 12, px * 3, px * 1, px * 4);
                break;
            case 'swept':
                c.fillRect(px * 3, px * 2, px * 10, px * 3);
                c.fillRect(px * 11, px * 1, px * 3, px * 3);
                c.fillRect(px * 3, px * 3, px * 1, px * 3);
                break;
            default:
                c.fillRect(px * 4, px * 2, px * 8, px * 3);
        }

        // Eyes
        c.fillStyle = '#ffffff';
        c.fillRect(px * 5, px * 6, px * 3, px * 2);
        c.fillRect(px * 9, px * 6, px * 3, px * 2);
        c.fillStyle = '#202020';
        c.fillRect(px * 6, px * 6, px * 2, px * 2);
        c.fillRect(px * 10, px * 6, px * 2, px * 2);

        // Glasses
        if (p.glasses) {
            c.strokeStyle = '#a0a0b0';
            c.lineWidth = 1;
            c.strokeRect(px * 4.5, px * 5.5, px * 3.5, px * 3);
            c.strokeRect(px * 8.5, px * 5.5, px * 3.5, px * 3);
            c.beginPath();
            c.moveTo(px * 8, px * 7);
            c.lineTo(px * 8.5, px * 7);
            c.stroke();
        }

        // Mouth
        c.fillStyle = darkenColor(p.skinTone, 0.7);
        var mouthStyle = p.features;
        switch (mouthStyle) {
            case 'friendly':
                c.fillRect(px * 6, px * 9, px * 4, px * 1);
                c.fillRect(px * 5, px * 9, px * 1, px * 1);
                c.fillRect(px * 10, px * 9, px * 1, px * 1);
                break;
            case 'eager':
                c.fillRect(px * 6, px * 9, px * 4, px * 1);
                c.fillRect(px * 5, px * 8, px * 1, px * 1);
                c.fillRect(px * 10, px * 8, px * 1, px * 1);
                break;
            case 'skeptical':
                c.fillRect(px * 6, px * 9, px * 4, px * 1);
                // Raised eyebrow
                c.fillStyle = p.hairColor;
                c.fillRect(px * 9, px * 4.5, px * 3, px * 1);
                break;
            case 'intense':
                c.fillRect(px * 7, px * 9, px * 2, px * 1);
                // Furrowed brow
                c.fillStyle = p.hairColor;
                c.fillRect(px * 5, px * 5, px * 3, px * 0.5);
                c.fillRect(px * 9, px * 5, px * 3, px * 0.5);
                break;
            case 'calculating':
                c.fillRect(px * 7, px * 9, px * 3, px * 1);
                break;
            case 'confident':
                c.fillRect(px * 5, px * 9, px * 6, px * 1);
                c.fillRect(px * 6, px * 10, px * 4, px * 1);
                break;
            default:
                c.fillRect(px * 6, px * 9, px * 4, px * 1);
        }

        // Beard
        if (p.beard) {
            c.fillStyle = p.hairColor;
            c.globalAlpha = 0.5;
            c.fillRect(px * 4, px * 8, px * 2, px * 3);
            c.fillRect(px * 10, px * 8, px * 2, px * 3);
            c.fillRect(px * 5, px * 10, px * 6, px * 2);
            c.globalAlpha = 1.0;
        }

        // Character-colored border
        c.strokeStyle = charData.color;
        c.lineWidth = 2;
        c.strokeRect(1, 1, s - 2, s - 2);
    }

    // =========================================================================
    //  PUBLIC API
    // =========================================================================

    return {
        init: init,
        clear: clear,
        drawRect: drawRect,
        drawOutline: drawOutline,
        drawText: drawText,
        drawPortrait: drawPortrait,
        drawTitleScene: drawTitleScene,
        drawTitlePixelScene: drawTitlePixelScene,
        drawGameScene: drawGameScene,
        drawBuilding: drawGenericBuilding,
        drawCampusGround: drawGround,
        darkenColor: darkenColor,
        COLORS: COLORS,
        getCanvas: function() { return canvas; },
        getCtx: function() { return ctx; }
    };
})();
