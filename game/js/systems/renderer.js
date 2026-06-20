window.GAME = window.GAME || {};
window.GAME.Systems = window.GAME.Systems || {};

GAME.Systems.Renderer = (function() {
    'use strict';

    var canvas, ctx;
    var W = 960, H = 400;

    // World dimensions — 12000px wide scrolling world
    var WORLD_W = 12000;

    // Camera state
    var camera = {
        x: 800,
        targetX: 800,
        isDragging: false,
        dragStartX: 0,
        dragStartCamX: 0,
        mouseX: 0,
        mouseY: 0,
        zoom: 1.0,
        targetZoom: 1.0
    };

    // Placement mode state
    var placementMode = null;

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

    // Layout constants (Y axis scales with 540px canvas height)
    var GROUND_Y = 270;
    var BUILDING_FLOOR = 510;
    var ROAD_W = 24;

    // Zone boundaries (world X coordinates) — 12000px world
    var ZONES = {
        wilderness:  { left: 0,    right: 800,  name: 'Wilderness',    ground: '#1a3018', groundAlt: '#162a14' },
        campus:      { left: 800,  right: 3800, name: 'AI Campus',     ground: '#1a3818', groundAlt: '#183416' },
        road:        { left: 3800, right: 4200, name: '',               ground: '#3a3020', groundAlt: '#343020' },
        town:        { left: 4200, right: 7500, name: 'Abundance Bay', ground: '#1e3418', groundAlt: '#1a3014' },
        harbor:      { left: 7500, right: 10000, name: 'Harbor',       ground: '#2a2818', groundAlt: '#262416' },
        ocean:       { left: 10000, right: 12000, name: '',             ground: '#0a1030', groundAlt: '#0a1030' }
    };
    var ROAD_X = 4000;
    var WATER_X = ZONES.ocean.left;
    var CAMPUS_LEFT = ZONES.campus.left;
    var TOWN_RIGHT = ZONES.harbor.right;

    // Seagull state (persistent between frames)
    var seagulls = [];
    var seagullsInited = false;

    // Smoke particles
    var smokeParticles = [];

    // Cookie particles (floating cookie emoji-like shapes from Cookie Kitchen)
    var cookieParticles = [];

    // Floating text system (resource popups)
    var floatingTexts = [];

    // Player character state
    var player = {
        x: 1400,
        targetX: 1400,
        walking: false,
        direction: 1,
        speed: 3.5,
        characterId: null,
        skinTone: '#e0c0a0',
        hairColor: '#4a3020',
        shirtColor: '#3a5a8a',
        pantsColor: '#2a2a3a'
    };
    var cameraFollowPlayer = true;

    // Permanent seedy building bounds (for overlap checks)
    // These are the fixed town establishments at 2x scale
    var PERMANENT_BUILDINGS = [
        { x: 350, w: 200, name: 'Derelict Shack' },
        { x: 4220, w: 420, name: 'Seedy Bar' },
        { x: 4600, w: 380, name: 'Video Shop' },
        { x: 4950, w: 440, name: 'Arcade' },
        { x: 5350, w: 520, name: 'Supermarket' },
        { x: 5850, w: 340, name: 'Church' },
        { x: 6200, w: 400, name: 'Comedy Club' },
        { x: 7580, w: 360, name: 'Gun Shop' },
        { x: 7920, w: 620, name: 'Car Factory' },
        { x: 8520, w: 560, name: 'Motel' }
    ];

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

    // Gradient wall fill — vertical gradient from dark base to lighter top
    function drawGradientRect(x, y, w, h, colorBottom, colorTop) {
        var grd = ctx.createLinearGradient(x, y + h, x, y);
        grd.addColorStop(0, colorBottom);
        grd.addColorStop(1, colorTop);
        ctx.fillStyle = grd;
        ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
    }

    // 3-tone wall: shadow left edge, gradient body, highlight right edge
    function drawWall3Tone(x, y, w, h, baseColor) {
        var dark = darkenColor(baseColor, 0.65);
        var mid = baseColor;
        var light = lightenColor(baseColor, 18);
        // Main gradient fill
        drawGradientRect(x, y, w, h, dark, mid);
        // Highlight strip on left (light hits from left)
        drawRect(x, y, 2, h, light);
        // Deep shadow strip on right
        drawRect(x + w - 3, y, 3, h, darkenColor(baseColor, 0.5));
        // Top edge highlight
        drawRect(x, y, w, 1, light);
        // Bottom edge shadow
        drawRect(x, y + h - 1, w, 1, darkenColor(baseColor, 0.4));
    }

    // Weathering: stains, cracks, paint peel on a wall area
    function drawWeathering(x, y, w, h, seed) {
        // Water stain streaks
        for (var s = 0; s < 3; s++) {
            var sx = x + seededRandom(seed + s * 7) * (w - 6);
            var sh = 8 + seededRandom(seed + s * 13) * 12;
            ctx.fillStyle = 'rgba(0,0,0,0.06)';
            ctx.fillRect(Math.floor(sx), Math.floor(y + 2), 3, Math.floor(sh));
        }
        // Crack lines
        for (var c = 0; c < 2; c++) {
            var cx = x + 4 + seededRandom(seed + c * 19 + 50) * (w - 12);
            var cy = y + 4 + seededRandom(seed + c * 23 + 60) * (h - 12);
            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            ctx.fillRect(Math.floor(cx), Math.floor(cy), Math.floor(4 + seededRandom(seed + c) * 6), 1);
            ctx.fillRect(Math.floor(cx + 1), Math.floor(cy + 1), 1, Math.floor(2 + seededRandom(seed + c + 1) * 3));
        }
        // Paint peel patches
        ctx.fillStyle = 'rgba(0,0,0,0.04)';
        var px = x + seededRandom(seed + 100) * (w - 10);
        ctx.fillRect(Math.floor(px), Math.floor(y + h * 0.6), 8, 5);
    }

    // Foundation/base for buildings
    function drawFoundation(x, y, w) {
        // Concrete base
        drawRect(x - 2, y, w + 4, 4, '#404048');
        drawRect(x - 1, y, w + 2, 2, '#505058');
        drawRect(x - 1, y + 2, w + 2, 1, '#383840');
        // Step
        drawRect(x + 2, y + 4, w - 4, 2, '#484850');
    }

    // Simple seeded random for deterministic placement
    function seededRandom(seed) {
        var x = Math.sin(seed) * 43758.5453123;
        return x - Math.floor(x);
    }

    // Viewport culling — skip off-screen world objects
    function isVisible(worldX, width) {
        return (worldX + width > camera.x) && (worldX < camera.x + W);
    }

    function clampCamera() {
        var viewW = W / camera.zoom;
        camera.x = Math.max(0, Math.min(WORLD_W - viewW, camera.x));
        camera.targetX = Math.max(0, Math.min(WORLD_W - viewW, camera.targetX));
    }

    function updateCamera() {
        camera.x += (camera.targetX - camera.x) * 0.12;
        if (Math.abs(camera.x - camera.targetX) < 0.5) camera.x = camera.targetX;
        camera.zoom += (camera.targetZoom - camera.zoom) * 0.08;
        if (Math.abs(camera.zoom - camera.targetZoom) < 0.005) camera.zoom = camera.targetZoom;
        clampCamera();
    }

    // =========================================================================
    //  SKY, STARS, ATMOSPHERE
    // =========================================================================

    function drawSky(time) {
        // Gradient sky — four bands (compressed for larger ground area)
        var bands = [
            { y: 0, h: 40, color: COLORS.sky.top },
            { y: 40, h: 45, color: COLORS.sky.mid },
            { y: 85, h: 55, color: COLORS.sky.low },
            { y: 140, h: 60, color: COLORS.sky.horizon }
        ];
        for (var i = 0; i < bands.length; i++) {
            drawRect(0, bands[i].y, W, bands[i].h + 1, bands[i].color);
        }

        // Moon (small, top right)
        var moonX = 820, moonY = 28;
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
            var sy = seed % 140;
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
        if (!isVisible(WATER_X - 10, WORLD_W - WATER_X + 10)) return;
        var oceanLeft = WATER_X;
        var oceanTop = 160;

        drawRect(oceanLeft, oceanTop, WORLD_W - oceanLeft, H - oceanTop, COLORS.sea.deep);

        for (var row = 0; row < 35; row++) {
            var y = oceanTop + row * 7;
            if (y > H) break;
            var waveOffset = Math.sin(time * 0.0015 + row * 0.8) * 3;
            var alpha = 0.08 + Math.sin(time * 0.001 + row * 0.5) * 0.04;

            ctx.fillStyle = 'rgba(48, 72, 120, ' + alpha + ')';
            ctx.fillRect(oceanLeft + waveOffset, y, WORLD_W - oceanLeft, 2);

            if (row % 4 === 0) {
                var foamX = oceanLeft + 5 + Math.sin(time * 0.001 + row) * 8;
                ctx.fillStyle = 'rgba(80, 110, 160, ' + (alpha * 1.5) + ')';
                ctx.fillRect(foamX, y, 30 + Math.sin(row) * 10, 1);
            }
        }

        var shoreWave = Math.sin(time * 0.002) * 2;
        ctx.fillStyle = COLORS.sea.foam;
        ctx.fillRect(oceanLeft - 2 + shoreWave, GROUND_Y, 4, H - GROUND_Y);
    }

    // =========================================================================
    //  HILLS AND TERRAIN
    // =========================================================================

    function drawHills(time) {
        var startX = Math.max(0, Math.floor(camera.x / 4) * 4 - 20);
        var endX = Math.min(WATER_X + 20, camera.x + W + 20);

        // Far hills with parallax (slower scroll)
        ctx.fillStyle = COLORS.hills.far;
        ctx.beginPath();
        ctx.moveTo(startX, 170);
        for (var x = startX; x <= endX; x += 4) {
            var hx = 170 - Math.sin(x * 0.004) * 22 - Math.sin(x * 0.007 + 2) * 12 - Math.cos(x * 0.002) * 8;
            ctx.lineTo(x, hx);
        }
        ctx.lineTo(endX, H);
        ctx.lineTo(startX, H);
        ctx.fill();

        // Mid hills
        ctx.fillStyle = COLORS.hills.mid;
        ctx.beginPath();
        ctx.moveTo(startX, 188);
        for (var x2 = startX; x2 <= endX; x2 += 4) {
            var hy = 188 - Math.sin(x2 * 0.006 + 1) * 16 - Math.cos(x2 * 0.003) * 10;
            ctx.lineTo(x2, hy);
        }
        ctx.lineTo(endX, H);
        ctx.lineTo(startX, H);
        ctx.fill();

        // Near hills / ground level
        ctx.fillStyle = COLORS.hills.near;
        ctx.beginPath();
        ctx.moveTo(startX, GROUND_Y);
        for (var x3 = startX; x3 <= endX; x3 += 4) {
            var gy = GROUND_Y - Math.sin(x3 * 0.01 + 3) * 6 - Math.cos(x3 * 0.005) * 4;
            ctx.lineTo(x3, gy);
        }
        ctx.lineTo(endX, H);
        ctx.lineTo(startX, H);
        ctx.fill();
    }

    var SIDEWALK_Y = BUILDING_FLOOR + 6;
    var SIDEWALK_H = 10;

    function drawGround(time) {
        // Draw zone-colored ground bands
        var zoneKeys = ['wilderness', 'campus', 'road', 'town', 'harbor'];
        for (var zi = 0; zi < zoneKeys.length; zi++) {
            var zone = ZONES[zoneKeys[zi]];
            if (!isVisible(zone.left, zone.right - zone.left)) continue;
            drawRect(zone.left, GROUND_Y, zone.right - zone.left, H - GROUND_Y, zone.ground);
            // Subtle alternating strips for texture
            for (var sx = zone.left; sx < zone.right; sx += 80) {
                if ((sx / 80) % 2 === 0) {
                    drawRect(sx, GROUND_Y, 40, H - GROUND_Y, zone.groundAlt);
                }
            }
        }

        // Sidewalk/pavement along developed zones (campus through harbor)
        var pavStart = ZONES.campus.left;
        var pavEnd = ZONES.harbor.right;
        if (isVisible(pavStart, pavEnd - pavStart)) {
            var vs = Math.max(pavStart, camera.x - 10);
            var ve = Math.min(pavEnd, camera.x + W + 10);
            // Main sidewalk
            drawRect(vs, SIDEWALK_Y, ve - vs, SIDEWALK_H, '#484840');
            drawRect(vs, SIDEWALK_Y, ve - vs, 1, '#5a5a50');
            drawRect(vs, SIDEWALK_Y + SIDEWALK_H - 1, ve - vs, 1, '#2a2a24');
            // Paving slab lines
            for (var sl = Math.floor(vs / 30) * 30; sl < ve; sl += 30) {
                drawRect(sl, SIDEWALK_Y, 1, SIDEWALK_H, '#3a3a34');
            }
            // Curb above sidewalk
            drawRect(vs, SIDEWALK_Y - 2, ve - vs, 2, '#555550');
            drawRect(vs, SIDEWALK_Y - 2, ve - vs, 1, '#606058');
        }

        // Dirt path in wilderness
        if (isVisible(0, 800)) {
            var pathS = Math.max(200, camera.x - 10);
            var pathE = Math.min(800, camera.x + W + 10);
            drawRect(pathS, SIDEWALK_Y + 2, pathE - pathS, 6, '#3a3020');
            drawRect(pathS, SIDEWALK_Y + 2, pathE - pathS, 1, '#4a4030');
        }

        // Grass texture strips (scattered, denser)
        var visStart = Math.floor(camera.x / 120) * 120;
        for (var chunk = visStart; chunk < camera.x + W + 120; chunk += 120) {
            for (var i = 0; i < 8; i++) {
                var seed = chunk * 7 + i * 37;
                var gx = chunk + seededRandom(seed) * 120;
                var gy = GROUND_Y + 5 + seededRandom(seed + 53) * (SIDEWALK_Y - GROUND_Y - 12);
                if (gx < WATER_X) {
                    var grassShade = 30 + Math.floor(seededRandom(seed + 99) * 30);
                    ctx.fillStyle = 'rgba(' + grassShade + ', ' + (grassShade + 50) + ', ' + grassShade + ', 0.35)';
                    ctx.fillRect(gx, gy, 6 + seededRandom(seed + 71) * 10, 1);
                }
            }
            // Small grass tufts
            for (var g2 = 0; g2 < 3; g2++) {
                var gs = chunk * 11 + g2 * 97;
                var gx2 = chunk + seededRandom(gs) * 120;
                var gy2 = SIDEWALK_Y + SIDEWALK_H + 4 + seededRandom(gs + 50) * (H - SIDEWALK_Y - SIDEWALK_H - 10);
                if (gx2 < WATER_X) {
                    ctx.fillStyle = 'rgba(30, 70, 30, 0.4)';
                    ctx.fillRect(gx2, gy2, 3, 2);
                    ctx.fillRect(gx2 + 1, gy2 - 1, 1, 1);
                }
            }
        }

        // Zone labels (drawn at ground level)
        for (var zl = 0; zl < zoneKeys.length; zl++) {
            var zn = ZONES[zoneKeys[zl]];
            if (!zn.name) continue;
            var labelX = (zn.left + zn.right) / 2;
            if (isVisible(labelX - 60, 120)) {
                drawText(zn.name, labelX, GROUND_Y + 4, { size: 6, color: 'rgba(255,255,255,0.15)', align: 'center' });
            }
        }
    }

    function drawRoad(time) {
        if (!isVisible(ROAD_X - 10, ROAD_W + 20)) return;
        var rx = ROAD_X;
        drawRect(rx, GROUND_Y, ROAD_W, H - GROUND_Y, COLORS.ground.path);
        drawRect(rx, GROUND_Y, 2, H - GROUND_Y, COLORS.ground.pathLight);
        drawRect(rx + ROAD_W - 2, GROUND_Y, 2, H - GROUND_Y, COLORS.ground.pathLight);
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
        // Pole — taller, thicker
        drawRect(x, y - 44, 3, 44, '#505058');
        drawRect(x + 1, y - 44, 1, 44, '#606068');
        // Base plate
        drawRect(x - 2, y - 2, 7, 3, '#404048');
        // Curved arm
        drawRect(x - 8, y - 46, 12, 3, '#606068');
        drawRect(x - 9, y - 45, 2, 2, '#505058');
        // Light fixture housing
        drawRect(x - 10, y - 48, 14, 4, '#707078');
        drawRect(x - 9, y - 47, 12, 2, '#808088');
        // Bulb
        drawRect(x - 6, y - 44, 6, 2, '#ffdd80');
        // Light cone — triangular beam to ground (Thimbleweed style)
        var glowAlpha = 0.08 + Math.sin(time * 0.003) * 0.02;
        ctx.save();
        ctx.globalAlpha = glowAlpha;
        ctx.fillStyle = '#ffeebb';
        ctx.beginPath();
        ctx.moveTo(x - 8, y - 44);
        ctx.lineTo(x + 2, y - 44);
        ctx.lineTo(x + 22, y + 4);
        ctx.lineTo(x - 28, y + 4);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        // Ground light pool
        ctx.fillStyle = 'rgba(255, 220, 140, 0.04)';
        ctx.fillRect(x - 30, y - 2, 54, 6);
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
        // Procedural trees across the world
        var trees = [
            // Wilderness
            { x: 50, s: 1.4 }, { x: 150, s: 1.1 }, { x: 280, s: 1.3 }, { x: 400, s: 0.9 },
            { x: 520, s: 1.2 }, { x: 650, s: 1.0 }, { x: 720, s: 1.5 },
            // Campus edges
            { x: 840, s: 1.0 }, { x: 3700, s: 0.9 }, { x: 3760, s: 1.1 },
            // Road area
            { x: 3850, s: 0.8 }, { x: 4150, s: 0.9 },
            // Town
            { x: 4300, s: 0.7 }, { x: 4800, s: 0.8 }, { x: 5200, s: 0.9 },
            { x: 5600, s: 0.7 }, { x: 6000, s: 1.0 }, { x: 6300, s: 0.8 },
            { x: 6600, s: 0.7 }, { x: 6900, s: 0.9 }, { x: 7200, s: 0.8 },
            // Harbor
            { x: 7600, s: 0.7 }, { x: 8200, s: 0.8 }, { x: 8500, s: 0.6 },
            { x: 8800, s: 0.7 }, { x: 9300, s: 0.8 },
        ];

        for (var ti = 0; ti < trees.length; ti++) {
            var t = trees[ti];
            if (isVisible(t.x - 20, 40)) {
                drawTree(t.x, BUILDING_FLOOR, t.s);
            }
        }

        // Palm trees near the coast
        var palms = [
            { x: 7800 }, { x: 8100 }, { x: 8400 }, { x: 8700 }, { x: 9100 }, { x: 9500 }, { x: 9800 }
        ];
        for (var pi = 0; pi < palms.length; pi++) {
            if (isVisible(palms[pi].x - 15, 30)) {
                drawPalmTree(palms[pi].x, BUILDING_FLOOR - 5);
            }
        }

        // Lampposts along developed areas (denser, with warm glow pools)
        for (var lx = ZONES.campus.left + 100; lx < ZONES.harbor.right; lx += 180) {
            if (isVisible(lx - 10, 20)) {
                drawLamppost(lx, BUILDING_FLOOR, time);
            }
        }

        // Welcome sign at the road
        if (isVisible(ROAD_X - 25, 80)) {
            drawWelcomeSign(ROAD_X - 25, BUILDING_FLOOR + 15);
        }
    }

    // =========================================================================
    //  ENVIRONMENTAL PROPS — benches, bins, signs, parked cars, phone box
    // =========================================================================

    function drawBench(x, y) {
        drawRect(x, y - 6, 16, 2, '#5a4020');
        drawRect(x + 1, y - 9, 14, 3, '#6a5030');
        drawRect(x + 1, y - 4, 2, 5, '#4a3818');
        drawRect(x + 13, y - 4, 2, 5, '#4a3818');
    }

    function drawBin(x, y) {
        drawRect(x, y - 10, 6, 10, '#404048');
        drawRect(x - 1, y - 11, 8, 2, '#505058');
        drawRect(x + 1, y - 8, 4, 1, '#353540');
        // Rubbish poking out
        drawRect(x + 1, y - 12, 3, 2, '#8a7a50');
    }

    function drawPhoneBox(x, y) {
        drawRect(x, y - 28, 10, 28, '#cc2020');
        drawRect(x + 1, y - 27, 8, 26, '#aa1818');
        drawRect(x + 2, y - 24, 6, 14, '#304060');
        drawRect(x + 3, y - 22, 4, 10, '#4060a0');
        drawRect(x + 1, y - 28, 8, 2, '#dd3030');
        drawRect(x + 3, y - 30, 4, 3, '#dd3030');
    }

    function drawPostBox(x, y) {
        drawRect(x, y - 14, 8, 14, '#cc2020');
        drawRect(x + 1, y - 13, 6, 12, '#aa1818');
        drawRect(x - 1, y - 16, 10, 3, '#dd3030');
        drawRect(x + 1, y - 10, 6, 2, '#1a1a1a');
    }

    function drawBusStop(x, y) {
        drawRect(x, y - 34, 2, 34, '#505058');
        drawRect(x + 14, y - 34, 2, 34, '#505058');
        drawRect(x - 1, y - 36, 18, 3, '#606068');
        drawRect(x, y - 34, 16, 10, '#304060');
        drawRect(x + 2, y - 32, 12, 6, '#405878');
        ctx.font = '3px "Press Start 2P", monospace';
        ctx.fillStyle = '#90b0d0';
        ctx.textAlign = 'center';
        ctx.fillText('BUS', x + 8, y - 31);
    }

    function drawParkedCar(x, y, color, facing) {
        var f = facing || 1;
        drawRect(x, y - 7, 20, 6, color);
        drawRect(x + (f > 0 ? 3 : 5), y - 11, 12, 5, darkenColor(color, 0.8));
        drawRect(x + (f > 0 ? 4 : 6), y - 10, 4, 3, '#6888a0');
        drawRect(x + (f > 0 ? 10 : 12), y - 10, 4, 3, '#6888a0');
        drawRect(x + 2, y - 1, 3, 2, '#303030');
        drawRect(x + 15, y - 1, 3, 2, '#303030');
        drawRect(x + (f > 0 ? 18 : 0), y - 5, 2, 2, '#ff4040');
        drawRect(x + (f > 0 ? 0 : 18), y - 5, 2, 2, '#ffff80');
    }

    function drawStreetSign(x, y, text) {
        drawRect(x, y - 20, 2, 20, '#505058');
        drawRect(x - 10, y - 22, 24, 8, '#1a4a1a');
        drawRect(x - 9, y - 21, 22, 6, '#204a20');
        ctx.font = '3px "Press Start 2P", monospace';
        ctx.fillStyle = '#d0e0d0';
        ctx.textAlign = 'center';
        ctx.fillText(text, x + 2, y - 20);
    }

    function drawEnvironmentProps(time) {
        var propY = SIDEWALK_Y + SIDEWALK_H;

        // Town street props (shifted +1000 for expanded world)
        var props = [
            { type: 'bench', x: 4260 },
            { type: 'bin', x: 4370 },
            { type: 'sign', x: 4500, text: 'HIGH ST' },
            { type: 'bench', x: 4570 },
            { type: 'phone', x: 4770 },
            { type: 'bin', x: 4870 },
            { type: 'bench', x: 5050 },
            { type: 'post', x: 5180 },
            { type: 'bus', x: 5250 },
            { type: 'bin', x: 5420 },
            { type: 'bench', x: 5620 },
            { type: 'sign', x: 5780, text: 'DOCK RD' },
            { type: 'bin', x: 5920 },
            { type: 'bench', x: 6080 },
            { type: 'phone', x: 6200 },
            { type: 'bin', x: 6450 },
            { type: 'bench', x: 6800 },
            { type: 'bin', x: 7100 },
            // Harbor
            { type: 'sign', x: 7550, text: 'HARBOUR' },
            { type: 'bin', x: 7800 },
            { type: 'bench', x: 8100 },
            { type: 'bin', x: 8350 },
            { type: 'bench', x: 8700 },
            { type: 'bin', x: 9200 },
        ];

        for (var pi = 0; pi < props.length; pi++) {
            var p = props[pi];
            if (!isVisible(p.x - 15, 30)) continue;
            switch (p.type) {
                case 'bench': drawBench(p.x, propY); break;
                case 'bin': drawBin(p.x, propY); break;
                case 'phone': drawPhoneBox(p.x, propY); break;
                case 'post': drawPostBox(p.x, propY); break;
                case 'bus': drawBusStop(p.x, propY); break;
                case 'sign': drawStreetSign(p.x, propY, p.text); break;
            }
        }

        // Parked cars along the street
        var cars = [
            { x: 4480, color: '#4a5a8a', f: 1 },
            { x: 4820, color: '#8a4a3a', f: -1 },
            { x: 5180, color: '#3a6a4a', f: 1 },
            { x: 5700, color: '#6a6a6a', f: -1 },
            { x: 6150, color: '#5a3a5a', f: 1 },
            { x: 6700, color: '#7a5a3a', f: -1 },
            { x: 7250, color: '#4a4a6a', f: 1 },
            { x: 8050, color: '#5a5a5a', f: -1 },
            { x: 8500, color: '#8a6a4a', f: 1 },
        ];

        for (var ci = 0; ci < cars.length; ci++) {
            var car = cars[ci];
            if (isVisible(car.x - 5, 25)) {
                drawParkedCar(car.x, propY, car.color, car.f);
            }
        }

        // Puddles (scattered, subtle)
        var puddles = [4290, 4750, 5150, 5900, 6400, 7000, 8200, 8800];
        for (var pdi = 0; pdi < puddles.length; pdi++) {
            var px = puddles[pdi];
            if (isVisible(px - 5, 20)) {
                ctx.fillStyle = 'rgba(30, 50, 80, 0.3)';
                ctx.fillRect(px, propY + 2, 12 + (pdi % 3) * 4, 2);
            }
        }

        // Litter (very subtle)
        var visChunk = Math.floor(camera.x / 150) * 150;
        for (var lc = visChunk; lc < camera.x + W + 150; lc += 150) {
            if (lc < ZONES.town.left || lc > ZONES.harbor.right) continue;
            var ls = lc * 31;
            var lx = lc + seededRandom(ls) * 100;
            var ly = propY + 1 + seededRandom(ls + 7) * 6;
            ctx.fillStyle = 'rgba(160, 140, 100, 0.25)';
            ctx.fillRect(lx, ly, 2, 1);
        }
    }

    // =========================================================================
    //  SEAGULLS
    // =========================================================================

    function initSeagulls() {
        seagulls = [];
        for (var i = 0; i < 12; i++) {
            seagulls.push({
                x: seededRandom(i * 311) * WORLD_W,
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

            if (sg.x > WORLD_W + 20) { sg.x = -20; sg.y = 30 + seededRandom(time * 0.001 + i) * 100; }
            if (sg.x < -20) { sg.x = WORLD_W + 20; sg.y = 30 + seededRandom(time * 0.001 + i) * 100; }

            if (!isVisible(sg.x - 5, 10)) continue;

            var wing = Math.sin(time * 0.008 + sg.wingPhase) * 3;
            var bx = Math.floor(sg.x);
            var by = Math.floor(sg.y);

            ctx.fillStyle = '#d0d0d8';
            ctx.fillRect(bx, by, 3, 1);
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

        // Cookie particles
        for (var j = cookieParticles.length - 1; j >= 0; j--) {
            var cp = cookieParticles[j];
            cp.x += cp.vx;
            cp.y += cp.vy;
            cp.vy -= 0.005;
            cp.life -= 0.012;
            cp.angle += cp.spin;

            if (cp.life <= 0) {
                cookieParticles.splice(j, 1);
                continue;
            }

            var ca = cp.life * 0.6;
            var cx = Math.floor(cp.x);
            var cy = Math.floor(cp.y);
            ctx.fillStyle = 'rgba(210, 160, 60, ' + ca + ')';
            ctx.fillRect(cx - 1, cy - 1, 3, 3);
            ctx.fillStyle = 'rgba(140, 80, 20, ' + ca + ')';
            ctx.fillRect(cx, cy, 1, 1);
        }
    }

    function spawnCookieParticle(x, y) {
        if (cookieParticles.length > 30) return;
        cookieParticles.push({
            x: x + (Math.random() - 0.5) * 6,
            y: y,
            vx: (Math.random() - 0.5) * 0.5,
            vy: -0.4 - Math.random() * 0.4,
            life: 1.0,
            angle: Math.random() * 6.28,
            spin: (Math.random() - 0.5) * 0.1
        });
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
        // Shadow
        drawRect(bx + 4, by + 4, bw, bh, 'rgba(0,0,0,0.3)');
        // Foundation / concrete base
        drawRect(bx - 3, by + bh - 4, bw + 6, 6, '#505058');
        drawRect(bx - 2, by + bh - 3, bw + 4, 4, '#606068');
        // Main wall — 3 tone layers
        drawRect(bx, by, bw, bh, '#222e55');
        drawRect(bx + 2, by + 2, bw - 4, bh - 4, '#2a3a6a');
        drawRect(bx + 3, by + 3, bw - 6, bh - 8, '#30407a');
        // Darker side wall (right edge depth)
        drawRect(bx + bw - 3, by + 2, 3, bh - 4, '#1e2a50');
        // Roof with overhang
        drawRect(bx - 3, by - 4, bw + 6, 6, '#3a4a7a');
        drawRect(bx - 2, by - 3, bw + 4, 4, '#4a5a8a');
        drawRect(bx - 1, by - 2, bw + 2, 2, '#5a6a9a');
        // Roof detail — AC unit
        drawRect(bx + 4, by - 8, 10, 5, '#505060');
        drawRect(bx + 5, by - 7, 8, 3, '#606070');
        // Antenna mast
        drawRect(bx + bw / 2 - 1, by - 18, 2, 16, '#6a6a8a');
        drawRect(bx + bw / 2 - 3, by - 20, 6, 3, '#8a8aaa');
        var blink = Math.sin(time * 0.005) > 0;
        drawRect(bx + bw / 2 - 1, by - 21, 2, 2, blink ? '#ff4040' : '#601010');
        // Individual windows with frames (not grid)
        var winY1 = by + 8;
        var winY2 = by + bh / 2 + 2;
        for (var wx = bx + 6; wx < bx + bw - 10; wx += 12) {
            var lit1 = Math.sin(time * 0.0008 + wx * 0.3 + 100) > -0.2;
            var lit2 = Math.sin(time * 0.0008 + wx * 0.5 + 200) > -0.1;
            // Window frame
            drawRect(wx - 1, winY1 - 1, 8, 10, '#1a2040');
            drawRect(wx, winY1, 6, 8, lit1 ? '#4080ff' : '#182848');
            if (lit1) {
                drawRect(wx + 1, winY1 + 1, 2, 3, '#6090ff');
                drawRect(wx + 3, winY1, 1, 8, '#2a4a70');
            }
            drawRect(wx - 1, winY2 - 1, 8, 10, '#1a2040');
            drawRect(wx, winY2, 6, 8, lit2 ? '#4080ff' : '#182848');
            if (lit2) {
                drawRect(wx + 1, winY2 + 2, 2, 3, '#6090ff');
            }
        }
        // Floor divider stripe
        drawRect(bx + 2, by + bh / 2 - 1, bw - 4, 2, '#4a5a8a');
        // Main door with glass panel and frame
        var doorX = bx + bw / 2 - 6;
        var doorH = Math.floor(bh * 0.35);
        drawRect(doorX - 1, by + bh - doorH - 1, 13, doorH + 1, '#1a2040');
        drawRect(doorX, by + bh - doorH, 11, doorH, '#243060');
        drawRect(doorX + 2, by + bh - doorH + 2, 7, doorH - 6, '#3a5a90');
        drawRect(doorX + 4, by + bh - doorH + 3, 3, doorH - 8, '#4a6aa0');
        drawRect(doorX + 8, by + bh - doorH / 2, 1, 3, '#8a8aaa');
        // Step in front of door
        drawRect(doorX - 2, by + bh, 15, 2, '#606068');
        // "AI LAB" sign above door
        drawRect(bx + bw / 2 - 10, by + bh - doorH - 8, 20, 6, '#1a2040');
        ctx.font = '4px "Press Start 2P", monospace';
        ctx.fillStyle = '#4080ff';
        ctx.textAlign = 'center';
        ctx.fillText('AI LAB', bx + bw / 2, by + bh - doorH - 4);
        // Light glow spill from door onto ground
        var doorGlow = 0.08 + Math.sin(time * 0.002) * 0.03;
        ctx.fillStyle = 'rgba(64, 128, 255, ' + doorGlow + ')';
        ctx.fillRect(doorX - 2, by + bh + 1, 16, 4);
    }

    function drawSafetyDept(bx, by, bw, bh, time) {
        // Shadow
        drawRect(bx + 4, by + 4, bw, bh, 'rgba(0,0,0,0.3)');
        // Foundation
        drawRect(bx - 2, by + bh - 3, bw + 4, 5, '#505058');
        drawRect(bx - 1, by + bh - 2, bw + 2, 3, '#606068');
        // Main wall — reinforced look
        drawRect(bx, by, bw, bh, '#1e4a2e');
        drawRect(bx + 2, by + 2, bw - 4, bh - 4, '#2a5a3a');
        drawRect(bx + 3, by + 3, bw - 6, bh - 8, '#306a44');
        // Right edge shadow
        drawRect(bx + bw - 3, by + 2, 3, bh - 4, '#1a4028');
        // Reinforced roof
        drawRect(bx - 2, by - 4, bw + 4, 6, '#3a6a4a');
        drawRect(bx - 1, by - 3, bw + 2, 4, '#4a7a5a');
        // Security camera on roof
        drawRect(bx + bw - 8, by - 8, 4, 5, '#505058');
        drawRect(bx + bw - 6, by - 10, 6, 3, '#606068');
        var camBlink = Math.sin(time * 0.006) > 0.5;
        drawRect(bx + bw - 2, by - 9, 2, 1, camBlink ? '#ff2020' : '#400808');
        // Shield emblem (larger, centered)
        var sx = bx + bw / 2;
        var sy = by + 6;
        drawRect(sx - 6, sy, 12, 2, '#40a040');
        drawRect(sx - 5, sy + 2, 10, 2, '#40a040');
        drawRect(sx - 4, sy + 4, 8, 2, '#50b050');
        drawRect(sx - 3, sy + 6, 6, 2, '#50b050');
        drawRect(sx - 2, sy + 8, 4, 2, '#40a040');
        drawRect(sx - 1, sy + 10, 2, 1, '#40a040');
        // Checkmark inside shield
        drawRect(sx - 2, sy + 4, 2, 2, '#80ff80');
        drawRect(sx, sy + 2, 2, 2, '#80ff80');
        // Green accent stripes
        drawRect(bx + 2, by + bh * 0.45, bw - 4, 2, '#40a040');
        drawRect(bx + 2, by + bh * 0.47, bw - 4, 1, '#308030');
        // Windows — reinforced with thick frames
        var winY = by + bh * 0.5 + 4;
        for (var wx = bx + 6; wx < bx + bw - 10; wx += 12) {
            var lit = Math.sin(time * 0.0008 + wx * 0.3 + 200) > -0.2;
            drawRect(wx - 2, winY - 2, 10, 12, '#1a3020');
            drawRect(wx - 1, winY - 1, 8, 10, '#1e3828');
            drawRect(wx, winY, 6, 8, lit ? '#40ff80' : '#183018');
            if (lit) drawRect(wx + 1, winY + 1, 2, 3, '#80ff80');
        }
        // Secure door — heavy frame
        var doorX = bx + bw / 2 - 6;
        var doorH = Math.floor(bh * 0.3);
        drawRect(doorX - 2, by + bh - doorH - 2, 16, doorH + 2, '#1a3020');
        drawRect(doorX, by + bh - doorH, 12, doorH, '#244a30');
        drawRect(doorX + 2, by + bh - doorH + 2, 8, doorH - 4, '#2e5a3a');
        // Keycard reader
        drawRect(doorX + 11, by + bh - doorH / 2, 3, 4, '#303030');
        var readerGlow = Math.sin(time * 0.003) > 0 ? '#40ff40' : '#104010';
        drawRect(doorX + 12, by + bh - doorH / 2 + 1, 1, 2, readerGlow);
        // "SAFETY" sign
        drawRect(bx + bw / 2 - 12, by + bh - doorH - 9, 24, 6, '#1a3020');
        ctx.font = '4px "Press Start 2P", monospace';
        ctx.fillStyle = '#40ff80';
        ctx.textAlign = 'center';
        ctx.fillText('SAFETY', bx + bw / 2, by + bh - doorH - 5);
        // Green glow from sign
        ctx.fillStyle = 'rgba(64, 255, 128, 0.06)';
        ctx.fillRect(bx + bw / 2 - 14, by + bh - doorH - 12, 28, 14);
    }

    function drawDataCenter(bx, by, bw, bh, time) {
        // Shadow
        drawRect(bx + 4, by + 4, bw, bh, 'rgba(0,0,0,0.3)');
        // Foundation — heavy concrete
        drawRect(bx - 3, by + bh - 4, bw + 6, 6, '#404048');
        drawRect(bx - 2, by + bh - 3, bw + 4, 4, '#505058');
        // Main wall — industrial steel
        drawRect(bx, by, bw, bh, '#303040');
        drawRect(bx + 2, by + 2, bw - 4, bh - 4, '#3a3a4a');
        drawRect(bx + 3, by + 3, bw - 6, bh - 8, '#424252');
        // Right shadow wall
        drawRect(bx + bw - 3, by + 2, 3, bh - 4, '#282838');
        // Corrugated wall texture (horizontal lines)
        for (var cy = by + 6; cy < by + bh - 6; cy += 4) {
            drawRect(bx + 3, cy, bw - 6, 1, '#484858');
        }
        // Heavy roof with cooling units
        drawRect(bx - 3, by - 4, bw + 6, 6, '#505060');
        drawRect(bx - 2, by - 3, bw + 4, 4, '#5a5a6a');
        // Cooling fan units on roof
        for (var fx = bx + 4; fx < bx + bw - 8; fx += 14) {
            drawRect(fx, by - 10, 10, 7, '#555565');
            drawRect(fx + 1, by - 9, 8, 5, '#606070');
            // Spinning fan indicator
            var fanPhase = Math.floor(time * 0.01 + fx) % 4;
            drawRect(fx + 3 + fanPhase, by - 8, 2, 2, '#909098');
            // Heat exhaust shimmer
            if (Math.random() < 0.04) spawnSmoke(fx + 5, by - 12);
        }
        // Server rack window (the signature look — visible interior)
        var rackY = by + 6;
        var rackH = bh - 16;
        drawRect(bx + 5, rackY - 1, bw - 10, rackH + 2, '#1a1a2a');
        drawServerLights(bx + 6, rackY, bw - 12, rackH, time, 300);
        // Ventilation grilles on sides
        for (var vy = by + 6; vy < by + bh - 6; vy += 3) {
            drawRect(bx, vy, 3, 1, '#505060');
            drawRect(bx + bw - 3, vy, 3, 1, '#505060');
        }
        // Heavy security door — no windows
        var doorX = bx + bw / 2 - 5;
        drawRect(doorX - 1, by + bh - 16, 12, 16, '#282838');
        drawRect(doorX, by + bh - 15, 10, 15, '#383848');
        drawRect(doorX + 1, by + bh - 14, 8, 13, '#404050');
        // Biometric scanner
        drawRect(doorX + 9, by + bh - 10, 3, 4, '#202030');
        var scanGlow = Math.sin(time * 0.004) > 0 ? '#4040ff' : '#101030';
        drawRect(doorX + 10, by + bh - 9, 1, 2, scanGlow);
        // "DATA" sign
        drawRect(bx + bw / 2 - 8, by + bh - 18, 16, 5, '#202030');
        ctx.font = '3px "Press Start 2P", monospace';
        ctx.fillStyle = '#4080ff';
        ctx.textAlign = 'center';
        ctx.fillText('DATA', bx + bw / 2, by + bh - 15);
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
        // Shadow
        drawRect(bx + 4, by + 4, bw, bh, 'rgba(0,0,0,0.3)');
        // Foundation — heavy industrial
        drawRect(bx - 3, by + bh - 4, bw + 6, 6, '#3a3028');
        drawRect(bx - 2, by + bh - 3, bw + 4, 4, '#4a4038');
        // Main wall — brick industrial
        drawRect(bx, by, bw, bh, '#3a2a1a');
        drawRect(bx + 2, by + 2, bw - 4, bh - 4, '#4a3a2a');
        drawRect(bx + 3, by + 3, bw - 6, bh - 8, '#5a4a3a');
        // Brick texture
        for (var bry = by + 6; bry < by + bh - 8; bry += 5) {
            var brOff = (Math.floor((bry - by) / 5) % 2) * 6;
            for (var brx = bx + 4 + brOff; brx < bx + bw - 6; brx += 12) {
                drawRect(brx, bry, 10, 4, '#544434');
                drawRect(brx + 1, bry + 1, 8, 2, '#5e4e3e');
            }
        }
        // Right shadow wall
        drawRect(bx + bw - 3, by + 2, 3, bh - 4, '#2e2016');
        // Smokestacks — taller, with bands
        var stackW = 8, stackH = 28;
        var s1x = bx + bw * 0.3 - stackW / 2;
        var s2x = bx + bw * 0.7 - stackW / 2;
        drawRect(s1x, by - stackH, stackW, stackH + 2, '#504030');
        drawRect(s1x + 1, by - stackH + 1, stackW - 2, stackH, '#605040');
        drawRect(s1x - 1, by - stackH - 2, stackW + 2, 3, '#706050');
        drawRect(s1x, by - stackH + 8, stackW, 2, '#706050');
        drawRect(s1x, by - stackH + 18, stackW, 2, '#706050');
        drawRect(s2x, by - stackH, stackW, stackH + 2, '#504030');
        drawRect(s2x + 1, by - stackH + 1, stackW - 2, stackH, '#605040');
        drawRect(s2x - 1, by - stackH - 2, stackW + 2, 3, '#706050');
        drawRect(s2x, by - stackH + 8, stackW, 2, '#706050');
        drawRect(s2x, by - stackH + 18, stackW, 2, '#706050');
        // Smoke from stacks
        if (Math.random() < 0.12) {
            spawnSmoke(s1x + stackW / 2, by - stackH - 4);
            spawnSmoke(s2x + stackW / 2, by - stackH - 4);
        }
        // Lightning bolt emblem (larger)
        var lx = bx + bw / 2;
        drawRect(lx - 2, by + 7, 5, 3, '#ffcc00');
        drawRect(lx - 1, by + 10, 4, 2, '#ffcc00');
        drawRect(lx, by + 12, 4, 2, '#ffcc00');
        drawRect(lx + 1, by + 14, 3, 3, '#ffcc00');
        drawRect(lx, by + 10, 2, 2, '#ffee66');
        // Warning stripes on wall
        for (var ws = bx + 4; ws < bx + bw - 6; ws += 8) {
            drawRect(ws, by + bh - 20, 4, 2, '#ffcc00');
            drawRect(ws + 4, by + bh - 20, 4, 2, '#2a2a2a');
        }
        // Industrial roller door
        var doorX = bx + bw / 2 - 7;
        drawRect(doorX - 1, by + bh - 18, 16, 18, '#2a1a0a');
        drawRect(doorX, by + bh - 17, 14, 17, '#3a2a1a');
        for (var dy = by + bh - 16; dy < by + bh - 2; dy += 3) {
            drawRect(doorX + 1, dy, 12, 2, '#4a3a2a');
            drawRect(doorX + 1, dy + 1, 12, 1, '#3a2a1a');
        }
        // Transformer box outside
        drawRect(bx - 6, by + bh - 14, 5, 14, '#404048');
        drawRect(bx - 5, by + bh - 13, 3, 12, '#505058');
        // Sparking transformer
        if (Math.random() < 0.03) {
            drawRect(bx - 5, by + bh - 16, 3, 2, '#ffff80');
        }
        // "POWER" sign
        drawRect(bx + bw / 2 - 10, by + bh - 20, 20, 5, '#2a1a0a');
        ctx.font = '3px "Press Start 2P", monospace';
        ctx.fillStyle = '#ffcc00';
        ctx.textAlign = 'center';
        ctx.fillText('POWER', bx + bw / 2, by + bh - 17);
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
        // Pulsing plasma core with outer glow
        var glow = 0.4 + Math.sin(time * 0.004) * 0.2;
        var outerGlow = 0.15 + Math.sin(time * 0.004) * 0.1;
        ctx.fillStyle = 'rgba(80, 150, 255, ' + outerGlow + ')';
        ctx.fillRect(bx + bw / 2 - 7, by + bh * 0.48 - 2, 14, 12);
        ctx.fillStyle = 'rgba(100, 180, 255, ' + glow + ')';
        ctx.fillRect(bx + bw / 2 - 4, by + bh * 0.5, 8, 8);
        ctx.fillStyle = 'rgba(200, 230, 255, ' + (glow * 0.6) + ')';
        ctx.fillRect(bx + bw / 2 - 2, by + bh * 0.5 + 2, 4, 4);
        // Pulsing energy ring
        var ringAlpha = 0.6 + Math.sin(time * 0.006) * 0.3;
        ctx.fillStyle = 'rgba(68, 136, 255, ' + ringAlpha + ')';
        ctx.fillRect(bx - 2, by + bh * 0.4, bw + 4, 2);
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
        // Shadow
        drawRect(bx + 4, by + 4, bw, bh, 'rgba(0,0,0,0.3)');
        // Foundation — rustic stone
        drawRect(bx - 2, by + bh - 3, bw + 4, 5, '#4a3828');
        drawRect(bx - 1, by + bh - 2, bw + 2, 3, '#5a4838');
        // Main wall — warm wood
        drawRect(bx, by, bw, bh, '#5a3818');
        drawRect(bx + 2, by + 2, bw - 4, bh - 4, '#6a4820');
        drawRect(bx + 3, by + 3, bw - 6, bh - 8, '#7a5830');
        // Right shadow
        drawRect(bx + bw - 3, by + 2, 3, bh - 4, '#4a3018');
        // Wood plank lines
        for (var py = by + 8; py < by + bh - 8; py += 6) {
            drawRect(bx + 3, py, bw - 6, 1, '#6a4020');
        }
        // Peaked roof — 3 layers
        drawRect(bx - 4, by - 3, bw + 8, 5, '#4a2810');
        drawRect(bx - 2, by - 6, bw + 4, 5, '#5a3818');
        drawRect(bx + 2, by - 8, bw - 4, 4, '#5a3818');
        drawRect(bx + 6, by - 10, bw - 12, 3, '#4a2810');
        // Chimney — brick with warm glow
        var chimX = bx + bw - 12;
        drawRect(chimX, by - 22, 8, 20, '#5a3018');
        drawRect(chimX + 1, by - 21, 6, 18, '#6a4028');
        drawRect(chimX - 1, by - 24, 10, 3, '#6a4028');
        // Brick lines on chimney
        drawRect(chimX + 1, by - 16, 6, 1, '#5a3018');
        drawRect(chimX + 1, by - 10, 6, 1, '#5a3018');
        // Warm glow from chimney top
        var warmGlow = 0.3 + Math.sin(time * 0.003) * 0.15;
        ctx.fillStyle = 'rgba(255, 160, 40, ' + warmGlow + ')';
        ctx.fillRect(chimX - 2, by - 28, 12, 6);
        // Cookie smoke and particles
        if (Math.random() < 0.08) spawnSmoke(chimX + 4, by - 26);
        if (Math.random() < 0.06) spawnCookieParticle(chimX + 4, by - 26);
        // Large front window — showing interior with warm light
        drawRect(bx + 4, by + 5, 14, 12, '#3a2010');
        drawRect(bx + 5, by + 6, 12, 10, '#ff9930');
        drawRect(bx + 6, by + 7, 10, 8, '#ffbb60');
        // Window cross-frame
        drawRect(bx + 10, by + 6, 2, 10, '#4a2810');
        drawRect(bx + 5, by + 10, 12, 2, '#4a2810');
        // Interior detail — shelf with cookies visible
        drawRect(bx + 6, by + 8, 3, 1, '#d0a050');
        drawRect(bx + 13, by + 8, 3, 1, '#d0a050');
        // Side window
        drawRect(bx + bw - 14, by + 6, 8, 8, '#3a2010');
        drawRect(bx + bw - 13, by + 7, 6, 6, '#ffaa40');
        // Cozy door with arch top
        var doorX = bx + bw / 2 - 5;
        var doorH = Math.floor(bh * 0.38);
        drawRect(doorX - 1, by + bh - doorH - 1, 12, doorH + 1, '#3a1808');
        drawRect(doorX, by + bh - doorH, 10, doorH, '#4a2810');
        drawRect(doorX + 1, by + bh - doorH + 1, 8, doorH - 2, '#5a3820');
        // Door window (round-ish)
        drawRect(doorX + 3, by + bh - doorH + 3, 4, 4, '#ffaa40');
        // Door handle
        drawRect(doorX + 7, by + bh - doorH / 2, 2, 2, '#c0a040');
        // Welcome mat
        drawRect(doorX - 2, by + bh, 14, 2, '#8a6030');
        // Hanging sign bracket
        drawRect(bx + 3, by + bh - doorH - 4, 2, 6, '#6a5030');
        drawRect(bx + 3, by + bh - doorH - 4, 10, 2, '#6a5030');
        // "COOKIES" sign
        drawRect(bx + 3, by + bh - doorH - 2, 14, 7, '#4a2010');
        ctx.font = '3px "Press Start 2P", monospace';
        ctx.fillStyle = '#ffcc66';
        ctx.textAlign = 'center';
        ctx.fillText('COOKIES', bx + 10, by + bh - doorH + 2);
        // Awning over door
        drawRect(doorX - 3, by + bh - doorH - 3, 16, 3, '#cc6620');
        drawRect(doorX - 2, by + bh - doorH - 2, 14, 1, '#dd7730');
        // Warm light spill onto ground
        var doorGlowA = 0.1 + Math.sin(time * 0.002) * 0.04;
        ctx.fillStyle = 'rgba(255, 170, 60, ' + doorGlowA + ')';
        ctx.fillRect(doorX - 4, by + bh + 1, 18, 5);
        // Planter box with flowers
        drawRect(bx - 4, by + bh - 10, 4, 10, '#5a4020');
        drawRect(bx - 3, by + bh - 12, 2, 3, '#40a040');
        drawRect(bx - 4, by + bh - 13, 3, 2, '#ff6060');
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
        // Data streams radiating from dish
        for (var ds = 0; ds < 3; ds++) {
            var dsY = by - 22 - ((time * 0.03 + ds * 8) % 24);
            var dsAlpha = 1.0 - ((time * 0.03 + ds * 8) % 24) / 24;
            ctx.fillStyle = 'rgba(68, 255, 221, ' + (dsAlpha * 0.4) + ')';
            ctx.fillRect(bx + bw / 2 - 1, Math.floor(dsY), 2, 2);
        }
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
        // Flag on top with flutter animation
        drawRect(bx + bw / 2, by - 12, 2, 12, '#8a7a40');
        var flagWave = Math.sin(time * 0.005) * 1;
        drawRect(bx + bw / 2 + 2, by - 12 + Math.floor(flagWave), 6, 4, '#ffdd44');
        drawRect(bx + bw / 2 + 2, by - 11 + Math.floor(flagWave), 5, 2, '#ddbb22');
        drawWindows(bx, by, bw, bh, time, 850, '#ffdd44', '#302810');
    }

    function drawRobotFactory(bx, by, bw, bh, time) {
        var wallColor = '#4a2020';
        drawRect(bx, by, bw, bh, wallColor);
        drawRect(bx + 1, by + 1, bw - 2, bh - 2, '#5a3030');
        drawRect(bx - 2, by - 3, bw + 4, 5, '#6a3030');
        // Robot eye — alternating scan
        var eyePhase = Math.sin(time * 0.004);
        var eyeGlow = eyePhase > 0 ? '#ff4040' : '#601010';
        drawRect(bx + bw / 2 - 4, by + 6, 3, 3, eyeGlow);
        drawRect(bx + bw / 2 + 1, by + 6, 3, 3, eyePhase > 0 ? '#601010' : '#ff4040');
        // Assembly line (moving dots)
        var lineOffset = Math.floor(time * 0.01) % 8;
        for (var lx = bx + 4; lx < bx + bw - 4; lx += 8) {
            drawRect(lx + lineOffset, by + bh / 2, 3, 2, '#ff8844');
        }
        // Welding sparks
        if (Math.random() < 0.05) {
            var sparkX = bx + 4 + Math.random() * (bw - 8);
            var sparkY = by + bh * 0.4 + Math.random() * 8;
            drawRect(sparkX, sparkY, 1, 1, '#ffff80');
            drawRect(sparkX + 1, sparkY - 1, 1, 1, '#ffaa40');
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
        // Animated exhaust flame
        var flameH = 6 + Math.sin(time * 0.01) * 3;
        var flameAlpha = 0.3 + Math.sin(time * 0.008) * 0.15;
        ctx.fillStyle = 'rgba(255, 200, 60, ' + flameAlpha + ')';
        ctx.fillRect(rocketX + 2, by + bh * 0.55, 4, Math.floor(flameH));
        ctx.fillStyle = 'rgba(255, 100, 20, ' + (flameAlpha * 0.7) + ')';
        ctx.fillRect(rocketX + 3, by + bh * 0.55 + Math.floor(flameH), 2, Math.floor(flameH * 0.6));
        if (Math.random() < 0.15) spawnSmoke(rocketX + 4, by + bh * 0.55 + flameH);
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

    function drawComedyClubUpgrade(bx, by, bw, bh, time) {
        drawRect(bx, by, bw, bh, '#3a2040');
        drawRect(bx + 1, by + 1, bw - 2, bh - 2, '#4a2850');
        drawRect(bx - 1, by - 2, bw + 2, 4, '#2a1030');
        for (var ml = bx; ml < bx + bw; ml += 5) {
            var bulbOn = ((Math.floor(time * 0.005) + ml) % 3) === 0;
            drawRect(ml, by - 1, 3, 2, bulbOn ? '#ffdd44' : '#2a1030');
        }
        ctx.font = '4px "Press Start 2P", monospace';
        ctx.fillStyle = '#ffdd44';
        ctx.textAlign = 'center';
        ctx.fillText('HA HA', bx + bw / 2, by + 8);
        drawRect(bx + bw / 2 - 3, by + bh - 10, 6, 10, '#2a1020');
        drawWindows(bx, by + 12, bw, bh - 18, time, 870, '#ffcc44', '#2a1808');
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
        medical_clinic: drawMedicalClinic,
        comedy_club: drawComedyClubUpgrade
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
        var cellH = 65;
        var bw = Math.max(36, bSize.w * 44);
        var bh = Math.max(34, bSize.h * 38);
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
        var cellH = 58;
        var bw = Math.max(32, bSize.w * 40);
        var bh = Math.max(30, bSize.h * 32);
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

    function getBuildingDimensions(buildingData, isTown) {
        var bSize = buildingData && buildingData.size ? buildingData.size : { w: 1, h: 1 };
        if (isTown) {
            return { w: Math.max(32, bSize.w * 40), h: Math.max(30, bSize.h * 32) };
        }
        return { w: Math.max(36, bSize.w * 44), h: Math.max(34, bSize.h * 38) };
    }

    function drawAllBuildings(state, time) {
        if (!state) return;

        var allBuildings = [];
        var i;

        if (state.buildings) {
            for (i = 0; i < state.buildings.length; i++) {
                var cb = state.buildings[i];
                // Support both old grid-based and new worldX-based placement
                var bData = (GAME.DATA && GAME.DATA.BUILDINGS) ? GAME.DATA.BUILDINGS[cb.type] : null;
                var wx = cb.worldX;
                if (wx === undefined) {
                    var pos = campusBuildingPos(i, bData);
                    wx = pos.x;
                }
                allBuildings.push({ placed: cb, data: bData, worldX: wx, isTown: false });
            }
        }

        if (state.townBuildings) {
            for (i = 0; i < state.townBuildings.length; i++) {
                var tb = state.townBuildings[i];
                var tData = (GAME.DATA && GAME.DATA.TOWN && GAME.DATA.TOWN.buildings) ? GAME.DATA.TOWN.buildings[tb.type] : null;
                var twx = tb.worldX;
                if (twx === undefined) {
                    var tPos = townBuildingPos(i, tData);
                    twx = tPos.x;
                }
                allBuildings.push({ placed: tb, data: tData, worldX: twx, isTown: true });
            }
        }

        for (i = 0; i < allBuildings.length; i++) {
            var entry = allBuildings[i];
            var dims = getBuildingDimensions(entry.data, entry.isTown);
            var bx = entry.worldX;
            var by = BUILDING_FLOOR - dims.h;

            if (!isVisible(bx - 5, dims.w + 10)) continue;

            var drawFn = entry.isTown ? TOWN_DRAW[entry.placed.type] : CAMPUS_DRAW[entry.placed.type];
            if (drawFn) {
                drawFn(bx, by, dims.w, dims.h, time);
            } else {
                drawGenericBuilding(bx, by, dims.w, dims.h, time, entry.data);
            }

            var label = entry.data ? entry.data.name : entry.placed.type;
            if (label.length > 12) label = label.substring(0, 12);
            drawText(label, bx + dims.w / 2, by + dims.h + 2, {
                size: 5, color: '#8080a0', align: 'center'
            });
        }
    }

    function drawPlacementGhost(pm, time) {
        if (!pm || pm.worldX === undefined) return;
        var bData = pm.isTown
            ? (GAME.DATA.TOWN && GAME.DATA.TOWN.buildings ? GAME.DATA.TOWN.buildings[pm.buildingId] : null)
            : (GAME.DATA.BUILDINGS ? GAME.DATA.BUILDINGS[pm.buildingId] : null);
        var dims = getBuildingDimensions(bData, pm.isTown);
        var bx = pm.worldX;
        var by = BUILDING_FLOOR - dims.h;

        ctx.globalAlpha = 0.5;
        var drawFn = pm.isTown ? TOWN_DRAW[pm.buildingId] : CAMPUS_DRAW[pm.buildingId];
        if (drawFn) drawFn(bx, by, dims.w, dims.h, time);
        else drawGenericBuilding(bx, by, dims.w, dims.h, time, bData);
        ctx.globalAlpha = 1.0;

        var color = pm.canPlace ? '#44ff88' : '#ff4444';
        drawOutline(bx - 1, by - 1, dims.w + 2, dims.h + 2, color, 2);
    }

    // =========================================================================
    //  PERMANENT TOWN FEATURES (always visible, even before player builds)
    // =========================================================================

    // --- SEEDY STARTER BUILDINGS (the downmarket establishments) ---

    function drawSeedyBar(x, time) {
        var bw = 100, bh = 82;
        var by = BUILDING_FLOOR - bh;
        // Drop shadow
        drawRect(x + 5, by + 5, bw + 2, bh + 2, 'rgba(0,0,0,0.35)');
        // 3-tone gradient brick walls
        drawWall3Tone(x, by, bw, bh, '#5a3828');
        // Brick texture rows with mortar gaps
        for (var br = 0; br < 9; br++) {
            for (var bc = 0; bc < 6; bc++) {
                var brickOff = (br % 2) * 7;
                var bx2 = x + 3 + bc * 15 + brickOff;
                var by2 = by + 4 + br * 8;
                if (bx2 + 12 > x + bw - 4) continue;
                drawRect(bx2, by2, 12, 6, '#503020');
                drawRect(bx2, by2, 12, 1, '#5a3828');
                drawRect(bx2, by2 + 5, 12, 1, '#3a1810');
            }
        }
        // Weathering
        drawWeathering(x, by, bw, bh, 1001);
        // Foundation
        drawFoundation(x, BUILDING_FLOOR - 4, bw);
        // Sagging roof with tiles and gutter
        drawRect(x - 4, by - 6, bw + 8, 8, '#3a2018');
        drawRect(x - 3, by - 4, bw + 6, 4, '#4a3028');
        drawRect(x - 3, by - 1, bw + 6, 2, '#2a1810');
        for (var rt = 0; rt < 12; rt++) {
            drawRect(x - 3 + rt * 8, by - 6, 7, 3, rt % 2 ? '#3a2018' : '#322018');
        }
        // Chimney
        drawRect(x + bw - 16, by - 18, 8, 14, '#4a3020');
        drawRect(x + bw - 15, by - 17, 6, 12, '#5a3828');
        drawRect(x + bw - 17, by - 20, 10, 3, '#3a2018');
        // Swinging pub sign
        var signSwing = Math.sin(time * 0.002) * 2;
        drawRect(x + 6, by - 16, 2, 12, '#4a3020');
        drawRect(x + 4, by - 18 + signSwing, 28, 14, '#2a1810');
        drawRect(x + 6, by - 16 + signSwing, 24, 10, '#1a1008');
        drawRect(x + 5, by - 17 + signSwing, 26, 1, '#4a3020');
        ctx.font = '4px "Press Start 2P", monospace';
        ctx.fillStyle = '#c08040';
        ctx.textAlign = 'center';
        ctx.fillText('RUSTY', x + 18, by - 15 + signSwing);
        ctx.fillText('ANCHOR', x + 18, by - 10 + signSwing);
        // Neon "BAR" sign with glow halo
        var neonOn = Math.sin(time * 0.007) > -0.3;
        var neonFlicker = Math.sin(time * 0.023) > 0.8 ? 0 : 1;
        drawRect(x + 34, by + 6, 36, 16, '#200808');
        drawRect(x + 35, by + 7, 34, 14, '#180606');
        if (neonOn && neonFlicker) {
            ctx.font = '10px "Press Start 2P", monospace';
            ctx.fillStyle = '#ff2020';
            ctx.textAlign = 'center';
            ctx.fillText('BAR', x + 52, by + 10);
            // Neon glow halo
            ctx.fillStyle = 'rgba(255, 30, 30, 0.2)';
            ctx.fillRect(x + 28, by, 48, 28);
            // Ground reflection
            ctx.fillStyle = 'rgba(255, 30, 30, 0.05)';
            ctx.fillRect(x + 30, BUILDING_FLOOR, 44, 4);
        } else {
            ctx.font = '10px "Press Start 2P", monospace';
            ctx.fillStyle = '#401010';
            ctx.textAlign = 'center';
            ctx.fillText('BAR', x + 52, by + 10);
        }
        // Windows with frames, curtains, and interior
        for (var wi = 0; wi < 2; wi++) {
            var wx = x + 36 + wi * 20;
            // Frame
            drawRect(wx - 1, by + 26, 16, 18, '#2a1810');
            // Glass
            drawRect(wx, by + 27, 14, 16, '#1a1810');
            // Interior: shelf with bottles
            drawRect(wx + 1, by + 28, 12, 2, '#3a2818');
            drawRect(wx + 2, by + 26, 2, 4, '#508030');
            drawRect(wx + 5, by + 26, 2, 4, '#805030');
            drawRect(wx + 8, by + 26, 2, 4, '#306060');
            // Curtain (partial)
            drawRect(wx, by + 27, 4, 16, '#4a2020');
            // Warm light glow
            var warmGlow = Math.sin(time * 0.002) * 0.05 + 0.1;
            ctx.fillStyle = 'rgba(255, 180, 60, ' + warmGlow + ')';
            ctx.fillRect(wx, by + 27, 14, 16);
            // Light spill down wall below window
            ctx.fillStyle = 'rgba(255, 160, 40, 0.04)';
            ctx.fillRect(wx - 1, by + 43, 16, 20);
            // Window sill
            drawRect(wx - 1, by + 43, 16, 2, '#3a2818');
        }
        // Door with awning and interior glow
        drawRect(x + 12, by + bh - 30, 22, 30, '#2a1810');
        drawGradientRect(x + 14, by + bh - 28, 18, 28, '#3a2818', '#2a1810');
        // Door glass panel
        drawRect(x + 16, by + bh - 24, 14, 12, '#1a1810');
        ctx.fillStyle = 'rgba(255, 160, 60, 0.08)';
        ctx.fillRect(x + 16, by + bh - 24, 14, 12);
        // Door handle
        drawRect(x + 30, by + bh - 16, 2, 4, '#806020');
        // Awning with stripes
        drawRect(x + 8, by + bh - 34, 30, 5, '#5a2020');
        drawRect(x + 8, by + bh - 32, 30, 2, '#4a1818');
        for (var aw = 0; aw < 4; aw++) {
            drawRect(x + 10 + aw * 7, by + bh - 34, 3, 5, '#4a1818');
        }
        // Steps
        drawRect(x + 10, BUILDING_FLOOR - 4, 26, 2, '#3a3030');
        drawRect(x + 12, BUILDING_FLOOR - 2, 22, 2, '#343030');
        drawRect(x + 14, BUILDING_FLOOR, 18, 2, '#303030');
        // Doorway warm light spill on ground
        ctx.fillStyle = 'rgba(255, 160, 60, 0.06)';
        ctx.fillRect(x + 10, BUILDING_FLOOR, 26, 6);
        // Puddle with bar-red reflection
        ctx.fillStyle = 'rgba(30, 50, 70, 0.3)';
        ctx.fillRect(x - 6, BUILDING_FLOOR + 2, 20, 3);
        if (neonOn) {
            ctx.fillStyle = 'rgba(255, 30, 30, 0.04)';
            ctx.fillRect(x - 6, BUILDING_FLOOR + 2, 20, 3);
        }
        // Trash bags by wall
        drawRect(x + bw - 10, BUILDING_FLOOR - 6, 7, 6, '#2a3020');
        drawRect(x + bw - 8, BUILDING_FLOOR - 8, 5, 4, '#2a3020');
        drawRect(x + bw - 12, BUILDING_FLOOR - 4, 5, 4, '#303828');
        // Drunk person slumped against wall
        var slump = Math.sin(time * 0.001) * 0.5;
        drawRect(x - 2, BUILDING_FLOOR - 10 + slump, 6, 5, '#d0a060');
        drawRect(x - 3, BUILDING_FLOOR - 5 + slump, 8, 5, '#505060');
        drawRect(x - 2, BUILDING_FLOOR + slump, 4, 3, '#2a2a3a');
        drawRect(x + 3, BUILDING_FLOOR + slump, 4, 3, '#2a2a3a');
        // Bottle
        drawRect(x + 8, BUILDING_FLOOR - 1, 2, 4, '#306030');
        // Outdoor ashtray on stand
        drawRect(x + bw + 4, BUILDING_FLOOR - 10, 2, 10, '#505050');
        drawRect(x + bw + 2, BUILDING_FLOOR - 12, 6, 3, '#606060');
    }

    function drawVideoShop(x, time) {
        var bw = 90, bh = 72;
        var by = BUILDING_FLOOR - bh;
        // Drop shadow
        drawRect(x + 5, by + 5, bw + 2, bh + 2, 'rgba(0,0,0,0.35)');
        // 3-tone gradient wall — faded blue
        drawWall3Tone(x, by, bw, bh, '#2a3050');
        // Horizontal cladding lines
        for (var cl = 0; cl < 8; cl++) {
            drawRect(x + 2, by + 6 + cl * 8, bw - 4, 1, 'rgba(0,0,0,0.06)');
        }
        // Weathering
        drawWeathering(x, by, bw, bh, 2001);
        // Foundation
        drawFoundation(x, BUILDING_FLOOR - 4, bw);
        // Flat roof with satellite dish and vent
        drawRect(x - 3, by - 5, bw + 6, 7, '#202838');
        drawRect(x - 2, by - 3, bw + 4, 3, '#2a3040');
        drawRect(x - 2, by - 1, bw + 4, 2, '#181e2a');
        // Satellite dish
        drawRect(x + bw - 16, by - 18, 2, 14, '#606868');
        drawRect(x + bw - 22, by - 22, 14, 5, '#506060');
        drawRect(x + bw - 20, by - 24, 10, 3, '#607070');
        drawRect(x + bw - 16, by - 20, 4, 2, '#708080');
        // Roof vent
        drawRect(x + 12, by - 8, 8, 5, '#3a4050');
        drawRect(x + 13, by - 6, 6, 2, '#4a5060');
        // "BLOCKBLASTER VIDEO" sign with neon glow
        drawRect(x + 4, by + 4, bw - 8, 16, '#181828');
        drawRect(x + 5, by + 5, bw - 10, 14, '#141420');
        drawRect(x + 5, by + 5, bw - 10, 1, '#2a2a40');
        var videoNeon = Math.sin(time * 0.005) > -0.3;
        ctx.font = '4px "Press Start 2P", monospace';
        ctx.fillStyle = videoNeon ? '#8a8aee' : '#3a3a60';
        ctx.textAlign = 'center';
        ctx.fillText('BLOCKBLASTER', x + bw / 2, by + 7);
        ctx.font = '6px "Press Start 2P", monospace';
        ctx.fillStyle = videoNeon ? '#6a6acc' : '#2a2a50';
        ctx.fillText('VIDEO', x + bw / 2, by + 13);
        if (videoNeon) {
            ctx.fillStyle = 'rgba(100, 100, 220, 0.15)';
            ctx.fillRect(x + 2, by + 2, bw - 4, 22);
            ctx.fillStyle = 'rgba(100, 100, 220, 0.04)';
            ctx.fillRect(x + 10, BUILDING_FLOOR, bw - 20, 4);
        }
        // Awning with stripes
        drawRect(x + 2, by + 20, bw - 4, 5, '#3a4a7a');
        for (var aw = 0; aw < 9; aw++) {
            drawRect(x + 4 + aw * 8, by + 20, 4, 5, '#2a3a6a');
        }
        drawRect(x + 2, by + 24, bw - 4, 1, '#1a2a5a');
        // Shop window left — movie posters & VHS tapes
        drawRect(x + 3, by + 26, 30, 22, '#2a3050');
        drawRect(x + 4, by + 27, 28, 20, '#101018');
        drawRect(x + 5, by + 28, 26, 18, '#181828');
        // Movie posters on back wall
        drawRect(x + 6, by + 29, 7, 10, '#cc4444');
        drawRect(x + 7, by + 30, 5, 4, '#dd6666');
        drawRect(x + 14, by + 29, 7, 10, '#44aa44');
        drawRect(x + 15, by + 30, 5, 4, '#66cc66');
        drawRect(x + 22, by + 29, 7, 10, '#4444cc');
        drawRect(x + 23, by + 30, 5, 4, '#6666dd');
        // VHS tapes on shelf
        drawRect(x + 5, by + 40, 26, 1, '#3a3040');
        var tapeColors = ['#cc4444', '#44aa44', '#4444cc', '#cccc44', '#cc44cc', '#44cccc'];
        for (var t = 0; t < 6; t++) {
            drawRect(x + 6 + t * 4, by + 41, 3, 4, tapeColors[t]);
            drawRect(x + 6 + t * 4, by + 41, 3, 1, lightenColor(tapeColors[t], 30));
        }
        // Window sill
        drawRect(x + 3, by + 47, 30, 2, '#2a3050');
        // Warm interior glow
        var shopGlow = Math.sin(time * 0.002) * 0.03 + 0.06;
        ctx.fillStyle = 'rgba(180, 180, 255, ' + shopGlow + ')';
        ctx.fillRect(x + 5, by + 28, 26, 18);
        // Light spill below window
        ctx.fillStyle = 'rgba(150, 150, 220, 0.03)';
        ctx.fillRect(x + 4, by + 48, 28, 14);
        // Second window — NEW RELEASES
        drawRect(x + 37, by + 26, 28, 22, '#2a3050');
        drawRect(x + 38, by + 27, 26, 20, '#101018');
        drawRect(x + 39, by + 28, 24, 18, '#181828');
        ctx.font = '3px "Press Start 2P", monospace';
        ctx.fillStyle = '#6060a0';
        ctx.textAlign = 'center';
        ctx.fillText('NEW RELEASES', x + 51, by + 31);
        for (var t2 = 0; t2 < 5; t2++) {
            drawRect(x + 40 + t2 * 4, by + 34, 3, 8, tapeColors[(t2 + 2) % 6]);
        }
        drawRect(x + 37, by + 47, 28, 2, '#2a3050');
        ctx.fillStyle = 'rgba(180, 180, 255, ' + shopGlow + ')';
        ctx.fillRect(x + 39, by + 28, 24, 18);
        ctx.fillStyle = 'rgba(150, 150, 220, 0.03)';
        ctx.fillRect(x + 38, by + 48, 26, 14);
        // Door with glass panel
        drawRect(x + 33, by + bh - 24, 14, 24, '#181828');
        drawGradientRect(x + 34, by + bh - 22, 12, 22, '#202838', '#181828');
        drawRect(x + 35, by + bh - 20, 10, 10, '#101018');
        ctx.fillStyle = 'rgba(180, 180, 255, 0.05)';
        ctx.fillRect(x + 35, by + bh - 20, 10, 10);
        drawRect(x + 44, by + bh - 14, 1, 2, '#808090');
        // Steps
        drawRect(x + 31, BUILDING_FLOOR - 4, 18, 2, '#2a3040');
        drawRect(x + 33, BUILDING_FLOOR - 2, 14, 2, '#242a38');
        // "CLOSING DOWN SALE" banner
        drawRect(x + 2, by + bh - 28, bw - 4, 9, '#cc2020');
        drawGradientRect(x + 3, by + bh - 27, bw - 6, 7, '#881010', '#cc2020');
        ctx.font = '4px "Press Start 2P", monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('CLOSING DOWN SALE', x + bw / 2, by + bh - 25);
        // Doorway warm light spill on ground
        ctx.fillStyle = 'rgba(180, 180, 255, 0.04)';
        ctx.fillRect(x + 32, BUILDING_FLOOR, 16, 5);
        // Return slot on wall
        drawRect(x + bw - 10, by + bh - 18, 8, 12, '#1a1a2a');
        drawRect(x + bw - 9, by + bh - 14, 6, 2, '#101018');
        ctx.font = '2px "Press Start 2P", monospace';
        ctx.fillStyle = '#6060a0';
        ctx.textAlign = 'center';
        ctx.fillText('RETURNS', x + bw - 6, by + bh - 17);
        // Promotional standee outside
        drawRect(x - 4, BUILDING_FLOOR - 16, 8, 16, '#ccaa44');
        drawRect(x - 3, BUILDING_FLOOR - 14, 6, 12, '#ddbb55');
        drawRect(x - 2, BUILDING_FLOOR - 12, 4, 4, '#aa4444');
        // Puddle with blue reflection
        ctx.fillStyle = 'rgba(30, 40, 70, 0.3)';
        ctx.fillRect(x + bw - 4, BUILDING_FLOOR + 2, 14, 3);
        if (videoNeon) {
            ctx.fillStyle = 'rgba(100, 100, 220, 0.03)';
            ctx.fillRect(x + bw - 4, BUILDING_FLOOR + 2, 14, 3);
        }
    }

    function drawSeedyArcade(x, time) {
        var bw = 104, bh = 78;
        var by = BUILDING_FLOOR - bh;
        // Drop shadow
        drawRect(x + 5, by + 5, bw + 2, bh + 2, 'rgba(0,0,0,0.35)');
        // 3-tone gradient wall — dark purple/black
        drawWall3Tone(x, by, bw, bh, '#1a1a30');
        // Vertical panel lines
        for (var pl = 0; pl < 6; pl++) {
            drawRect(x + 4 + pl * 16, by + 4, 1, bh - 6, 'rgba(0,0,0,0.08)');
        }
        // Weathering
        drawWeathering(x, by, bw, bh, 3001);
        // Foundation
        drawFoundation(x, BUILDING_FLOOR - 4, bw);
        // Roof with chasing lights
        drawRect(x - 4, by - 6, bw + 8, 8, '#101028');
        drawRect(x - 3, by - 4, bw + 6, 4, '#181830');
        drawRect(x - 3, by - 1, bw + 6, 2, '#0a0a18');
        for (var li = 0; li < 14; li++) {
            var lightOn = ((Math.floor(time * 0.005) + li) % 4) === 0;
            var lightColor = lightOn ? ['#ff4040', '#40ff40', '#4040ff', '#ffff40'][li % 4] : '#201818';
            drawRect(x + 2 + li * 6, by - 5, 4, 3, lightColor);
            if (lightOn) {
                ctx.fillStyle = 'rgba(255,255,255,0.04)';
                ctx.fillRect(x + li * 6, by - 2, 8, 8);
            }
        }
        // Big "ARCADE" sign with glow halo
        drawRect(x + 6, by + 5, bw - 12, 18, '#0a0a18');
        drawRect(x + 7, by + 6, bw - 14, 16, '#080814');
        drawRect(x + 7, by + 6, bw - 14, 1, '#1a1a30');
        var arcLetters = ['A', 'R', 'C', 'A', 'D', 'E'];
        var arcColors = ['#ff4040', '#ffaa00', '#ffff00', '#40ff40', '#4040ff', '#ff40ff'];
        var arcFlicker = Math.sin(time * 0.006) > -0.2;
        for (var ai = 0; ai < 6; ai++) {
            var letterFlick = Math.sin(time * 0.011 + ai * 1.7) > -0.7;
            ctx.font = '9px "Press Start 2P", monospace';
            ctx.fillStyle = (arcFlicker && letterFlick) ? arcColors[ai] : darkenColor(arcColors[ai], 0.3);
            ctx.textAlign = 'left';
            ctx.fillText(arcLetters[ai], x + 14 + ai * 11, by + 10);
        }
        // Glow halo from sign
        if (arcFlicker) {
            ctx.fillStyle = 'rgba(100, 60, 200, 0.12)';
            ctx.fillRect(x + 2, by + 2, bw - 4, 26);
            ctx.fillStyle = 'rgba(100, 60, 200, 0.04)';
            ctx.fillRect(x + 10, BUILDING_FLOOR, bw - 20, 5);
        }
        // Large window showing cabinets — with frame
        drawRect(x + 3, by + 26, bw - 10, 26, '#1a1a30');
        drawRect(x + 4, by + 27, bw - 12, 24, '#0a0a14');
        // Arcade cabinets (5 of them) with screen glow
        for (var cab = 0; cab < 5; cab++) {
            var cx = x + 8 + cab * 15;
            drawRect(cx, by + 30, 11, 20, '#181828');
            drawRect(cx + 1, by + 28, 9, 3, '#202038');
            drawRect(cx + 1, by + 31, 9, 10, '#0a0a14');
            var screenCol = ['#20ff40', '#4080ff', '#ff8020', '#ff40ff', '#40ffff'][cab];
            var flicker = Math.sin(time * 0.005 + cab * 2) > -0.5;
            if (flicker) {
                drawRect(cx + 2, by + 32, 7, 8, screenCol);
                // Screen glow on cabinet
                ctx.fillStyle = 'rgba(100,200,100,0.06)';
                ctx.fillRect(cx, by + 28, 11, 22);
            }
            drawRect(cx + 3, by + 44, 5, 4, '#252530');
            drawRect(cx + 4, by + 45, 3, 2, '#ff4040');
        }
        // Multi-color ground glow from cabinets
        ctx.fillStyle = 'rgba(40, 200, 100, 0.03)';
        ctx.fillRect(x + 6, BUILDING_FLOOR, bw - 16, 4);
        // Window sill
        drawRect(x + 3, by + 52, bw - 10, 2, '#1a1a30');
        // Door with neon border
        drawRect(x + bw / 2 - 8, by + bh - 24, 16, 24, '#0a0a18');
        drawGradientRect(x + bw / 2 - 7, by + bh - 22, 14, 22, '#141420', '#0a0a18');
        drawRect(x + bw / 2 - 7, by + bh - 22, 14, 1, '#4040ff');
        drawRect(x + bw / 2 - 7, by + bh - 22, 1, 22, '#4040ff');
        drawRect(x + bw / 2 + 6, by + bh - 22, 1, 22, '#4040ff');
        drawRect(x + bw / 2 + 4, by + bh - 14, 1, 2, '#606070');
        // "OPEN 24/7" neon on door
        var openNeon = Math.sin(time * 0.008) > -0.5;
        ctx.font = '3px "Press Start 2P", monospace';
        ctx.fillStyle = openNeon ? '#ff4040' : '#401010';
        ctx.textAlign = 'center';
        ctx.fillText('OPEN 24/7', x + bw / 2, by + bh - 8);
        // Steps
        drawRect(x + bw / 2 - 10, BUILDING_FLOOR - 4, 20, 2, '#1a1a28');
        drawRect(x + bw / 2 - 8, BUILDING_FLOOR - 2, 16, 2, '#161624');
        // Doorway glow on ground
        ctx.fillStyle = 'rgba(60, 40, 180, 0.05)';
        ctx.fillRect(x + bw / 2 - 10, BUILDING_FLOOR, 20, 6);
        // Pac-man ghost mural on side wall
        drawRect(x + bw - 8, by + 28, 6, 6, '#ff4040');
        drawRect(x + bw - 8, by + 34, 1, 2, '#ff4040');
        drawRect(x + bw - 6, by + 34, 1, 2, '#ff4040');
        drawRect(x + bw - 4, by + 34, 1, 2, '#ff4040');
        // Pac-man dots
        drawRect(x + bw - 8, by + 40, 2, 2, '#ffff40');
        drawRect(x + bw - 8, by + 44, 2, 2, '#ffff40');
        // Bicycle rack outside
        drawRect(x - 6, BUILDING_FLOOR - 8, 10, 1, '#505058');
        drawRect(x - 5, BUILDING_FLOOR - 8, 1, 8, '#505058');
        drawRect(x + 2, BUILDING_FLOOR - 8, 1, 8, '#505058');
        // Bicycle
        drawRect(x - 4, BUILDING_FLOOR - 7, 6, 5, '#cc4444');
        drawRect(x - 3, BUILDING_FLOOR - 4, 2, 4, '#303030');
        drawRect(x + 1, BUILDING_FLOOR - 4, 2, 4, '#303030');
        // Vending machine
        drawRect(x + bw + 4, BUILDING_FLOOR - 16, 8, 16, '#2020aa');
        drawRect(x + bw + 5, BUILDING_FLOOR - 14, 6, 8, '#3030cc');
        drawRect(x + bw + 6, BUILDING_FLOOR - 4, 4, 2, '#404040');
        var vendGlow = Math.sin(time * 0.003) * 0.03 + 0.05;
        ctx.fillStyle = 'rgba(60, 60, 255, ' + vendGlow + ')';
        ctx.fillRect(x + bw + 4, BUILDING_FLOOR - 16, 8, 16);
    }

    function drawComedyClub(x, time) {
        var bw = 94, bh = 74;
        var by = BUILDING_FLOOR - bh;
        // Drop shadow
        drawRect(x + 5, by + 5, bw + 2, bh + 2, 'rgba(0,0,0,0.35)');
        // 3-tone gradient wall — dark plum brick
        drawWall3Tone(x, by, bw, bh, '#2a1828');
        // Brick texture rows
        for (var br = 0; br < 8; br++) {
            for (var bc = 0; bc < 5; bc++) {
                var brickOff = (br % 2) * 7;
                var bx2 = x + 4 + bc * 14 + brickOff;
                var by2 = by + 22 + br * 6;
                if (bx2 + 11 > x + bw - 4) continue;
                drawRect(bx2, by2, 11, 4, '#321828');
                drawRect(bx2, by2, 11, 1, '#3a2030');
                drawRect(bx2, by2 + 3, 11, 1, '#1a0818');
            }
        }
        // Weathering
        drawWeathering(x, by, bw, bh, 4001);
        // Foundation
        drawFoundation(x, BUILDING_FLOOR - 4, bw);
        // Roof with marquee chase bulbs
        drawRect(x - 4, by - 7, bw + 8, 9, '#1a0a20');
        drawRect(x - 3, by - 4, bw + 6, 4, '#2a1830');
        drawRect(x - 3, by - 1, bw + 6, 2, '#120818');
        for (var ml = 0; ml < 13; ml++) {
            var bulbPhase = ((Math.floor(time * 0.005) + ml) % 4);
            var bulbColor = bulbPhase === 0 ? '#ffdd44' : bulbPhase === 1 ? '#ff4444' : bulbPhase === 2 ? '#44ddff' : '#301020';
            drawRect(x - 1 + ml * 6, by - 6, 4, 3, bulbColor);
            if (bulbPhase < 2) {
                ctx.fillStyle = 'rgba(255,255,200,0.03)';
                ctx.fillRect(x - 2 + ml * 6, by - 3, 6, 6);
            }
        }
        // "COMEDY" neon sign with glow halo
        var neonPulse = Math.sin(time * 0.005) > -0.2;
        drawRect(x + 4, by + 4, bw - 8, 16, '#0a0810');
        drawRect(x + 5, by + 5, bw - 10, 14, '#080610');
        drawRect(x + 5, by + 5, bw - 10, 1, '#1a1028');
        ctx.font = '7px "Press Start 2P", monospace';
        ctx.fillStyle = neonPulse ? '#ffdd44' : '#403018';
        ctx.textAlign = 'center';
        ctx.fillText('COMEDY', x + bw / 2, by + 10);
        if (neonPulse) {
            ctx.fillStyle = 'rgba(255, 220, 68, 0.15)';
            ctx.fillRect(x + 2, by + 2, bw - 4, 22);
            ctx.fillStyle = 'rgba(255, 220, 68, 0.04)';
            ctx.fillRect(x + 10, BUILDING_FLOOR, bw - 20, 5);
        }
        // Neon microphone icon with glow
        var micOn = Math.sin(time * 0.004 + 1.5) > 0;
        if (micOn) {
            drawRect(x + bw - 16, by + 6, 4, 6, '#ffdd44');
            drawRect(x + bw - 17, by + 5, 6, 2, '#ffdd44');
            drawRect(x + bw - 15, by + 12, 2, 4, '#ffdd44');
            drawRect(x + bw - 17, by + 16, 6, 1, '#ffdd44');
            ctx.fillStyle = 'rgba(255, 220, 68, 0.08)';
            ctx.fillRect(x + bw - 20, by + 3, 12, 16);
        }
        // Windows with warm stage glow — framed
        for (var wi = 0; wi < 2; wi++) {
            var wx = wi === 0 ? x + 5 : x + bw - 23;
            drawRect(wx - 1, by + 24, 16, 14, '#2a1828');
            drawRect(wx, by + 25, 14, 12, '#1a1008');
            drawRect(wx + 1, by + 26, 12, 10, '#2a1808');
            // Stage interior — spotlight and figure
            drawRect(wx + 4, by + 28, 4, 6, '#4a3018');
            // Stage glow
            var stageGlow = Math.sin(time * 0.003) * 0.06 + 0.12;
            ctx.fillStyle = 'rgba(255, 200, 60, ' + stageGlow + ')';
            ctx.fillRect(wx + 1, by + 26, 12, 10);
            // Curtain edge
            drawRect(wx, by + 25, 3, 12, '#6a2030');
            drawRect(wx + 11, by + 25, 3, 12, '#6a2030');
            // Sill
            drawRect(wx - 1, by + 37, 16, 2, '#2a1828');
            // Light spill down wall
            ctx.fillStyle = 'rgba(255, 200, 60, 0.04)';
            ctx.fillRect(wx - 1, by + 39, 16, 16);
        }
        // Door with velvet awning
        drawRect(x + bw / 2 - 9, by + bh - 28, 18, 28, '#1a1010');
        drawGradientRect(x + bw / 2 - 7, by + bh - 26, 14, 26, '#2a1818', '#1a1010');
        drawRect(x + bw / 2 - 7, by + bh - 20, 14, 10, '#181010');
        ctx.fillStyle = 'rgba(255, 160, 60, 0.05)';
        ctx.fillRect(x + bw / 2 - 7, by + bh - 20, 14, 10);
        drawRect(x + bw / 2 + 5, by + bh - 16, 1, 2, '#c0a040');
        // Awning with fringe
        drawRect(x + bw / 2 - 13, by + bh - 32, 26, 5, '#4a2030');
        drawGradientRect(x + bw / 2 - 13, by + bh - 30, 26, 3, '#3a1828', '#5a2838');
        for (var fr = 0; fr < 7; fr++) {
            drawRect(x + bw / 2 - 12 + fr * 4, by + bh - 27, 2, 2, '#6a3040');
        }
        // Steps
        drawRect(x + bw / 2 - 11, BUILDING_FLOOR - 4, 22, 2, '#3a2830');
        drawRect(x + bw / 2 - 9, BUILDING_FLOOR - 2, 18, 2, '#342430');
        // Doorway warm light on ground
        ctx.fillStyle = 'rgba(255, 200, 60, 0.05)';
        ctx.fillRect(x + bw / 2 - 12, BUILDING_FLOOR, 24, 6);
        // "OPEN MIC TONIGHT" sign by door
        drawRect(x + bw / 2 + 10, by + bh - 20, 22, 12, '#2a1808');
        drawRect(x + bw / 2 + 11, by + bh - 19, 20, 10, '#1a1008');
        ctx.font = '3px "Press Start 2P", monospace';
        ctx.fillStyle = '#ffcc44';
        ctx.textAlign = 'center';
        ctx.fillText('OPEN MIC', x + bw / 2 + 21, by + bh - 16);
        ctx.fillText('TONIGHT', x + bw / 2 + 21, by + bh - 12);
        // Spotlight beam from roof
        var spotAngle = Math.sin(time * 0.002) * 0.3;
        ctx.save();
        ctx.globalAlpha = 0.05;
        ctx.fillStyle = '#ffdd44';
        ctx.beginPath();
        ctx.moveTo(x + bw / 2, by - 7);
        ctx.lineTo(x + bw / 2 - 20 + spotAngle * 40, by - 34);
        ctx.lineTo(x + bw / 2 + 20 + spotAngle * 40, by - 34);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        // Velvet rope posts outside
        drawRect(x + bw / 2 - 20, BUILDING_FLOOR - 10, 2, 10, '#c0a040');
        drawRect(x + bw / 2 - 21, BUILDING_FLOOR - 11, 4, 2, '#c0a040');
        drawRect(x + bw / 2 + 18, BUILDING_FLOOR - 10, 2, 10, '#c0a040');
        drawRect(x + bw / 2 + 17, BUILDING_FLOOR - 11, 4, 2, '#c0a040');
        drawRect(x + bw / 2 - 19, BUILDING_FLOOR - 8, 38, 1, '#aa2020');
        // A-frame sandwich board
        drawRect(x - 7, BUILDING_FLOOR - 16, 14, 16, '#3a3020');
        drawRect(x - 6, BUILDING_FLOOR - 15, 12, 14, '#4a4030');
        drawRect(x - 5, BUILDING_FLOOR - 14, 10, 1, '#5a5040');
        ctx.font = '3px "Press Start 2P", monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('LIVE', x, BUILDING_FLOOR - 10);
        ctx.fillText('LAUGHS', x, BUILDING_FLOOR - 6);
        // Star on pavement
        drawRect(x + bw / 2 - 4, BUILDING_FLOOR + 2, 8, 1, '#c0a040');
        drawRect(x + bw / 2 - 2, BUILDING_FLOOR + 1, 4, 1, '#c0a040');
        drawRect(x + bw / 2 - 2, BUILDING_FLOOR + 3, 4, 1, '#c0a040');
    }

    function drawSupermarket(x, time) {
        var bw = 130, bh = 80;
        var by = BUILDING_FLOOR - bh;
        // Drop shadow
        drawRect(x + 5, by + 5, bw + 2, bh + 2, 'rgba(0,0,0,0.35)');
        // 3-tone gradient wall — off-white concrete
        drawWall3Tone(x, by, bw, bh, '#5a5a50');
        // Horizontal cladding
        for (var cl = 0; cl < 9; cl++) {
            drawRect(x + 2, by + 6 + cl * 8, bw - 4, 1, 'rgba(0,0,0,0.05)');
        }
        // Weathering
        drawWeathering(x, by, bw, bh, 5001);
        // Foundation
        drawFoundation(x, BUILDING_FLOOR - 4, bw);
        // Flat roof with AC units and vents
        drawRect(x - 4, by - 6, bw + 8, 8, '#4a4a40');
        drawRect(x - 3, by - 4, bw + 6, 4, '#525248');
        drawRect(x - 3, by - 1, bw + 6, 2, '#3a3a34');
        // AC units
        drawRect(x + 10, by - 12, 14, 8, '#555550');
        drawRect(x + 11, by - 10, 12, 4, '#606058');
        drawRect(x + 13, by - 9, 3, 2, '#707068');
        drawRect(x + 60, by - 12, 14, 8, '#555550');
        drawRect(x + 61, by - 10, 12, 4, '#606058');
        drawRect(x + 80, by - 10, 10, 6, '#555550');
        drawRect(x + 81, by - 8, 8, 2, '#606058');
        // Big lit sign — green with glow
        drawRect(x + 4, by + 4, bw - 8, 18, '#2a5a2a');
        drawGradientRect(x + 5, by + 5, bw - 10, 16, '#1a4a1a', '#2a6a2a');
        drawRect(x + 5, by + 5, bw - 10, 1, '#3a7a3a');
        var signOn = Math.sin(time * 0.004) > -0.8;
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillStyle = signOn ? '#a0e0a0' : '#406040';
        ctx.textAlign = 'center';
        ctx.fillText('SPAR-MART', x + bw / 2, by + 11);
        if (signOn) {
            ctx.fillStyle = 'rgba(80, 200, 80, 0.1)';
            ctx.fillRect(x + 2, by + 2, bw - 4, 24);
            ctx.fillStyle = 'rgba(80, 200, 80, 0.03)';
            ctx.fillRect(x + 20, BUILDING_FLOOR, bw - 40, 5);
        }
        // Fluorescent-lit windows showing aisles — framed
        drawRect(x + 5, by + 24, bw - 14, 28, '#5a5a50');
        for (var shelf = 0; shelf < 5; shelf++) {
            var sx = x + 8 + shelf * 19;
            drawRect(sx, by + 25, 16, 26, '#e8e8d0');
            drawRect(sx + 1, by + 26, 14, 24, '#f0f0e0');
            // Ceiling light strip
            drawRect(sx + 1, by + 26, 14, 1, '#fffff0');
            // Aisle shelves with products
            drawRect(sx + 1, by + 28, 14, 4, '#cc4040');
            drawRect(sx + 2, by + 29, 4, 2, '#dd6060');
            drawRect(sx + 1, by + 33, 14, 4, '#40a040');
            drawRect(sx + 7, by + 34, 4, 2, '#60cc60');
            drawRect(sx + 1, by + 38, 14, 4, '#4060cc');
            drawRect(sx + 1, by + 43, 14, 4, '#ccaa30');
            drawRect(sx + 6, by + 44, 4, 2, '#ddcc50');
            // Shelf dividers
            drawRect(sx, by + 48, 16, 1, '#b0b0a0');
        }
        // Sill under windows
        drawRect(x + 5, by + 52, bw - 14, 2, '#5a5a50');
        // Fluorescent glow spill
        ctx.fillStyle = 'rgba(240, 240, 200, 0.04)';
        ctx.fillRect(x + 6, by + 54, bw - 16, 12);
        // Sliding doors with sensor and mat
        drawRect(x + bw / 2 - 12, by + bh - 28, 24, 28, '#707078');
        drawRect(x + bw / 2 - 10, by + bh - 26, 20, 26, '#a0c8c8');
        drawGradientRect(x + bw / 2 - 9, by + bh - 24, 18, 22, '#80b0b0', '#c0e0e0');
        drawRect(x + bw / 2 - 1, by + bh - 24, 2, 22, '#606868');
        // Sensor box
        drawRect(x + bw / 2 - 4, by + bh - 32, 8, 4, '#505058');
        drawRect(x + bw / 2 - 2, by + bh - 31, 4, 2, '#606068');
        // Rubber mat
        drawRect(x + bw / 2 - 8, BUILDING_FLOOR - 2, 16, 2, '#303030');
        // Doorway light spill
        ctx.fillStyle = 'rgba(200, 240, 200, 0.05)';
        ctx.fillRect(x + bw / 2 - 10, BUILDING_FLOOR, 20, 6);
        // Trolley bay shelter outside
        drawRect(x + bw + 4, BUILDING_FLOOR - 12, 18, 1, '#606068');
        drawRect(x + bw + 4, BUILDING_FLOOR - 12, 1, 12, '#606068');
        drawRect(x + bw + 21, BUILDING_FLOOR - 12, 1, 12, '#606068');
        for (var tr = 0; tr < 3; tr++) {
            drawRect(x + bw + 6 + tr * 5, BUILDING_FLOOR - 9, 4, 7, '#808088');
            drawRect(x + bw + 7 + tr * 5, BUILDING_FLOOR - 10, 2, 1, '#909098');
            drawRect(x + bw + 6 + tr * 5, BUILDING_FLOOR - 2, 1, 2, '#606068');
            drawRect(x + bw + 9 + tr * 5, BUILDING_FLOOR - 2, 1, 2, '#606068');
        }
        // "OPEN" fluorescent sign
        var openFlicker = Math.sin(time * 0.008) > -0.8;
        drawRect(x + 6, by + bh - 10, 18, 7, '#101810');
        if (openFlicker) {
            ctx.font = '3px "Press Start 2P", monospace';
            ctx.fillStyle = '#40ff40';
            ctx.textAlign = 'left';
            ctx.fillText('OPEN', x + 9, by + bh - 8);
            ctx.fillStyle = 'rgba(40, 255, 40, 0.06)';
            ctx.fillRect(x + 4, by + bh - 12, 22, 12);
        }
        // ATM machine
        drawRect(x - 8, BUILDING_FLOOR - 14, 8, 14, '#3a3a5a');
        drawRect(x - 7, BUILDING_FLOOR - 12, 6, 6, '#4a6a4a');
        drawRect(x - 6, BUILDING_FLOOR - 6, 4, 2, '#606060');
        var atmGlow = Math.sin(time * 0.002) * 0.03 + 0.05;
        ctx.fillStyle = 'rgba(60, 200, 60, ' + atmGlow + ')';
        ctx.fillRect(x - 7, BUILDING_FLOOR - 12, 6, 6);
        // Notice board on wall
        drawRect(x + bw - 12, by + bh - 18, 10, 12, '#5a4020');
        drawRect(x + bw - 11, by + bh - 17, 8, 10, '#e8e0c0');
        drawRect(x + bw - 10, by + bh - 16, 3, 3, '#ff8080');
        drawRect(x + bw - 6, by + bh - 16, 3, 3, '#80c0ff');
        drawRect(x + bw - 10, by + bh - 12, 3, 3, '#ffff80');
    }

    function drawGunShop(x, time) {
        var bw = 84, bh = 68;
        var by = BUILDING_FLOOR - bh;
        // Drop shadow
        drawRect(x + 5, by + 5, bw + 2, bh + 2, 'rgba(0,0,0,0.35)');
        // 3-tone gradient wall — military khaki
        drawWall3Tone(x, by, bw, bh, '#3a3a28');
        // Reinforced concrete look — horizontal lines
        for (var cl = 0; cl < 7; cl++) {
            drawRect(x + 2, by + 6 + cl * 8, bw - 4, 1, 'rgba(0,0,0,0.06)');
        }
        // Weathering
        drawWeathering(x, by, bw, bh, 6001);
        // Foundation — extra heavy
        drawFoundation(x, BUILDING_FLOOR - 4, bw);
        drawRect(x - 3, BUILDING_FLOOR - 2, bw + 6, 2, '#383840');
        // Fortified roof with razor wire
        drawRect(x - 3, by - 6, bw + 6, 8, '#2a2a20');
        drawRect(x - 2, by - 4, bw + 4, 4, '#343428');
        drawRect(x - 2, by - 1, bw + 4, 2, '#1a1a14');
        for (var rw = 0; rw < 9; rw++) {
            drawRect(x + 1 + rw * 8, by - 8, 5, 3, '#505048');
            drawRect(x + 2 + rw * 8, by - 9, 3, 1, '#606058');
        }
        // Big sign with amber neon glow
        drawRect(x + 4, by + 4, bw - 8, 14, '#1a1a10');
        drawGradientRect(x + 5, by + 5, bw - 10, 12, '#0a0a08', '#1a1a10');
        drawRect(x + 5, by + 5, bw - 10, 1, '#2a2a18');
        var gunNeon = Math.sin(time * 0.004) > -0.4;
        ctx.font = '5px "Press Start 2P", monospace';
        ctx.fillStyle = gunNeon ? '#cc9930' : '#4a3810';
        ctx.textAlign = 'center';
        ctx.fillText('GUNS & AMMO', x + bw / 2, by + 9);
        if (gunNeon) {
            ctx.fillStyle = 'rgba(200, 150, 40, 0.1)';
            ctx.fillRect(x + 2, by + 2, bw - 4, 20);
            ctx.fillStyle = 'rgba(200, 150, 40, 0.03)';
            ctx.fillRect(x + 10, BUILDING_FLOOR, bw - 20, 4);
        }
        // Barred windows — framed with gun display
        for (var wi = 0; wi < 2; wi++) {
            var wx = x + 6 + wi * (bw - 30);
            drawRect(wx - 1, by + 22, 18, 16, '#3a3a28');
            drawRect(wx, by + 23, 16, 14, '#181818');
            drawRect(wx + 1, by + 24, 14, 12, '#1a1a10');
            // Bars
            for (var bar = 0; bar < 5; bar++) {
                drawRect(wx + 2 + bar * 3, by + 22, 1, 16, '#606050');
                drawRect(wx + 2 + bar * 3, by + 22, 1, 1, '#707060');
            }
            // Gun silhouette display
            drawRect(wx + 2, by + 27, 12, 2, '#808070');
            drawRect(wx + 3, by + 26, 8, 1, '#707060');
            // Sill
            drawRect(wx - 1, by + 38, 18, 2, '#3a3a28');
        }
        // Target logo between windows
        drawRect(x + bw / 2 - 5, by + 22, 10, 10, '#cc4444');
        drawRect(x + bw / 2 - 3, by + 24, 6, 6, '#ffffff');
        drawRect(x + bw / 2 - 1, by + 26, 2, 2, '#cc4444');
        // Heavy metal door with rivets and handle
        drawRect(x + bw / 2 - 8, by + bh - 24, 16, 24, '#2a2a28');
        drawGradientRect(x + bw / 2 - 7, by + bh - 22, 14, 22, '#3a3a38', '#2a2a28');
        // Rivets
        drawRect(x + bw / 2 - 5, by + bh - 20, 1, 1, '#505050');
        drawRect(x + bw / 2 + 4, by + bh - 20, 1, 1, '#505050');
        drawRect(x + bw / 2 - 5, by + bh - 8, 1, 1, '#505050');
        drawRect(x + bw / 2 + 4, by + bh - 8, 1, 1, '#505050');
        drawRect(x + bw / 2 - 5, by + bh - 14, 1, 1, '#505050');
        drawRect(x + bw / 2 + 4, by + bh - 14, 1, 1, '#505050');
        // Handle
        drawRect(x + bw / 2 + 3, by + bh - 16, 2, 4, '#606058');
        // Steps
        drawRect(x + bw / 2 - 10, BUILDING_FLOOR - 4, 20, 2, '#2a2a20');
        drawRect(x + bw / 2 - 8, BUILDING_FLOOR - 2, 16, 2, '#242418');
        // CCTV cameras (2)
        drawRect(x + bw - 14, by + 18, 8, 4, '#404040');
        drawRect(x + bw - 8, by + 19, 5, 2, '#505050');
        drawRect(x + bw - 7, by + 21, 1, 2, '#404040');
        drawRect(x + 6, by + 18, 8, 4, '#404040');
        drawRect(x + 4, by + 19, 4, 2, '#505050');
        // Security bollards
        drawRect(x - 4, BUILDING_FLOOR - 6, 4, 6, '#505048');
        drawRect(x - 3, BUILDING_FLOOR - 7, 2, 1, '#606058');
        drawRect(x + bw + 2, BUILDING_FLOOR - 6, 4, 6, '#505048');
        drawRect(x + bw + 3, BUILDING_FLOOR - 7, 2, 1, '#606058');
        // Sandbags
        drawRect(x + bw - 8, BUILDING_FLOOR - 6, 8, 3, '#5a5040');
        drawRect(x + bw - 6, BUILDING_FLOOR - 8, 6, 3, '#4a4838');
        drawRect(x + bw - 10, BUILDING_FLOOR - 3, 10, 3, '#5a5040');
        // Ammo crate
        drawRect(x - 8, BUILDING_FLOOR - 10, 8, 10, '#3a3020');
        drawRect(x - 7, BUILDING_FLOOR - 9, 6, 2, '#4a4030');
        drawRect(x - 6, BUILDING_FLOOR - 6, 4, 1, '#2a2018');
    }

    function drawCarFactory(x, time) {
        var bw = 140, bh = 90;
        var by = BUILDING_FLOOR - bh;
        // Drop shadow
        drawRect(x + 6, by + 6, bw + 2, bh + 2, 'rgba(0,0,0,0.35)');
        // 3-tone gradient wall — industrial grey
        drawWall3Tone(x, by, bw, bh, '#4a4a48');
        // Corrugated siding texture
        for (var cs = 0; cs < 16; cs++) {
            drawRect(x + 3 + cs * 8, by + 4, 1, bh - 6, 'rgba(0,0,0,0.04)');
            drawRect(x + 6 + cs * 8, by + 4, 1, bh - 6, 'rgba(255,255,255,0.02)');
        }
        // Weathering — heavier for factory
        drawWeathering(x, by, bw, bh, 7001);
        drawWeathering(x + 40, by + 20, bw - 50, bh - 30, 7099);
        // Foundation
        drawFoundation(x, BUILDING_FLOOR - 4, bw);
        // Corrugated roof with pitch
        drawRect(x - 5, by - 7, bw + 10, 9, '#3a3a38');
        drawRect(x - 4, by - 5, bw + 8, 5, '#424240');
        drawRect(x - 4, by - 1, bw + 8, 2, '#2a2a28');
        for (var ri = 0; ri < 15; ri++) {
            drawRect(x - 3 + ri * 9, by - 6, 5, 6, ri % 2 ? '#464644' : '#3a3a38');
        }
        // Two smokestacks with bands
        drawRect(x + bw - 20, by - 30, 8, 28, '#505050');
        drawGradientRect(x + bw - 19, by - 28, 6, 24, '#404040', '#585858');
        drawRect(x + bw - 21, by - 32, 10, 3, '#585858');
        drawRect(x + bw - 20, by - 20, 8, 2, '#606060');
        drawRect(x + bw - 38, by - 24, 7, 22, '#484848');
        drawGradientRect(x + bw - 37, by - 22, 5, 18, '#3a3a3a', '#555555');
        drawRect(x + bw - 39, by - 26, 9, 3, '#585858');
        drawRect(x + bw - 38, by - 16, 7, 2, '#565656');
        if (Math.random() < 0.06) {
            spawnSmoke(x + bw - 16, by - 34);
            spawnSmoke(x + bw - 35, by - 28);
        }
        // "BAY MOTORS" sign — faded with backing
        drawRect(x + 4, by + 4, 54, 14, '#303030');
        drawGradientRect(x + 5, by + 5, 52, 12, '#1a1a1a', '#2a2a2a');
        drawRect(x + 5, by + 5, 52, 1, '#3a3a3a');
        ctx.font = '6px "Press Start 2P", monospace';
        ctx.fillStyle = '#706860';
        ctx.textAlign = 'left';
        ctx.fillText('BAY MOTORS', x + 8, by + 9);
        // Large roller doors with interior detail
        for (var door = 0; door < 2; door++) {
            var dx = x + 10 + door * 56;
            drawRect(dx - 1, by + 20, 42, 42, '#3a3a38');
            drawRect(dx, by + 21, 40, 40, '#2a2a28');
            // Roller slats
            for (var slat = 0; slat < 3; slat++) {
                drawRect(dx + 2, by + 22 + slat * 3, 36, 2, '#404040');
                drawRect(dx + 2, by + 23 + slat * 3, 36, 1, '#4a4a48');
            }
            // Interior visible below roller
            drawRect(dx + 2, by + 32, 36, 29, '#1a1a20');
            drawGradientRect(dx + 2, by + 32, 36, 29, '#121218', '#1a1a20');
            // Interior warm light
            ctx.fillStyle = 'rgba(255, 200, 80, 0.06)';
            ctx.fillRect(dx + 2, by + 32, 36, 29);
            // Light spill out of bay onto ground
            ctx.fillStyle = 'rgba(255, 200, 80, 0.04)';
            ctx.fillRect(dx, BUILDING_FLOOR, 40, 6);
        }
        // Car on lift in first bay
        drawRect(x + 18, by + 42, 26, 10, '#6a3020');
        drawRect(x + 20, by + 38, 20, 6, '#5a2818');
        drawRect(x + 21, by + 39, 6, 4, '#8090a0');
        drawRect(x + 34, by + 39, 6, 4, '#8090a0');
        drawRect(x + 22, by + 52, 2, 1, '#2a2a2a');
        drawRect(x + 36, by + 52, 2, 1, '#2a2a2a');
        // Hydraulic lift
        drawRect(x + 29, by + 52, 4, 10, '#606060');
        drawRect(x + 28, by + 52, 6, 1, '#707070');
        // Sparks from welding
        if (Math.sin(time * 0.008) > 0.7) {
            drawRect(x + 31, by + 40, 2, 1, '#ffff80');
            drawRect(x + 29, by + 42, 1, 1, '#ffaa40');
            drawRect(x + 33, by + 41, 1, 1, '#ffff80');
            drawRect(x + 30, by + 43, 1, 1, '#ffcc60');
            ctx.fillStyle = 'rgba(255, 200, 60, 0.06)';
            ctx.fillRect(x + 26, by + 38, 12, 8);
        }
        // Second bay — car shell being painted
        drawRect(x + 72, by + 46, 24, 8, '#4a5040');
        drawRect(x + 74, by + 44, 18, 4, '#3a4038');
        drawRect(x + 75, by + 45, 6, 2, '#607080');
        // Oil drums beside factory
        drawRect(x - 8, BUILDING_FLOOR - 12, 6, 12, '#2a4a2a');
        drawRect(x - 7, BUILDING_FLOOR - 13, 4, 1, '#3a5a3a');
        drawRect(x - 7, BUILDING_FLOOR - 8, 4, 1, '#3a5a3a');
        drawRect(x - 14, BUILDING_FLOOR - 10, 6, 10, '#4a2a2a');
        drawRect(x - 13, BUILDING_FLOOR - 11, 4, 1, '#5a3a3a');
        // Forklift
        drawRect(x + bw + 6, BUILDING_FLOOR - 10, 12, 8, '#ccaa20');
        drawRect(x + bw + 8, BUILDING_FLOOR - 14, 4, 6, '#ccaa20');
        drawRect(x + bw + 4, BUILDING_FLOOR - 16, 3, 16, '#606060');
        drawRect(x + bw + 3, BUILDING_FLOOR - 18, 5, 3, '#606060');
        drawRect(x + bw + 7, BUILDING_FLOOR - 2, 3, 2, '#303030');
        drawRect(x + bw + 14, BUILDING_FLOOR - 2, 3, 2, '#303030');
        // Pallets stacked
        drawRect(x + bw + 22, BUILDING_FLOOR - 6, 12, 6, '#6a5020');
        drawRect(x + bw + 22, BUILDING_FLOOR - 10, 12, 4, '#6a5020');
        drawRect(x + bw + 23, BUILDING_FLOOR - 5, 10, 1, '#7a6030');
        // Rusted cars in yard
        drawRect(x + bw + 38, BUILDING_FLOOR - 10, 18, 8, '#6a4030');
        drawRect(x + bw + 40, BUILDING_FLOOR - 13, 12, 5, '#5a3828');
        drawRect(x + bw + 41, BUILDING_FLOOR - 12, 4, 3, '#7088a0');
        drawRect(x + bw + 58, BUILDING_FLOOR - 9, 16, 7, '#4a5040');
        drawRect(x + bw + 60, BUILDING_FLOOR - 12, 10, 5, '#3a4038');
        // Tyre stack
        drawRect(x + bw + 78, BUILDING_FLOOR - 14, 8, 14, '#1a1a1a');
        drawRect(x + bw + 78, BUILDING_FLOOR - 18, 8, 4, '#1a1a1a');
        drawRect(x + bw + 79, BUILDING_FLOOR - 13, 6, 2, '#2a2a2a');
        // Chain fence section
        drawRect(x + bw + 34, BUILDING_FLOOR - 16, 1, 16, '#505058');
        drawRect(x + bw + 54, BUILDING_FLOOR - 16, 1, 16, '#505058');
        drawRect(x + bw + 74, BUILDING_FLOOR - 16, 1, 16, '#505058');
        for (var cf = 0; cf < 2; cf++) {
            var cfx = x + bw + 35 + cf * 20;
            for (var fy = 0; fy < 4; fy++) {
                drawRect(cfx, BUILDING_FLOOR - 15 + fy * 4, 19, 1, '#606068');
            }
        }
    }

    function drawRundownMotel(x, time) {
        var bw = 120, bh = 70;
        var by = BUILDING_FLOOR - bh;
        // Drop shadow
        drawRect(x + 5, by + 5, bw + 2, bh + 2, 'rgba(0,0,0,0.35)');
        // 3-tone gradient wall — peeling salmon/brown
        drawWall3Tone(x, by, bw, bh, '#5a4840');
        // Stucco texture patches
        for (var st = 0; st < 6; st++) {
            var sx = x + 4 + seededRandom(8001 + st) * (bw - 16);
            var sy = by + 4 + seededRandom(8002 + st) * (bh - 16);
            drawRect(sx, sy, 6 + seededRandom(8003 + st) * 8, 4, 'rgba(0,0,0,0.04)');
        }
        // Weathering — heavy, this place is run down
        drawWeathering(x, by, bw, bh, 8001);
        drawWeathering(x + 30, by + 10, bw - 40, bh - 20, 8099);
        // Foundation
        drawFoundation(x, BUILDING_FLOOR - 4, bw);
        // Flat roof with water stain damage
        drawRect(x - 3, by - 6, bw + 6, 8, '#4a3838');
        drawRect(x - 2, by - 4, bw + 4, 4, '#5a4848');
        drawRect(x - 2, by - 1, bw + 4, 2, '#3a2828');
        // Water stain drips
        drawRect(x + 20, by, 3, 8, '#3a3030');
        drawRect(x + 55, by, 4, 10, '#3a3030');
        drawRect(x + 85, by, 3, 6, '#3a3030');
        // Big "MOTEL" sign on pole — partially burnt out
        drawRect(x + 4, by - 26, 2, 24, '#505050');
        drawRect(x + 3, by - 28, 4, 2, '#585858');
        drawRect(x - 7, by - 30, 26, 16, '#201818');
        drawGradientRect(x - 6, by - 29, 24, 14, '#100c0c', '#201818');
        drawRect(x - 6, by - 29, 24, 1, '#301818');
        var motelFlicker = Math.sin(time * 0.004) > 0;
        var motelFlicker2 = Math.sin(time * 0.011) > 0.3;
        ctx.font = '7px "Press Start 2P", monospace';
        ctx.fillStyle = motelFlicker ? '#ff6644' : '#401a10';
        ctx.textAlign = 'left';
        ctx.fillText('MO', x - 4, by - 26);
        ctx.fillStyle = motelFlicker2 ? '#ff6644' : '#401a10';
        ctx.fillText('T', x + 12, by - 26);
        ctx.fillStyle = '#401a10';
        ctx.fillText('EL', x + 20, by - 26);
        ctx.fillStyle = motelFlicker ? '#ff6644' : '#401a10';
        ctx.fillText('MO', x - 4, by - 19);
        // Glow from working letters
        if (motelFlicker) {
            ctx.fillStyle = 'rgba(255, 100, 60, 0.12)';
            ctx.fillRect(x - 9, by - 32, 30, 22);
            ctx.fillStyle = 'rgba(255, 100, 60, 0.04)';
            ctx.fillRect(x - 6, BUILDING_FLOOR, 24, 5);
        }
        // Vacancy sign below
        drawRect(x - 5, by - 14, 22, 8, '#100808');
        drawRect(x - 4, by - 13, 20, 6, '#0a0404');
        var vacancyOn = Math.sin(time * 0.003) > -0.5;
        ctx.font = '3px "Press Start 2P", monospace';
        ctx.fillStyle = vacancyOn ? '#ff2020' : '#300808';
        ctx.textAlign = 'center';
        ctx.fillText('VACANCY', x + 6, by - 11);
        if (vacancyOn) {
            ctx.fillStyle = 'rgba(255, 30, 30, 0.06)';
            ctx.fillRect(x - 6, by - 15, 24, 10);
        }
        // Walkway/balcony overhang with supports
        drawRect(x - 2, by + bh - 30, bw - 6, 4, '#4a3828');
        drawGradientRect(x - 1, by + bh - 29, bw - 8, 2, '#3a2818', '#5a4838');
        drawRect(x - 2, by + bh - 27, bw - 6, 1, '#3a2818');
        // Support posts
        for (var sp = 0; sp < 4; sp++) {
            drawRect(x + 4 + sp * 25, by + bh - 26, 2, 26, '#4a3828');
            drawRect(x + 4 + sp * 25, by + bh - 26, 2, 1, '#5a4838');
        }
        // Row of doors (6 motel rooms) with enhanced detail
        for (var door = 0; door < 6; door++) {
            var dx = x + 6 + door * 16;
            // Door frame
            drawRect(dx - 1, by + bh - 27, 12, 27, '#3a2820');
            drawRect(dx, by + bh - 26, 10, 26, '#3a2820');
            drawGradientRect(dx + 1, by + bh - 24, 8, 24, '#4a3830', '#3a2820');
            // Peephole
            drawRect(dx + 4, by + bh - 18, 2, 2, '#806020');
            // Handle
            drawRect(dx + 7, by + bh - 14, 1, 3, '#806020');
            // Room number plate
            drawRect(dx + 2, by + bh - 29, 6, 4, '#605040');
            drawRect(dx + 3, by + bh - 28, 4, 2, '#706050');
            ctx.font = '3px "Press Start 2P", monospace';
            ctx.fillStyle = '#c0b090';
            ctx.textAlign = 'center';
            ctx.fillText('' + (door + 1), dx + 5, by + bh - 28);
            // Window above door with curtain and interior
            var roomLit = Math.sin(time * 0.0008 + door * 3.7) > 0.5;
            drawRect(dx, by + 8, 10, 10, '#2a2018');
            drawRect(dx + 1, by + 9, 8, 8, roomLit ? '#604820' : '#1a1810');
            if (roomLit) {
                // Curtain half-drawn
                drawRect(dx + 1, by + 9, 3, 8, '#6a4020');
                drawRect(dx + 6, by + 9, 3, 8, '#5a3818');
                // Warm glow
                ctx.fillStyle = 'rgba(255, 160, 60, 0.1)';
                ctx.fillRect(dx, by + 8, 10, 12);
                // Light spill down wall
                ctx.fillStyle = 'rgba(255, 160, 60, 0.04)';
                ctx.fillRect(dx - 1, by + 20, 12, 10);
            }
            // Window sill
            drawRect(dx, by + 18, 10, 1, '#4a3a30');
        }
        // Ice machine — more detail
        drawRect(x + bw - 20, by + bh - 22, 14, 22, '#606868');
        drawGradientRect(x + bw - 19, by + bh - 20, 12, 12, '#708888', '#607878');
        drawRect(x + bw - 18, by + bh - 8, 10, 6, '#506868');
        drawRect(x + bw - 16, by + bh - 6, 6, 2, '#404858');
        ctx.font = '3px "Press Start 2P", monospace';
        ctx.fillStyle = '#a0b8c0';
        ctx.textAlign = 'center';
        ctx.fillText('ICE', x + bw - 13, by + bh - 17);
        // Vending machine next to ice
        drawRect(x + bw - 34, by + bh - 20, 10, 20, '#aa2020');
        drawGradientRect(x + bw - 33, by + bh - 18, 8, 10, '#cc4040', '#aa2020');
        drawRect(x + bw - 32, by + bh - 8, 6, 4, '#404040');
        // Lawn chairs in front of room 1
        drawRect(x + 6, BUILDING_FLOOR - 6, 6, 4, '#40a060');
        drawRect(x + 7, BUILDING_FLOOR - 8, 4, 2, '#40a060');
        drawRect(x + 7, BUILDING_FLOOR - 2, 1, 2, '#306040');
        drawRect(x + 10, BUILDING_FLOOR - 2, 1, 2, '#306040');
        // Parked car
        drawRect(x + bw + 6, BUILDING_FLOOR - 9, 18, 7, '#4a506a');
        drawRect(x + bw + 8, BUILDING_FLOOR - 12, 12, 5, '#3a4058');
        drawRect(x + bw + 9, BUILDING_FLOOR - 11, 4, 3, '#7088a0');
        drawRect(x + bw + 15, BUILDING_FLOOR - 11, 4, 3, '#7088a0');
        drawRect(x + bw + 8, BUILDING_FLOOR - 2, 3, 2, '#303030');
        drawRect(x + bw + 17, BUILDING_FLOOR - 2, 3, 2, '#303030');
        // Headlights
        drawRect(x + bw + 6, BUILDING_FLOOR - 7, 1, 2, '#ffff80');
        drawRect(x + bw + 23, BUILDING_FLOOR - 7, 1, 2, '#ff4040');
        // Dumpster
        drawRect(x + bw + 28, BUILDING_FLOOR - 10, 14, 10, '#2a4a2a');
        drawGradientRect(x + bw + 29, BUILDING_FLOOR - 9, 12, 8, '#1a3a1a', '#3a5a3a');
        drawRect(x + bw + 28, BUILDING_FLOOR - 11, 14, 2, '#3a5a3a');
        // BBQ grill
        drawRect(x + 24, BUILDING_FLOOR - 8, 6, 4, '#303030');
        drawRect(x + 23, BUILDING_FLOOR - 9, 8, 2, '#404040');
        drawRect(x + 25, BUILDING_FLOOR - 4, 1, 4, '#303030');
        drawRect(x + 28, BUILDING_FLOOR - 4, 1, 4, '#303030');
        // Pool (algae-filled) with fence
        drawRect(x + bw + 46, BUILDING_FLOOR - 4, 22, 7, '#2a5050');
        drawGradientRect(x + bw + 47, BUILDING_FLOOR - 3, 20, 5, '#305858', '#2a5050');
        drawRect(x + bw + 49, BUILDING_FLOOR - 2, 6, 2, '#3a6a4a');
        drawRect(x + bw + 44, BUILDING_FLOOR - 8, 1, 8, '#505058');
        drawRect(x + bw + 70, BUILDING_FLOOR - 8, 1, 8, '#505058');
        drawRect(x + bw + 44, BUILDING_FLOOR - 8, 26, 1, '#505058');
    }

    function drawDerelictShack(x, time) {
        var bw = 30, bh = 24;
        var by = BUILDING_FLOOR - bh;
        // Rotting wood shack
        drawRect(x, by, bw, bh, '#3a3020');
        drawRect(x + 2, by + 2, bw - 4, bh - 4, '#4a4030');
        // Slanted roof
        drawRect(x - 2, by - 3, bw + 4, 4, '#2a2018');
        drawRect(x, by - 5, bw - 4, 3, '#2a2018');
        // Boarded window
        drawRect(x + 5, by + 8, 8, 7, '#1a1810');
        drawRect(x + 4, by + 9, 10, 1, '#5a4830');
        drawRect(x + 4, by + 12, 10, 1, '#5a4830');
        // Crooked door
        drawRect(x + 18, by + bh - 12, 7, 12, '#2a2018');
        // Weeds
        drawRect(x - 4, BUILDING_FLOOR - 2, 2, 3, '#2a5020');
        drawRect(x + bw + 2, BUILDING_FLOOR - 3, 2, 4, '#2a5020');
        drawRect(x + bw - 3, BUILDING_FLOOR - 1, 1, 2, '#2a5020');
    }

    var BLDG_SCALE = 3.0;
    var BLDG_SCALE_TALL = 3.5;

    function drawScaledBuilding(drawFn, x, time, scale) {
        var s = scale || BLDG_SCALE;
        ctx.save();
        ctx.translate(x, BUILDING_FLOOR);
        ctx.scale(s, s);
        ctx.translate(-x, -BUILDING_FLOOR);
        drawFn(x, time);
        ctx.restore();
    }

    function drawBaseTownFeatures(time) {
        // Derelict shack in the wilderness (scaled)
        if (isVisible(350, 200)) {
            drawScaledBuilding(drawDerelictShack, 350, time);
        }

        // --- SEEDY TOWN ESTABLISHMENTS at 3x scale ---
        // Town zone starts at 4200 — wider spacing for 3x buildings
        if (isVisible(4220, 420)) drawScaledBuilding(drawSeedyBar, 4220, time);
        if (isVisible(4600, 380)) drawScaledBuilding(drawVideoShop, 4600, time);
        if (isVisible(4950, 440)) drawScaledBuilding(drawSeedyArcade, 4950, time);
        if (isVisible(5350, 520)) drawScaledBuilding(drawSupermarket, 5350, time);
        if (isVisible(6200, 400)) drawScaledBuilding(drawComedyClub, 6200, time);

        // Harbor zone — Car Factory is multi-story (tall scale)
        if (isVisible(7580, 360)) drawScaledBuilding(drawGunShop, 7580, time);
        if (isVisible(7920, 620)) drawScaledBuilding(drawCarFactory, 7920, time, BLDG_SCALE_TALL);
        if (isVisible(8520, 560)) drawScaledBuilding(drawRundownMotel, 8520, time, BLDG_SCALE_TALL);

        // Background houses (these stay small — they're distant background)
        var bgY = GROUND_Y - 12;
        var bgHouses = [
            { x: 4440, y: bgY, w: 22, h: 18, color: '#5a4838' },
            { x: 4690, y: bgY - 3, w: 26, h: 21, color: '#4a5a40' },
            { x: 4950, y: bgY + 2, w: 20, h: 16, color: '#5a3a3a' },
            { x: 5330, y: bgY - 4, w: 24, h: 22, color: '#4a4860' },
            { x: 5550, y: bgY, w: 22, h: 18, color: '#5a5040' },
            { x: 5700, y: bgY - 2, w: 26, h: 20, color: '#4a4a3a' },
            { x: 6000, y: bgY + 2, w: 20, h: 16, color: '#5a4a4a' },
            { x: 6250, y: bgY - 1, w: 24, h: 18, color: '#5a4040' },
            { x: 6500, y: bgY, w: 22, h: 18, color: '#4a4a38' },
            { x: 7200, y: bgY + 2, w: 20, h: 16, color: '#5a4a3a' },
            { x: 8600, y: bgY - 1, w: 22, h: 18, color: '#5a4838' },
            { x: 8900, y: bgY + 1, w: 24, h: 20, color: '#4a4a38' },
            { x: 9200, y: bgY - 3, w: 20, h: 16, color: '#5a4a4a' },
        ];

        for (var i = 0; i < bgHouses.length; i++) {
            var h = bgHouses[i];
            if (!isVisible(h.x - 5, h.w + 10)) continue;
            drawRect(h.x + 2, h.y + 2, h.w, h.h, 'rgba(0,0,0,0.15)');
            drawRect(h.x, h.y, h.w, h.h, h.color);
            drawRect(h.x + 1, h.y + 1, h.w - 2, h.h - 2, lightenColor(h.color, 15));
            drawRect(h.x + h.w - 3, h.y, 3, h.h, darkenColor(h.color, 0.7));
            drawRect(h.x - 2, h.y - 3, h.w + 4, 4, darkenColor(h.color, 0.6));
            drawRect(h.x - 1, h.y - 2, h.w + 2, 2, darkenColor(h.color, 0.7));
            var lit = Math.sin(time * 0.001 + i * 2.7) > 0.1;
            drawRect(h.x + 3, h.y + 4, 5, 5, lit ? '#ffdd60' : '#302818');
            drawRect(h.x + h.w - 9, h.y + 4, 5, 5, lit ? '#ffcc40' : '#302818');
            drawRect(h.x + h.w / 2 - 2, h.y + h.h - 7, 4, 7, darkenColor(h.color, 0.4));
        }

        // Church (multi-story tall scale — steeple towers over single-story buildings)
        var churchX = 5850;
        if (isVisible(churchX - 20, 340)) {
            ctx.save();
            ctx.translate(churchX, BUILDING_FLOOR);
            ctx.scale(BLDG_SCALE_TALL, BLDG_SCALE_TALL);
            ctx.translate(-churchX, -BUILDING_FLOOR);

            var churchY = GROUND_Y - 40;
            // Drop shadow
            drawRect(churchX + 4, churchY + 4, 26, 56, 'rgba(0,0,0,0.3)');
            // Main tower — 3-tone stone wall
            drawWall3Tone(churchX, churchY + 10, 24, 34, '#5a5060');
            // Stone block texture
            for (var sb = 0; sb < 4; sb++) {
                for (var sc = 0; sc < 3; sc++) {
                    var soff = (sb % 2) * 4;
                    drawRect(churchX + 2 + sc * 7 + soff, churchY + 12 + sb * 7, 6, 5, '#525058');
                    drawRect(churchX + 2 + sc * 7 + soff, churchY + 12 + sb * 7, 6, 1, '#626068');
                }
            }
            drawWeathering(churchX, churchY + 10, 24, 34, 9001);
            // Lower nave — wider, 3-tone
            drawWall3Tone(churchX - 3, churchY + 38, 30, 20, '#4a4050');
            drawWeathering(churchX - 3, churchY + 38, 30, 20, 9002);
            // Foundation
            drawRect(churchX - 4, churchY + 56, 32, 3, '#404048');
            drawRect(churchX - 3, churchY + 56, 30, 2, '#505058');
            // Steeple tiers with gradient
            drawGradientRect(churchX + 7, churchY, 10, 14, '#5a5060', '#6a6070');
            drawRect(churchX + 7, churchY, 10, 1, '#7a7080');
            drawGradientRect(churchX + 9, churchY - 8, 6, 10, '#6a6070', '#7a7080');
            drawGradientRect(churchX + 10, churchY - 14, 4, 8, '#7a7080', '#8a8090');
            // Cross
            drawRect(churchX + 11, churchY - 22, 2, 10, '#c0b890');
            drawRect(churchX + 9, churchY - 18, 6, 2, '#c0b890');
            drawRect(churchX + 11, churchY - 23, 2, 1, '#d0c8a0');
            // Stained glass window — arched top
            drawRect(churchX + 7, churchY + 13, 10, 12, '#302040');
            drawRect(churchX + 8, churchY + 14, 8, 10, '#1a1030');
            // Stained glass panes
            drawRect(churchX + 9, churchY + 15, 3, 4, '#4040a0');
            drawRect(churchX + 12, churchY + 15, 3, 4, '#a04040');
            drawRect(churchX + 9, churchY + 20, 3, 3, '#40a040');
            drawRect(churchX + 12, churchY + 20, 3, 3, '#c0a040');
            // Dividers
            drawRect(churchX + 11, churchY + 14, 1, 10, '#504060');
            drawRect(churchX + 8, churchY + 19, 8, 1, '#504060');
            // Warm light through glass
            var churchGlow = Math.sin(time * 0.002) * 0.04 + 0.08;
            ctx.fillStyle = 'rgba(255, 200, 100, ' + churchGlow + ')';
            ctx.fillRect(churchX + 7, churchY + 12, 10, 14);
            // Light spill down wall
            ctx.fillStyle = 'rgba(255, 200, 100, 0.03)';
            ctx.fillRect(churchX + 6, churchY + 26, 12, 12);
            // Church door — arched, heavy wood
            drawRect(churchX + 6, churchY + 43, 12, 15, '#2a1810');
            drawGradientRect(churchX + 7, churchY + 44, 10, 14, '#3a2820', '#2a1810');
            // Door arch top
            drawRect(churchX + 7, churchY + 42, 10, 3, '#3a2820');
            drawRect(churchX + 8, churchY + 41, 8, 2, '#3a2820');
            // Door panels
            drawRect(churchX + 8, churchY + 46, 4, 8, '#2a1810');
            drawRect(churchX + 13, churchY + 46, 3, 8, '#2a1810');
            // Handle
            drawRect(churchX + 16, churchY + 52, 1, 2, '#806020');
            // Steps
            drawRect(churchX + 4, churchY + 57, 16, 2, '#505058');
            drawRect(churchX + 5, churchY + 59, 14, 2, '#484850');
            // Doorway warm light
            ctx.fillStyle = 'rgba(255, 200, 100, 0.04)';
            ctx.fillRect(churchX + 5, churchY + 59, 14, 4);
            // Small side windows on nave
            drawRect(churchX - 2, churchY + 42, 6, 6, '#302040');
            drawRect(churchX - 1, churchY + 43, 4, 4, '#4040a0');
            drawRect(churchX + 22, churchY + 42, 6, 6, '#302040');
            drawRect(churchX + 23, churchY + 43, 4, 4, '#a04040');
            // Bell in tower
            drawRect(churchX + 10, churchY + 2, 4, 4, '#806820');
            drawRect(churchX + 11, churchY + 6, 2, 1, '#806820');
            // Roof tiles on tower
            drawRect(churchX + 6, churchY + 10, 12, 2, '#4a4050');
            drawRect(churchX + 5, churchY + 10, 14, 1, '#5a5060');

            ctx.restore();
        }

        // Harbor/dock at the waterfront
        if (isVisible(WATER_X - 80, 140)) {
            drawRect(WATER_X - 80, GROUND_Y + 10, 75, 6, '#5a4020');
            drawRect(WATER_X - 80, GROUND_Y + 9, 75, 1, '#6a5030');
            for (var dp = 0; dp < 5; dp++) {
                drawRect(WATER_X - 75 + dp * 16, GROUND_Y + 4, 4, 24, '#5a4020');
            }
            drawRect(WATER_X - 70, GROUND_Y + 6, 4, 4, '#505058');
            drawRect(WATER_X - 40, GROUND_Y + 6, 4, 4, '#505058');
            var boatBob = Math.sin(time * 0.0015) * 2;
            drawRect(WATER_X + 4, GROUND_Y + 10 + boatBob, 30, 8, '#6a3828');
            drawRect(WATER_X + 6, GROUND_Y + 8 + boatBob, 24, 4, '#7a4838');
            drawRect(WATER_X + 8, GROUND_Y + 6 + boatBob, 18, 3, '#8a5848');
            drawRect(WATER_X + 16, GROUND_Y - 8 + boatBob, 2, 18, '#8a7050');
            drawRect(WATER_X + 16, GROUND_Y - 8 + boatBob, 12, 7, '#e0d8d0');
            drawRect(WATER_X + 16, GROUND_Y - 6 + boatBob, 10, 5, '#d0c8c0');
            drawRect(WATER_X - 38, GROUND_Y + 8, 42, 1, '#8a7050');

            // Lighthouse
            var lhX = WATER_X - 30;
            var lhY = GROUND_Y - 60;
            drawRect(lhX, lhY, 12, 64, '#c0b8a0');
            drawRect(lhX + 1, lhY + 1, 10, 62, '#d0c8b0');
            drawRect(lhX + 2, lhY + 8, 8, 4, '#cc3030');
            drawRect(lhX + 2, lhY + 24, 8, 4, '#cc3030');
            drawRect(lhX + 2, lhY + 40, 8, 4, '#cc3030');
            drawRect(lhX - 2, lhY - 4, 16, 6, '#a09880');
            drawRect(lhX, lhY - 8, 12, 6, '#b0a890');
            // Rotating light beam
            var beamAngle = (time * 0.002) % (Math.PI * 2);
            var beamDx = Math.cos(beamAngle);
            if (beamDx > 0.3) {
                var beamAlpha = 0.1 + beamDx * 0.15;
                ctx.fillStyle = 'rgba(255, 255, 200, ' + beamAlpha + ')';
                ctx.fillRect(lhX + 12, lhY - 6, Math.floor(beamDx * 50), 4);
            } else if (beamDx < -0.3) {
                var beamAlpha2 = 0.1 + Math.abs(beamDx) * 0.15;
                ctx.fillStyle = 'rgba(255, 255, 200, ' + beamAlpha2 + ')';
                ctx.fillRect(lhX + Math.floor(beamDx * 50), lhY - 6, Math.floor(Math.abs(beamDx) * 50), 4);
            }
            // Lamp glow
            var lampGlow = 0.4 + Math.sin(time * 0.003) * 0.2;
            ctx.fillStyle = 'rgba(255, 255, 180, ' + lampGlow + ')';
            ctx.fillRect(lhX + 3, lhY - 6, 6, 4);
        }
    }

    // =========================================================================
    //  BASE CAMPUS (always visible — a few starter structures)
    // =========================================================================

    function drawBaseCampus(time) {
        var campusLeft = ZONES.campus.left;
        var campusRight = ZONES.campus.right;

        // Perimeter fence
        if (isVisible(campusLeft, campusRight - campusLeft)) {
            var fStart = Math.max(campusLeft, camera.x - 20);
            var fEnd = Math.min(campusRight, camera.x + W + 20);
            for (var fx = fStart; fx < fEnd; fx += 12) {
                drawRect(fx, GROUND_Y - 2, 1, 6, '#404850');
            }
            drawRect(Math.max(campusLeft, camera.x - 5), GROUND_Y, Math.min(campusRight, camera.x + W + 5) - Math.max(campusLeft, camera.x - 5), 1, '#404850');
        }

        // "AI CAMPUS" sign
        if (isVisible(campusLeft, 80)) {
            drawRect(campusLeft + 10, GROUND_Y - 8, 68, 8, '#1a2040');
            ctx.font = '5px "Press Start 2P", monospace';
            ctx.fillStyle = '#6688ff';
            ctx.textAlign = 'left';
            ctx.fillText('AI CAMPUS', campusLeft + 14, GROUND_Y - 6);
        }

        // Entrance gate with boom barrier
        if (isVisible(campusLeft - 10, 60)) {
            drawRect(campusLeft - 4, GROUND_Y - 22, 4, 24, '#505868');
            drawRect(campusLeft + 20, GROUND_Y - 22, 4, 24, '#505868');
            drawRect(campusLeft - 2, GROUND_Y - 24, 24, 4, '#606878');
            drawRect(campusLeft + 22, GROUND_Y - 18, 30, 2, '#cc4444');
            drawRect(campusLeft + 22, GROUND_Y - 18, 6, 2, '#ffffff');
        }

        // Flagpole with animated flag
        if (isVisible(campusLeft + 40, 20)) {
            drawRect(campusLeft + 48, GROUND_Y - 50, 2, 52, '#808890');
            drawRect(campusLeft + 48, GROUND_Y - 50, 1, 2, '#c0c0c0');
            var flagWave = Math.sin(time * 0.003) * 2;
            drawRect(campusLeft + 50, GROUND_Y - 49 + flagWave, 12, 7, '#3355cc');
            drawRect(campusLeft + 51, GROUND_Y - 48 + flagWave, 4, 3, '#ffffff');
        }

        // Parking lot with cars
        if (isVisible(campusLeft + 80, 180)) {
            drawRect(campusLeft + 90, GROUND_Y + 2, 160, 30, '#2a2a28');
            for (var pk = 0; pk < 5; pk++) {
                drawRect(campusLeft + 95 + pk * 30, GROUND_Y + 4, 1, 26, '#444440');
            }
            var carColors = ['#cc3333', '#3366cc', '#33aa33', '#888888', '#ccaa33'];
            for (var ci = 0; ci < 4; ci++) {
                var cx = campusLeft + 100 + ci * 30;
                var carSeed = (ci * 7919 + 42) % 5;
                drawRect(cx, GROUND_Y + 8, 20, 10, carColors[carSeed]);
                drawRect(cx + 2, GROUND_Y + 6, 16, 4, carColors[carSeed]);
                drawRect(cx + 3, GROUND_Y + 7, 6, 2, '#8888aa');
                drawRect(cx + 11, GROUND_Y + 7, 6, 2, '#8888aa');
                drawRect(cx + 1, GROUND_Y + 18, 4, 2, '#222222');
                drawRect(cx + 15, GROUND_Y + 18, 4, 2, '#222222');
            }
        }

        // Concrete building pads (where buildings will go)
        var padPositions = [1100, 1500, 1900, 2300, 2700, 3100];
        for (var pi = 0; pi < padPositions.length; pi++) {
            var padX = padPositions[pi];
            if (!isVisible(padX, 80)) continue;
            drawRect(padX, GROUND_Y + 2, 80, 2, '#2a2a28');
            drawRect(padX + 2, GROUND_Y + 4, 76, 1, '#222220');
        }

        // Server room trailer (early-stage temporary building)
        if (isVisible(campusLeft + 300, 60)) {
            var tx = campusLeft + 310;
            drawRect(tx, BUILDING_FLOOR - 22, 40, 22, '#6a6a68');
            drawRect(tx + 1, BUILDING_FLOOR - 21, 38, 20, '#7a7a78');
            drawRect(tx + 4, BUILDING_FLOOR - 18, 8, 6, '#3a3a4a');
            drawRect(tx + 28, BUILDING_FLOOR - 18, 8, 6, '#3a3a4a');
            drawRect(tx + 16, BUILDING_FLOOR - 12, 8, 12, '#505050');
            drawRect(tx + 40, BUILDING_FLOOR - 8, 4, 4, '#445566');
            ctx.font = '3px "Press Start 2P", monospace';
            ctx.fillStyle = '#888888';
            ctx.textAlign = 'center';
            ctx.fillText('TEMP', tx + 20, BUILDING_FLOOR - 1);
        }
    }

    // =========================================================================
    //  WALKING PEOPLE
    // =========================================================================

    function drawPerson(wx, wy, bounce, skinColor, shirtColor, time, idx, large, abundanceLevel) {
        var sz = large ? 4.0 : 3.8;
        var al = abundanceLevel || 0;
        var px = Math.floor(wx);
        var headW = Math.floor(5 * sz);
        var headH = Math.floor(5 * sz);
        var bodyW = Math.floor(6 * sz);
        var bodyH = Math.floor(7 * sz);
        var legW = Math.floor(2 * sz);
        var legH = Math.floor(4 * sz);
        var armW = Math.floor(2 * sz);
        var armH = Math.floor(5 * sz);
        var b = Math.floor(bounce);
        var totalH = headH + bodyH + legH;
        var baseY = Math.floor(wy) - b;

        // Upgrade outfits with abundance
        var actualShirt = shirtColor;
        var pantsColor = '#2a2a3a';
        if (al >= 2) {
            actualShirt = lightenColor(shirtColor, 25);
            pantsColor = '#3a3a4a';
        }
        if (al >= 3) {
            actualShirt = lightenColor(shirtColor, 45);
            pantsColor = '#4a4050';
        }

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(px - 1, Math.floor(wy) + legH, bodyW + 2, 3);
        // Legs
        var legFrame = Math.sin(time * 0.008 + idx * 1.7);
        ctx.fillStyle = pantsColor;
        ctx.fillRect(px + 1, baseY - legH, legW, legH + (legFrame > 0 ? 1 : 0));
        ctx.fillRect(px + bodyW - legW - 1, baseY - legH + (legFrame > 0 ? 0 : 1), legW, legH);
        // Shoes
        ctx.fillStyle = al >= 3 ? '#6a3020' : '#1a1a20';
        ctx.fillRect(px, baseY, legW + 1, Math.floor(1.5 * sz));
        ctx.fillRect(px + bodyW - legW - 1, baseY + (legFrame > 0 ? 0 : 1), legW + 1, Math.floor(1.5 * sz));
        // Body
        ctx.fillStyle = actualShirt;
        ctx.fillRect(px, baseY - legH - bodyH, bodyW, bodyH);
        // Arms
        var armSwing = Math.floor(legFrame * 1.5);
        ctx.fillStyle = actualShirt;
        ctx.fillRect(px - armW, baseY - legH - bodyH + 1 + armSwing, armW, armH);
        ctx.fillRect(px + bodyW, baseY - legH - bodyH + 1 - armSwing, armW, armH);
        // Hands
        ctx.fillStyle = skinColor;
        ctx.fillRect(px - armW, baseY - legH - bodyH + armH + armSwing, armW, Math.floor(2 * sz));
        ctx.fillRect(px + bodyW, baseY - legH - bodyH + armH - armSwing, armW, Math.floor(2 * sz));
        // Head
        ctx.fillStyle = skinColor;
        ctx.fillRect(px + Math.floor((bodyW - headW) / 2), baseY - totalH, headW, headH);
        // Hair
        ctx.fillStyle = darkenColor(skinColor, 0.5);
        ctx.fillRect(px + Math.floor((bodyW - headW) / 2), baseY - totalH, headW, Math.floor(2 * sz));
        // Gold chain for abundant townsfolk
        if (al >= 3 && idx % 3 === 0) {
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(px + 2, baseY - legH - bodyH + 2, bodyW - 4, 1);
        }
        // Sunglasses for some prosperous townsfolk
        if (al >= 2 && idx % 4 === 0) {
            ctx.fillStyle = '#202020';
            ctx.fillRect(px + Math.floor((bodyW - headW) / 2) + 1, baseY - totalH + Math.floor(2.5 * sz), headW - 2, 2);
        }
    }

    function drawNamedNPC(wx, wy, portrait, name, time, idx, abundanceLevel) {
        var sz = 4.2;
        var al = abundanceLevel || 0;
        var px = Math.floor(wx);
        var headW = Math.floor(6 * sz);
        var headH = Math.floor(6 * sz);
        var bodyW = Math.floor(7 * sz);
        var bodyH = Math.floor(8 * sz);
        var legW = Math.floor(2.5 * sz);
        var legH = Math.floor(5 * sz);
        var armW = Math.floor(3 * sz);
        var armH = Math.floor(6 * sz);
        var totalH = headH + bodyH + legH;
        var baseY = Math.floor(wy);
        var bob = Math.floor(Math.sin(time * 0.003 + idx * 2.1) * 1);

        // Outfit evolves with abundance level
        // 0=depressed, 1=normal, 2=prosperous, 3=abundant
        var shirtColor = portrait.shirtColor;
        var pantsColor = '#2a2a3a';
        var shoeColor = '#1a1a20';
        if (al >= 2) {
            shirtColor = lightenColor(portrait.shirtColor, 30);
            pantsColor = '#3a3a4a';
            shoeColor = '#2a2a30';
        }
        if (al >= 3) {
            shirtColor = lightenColor(portrait.shirtColor, 50);
            pantsColor = '#4a4a5a';
            shoeColor = '#3a2020';
        }

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(px - 2, baseY + legH, bodyW + 4, 4);

        // Legs
        ctx.fillStyle = pantsColor;
        ctx.fillRect(px + 2, baseY - legH, legW, legH);
        ctx.fillRect(px + bodyW - legW - 2, baseY - legH, legW, legH);
        // Shoes
        ctx.fillStyle = shoeColor;
        ctx.fillRect(px + 1, baseY, legW + 1, Math.floor(2 * sz));
        ctx.fillRect(px + bodyW - legW - 2, baseY, legW + 1, Math.floor(2 * sz));
        // Fancy shoes at abundance 3
        if (al >= 3) {
            ctx.fillStyle = '#c0a040';
            ctx.fillRect(px + 1, baseY, legW + 1, 1);
            ctx.fillRect(px + bodyW - legW - 2, baseY, legW + 1, 1);
        }

        // Body
        ctx.fillStyle = shirtColor;
        ctx.fillRect(px, baseY - legH - bodyH - bob, bodyW, bodyH);
        // Shadow side
        ctx.fillStyle = darkenColor(shirtColor, 0.8);
        ctx.fillRect(px + bodyW - 4, baseY - legH - bodyH - bob, 4, bodyH);
        // Collar / lapel
        ctx.fillStyle = lightenColor(shirtColor, 20);
        ctx.fillRect(px + bodyW / 2 - 3, baseY - legH - bodyH - bob, 6, 3);
        ctx.fillRect(px + bodyW / 2 - 2, baseY - legH - bodyH + 3 - bob, 4, 2);
        // Buttons
        ctx.fillStyle = darkenColor(shirtColor, 0.6);
        ctx.fillRect(px + bodyW / 2 - 1, baseY - legH - bodyH + 6 - bob, 2, 1);
        ctx.fillRect(px + bodyW / 2 - 1, baseY - legH - bodyH + 10 - bob, 2, 1);
        // Belt
        ctx.fillStyle = '#1a1a20';
        ctx.fillRect(px + 1, baseY - legH - 3 - bob, bodyW - 2, 3);
        ctx.fillStyle = '#c0a040';
        ctx.fillRect(px + bodyW / 2 - 1, baseY - legH - 3 - bob, 3, 3);

        // Arms
        ctx.fillStyle = shirtColor;
        ctx.fillRect(px - armW, baseY - legH - bodyH + 2 - bob, armW, armH);
        ctx.fillRect(px + bodyW, baseY - legH - bodyH + 2 - bob, armW, armH);
        // Hands
        ctx.fillStyle = portrait.skinTone;
        ctx.fillRect(px - armW, baseY - legH - bodyH + armH + 1 - bob, armW, Math.floor(2 * sz));
        ctx.fillRect(px + bodyW, baseY - legH - bodyH + armH + 1 - bob, armW, Math.floor(2 * sz));

        // Watch/bracelet at prosperity
        if (al >= 2) {
            ctx.fillStyle = al >= 3 ? '#ffd700' : '#a0a0b0';
            ctx.fillRect(px - armW, baseY - legH - bodyH + armH - 1 - bob, armW, 2);
        }

        // Head with jawline
        ctx.fillStyle = portrait.skinTone;
        var headX = px + Math.floor((bodyW - headW) / 2);
        var headTop = baseY - totalH - bob;
        ctx.fillRect(headX, headTop, headW, headH);
        // Jawline — chin narrower than forehead
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(headX - 1, headTop + headH - 4, 2, 4);
        ctx.fillRect(headX + headW - 1, headTop + headH - 4, 2, 4);
        // Chin highlight
        ctx.fillStyle = lightenColor(portrait.skinTone, 15);
        ctx.fillRect(headX + 3, headTop + headH - 2, headW - 6, 1);
        // Nose hint
        ctx.fillStyle = darkenColor(portrait.skinTone, 0.85);
        ctx.fillRect(headX + headW / 2, headTop + Math.floor(4.5 * sz), 2, 3);
        // Ears
        ctx.fillStyle = portrait.skinTone;
        ctx.fillRect(headX - 2, headTop + Math.floor(3 * sz), 2, Math.floor(2 * sz));
        ctx.fillRect(headX + headW, headTop + Math.floor(3 * sz), 2, Math.floor(2 * sz));
        // Hair with volume (2 tones)
        ctx.fillStyle = portrait.hairColor;
        var hairH = portrait.hairStyle === 'receding' ? Math.floor(2 * sz) : Math.floor(3.5 * sz);
        ctx.fillRect(headX - 1, headTop - 2, headW + 2, hairH + 2);
        ctx.fillStyle = lightenColor(portrait.hairColor, 25);
        ctx.fillRect(headX + 2, headTop - 1, headW - 4, Math.floor(1.5 * sz));
        if (portrait.hairStyle !== 'receding') {
            ctx.fillStyle = portrait.hairColor;
            ctx.fillRect(headX - 2, headTop + Math.floor(1 * sz), 2, Math.floor(4 * sz));
            ctx.fillRect(headX + headW, headTop + Math.floor(1 * sz), 2, Math.floor(4 * sz));
        }
        // Eyes with white sclera
        var eyeY = headTop + Math.floor(3.5 * sz);
        ctx.fillStyle = '#e0e0e0';
        ctx.fillRect(headX + 4, eyeY, 5, 4);
        ctx.fillRect(headX + headW - 9, eyeY, 5, 4);
        // Pupils
        ctx.fillStyle = '#202020';
        ctx.fillRect(headX + 5, eyeY + 1, 3, 2);
        ctx.fillRect(headX + headW - 8, eyeY + 1, 3, 2);
        // Mouth (smile when happy)
        ctx.fillStyle = al >= 2 ? '#c06040' : '#804030';
        ctx.fillRect(headX + headW / 2 - 3, headTop + headH - Math.floor(2 * sz), 6, 1);
        if (al >= 2) {
            ctx.fillRect(headX + headW / 2 - 4, headTop + headH - Math.floor(2 * sz) - 1, 1, 1);
            ctx.fillRect(headX + headW / 2 + 3, headTop + headH - Math.floor(2 * sz) - 1, 1, 1);
        }

        // Glasses
        if (portrait.glasses) {
            ctx.fillStyle = al >= 3 ? '#ffd700' : '#606080';
            ctx.fillRect(headX + 1, baseY - totalH + Math.floor(3 * sz) - 1 - bob, headW - 2, 1);
            ctx.fillRect(headX + 1, baseY - totalH + Math.floor(3 * sz) + 2 - bob, headW - 2, 1);
        }
        // Sunglasses at abundance 3 (if no regular glasses)
        if (al >= 3 && !portrait.glasses) {
            ctx.fillStyle = '#202020';
            ctx.fillRect(headX + 2, baseY - totalH + Math.floor(3 * sz) - 1 - bob, headW - 4, 3);
            ctx.fillStyle = '#404060';
            ctx.fillRect(headX + 3, baseY - totalH + Math.floor(3 * sz) - bob, 4, 2);
            ctx.fillRect(headX + headW - 7, baseY - totalH + Math.floor(3 * sz) - bob, 4, 2);
        }
        // Beard
        if (portrait.beard) {
            ctx.fillStyle = portrait.hairColor;
            ctx.fillRect(headX + 1, baseY - totalH + headH - 4 - bob, headW - 2, 4);
        }

        // === ABUNDANCE ACCESSORIES ===
        // Gold chain necklace (abundance 3)
        if (al >= 3) {
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(px + 2, baseY - legH - bodyH + 3 - bob, bodyW - 4, 1);
            ctx.fillRect(px + bodyW / 2 - 2, baseY - legH - bodyH + 3 - bob, 4, 3);
            // Extra thick chain for certain NPCs
            ctx.fillRect(px + 3, baseY - legH - bodyH + 2 - bob, bodyW - 6, 2);
            // Medallion
            ctx.fillStyle = '#ffaa00';
            ctx.fillRect(px + bodyW / 2 - 1, baseY - legH - bodyH + 5 - bob, 3, 3);
        }
        // Silver chain (abundance 2)
        if (al === 2) {
            ctx.fillStyle = '#c0c0d0';
            ctx.fillRect(px + 3, baseY - legH - bodyH + 3 - bob, bodyW - 6, 1);
        }
        // Hat at prosperity
        if (al >= 2 && !portrait.glasses) {
            ctx.fillStyle = al >= 3 ? '#d4a017' : '#4a4a5a';
            ctx.fillRect(headX - 2, baseY - totalH - 3 - bob, headW + 4, 3);
            ctx.fillRect(headX + 1, baseY - totalH - 6 - bob, headW - 2, 4);
        }

        // Name label
        ctx.font = '5px "Press Start 2P", monospace';
        ctx.fillStyle = al >= 3 ? '#ffd700' : (al >= 2 ? '#e0e0ff' : portrait.shirtColor);
        ctx.textAlign = 'center';
        ctx.fillText(name, px + bodyW / 2, baseY - totalH - 10 - bob);
    }

    // Named NPC positions and data
    var highlightedNPCId = null;

    var TOWN_NPCS = [
        { id: 'betty_cafe', x: 4500, name: 'Betty', portrait: { skinTone: '#e0c080', hairColor: '#303030', hairStyle: 'short', shirtColor: '#a03030', glasses: false, beard: false } },
        { id: 'pub_landlord', x: 4350, name: 'Mick', portrait: { skinTone: '#e8c090', hairColor: '#604020', hairStyle: 'short', shirtColor: '#a06030', glasses: false, beard: true } },
        { id: 'teen_zara', x: 4980, name: 'Zara', portrait: { skinTone: '#a07040', hairColor: '#202020', hairStyle: 'short', shirtColor: '#3060a0', glasses: false, beard: false } },
        { id: 'mayor_patricia', x: 5600, name: 'Mayor', portrait: { skinTone: '#e8c890', hairColor: '#885530', hairStyle: 'short', shirtColor: '#304080', glasses: true, beard: false } },
        { id: 'reverend_james', x: 5930, name: 'Rev. James', portrait: { skinTone: '#f0d0a0', hairColor: '#505050', hairStyle: 'short', shirtColor: '#202020', glasses: true, beard: false } },
        { id: 'old_arthur', x: 7700, name: 'Arthur', portrait: { skinTone: '#e8c090', hairColor: '#c0c0c0', hairStyle: 'receding', shirtColor: '#606040', glasses: true, beard: true } },
        { id: 'frank_fisherman', x: 9800, name: 'Frank', portrait: { skinTone: '#d0a060', hairColor: '#888888', hairStyle: 'receding', shirtColor: '#404060', glasses: false, beard: true } },
        { id: 'comedian_wright', x: 6300, name: 'Steven', portrait: { skinTone: '#e8c8a0', hairColor: '#8a7060', hairStyle: 'swept', shirtColor: '#404060', glasses: true, beard: false } },
    ];

    // =========================================================================
    //  PLAYER CHARACTER
    // =========================================================================

    function initPlayer(characterId) {
        player.characterId = characterId;
        player.x = ZONES.campus.left + 200;
        player.targetX = player.x;
        player.walking = false;

        var charColors = {
            dario:  { skin: '#e0c0a0', hair: '#4a3020', shirt: '#3a5a8a', pants: '#2a2a3a' },
            sam:    { skin: '#f0d0a0', hair: '#604020', shirt: '#8a5a3a', pants: '#2a2a3a' },
            yann:   { skin: '#f0d0a0', hair: '#303030', shirt: '#5a3a8a', pants: '#2a2a4a' },
            elon:   { skin: '#e8c8a0', hair: '#303030', shirt: '#2a2a2a', pants: '#2a2a3a' },
            demis:  { skin: '#e0c090', hair: '#202020', shirt: '#3a7a5a', pants: '#2a3a3a' }
        };
        var c = charColors[characterId] || charColors.dario;
        player.skinTone = c.skin;
        player.hairColor = c.hair;
        player.shirtColor = c.shirt;
        player.pantsColor = c.pants;
    }

    function updatePlayer(dt) {
        if (!player.walking) return;
        var dx = player.targetX - player.x;
        var dist = Math.abs(dx);
        if (dist < 2) {
            player.x = player.targetX;
            player.walking = false;
            return;
        }
        player.direction = dx > 0 ? 1 : -1;
        player.x += player.direction * player.speed * (dt / 16);
        player.x = Math.max(20, Math.min(WORLD_W - 20, player.x));
    }

    function drawPlayer(time) {
        var sz = 4.0;
        var px = Math.floor(player.x);
        var baseY = SIDEWALK_Y + SIDEWALK_H + 2;
        var headW = Math.floor(6 * sz);
        var headH = Math.floor(6 * sz);
        var bodyW = Math.floor(7 * sz);
        var bodyH = Math.floor(9 * sz);
        var legW = Math.floor(3 * sz);
        var legH = Math.floor(5 * sz);
        var armW = Math.floor(3 * sz);
        var armH = Math.floor(6 * sz);
        var totalH = headH + bodyH + legH;

        var walkAnim = player.walking ? Math.sin(time * 0.012) : 0;
        var bob = player.walking ? Math.abs(walkAnim) * 2 : Math.sin(time * 0.003) * 0.5;
        var drawX = player.direction < 0 ? px - bodyW : px;

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(drawX - 2, baseY + legH, bodyW + 4, 3);

        // Legs (walk animation)
        var legFrame = Math.floor(walkAnim * 3);
        ctx.fillStyle = player.pantsColor;
        ctx.fillRect(drawX + 2, baseY - legH + legFrame, legW, legH - legFrame);
        ctx.fillRect(drawX + bodyW - legW - 2, baseY - legH - legFrame, legW, legH + legFrame);

        // Shoes
        ctx.fillStyle = '#1a1a20';
        ctx.fillRect(drawX + 1, baseY, legW + 2, Math.floor(2 * sz));
        ctx.fillRect(drawX + bodyW - legW - 2, baseY + (player.walking ? -legFrame : 0), legW + 2, Math.floor(2 * sz));

        // Body
        ctx.fillStyle = player.shirtColor;
        ctx.fillRect(drawX, baseY - legH - bodyH - bob, bodyW, bodyH);
        // Shadow side of body
        ctx.fillStyle = darkenColor(player.shirtColor, 0.8);
        ctx.fillRect(drawX + bodyW - 3, baseY - legH - bodyH - bob, 3, bodyH);
        // Collar/lapel detail (V-shape)
        ctx.fillStyle = lightenColor(player.shirtColor, 25);
        ctx.fillRect(drawX + bodyW / 2 - 3, baseY - legH - bodyH - bob, 6, 2);
        ctx.fillRect(drawX + bodyW / 2 - 2, baseY - legH - bodyH + 2 - bob, 4, 2);
        // Shirt buttons
        ctx.fillStyle = darkenColor(player.shirtColor, 0.6);
        for (var btn = 0; btn < 3; btn++) {
            ctx.fillRect(drawX + bodyW / 2 - 1, baseY - legH - bodyH + 5 + btn * 6 - bob, 2, 1);
        }
        // Belt
        ctx.fillStyle = '#1a1a20';
        ctx.fillRect(drawX + 1, baseY - legH - 2 - bob, bodyW - 2, 2);
        ctx.fillStyle = '#c0a040';
        ctx.fillRect(drawX + bodyW / 2 - 1, baseY - legH - 2 - bob, 3, 2);

        // Arms (swing with walk)
        var armSwing = Math.floor(walkAnim * 3);
        ctx.fillStyle = player.shirtColor;
        ctx.fillRect(drawX - armW, baseY - legH - bodyH + 2 + armSwing - bob, armW, armH);
        ctx.fillRect(drawX + bodyW, baseY - legH - bodyH + 2 - armSwing - bob, armW, armH);
        // Hands
        ctx.fillStyle = player.skinTone;
        ctx.fillRect(drawX - armW, baseY - legH - bodyH + armH + 1 + armSwing - bob, armW, Math.floor(2.5 * sz));
        ctx.fillRect(drawX + bodyW, baseY - legH - bodyH + armH + 1 - armSwing - bob, armW, Math.floor(2.5 * sz));

        // Head with jawline
        var headX = drawX + Math.floor((bodyW - headW) / 2);
        var headTop = baseY - totalH - bob;
        ctx.fillStyle = player.skinTone;
        ctx.fillRect(headX, headTop, headW, headH);
        // Jawline tapering — chin narrower than forehead
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(headX - 1, headTop + headH - 3, 2, 3);
        ctx.fillRect(headX + headW - 1, headTop + headH - 3, 2, 3);
        // Chin highlight
        ctx.fillStyle = lightenColor(player.skinTone, 15);
        ctx.fillRect(headX + 2, headTop + headH - 2, headW - 4, 1);
        // Eyes with white sclera (facing direction)
        var eyeOffset = player.direction > 0 ? 1 : -1;
        var eyeY = headTop + Math.floor(3 * sz);
        // Sclera (white)
        ctx.fillStyle = '#e0e0e0';
        ctx.fillRect(headX + 3 + eyeOffset, eyeY, 4, 3);
        ctx.fillRect(headX + headW - 7 + eyeOffset, eyeY, 4, 3);
        // Pupils
        ctx.fillStyle = '#202020';
        ctx.fillRect(headX + 4 + eyeOffset + (player.direction > 0 ? 1 : 0), eyeY + 1, 2, 2);
        ctx.fillRect(headX + headW - 6 + eyeOffset + (player.direction > 0 ? 1 : 0), eyeY + 1, 2, 2);
        // Mouth
        ctx.fillStyle = '#804030';
        ctx.fillRect(headX + headW / 2 - 2, headTop + headH - Math.floor(2 * sz), 4, 1);
        // Nose hint
        ctx.fillStyle = darkenColor(player.skinTone, 0.85);
        ctx.fillRect(headX + headW / 2, headTop + Math.floor(4 * sz), 2, 2);
        // Hair with volume (2 tones)
        ctx.fillStyle = player.hairColor;
        ctx.fillRect(headX - 1, headTop - 2, headW + 2, Math.floor(3 * sz) + 2);
        ctx.fillStyle = lightenColor(player.hairColor, 20);
        ctx.fillRect(headX + 2, headTop - 1, headW - 4, Math.floor(1.5 * sz));
        // Side hair
        ctx.fillStyle = player.hairColor;
        ctx.fillRect(headX - 2, headTop + Math.floor(1 * sz), 2, Math.floor(3 * sz));
        ctx.fillRect(headX + headW, headTop + Math.floor(1 * sz), 2, Math.floor(3 * sz));

        // Name label
        var charName = player.characterId ? player.characterId.charAt(0).toUpperCase() + player.characterId.slice(1) : 'You';
        ctx.font = '5px "Press Start 2P", monospace';
        ctx.fillStyle = '#ffdd44';
        ctx.textAlign = 'center';
        ctx.fillText(charName, drawX + bodyW / 2, baseY - totalH - 10 - bob);
    }

    function getAbundanceLevel(state) {
        var mood = state ? (state.townMood || 50) : 50;
        if (mood >= 80) return 3;
        if (mood >= 60) return 2;
        if (mood >= 40) return 1;
        return 0;
    }

    function drawWorkers(state, time) {
        if (!state) return;
        var talentCount = state.totalTalent || 5;
        var workerCount = Math.min(20, Math.floor(talentCount / 2) + 3);
        var al = getAbundanceLevel(state);

        var skinColors = ['#f0c890', '#d0a060', '#a07030', '#e8c090', '#c08850'];
        var shirtColors = ['#3060a0', '#a03030', '#30a060', '#606060', '#a06030',
                           '#6030a0', '#30a0a0', '#a06060', '#606030'];

        // Campus workers (walk along sidewalk level)
        var campusW = ZONES.campus.right - ZONES.campus.left;
        for (var i = 0; i < workerCount; i++) {
            var seed = i * 7919;
            var walkSpeed = 15 + (seed % 25);
            var dir = (seed % 2 === 0) ? 1 : -1;
            var wx = ZONES.campus.left + ((seed * 13 + time * 0.015 * dir * (walkSpeed / 25)) % campusW);
            if (wx < ZONES.campus.left) wx += campusW;
            var wy = SIDEWALK_Y + SIDEWALK_H + 4 + (seed % 60);
            if (!isVisible(wx - 10, 20)) continue;
            var bounce = Math.abs(Math.sin(time * 0.006 + i * 2.3)) * 2;
            drawPerson(wx, wy, bounce, skinColors[i % skinColors.length], shirtColors[i % shirtColors.length], time, i, false, 0);
        }

        // Named NPCs along the strip — abundance-aware outfits
        for (var ni = 0; ni < TOWN_NPCS.length; ni++) {
            var npc = TOWN_NPCS[ni];
            if (!isVisible(npc.x - 15, 40)) continue;
            drawNamedNPC(npc.x, SIDEWALK_Y + SIDEWALK_H + 2, npc.portrait, npc.name, time, ni, al);
            if (highlightedNPCId === npc.id) {
                var hx = npc.x + 5;
                var hy = SIDEWALK_Y + SIDEWALK_H - 26;
                var hAlpha = 0.6 + Math.sin(time * 0.005) * 0.3;
                ctx.globalAlpha = hAlpha;
                drawRect(hx - 6, hy - 4, 12, 8, '#ffdd44');
                drawRect(hx - 4, hy - 6, 8, 12, '#ffdd44');
                drawRect(hx - 3, hy - 2, 6, 4, '#0a0a2a');
                ctx.globalAlpha = 1;
            }
        }

        // Town people (generic walkers) — abundance-aware
        var townPop = state.townPopulation || 100;
        var townPeopleCount = Math.min(15, Math.floor(townPop / 25) + 2);
        if (al >= 2) townPeopleCount = Math.min(20, townPeopleCount + 4);
        if (al >= 3) townPeopleCount = Math.min(25, townPeopleCount + 5);
        var townW = ZONES.harbor.right - ZONES.town.left;
        for (var t = 0; t < townPeopleCount; t++) {
            var tseed = t * 3571 + 50000;
            var tDir = (tseed % 2 === 0) ? 1 : -1;
            var twx = ZONES.town.left + ((tseed * 11 + time * 0.01 * tDir * 0.8) % townW);
            if (twx < ZONES.town.left) twx += townW;
            var twy = SIDEWALK_Y + SIDEWALK_H + 4 + (tseed % 50);
            if (!isVisible(twx - 10, 20)) continue;
            var tbounce = Math.abs(Math.sin(time * 0.005 + t * 3.1)) * 1.5;
            drawPerson(twx, twy, tbounce, skinColors[(t + 2) % skinColors.length], shirtColors[(t + 3) % shirtColors.length], time, t + 100, false, al);
        }
    }

    // =========================================================================
    //  YEAR / STATUS OVERLAY
    // =========================================================================

    function addFloatingText(text, screenX, screenY, color) {
        floatingTexts.push({
            text: text,
            x: screenX,
            y: screenY,
            color: color || '#44ff88',
            life: 1.0,
            vy: -0.8
        });
        if (floatingTexts.length > 20) floatingTexts.shift();
    }

    function drawFloatingTexts() {
        for (var i = floatingTexts.length - 1; i >= 0; i--) {
            var ft = floatingTexts[i];
            ft.y += ft.vy;
            ft.life -= 0.012;
            if (ft.life <= 0) {
                floatingTexts.splice(i, 1);
                continue;
            }
            var alpha = Math.min(1, ft.life * 2);
            ctx.globalAlpha = alpha;
            drawText(ft.text, ft.x, ft.y, { size: 7, color: ft.color, align: 'center' });
            ctx.globalAlpha = 1;
        }
    }

    function drawOverlay(state, time) {
        if (!state) return;

        // Year display (top left)
        var yearStr = 'Year: ' + (state.year || 2025);
        drawText(yearStr, 8, 6, { size: 7, color: '#6688aa' });

        // Income rate (below year)
        var incomeStr = (state.moneyPerTick >= 0 ? '+' : '') + state.moneyPerTick.toFixed(1) + '$/day';
        var incomeColor = state.moneyPerTick >= 0 ? '#44ff88' : '#ff4444';
        drawText(incomeStr, 8, 16, { size: 6, color: incomeColor });

        // Population (top right-ish, near town)
        var popStr = 'Pop: ' + (state.townPopulation || 0);
        drawText(popStr, W - 170, 6, { size: 6, color: '#6688aa' });

        // Paused indicator
        if (state.paused) {
            var pauseAlpha = 0.5 + Math.sin(time * 0.003) * 0.3;
            ctx.globalAlpha = pauseAlpha;
            if (state.gameTime === 0) {
                drawText('▶ CLICK PLAY TO START', W / 2, H / 2 - 40, { size: 10, color: '#ffdd44', align: 'center' });
            } else {
                drawText('⏸ PAUSED', W / 2, H / 2 - 40, { size: 10, color: '#aaaacc', align: 'center' });
            }
            ctx.globalAlpha = 1;
        }

        drawFloatingTexts();
    }

    // =========================================================================
    //  MAIN GAME SCENE — THE BIG ONE
    // =========================================================================

    function drawMinimap(state, time) {
        var mw = 200, mh = 30;
        var mx = W - mw - 8, my = H - mh - 8;
        var scale = mw / WORLD_W;

        // Background
        ctx.fillStyle = 'rgba(10, 10, 26, 0.8)';
        ctx.fillRect(mx - 2, my - 2, mw + 4, mh + 4);

        // Zone colors
        var zoneKeys = ['wilderness', 'campus', 'road', 'town', 'harbor', 'ocean'];
        for (var zi = 0; zi < zoneKeys.length; zi++) {
            var zone = ZONES[zoneKeys[zi]];
            ctx.fillStyle = zone.ground;
            ctx.fillRect(mx + zone.left * scale, my, (zone.right - zone.left) * scale, mh);
        }

        // Buildings as dots
        if (state) {
            var allB = (state.buildings || []).concat(state.townBuildings || []);
            for (var bi = 0; bi < allB.length; bi++) {
                var b = allB[bi];
                var bx = b.worldX || (b.isTown ? ZONES.town.left + bi * 50 : ZONES.campus.left + bi * 50);
                ctx.fillStyle = b.isTown ? '#ffaa44' : '#44aaff';
                ctx.fillRect(mx + bx * scale, my + 5, 3, mh - 10);
            }
        }

        // Player dot on minimap
        ctx.fillStyle = '#ffdd44';
        ctx.fillRect(mx + player.x * scale - 1, my + 2, 3, mh - 4);

        // Viewport indicator
        ctx.strokeStyle = '#ffdd44';
        ctx.lineWidth = 1;
        ctx.strokeRect(mx + camera.x * scale, my, W * scale, mh);

        // Border
        ctx.strokeStyle = '#5a5a8a';
        ctx.lineWidth = 1;
        ctx.strokeRect(mx - 2, my - 2, mw + 4, mh + 4);
    }

    function drawGameScene(state, time) {
        clear();

        // Update player movement
        updatePlayer(16);

        // Camera follows player
        if (cameraFollowPlayer && !camera.isDragging) {
            camera.targetX = player.x - W / (2 * camera.zoom);
        }
        updateCamera();

        // PASS 1: Background (screen-relative, no translate)
        drawSky(time);
        drawStars(time);

        // PASS 2: World layer (zoomed and translated by camera)
        ctx.save();
        var zoomPivotY = H;
        ctx.translate(0, zoomPivotY);
        ctx.scale(camera.zoom, camera.zoom);
        ctx.translate(0, -zoomPivotY);
        ctx.translate(-camera.x, 0);

        drawOcean(time);
        drawHills(time);
        drawGround(time);
        drawBaseTownFeatures(time);
        drawBaseCampus(time);
        drawRoad(time);
        drawAllBuildings(state, time);
        drawSceneryDetails(time);
        drawEnvironmentProps(time);
        drawWorkers(state, time);
        drawPlayer(time);
        drawSeagulls(time);
        updateAndDrawSmoke(time);

        // Placement preview
        if (placementMode) {
            drawPlacementGhost(placementMode, time);
        }

        ctx.restore();

        // PASS 3: HUD (screen-relative, no translate)
        drawOverlay(state, time);
        drawMinimap(state, time);
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
        ZONES: ZONES,
        WORLD_W: WORLD_W,
        BUILDING_FLOOR: BUILDING_FLOOR,
        getCanvas: function() { return canvas; },
        getCtx: function() { return ctx; },

        // Camera API
        getCameraX: function() { return camera.x; },
        setCameraX: function(x) { camera.x = Math.max(0, Math.min(WORLD_W - W / camera.zoom, x)); camera.targetX = camera.x; },
        setCameraTarget: function(x) { camera.targetX = Math.max(0, Math.min(WORLD_W - W / camera.zoom, x)); },
        screenToWorld: function(sx, sy) {
            var pivotY = H;
            return { x: sx / camera.zoom + camera.x, y: (sy - pivotY) / camera.zoom + pivotY };
        },
        worldToScreen: function(wx, wy) {
            var pivotY = H;
            return { x: (wx - camera.x) * camera.zoom, y: (wy - pivotY) * camera.zoom + pivotY };
        },

        // Zoom API
        getZoom: function() { return camera.zoom; },
        setZoom: function(z) {
            var centerX = camera.x + W / (2 * camera.zoom);
            camera.targetZoom = Math.max(0.35, Math.min(1.5, z));
            camera.targetX = centerX - W / (2 * camera.targetZoom);
            clampCamera();
        },
        zoomIn: function() { this.setZoom(camera.targetZoom * 1.2); },
        zoomOut: function() { this.setZoom(camera.targetZoom / 1.2); },
        resetZoom: function() { this.setZoom(1.0); },

        // Camera input handlers (call from game.js)
        onMouseDown: function(sx, sy) {
            camera.isDragging = true;
            camera.dragStartX = sx;
            camera.dragStartCamX = camera.x;
        },
        onMouseMove: function(sx, sy) {
            camera.mouseX = sx;
            camera.mouseY = sy;
            if (camera.isDragging) {
                var dx = (camera.dragStartX - sx) / camera.zoom;
                camera.targetX = camera.dragStartCamX + dx;
                camera.x = camera.targetX;
                clampCamera();
            }
        },
        onMouseUp: function() {
            camera.isDragging = false;
        },

        // Placement mode API
        setPlacementMode: function(buildingId, isTown) {
            placementMode = { buildingId: buildingId, isTown: isTown, worldX: camera.x + W / (2 * camera.zoom), canPlace: false };
        },
        updatePlacementCursor: function(worldX, canPlace) {
            if (placementMode) {
                placementMode.worldX = worldX;
                placementMode.canPlace = canPlace;
            }
        },
        clearPlacementMode: function() { placementMode = null; },
        getPlacementMode: function() { return placementMode; },
        isInPlacementMode: function() { return !!placementMode; },
        getBuildingDimensions: getBuildingDimensions,

        // Minimap hit test
        getMinimapBounds: function() {
            return { x: W - 208, y: H - 38, w: 200, h: 30 };
        },

        // NPC hit test — returns NPC id if click is near an NPC
        hitTestNPC: function(worldX, worldY) {
            var hitW = 20, hitH = 40;
            var npcY = SIDEWALK_Y + SIDEWALK_H + 2;
            for (var i = 0; i < TOWN_NPCS.length; i++) {
                var npc = TOWN_NPCS[i];
                if (worldX >= npc.x - 8 && worldX <= npc.x + hitW + 8 &&
                    worldY >= npcY - hitH && worldY <= npcY + 10) {
                    return npc.id;
                }
            }
            return null;
        },

        // Get NPC list for external use
        getTownNPCs: function() { return TOWN_NPCS; },

        // Player API
        initPlayer: initPlayer,
        setPlayerTarget: function(worldX) {
            player.targetX = Math.max(20, Math.min(WORLD_W - 20, worldX));
            player.walking = true;
            cameraFollowPlayer = true;
        },
        getPlayerX: function() { return player.x; },
        isPlayerWalking: function() { return player.walking; },
        stopCameraFollow: function() { cameraFollowPlayer = false; },
        resumeCameraFollow: function() { cameraFollowPlayer = true; },

        // Permanent building bounds for overlap checking
        getPermanentBuildings: function() { return PERMANENT_BUILDINGS; },

        // Floating text feedback
        addFloatingText: addFloatingText,

        // NPC highlight
        setHighlightedNPC: function(id) { highlightedNPCId = id || null; }
    };
})();
