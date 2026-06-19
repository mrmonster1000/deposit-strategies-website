window.GAME = window.GAME || {};

(function() {
    'use strict';

    var State = GAME.Systems.State;
    var Renderer = GAME.Systems.Renderer;
    var Simulation = GAME.Systems.Simulation;
    var Dialogue = GAME.Systems.Dialogue;
    var Crisis = GAME.Systems.Crisis;
    var AIOpponents = GAME.Systems.AIOpponents;
    var Sound = GAME.Systems.Sound;

    var currentScreen = 'title';
    var selectedCharacter = null;
    var lastTimestamp = 0;
    var buildMode = null; // null or { buildingId, isTown }
    var nextGridX = 1;
    var nextGridY = 0;
    var nextTownGridX = 1;
    var nextTownGridY = 0;
    var seagullTimer = 0;

    // ---- INITIALIZATION ----

    function init() {
        Renderer.init('game-canvas');
        Sound.init();

        setupEventListeners();
        setupCanvasInput();
        setupStateListeners();
        setupCharacterSelect();

        // Check for save
        if (State.hasSave()) {
            document.getElementById('btn-continue').style.display = 'block';
        }

        // Start render loop
        requestAnimationFrame(gameLoop);
    }

    function gameLoop(timestamp) {
        var dt = timestamp - lastTimestamp;
        lastTimestamp = timestamp;
        if (dt > 100) dt = 100;

        update(dt);
        render(timestamp);

        requestAnimationFrame(gameLoop);
    }

    function update(dt) {
        if (currentScreen !== 'game') return;
        Simulation.update(dt);
        AIOpponents.update(dt);

        seagullTimer -= dt;
        if (seagullTimer <= 0) {
            seagullTimer = 15000 + Math.random() * 30000;
            Sound.playSeagull();
        }
    }

    function render(time) {
        if (currentScreen === 'title') {
            Renderer.drawTitleScene(time);
            Renderer.drawTitlePixelScene('title-pixel-scene', time);
        } else if (currentScreen === 'game') {
            var state = State.get();
            Renderer.drawGameScene(state, time);
            updateUI(state);
        }
    }

    // ---- UI UPDATES ----

    function updateUI(state) {
        if (!state) return;

        // Top bar
        document.getElementById('turn-display').textContent = State.getDateString();
        document.getElementById('year-display').textContent = 'Year ' + state.year;
        document.getElementById('phase-display').textContent = 'Phase ' + state.phase + ': ' + state.phaseName;

        // Meters
        updateMeter('banking', state.bankingStability);
        updateMeter('climate', state.climate);
        updateMeter('social', state.socialCohesion);
        updateMeter('international', state.internationalRelations);

        // Player stats
        document.getElementById('stat-adp').textContent = Math.floor(state.adp);
        document.getElementById('stat-safety').textContent = Math.floor(state.safety);
        document.getElementById('stat-political').textContent = Math.floor(state.politicalCapital);
        document.getElementById('stat-research').textContent = Math.floor(state.research);

        // Competitor panel
        updateCompetitorPanel();

        // Speed buttons
        updateSpeedButtons(state);
    }

    function updateMeter(id, value) {
        var fill = document.getElementById('meter-' + id);
        var val = document.getElementById('val-' + id);
        if (fill) {
            fill.style.width = Math.max(0, Math.min(100, value)) + '%';
            if (value < 30) fill.style.backgroundColor = '#ff4444';
            else if (value < 50) fill.style.backgroundColor = '#ffaa44';
        }
        if (val) val.textContent = Math.floor(value);
    }

    function updateCompetitorPanel() {
        var list = document.getElementById('competitor-list');
        var comps = AIOpponents.getCompetitorSummary();

        list.innerHTML = '';
        comps.forEach(function(comp) {
            var row = document.createElement('div');
            row.className = 'competitor-row';
            row.innerHTML = '<span class="comp-name" style="color:' + comp.color + '">' + comp.shortName + '</span>' +
                '<span class="comp-adp">ADP: ' + comp.adp + '</span>';
            list.appendChild(row);
        });
    }

    function updateSpeedButtons(state) {
        var speedBtns = document.querySelectorAll('.speed-btn');
        speedBtns.forEach(function(btn) {
            btn.classList.toggle('active', parseInt(btn.dataset.speed) === state.speed && !state.paused);
        });
        var pauseBtn = document.getElementById('btn-pause');
        if (pauseBtn) {
            pauseBtn.classList.toggle('active', state.paused);
            pauseBtn.textContent = state.paused ? '▶ PLAY' : '⏸ PAUSE';
        }
    }

    // ---- EVENT LISTENERS ----

    function setupEventListeners() {
        // Title screen
        document.getElementById('btn-new-game').addEventListener('click', function() {
            Sound.playClick();
            showScreen('character-select');
        });

        document.getElementById('btn-continue').addEventListener('click', function() {
            Sound.playClick();
            if (State.load()) {
                startGameFromSave();
            }
        });

        document.getElementById('btn-about').addEventListener('click', function() {
            Sound.playClick();
            document.getElementById('about-modal').style.display = 'flex';
        });

        document.getElementById('btn-close-about').addEventListener('click', function() {
            document.getElementById('about-modal').style.display = 'none';
        });

        // Character select
        document.getElementById('btn-back-title').addEventListener('click', function() {
            Sound.playClick();
            showScreen('title');
        });

        document.getElementById('btn-start-game').addEventListener('click', function() {
            Sound.playClick();
            if (selectedCharacter) {
                startNewGame(selectedCharacter);
            }
        });

        // Verb bar actions
        document.querySelectorAll('.verb-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                Sound.playClick();
                handleAction(btn.dataset.action);
            });
        });
    }

    function setupCanvasInput() {
        var canvas = document.getElementById('game-canvas');
        if (!canvas) return;

        function getCanvasCoords(e) {
            var rect = canvas.getBoundingClientRect();
            var scaleX = canvas.width / rect.width;
            var scaleY = canvas.height / rect.height;
            var clientX, clientY;
            if (e.touches) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else {
                clientX = e.clientX;
                clientY = e.clientY;
            }
            return {
                x: (clientX - rect.left) * scaleX,
                y: (clientY - rect.top) * scaleY
            };
        }

        canvas.addEventListener('mousedown', function(e) {
            if (currentScreen !== 'game') return;
            var c = getCanvasCoords(e);

            // Check minimap click
            var mm = Renderer.getMinimapBounds();
            if (c.x >= mm.x && c.x <= mm.x + mm.w && c.y >= mm.y && c.y <= mm.y + mm.h) {
                var ratio = (c.x - mm.x) / mm.w;
                Renderer.setCameraTarget(ratio * Renderer.WORLD_W - 480);
                return;
            }

            // Check placement mode click
            if (Renderer.isInPlacementMode()) {
                var pm = Renderer.getPlacementMode();
                if (pm && pm.canPlace) {
                    placeBuilding(pm.buildingId, pm.worldX, pm.isTown);
                    Renderer.clearPlacementMode();
                }
                return;
            }

            Renderer.onMouseDown(c.x, c.y);
        });

        canvas.addEventListener('mousemove', function(e) {
            if (currentScreen !== 'game') return;
            var c = getCanvasCoords(e);
            Renderer.onMouseMove(c.x, c.y);

            // Update placement preview
            if (Renderer.isInPlacementMode()) {
                var world = Renderer.screenToWorld(c.x, c.y);
                var pm = Renderer.getPlacementMode();
                var canPlace = canPlaceBuilding(pm.buildingId, world.x, pm.isTown);
                Renderer.updatePlacementCursor(world.x, canPlace);
            }
        });

        canvas.addEventListener('mouseup', function() {
            Renderer.onMouseUp();
        });

        canvas.addEventListener('mouseleave', function() {
            Renderer.onMouseUp();
        });

        // Touch support for mobile
        canvas.addEventListener('touchstart', function(e) {
            if (currentScreen !== 'game') return;
            var c = getCanvasCoords(e);
            Renderer.onMouseDown(c.x, c.y);
            e.preventDefault();
        }, { passive: false });

        canvas.addEventListener('touchmove', function(e) {
            if (currentScreen !== 'game') return;
            var c = getCanvasCoords({ touches: e.touches, clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });
            Renderer.onMouseMove(c.x, c.y);
            e.preventDefault();
        }, { passive: false });

        canvas.addEventListener('touchend', function() {
            Renderer.onMouseUp();
        });

        // Keyboard scrolling
        document.addEventListener('keydown', function(e) {
            if (currentScreen !== 'game') return;
            if (e.key === 'ArrowLeft' || e.key === 'a') {
                Renderer.setCameraTarget(Renderer.getCameraX() - 200);
            } else if (e.key === 'ArrowRight' || e.key === 'd') {
                Renderer.setCameraTarget(Renderer.getCameraX() + 200);
            } else if (e.key === 'Escape' && Renderer.isInPlacementMode()) {
                Renderer.clearPlacementMode();
            }
        });
    }

    function canPlaceBuilding(buildingId, worldX, isTown) {
        var bData = isTown
            ? (GAME.DATA.TOWN && GAME.DATA.TOWN.buildings ? GAME.DATA.TOWN.buildings[buildingId] : null)
            : (GAME.DATA.BUILDINGS ? GAME.DATA.BUILDINGS[buildingId] : null);
        var dims = Renderer.getBuildingDimensions(bData, isTown);
        var bw = dims.w;

        // Check zone restriction
        var zone = isTown ? GAME.Systems.Renderer.ZONES.town : GAME.Systems.Renderer.ZONES.campus;
        var zoneEnd = isTown ? GAME.Systems.Renderer.ZONES.harbor.right : GAME.Systems.Renderer.ZONES.campus.right;
        if (worldX < zone.left || worldX + bw > zoneEnd) return false;

        // Check overlap with existing buildings
        var state = State.get();
        var allB = (state.buildings || []).concat(state.townBuildings || []);
        for (var i = 0; i < allB.length; i++) {
            var existing = allB[i];
            var eData = existing.isTown
                ? (GAME.DATA.TOWN && GAME.DATA.TOWN.buildings ? GAME.DATA.TOWN.buildings[existing.type] : null)
                : (GAME.DATA.BUILDINGS ? GAME.DATA.BUILDINGS[existing.type] : null);
            var eDims = Renderer.getBuildingDimensions(eData, existing.isTown);
            var eX = existing.worldX || 0;
            if (worldX < eX + eDims.w + 5 && worldX + bw + 5 > eX) return false;
        }
        return true;
    }

    function setupStateListeners() {
        State.on('eventTriggered', function(evt) {
            Sound.playAlert();
            Dialogue.showEvent(evt);
        });

        State.on('townEventTriggered', function(evt) {
            Sound.playAlert();
            Dialogue.showEvent(evt);
        });

        State.on('crisisTriggered', function(crisis) {
            Sound.playCrisis();
            Crisis.showCrisis(crisis);
        });

        State.on('buildingPlaced', function(data) {
            Sound.playBuild();
            showToast(data.building.name + ' built!', 'success');
            State.addLog('Built: ' + data.building.name, 'positive');

            // Show random flavor text
            if (data.building.flavorTexts && data.building.flavorTexts.length > 0) {
                var flavor = data.building.flavorTexts[Math.floor(Math.random() * data.building.flavorTexts.length)];
                setTimeout(function() {
                    showToast(flavor, 'info');
                }, 2000);
            }
        });

        State.on('insufficientFunds', function(data) {
            showToast('Not enough funds for ' + data.building.name + '!', 'danger');
        });

        State.on('advisorQuip', function(quip) {
            showToast(quip.text, 'info');
        });

        State.on('logAdded', function(entry) {
            var logEl = document.getElementById('log-entries');
            var div = document.createElement('div');
            div.className = 'log-entry event-' + (entry.type || 'info');
            div.textContent = '[' + entry.year + '] ' + entry.text;
            logEl.insertBefore(div, logEl.firstChild);
            while (logEl.children.length > 20) {
                logEl.removeChild(logEl.lastChild);
            }
        });

        State.on('gameOver', function(data) {
            var state = State.get();
            state.paused = true;
            Sound.stopMusic();
            showEndgameScreen(data, state);
        });

        State.on('dialogueChoice', function(data) {
            handleDialogueEffect(data.effect);
        });

        State.on('phaseChange', function(data) {
            Sound.playSuccess();
            showToast('PHASE ' + data.phase + ' UNLOCKED! New buildings available!', 'warning');
        });
    }

    // ---- CHARACTER SELECT ----

    function setupCharacterSelect() {
        var grid = document.getElementById('character-grid');
        var chars = GAME.DATA.CHARACTERS;

        for (var id in chars) {
            var ch = chars[id];
            var card = document.createElement('div');
            card.className = 'char-card' + (ch.locked ? ' locked' : '');
            card.dataset.charId = id;
            card.dataset.char = id;

            var portraitDiv = document.createElement('div');
            portraitDiv.className = 'char-card-portrait';
            var portraitCanvas = document.createElement('canvas');
            portraitCanvas.width = 80;
            portraitCanvas.height = 80;
            portraitDiv.appendChild(portraitCanvas);

            card.innerHTML = '';
            card.appendChild(portraitDiv);

            var nameDiv = document.createElement('div');
            nameDiv.className = 'char-card-name';
            nameDiv.textContent = ch.name;
            card.appendChild(nameDiv);

            var titleDiv = document.createElement('div');
            titleDiv.className = 'char-card-title';
            titleDiv.textContent = ch.locked ? '🔒 ' + ch.lockMessage : ch.title;
            card.appendChild(titleDiv);

            if (!ch.locked) {
                card.addEventListener('click', (function(charId) {
                    return function() {
                        Sound.playSelect();
                        selectCharacter(charId);
                    };
                })(id));
            }

            grid.appendChild(card);

            // Draw portrait
            Renderer.drawPortrait(id, portraitCanvas, 80);
        }
    }

    function selectCharacter(charId) {
        selectedCharacter = charId;
        var ch = GAME.DATA.CHARACTERS[charId];

        // Highlight card
        document.querySelectorAll('.char-card').forEach(function(card) {
            card.classList.toggle('selected', card.dataset.charId === charId);
        });

        // Show bio
        var bioPortrait = document.getElementById('bio-portrait');
        bioPortrait.innerHTML = '';
        var bigCanvas = document.createElement('canvas');
        bigCanvas.width = 120;
        bigCanvas.height = 120;
        bigCanvas.style.width = '100%';
        bigCanvas.style.height = '100%';
        bigCanvas.style.imageRendering = 'pixelated';
        bioPortrait.appendChild(bigCanvas);
        Renderer.drawPortrait(charId, bigCanvas, 120);

        var bioText = document.getElementById('bio-text');
        bioText.innerHTML =
            '<span class="bio-name">' + ch.name + ' — "' + ch.title + '"</span>' +
            '<span class="bio-philosophy">"' + ch.philosophy + '"</span>' +
            ch.bio +
            '<div class="bio-stats">' +
            '<div class="bio-stat"><span class="bio-stat-label">Capability:</span> <span class="bio-stat-value">' + ch.multipliers.capability + 'x</span></div>' +
            '<div class="bio-stat"><span class="bio-stat-label">Safety:</span> <span class="bio-stat-value">' + ch.multipliers.safety + 'x</span></div>' +
            '<div class="bio-stat"><span class="bio-stat-label">Deployment:</span> <span class="bio-stat-value">' + ch.multipliers.deployment + 'x</span></div>' +
            '<div class="bio-stat"><span class="bio-stat-label">Cooperation:</span> <span class="bio-stat-value">' + ch.multipliers.cooperation + 'x</span></div>' +
            '</div>';

        document.getElementById('btn-start-game').disabled = false;
    }

    // ---- GAME START ----

    function startNewGame(charId) {
        State.createNew(charId);
        showScreen('game');
        setupGameUI();

        // Draw player portrait
        Renderer.drawPortrait(charId, document.getElementById('portrait-canvas'), 96);

        // Start ambient music
        Sound.playMusicLoop();

        // Start intro dialogue
        var introId = 'intro_' + charId;
        if (GAME.DATA.DIALOGUES[introId]) {
            setTimeout(function() {
                Dialogue.startDialogue(introId);
            }, 500);
        }
    }

    function startGameFromSave() {
        var state = State.get();
        showScreen('game');
        setupGameUI();
        Renderer.drawPortrait(state.characterId, document.getElementById('portrait-canvas'), 96);
        Sound.playMusicLoop();
        showToast('Game loaded — ' + State.getDateString(), 'success');
    }

    function setupGameUI() {
        // Replace verb bar with simulation controls
        var verbBar = document.getElementById('verb-bar');
        verbBar.innerHTML =
            '<div class="verb-row">' +
            '<button class="verb-btn" data-action="build-campus" title="Build on your AI campus">BUILD CAMPUS</button>' +
            '<button class="verb-btn" data-action="build-town" title="Invest in the town">BUILD TOWN</button>' +
            '<button class="verb-btn" data-action="ability" title="Use character ability">ABILITY</button>' +
            '</div>' +
            '<div class="verb-row">' +
            '<button class="verb-btn speed-btn" id="btn-pause" data-action="pause">▶ PLAY</button>' +
            '<button class="verb-btn speed-btn" data-action="speed-1" data-speed="1">1x</button>' +
            '<button class="verb-btn speed-btn" data-action="speed-2" data-speed="2">2x</button>' +
            '<button class="verb-btn speed-btn" data-action="speed-5" data-speed="5">5x</button>' +
            '<button class="verb-btn" data-action="save" style="min-width:80px">SAVE</button>' +
            '</div>';

        // Re-bind verb buttons
        verbBar.querySelectorAll('.verb-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                Sound.playClick();
                handleAction(btn.dataset.action);
            });
        });

        // Add money display to stats
        var statsEl = document.getElementById('player-stats');
        var moneyRow = document.createElement('div');
        moneyRow.className = 'stat-row';
        moneyRow.innerHTML = '<span class="stat-label">FUNDS</span><span class="stat-value" id="stat-money">500</span>';
        statsEl.insertBefore(moneyRow, statsEl.firstChild);

        // Add town mood to stats
        var townRow = document.createElement('div');
        townRow.className = 'stat-row';
        townRow.innerHTML = '<span class="stat-label">TOWN</span><span class="stat-value" id="stat-town">60</span>';
        statsEl.appendChild(townRow);

        // Update stats periodically
        setInterval(function() {
            var state = State.get();
            if (!state) return;
            var moneyEl = document.getElementById('stat-money');
            var townEl = document.getElementById('stat-town');
            if (moneyEl) moneyEl.textContent = Math.floor(state.money);
            if (townEl) townEl.textContent = Math.floor(state.townMood);
        }, 500);
    }

    // ---- ACTIONS ----

    function handleAction(action) {
        var state = State.get();
        if (!state) return;

        switch (action) {
            case 'build-campus':
                showBuildMenu(false);
                break;
            case 'build-town':
                showBuildMenu(true);
                break;
            case 'ability':
                showAbilityMenu();
                break;
            case 'pause':
                Simulation.togglePause();
                break;
            case 'speed-1':
                Simulation.setSpeed(1);
                state.paused = false;
                break;
            case 'speed-2':
                Simulation.setSpeed(2);
                state.paused = false;
                break;
            case 'speed-5':
                Simulation.setSpeed(5);
                state.paused = false;
                break;
            case 'save':
                if (State.save()) {
                    showToast('Game saved!', 'success');
                } else {
                    showToast('Save failed!', 'danger');
                }
                break;
        }
    }

    function showBuildMenu(isTown) {
        var state = State.get();
        var panel = document.getElementById('decision-panel');
        var title = document.getElementById('decision-title');
        var desc = document.getElementById('decision-description');
        var options = document.getElementById('decision-options');

        state.paused = true;

        title.textContent = isTown ? 'BUILD FOR THE TOWN' : 'BUILD ON CAMPUS';
        desc.textContent = isTown
            ? 'Invest in Abundance Bay. Happy towns attract talent and build trust. Funds: $' + Math.floor(state.money) + 'M'
            : 'Expand your AI campus. More infrastructure = more capability. Funds: $' + Math.floor(state.money) + 'M';

        var source = isTown
            ? { list: state.unlockedTownBuildings, data: GAME.DATA.TOWN.buildings }
            : { list: state.unlockedBuildings, data: GAME.DATA.BUILDINGS };

        options.innerHTML = '';

        // Group by category
        var categories = {};
        source.list.forEach(function(id) {
            var b = source.data[id];
            if (!b) return;
            if (b.characterSpecific && b.characterSpecific !== state.characterId) return;
            var cat = b.category || 'other';
            if (!categories[cat]) categories[cat] = [];
            categories[cat].push(b);
        });

        for (var cat in categories) {
            var catInfo = GAME.DATA.BUILDING_CATEGORIES[cat] || { name: cat, color: '#888' };
            var catLabel = document.createElement('div');
            catLabel.style.cssText = 'font-size:8px; color:' + catInfo.color + '; padding:6px 0 2px; border-bottom:1px solid #333; margin-top:8px;';
            catLabel.textContent = '— ' + (catInfo.name || cat).toUpperCase() + ' —';
            options.appendChild(catLabel);

            categories[cat].forEach(function(b) {
                var canBuild = state.money >= b.cost;
                var meetsReqs = true;
                if (b.requires) {
                    for (var req in b.requires) {
                        if ((state.buildingCounts[req] || 0) < b.requires[req]) meetsReqs = false;
                    }
                }
                if (b.unlockPhase && b.unlockPhase > state.phase) meetsReqs = false;

                var optEl = document.createElement('div');
                optEl.className = 'decision-option';
                if (!canBuild || !meetsReqs) optEl.style.opacity = '0.4';

                var producesHtml = '';
                if (b.produces) {
                    var items = [];
                    for (var k in b.produces) {
                        items.push(Crisis.formatEffectName(k) + ': +' + b.produces[k]);
                    }
                    producesHtml = '<div class="decision-option-effects"><span class="effect-positive">' + items.join(' &bull; ') + '</span></div>';
                }

                var reqText = '';
                if (b.requires && Object.keys(b.requires).length > 0) {
                    var reqItems = [];
                    for (var r in b.requires) {
                        var rd = source.data[r] || GAME.DATA.BUILDINGS[r];
                        var have = state.buildingCounts[r] || 0;
                        var need = b.requires[r];
                        var met = have >= need;
                        reqItems.push('<span class="' + (met ? 'effect-positive' : 'effect-negative') + '">' +
                            (rd ? rd.name : r) + ' (' + have + '/' + need + ')</span>');
                    }
                    reqText = '<div style="font-size:7px; margin-top:4px;">Requires: ' + reqItems.join(', ') + '</div>';
                }

                optEl.innerHTML =
                    '<div class="decision-option-title">' + b.name + ' — $' + b.cost + 'M' +
                    ' <span style="font-size:7px;color:#a0a0c0">($' + b.maintenance + 'M/mo)</span></div>' +
                    '<div class="decision-option-desc">' + b.description + '</div>' +
                    producesHtml + reqText;

                if (canBuild && meetsReqs) {
                    optEl.addEventListener('click', function() {
                        panel.style.display = 'none';
                        state.paused = false;
                        Renderer.setPlacementMode(b.id, isTown);
                        showToast('Click on the ground to place ' + b.name, 'info');
                    });
                }

                options.appendChild(optEl);
            });
        }

        // Close button
        var closeBtn = document.createElement('div');
        closeBtn.className = 'decision-option';
        closeBtn.style.textAlign = 'center';
        closeBtn.innerHTML = '<div class="decision-option-title">CLOSE</div>';
        closeBtn.addEventListener('click', function() {
            panel.style.display = 'none';
            state.paused = false;
        });
        options.appendChild(closeBtn);

        panel.style.display = 'flex';
    }

    function placeBuilding(buildingId, worldX, isTown) {
        State.addBuilding(buildingId, worldX, isTown);
    }

    function showAbilityMenu() {
        var state = State.get();
        var charData = GAME.DATA.CHARACTERS[state.characterId];
        if (!charData) return;

        var panel = document.getElementById('decision-panel');
        var title = document.getElementById('decision-title');
        var desc = document.getElementById('decision-description');
        var options = document.getElementById('decision-options');

        state.paused = true;

        title.textContent = charData.name + ' — ABILITIES';
        desc.textContent = '"' + charData.philosophy + '"';

        options.innerHTML = '';

        // Passive
        var passiveEl = document.createElement('div');
        passiveEl.className = 'decision-option';
        passiveEl.style.borderColor = '#44ff88';
        passiveEl.innerHTML =
            '<div class="decision-option-title" style="color:#44ff88">PASSIVE: ' + charData.abilities.passive.name + '</div>' +
            '<div class="decision-option-desc">' + charData.abilities.passive.desc + '</div>' +
            '<div class="decision-option-effects"><span class="effect-positive">Always active</span></div>';
        options.appendChild(passiveEl);

        // Active
        var activeEl = document.createElement('div');
        activeEl.className = 'decision-option';
        var canUseActive = true;
        if (charData.abilities.active.cost) {
            for (var k in charData.abilities.active.cost) {
                if ((state[k] || 0) < charData.abilities.active.cost[k]) canUseActive = false;
            }
        }
        if (!canUseActive) activeEl.style.opacity = '0.4';
        activeEl.innerHTML =
            '<div class="decision-option-title" style="color:#ffdd44">ACTIVE: ' + charData.abilities.active.name + '</div>' +
            '<div class="decision-option-desc">' + charData.abilities.active.desc + '</div>' +
            '<div class="decision-option-effects">' +
            (charData.abilities.active.cost ? '<span class="effect-negative">Cost: ' + JSON.stringify(charData.abilities.active.cost).replace(/[{}\"]/g, '') + '</span>' : '') +
            '</div>';
        if (canUseActive) {
            activeEl.addEventListener('click', function() {
                useActiveAbility(charData);
                panel.style.display = 'none';
                state.paused = false;
            });
        }
        options.appendChild(activeEl);

        // Ultimate
        var ultEl = document.createElement('div');
        ultEl.className = 'decision-option';
        var canUseUlt = charData.abilities.ultimate.usesRemaining > 0;
        if (!canUseUlt) ultEl.style.opacity = '0.4';
        ultEl.innerHTML =
            '<div class="decision-option-title" style="color:#ff4444">ULTIMATE: ' + charData.abilities.ultimate.name + '</div>' +
            '<div class="decision-option-desc">' + charData.abilities.ultimate.desc + '</div>' +
            '<div class="decision-option-effects"><span class="' + (canUseUlt ? 'effect-positive' : 'effect-negative') + '">Uses remaining: ' + charData.abilities.ultimate.usesRemaining + '</span></div>';
        if (canUseUlt) {
            ultEl.addEventListener('click', function() {
                useUltimateAbility(charData);
                panel.style.display = 'none';
                state.paused = false;
            });
        }
        options.appendChild(ultEl);

        // Catchphrases
        var quoteEl = document.createElement('div');
        quoteEl.className = 'decision-option';
        quoteEl.style.borderColor = charData.color;
        var randomQuote = charData.catchphrases[Math.floor(Math.random() * charData.catchphrases.length)];
        quoteEl.innerHTML = '<div class="decision-option-desc" style="text-align:center; color:' + charData.color + ';">"' + randomQuote + '"</div>';
        options.appendChild(quoteEl);

        // Close
        var closeBtn = document.createElement('div');
        closeBtn.className = 'decision-option';
        closeBtn.style.textAlign = 'center';
        closeBtn.innerHTML = '<div class="decision-option-title">CLOSE</div>';
        closeBtn.addEventListener('click', function() {
            panel.style.display = 'none';
            state.paused = false;
        });
        options.appendChild(closeBtn);

        panel.style.display = 'flex';
    }

    function useActiveAbility(charData) {
        var state = State.get();
        var cost = charData.abilities.active.cost;
        if (cost) {
            for (var k in cost) {
                State.adjust(k, -cost[k]);
            }
        }

        switch (state.characterId) {
            case 'dario':
                state.safetyLockTurnsRemaining = 5;
                State.adjust('safety', 10);
                showToast('Safety Lock activated! +10 Safety for 5 months.', 'success');
                State.addLog('Used Safety Lock — preventing unsafe deployments.', 'positive');
                break;
            case 'sam':
                State.adjust('adp', 30);
                if (Math.random() > 0.5) {
                    State.adjust('safety', -5);
                    showToast('Rapid Iteration: +30 ADP but safety concerns!', 'warning');
                } else {
                    showToast('Rapid Iteration: +30 ADP! No issues this time.', 'success');
                }
                break;
            case 'yann':
                if (state.insightTokens > 0) {
                    state.insightTokens--;
                    State.adjust('research', 15);
                    showToast('Skeptical Analysis: +15 Research from Insight Token!', 'success');
                }
                break;
            case 'elon':
                var correct = Math.random() > 0.3;
                if (correct) {
                    State.adjust('safety', 5);
                    showToast('Paranoia Detection: Correctly identified a hidden threat! +5 Safety', 'success');
                } else {
                    State.adjust('cooperation', -3);
                    showToast('Paranoia Detection: False alarm! -3 Cooperation (it was just Demis playing chess)', 'warning');
                }
                break;
            case 'demis':
                State.adjust('research', 10);
                State.adjust('adp', 10);
                State.adjust('cooperation', -3);
                showToast('AlphaPredict: Optimized strategy! +10 Research, +10 ADP, -3 Cooperation', 'info');
                break;
        }
    }

    function useUltimateAbility(charData) {
        charData.abilities.ultimate.usesRemaining--;
        var state = State.get();

        switch (state.characterId) {
            case 'dario':
                State.adjust('safety', 20);
                State.adjust('internationalRelations', 15);
                State.adjust('cooperation', 15);
                showToast('CONSTITUTIONAL CONVENTION! Global AI safety standards established!', 'success');
                State.addLog('ULTIMATE: Constitutional Convention — permanent safety standards!', 'positive');
                break;
            case 'sam':
                State.adjust('adp', 100);
                State.adjust('research', 30);
                showToast('EXPONENTIAL SCALING! All systems upgraded! +100 ADP!', 'success');
                break;
            case 'yann':
                State.adjust('research', 50);
                showToast('PARADIGM SHIFT! New research paradigm unlocked! +50 Research!', 'success');
                break;
            case 'elon':
                State.adjust('safety', 15);
                showToast('MARS INSURANCE! Colony backup established! New victory path!', 'success');
                break;
            case 'demis':
                showToast('PERFECT OPTIMIZATION! All hidden information revealed!', 'success');
                break;
        }

        Sound.playSuccess();
    }

    function handleDialogueEffect(effect) {
        switch (effect) {
            case 'cookie_kitchen':
                placeBuilding('cookie_kitchen', false);
                break;
            case 'small_lab':
                placeBuilding('small_lab', false);
                break;
            case 'both':
                placeBuilding('small_lab', false);
                setTimeout(function() { placeBuilding('cookie_kitchen', false); }, 100);
                break;
            case 'deployment_center':
                placeBuilding('deployment_center', false);
                break;
            case 'large_lab':
                placeBuilding('large_lab', false);
                break;
            case 'scale_fast':
                placeBuilding('deployment_center', false);
                State.adjust('safety', -5);
                break;
            case 'safety_dept':
                placeBuilding('safety_dept', false);
                break;
            case 'data_center':
                placeBuilding('data_center', false);
                break;
            case 'mars_plan':
                State.adjust('safety', 3);
                State.adjust('politicalCapital', -10);
                showToast('Mars contingency planning initiated...', 'info');
                break;
            case 'cooperation_up':
                State.adjust('internationalRelations', 5);
                State.adjust('cooperation', 5);
                break;
            case 'cooperation_slight':
                State.adjust('internationalRelations', 2);
                break;
            case 'cooperation_down':
                State.adjust('internationalRelations', -5);
                break;
            case 'research_up':
                State.adjust('research', 8);
                State.adjust('cooperation', 5);
                break;
            case 'optimize_campus':
                State.adjust('compute', 10);
                State.adjust('research', 5);
                break;
            case 'demis_sad':
                State.adjust('cooperation', -3);
                showToast('Demis: "I was only trying to help. Suboptimally, apparently."', 'info');
                break;
            case 'elon_vindicated':
                State.adjust('cooperation', -8);
                showToast('Elon: "I KNEW IT! Page 23 of my dossier predicted this EXACTLY!"', 'warning');
                break;
            case 'elon_dossier':
                State.adjust('safety', 2);
                State.adjust('cooperation', -3);
                break;
            case 'elon_rage':
                State.adjust('cooperation', -5);
                showToast('Elon: "Chess PRODIGY?! That\'s EXACTLY what a Bond villain would be!"', 'warning');
                break;
            case 'public_wrong':
                State.adjust('publicTrust', 5);
                State.adjust('safety', -2);
                break;
            case 'public_explain':
                State.adjust('publicTrust', 2);
                State.adjust('politicalCapital', -5);
                break;
            case 'public_cry':
                State.adjust('publicTrust', -2);
                break;
            case 'quip_yann':
                showToast('Yann is writing a 47-tweet thread about why you\'re wrong.', 'info');
                break;
        }
    }

    // ---- SCREEN MANAGEMENT ----

    function showScreen(screenId) {
        currentScreen = screenId;
        document.querySelectorAll('.screen').forEach(function(s) {
            s.classList.remove('active');
        });
        var target = document.getElementById(screenId === 'game' ? 'game-screen' : screenId === 'title' ? 'title-screen' : 'character-select');
        if (target) target.classList.add('active');
    }

    // ---- TOAST NOTIFICATIONS ----

    function showToast(text, type) {
        var container = document.getElementById('toast-container');
        var toast = document.createElement('div');
        toast.className = 'toast toast-' + (type || 'info');
        toast.textContent = text;
        container.appendChild(toast);

        setTimeout(function() {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 5000);
    }

    // ---- ENDGAME SCREEN ----

    var EPILOGUES = {
        dario: {
            abundance: "Dario's cookie diplomacy is now studied at Harvard. The UN renamed its AI safety framework 'The Snickerdoodle Accords.' He cried. Twice.",
            utopia: "Every AI system runs on Dario's Constitutional principles. He formed a committee to celebrate. The committee formed a sub-committee. Everyone brought cookies.",
            singularity: "The singularity arrived, and it was polite. Dario's safety culture meant the AI said 'please' and 'thank you.' Cameron Howe would be proud.",
            beloved: "Abundance Bay elected Dario honorary mayor. He declined, formed a committee, and appointed the committee as mayor instead.",
            defeat: "Dario retreated to his cookie kitchen. The cookies are still excellent. The rest is... a learning opportunity."
        },
        sam: {
            abundance: "Sam described the outcome as 'exponentially exponential.' His celebration whiteboard ran out of space for hockey-stick charts. He ordered a bigger whiteboard.",
            utopia: "Sam achieved the impossible: a utopia that scales. His 1,000-year plan is now a 10,000-year plan. He updates it hourly.",
            singularity: "The singularity was exactly as exponential as Sam predicted. He immediately asked it to solve mortality. It said 'Give me a week.' Joe MacMillan would approve.",
            beloved: "The town loves Sam. Mainly because property values went up 4,000%. He calls it 'exponential real estate.' Nobody corrects him.",
            defeat: "Sam pivoted to calling the failure an 'exponential learning experience.' His next venture: exponential failure consulting."
        },
        yann: {
            abundance: "Yann published 47 papers proving the abundance was 'statistically inevitable.' He is accepting no congratulations until someone peer-reviews his methodology.",
            utopia: "Yann declared the utopia 'acceptable but requiring further analysis.' He then published a paper titled 'Why Everything Is Actually Fine But Nobody Listened.' It got 2 citations.",
            singularity: "Yann looked at the singularity and said: 'Show me the data.' The singularity showed him the data. He found 3 statistical errors. The singularity apologized.",
            beloved: "The town loves Yann despite him regularly telling them their enthusiasm is 'anecdotal, not evidence-based.' They find this endearing. He finds this irrational.",
            defeat: "Yann published a paper titled 'I Told You So: A Comprehensive Analysis.' It is 400 pages long, extensively cited, and nobody will read it."
        },
        elon: {
            abundance: "Elon celebrated by upgrading his Faraday cage to a Faraday mansion. Then a Faraday neighborhood. He's still watching Demis through binoculars.",
            utopia: "Elon's utopia includes mandatory paranoia training and chess-free zones. Demis is technically welcome but 'under observation.'",
            singularity: "The singularity confirmed Elon's suspicions: Demis WAS playing chess at a suspicious level. It also confirmed that chess is not, in fact, a cover for world domination.",
            beloved: "Abundance Bay adores Elon. The statue they built includes a tiny Faraday cage. He lives in it.",
            defeat: "Elon retreated to Mars. The Mars colony AI is based on Demis's work. Elon pretends not to notice."
        },
        demis: {
            abundance: "Demis optimized the celebration to be 34% more efficient. Nobody asked him to. The optimized party was, objectively, better. People found this unsettling.",
            utopia: "Everything runs perfectly. Suspiciously perfectly. Elon has upgraded his dossier to 94 pages. Demis has optimized Elon's surveillance schedule for him.",
            singularity: "The singularity plays chess. Of course it does. Demis plays it every Tuesday. He's winning 52% of the time. He considers this 'room for improvement.'",
            beloved: "Demis optimized the town's gratitude to be 23% more sincere. Nobody knows what that means. The optimized thank-you cards are genuinely touching.",
            defeat: "Demis calculated the probability of failure as 0.003%. He is recalibrating his models. The parking lot, at least, remains perfectly optimized."
        }
    };

    function showEndgameScreen(data, state) {
        var panel = document.getElementById('decision-panel');
        var titleEl = document.getElementById('decision-title');
        var desc = document.getElementById('decision-description');
        var options = document.getElementById('decision-options');

        var isVictory = data.type === 'victory';
        var charId = state.characterId;
        var charData = GAME.DATA.CHARACTERS[charId];

        titleEl.textContent = isVictory ? data.reason : 'GAME OVER';
        titleEl.style.color = isVictory ? '#44ff88' : '#ff4444';

        var epilogueKey = isVictory ? (data.ending || 'abundance') : 'defeat';
        var epilogue = EPILOGUES[charId] ? EPILOGUES[charId][epilogueKey] : '';

        var yearsPlayed = state.year - 2025;
        var buildingsTotal = state.buildings.length + state.townBuildings.length;

        var grade = 'F';
        if (isVictory) {
            var score = Math.floor(state.adp) + Math.floor(state.safety) + Math.floor(state.townMood) + Math.floor(state.townPopulation / 100);
            if (score > 800) grade = 'S';
            else if (score > 600) grade = 'A';
            else if (score > 400) grade = 'B';
            else grade = 'C';
        } else {
            if (yearsPlayed > 15) grade = 'C';
            else if (yearsPlayed > 10) grade = 'D';
        }

        var statsText = (isVictory ? '' : (data.reason + '\n\n')) +
            '━━━━ FINAL REPORT ━━━━\n\n' +
            'Leader: ' + charData.name + ' (' + charData.org + ')\n' +
            'Years Active: ' + yearsPlayed + ' (' + state.year + ')\n' +
            'Grade: ' + grade + '\n\n' +
            'ADP Generated: ' + Math.floor(state.totalADPGenerated) + '\n' +
            'Current ADP: ' + Math.floor(state.adp) + '\n' +
            'Safety Rating: ' + Math.floor(state.safety) + '\n' +
            'Town Mood: ' + Math.floor(state.townMood) + '\n' +
            'Town Population: ' + Math.floor(state.townPopulation) + '\n' +
            'Buildings: ' + buildingsTotal + '\n' +
            'Money Spent: $' + Math.floor(state.totalMoneySpent) + 'M\n' +
            'Crises Handled: ' + state.totalCrisesHandled + '\n' +
            'Peak Safety: ' + Math.floor(state.peakSafety) + '\n\n';

        if (epilogue) {
            statsText += '━━━━ EPILOGUE ━━━━\n\n' + epilogue;
        }

        desc.textContent = statsText;
        desc.style.whiteSpace = 'pre-wrap';

        options.innerHTML = '';

        if (isVictory) {
            Sound.playSuccess();
        }

        var playAgainBtn = document.createElement('div');
        playAgainBtn.className = 'decision-option';
        playAgainBtn.innerHTML = '<div class="decision-option-title" style="text-align:center;color:#44ff88">PLAY AGAIN</div>';
        playAgainBtn.addEventListener('click', function() {
            panel.style.display = 'none';
            titleEl.style.color = '';
            desc.style.whiteSpace = '';
            localStorage.removeItem('gora_save');
            showScreen('title');
        });
        options.appendChild(playAgainBtn);

        var titleBtn = document.createElement('div');
        titleBtn.className = 'decision-option';
        titleBtn.innerHTML = '<div class="decision-option-title" style="text-align:center">TITLE SCREEN</div>';
        titleBtn.addEventListener('click', function() {
            panel.style.display = 'none';
            titleEl.style.color = '';
            desc.style.whiteSpace = '';
            showScreen('title');
        });
        options.appendChild(titleBtn);

        panel.style.display = 'flex';
    }

    // ---- BOOT ----

    window.addEventListener('DOMContentLoaded', init);

})();
