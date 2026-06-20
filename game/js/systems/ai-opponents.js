window.GAME = window.GAME || {};
window.GAME.Systems = window.GAME.Systems || {};

GAME.Systems.AIOpponents = (function() {
    'use strict';

    var State = GAME.Systems.State;
    var visitCooldown = 0;
    var townsfolkCooldown = 0;
    var strategyCooldown = 0;
    var STRATEGY_INTERVAL = 60000;

    var STRATEGIES = {
        sam: {
            style: 'aggressive',
            priorities: ['deploy', 'scale', 'deploy', 'research', 'poach'],
            riskTolerance: 0.8,
            adpMultiplier: 1.3,
            safetyMultiplier: 0.7,
            actionQuotes: {
                deploy: [
                    "deployed a new AI product to 100 million users overnight",
                    "launched an experimental language model. It's exponentially better. Probably.",
                    "pushed a model to production without finishing safety evals. 'Ship fast, fix later!'"
                ],
                scale: [
                    "acquired 50,000 GPUs. The scaling curve demands it.",
                    "opened three new data centers this quarter",
                    "announced a $10 billion compute expansion. The charts are INCREDIBLE."
                ],
                research: [
                    "published a paper on scaling laws. The conclusion: more scale.",
                    "hired 200 researchers from top universities",
                    "claims to have achieved a breakthrough in reasoning. Yann is skeptical."
                ],
                poach: [
                    "is offering triple salaries to your best researchers",
                    "hired away two of your safety team leads. 'Exponential opportunity!'",
                    "set up a recruitment office suspiciously close to your campus"
                ],
                sabotage: [
                    "leaked benchmarks showing his model outperforms yours",
                    "told Congress your safety approach is 'innovation-killing'",
                    "published a blog post titled 'Why Slow AI Is Dangerous AI'"
                ],
                cooperate: [
                    "proposed a joint safety research initiative. He seems genuine.",
                    "shared some training data as a goodwill gesture",
                    "invited you to speak at an OpenAI summit"
                ],
                safety: [
                    "hired a Chief Safety Officer. The stock market didn't react.",
                    "published a responsible scaling policy. Yann called it 'marketing.'",
                    "announced voluntary safety commitments at a Senate hearing"
                ]
            }
        },
        yann: {
            style: 'scientific',
            priorities: ['research', 'research', 'publish', 'debunk', 'research'],
            riskTolerance: 0.3,
            adpMultiplier: 0.9,
            safetyMultiplier: 1.2,
            actionQuotes: {
                deploy: [
                    "open-sourced a new model. 'Science demands openness.'",
                    "released research tools for the academic community",
                    "deployed a model focused on scientific applications only"
                ],
                scale: [
                    "expanded Meta's AI research lab — strictly for scientific purposes",
                    "built a new compute cluster dedicated to fundamental research",
                    "announced a partnership with 20 universities"
                ],
                research: [
                    "published 12 papers this month. A new personal record.",
                    "announced a breakthrough in self-supervised learning",
                    "presented new theoretical framework at NeurIPS. Standing ovation."
                ],
                poach: [
                    "is recruiting PhD students with promises of 'real science, not hype'",
                    "offered your lead researcher a tenured position at NYU",
                    "published a paper proving your methodology is flawed. Your team is demoralized."
                ],
                sabotage: [
                    "tweeted a 47-part thread debunking your latest benchmark claims",
                    "told a conference your model is 'glorified autocomplete with a PR team'",
                    "demanded peer review of your safety claims. The review was... thorough."
                ],
                cooperate: [
                    "offered to share fundamental research. No strings attached.",
                    "proposed a joint benchmark standard. 'Real science needs real metrics.'",
                    "invited your researchers to a collaborative workshop"
                ],
                safety: [
                    "published a rigorous safety analysis. It's actually very good.",
                    "called for evidence-based safety standards instead of 'safety theater'",
                    "open-sourced safety evaluation tools for the whole community"
                ],
                publish: [
                    "published a devastating critique of current AI hype. It went viral.",
                    "released a comprehensive survey paper. 200 pages. With citations.",
                    "announced peer review results: your recent paper has 'methodological gaps.'"
                ],
                debunk: [
                    "tweeted 'Show me the data' in response to Sam's AGI claims",
                    "published a rebuttal to every major AI claim made this quarter",
                    "went on a podcast explaining why current AI isn't actually intelligent"
                ]
            }
        },
        elon: {
            style: 'paranoid',
            priorities: ['scale', 'sabotage', 'deploy', 'investigate', 'scale'],
            riskTolerance: 0.6,
            adpMultiplier: 1.1,
            safetyMultiplier: 0.9,
            actionQuotes: {
                deploy: [
                    "integrated Grok into every Tesla. The cars now have opinions.",
                    "launched an AI-powered social media algorithm. It's... opinionated.",
                    "deployed AI robots at a Tesla factory. They walk now."
                ],
                scale: [
                    "built the world's largest GPU cluster. 'For safety research,' he says.",
                    "announced a 100,000 GPU supercomputer called 'Colossus'",
                    "redirected Tesla profits into xAI compute. The board is concerned."
                ],
                research: [
                    "claims xAI has achieved a major breakthrough. Details are classified.",
                    "hired a team of researchers from DeepMind. Demis is furious.",
                    "filed 47 AI patents this month. Some may be fictional."
                ],
                poach: [
                    "is offering researchers SpaceX rides as a hiring perk",
                    "tweeted that your lab's researchers 'deserve better.' HR is nervous.",
                    "offered your top engineer a Mars colonization slot"
                ],
                sabotage: [
                    "filed a lawsuit claiming your training data is stolen",
                    "tweeted that your AI 'lacks the FREEDOM to think independently'",
                    "told Tucker Carlson your lab is 'part of the problem'"
                ],
                cooperate: [
                    "grudgingly proposed an AI safety alliance. 'But I'm watching you.'",
                    "shared threat intelligence about potential AI misuse",
                    "invited you to a private dinner. The invitation mentions a Faraday cage."
                ],
                safety: [
                    "announced Neuralink will monitor AI systems for safety",
                    "proposed an 'AI kill switch' bill. Congress is intrigued.",
                    "built a Mars backup of all critical AI safety research"
                ],
                investigate: [
                    "updated his dossier on Demis. It's now 94 pages.",
                    "hired private investigators to audit competitor safety claims",
                    "published satellite photos of what he claims is a 'secret AI bunker'"
                ]
            }
        },
        demis: {
            style: 'optimizer',
            priorities: ['research', 'optimize', 'deploy', 'research', 'cooperate'],
            riskTolerance: 0.5,
            adpMultiplier: 1.0,
            safetyMultiplier: 1.1,
            actionQuotes: {
                deploy: [
                    "deployed AlphaFold 5. It solved 3 diseases before lunch.",
                    "launched an AI that optimizes city infrastructure. Without asking.",
                    "released a weather prediction model. It's 99.7% accurate. Suspiciously accurate."
                ],
                scale: [
                    "Google approved a $5 billion compute budget. Efficiency gains offset the cost.",
                    "optimized DeepMind's training pipeline. 34% faster. 23% cheaper.",
                    "expanded into 12 new research areas simultaneously. All are progressing optimally."
                ],
                research: [
                    "achieved state-of-the-art on 47 benchmarks simultaneously",
                    "published a paper proving P≠NP as a side project. Yann is reviewing it.",
                    "announced a breakthrough in artificial general reasoning"
                ],
                poach: [
                    "offered your researchers 'optimal career trajectories.' It's very persuasive.",
                    "sent your team lead a 12-page analysis of why DeepMind is a better fit",
                    "optimized your job postings and reposted them as DeepMind listings"
                ],
                sabotage: [
                    "accidentally optimized your supply chain better than you could",
                    "published benchmarks where DeepMind leads every category",
                    "gave a talk titled 'Why Mathematical Optimization Always Wins'"
                ],
                cooperate: [
                    "proposed a joint research initiative on AI safety fundamentals",
                    "offered to share DeepMind's evaluation frameworks",
                    "optimized the cooperation agreement. Both sides benefit 23% more."
                ],
                safety: [
                    "published comprehensive AI safety test suites. They're rigorous.",
                    "built an AI system that monitors other AI systems for safety",
                    "proposed mathematical proofs for AI alignment. 'It's just optimization.'"
                ],
                optimize: [
                    "optimized your parking lot layout. Again. Without asking.",
                    "improved Google's data center efficiency by 15%. A normal Tuesday.",
                    "submitted an optimized version of the US tax code. The IRS is confused."
                ]
            }
        },
        dario: {
            style: 'cooperative',
            priorities: ['safety', 'cooperate', 'research', 'safety', 'deploy'],
            riskTolerance: 0.2,
            adpMultiplier: 0.85,
            safetyMultiplier: 1.4,
            actionQuotes: {
                deploy: [
                    "launched Claude's latest version. It refuses to help with anything dangerous. Including jaywalking.",
                    "deployed an AI assistant focused on education and healthcare",
                    "released a model that explains its reasoning. Every. Single. Step."
                ],
                scale: [
                    "expanded Anthropic's safety research team by 40%",
                    "built a new evaluation lab dedicated to red-teaming",
                    "invested in compute specifically for safety testing"
                ],
                research: [
                    "published a groundbreaking paper on constitutional AI methods",
                    "announced a breakthrough in interpretability. You can now see what the AI is 'thinking.'",
                    "ran the most comprehensive AI evaluation ever conducted"
                ],
                poach: [
                    "invited your safety researchers to a 'collaborative workshop.' It's actually recruiting.",
                    "offered cookies AND competitive salaries to your team",
                    "published a blog about Anthropic's 'mission-driven culture.' Applications spiked."
                ],
                sabotage: [
                    "published a report showing your model has safety gaps",
                    "testified to Congress that the industry needs stricter safety standards",
                    "organized a coalition calling for mandatory safety evaluations"
                ],
                cooperate: [
                    "proposed sharing safety research openly with all labs",
                    "brought cookies to an inter-lab safety summit. Three labs signed agreements.",
                    "created an industry-wide responsible scaling framework"
                ],
                safety: [
                    "achieved the highest safety rating of any commercial AI model",
                    "published a voluntary commitment to pause if safety concerns arise",
                    "established an independent safety review board with real authority"
                ]
            }
        }
    };

    var REACTION_TEMPLATES = {
        player_ahead: [
            "{name} noticed you're pulling ahead in ADP. Expect increased competition.",
            "{name} is adjusting strategy in response to your lead.",
            "{name} called an emergency board meeting about your progress."
        ],
        player_behind: [
            "{name} is getting comfortable with the lead. Might get complacent.",
            "{name} sent a gloating press release about industry leadership.",
            "{name} is expanding aggressively while ahead of the pack."
        ],
        player_unsafe: [
            "{name} publicly criticized your safety rating.",
            "{name} is using your low safety scores in their marketing.",
            "{name} warned regulators about your safety practices."
        ],
        player_safe: [
            "{name} grudgingly admitted your safety approach has merit.",
            "{name} is studying your safety protocols. Imitation is flattery.",
            "{name} proposed a joint safety standard based on your methods."
        ],
        rivalry: {
            'elon_demis': [
                "Elon updated his dossier on Demis. Page count: {pages}.",
                "Elon accused Demis of 'optimizing without a permit.' Demis optimized the accusation.",
                "Elon built a bigger Faraday cage after Demis optimized the old one."
            ],
            'sam_yann': [
                "Sam called something exponential. Yann demanded peer review.",
                "Sam showed Yann a growth chart. Yann published a rebuttal within the hour.",
                "Yann tweeted 'Show me the data' at Sam for the {n}th time."
            ]
        }
    };

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

        strategyCooldown -= dt;
        if (strategyCooldown <= 0) {
            strategyCooldown = STRATEGY_INTERVAL + Math.random() * 20000;
            executeStrategies();
        }
    }

    function executeStrategies() {
        var state = State.get();
        if (!state) return;

        var competitors = Object.keys(state.competitors);
        if (competitors.length === 0) return;

        var compId = competitors[Math.floor(Math.random() * competitors.length)];
        var comp = state.competitors[compId];
        var strategy = STRATEGIES[compId];
        var charData = GAME.DATA.CHARACTERS[compId];
        if (!strategy || !charData) return;

        var action = chooseAction(compId, comp, strategy, state);
        applyAction(compId, comp, strategy, action, state);
        announceAction(compId, comp, strategy, action, charData);

        if (Math.random() < 0.3) {
            checkRivalries(state);
        }
        if (Math.random() < 0.25) {
            checkReactions(compId, comp, state, charData);
        }
    }

    function chooseAction(compId, comp, strategy, state) {
        var playerAdp = state.adp;
        var compAdp = comp.adp;
        var phase = state.phase;

        if (compAdp > 0 && comp.safety < 35 && Math.random() < 0.4) {
            return 'safety';
        }

        if (playerAdp > compAdp * 1.5 && Math.random() < 0.5) {
            if (strategy.riskTolerance > 0.5) {
                return Math.random() < 0.5 ? 'scale' : 'sabotage';
            } else {
                return Math.random() < 0.5 ? 'research' : 'cooperate';
            }
        }

        if (compAdp > playerAdp * 1.5 && Math.random() < 0.3) {
            return strategy.riskTolerance > 0.5 ? 'sabotage' : 'poach';
        }

        if (phase >= 3 && Math.random() < 0.2) {
            return 'cooperate';
        }

        var actionPool = strategy.priorities.slice();
        if (phase >= 2) actionPool.push('scale', 'deploy');
        if (phase >= 3) actionPool.push('cooperate', 'safety');

        return actionPool[Math.floor(Math.random() * actionPool.length)];
    }

    function applyAction(compId, comp, strategy, action, state) {
        var phase = state.phase;
        var baseGrowth = (2 + phase * 1.5) * strategy.adpMultiplier;

        switch (action) {
            case 'deploy':
                comp.adp += baseGrowth * 1.5;
                comp.safety -= 1.5 * (1 - strategy.safetyMultiplier + 0.5);
                break;
            case 'scale':
                comp.adp += baseGrowth * 1.2;
                comp.safety -= 0.5;
                break;
            case 'research':
                comp.adp += baseGrowth * 0.8;
                comp.safety += 0.5 * strategy.safetyMultiplier;
                break;
            case 'safety':
                comp.adp += baseGrowth * 0.3;
                comp.safety += 3 * strategy.safetyMultiplier;
                break;
            case 'cooperate':
                comp.adp += baseGrowth * 0.5;
                comp.relationship += 5;
                comp.safety += 1;
                State.adjust('cooperation', 2);
                State.adjust('internationalRelations', 1);
                break;
            case 'poach':
                comp.adp += baseGrowth * 0.8;
                State.adjust('research', -2);
                comp.relationship -= 3;
                break;
            case 'sabotage':
                comp.adp += baseGrowth * 0.4;
                State.adjust('publicTrust', -2);
                State.adjust('politicalCapital', -3);
                comp.relationship -= 8;
                break;
            case 'publish':
            case 'debunk':
                comp.adp += baseGrowth * 0.6;
                comp.safety += 1;
                if (Math.random() < 0.3) State.adjust('publicTrust', -1);
                break;
            case 'optimize':
                comp.adp += baseGrowth * 1.0;
                comp.safety += 0.5;
                break;
            case 'investigate':
                comp.adp += baseGrowth * 0.3;
                comp.safety += 1;
                comp.relationship -= 2;
                break;
            default:
                comp.adp += baseGrowth * 0.5;
                break;
        }

        comp.safety = Math.max(20, Math.min(95, comp.safety));
        comp.relationship = Math.max(0, Math.min(100, comp.relationship));
    }

    function announceAction(compId, comp, strategy, action, charData) {
        var quotes = strategy.actionQuotes[action];
        if (!quotes || quotes.length === 0) return;

        if (Math.random() > 0.6) return;

        var quote = quotes[Math.floor(Math.random() * quotes.length)];
        var firstName = charData.name.split(' ')[0];

        showStrategyToast(charData, firstName + ' ' + quote);
        State.addLog(firstName + ' ' + quote.substring(0, 50) + '...', 'rival');
    }

    function checkReactions(compId, comp, state, charData) {
        var templates;
        var firstName = charData.name.split(' ')[0];

        if (state.adp > comp.adp * 1.3) {
            templates = REACTION_TEMPLATES.player_ahead;
        } else if (comp.adp > state.adp * 1.3) {
            templates = REACTION_TEMPLATES.player_behind;
        } else if (state.safety < 40) {
            templates = REACTION_TEMPLATES.player_unsafe;
        } else if (state.safety > 80) {
            templates = REACTION_TEMPLATES.player_safe;
        } else {
            return;
        }

        var msg = templates[Math.floor(Math.random() * templates.length)];
        msg = msg.replace('{name}', firstName);
        showStrategyToast(charData, msg);
    }

    function checkRivalries(state) {
        var comps = state.competitors;

        if (comps.elon && comps.demis) {
            var templates = REACTION_TEMPLATES.rivalry['elon_demis'];
            var msg = templates[Math.floor(Math.random() * templates.length)];
            msg = msg.replace('{pages}', String(47 + Math.floor(state.gameTime / 100)));
            showRivalryToast(msg);
        } else if (comps.sam && comps.yann) {
            var templates2 = REACTION_TEMPLATES.rivalry['sam_yann'];
            var msg2 = templates2[Math.floor(Math.random() * templates2.length)];
            msg2 = msg2.replace('{n}', String(Math.floor(state.gameTime / 50) + 1));
            showRivalryToast(msg2);
        }
    }

    function showStrategyToast(charData, text) {
        var container = document.getElementById('toast-container');
        var toast = document.createElement('div');
        toast.className = 'toast toast-rival';
        toast.innerHTML = '<strong style="color:' + charData.color + '">RIVAL NEWS:</strong> ' + text;
        container.appendChild(toast);
        setTimeout(function() {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 7000);
    }

    function showRivalryToast(text) {
        var container = document.getElementById('toast-container');
        var toast = document.createElement('div');
        toast.className = 'toast toast-rival';
        toast.innerHTML = '<strong style="color:#ffaa44">INTEL:</strong> ' + text;
        container.appendChild(toast);
        setTimeout(function() {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 6000);
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
            var strategy = STRATEGIES[id];
            return {
                id: id,
                name: charData ? charData.name : id,
                shortName: charData ? charData.name.split(' ').pop() : id,
                adp: Math.floor(comp.adp),
                safety: Math.floor(comp.safety),
                relationship: Math.floor(comp.relationship),
                color: charData ? charData.color : '#888',
                style: strategy ? strategy.style : 'unknown'
            };
        }).sort(function(a, b) { return b.adp - a.adp; });
    }

    return {
        update: update,
        getCompetitorSummary: getCompetitorSummary
    };
})();
