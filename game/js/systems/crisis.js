window.GAME = window.GAME || {};
window.GAME.Systems = window.GAME.Systems || {};

GAME.Systems.Crisis = (function() {
    'use strict';

    var State = GAME.Systems.State;

    function showCrisis(crisisData) {
        var panel = document.getElementById('crisis-panel');
        var title = document.getElementById('crisis-title');
        var tier = document.getElementById('crisis-tier');
        var desc = document.getElementById('crisis-description');
        var effects = document.getElementById('crisis-effects');
        var options = document.getElementById('crisis-options');

        // Pause game during crisis
        var state = State.get();
        var wasPaused = state.paused;
        state.paused = true;

        title.textContent = crisisData.title;
        tier.textContent = crisisData.tier.toUpperCase();
        tier.className = 'crisis-tier crisis-' + crisisData.tier;
        desc.textContent = crisisData.description;

        // Show immediate effects
        effects.innerHTML = '';
        if (crisisData.effects) {
            for (var key in crisisData.effects) {
                var val = crisisData.effects[key];
                var el = document.createElement('div');
                el.className = 'crisis-effect';
                el.innerHTML = '<span class="' + (val < 0 ? 'effect-negative' : 'effect-positive') + '">' +
                    key.replace(/([A-Z])/g, ' $1').toUpperCase() + ': ' + (val > 0 ? '+' : '') + val + '</span>';
                effects.appendChild(el);
            }
        }

        // Apply immediate effects
        State.applyEffects(crisisData.effects);

        // Show options
        options.innerHTML = '';
        crisisData.options.forEach(function(opt) {
            // Filter character-specific options
            if (opt.characterSpecific && opt.characterSpecific !== state.characterId) return;

            var optEl = document.createElement('div');
            optEl.className = 'decision-option';

            var effectsHtml = '';
            if (opt.effects) {
                var effectItems = [];
                for (var k in opt.effects) {
                    var v = opt.effects[k];
                    var cls = v >= 0 ? 'effect-positive' : 'effect-negative';
                    effectItems.push('<span class="' + cls + '">' + formatEffectName(k) + ': ' + (v > 0 ? '+' : '') + v + '</span>');
                }
                effectsHtml = '<div class="decision-option-effects">' + effectItems.join(' &bull; ') + '</div>';
            }

            optEl.innerHTML = '<div class="decision-option-title">' + opt.label + '</div>' +
                '<div class="decision-option-desc">' + opt.desc + '</div>' +
                effectsHtml;

            optEl.addEventListener('click', function() {
                resolveCrisis(crisisData, opt, wasPaused);
            });

            options.appendChild(optEl);
        });

        panel.style.display = 'flex';
        State.addLog('CRISIS: ' + crisisData.title, 'crisis');
    }

    function resolveCrisis(crisisData, chosenOption, wasPaused) {
        var state = State.get();

        // Apply option effects
        State.applyEffects(chosenOption.effects);

        // Remove from active crises
        state.crisesActive = state.crisesActive.filter(function(c) { return c.id !== crisisData.id; });
        state.crisesResolved.push(crisisData.id);
        state.totalCrisesHandled++;

        // Log resolution
        State.addLog('Resolved: ' + crisisData.title + ' — ' + chosenOption.label, 'positive');

        // Show comedy followup if exists
        if (chosenOption.comedyFollowup) {
            showFollowup(chosenOption.comedyFollowup, crisisData.title);
        } else if (chosenOption.educationalNote) {
            showFollowup(chosenOption.educationalNote, 'Insight');
        }

        // Hide crisis panel
        document.getElementById('crisis-panel').style.display = 'none';

        // Resume game
        if (!wasPaused) {
            state.paused = false;
        }

        State.emit('crisisResolved', { crisis: crisisData, choice: chosenOption });
    }

    function showFollowup(text, title) {
        GAME.Systems.Dialogue.showSimpleMessage(title, text);
    }

    function formatEffectName(key) {
        var names = {
            money: 'FUNDS',
            safety: 'SAFETY',
            publicTrust: 'TRUST',
            research: 'RESEARCH',
            adp: 'ADP',
            townMood: 'TOWN',
            socialCohesion: 'SOCIAL',
            internationalRelations: "INT'L",
            bankingStability: 'BANKING',
            climate: 'CLIMATE',
            cooperation: 'COOP',
            compute: 'COMPUTE',
            politicalCapital: 'POLITICAL',
            talentRate: 'TALENT'
        };
        return names[key] || key.toUpperCase();
    }

    return {
        showCrisis: showCrisis,
        formatEffectName: formatEffectName
    };
})();
