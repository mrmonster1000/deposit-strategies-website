window.GAME = window.GAME || {};
window.GAME.Systems = window.GAME.Systems || {};

GAME.Systems.Achievements = (function() {
    'use strict';

    var State = GAME.Systems.State;
    var CHECK_INTERVAL = 60;

    function check() {
        var state = State.get();
        if (!state) return;
        if (state.gameTime % CHECK_INTERVAL !== 0) return;

        if (!state.achievements) state.achievements = {};

        GAME.DATA.ACHIEVEMENTS.forEach(function(ach) {
            if (state.achievements[ach.id]) return;
            try {
                if (ach.check(state)) {
                    state.achievements[ach.id] = {
                        unlockedAt: state.gameTime,
                        day: state.day,
                        year: state.year
                    };
                    State.emit('achievementUnlocked', ach);
                    State.addLog('Achievement: ' + ach.title, 'positive');
                }
            } catch (e) {
                // silently skip broken checks
            }
        });
    }

    function getAll() {
        var state = State.get();
        if (!state) return [];
        if (!state.achievements) state.achievements = {};

        return GAME.DATA.ACHIEVEMENTS.map(function(ach) {
            return {
                id: ach.id,
                title: ach.title,
                description: ach.description,
                icon: ach.icon,
                unlocked: !!state.achievements[ach.id],
                unlockedAt: state.achievements[ach.id] || null
            };
        });
    }

    function getUnlockedCount() {
        var state = State.get();
        if (!state || !state.achievements) return 0;
        return Object.keys(state.achievements).length;
    }

    return {
        check: check,
        getAll: getAll,
        getUnlockedCount: getUnlockedCount
    };
})();
