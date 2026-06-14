window.GAME = window.GAME || {};
window.GAME.DATA = window.GAME.DATA || {};

GAME.DATA.DIALOGUES = {
    intro_dario: {
        id: 'intro_dario',
        nodes: [
            {
                speaker: 'advisor',
                text: "Welcome to Anthropic, Dr. Amodei. Your campus is ready. The board expects results. The public thinks you're building a fancy chatbot. No pressure.",
                choices: null
            },
            {
                speaker: 'dario',
                text: "First things first: we need a safety department. And a cookie kitchen. Both are equally critical to our mission.",
                choices: null
            },
            {
                speaker: 'advisor',
                text: "The cookie kitchen, sir?",
                choices: null
            },
            {
                speaker: 'dario',
                text: "Cookie diplomacy is the foundation of cooperation. You can't build trust with a PowerPoint. But a snickerdoodle? That's universal language.",
                choices: [
                    { text: "Build the cookie kitchen first", effect: 'cookie_kitchen' },
                    { text: "Start with the research lab", effect: 'small_lab' },
                    { text: "Why not both?", effect: 'both' }
                ]
            }
        ]
    },
    intro_sam: {
        id: 'intro_sam',
        nodes: [
            {
                speaker: 'advisor',
                text: "Welcome to OpenAI, Mr. Altman. Your campus awaits. What's the strategy?",
                choices: null
            },
            {
                speaker: 'sam',
                text: "Strategy? EXPONENTIAL strategy! We need data centers, deployment centers, and a whiteboard for every room. Let me show you this chart—",
                choices: null
            },
            {
                speaker: 'advisor',
                text: "Sir, you've already drawn charts on three walls and a window.",
                choices: null
            },
            {
                speaker: 'sam',
                text: "The SCALING potential here is incredible. In 5 years, every human will use our AI. In 10 years, we solve mortality. In 1,000 years—",
                choices: [
                    { text: "Let's focus on this decade first", effect: 'deployment_center' },
                    { text: "Show me the immortality plan", effect: 'large_lab' },
                    { text: "Start deploying immediately", effect: 'scale_fast' }
                ]
            }
        ]
    },
    intro_yann: {
        id: 'intro_yann',
        nodes: [
            {
                speaker: 'advisor',
                text: "Welcome to Meta AI, Dr. LeCun. Your research campus is prepared.",
                choices: null
            },
            {
                speaker: 'yann',
                text: "First question: has any of the existing infrastructure been peer reviewed? The lab layouts? The equipment specifications? The coffee machine?",
                choices: null
            },
            {
                speaker: 'advisor',
                text: "The... coffee machine, sir?",
                choices: null
            },
            {
                speaker: 'yann',
                text: "Show me the data on optimal caffeine delivery. Without evidence-based coffee, how can we do evidence-based research? The methodology starts at breakfast.",
                choices: [
                    { text: "Build the biggest research lab possible", effect: 'large_lab' },
                    { text: "Peer review the campus plans first", effect: 'safety_dept' },
                    { text: "Just make the coffee good", effect: 'small_lab' }
                ]
            }
        ]
    },
    intro_elon: {
        id: 'intro_elon',
        nodes: [
            {
                speaker: 'advisor',
                text: "Welcome to xAI, Mr. Musk. Your campus is located in a former warehouse—",
                choices: null
            },
            {
                speaker: 'elon',
                text: "Why is there a DeepMind office across the street? That can't be a coincidence. Demis is WATCHING us.",
                choices: null
            },
            {
                speaker: 'advisor',
                text: "Sir, that's a dentist's office.",
                choices: null
            },
            {
                speaker: 'elon',
                text: "A 'dentist.' Sure. We need surveillance countermeasures. Also a Mars contingency plan. Also, is that chess tournament down the road? Suspicious.",
                choices: [
                    { text: "Focus on building AI, not paranoia", effect: 'data_center' },
                    { text: "Install the surveillance countermeasures", effect: 'safety_dept' },
                    { text: "Start the Mars backup plan", effect: 'mars_plan' }
                ]
            }
        ]
    },
    intro_demis: {
        id: 'intro_demis',
        nodes: [
            {
                speaker: 'advisor',
                text: "Welcome to Google DeepMind, Dr. Hassabis. Your optimized campus—",
                choices: null
            },
            {
                speaker: 'demis',
                text: "I already optimized the campus. Last night. The parking is 23% more efficient. The cafeteria serves meals in optimal nutritional order. You're welcome.",
                choices: null
            },
            {
                speaker: 'advisor',
                text: "Nobody asked—",
                choices: null
            },
            {
                speaker: 'demis',
                text: "That's the beauty of optimization. You don't need to ask. I calculated 47 improvements before breakfast. Only 3 increase existential risk. Acceptable margins.",
                choices: [
                    { text: "Let's optimize everything", effect: 'large_lab' },
                    { text: "Maybe fewer existential risks?", effect: 'safety_dept' },
                    { text: "Please stop optimizing things without asking", effect: 'data_center' }
                ]
            }
        ]
    },

    // Character visit dialogues
    visit_sam: {
        id: 'visit_sam',
        nodes: [
            {
                speaker: 'sam',
                text: "Hey! I was in the neighborhood — exponentially in the neighborhood. Have you seen our latest scaling numbers?",
                choices: [
                    { text: "Show me the charts", effect: 'cooperation_up' },
                    { text: "Sam, everything can't be exponential", effect: 'cooperation_slight' },
                    { text: "Security, we have a visitor!", effect: 'cooperation_down' }
                ]
            }
        ]
    },
    visit_yann: {
        id: 'visit_yann',
        nodes: [
            {
                speaker: 'yann',
                text: "I've reviewed your latest model's outputs. Interesting. Not peer reviewed, obviously. But interesting.",
                choices: [
                    { text: "Would you like to collaborate on the paper?", effect: 'research_up' },
                    { text: "Our users seem to like it", effect: 'quip_yann' },
                    { text: "Peer review THIS *shows growth charts*", effect: 'cooperation_down' }
                ]
            }
        ]
    },
    visit_elon: {
        id: 'visit_elon',
        nodes: [
            {
                speaker: 'elon',
                text: "I need to talk. Privately. In my Faraday cage. Demis has been doing something suspicious with chess tournaments again.",
                choices: [
                    { text: "Show me the dossier", effect: 'elon_dossier' },
                    { text: "Elon, have you considered therapy?", effect: 'cooperation_down' },
                    { text: "What if Demis is actually just... good at chess?", effect: 'elon_rage' }
                ]
            }
        ]
    },
    visit_demis: {
        id: 'visit_demis',
        nodes: [
            {
                speaker: 'demis',
                text: "I notice your campus power grid is 17.3% suboptimal. I took the liberty of drafting improvements. You're welcome.",
                choices: [
                    { text: "Thanks! Any other suggestions?", effect: 'optimize_campus' },
                    { text: "Please stop optimizing things without asking", effect: 'demis_sad' },
                    { text: "*forwards message to Elon*", effect: 'elon_vindicated' }
                ]
            }
        ]
    },

    // Comedy dialogues
    committee_meta: {
        id: 'committee_meta',
        nodes: [
            {
                speaker: 'dario',
                text: "We've formed a committee to study whether we have too many committees.",
                choices: null
            },
            {
                speaker: 'advisor',
                text: "Sir, that IS the problem.",
                choices: null
            },
            {
                speaker: 'dario',
                text: "The committee will determine that. In 6-8 weeks. With cookies.",
                choices: null
            }
        ]
    },
    public_confusion: {
        id: 'public_confusion',
        nodes: [
            {
                speaker: 'reporter',
                text: "So your AI — is it like Google but angrier?",
                choices: null
            },
            {
                speaker: 'advisor',
                text: "Sir, your eye is twitching.",
                choices: null
            },
            {
                speaker: 'reporter',
                text: "My nephew's really good with computers too. He once fixed my printer.",
                choices: [
                    { text: "*deep sigh* Yes, it's like Google", effect: 'public_wrong' },
                    { text: "Let me get my whiteboard...", effect: 'public_explain' },
                    { text: "I need a moment", effect: 'public_cry' }
                ]
            }
        ]
    }
};
