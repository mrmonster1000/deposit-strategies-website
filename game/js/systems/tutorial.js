window.GAME = window.GAME || {};
window.GAME.Systems = window.GAME.Systems || {};

GAME.Systems.Tutorial = (function() {
    'use strict';

    var State = GAME.Systems.State;
    var completed = false;
    var shownSteps = {};
    var checkInterval = null;
    var guidedStep = 0;
    var guidedActive = false;
    var highlightEl = null;

    var GUIDED_STEPS = [
        {
            id: 'welcome',
            text: "Welcome to Abundance Bay! You're building an AI lab in a small coastal town. Let's get started.",
            highlight: null,
            waitFor: null
        },
        {
            id: 'unpause',
            text: "Click PLAY to start time flowing. The simulation runs in real-time — you can pause anytime.",
            highlight: '#btn-pause',
            waitFor: function(s) { return !s.paused; }
        },
        {
            id: 'build_lab',
            text: "Click BUILD CAMPUS to construct your first Research Lab. Research is the foundation of everything you'll do.",
            highlight: '[data-action="build-campus"]',
            waitFor: function(s) { return s.buildings.length >= 1; }
        },
        {
            id: 'explain_stats',
            text: "Great! Check your stats on the left: FUNDS pay for buildings, ADP measures your AI capability, SAFETY keeps things under control. Balance all three to win.",
            highlight: '#player-stats',
            waitFor: null
        },
        {
            id: 'build_power',
            text: "Now build a Power Plant. You'll need electricity for Data Centers, which generate the compute power to turn research into ADP.",
            highlight: '[data-action="build-campus"]',
            waitFor: function(s) { return !!s.buildingCounts.power_plant; }
        },
        {
            id: 'rivals',
            text: "Your rivals are growing too! Check the RIVALS panel on the right — each competitor has their own strategy and personality.",
            highlight: '#competitor-panel',
            waitFor: null
        },
        {
            id: 'town',
            text: "Don't forget Abundance Bay! Click BUILD TOWN to invest in the community. Happy towns provide bonuses; angry towns revolt.",
            highlight: '[data-action="build-town"]',
            waitFor: function(s) { return s.townBuildings.length >= 1; }
        },
        {
            id: 'npcs',
            text: "Click on town residents to talk to them. They'll teach you about AI governance and their conversations affect your stats.",
            highlight: null,
            waitFor: null
        },
        {
            id: 'abilities',
            text: "Your character has special ABILITIES. Click the POWERS button to see your passive, active, and ultimate powers.",
            highlight: '[data-action="ability"]',
            waitFor: null
        },
        {
            id: 'goal',
            text: "Your goal: reach ADP 500 with Safety 60+ and Town Mood 70+ for Radical Abundance. Good luck — the AI race is on!",
            highlight: null,
            waitFor: null
        }
    ];

    var TIPS = [
        {
            id: 'need_compute',
            condition: function(s) { return s.research > 5 && s.compute < 1 && s.gameTime >= 20 && !!s.buildingCounts.power_plant; },
            text: 'TIP: You have research and power but no compute. Build a Data Center! ADP = research × compute × safety.'
        },
        {
            id: 'first_adp',
            condition: function(s) { return s.adp > 1; },
            text: 'TIP: ADP is climbing! Your AI capability is growing. Stay ahead of rivals to win.'
        },
        {
            id: 'low_funds',
            condition: function(s) { return s.money < 30 && s.gameTime >= 15; },
            text: 'TIP: Funds low! Building maintenance drains money. Build a Deployment Center to generate revenue from ADP.'
        },
        {
            id: 'town_angry',
            condition: function(s) { return s.townMood < 35 && s.gameTime >= 30; },
            text: 'TIP: Town mood is critical! Invest in Abundance Bay via BUILD TOWN or the town may revolt.'
        },
        {
            id: 'safety_low',
            condition: function(s) { return s.safety < 40 && s.gameTime >= 20; },
            text: 'TIP: Safety rating dangerously low! Build a Safety Department or face defeat if it drops below 30.'
        },
        {
            id: 'phase_coming',
            condition: function(s) { return s.year >= 2028 && s.phase === 1; },
            text: 'TIP: Phase 2 "Expansion" begins at 2030. New buildings and challenges unlock — build up reserves!'
        },
        {
            id: 'power_shortage',
            condition: function(s) { return s.powerUsed > 0 && s.power > 0 && s.powerUsed > s.power * 0.9; },
            text: 'TIP: Power grid near capacity! Build more Power Plants or a Fusion Reactor to avoid compute throttling.'
        },
        {
            id: 'save_reminder',
            condition: function(s) { return s.gameTime >= 100 && !shownSteps.save_reminder; },
            text: 'TIP: Remember to SAVE your game! Progress is stored in your browser.'
        },
        {
            id: 'explore_town',
            condition: function(s) { return s.gameTime >= 40 && !shownSteps.explore_town; },
            text: 'TIP: Scroll right to explore the town! Click on NPCs to have conversations. Use mouse wheel to zoom.'
        },
        {
            id: 'crisis_advice',
            condition: function(s) { return s.totalCrisesHandled >= 1 && !shownSteps.crisis_advice; },
            text: 'TIP: Crises get harder in later phases. Keep safety high and reserves ready for emergencies.'
        },
        {
            id: 'victory_close',
            condition: function(s) { return s.adp >= 300 && s.safety >= 50 && s.townMood >= 50; },
            text: 'TIP: Radical Abundance is within reach! You need ADP 500+, Safety 60+, Town Mood 70+.'
        }
    ];

    function init() {
        completed = false;
        shownSteps = {};
        guidedStep = 0;
        guidedActive = true;

        if (checkInterval) clearInterval(checkInterval);
        checkInterval = setInterval(checkAll, 3000);

        setTimeout(function() { showGuidedStep(); }, 1500);
    }

    function checkAll() {
        var state = State.get();
        if (!state) return;

        if (guidedActive) {
            checkGuidedProgress(state);
        } else if (!completed) {
            checkTips(state);
        }
    }

    function checkGuidedProgress(state) {
        var step = GUIDED_STEPS[guidedStep];
        if (!step) return;

        if (step.waitFor && step.waitFor(state)) {
            guidedStep++;
            if (guidedStep < GUIDED_STEPS.length) {
                showGuidedStep();
            } else {
                guidedActive = false;
                removeHighlight();
            }
        }
    }

    function showGuidedStep() {
        var step = GUIDED_STEPS[guidedStep];
        if (!step) return;

        removeHighlight();

        if (step.highlight) {
            var el = document.querySelector(step.highlight);
            if (el) {
                highlightEl = el;
                el.classList.add('tutorial-highlight');
            }
        }

        showTutorialToast(step.text, !step.waitFor);
    }

    function showTutorialToast(text, autoAdvance) {
        var container = document.getElementById('toast-container');
        if (!container) return;

        var existing = container.querySelectorAll('.toast-tutorial');
        existing.forEach(function(t) { if (t.parentNode) t.parentNode.removeChild(t); });

        var toast = document.createElement('div');
        toast.className = 'toast toast-tutorial';
        toast.textContent = text;

        if (autoAdvance) {
            var okBtn = document.createElement('span');
            okBtn.className = 'tutorial-ok';
            okBtn.textContent = ' [OK]';
            okBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                if (toast.parentNode) toast.parentNode.removeChild(toast);
                removeHighlight();
                guidedStep++;
                if (guidedStep < GUIDED_STEPS.length) {
                    setTimeout(showGuidedStep, 500);
                } else {
                    guidedActive = false;
                }
            });
            toast.appendChild(okBtn);
        }

        container.appendChild(toast);

        if (!autoAdvance) {
            setTimeout(function() {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 12000);
        }
    }

    function removeHighlight() {
        if (highlightEl) {
            highlightEl.classList.remove('tutorial-highlight');
            highlightEl = null;
        }
        var allHighlighted = document.querySelectorAll('.tutorial-highlight');
        allHighlighted.forEach(function(el) { el.classList.remove('tutorial-highlight'); });
    }

    function checkTips(state) {
        if (state.paused) return;

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
        }, 10000);
    }

    return {
        init: init,
        checkTips: function() { checkAll(); }
    };
})();
