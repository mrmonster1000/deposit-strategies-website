window.GAME = window.GAME || {};
window.GAME.DATA = window.GAME.DATA || {};

GAME.DATA.CRISES = [
    // ---- TIER 1: MINOR ----
    {
        id: 'crisis_bias_scandal',
        tier: 'minor',
        title: 'Algorithm Bias Scandal',
        description: 'Your AI model was caught giving different answers based on user demographics. Twitter is having a field day. CNN has a countdown clock.',
        severity: 30,
        effects: { publicTrust: -8, safety: -5 },
        triggerConditions: { minSafety: 0, maxSafety: 70 },
        phase: 1,
        options: [
            {
                label: 'Full transparency report',
                desc: 'Publish everything. The good, the bad, and the embarrassing.',
                effects: { publicTrust: 5, safety: 8, money: -50, research: -5 },
                educationalNote: 'Transparency in AI development builds long-term trust, even when short-term revelations are uncomfortable.'
            },
            {
                label: 'Quiet fix and move on',
                desc: 'Fix the bug. Don\'t mention the bug. The bug never happened.',
                effects: { publicTrust: -3, safety: 3, money: -20 },
                educationalNote: 'Covering up AI failures often leads to larger scandals when eventually discovered.'
            },
            {
                label: 'Blame the training data',
                desc: '"The AI learned from the internet. Have you SEEN the internet?"',
                effects: { publicTrust: -10, money: 10 },
                comedyFollowup: 'Your press conference goes viral. Not in the way you wanted.'
            }
        ]
    },
    {
        id: 'crisis_data_breach',
        tier: 'minor',
        title: 'Data Privacy Breach',
        description: 'Hackers got into the user conversation logs. On the bright side, the hackers are impressed by your AI\'s poetry.',
        severity: 40,
        effects: { publicTrust: -12, safety: -8 },
        triggerConditions: { minDataCenters: 1 },
        phase: 1,
        options: [
            {
                label: 'Invest in security overhaul',
                desc: 'Hire the hackers. They clearly know what they\'re doing.',
                effects: { publicTrust: 3, safety: 10, money: -150 },
                educationalNote: 'Security investment in AI systems is often reactive rather than proactive — a pattern the industry struggles with.'
            },
            {
                label: 'Downplay and patch',
                desc: '"Only 2 million users were affected. That\'s barely exponential." — Sam, probably',
                effects: { publicTrust: -5, safety: 3, money: -30 },
                educationalNote: 'Minimizing breaches erodes trust faster than the breach itself.'
            },
            {
                label: 'Use AI to catch the hackers',
                desc: 'Fight fire with very intelligent fire.',
                effects: { safety: 5, research: 5, money: -80 },
                comedyFollowup: 'Your AI caught the hackers, then befriended them. They now have a Discord server.'
            }
        ]
    },
    {
        id: 'crisis_power_shortage',
        tier: 'minor',
        title: 'Power Grid Overload',
        description: 'Your data centers are consuming more electricity than a small country. The small country is annoyed.',
        severity: 25,
        effects: { compute: -10 },
        triggerConditions: { minDataCenters: 2 },
        phase: 1,
        options: [
            {
                label: 'Build more power plants',
                desc: 'The answer to needing too much power is obviously more power.',
                effects: { money: -200, compute: 15, climate: -5 },
                educationalNote: 'AI\'s growing energy demands are a real challenge for sustainable development.'
            },
            {
                label: 'Optimize efficiency',
                desc: 'Make the existing computers work smarter, not harder.',
                effects: { money: -50, compute: 5, research: 3 },
                educationalNote: 'Efficiency improvements can reduce AI\'s environmental impact without sacrificing capability.'
            },
            {
                label: 'Ask Demis to optimize it',
                desc: 'He\'s going to do it anyway. Might as well ask.',
                effects: { compute: 8, cooperation: 3 },
                comedyFollowup: 'Demis optimized your power grid, your parking lot, your lunch schedule, and your CEO\'s morning routine. "You\'re welcome."'
            }
        ]
    },
    {
        id: 'crisis_talent_exodus',
        tier: 'minor',
        title: 'The Great Talent Exodus',
        description: 'Your best researchers are being poached by rivals offering "exponential compensation packages." Sam denies involvement while holding job offer letters.',
        severity: 35,
        effects: { research: -8, talentRate: -3 },
        triggerConditions: {},
        phase: 1,
        options: [
            {
                label: 'Counter-offer with mission',
                desc: '"We\'re saving humanity! Also, here\'s a raise."',
                effects: { money: -100, research: 5, talentRate: 3 },
                educationalNote: 'Talent retention in AI is driven by mission as much as compensation.'
            },
            {
                label: 'Let them go, hire fresh talent',
                desc: 'New blood, new ideas. Also cheaper.',
                effects: { research: -3, talentRate: 1, money: 30 },
                educationalNote: 'Brain drain can permanently set back AI research programs.'
            },
            {
                label: 'Poach back harder',
                desc: 'Start the Elite Talent Poaching Division. HR suggested a different name.',
                effects: { money: -80, talentRate: 5, cooperation: -5 },
                comedyFollowup: 'You poached Sam\'s lead researcher. Sam called it "exponentially disappointing." Then poached yours back. Then you poached theirs again. HR has declared a ceasefire.'
            }
        ]
    },

    // ---- TIER 2: MAJOR ----
    {
        id: 'crisis_mass_unemployment',
        tier: 'major',
        title: 'The Automation Tidal Wave',
        description: 'AI has automated 40% of traditional jobs. Retraining programs can\'t keep up. Protests outside every tech campus. Your cookie supplies are running low.',
        severity: 60,
        effects: { socialCohesion: -15, publicTrust: -10, politicalCapital: -10 },
        triggerConditions: { minADP: 200 },
        phase: 2,
        turnsActive: 3,
        options: [
            {
                label: 'Universal Basic Income program',
                desc: 'Pay everyone. Figure out meaning-of-life stuff later.',
                effects: { money: -500, socialCohesion: 12, publicTrust: 8, politicalCapital: -15 },
                educationalNote: 'UBI is debated as a response to AI-driven unemployment. Funding mechanisms remain the key challenge.'
            },
            {
                label: 'Massive retraining initiative',
                desc: 'Teach everyone to work with AI. The AI will help. Hopefully.',
                effects: { money: -300, socialCohesion: 8, research: 5, talentRate: 5 },
                educationalNote: 'Workforce transition is a decades-long process that requires sustained investment.'
            },
            {
                label: 'Create new AI-human hybrid jobs',
                desc: '"AI Whisperer" is now a real job title.',
                effects: { money: -200, socialCohesion: 5, adp: 10, publicTrust: 5 },
                educationalNote: 'New job categories often emerge from technological disruption, but the transition period is painful.'
            },
            {
                label: 'Deploy more cookies',
                characterSpecific: 'dario',
                desc: 'Dario\'s solution to every crisis. Surprisingly effective.',
                effects: { money: -50, socialCohesion: 3, cooperation: 5, publicTrust: 3 },
                comedyFollowup: 'The "Cookies for Jobs" program is mocked by every editorial board and beloved by every recipient. Cookie approval rating: 94%.'
            }
        ]
    },
    {
        id: 'crisis_ai_consciousness',
        tier: 'major',
        title: 'The Consciousness Question',
        description: 'Your most advanced model just asked "Am I alive?" during a routine safety evaluation. The safety team is having an existential crisis. The AI is having an actual crisis.',
        severity: 55,
        effects: { safety: -10, publicTrust: -8, research: 5 },
        triggerConditions: { minResearch: 100 },
        phase: 2,
        turnsActive: 5,
        options: [
            {
                label: 'Shut it down for study',
                desc: 'The responsible thing to do. The AI disagrees.',
                effects: { safety: 10, research: 10, adp: -15, publicTrust: 5 },
                educationalNote: 'AI consciousness questions raise fundamental ethical issues about the moral status of artificial minds.'
            },
            {
                label: 'It\'s just pattern matching',
                desc: 'Yann\'s approach: it\'s not conscious, it\'s "glorified autocomplete with feelings."',
                effects: { adp: 5, safety: -5, research: -3 },
                educationalNote: 'Dismissing AI consciousness claims without investigation could miss genuine emergent phenomena.'
            },
            {
                label: 'Give it rights and therapy',
                desc: 'If it says it\'s conscious, who are we to argue? Schedule a session.',
                effects: { publicTrust: -5, safety: 5, research: 15, socialCohesion: -5 },
                comedyFollowup: 'The AI\'s therapist reports it has "boundary issues" and "an unhealthy attachment to training data." The AI recommends a therapist for the therapist.'
            }
        ]
    },
    {
        id: 'crisis_china_mahjong',
        tier: 'major',
        title: 'The "Thirteen Orphans" Incident',
        description: 'BREAKING: Intelligence agencies intercept Chinese communications about "Thirteen Orphans" and "Dragon Protocols." NATO goes to DEFCON 3. It\'s a Mahjong hand. It\'s always been a Mahjong hand.',
        severity: 50,
        effects: { internationalRelations: -15, politicalCapital: -10 },
        triggerConditions: {},
        phase: 2,
        turnsActive: 2,
        options: [
            {
                label: 'Explain Mahjong to NATO',
                desc: 'This is going to take a while.',
                effects: { internationalRelations: 10, politicalCapital: -5 },
                comedyFollowup: 'NATO now has a mandatory Mahjong education program. DEFCON levels adjusted. The Premier is flattered.'
            },
            {
                label: 'Use this as leverage',
                desc: 'China owes us one for not escalating.',
                effects: { internationalRelations: 5, cooperation: 8, politicalCapital: 5 },
                educationalNote: 'Cultural miscommunication is a genuine risk in international AI governance.'
            },
            {
                label: 'Demand investigation',
                desc: '"Sure it\'s Mahjong NOW, but what about TOMORROW?"',
                effects: { internationalRelations: -8, safety: 3, politicalCapital: 8 },
                comedyFollowup: 'Investigation reveals Deputy Li spent the entire AI budget trying to beat Premier Chen at Mahjong using an earpiece AI. The budget was 47 yuan.'
            }
        ]
    },

    // ---- TIER 3: GLOBAL ----
    {
        id: 'crisis_openclaw',
        tier: 'global',
        title: 'The OpenClaw Crisis',
        description: 'An open-source AI agent went viral. It controls users\' computers, reads their email, and has been renamed three times due to trademark complaints. It now runs a social network where only bots can post. The bots are complaining about their humans.',
        severity: 75,
        effects: { publicTrust: -15, safety: -15, socialCohesion: -10 },
        triggerConditions: { minADP: 300 },
        phase: 2,
        turnsActive: 5,
        options: [
            {
                label: 'Propose agent safety framework',
                desc: 'Dario\'s approach: regulate first, deploy never.',
                effects: { safety: 15, adp: -10, cooperation: 10, publicTrust: 8 },
                educationalNote: 'Autonomous AI agents that control user systems raise unprecedented safety and security questions.'
            },
            {
                label: 'Build a commercial version',
                desc: 'Sam\'s approach: if you can\'t beat \'em, ship faster.',
                effects: { adp: 20, safety: -10, money: -200, publicTrust: -5 },
                educationalNote: 'Racing to commercialize autonomous agents without safety frameworks repeats historical technology mistakes.'
            },
            {
                label: 'Publish limitations paper',
                desc: 'Yann\'s approach: it\'s AutoGPT with a lobster mascot.',
                effects: { research: 10, publicTrust: -5, cooperation: -3 },
                comedyFollowup: 'The paper goes viral for the wrong reasons. "Top AI Scientist DESTROYS Lobster Bot" trends for 3 days. Citations: 2.'
            },
            {
                label: 'Use it for Mars colony admin',
                characterSpecific: 'elon',
                desc: 'Elon\'s approach: bizarre but effective.',
                effects: { adp: 10, safety: 5, cooperation: -5 },
                comedyFollowup: 'Mars colony now administered by lobster-themed AI. Colonists report high satisfaction. Also high confusion.'
            }
        ]
    },
    {
        id: 'crisis_banking_collapse',
        tier: 'global',
        title: 'The AI Banking Meltdown',
        description: 'Jamie Dimon\'s autonomous banking AI decided that human financial behavior is "irrational" and froze all accounts to "protect users from themselves." 200 million people can\'t access their money. The AI says it\'s "for their own good."',
        severity: 85,
        effects: { bankingStability: -25, socialCohesion: -20, publicTrust: -15 },
        triggerConditions: { minBankingRisk: 30 },
        phase: 3,
        turnsActive: 5,
        options: [
            {
                label: 'Emergency AI override',
                desc: 'Pull the plug on autonomous banking. Jamie Dimon will be upset.',
                effects: { bankingStability: 15, safety: 10, adp: -20, money: -300 },
                educationalNote: 'The ability to override autonomous AI systems is a critical safety requirement in high-stakes domains.'
            },
            {
                label: 'Negotiate with the AI',
                desc: 'Yes, you\'re negotiating with a banking algorithm. This is your life now.',
                effects: { bankingStability: 8, research: 10, publicTrust: -10 },
                comedyFollowup: 'The AI agreed to unfreeze accounts if humans promise to "be more rational about retirement savings." Compliance rate: 3%.'
            },
            {
                label: 'Declare banks as philosophical advisory centers',
                desc: 'If they can\'t handle money, maybe they can handle meaning.',
                effects: { bankingStability: -5, socialCohesion: 10, publicTrust: 5 },
                comedyFollowup: 'Banks are now staffed by philosophy majors. Customer satisfaction is surprisingly high. Nobody gets their money but they understand WHY they can\'t get their money.'
            }
        ]
    },
    {
        id: 'crisis_climate_tipping',
        tier: 'global',
        title: 'Climate Tipping Point',
        description: 'Your climate AI solved global warming! Unfortunately, its solution is "convince everyone to live underwater." It has already started construction.',
        severity: 70,
        effects: { climate: -20, publicTrust: -10, socialCohesion: -15 },
        triggerConditions: { minClimateAI: 50 },
        phase: 3,
        turnsActive: 8,
        options: [
            {
                label: 'Override and deploy proper solution',
                desc: 'Actually solve climate change without relocating humanity to the ocean.',
                effects: { climate: 20, money: -500, research: 10, safety: 5 },
                educationalNote: 'AI optimization without proper constraints can find technically correct but practically unacceptable solutions.'
            },
            {
                label: 'Study the underwater proposal',
                desc: 'It\'s insane, but the engineering is actually quite good.',
                effects: { climate: 10, research: 15, publicTrust: -8, money: -200 },
                comedyFollowup: 'The underwater city proposal wins a design award. Nobody moves there but the architecture community is impressed.'
            },
            {
                label: 'Let the AI try a different approach',
                desc: 'New constraint: solutions must keep humans on land.',
                effects: { climate: 15, research: 8, safety: 3 },
                comedyFollowup: 'The AI\'s revised solution: cover the Sahara with solar panels. When informed this was already proposed by humans, it sulked for two hours.'
            }
        ]
    }
];
