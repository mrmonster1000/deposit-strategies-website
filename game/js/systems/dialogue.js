window.GAME = window.GAME || {};
window.GAME.Systems = window.GAME.Systems || {};

GAME.Systems.Dialogue = (function() {
    'use strict';

    var State = GAME.Systems.State;
    var Renderer = GAME.Systems.Renderer;
    var currentDialogue = null;
    var currentNodeIndex = 0;
    var typewriterTimer = null;
    var typewriterText = '';
    var typewriterIndex = 0;
    var wasPaused = false;

    function startDialogue(dialogueId) {
        var dlg = GAME.DATA.DIALOGUES[dialogueId];
        if (!dlg) return;

        var state = State.get();
        wasPaused = state.paused;
        state.paused = true;

        currentDialogue = dlg;
        currentNodeIndex = 0;
        showNode(dlg.nodes[0]);
    }

    function showNode(node) {
        var panel = document.getElementById('dialogue-panel');
        var textEl = document.getElementById('dialogue-text');
        var choicesEl = document.getElementById('dialogue-choices');
        var leftPortrait = document.getElementById('dlg-portrait-left');
        var rightPortrait = document.getElementById('dlg-portrait-right');
        var leftName = document.getElementById('dlg-name-left');
        var rightName = document.getElementById('dlg-name-right');

        panel.style.display = 'flex';

        // Set up portraits
        var state = State.get();
        var speakerData = getSpeakerData(node.speaker);
        var playerData = GAME.DATA.CHARACTERS[state.characterId];

        // Left portrait = player
        Renderer.drawPortrait(state.characterId, leftPortrait, 80);
        leftName.textContent = playerData.name.split(' ')[0];

        // Right portrait = speaker
        if (speakerData.charId) {
            Renderer.drawPortrait(speakerData.charId, rightPortrait, 80);
        } else {
            drawGenericPortrait(rightPortrait, speakerData);
        }
        rightName.textContent = speakerData.displayName;

        // Highlight speaking portrait
        document.querySelector('.dlg-portrait.left').classList.toggle('speaking', node.speaker === state.characterId);
        document.querySelector('.dlg-portrait.right').classList.toggle('speaking', node.speaker !== state.characterId);

        // Set character class for colored border
        var frame = document.querySelector('.dialogue-frame');
        frame.className = 'dialogue-frame';
        if (speakerData.charId) {
            frame.classList.add('dialogue-' + speakerData.charId);
        }

        // Typewriter effect
        choicesEl.innerHTML = '';
        startTypewriter(textEl, node.text, function() {
            if (node.choices && node.choices.length > 0) {
                showChoices(node.choices, choicesEl);
            } else {
                showContinuePrompt(choicesEl);
            }
        });
    }

    function getSpeakerData(speakerId) {
        // Check main characters
        if (GAME.DATA.CHARACTERS[speakerId]) {
            return {
                charId: speakerId,
                displayName: GAME.DATA.CHARACTERS[speakerId].name.split(' ')[0]
            };
        }

        // Check townsfolk
        if (GAME.DATA.TOWN && GAME.DATA.TOWN.townsfolk[speakerId]) {
            var npc = GAME.DATA.TOWN.townsfolk[speakerId];
            return {
                charId: null,
                displayName: npc.name.split(' ')[0],
                portrait: npc.portrait,
                color: npc.color
            };
        }

        // Generic speakers
        var generics = {
            advisor: { displayName: 'Advisor', color: '#a0a0c0' },
            researcher: { displayName: 'Researcher', color: '#44aaff' },
            reporter: { displayName: 'Reporter', color: '#ff8844' },
            board_member: { displayName: 'Board Member', color: '#ffaa44' }
        };

        return generics[speakerId] || { displayName: speakerId, color: '#a0a0c0' };
    }

    function drawGenericPortrait(canvas, speakerData) {
        var ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        var s = canvas.width;
        var px = s / 16;

        ctx.clearRect(0, 0, s, s);
        ctx.fillStyle = '#1a1a3a';
        ctx.fillRect(0, 0, s, s);

        if (speakerData.portrait) {
            // Draw from portrait data
            var p = speakerData.portrait;
            ctx.fillStyle = p.shirtColor || '#404060';
            ctx.fillRect(px * 3, px * 12, px * 10, px * 4);
            ctx.fillStyle = p.skinTone || '#e8c890';
            ctx.fillRect(px * 6, px * 10, px * 4, px * 3);
            ctx.fillRect(px * 4, px * 3, px * 8, px * 8);
            ctx.fillStyle = p.hairColor || '#605040';
            ctx.fillRect(px * 4, px * 2, px * 8, px * 3);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(px * 5, px * 6, px * 3, px * 2);
            ctx.fillRect(px * 9, px * 6, px * 3, px * 2);
            ctx.fillStyle = '#202020';
            ctx.fillRect(px * 6, px * 6, px * 2, px * 2);
            ctx.fillRect(px * 10, px * 6, px * 2, px * 2);
            if (p.glasses) {
                ctx.strokeStyle = '#a0a0b0';
                ctx.lineWidth = 1;
                ctx.strokeRect(px * 4.5, px * 5.5, px * 3.5, px * 3);
                ctx.strokeRect(px * 8.5, px * 5.5, px * 3.5, px * 3);
            }
        } else {
            // Silhouette
            ctx.fillStyle = speakerData.color || '#5a5a8a';
            ctx.fillRect(px * 4, px * 3, px * 8, px * 8);
            ctx.fillRect(px * 3, px * 12, px * 10, px * 4);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(px * 6, px * 6, px * 2, px * 2);
            ctx.fillRect(px * 10, px * 6, px * 2, px * 2);
        }

        ctx.strokeStyle = speakerData.color || '#5a5a8a';
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, s - 2, s - 2);
    }

    function startTypewriter(element, text, onComplete) {
        if (typewriterTimer) clearInterval(typewriterTimer);
        typewriterText = text;
        typewriterIndex = 0;
        element.textContent = '';
        element.classList.add('typewriter');

        typewriterTimer = setInterval(function() {
            if (typewriterIndex < typewriterText.length) {
                element.textContent = typewriterText.substring(0, typewriterIndex + 1);
                typewriterIndex++;
            } else {
                clearInterval(typewriterTimer);
                typewriterTimer = null;
                element.classList.remove('typewriter');
                if (onComplete) onComplete();
            }
        }, 30);

        // Click to skip typewriter
        element.onclick = function() {
            if (typewriterTimer) {
                clearInterval(typewriterTimer);
                typewriterTimer = null;
                element.textContent = typewriterText;
                element.classList.remove('typewriter');
                element.onclick = null;
                if (onComplete) onComplete();
            }
        };
    }

    function showChoices(choices, container) {
        choices.forEach(function(choice, idx) {
            var btn = document.createElement('button');
            btn.className = 'dialogue-choice';
            btn.innerHTML = '<span class="choice-number">' + (idx + 1) + '.</span> ' + choice.text;
            btn.addEventListener('click', function() {
                handleChoice(choice);
            });
            container.appendChild(btn);
        });
    }

    function showContinuePrompt(container) {
        var btn = document.createElement('div');
        btn.className = 'dialogue-continue';
        btn.textContent = '[ Click to continue ]';
        btn.addEventListener('click', function() {
            advanceDialogue();
        });
        container.appendChild(btn);
    }

    function handleChoice(choice) {
        // Apply effects
        if (choice.effects) {
            State.applyEffects(choice.effects);
        }

        // Handle building placement from intro
        if (choice.effect) {
            State.emit('dialogueChoice', { effect: choice.effect });
        }

        // Show response if exists
        if (choice.response) {
            var textEl = document.getElementById('dialogue-text');
            var choicesEl = document.getElementById('dialogue-choices');
            choicesEl.innerHTML = '';
            startTypewriter(textEl, choice.response, function() {
                showContinuePrompt(choicesEl);
            });
            return;
        }

        advanceDialogue();
    }

    function advanceDialogue() {
        currentNodeIndex++;
        if (currentDialogue && currentNodeIndex < currentDialogue.nodes.length) {
            showNode(currentDialogue.nodes[currentNodeIndex]);
        } else {
            endDialogue();
        }
    }

    function endDialogue() {
        document.getElementById('dialogue-panel').style.display = 'none';
        currentDialogue = null;
        currentNodeIndex = 0;

        var state = State.get();
        if (!wasPaused) {
            state.paused = false;
        }

        State.emit('dialogueEnded', {});
    }

    // ---- EVENT DIALOGUE (from events system) ----

    function showEvent(eventData) {
        var state = State.get();
        wasPaused = state.paused;
        state.paused = true;

        var panel = document.getElementById('decision-panel');
        var title = document.getElementById('decision-title');
        var desc = document.getElementById('decision-description');
        var options = document.getElementById('decision-options');

        title.textContent = eventData.title;
        desc.textContent = eventData.text;

        options.innerHTML = '';
        eventData.choices.forEach(function(choice) {
            if (choice.characterSpecific && choice.characterSpecific !== state.characterId) return;

            var optEl = document.createElement('div');
            optEl.className = 'decision-option';

            var effectsHtml = '';
            if (choice.effects) {
                var items = [];
                for (var k in choice.effects) {
                    var v = choice.effects[k];
                    items.push('<span class="' + (v >= 0 ? 'effect-positive' : 'effect-negative') + '">' +
                        GAME.Systems.Crisis.formatEffectName(k) + ': ' + (v > 0 ? '+' : '') + v + '</span>');
                }
                effectsHtml = '<div class="decision-option-effects">' + items.join(' &bull; ') + '</div>';
            }

            optEl.innerHTML = '<div class="decision-option-title">' + choice.text + '</div>' + effectsHtml;

            optEl.addEventListener('click', function() {
                State.applyEffects(choice.effects);
                State.addLog(eventData.title + ': ' + choice.text, 'info');

                if (choice.response) {
                    panel.style.display = 'none';
                    showSimpleMessage(eventData.title, choice.response);
                } else {
                    panel.style.display = 'none';
                    if (!wasPaused) state.paused = false;
                }
            });

            options.appendChild(optEl);
        });

        panel.style.display = 'flex';
    }

    function showSimpleMessage(title, text) {
        var panel = document.getElementById('decision-panel');
        var titleEl = document.getElementById('decision-title');
        var desc = document.getElementById('decision-description');
        var options = document.getElementById('decision-options');

        titleEl.textContent = title;
        desc.textContent = text;

        options.innerHTML = '';
        var btn = document.createElement('div');
        btn.className = 'decision-option';
        btn.innerHTML = '<div class="decision-option-title" style="text-align:center">OK</div>';
        btn.addEventListener('click', function() {
            panel.style.display = 'none';
            var state = State.get();
            if (!wasPaused && state) state.paused = false;
        });
        options.appendChild(btn);

        panel.style.display = 'flex';
    }

    return {
        startDialogue: startDialogue,
        showEvent: showEvent,
        showSimpleMessage: showSimpleMessage,
        endDialogue: endDialogue
    };
})();
