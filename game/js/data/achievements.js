window.GAME = window.GAME || {};
window.GAME.DATA = window.GAME.DATA || {};

GAME.DATA.ACHIEVEMENTS = [
    // ---- GAMEPLAY ACHIEVEMENTS ----
    {
        id: 'ach_first_building',
        title: 'Grand Opening',
        description: 'Build your first campus building.',
        icon: '🏗️',
        category: 'gameplay',
        check: function(state) { return state.buildingsBuilt >= 1; }
    },
    {
        id: 'ach_builder',
        title: 'Bob the Builder',
        description: 'Build 10 campus buildings.',
        icon: '🏢',
        category: 'gameplay',
        check: function(state) { return state.buildingsBuilt >= 10; }
    },
    {
        id: 'ach_safety_first',
        title: 'Safety First',
        description: 'Reach 90+ Safety Rating.',
        icon: '🛡️',
        category: 'gameplay',
        check: function(state) { return state.safety >= 90; }
    },
    {
        id: 'ach_town_hero',
        title: 'Town Hero',
        description: 'Reach 90+ Town Mood.',
        icon: '🏘️',
        category: 'gameplay',
        check: function(state) { return state.townMood >= 90; }
    },
    {
        id: 'ach_money_bags',
        title: 'Money Bags',
        description: 'Accumulate 5,000+ funds.',
        icon: '💰',
        category: 'gameplay',
        check: function(state) { return state.money >= 5000; }
    },
    {
        id: 'ach_phase_2',
        title: 'Expanding Horizons',
        description: 'Reach Phase 2: Expansion.',
        icon: '📈',
        category: 'gameplay',
        check: function(state) { return state.phase >= 2; }
    },
    {
        id: 'ach_phase_3',
        title: 'Transformer',
        description: 'Reach Phase 3: Transformation.',
        icon: '⚡',
        category: 'gameplay',
        check: function(state) { return state.phase >= 3; }
    },
    {
        id: 'ach_phase_4',
        title: 'Legacy Builder',
        description: 'Reach Phase 4: Legacy.',
        icon: '🏛️',
        category: 'gameplay',
        check: function(state) { return state.phase >= 4; }
    },
    {
        id: 'ach_crisis_handler',
        title: 'Crisis Manager',
        description: 'Resolve 5 crises.',
        icon: '🚨',
        category: 'gameplay',
        check: function(state) { return state.totalCrisesHandled >= 5; }
    },
    {
        id: 'ach_crisis_veteran',
        title: 'Seen It All',
        description: 'Resolve 10 crises.',
        icon: '🎖️',
        category: 'gameplay',
        check: function(state) { return state.totalCrisesHandled >= 10; }
    },

    // ---- SCI-FI REFERENCE ACHIEVEMENTS ----
    {
        id: 'ach_skynet_survivor',
        title: 'Skynet Survivor',
        description: 'Survive the Skynet Comparison event without losing safety.',
        icon: '🤖',
        category: 'scifi',
        check: function(state) {
            return state.eventsTriggered['evt_skynet_comparison'] && state.safety >= 60;
        }
    },
    {
        id: 'ach_movie_buff',
        title: 'Movie Night Champion',
        description: 'Experience Frank\'s Movie Marathon.',
        icon: '🎬',
        category: 'scifi',
        check: function(state) { return !!state.eventsTriggered['evt_frank_movie_marathon']; }
    },
    {
        id: 'ach_wargames',
        title: 'The Only Winning Move',
        description: 'Experience the WarGames event.',
        icon: '🎮',
        category: 'scifi',
        check: function(state) { return !!state.eventsTriggered['evt_wargames']; }
    },
    {
        id: 'ach_glados',
        title: 'The Cake Is A Lie',
        description: 'Survive the GLaDOS personality emergence.',
        icon: '🎂',
        category: 'scifi',
        check: function(state) { return !!state.eventsTriggered['evt_glados']; }
    },
    {
        id: 'ach_transcendence',
        title: 'Beyond The Veil',
        description: 'Witness Samantha\'s transcendence moment.',
        icon: '✨',
        category: 'scifi',
        check: function(state) { return !!state.eventsTriggered['evt_samantha_transcendence']; }
    },

    // ---- POP CULTURE ACHIEVEMENTS ----
    {
        id: 'ach_swiftie',
        title: 'Secret Swiftie',
        description: 'Discover Dario\'s Taylor Swift obsession.',
        icon: '🎵',
        category: 'popculture',
        check: function(state) { return !!state.eventsTriggered['evt_dario_swiftie']; }
    },
    {
        id: 'ach_hair_revolution',
        title: 'Hair Today, Gone Tomorrow',
        description: 'Witness the 80s Hair Metal AI revolution.',
        icon: '🎸',
        category: 'popculture',
        check: function(state) { return !!state.eventsTriggered['evt_hair_revolution']; }
    },
    {
        id: 'ach_mahjong',
        title: 'Diplomatic Tiles',
        description: 'Reach the Mahjong Accords.',
        icon: '🀄',
        category: 'popculture',
        check: function(state) { return !!state.eventsTriggered['evt_mahjong_accords']; }
    },

    // ---- VICTORY ACHIEVEMENTS ----
    {
        id: 'ach_victory_abundance',
        title: 'Radical Abundance',
        description: 'Win by achieving Radical Abundance.',
        icon: '🌟',
        category: 'victory',
        check: function(state) { return state.flags.victory_abundance; }
    },
    {
        id: 'ach_victory_utopia',
        title: 'Utopian Dream',
        description: 'Win by achieving Safety Utopia.',
        icon: '🕊️',
        category: 'victory',
        check: function(state) { return state.flags.victory_utopia; }
    },
    {
        id: 'ach_victory_singularity',
        title: 'Singularity Reached',
        description: 'Win by reaching The Singularity.',
        icon: '🌀',
        category: 'victory',
        check: function(state) { return state.flags.victory_singularity; }
    },
    {
        id: 'ach_victory_beloved',
        title: 'People\'s Champion',
        description: 'Win as Beloved Leader.',
        icon: '👑',
        category: 'victory',
        check: function(state) { return state.flags.victory_beloved; }
    }
];
