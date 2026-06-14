window.GAME = window.GAME || {};
window.GAME.Systems = window.GAME.Systems || {};

GAME.Systems.Renderer = (function() {
    'use strict';

    var canvas, ctx, portraitCanvas, portraitCtx;
    var COLORS = {
        sky: ['#0a0a2a', '#101840', '#182860', '#203870'],
        stars: '#ffffff',
        ground: '#1a2a1a',
        building: {
            wall: '#3a3a5a',
            wallLight: '#4a4a6a',
            window: '#203050',
            windowLit: '#40ff80',
            roof: '#2a2a4a',
            door: '#252540'
        },
        server: {
            rack: '#303040',
            light: '#40ff80',
            lightRed: '#ff4040',
            lightBlue: '#4080ff',
            cable: '#505060'
        },
        ui: {
            panelBg: '#1a1a3a',
            panelBorder: '#5a5a8a',
            highlight: '#ffdd44',
            textPrimary: '#e0e0ff',
            textSecondary: '#a0a0c0'
        }
    };

    function init(canvasId) {
        canvas = document.getElementById(canvasId);
        ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
    }

    function clear() {
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
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

    // ---- PIXEL ART SCENE RENDERING ----

    function drawSkyGradient() {
        var bandHeight = canvas.height / 4;
        for (var i = 0; i < COLORS.sky.length; i++) {
            drawRect(0, i * bandHeight, canvas.width, bandHeight + 1, COLORS.sky[i]);
        }
    }

    function drawStars(time) {
        var seed = 12345;
        for (var i = 0; i < 60; i++) {
            seed = (seed * 16807 + 7) % 2147483647;
            var sx = (seed % canvas.width);
            seed = (seed * 16807 + 7) % 2147483647;
            var sy = (seed % (canvas.height * 0.4));
            seed = (seed * 16807 + 7) % 2147483647;
            var twinkle = Math.sin(time * 0.001 + i) > 0.3;
            if (twinkle) {
                var size = (seed % 3 === 0) ? 2 : 1;
                ctx.fillStyle = 'rgba(255,255,255,' + (0.4 + Math.sin(time * 0.002 + i * 0.5) * 0.3) + ')';
                ctx.fillRect(sx, sy, size, size);
            }
        }
    }

    function drawCityscape(time) {
        var groundY = canvas.height * 0.7;
        drawRect(0, groundY, canvas.width, canvas.height - groundY, COLORS.ground);

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
            drawRect(b.x, by, b.w, b.h, COLORS.building.wall);
            drawRect(b.x, by, b.w, 4, COLORS.building.roof);
            drawOutline(b.x, by, b.w, b.h, COLORS.building.wallLight);

            for (var wy = by + 12; wy < groundY - 16; wy += 18) {
                for (var wx = b.x + 8; wx < b.x + b.w - 10; wx += 14) {
                    var lit = Math.sin(time * 0.0005 + idx * 3 + wx * 0.1 + wy * 0.1) > 0;
                    drawRect(wx, wy, 8, 10, lit ? COLORS.building.windowLit : COLORS.building.window);
                }
            }
        });
    }

    // ---- CAMPUS VIEW (main game screen) ----

    function drawCampusGround(gridState) {
        var groundY = canvas.height * 0.55;
        // Sky
        drawRect(0, 0, canvas.width, groundY, '#101830');
        // Ground plane (isometric-ish)
        ctx.fillStyle = '#1a2818';
        ctx.beginPath();
        ctx.moveTo(0, groundY);
        ctx.lineTo(canvas.width, groundY);
        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.fill();

        // Grid lines
        ctx.strokeStyle = 'rgba(60, 80, 60, 0.3)';
        ctx.lineWidth = 1;
        var gridSize = 40;
        for (var x = 0; x < canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, groundY);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (var y = groundY; y < canvas.height; y += gridSize * 0.5) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
    }

    function drawBuilding(x, y, buildingData, time) {
        var cellSize = 40;
        var bw = buildingData.size.w * cellSize;
        var bh = buildingData.size.h * cellSize * 0.6;
        var bx = x * cellSize;
        var by = (canvas.height * 0.55) + y * cellSize * 0.5;

        var cat = GAME.DATA.BUILDING_CATEGORIES[buildingData.category];
        var baseColor = cat ? cat.color : '#5a5a8a';

        // Building shadow
        drawRect(bx + 3, by + 3, bw, bh, 'rgba(0,0,0,0.3)');

        // Building body
        drawRect(bx, by - bh, bw, bh, darkenColor(baseColor, 0.4));
        drawRect(bx + 2, by - bh + 2, bw - 4, bh - 4, darkenColor(baseColor, 0.5));

        // Roof
        drawRect(bx - 2, by - bh - 4, bw + 4, 6, darkenColor(baseColor, 0.6));

        // Windows
        for (var wy = by - bh + 10; wy < by - 8; wy += 14) {
            for (var wx = bx + 6; wx < bx + bw - 10; wx += 12) {
                var lit = Math.sin(time * 0.001 + wx * 0.2 + wy * 0.3) > -0.3;
                drawRect(wx, wy, 6, 8, lit ? '#40ff80' : '#203050');
            }
        }

        // Label
        drawText(buildingData.name.substring(0, 12), bx + bw / 2, by + 4, {
            size: 7,
            color: '#a0a0c0',
            align: 'center'
        });
    }

    function darkenColor(hex, factor) {
        var r = parseInt(hex.slice(1, 3), 16);
        var g = parseInt(hex.slice(3, 5), 16);
        var b = parseInt(hex.slice(5, 7), 16);
        r = Math.floor(r * factor);
        g = Math.floor(g * factor);
        b = Math.floor(b * factor);
        return '#' + r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');
    }

    // ---- CHARACTER PORTRAITS (procedural pixel art) ----

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

    // ---- TITLE SCREEN ----

    function drawTitleScene(time) {
        clear();
        drawSkyGradient();
        drawStars(time);
        drawCityscape(time);

        // Animated glow on buildings
        var glowAlpha = 0.3 + Math.sin(time * 0.002) * 0.15;
        ctx.fillStyle = 'rgba(64, 255, 128, ' + glowAlpha + ')';
        ctx.fillRect(0, canvas.height * 0.65, canvas.width, 3);
    }

    // ---- GAME SCENE ----

    function drawGameScene(state, time) {
        clear();

        // Sky with time-of-day feel
        drawRect(0, 0, canvas.width, canvas.height * 0.55, '#101830');
        drawStars(time);

        // Campus ground
        drawCampusGround();

        // Draw placed buildings
        if (state && state.buildings) {
            state.buildings.forEach(function(placed) {
                var bData = GAME.DATA.BUILDINGS[placed.type];
                if (bData) {
                    drawBuilding(placed.gridX, placed.gridY, bData, time);
                }
            });
        }

        // Draw little walking people
        drawWorkers(state, time);
    }

    function drawWorkers(state, time) {
        if (!state) return;
        var workerCount = Math.min(20, (state.stats.talentRate || 0) + 3);
        var groundY = canvas.height * 0.55;

        for (var i = 0; i < workerCount; i++) {
            var seed = i * 7919;
            var baseX = (seed * 13) % canvas.width;
            var walkSpeed = 20 + (seed % 30);
            var wx = (baseX + time * 0.02 * ((seed % 2 === 0) ? 1 : -1) * (walkSpeed / 30)) % canvas.width;
            if (wx < 0) wx += canvas.width;
            var wy = groundY + 10 + (seed % 60);
            var bounce = Math.abs(Math.sin(time * 0.005 + i * 2)) * 2;

            // Body
            var skinColors = ['#f0c890', '#d0a060', '#a07030', '#e8c090'];
            var shirtColors = ['#3060a0', '#a03030', '#30a060', '#606060', '#a06030'];
            ctx.fillStyle = skinColors[i % skinColors.length];
            ctx.fillRect(wx, wy - 8 - bounce, 4, 4);
            ctx.fillStyle = shirtColors[i % shirtColors.length];
            ctx.fillRect(wx - 1, wy - 4 - bounce, 6, 6);
            // Legs
            ctx.fillStyle = '#303040';
            var legFrame = Math.sin(time * 0.01 + i) > 0;
            ctx.fillRect(wx, wy + 2 - bounce, 2, 3);
            ctx.fillRect(wx + 2, wy + 2 - bounce + (legFrame ? 1 : 0), 2, 3);
        }
    }

    // ---- TITLE PIXEL SCENE ----

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

        // Mini scene
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

        // Mini buildings representing AI labs
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

            // Windows
            for (var wy = by + 10; wy < 135; wy += 12) {
                for (var wx = lab.x + 5; wx < lab.x + lab.w - 8; wx += 10) {
                    var lit = Math.sin(time * 0.002 + wx + wy) > 0;
                    tctx.fillStyle = lit ? '#40ff80' : '#203050';
                    tctx.fillRect(wx, wy, 5, 7);
                }
            }

            // Label
            tctx.font = '7px "Press Start 2P", monospace';
            tctx.fillStyle = lab.color;
            tctx.textAlign = 'center';
            tctx.fillText(lab.label, lab.x + lab.w / 2, 155);
        });

        // Data streams between buildings
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
        drawBuilding: drawBuilding,
        drawCampusGround: drawCampusGround,
        COLORS: COLORS,
        getCanvas: function() { return canvas; },
        getCtx: function() { return ctx; }
    };
})();
