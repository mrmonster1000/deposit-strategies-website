window.GAME = window.GAME || {};
window.GAME.Systems = window.GAME.Systems || {};

GAME.Systems.Tutorial = (function() {
    'use strict';

    var State = GAME.Systems.State;
    var step = 0;
    var completed = false;
    var shownSteps = {};
    var checkInterval = null;

    var TIPS = [
        {
            id: 'build_first',
            condition: function(s) { return s.gameTime >= 2 && s.buildings.length === 0; },
            text: 'TIP: Click BUILD CAMPUS to place your first building. A Research Lab will start generating research points.',
            delay: 0
        },
        {
            id: 'need_power',
            condition: function(s) { return s.buildings.length >= 1 && !s.buildingCounts.power_plant && s.gameTime >= 10; },
            text: 'TIP: Build a Power Plant to unlock compute power. You need both research AND compute to generate ADP.',
            delay: 0
        },
        {
            id: 'need_compute',
            condition: function(s) { return s.research > 3 && s.compute < 1 && s.gameTime >= 20; },
            text: 'TIP: Research is flowing! Now build a Data Center to generate compute. ADP = research × compute × safety.',
            delay: 0
        },
        {
            id: 'first_adp',
            condition: function(s) { return s.adp > 0.5; },
            text: 'TIP: ADP is climbing! Keep building to stay ahead of rival AI labs. Check the RIVALS panel on the right.',
            delay: 0
        },
        {
            id: 'low_funds',
            condition: function(s) { return s.money < 40 && s.gameTime >= 15; },
            text: 'TIP: Funds running low! Each building has maintenance costs. Watch the income rate (top left) — deploy AI products to boost revenue.',
            delay: 0
        },
        {
            id: 'build_town',
            condition: function(s) { return s.townMood < 45 && s.gameTime >= 30; },
            text: 'TIP: Town mood is dropping! Click BUILD TOWN to invest in Abundance Bay. Happy towns attract talent and boost cooperation.',
            delay: 0
        },
        {
            id: 'use_ability',
            condition: function(s) { return s.gameTime >= 50 && !shownSteps.use_ability; },
            text: 'TIP: Click ABILITY to use your character\'s special powers. Each leader has unique abilities with cooldowns.',
            delay: 0
        },
        {
            id: 'phase_coming',
            condition: function(s) { return s.gameTime >= 1500 && s.phase === 1; },
            text: 'TIP: Phase 2 "Expansion" begins at Year 2030. Build aggressively to prepare — new buildings and events unlock!',
            delay: 0
        }
    ];

    function init() {
        step = 0;
        completed = false;
        shownSteps = {};

        if (checkInterval) clearInterval(checkInterval);
        checkInterval = setInterval(checkTips, 5000);
    }

    function checkTips() {
        if (completed) return;
        var state = State.get();
        if (!state || state.paused) return;

        for (var i = 0; i < TIPS.length; i++) {
            var tip = TIPS[i];
            if (shownSteps[tip.id]) continue;
            if (tip.condition(state)) {
                shownSteps[tip.id] = true;
                showTip(tip.text);
                break;
            }
        }

        var allShown = TIPS.every(function(t) { return shownSteps[t.id]; });
        if (allShown) {
            completed = true;
            clearInterval(checkInterval);
        }
    }

    function showTip(text) {
        var container = document.getElementById('toast-container');
        if (!container) return;
        var toast = document.createElement('div');
        toast.className = 'toast toast-tutorial';
        toast.textContent = text;
        container.appendChild(toast);
        setTimeout(function() {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 8000);
    }

    return {
        init: init,
        checkTips: checkTips
    };
})();
