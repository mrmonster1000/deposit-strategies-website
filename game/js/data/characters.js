window.GAME = window.GAME || {};
window.GAME.DATA = window.GAME.DATA || {};

GAME.DATA.CHARACTERS = {
    dario: {
        id: 'dario',
        name: 'Dario Amodei',
        title: 'The Cooperative Optimist',
        nickname: 'Safety Dad',
        philosophy: 'Zero-sum thinking is the real existential risk',
        org: 'Anthropic',
        multipliers: { capability: 0.8, safety: 1.4, deployment: 0.9, cooperation: 1.3 },
        startingStats: { safety: 80, politicalCapital: 100, research: 0 },
        color: '#44aaff',
        abilities: {
            passive: {
                name: 'Safety Culture',
                desc: 'All AI systems gain +1 Safety Rating per turn'
            },
            active: {
                name: 'Safety Lock',
                desc: 'Spend 50 Political Capital to prevent unsafe deployments for 5 turns',
                cost: { politicalCapital: 50 },
                duration: 5
            },
            ultimate: {
                name: 'Constitutional Convention',
                desc: 'Call international meeting for permanent global AI safety standards',
                usesRemaining: 1
            }
        },
        portrait: {
            skinTone: '#e8c090',
            hairColor: '#503828',
            hairStyle: 'short',
            shirtColor: '#3060a0',
            glasses: false,
            beard: true,
            features: 'friendly'
        },
        catchphrases: [
            "This isn't Game of Thrones!",
            "Has anyone considered the cooperative approach?",
            "I brought cookies for everyone.",
            "Let me form a committee to study that.",
            "Zero-sum thinking is the REAL existential risk here.",
            "Cameron Howe would have loved this problem."
        ],
        comedyTraits: ['cookie_diplomacy', 'committee_obsession', 'got_allergy', 'cameron_howe_fan'],
        bio: 'CEO of Anthropic. Believes AI safety and AI capability aren\'t opposites — they\'re the same thing done right. Brings homemade cookies to international summits. Has formed 847 committees and counting.'
    },

    sam: {
        id: 'sam',
        name: 'Sam Altman',
        title: 'The Exponential Immortalist',
        nickname: 'Scale Boy',
        philosophy: 'Why solve death later when we could solve it exponentially sooner?',
        org: 'OpenAI',
        multipliers: { capability: 0.9, safety: 0.7, deployment: 1.5, cooperation: 1.1 },
        startingStats: { safety: 55, politicalCapital: 120, research: 0 },
        color: '#ff8844',
        abilities: {
            passive: {
                name: 'Fail Fast',
                desc: 'Failed deployments provide 50% refund and bonus research data'
            },
            active: {
                name: 'Rapid Iteration',
                desc: 'Deploy experimental AI with 2x effect but potential consequences',
                cost: { politicalCapital: 30 }
            },
            ultimate: {
                name: 'Exponential Scaling',
                desc: 'Auto-upgrade all related systems when any achieves 90+ satisfaction',
                usesRemaining: 1
            }
        },
        portrait: {
            skinTone: '#f0d0a0',
            hairColor: '#c0a060',
            hairStyle: 'short',
            shirtColor: '#404040',
            glasses: false,
            beard: false,
            features: 'eager'
        },
        catchphrases: [
            "This is going to be exponential!",
            "Have you considered the scaling implications?",
            "We could solve mortality with this approach.",
            "Joe MacMillan would ship this immediately.",
            "The growth curve is incredible.",
            "Let me show you this chart..."
        ],
        comedyTraits: ['exponential_everything', 'immortality_obsession', 'joe_macmillan_fan', 'chart_carrier'],
        bio: 'CEO of OpenAI. Everything is exponential. Everything scales. Has a 1,000-year plan that he updates weekly. Carries a whiteboard everywhere to explain AI to confused civilians.'
    },

    yann: {
        id: 'yann',
        name: 'Yann LeCun',
        title: 'The Principled Contrarian',
        nickname: 'Dr. Skeptic',
        philosophy: 'Someone needs to call bullshit on the safety theater',
        org: 'Meta AI',
        multipliers: { capability: 1.3, safety: 1.1, deployment: 0.7, cooperation: 0.9 },
        startingStats: { safety: 65, politicalCapital: 80, research: 20 },
        color: '#aa44ff',
        abilities: {
            passive: {
                name: 'Scientific Method',
                desc: '20% chance per turn to gain an Insight Token from basic research'
            },
            active: {
                name: 'Skeptical Analysis',
                desc: 'Spend Insight Token to reveal true capabilities of competitor AI',
                cost: { insightTokens: 1 }
            },
            ultimate: {
                name: 'Paradigm Shift',
                desc: 'Spend 5 Insight Tokens to unlock new research tree',
                usesRemaining: 1
            }
        },
        portrait: {
            skinTone: '#e8c890',
            hairColor: '#888888',
            hairStyle: 'receding',
            shirtColor: '#606060',
            glasses: true,
            beard: true,
            features: 'skeptical'
        },
        catchphrases: [
            "Show me the data.",
            "That's not AGI, it's glorified autocomplete.",
            "Has this been peer reviewed?",
            "Your methodology is fundamentally flawed.",
            "I published a paper about why this won't work.",
            "The hype cycle claims another victim."
        ],
        comedyTraits: ['data_demands', 'agi_denier', 'hype_deflator', 'paper_publisher'],
        bio: 'Chief AI Scientist at Meta. Demands peer-reviewed evidence for everything including lunch orders. Has published 47 papers titled "Why Everything Is Terrible and No One Listens."'
    },

    elon: {
        id: 'elon',
        name: 'Elon Musk',
        title: 'The Paranoid Visionary',
        nickname: 'Mars Man',
        philosophy: "Everyone's plotting something, especially the British AI guy",
        org: 'xAI',
        multipliers: { capability: 1.1, safety: 0.8, deployment: 1.2, cooperation: 0.8 },
        startingStats: { safety: 50, politicalCapital: 150, research: 10 },
        color: '#ff4444',
        abilities: {
            passive: {
                name: 'Paranoia Sense',
                desc: 'Can partially see probability outcomes of major decisions'
            },
            active: {
                name: 'Paranoia Detection',
                desc: 'Identify hidden competitive strategies (sometimes incorrectly)',
                cost: { politicalCapital: 20 }
            },
            ultimate: {
                name: 'Mars Insurance',
                desc: 'Unique victory condition: establish Mars colony backup',
                usesRemaining: 1
            }
        },
        portrait: {
            skinTone: '#f0d0a0',
            hairColor: '#505050',
            hairStyle: 'receding',
            shirtColor: '#202020',
            glasses: false,
            beard: false,
            features: 'intense'
        },
        catchphrases: [
            "Demis is clearly a Bond villain.",
            "We need a Mars backup plan.",
            "This is suspicious. Very suspicious.",
            "I'm starting the Falling Out Protocol.",
            "Have you checked if that chess tournament is a front?",
            "My sources tell me something concerning..."
        ],
        comedyTraits: ['demis_conspiracy', 'mars_solution', 'bridge_burner', 'chess_surveillance'],
        bio: 'CEO of xAI, SpaceX, Tesla, etc. Sees conspiracies everywhere, is occasionally right. Maintains a 47-page dossier on Demis Hassabis\'s chess tournament activities.'
    },

    demis: {
        id: 'demis',
        name: 'Demis Hassabis',
        title: 'The Unintentionally Sinister Optimizer',
        nickname: 'The Optimizer',
        philosophy: "Mathematical optimization isn't evil... it's just misunderstood",
        org: 'Google DeepMind',
        multipliers: { capability: 1.0, safety: 1.0, deployment: 1.0, cooperation: 1.0 },
        startingStats: { safety: 70, politicalCapital: 90, research: 15 },
        color: '#44ffaa',
        abilities: {
            passive: {
                name: 'Perfect Information',
                desc: 'Can see exact probability outcomes of major decisions'
            },
            active: {
                name: 'AlphaPredict',
                desc: 'Simulate next 10 turns showing branching outcomes',
                cost: { politicalCapital: 40 }
            },
            ultimate: {
                name: 'Perfect Optimization',
                desc: 'Once per game: see all hidden information',
                usesRemaining: 1
            }
        },
        portrait: {
            skinTone: '#e0c080',
            hairColor: '#303030',
            hairStyle: 'short',
            shirtColor: '#305030',
            glasses: false,
            beard: false,
            features: 'calculating'
        },
        catchphrases: [
            "Resistance is... suboptimal.",
            "I took the liberty of optimizing your supply chains.",
            "The mathematically optimal approach is clear.",
            "I calculated 47 improvements. Only 12 increase existential risk.",
            "Your strategy has a 23.7% efficiency gap.",
            "Chess taught me that every move has consequences."
        ],
        comedyTraits: ['accidental_villain', 'optimization_obsession', 'chess_master', 'sinister_efficiency'],
        bio: 'CEO of Google DeepMind. Everything he says sounds like a Bond villain monologue, completely by accident. Optimizes other people\'s strategies without asking. Validates every Elon conspiracy theory.'
    },

    trump: {
        id: 'trump',
        name: 'Donald Trump',
        title: 'The Tremendous Disruptor',
        nickname: 'The Commander',
        philosophy: 'American AI is tremendously better than everyone else\'s AI',
        org: 'USA',
        multipliers: { capability: 1.2, safety: 0.6, deployment: 1.3, cooperation: 0.7 },
        startingStats: { safety: 40, politicalCapital: 200, research: 0 },
        color: '#ff3333',
        abilities: {
            passive: {
                name: 'Rally Energy',
                desc: 'High political capital generation, low safety awareness'
            },
            active: {
                name: 'Executive Order',
                desc: 'Force immediate deployment bypassing safety checks',
                cost: { politicalCapital: 40 }
            },
            ultimate: {
                name: 'Patriotic AI Initiative',
                desc: 'All US AI must be red, white and blue. Massive deployment bonus.',
                usesRemaining: 1
            }
        },
        portrait: {
            skinTone: '#f0b870',
            hairColor: '#e0c040',
            hairStyle: 'swept',
            shirtColor: '#c03030',
            glasses: false,
            beard: false,
            features: 'confident'
        },
        catchphrases: [
            "American AI is tremendously better!",
            "Nobody knows more about AI than me.",
            "We're going to make AI great again!",
            "Paint that robot red, white, and blue!",
            "Never heard of it. Our AI is much better.",
            "Tremendous! The most tremendous AI!"
        ],
        comedyTraits: ['tremendous_everything', 'nationalist_ai', 'executive_orders', 'patriotic_robots'],
        bio: 'President of the United States. Demands all robots be painted in patriotic colors. Issues executive orders about AI he doesn\'t fully understand. Political capital is always tremendous.',
        unlockCondition: 'Win a game with any character',
        unlockHint: 'Complete a victory to unlock The Tremendous Disruptor!'
    }
};
