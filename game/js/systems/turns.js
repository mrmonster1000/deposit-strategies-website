window.GAME = window.GAME || {};
window.GAME.Systems = window.GAME.Systems || {};

GAME.Systems.Simulation = (function() {
    'use strict';

    var State = GAME.Systems.State;
    var tickAccumulator = 0;
    var TICK_INTERVAL = 2000; // ms per game tick at 1x speed
    var lastQuipTime = 0;
    var QUIP_INTERVAL = 25000; // advisor quip every 25 seconds real-time
    var lastJokeTime = 0;
    var JOKE_INTERVAL = 40000; // comedian joke every 40 seconds real-time

    function update(dt) {
        var state = State.get();
        if (!state || state.paused) return;

        var speedMultiplier = state.speed;
        tickAccumulator += dt * speedMultiplier;

        while (tickAccumulator >= TICK_INTERVAL) {
            tickAccumulator -= TICK_INTERVAL;
            processTick();
        }

        // Advisor quips
        lastQuipTime += dt;
        if (lastQuipTime >= QUIP_INTERVAL) {
            lastQuipTime = 0;
            maybeShowQuip();
        }

        // Comedian jokes
        lastJokeTime += dt;
        if (lastJokeTime >= JOKE_INTERVAL) {
            lastJokeTime = 0;
            maybeShowJoke();
        }
    }

    function processTick() {
        var state = State.get();
        state.gameTime++;

        advanceDate();
        calculateProduction();
        processCompetitors();
        checkPhaseTransition();
        checkEventTriggers();
        checkCrisisTriggers();
        checkUnlocks();
        checkVictoryDefeat();
        if (GAME.Systems.Achievements) GAME.Systems.Achievements.check();
    }

    function advanceDate() {
        var state = State.get();
        state.day++;
        if (state.day > 30) {
            state.day = 1;
            state.month++;
            if (state.month > 12) {
                state.month = 1;
                state.year++;
                State.addLog('Year ' + state.year + ' begins.', 'info');
                yearlyEffects();
            }
            monthlyEffects();
        }
    }

    function calculateProduction() {
        var state = State.get();
        var production = {
            money: 5, // base income (increased from 3 for better early game)
            research: 0,
            compute: 0,
            power: 0,
            powerUsed: 0,
            adp: 0,
            safety: 0,
            townMood: 0,
            publicTrust: 0,
            talentRate: 0,
            cooperation: 0,
            chips: 0,
            socialCohesion: 0,
            internationalRelations: 0
        };

        // Calculate from campus buildings
        state.buildings.forEach(function(placed) {
            var bData = GAME.DATA.BUILDINGS[placed.type];
            if (!bData) return;
            production.money -= bData.maintenance / 30;
            if (bData.produces) {
                for (var key in bData.produces) {
                    if (production[key] !== undefined) {
                        production[key] += bData.produces[key] / 30;
                    }
                }
            }
            if (bData.powerDraw) {
                production.powerUsed += bData.powerDraw / 30;
            }
        });

        // Calculate from town buildings
        state.townBuildings.forEach(function(placed) {
            var bData = GAME.DATA.TOWN.buildings[placed.type];
            if (!bData) return;
            production.money -= bData.maintenance / 30;
            if (bData.produces) {
                for (var key in bData.produces) {
                    if (production[key] !== undefined) {
                        production[key] += bData.produces[key] / 30;
                    }
                }
            }
        });

        // Apply character multipliers
        var m = state.multipliers;
        production.research *= (m.capability || 1);
        production.safety *= (m.safety || 1);
        production.adp *= (m.deployment || 1);
        production.cooperation *= (m.cooperation || 1);

        // Power check: insufficient power reduces compute
        state.powerUsed = production.powerUsed * 30;
        if (production.powerUsed > production.power && state.buildings.length > 0) {
            var powerRatio = production.power / Math.max(0.01, production.powerUsed);
            production.compute *= powerRatio;
            if (Math.random() < 0.01) {
                State.addLog('Power shortage! Compute reduced to ' + Math.floor(powerRatio * 100) + '%', 'negative');
            }
        }

        // ADP generation formula: research * compute * safety factor
        var safetyFactor = Math.max(0.1, state.safety / 100);
        var computeFactor = Math.max(1, state.compute) / 8;
        var researchAdp = (production.research * computeFactor * safetyFactor) / 8;
        var trickleAdp = production.research * 0.05 * safetyFactor;
        production.adp += researchAdp + trickleAdp;

        // Apply production
        State.adjust('money', production.money);
        State.adjust('research', production.research);
        State.adjust('compute', production.compute * 30 - state.compute); // set compute level
        State.adjust('adp', production.adp);
        state.totalADPGenerated += production.adp;
        state.moneyPerTick = production.money;

        // Slow meter drift
        if (production.safety > 0) State.adjust('safety', production.safety * 0.1);
        if (production.townMood !== 0) State.adjust('townMood', production.townMood * 0.1);
        if (production.publicTrust !== 0) State.adjust('publicTrust', production.publicTrust * 0.05);
        if (production.socialCohesion !== 0) State.adjust('socialCohesion', production.socialCohesion * 0.05);
        if (production.internationalRelations !== 0) State.adjust('internationalRelations', production.internationalRelations * 0.05);
        if (production.cooperation > 0) State.adjust('internationalRelations', production.cooperation * 0.02);

        // Town mood affects public trust over time
        if (state.townMood > 70) State.adjust('publicTrust', 0.01);
        if (state.townMood < 30) State.adjust('publicTrust', -0.02);

        // Talent accumulation
        state.totalTalent += production.talentRate * 0.01;

        // Natural decay on some meters (things drift toward problems without attention)
        State.adjust('climate', -0.005);
        State.adjust('socialCohesion', -0.003);
    }

    function monthlyEffects() {
        var state = State.get();

        // Monthly money from ADP (deployment revenue)
        var adpRevenue = state.adp * 0.8;
        State.adjust('money', adpRevenue);

        // Town population growth based on mood
        if (state.townMood > 60) {
            state.townPopulation += Math.floor(state.townMood / 10);
        }

        // Safety passive (Dario)
        if (state.characterId === 'dario') {
            State.adjust('safety', 1);
        }

        // Yann insight tokens
        if (state.characterId === 'yann' && Math.random() < 0.2) {
            state.insightTokens++;
            State.addLog('Insight Token gained from basic research!', 'positive');
        }

        // Trump rally energy: extra political capital, lower safety awareness
        if (state.characterId === 'trump') {
            State.adjust('politicalCapital', 3);
            if (Math.random() < 0.15) {
                State.adjust('safety', -1);
            }
        }
    }

    function yearlyEffects() {
        var state = State.get();

        // Inflation / cost increase
        State.adjust('money', -20);

        // Phase transitions
        if (state.year >= 2030 && state.phase < 2) {
            state.phase = 2;
            state.phaseName = 'Expansion';
            State.addLog('PHASE 2: EXPANSION begins! New buildings and challenges unlocked.', 'info');
            State.emit('phaseChange', { phase: 2 });
        }
        if (state.year >= 2035 && state.phase < 3) {
            state.phase = 3;
            state.phaseName = 'Transformation';
            State.addLog('PHASE 3: TRANSFORMATION begins! The world is changing.', 'info');
            State.emit('phaseChange', { phase: 3 });
        }
        if (state.year >= 2040 && state.phase < 4) {
            state.phase = 4;
            state.phaseName = 'Legacy';
            State.addLog('PHASE 4: LEGACY begins! Your decisions echo through history.', 'info');
            State.emit('phaseChange', { phase: 4 });
        }
    }

    function processCompetitors() {
        var state = State.get();
        if (state.gameTime % 30 !== 0) return; // monthly competitor update

        for (var id in state.competitors) {
            var comp = state.competitors[id];
            var charData = GAME.DATA.CHARACTERS[id];
            if (!charData) continue;

            // Baseline passive growth (small — main growth comes from AI strategy actions)
            var growthRate = (charData.multipliers.capability + charData.multipliers.deployment) / 2;
            comp.adp += 0.5 * growthRate * (1 + state.phase * 0.2);
            comp.safety += (charData.multipliers.safety - 1) * 0.3;
            comp.safety = Math.max(20, Math.min(95, comp.safety));

            // Relationship drift toward neutral
            if (comp.relationship > 50) comp.relationship -= 0.1;
            if (comp.relationship < 50) comp.relationship += 0.1;
        }
    }

    function checkPhaseTransition() {
        var state = State.get();
        // Unlock new buildings when entering new phases
        if (state.phase >= 2 && state.unlockedBuildings.indexOf('chip_fab') === -1) {
            state.unlockedBuildings.push('chip_fab', 'mega_data_center', 'data_center', 'large_lab', 'poaching_dept', 'scale_center');
            state.unlockedTownBuildings.push('school_upgrade', 'medical_clinic', 'harbor_upgrade', 'housing_development', 'renewable_energy', 'ai_precinct');
        }
        if (state.phase >= 3 && state.unlockedBuildings.indexOf('robot_factory') === -1) {
            state.unlockedBuildings.push('robot_factory', 'fusion_reactor', 'advanced_chip_fab');
            state.unlockedTownBuildings.push('robot_police');
        }
        if (state.phase >= 4 && state.unlockedBuildings.indexOf('mars_launchpad') === -1) {
            state.unlockedBuildings.push('mars_launchpad');
        }
    }

    function checkEventTriggers() {
        var state = State.get();
        if (state.gameTime % 3 !== 0) return;

        // Check story events
        GAME.DATA.EVENTS.forEach(function(evt) {
            if (evt.type === 'quip') return;
            if (state.eventsTriggered[evt.id]) return;
            if (evt.phase && evt.phase > state.phase) return;
            if (evt.characterSpecific && evt.characterSpecific !== state.characterId) return;
            if (evt.triggerTime && state.gameTime < evt.triggerTime) return;

            // Trigger event
            state.eventsTriggered[evt.id] = true;
            State.emit('eventTriggered', evt);
        });

        // Check town events
        if (GAME.DATA.TOWN_EVENTS) {
            GAME.DATA.TOWN_EVENTS.forEach(function(evt) {
                if (state.eventsTriggered[evt.id]) return;
                if (evt.triggerTime && state.gameTime < evt.triggerTime) return;

                state.eventsTriggered[evt.id] = true;
                State.emit('townEventTriggered', evt);
            });
        }
    }

    function checkCrisisTriggers() {
        var state = State.get();
        if (state.gameTime % 30 !== 0) return;

        var baseChance = 0.10 + (state.phase - 1) * 0.05;

        // Modify by safety (lower safety = more crises)
        var safetyMod = (100 - state.safety) / 200;
        var crisisChance = baseChance + safetyMod;

        if (Math.random() > crisisChance) return;
        if (state.crisesActive.length >= 2) return; // max 2 simultaneous crises

        // Find eligible crisis
        var eligible = GAME.DATA.CRISES.filter(function(crisis) {
            if (state.crisesResolved.indexOf(crisis.id) !== -1) return false;
            if (state.crisesActive.some(function(c) { return c.id === crisis.id; })) return false;
            if (crisis.phase && crisis.phase > state.phase) return false;

            // Check tier probability
            if (crisis.tier === 'global' && Math.random() > 0.2) return false;
            if (crisis.tier === 'major' && Math.random() > 0.5) return false;

            // Check conditions
            if (crisis.triggerConditions) {
                var cond = crisis.triggerConditions;
                if (cond.minSafety !== undefined && state.safety < cond.minSafety) return false;
                if (cond.maxSafety !== undefined && state.safety > cond.maxSafety) return false;
                if (cond.minADP !== undefined && state.adp < cond.minADP) return false;
                if (cond.minResearch !== undefined && state.research < cond.minResearch) return false;
                if (cond.minDataCenters !== undefined && (state.buildingCounts['data_center'] || 0) < cond.minDataCenters) return false;
            }
            return true;
        });

        if (eligible.length === 0) return;

        var crisis = eligible[Math.floor(Math.random() * eligible.length)];
        state.crisesActive.push({ id: crisis.id, startTime: state.gameTime });
        State.emit('crisisTriggered', crisis);
    }

    function checkUnlocks() {
        var state = State.get();
        // Check if any new buildings should be unlocked based on counts
        for (var id in GAME.DATA.BUILDINGS) {
            var b = GAME.DATA.BUILDINGS[id];
            if (state.unlockedBuildings.indexOf(id) !== -1) continue;
            if (b.unlockPhase && b.unlockPhase <= state.phase && State.checkRequirements(id)) {
                if (state.unlockedBuildings.indexOf(id) === -1) {
                    state.unlockedBuildings.push(id);
                }
            }
        }
    }

    function checkVictoryDefeat() {
        var state = State.get();
        if (state.gameTime % 120 !== 0) return;

        // Defeat conditions
        if (state.money <= 0 && state.flags.brokeWarning) {
            State.emit('gameOver', { reason: 'You ran out of money! The campus is being repossessed. Betty is buying the cookie kitchen at auction.', type: 'defeat' });
            return;
        }
        if (state.money <= 0) {
            state.flags.brokeWarning = true;
            State.addLog('WARNING: Funds critically low!', 'negative');
        } else {
            state.flags.brokeWarning = false;
        }

        if (state.safety < 30 && state.flags.safetyWarning) {
            State.emit('gameOver', { reason: 'Safety Rating critical! AI systems have gone out of control. Frank was right all along.', type: 'defeat' });
            return;
        }
        if (state.safety < 30) {
            state.flags.safetyWarning = true;
            State.addLog('WARNING: Safety Rating dangerously low!', 'negative');
        } else {
            state.flags.safetyWarning = false;
        }

        if (state.bankingStability <= 5) {
            State.emit('gameOver', { reason: 'Banking system collapsed! The economy is in freefall. Even the AI bartender is panicking.', type: 'defeat' });
            return;
        }

        if (state.townMood <= 5) {
            State.emit('gameOver', { reason: 'The town has revolted! Abundance Bay wants you GONE. Frank is leading the mob with a pitchfork.', type: 'defeat' });
            return;
        }

        // Victory conditions
        // Radical Abundance: ADP 500+ AND townMood 70+ AND safety 60+
        if (state.adp >= 500 && state.townMood >= 70 && state.safety >= 60) {
            State.emit('gameOver', {
                reason: 'RADICAL ABUNDANCE ACHIEVED',
                type: 'victory',
                ending: 'abundance'
            });
            return;
        }

        // Safety Utopia: safety 95+ AND all meters above 70
        if (state.safety >= 95 && state.townMood >= 70 && state.bankingStability >= 70 &&
            state.climate >= 70 && state.socialCohesion >= 70 && state.internationalRelations >= 70) {
            State.emit('gameOver', {
                reason: 'SAFETY UTOPIA',
                type: 'victory',
                ending: 'utopia'
            });
            return;
        }

        // Tech Singularity: ADP 1000+
        if (state.adp >= 1000) {
            State.emit('gameOver', {
                reason: 'THE SINGULARITY',
                type: 'victory',
                ending: 'singularity'
            });
            return;
        }

        // Beloved Leader: townMood 95+ AND townPopulation 10000+
        if (state.townMood >= 95 && state.townPopulation >= 10000) {
            State.emit('gameOver', {
                reason: 'BELOVED LEADER OF ABUNDANCE BAY',
                type: 'victory',
                ending: 'beloved'
            });
            return;
        }

        // Progress warnings
        if (state.adp >= 300 && !state.flags.adpMilestone300) {
            state.flags.adpMilestone300 = true;
            State.addLog('ADP milestone: 300! Radical Abundance within reach at 500.', 'positive');
        }
        if (state.townPopulation >= 5000 && !state.flags.popMilestone5000) {
            state.flags.popMilestone5000 = true;
            State.addLog('Population milestone: 5,000! Abundance Bay is booming.', 'positive');
        }
    }

    function maybeShowQuip() {
        var state = State.get();
        if (!state || state.paused) return;

        var quips = GAME.DATA.EVENTS.filter(function(e) { return e.type === 'quip'; });
        if (quips.length === 0) return;

        var quip = quips[Math.floor(Math.random() * quips.length)];
        State.emit('advisorQuip', quip);
    }

    function maybeShowJoke() {
        var state = State.get();
        if (!state || state.paused) return;

        var comedian = GAME.DATA.TOWN && GAME.DATA.TOWN.townsfolk && GAME.DATA.TOWN.townsfolk.comedian_wright;
        if (!comedian || !comedian.quotes || comedian.quotes.length === 0) return;

        var joke = comedian.quotes[Math.floor(Math.random() * comedian.quotes.length)];
        State.emit('comedianJoke', { name: comedian.name, text: joke });
    }

    function setSpeed(speed) {
        var state = State.get();
        if (!state) return;
        state.speed = speed;
        State.emit('speedChanged', speed);
    }

    function togglePause() {
        var state = State.get();
        if (!state) return;
        state.paused = !state.paused;
        State.emit('pauseToggled', state.paused);
    }

    return {
        update: update,
        setSpeed: setSpeed,
        togglePause: togglePause,
        TICK_INTERVAL: TICK_INTERVAL
    };
})();
