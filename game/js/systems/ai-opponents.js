window.GAME = window.GAME || {};
window.GAME.Systems = window.GAME.Systems || {};

GAME.Systems.AIOpponents = (function() {
    'use strict';

    var State = GAME.Systems.State;
    var visitCooldown = 0;

    function update(dt) {
        visitCooldown -= dt;
        if (visitCooldown <= 0) {
            visitCooldown = 30000 + Math.random() * 60000; // 30-90 seconds between visits
            maybeVisit();
        }
    }

    function maybeVisit() {
        var state = State.get();
        if (!state || state.paused) return;

        var competitors = Object.keys(state.competitors);
        if (competitors.length === 0) return;

        // Random competitor visits
        if (Math.random() > 0.4) return;

        var visitorId = competitors[Math.floor(Math.random() * competitors.length)];
        var comp = state.competitors[visitorId];

        // Don't visit too frequently
        if (state.gameTime - comp.lastVisit < 60) return;
        comp.lastVisit = state.gameTime;

        // Try structured dialogue first
        var dialogueId = 'visit_' + visitorId;
        if (GAME.DATA.DIALOGUES[dialogueId] && !state.eventsTriggered['visit_' + visitorId + '_' + state.phase]) {
            state.eventsTriggered['visit_' + visitorId + '_' + state.phase] = true;
            GAME.Systems.Dialogue.startDialogue(dialogueId);
            return;
        }

        // Otherwise use a random catchphrase
        var charData = GAME.DATA.CHARACTERS[visitorId];
        if (!charData) return;

        var quote = charData.catchphrases[Math.floor(Math.random() * charData.catchphrases.length)];
        showVisitToast(charData, quote);
    }

    function showVisitToast(charData, quote) {
        var container = document.getElementById('toast-container');
        var toast = document.createElement('div');
        toast.className = 'toast toast-info';
        toast.innerHTML = '<strong style="color:' + charData.color + '">' + charData.name.split(' ')[0] + ':</strong> "' + quote + '"';

        container.appendChild(toast);
        setTimeout(function() {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 5000);

        State.addLog(charData.name.split(' ')[0] + ' visited: "' + quote.substring(0, 40) + '..."', 'info');
    }

    function getCompetitorSummary() {
        var state = State.get();
        if (!state) return [];

        return Object.keys(state.competitors).map(function(id) {
            var comp = state.competitors[id];
            var charData = GAME.DATA.CHARACTERS[id];
            return {
                id: id,
                name: charData ? charData.name : id,
                shortName: charData ? charData.name.split(' ').pop() : id,
                adp: Math.floor(comp.adp),
                safety: Math.floor(comp.safety),
                relationship: Math.floor(comp.relationship),
                color: charData ? charData.color : '#888'
            };
        }).sort(function(a, b) { return b.adp - a.adp; });
    }

    return {
        update: update,
        getCompetitorSummary: getCompetitorSummary
    };
})();
