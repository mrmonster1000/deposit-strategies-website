window.GAME = window.GAME || {};
window.GAME.Systems = window.GAME.Systems || {};

GAME.Systems.AIOpponents = (function() {
    'use strict';

    var State = GAME.Systems.State;
    var visitCooldown = 0;
    var townsfolkCooldown = 0;

    function update(dt) {
        var state = State.get();
        if (!state || state.paused) return;

        visitCooldown -= dt;
        if (visitCooldown <= 0) {
            visitCooldown = 20000 + Math.random() * 40000;
            maybeVisit();
        }

        townsfolkCooldown -= dt;
        if (townsfolkCooldown <= 0) {
            townsfolkCooldown = 12000 + Math.random() * 18000;
            maybeTownsfolkVisit();
        }
    }

    function maybeVisit() {
        var state = State.get();
        if (!state || state.paused) return;

        var competitors = Object.keys(state.competitors);
        if (competitors.length === 0) return;

        if (Math.random() > 0.5) return;

        var visitorId = competitors[Math.floor(Math.random() * competitors.length)];
        var comp = state.competitors[visitorId];

        if (state.gameTime - comp.lastVisit < 30) return;
        comp.lastVisit = state.gameTime;

        var dialogueId = 'visit_' + visitorId;
        if (GAME.DATA.DIALOGUES[dialogueId] && !state.eventsTriggered['visit_' + visitorId + '_' + state.phase]) {
            state.eventsTriggered['visit_' + visitorId + '_' + state.phase] = true;
            GAME.Systems.Dialogue.startDialogue(dialogueId);
            return;
        }

        var charData = GAME.DATA.CHARACTERS[visitorId];
        if (!charData) return;

        var quote = charData.catchphrases[Math.floor(Math.random() * charData.catchphrases.length)];
        showVisitToast(charData, quote);
    }

    function maybeTownsfolkVisit() {
        var state = State.get();
        if (!state || state.paused) return;

        var townsfolk = GAME.DATA.TOWN.townsfolk;
        var ids = Object.keys(townsfolk);
        if (ids.length === 0) return;

        var npcId = ids[Math.floor(Math.random() * ids.length)];
        var npc = townsfolk[npcId];

        var quote = npc.quotes[Math.floor(Math.random() * npc.quotes.length)];

        var moodWord = '';
        if (state.townMood >= 75) moodWord = 'happy';
        else if (state.townMood >= 50) moodWord = 'neutral';
        else if (state.townMood >= 25) moodWord = 'worried';
        else moodWord = 'angry';

        if (moodWord === 'angry' && npc.mood < 50) {
            var angryQuotes = [
                npc.name.split(' ')[0] + " isn't happy about how things are going around here.",
                "\"This isn't what we were promised!\" — " + npc.name.split(' ')[0],
                npc.name.split(' ')[0] + " has been organizing meetings. That can't be good."
            ];
            quote = angryQuotes[Math.floor(Math.random() * angryQuotes.length)];
        }

        showTownsfolkToast(npc, quote);
    }

    function showTownsfolkToast(npc, quote) {
        var container = document.getElementById('toast-container');
        var toast = document.createElement('div');
        toast.className = 'toast toast-town';
        var firstName = npc.name.split(' ')[0];
        if (npc.name.indexOf('"') !== -1) {
            firstName = npc.name.match(/"([^"]+)"/)[1];
        }
        toast.innerHTML = '<strong style="color:' + npc.color + '">' + firstName + ' (' + npc.role.split('—')[0].trim() + '):</strong> "' + quote + '"';

        container.appendChild(toast);
        setTimeout(function() {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 6000);

        State.addLog(firstName + ': "' + quote.substring(0, 45) + '..."', 'town');
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
