window.GAME = window.GAME || {};
window.GAME.Systems = window.GAME.Systems || {};

GAME.Systems.State = (function() {
    'use strict';

    var state = null;
    var listeners = {};

    function createNew(characterId) {
        var charData = GAME.DATA.CHARACTERS[characterId];
        if (!charData) return null;

        state = {
            characterId: characterId,
            characterName: charData.name,
            characterOrg: charData.org,

            // Time
            gameTime: 0,
            day: 1,
            month: 1,
            year: 2025,
            speed: 1,
            paused: true,
            phase: 1,
            phaseName: 'Foundation',

            // Resources
            money: 200,
            moneyPerTick: 0,
            adp: 0,
            research: charData.startingStats.research || 0,
            compute: 0,
            chips: 0,
            power: 0,
            powerUsed: 0,

            // Meters (0-100)
            safety: charData.startingStats.safety || 60,
            publicTrust: 50,
            bankingStability: 75,
            climate: 60,
            socialCohesion: 70,
            internationalRelations: 65,
            politicalCapital: charData.startingStats.politicalCapital || 100,
            cooperation: 0,

            // Town
            townMood: GAME.DATA.TOWN.startingMood,
            townPopulation: GAME.DATA.TOWN.startingPopulation,

            // Talent
            talentRate: 2,
            totalTalent: 5,

            // Campus buildings
            buildings: [],
            buildingCounts: {},

            // Town buildings
            townBuildings: [],

            // Multipliers from character
            multipliers: Object.assign({}, charData.multipliers),

            // Competitors (other AI leaders)
            competitors: {},

            // Events & state tracking
            eventsTriggered: {},
            crisesActive: [],
            crisesResolved: [],
            flags: {},
            log: [],

            // Unlocks
            unlockedBuildings: ['small_lab', 'safety_dept', 'power_plant', 'talent_office', 'deployment_center', 'cookie_kitchen', 'diplomacy_wing'],
            unlockedTownBuildings: ['community_center', 'fiber_internet', 'pub_upgrade', 'town_beautification', 'fish_chip_shop', 'comedy_club'],

            // Abilities
            abilityCooldowns: {},
            insightTokens: 0,
            safetyLockTurnsRemaining: 0,

            // Stats for end game
            totalADPGenerated: 0,
            totalMoneySpent: 0,
            totalCrisesHandled: 0,
            peakSafety: charData.startingStats.safety || 60,
            peakTownMood: GAME.DATA.TOWN.startingMood,
            buildingsBuilt: 0
        };

        // Set up competitors
        var allChars = Object.keys(GAME.DATA.CHARACTERS);
        allChars.forEach(function(id) {
            if (id !== characterId && !GAME.DATA.CHARACTERS[id].locked) {
                state.competitors[id] = {
                    id: id,
                    name: GAME.DATA.CHARACTERS[id].name,
                    adp: 0,
                    safety: GAME.DATA.CHARACTERS[id].startingStats.safety,
                    relationship: 50,
                    lastVisit: 0
                };
            }
        });

        emit('stateCreated', state);
        return state;
    }

    function get() {
        return state;
    }

    function set(key, value) {
        if (!state) return;
        var old = state[key];
        state[key] = value;

        // Clamp meters
        var meters = ['safety', 'publicTrust', 'bankingStability', 'climate', 'socialCohesion', 'internationalRelations', 'townMood', 'politicalCapital', 'cooperation'];
        if (meters.indexOf(key) !== -1) {
            state[key] = Math.max(0, Math.min(100, state[key]));
        }
        if (key === 'money') {
            state[key] = Math.max(0, state[key]);
        }

        // Track peaks
        if (key === 'safety' && state[key] > state.peakSafety) state.peakSafety = state[key];
        if (key === 'townMood' && state[key] > state.peakTownMood) state.peakTownMood = state[key];

        emit('stateChanged', { key: key, oldValue: old, newValue: state[key] });
    }

    function adjust(key, delta) {
        if (!state) return;
        if (state[key] === undefined) {
            console.warn('State.adjust: unknown key "' + key + '"');
            return;
        }
        set(key, state[key] + delta);
    }

    function applyEffects(effects) {
        if (!effects) return;
        Object.keys(effects).forEach(function(key) {
            adjust(key, effects[key]);
        });
    }

    function addBuilding(buildingId, worldX, isTown) {
        var source = isTown ? GAME.DATA.TOWN.buildings : GAME.DATA.BUILDINGS;
        var bData = source[buildingId];
        if (!bData) return false;

        if (state.money < bData.cost) {
            emit('insufficientFunds', { building: bData });
            return false;
        }

        var placed = {
            type: buildingId,
            worldX: worldX,
            isTown: !!isTown,
            builtDay: state.day,
            builtYear: state.year,
            flavorIndex: 0
        };

        if (isTown) {
            state.townBuildings.push(placed);
        } else {
            state.buildings.push(placed);
        }

        state.money -= bData.cost;
        state.totalMoneySpent += bData.cost;
        state.buildingsBuilt++;

        if (!state.buildingCounts[buildingId]) {
            state.buildingCounts[buildingId] = 0;
        }
        state.buildingCounts[buildingId]++;

        emit('buildingPlaced', { building: bData, placed: placed });
        return true;
    }

    function checkRequirements(buildingId) {
        var bData = GAME.DATA.BUILDINGS[buildingId] || (GAME.DATA.TOWN && GAME.DATA.TOWN.buildings[buildingId]);
        if (!bData) return false;
        if (bData.cost > state.money) return false;
        if (bData.unlockPhase && bData.unlockPhase > state.phase) return false;
        if (bData.characterSpecific && bData.characterSpecific !== state.characterId) return false;
        if (bData.requires) {
            for (var req in bData.requires) {
                if ((state.buildingCounts[req] || 0) < bData.requires[req]) return false;
            }
        }
        return true;
    }

    function addLog(text, type) {
        var entry = {
            text: text,
            type: type || 'info',
            day: state.day,
            year: state.year,
            gameTime: state.gameTime
        };
        state.log.unshift(entry);
        if (state.log.length > 50) state.log.pop();
        emit('logAdded', entry);
    }

    function getDateString() {
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months[state.month - 1] + ' ' + state.year;
    }

    function getPhaseInfo() {
        var phases = [
            { name: 'Foundation', years: '2025-2030' },
            { name: 'Expansion', years: '2030-2035' },
            { name: 'Transformation', years: '2035-2040' },
            { name: 'Legacy', years: '2040-2045' },
            { name: 'Physical Liberation', years: '2045-2050' },
            { name: 'Self-Improvement', years: '2050-2055' }
        ];
        return phases[state.phase - 1] || phases[0];
    }

    // Simple event emitter
    function on(event, callback) {
        if (!listeners[event]) listeners[event] = [];
        listeners[event].push(callback);
    }

    function emit(event, data) {
        if (!listeners[event]) return;
        listeners[event].forEach(function(cb) {
            try { cb(data); } catch (e) { console.error('Event handler error:', e); }
        });
    }

    function save() {
        try {
            localStorage.setItem('gora_save', JSON.stringify(state));
            return true;
        } catch (e) {
            console.error('Save failed:', e);
            return false;
        }
    }

    function load() {
        try {
            var saved = localStorage.getItem('gora_save');
            if (saved) {
                state = JSON.parse(saved);
                emit('stateLoaded', state);
                return true;
            }
        } catch (e) {
            console.error('Load failed:', e);
        }
        return false;
    }

    function hasSave() {
        return !!localStorage.getItem('gora_save');
    }

    return {
        createNew: createNew,
        get: get,
        set: set,
        adjust: adjust,
        applyEffects: applyEffects,
        addBuilding: addBuilding,
        checkRequirements: checkRequirements,
        addLog: addLog,
        getDateString: getDateString,
        getPhaseInfo: getPhaseInfo,
        on: on,
        emit: emit,
        save: save,
        load: load,
        hasSave: hasSave
    };
})();
