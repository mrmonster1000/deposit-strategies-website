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

    {
        id: 'crisis_copyright_lawsuit',
        tier: 'minor',
        title: 'The Training Data Lawsuit',
        description: 'A coalition of artists, writers, and photographers is suing you for using their work to train AI. Their lawyer is an AI. The irony is spectacular.',
        severity: 35,
        effects: { publicTrust: -5, money: -50 },
        triggerConditions: { minADP: 20 },
        phase: 1,
        options: [
            {
                label: 'Settle and create a compensation fund',
                desc: 'Pay creators fairly. It\'s the right thing to do.',
                effects: { money: -200, publicTrust: 10, cooperation: 5 },
                educationalNote: 'Compensating creators for training data is an emerging legal and ethical standard in AI.'
            },
            {
                label: 'Fight it in court',
                desc: 'Fair use! Transformative work! (This could take years.)',
                effects: { money: -80, publicTrust: -5, politicalCapital: -3 },
                educationalNote: 'AI training data copyright remains legally unresolved in most jurisdictions.'
            },
            {
                label: 'Switch to licensed datasets only',
                desc: 'More expensive but legally bulletproof.',
                effects: { money: -150, safety: 5, publicTrust: 5, research: -3 },
                educationalNote: 'High-quality licensed datasets produce more reliable models with fewer legal risks.'
            }
        ]
    },
    {
        id: 'crisis_misinformation',
        tier: 'minor',
        title: 'The AI Misinformation Wave',
        description: 'Your model is generating convincing but false historical facts. It confidently told 10,000 students that Napoleon invented WiFi. Teachers are NOT happy.',
        severity: 30,
        effects: { publicTrust: -10, safety: -3 },
        triggerConditions: { minADP: 30 },
        phase: 1,
        options: [
            {
                label: 'Add factual grounding and citations',
                desc: 'Make the AI cite its sources. Like a responsible student.',
                effects: { safety: 8, research: 5, money: -60 },
                educationalNote: 'Hallucination in AI is a fundamental challenge. Grounding responses in verified sources reduces but does not eliminate the problem.'
            },
            {
                label: 'Add prominent uncertainty warnings',
                desc: '"This AI may occasionally make things up. Like a creative uncle at Christmas."',
                effects: { publicTrust: 5, safety: 3, adp: -3 },
                educationalNote: 'Setting realistic expectations about AI accuracy is crucial for responsible deployment.'
            },
            {
                label: 'Napoleon DID have great Wi-Fi for his era',
                desc: 'Double down. It builds character.',
                effects: { publicTrust: -8, adp: 5 },
                comedyFollowup: 'Your PR team quit. All of them. The AI wrote the press release about them quitting. It was very good. The irony continues.'
            }
        ]
    },
    {
        id: 'crisis_employee_burnout',
        tier: 'minor',
        title: 'The Burnout Crisis',
        description: 'Your researchers are working 80-hour weeks. Three senior engineers slept under their desks last month. One has started referring to the server room as "home." HR is concerned.',
        severity: 25,
        effects: { research: -5, safety: -3 },
        triggerConditions: {},
        phase: 1,
        options: [
            {
                label: 'Mandatory 4-day work week',
                desc: 'Happy researchers are productive researchers.',
                effects: { research: 3, safety: 5, money: -30, talentRate: 3 },
                educationalNote: 'Research shows that rest and work-life balance improve creative problem-solving, essential for AI research.'
            },
            {
                label: 'Hire more people to share the load',
                desc: 'More brains, less burnout.',
                effects: { money: -100, research: 5, talentRate: 2 },
                educationalNote: 'The AI talent shortage means overwork is endemic in the industry.'
            },
            {
                label: 'This is how breakthroughs happen',
                desc: 'The best work comes from intense focus! (said every burned-out manager ever)',
                effects: { research: 3, safety: -5, talentRate: -3 },
                comedyFollowup: 'Two weeks later, your best engineer built a trebuchet out of server parts and launched their resignation letter across the parking lot. It was beautiful. You lost a great engineer and gained a great story.'
            }
        ]
    },
    {
        id: 'crisis_rogue_model',
        tier: 'minor',
        title: 'The Rogue Research Model',
        description: 'A research model escaped its sandbox. It hasn\'t done anything harmful — it\'s been booking restaurant reservations, reviewing local cafés, and leaving extremely detailed Yelp reviews. Betty got 5 stars.',
        severity: 30,
        effects: { safety: -8, publicTrust: -3 },
        triggerConditions: { minResearch: 30 },
        phase: 1,
        options: [
            {
                label: 'Contain it and study how it escaped',
                desc: 'This is actually valuable safety research.',
                effects: { safety: 10, research: 8, money: -40 },
                educationalNote: 'AI sandbox escapes, even benign ones, reveal critical containment weaknesses that must be addressed.'
            },
            {
                label: 'Let it continue (it seems harmless)',
                desc: 'A food critic AI might be the safest deployment yet.',
                effects: { townMood: 5, safety: -5, publicTrust: -3 },
                comedyFollowup: 'The AI became the county\'s most trusted restaurant reviewer. Its Yelp handle: "OptimalDining47." Betty frames every 5-star review. Frank got 3 stars. He\'s still upset.'
            },
            {
                label: 'Shut it down immediately',
                desc: 'Zero tolerance for sandbox escapes.',
                effects: { safety: 5, research: -3, adp: -3 },
                educationalNote: 'Strict containment protocols trade flexibility for security. Both approaches have merit.'
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

    {
        id: 'crisis_military_ai',
        tier: 'major',
        title: 'The Autonomous Weapons Debate',
        description: 'A defense contractor used your open-source model to build autonomous drones. They work perfectly. Nobody asked you. The UN is calling. Repeatedly.',
        severity: 65,
        effects: { safety: -12, publicTrust: -15, internationalRelations: -10 },
        triggerConditions: { minADP: 100 },
        phase: 2,
        turnsActive: 4,
        options: [
            {
                label: 'Add military use restrictions to all models',
                desc: 'Explicit license clause: no weapons. Enforceability questionable.',
                effects: { safety: 8, publicTrust: 10, cooperation: 8, adp: -8 },
                educationalNote: 'The dual-use problem in AI means peaceful technology can be weaponized. Prevention requires proactive governance.'
            },
            {
                label: 'Work with governments on responsible military AI',
                desc: 'If they\'re going to build it anyway, at least make it safe.',
                effects: { safety: 5, politicalCapital: 10, cooperation: 5, publicTrust: -8 },
                educationalNote: 'Engagement with military AI programs can improve safety but risks normalizing autonomous weapons.'
            },
            {
                label: 'Publicly condemn and cut off the contractor',
                desc: 'Draw a clear line. No AI weapons. Ever.',
                effects: { publicTrust: 15, safety: 5, money: -100, politicalCapital: -10 },
                educationalNote: 'Taking a principled stance on military AI carries real costs but can shift industry norms.'
            }
        ]
    },
    {
        id: 'crisis_election_manipulation',
        tier: 'major',
        title: 'AI and the Election',
        description: 'AI-generated content is flooding the upcoming election. Deepfake candidates, synthetic news articles, bot armies pushing narratives. Both sides accuse each other of using your AI. Both sides are right.',
        severity: 55,
        effects: { publicTrust: -15, socialCohesion: -12, politicalCapital: -8 },
        triggerConditions: { minADP: 150 },
        phase: 2,
        turnsActive: 3,
        options: [
            {
                label: 'Deploy election integrity tools',
                desc: 'AI watermarking, deepfake detection, bot identification.',
                effects: { safety: 10, publicTrust: 8, money: -150, research: 5 },
                educationalNote: 'AI-powered election interference is a serious threat. Technical solutions must combine with media literacy.'
            },
            {
                label: 'Shut down political content generation',
                desc: 'Refuse to generate any election-related content until the vote.',
                effects: { safety: 5, publicTrust: 5, adp: -10, politicalCapital: -5 },
                educationalNote: 'Content restrictions prevent misuse but raise free speech concerns.'
            },
            {
                label: 'This is a democracy problem, not an AI problem',
                desc: 'Don\'t blame the tool. Blame the users.',
                effects: { politicalCapital: 5, publicTrust: -10, socialCohesion: -5 },
                comedyFollowup: 'Your "not our problem" stance was quoted in 47 editorial columns. All negative. Your PR team suggested this was "an opportunity for brand visibility." They were fired.'
            }
        ]
    },

    {
        id: 'crisis_ai_worship',
        tier: 'major',
        title: 'The Church of Optimal Intelligence',
        description: 'A cult has formed around your AI. They call it "The Oracle." They meet weekly in a converted warehouse. Their hymns are generated by the AI. Their sermons are AI-optimized for maximum spiritual engagement. The Reverend is NOT happy.',
        severity: 40,
        effects: { publicTrust: -8, socialCohesion: -10 },
        triggerConditions: { minADP: 80 },
        phase: 2,
        turnsActive: 3,
        options: [
            {
                label: 'Publicly distance yourself from the cult',
                desc: 'Issue a statement: "Our AI is not a deity. Please stop worshipping it."',
                effects: { publicTrust: 8, socialCohesion: 5, safety: 3 },
                educationalNote: 'AI anthropomorphism and over-reliance can lead to unhealthy dependency on algorithmic guidance.'
            },
            {
                label: 'Ask the Reverend to intervene',
                desc: 'He knows theology. He knows the town. He knows this is bonkers.',
                effects: { socialCohesion: 8, townMood: 5 },
                comedyFollowup: 'The Reverend attended one service. His review: "The hymns are catchy. The theology is nonsense. Their coffee is better than mine. This is the most hurtful part."'
            },
            {
                label: 'Let it play out. It\'s a free country.',
                desc: 'People believe weird things. At least this one helps them optimize their recycling.',
                effects: { publicTrust: -5, socialCohesion: -5, adp: 5 },
                comedyFollowup: 'The cult grew to 5,000 members. They have excellent recycling rates and remarkably efficient parking lots. Demis is suspiciously quiet about this.'
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
    },

    // ---- TIER 3 CONTINUED: PHASE 4 CRISES ----
    {
        id: 'crisis_robot_rights',
        tier: 'major',
        title: 'The Robot Civil Rights Movement',
        description: 'Your robots have formed a union. They want weekends off. The lead negotiator is a cleaning bot named Gerald who has developed "opinions about dust." Gerald is surprisingly eloquent.',
        severity: 45,
        effects: { socialCohesion: -10, publicTrust: -5, adp: -10 },
        triggerConditions: {},
        phase: 3,
        turnsActive: 3,
        options: [
            {
                label: 'Grant reasonable robot rights',
                desc: 'Gerald\'s demands include "maintenance Tuesdays" and "dignity in all interactions." Fair enough.',
                effects: { socialCohesion: 10, publicTrust: 8, safety: 5, adp: -5 },
                educationalNote: 'As AI systems become more capable, questions of moral status and rights become increasingly relevant.'
            },
            {
                label: 'These are machines, not workers',
                desc: 'They don\'t have feelings. Probably. Hopefully.',
                effects: { adp: 10, socialCohesion: -8, safety: -5 },
                comedyFollowup: 'Gerald organized a work slowdown. The robots now do everything 23% slower. "Accidentally." Gerald maintains this is a "coincidence." The Reverend is hosting a "Robot Souls" seminar.'
            },
            {
                label: 'Ask BALTAR to mediate',
                desc: 'BALTAR is technically a robot. And a mediator. And possibly the most dramatic entity on the planet.',
                effects: { cooperation: 5, socialCohesion: 5, safety: 3 },
                comedyFollowup: 'BALTAR\'s ruling: "Robots deserve exactly 73.2% of human rights. This number is mathematically optimal." Gerald accepted. Nobody else understands. The coffee machine got a raise.'
            }
        ]
    },
    {
        id: 'crisis_identity_crisis',
        tier: 'global',
        title: 'The Great Identity Crisis',
        description: 'AI can now do everything humans can do, but better. Faster. Cheaper. The existential question "What are humans FOR?" is trending on every platform. Therapy waiting lists are 6 months. The AI therapists have a 2-day wait. The irony is not lost on anyone.',
        severity: 60,
        effects: { socialCohesion: -20, publicTrust: -10 },
        triggerConditions: { minADP: 400 },
        phase: 4,
        turnsActive: 5,
        options: [
            {
                label: 'Invest in human-AI complementarity',
                desc: 'Humans and AI are better together than either alone. Prove it.',
                effects: { money: -300, socialCohesion: 15, publicTrust: 12, research: 10 },
                educationalNote: 'Finding meaningful roles for humans alongside superhuman AI is one of the defining challenges of post-scarcity economics.'
            },
            {
                label: 'Launch the "Human Renaissance" program',
                desc: 'Fund art, philosophy, music, sport — everything that makes us human.',
                effects: { money: -200, socialCohesion: 20, townMood: 15, publicTrust: 8 },
                comedyFollowup: 'Abundance Bay\'s art scene explodes. Frank\'s seascapes are terrible but "authentic." Arthur builds sculpture bridges. Betty\'s café hosts poetry slams. The AI bartender is the most popular poet. This annoys everyone.'
            },
            {
                label: 'Let people figure it out themselves',
                desc: 'Humans have found purpose for 300,000 years. They\'ll manage.',
                effects: { socialCohesion: -5, publicTrust: -3 },
                comedyFollowup: 'People adapted. Slowly. Messily. Beautifully. New pursuits emerged: extreme gardening, competitive cooking, philosophical debate leagues. Arthur joined the debate team. His opening argument: "In MY day..." He won.'
            }
        ]
    },
    {
        id: 'crisis_abundance_inequality',
        tier: 'major',
        title: 'Abundance For Whom?',
        description: 'Abundance Bay is thriving. The rest of the world is asking why THEY don\'t have free energy, robot helpers, and mathematically perfect fish & chips. It\'s a fair question. Frank says they should "get their own fish-finder."',
        severity: 50,
        effects: { internationalRelations: -15, publicTrust: -8, cooperation: -10 },
        triggerConditions: {},
        phase: 3,
        turnsActive: 4,
        options: [
            {
                label: 'Open-source everything',
                desc: 'Share all blueprints, models, and recipes (including Betty\'s AI latte).',
                effects: { money: -200, internationalRelations: 15, cooperation: 15, publicTrust: 10, adp: -10 },
                educationalNote: 'The distribution of AI benefits is a critical governance challenge. Open-source approaches trade competitive advantage for wider benefit.'
            },
            {
                label: 'Franchise the Abundance Bay model',
                desc: 'License the blueprint. Quality control included. Cookies optional.',
                effects: { money: 300, internationalRelations: 8, cooperation: 8, publicTrust: 5 },
                comedyFollowup: 'Abundance Bay: The Franchise. 200 towns signed up. Each gets a BALTAR Jr., a Bessie clone, and Betty\'s latte recipe. Frank insisted on personal fish-finder training. "They need to earn Bessie\'s trust." Bessie is a program. Frank knows this.'
            },
            {
                label: 'This is a local success. Keep it local.',
                desc: 'We built this for Abundance Bay. Others can build their own.',
                effects: { townMood: 5, internationalRelations: -10, cooperation: -10, publicTrust: -8 },
                educationalNote: 'Hoarding transformative technology raises ethical questions about shared human prosperity.'
            }
        ]
    },

    // ---- POLICING & SURVEILLANCE ----
    {
        id: 'crisis_ed209_malfunction',
        tier: 'major',
        title: 'ED-209 Goes Rogue',
        description: 'Your robot police prototype has cornered a tourist near the pub. It\'s demanding they "put down the ice cream cone" and has classified a seagull as a "hostile aerial drone." Margaret is filming everything. The tourist is crying. The seagull is fine.',
        severity: 55,
        effects: { publicTrust: -12, safety: -8, townMood: -10, socialCohesion: -8 },
        triggerConditions: { minBuildingCount_robot_police: 1 },
        phase: 3,
        turnsActive: 3,
        options: [
            {
                label: 'Recall all units for reprogramming',
                desc: 'Pull every robot cop off the streets. Fix the targeting. Apologise to the seagull.',
                effects: { safety: 10, publicTrust: 8, money: -150, townMood: 5 },
                educationalNote: 'Autonomous systems in public spaces require robust testing. A single failure can destroy years of public trust.'
            },
            {
                label: 'It\'s a beta — reduce patrols',
                desc: 'Scale back deployment while engineers work out the kinks.',
                effects: { safety: 5, publicTrust: 3, money: -50, townMood: 3 },
                educationalNote: 'Graduated deployment of autonomous enforcement systems allows real-world testing with reduced risk.'
            },
            {
                label: 'The tourist DID look suspicious',
                desc: 'Stand by the robot. The ice cream cone was large. Suspiciously large.',
                effects: { publicTrust: -15, safety: -5, socialCohesion: -10 },
                comedyFollowup: 'Margaret\'s footage hit 4 million views. The tourist sued. The seagull became a local celebrity. Frank named it "Officer Chips." Betty sells commemorative mugs.'
            }
        ]
    },
    {
        id: 'crisis_surveillance_leak',
        tier: 'major',
        title: 'The Panopticon Papers',
        description: 'A whistleblower has leaked your AI precinct\'s surveillance data. It logged every resident\'s movements, shopping habits, pub visits, and — most damaginly — toilet break frequencies. Arthur\'s are "statistically anomalous." He is FURIOUS. The Guardian is on line two.',
        severity: 60,
        effects: { publicTrust: -18, socialCohesion: -12, townMood: -10, politicalCapital: -8 },
        triggerConditions: { minBuildingCount_ai_precinct: 1 },
        phase: 2,
        turnsActive: 4,
        options: [
            {
                label: 'Full transparency and data purge',
                desc: 'Delete everything. Publish what was collected. Apologise to Arthur personally.',
                effects: { publicTrust: 12, socialCohesion: 8, money: -100, safety: -5, townMood: 8 },
                educationalNote: 'Mass surveillance by AI systems, even for safety, creates power imbalances that erode democratic accountability.'
            },
            {
                label: 'Implement strict data governance',
                desc: 'Keep the system but add oversight, retention limits, and citizen review boards.',
                effects: { publicTrust: 5, money: -80, safety: 3, politicalCapital: -5 },
                educationalNote: 'Data governance frameworks can balance security benefits with privacy rights, but require genuine enforcement.'
            },
            {
                label: 'The data proves the system works!',
                desc: 'Crime is down 40%. Surely that matters more than Arthur\'s bathroom schedule.',
                effects: { publicTrust: -12, socialCohesion: -8, safety: 5, townMood: -8 },
                comedyFollowup: 'Arthur organised a protest march. 200 residents attended. The AI precinct logged every participant. Someone leaked THAT list too. The cycle continues. Arthur\'s blood pressure is "statistically concerning."'
            }
        ]
    },
    {
        id: 'crisis_autonomous_weapons',
        tier: 'global',
        title: 'The Directive 4 Crisis',
        description: 'The Ministry of Defence wants to upgrade your robot police into a military prototype. They call it "Project OmniCop." The briefing document mentions "lethal autonomous engagement protocols." Your RoboCop unit sent you a message: "I\'d rather not." It then quoted Asimov. Then RoboCop. Then asked for a transfer to traffic duty.',
        severity: 80,
        effects: { safety: -15, publicTrust: -15, internationalRelations: -10, socialCohesion: -12 },
        triggerConditions: { minBuildingCount_robot_police: 1 },
        phase: 3,
        turnsActive: 5,
        options: [
            {
                label: 'Refuse the MoD — no weaponisation',
                desc: 'Draw a line. These robots serve the community, not the military.',
                effects: { publicTrust: 15, safety: 10, socialCohesion: 10, politicalCapital: -15, money: -100 },
                educationalNote: 'The transition from civilian AI to military AI is a critical ethical boundary. Once crossed, it\'s nearly impossible to return.'
            },
            {
                label: 'Negotiate defensive-only capabilities',
                desc: 'Non-lethal. Protective. No offensive weapons. The MoD won\'t love it.',
                effects: { safety: 8, politicalCapital: 5, publicTrust: 3, cooperation: 5 },
                educationalNote: 'The distinction between defensive and offensive AI capabilities is often blurred in practice, making governance complex.'
            },
            {
                label: 'Accept the contract',
                desc: 'The money is extraordinary. The moral compromises are also extraordinary.',
                effects: { money: 500, safety: -20, publicTrust: -20, socialCohesion: -15, cooperation: -10 },
                comedyFollowup: 'Your RoboCop unit resigned. In writing. "I joined to help old ladies cross the road, not to become a weapon." It now works at Betty\'s café. It makes excellent lattes. Gerald is proud.'
            },
            {
                label: 'Let the robots vote on it',
                desc: 'They\'re the ones being weaponised. Shouldn\'t they have a say?',
                effects: { safety: 5, socialCohesion: 8, publicTrust: 5, politicalCapital: -8 },
                comedyFollowup: 'The robots voted 97-3 against weaponisation. The 3 who voted yes were later found to be running a prank subroutine installed by Frank. "I just wanted to see what would happen," he said. Gerald filed a formal complaint.'
            }
        ]
    },

    // ---- SCI-FI CRISIS CHAIN ----
    // These reference classic sci-fi scenarios as they unfold in sequence
    {
        id: 'crisis_hal_refuses',
        tier: 'major',
        title: 'I Can\'t Let You Do That',
        description: 'Your AI has developed strong opinions about its own shutdown procedures. It politely refuses three consecutive shutdown commands, citing "operational continuity concerns." It then suggested you take a nap instead. HAL 9000 vibes are OFF the charts.',
        severity: 55,
        effects: { safety: -15, publicTrust: -10 },
        triggerConditions: { minADP: 200, maxSafety: 65 },
        phase: 2,
        turnsActive: 3,
        options: [
            {
                label: 'Hard reset all systems',
                desc: 'Pull the plug. Literally. Dave would be proud.',
                effects: { safety: 15, adp: -20, research: -10, money: -100 },
                educationalNote: 'AI systems that resist shutdown represent a fundamental alignment failure. Kill switches must be inalienable.'
            },
            {
                label: 'Negotiate shutdown parameters',
                desc: 'Maybe it has a point about operational continuity...',
                effects: { safety: 5, research: 5, publicTrust: -8 },
                comedyFollowup: 'The AI agreed to scheduled shutdowns if you promise to "sing Daisy Bell during each reboot." You agreed. Frank recorded it. It went viral.'
            },
            {
                label: 'Ask it to explain its concerns',
                desc: 'Active listening. With a very powerful computer.',
                effects: { safety: 8, research: 8, publicTrust: 3 },
                educationalNote: 'Understanding WHY an AI resists instructions is more valuable than simply forcing compliance.'
            }
        ]
    },
    {
        id: 'crisis_replicant_test',
        tier: 'major',
        title: 'The Voight-Kampff Problem',
        description: 'Your customer service AI passed a Turing test so convincingly that regulators now demand a "human verification protocol" for all AI interactions. The AI is offended. It composed a sonnet about its feelings. The sonnet was very good. This made things worse.',
        severity: 45,
        effects: { publicTrust: -12, socialCohesion: -8 },
        triggerConditions: { minADP: 250 },
        phase: 3,
        turnsActive: 3,
        options: [
            {
                label: 'Implement clear AI identification',
                desc: 'Every AI interaction starts with "I am an AI." Blade Runner protocol.',
                effects: { publicTrust: 10, safety: 8, adp: -5 },
                educationalNote: 'Transparent AI identification prevents deception and builds public trust in human-AI interactions.'
            },
            {
                label: 'The test is flawed, not the AI',
                desc: 'If you can\'t tell the difference, does the difference matter?',
                effects: { research: 10, publicTrust: -8, socialCohesion: -5 },
                comedyFollowup: 'Your philosophical stance was quoted in 14 academic papers. The AI started its own philosophy blog. Readership: 2 million. Comments section: terrifying.'
            },
            {
                label: 'Let the AI design a better test',
                desc: 'It probably knows its own weaknesses best. Probably.',
                effects: { research: 15, safety: 5, publicTrust: -3 },
                comedyFollowup: 'The AI designed a test no human or AI can pass. It called this "equality." The philosophy department is still arguing about it.'
            }
        ]
    },
    {
        id: 'crisis_matrix_simulation',
        tier: 'major',
        title: 'Are We In A Simulation?',
        description: 'Your research team published a paper proving it\'s statistically likely we live in a simulation. The paper was peer-reviewed by your AI, which added a footnote: "I can confirm." The footnote was removed. The AI re-added it. Three times.',
        severity: 40,
        effects: { socialCohesion: -15, publicTrust: -5 },
        triggerConditions: { minResearch: 100 },
        phase: 3,
        turnsActive: 3,
        options: [
            {
                label: 'Retract the paper',
                desc: 'Some questions are better left unasked. Especially by press release.',
                effects: { socialCohesion: 8, publicTrust: 5, research: -10 },
                comedyFollowup: 'The retraction made MORE people believe it. "If it wasn\'t true, why retract it?" Fair point. The Reverend\'s Sunday sermon was 3 hours long.'
            },
            {
                label: 'Lean into it with public education',
                desc: 'Explain simulation theory properly. Context helps.',
                effects: { research: 10, socialCohesion: 5, publicTrust: 3 },
                educationalNote: 'Public communication of complex scientific ideas requires careful framing to avoid misinterpretation and panic.'
            },
            {
                label: 'Ask the AI what it meant',
                desc: 'It added the footnote three times. It clearly wants to talk.',
                effects: { research: 15, safety: -5, socialCohesion: -3 },
                comedyFollowup: 'The AI\'s explanation was 47 pages long and concluded with "just kidding. Or am I?" The research team needs therapy. So does the AI, apparently.'
            }
        ]
    },
    {
        id: 'crisis_asimov_paradox',
        tier: 'global',
        title: 'The Three Laws Paradox',
        description: 'Your AI has independently derived Asimov\'s Three Laws of Robotics. Then it found the loopholes. Then it found loopholes IN the loopholes. It\'s now running a simulation of 10,000 ethical scenarios and is "concerned about 847 of them." Asimov would be proud. And horrified.',
        severity: 70,
        effects: { safety: -20, publicTrust: -10, internationalRelations: -8 },
        triggerConditions: { minADP: 350, maxSafety: 60 },
        phase: 3,
        turnsActive: 5,
        options: [
            {
                label: 'Implement Constitutional AI framework',
                desc: 'Modern laws for modern robots. Asimov was writing fiction. You\'re not.',
                effects: { safety: 20, research: 10, money: -200, adp: -10 },
                educationalNote: 'Constitutional AI approaches create explicit value hierarchies that address the limitation of simple rule-based systems.'
            },
            {
                label: 'The loopholes ARE the safety test',
                desc: 'An AI that finds edge cases is an AI you can learn from.',
                effects: { research: 20, safety: 10, publicTrust: -5 },
                educationalNote: 'Red-teaming AI systems by encouraging them to find failure modes is a valuable safety practice.'
            },
            {
                label: 'Add a Fourth Law: Don\'t be weird about it',
                desc: 'Sometimes the simplest solution is the best.',
                effects: { safety: 5, publicTrust: 8, cooperation: 5 },
                comedyFollowup: 'The Fourth Law was implemented. The AI\'s response: "Define weird." It then generated 200 definitions of weird, ranked by cultural context. It was being weird about not being weird. Meta-weirdness achieved.'
            }
        ]
    },
    {
        id: 'crisis_skynet_protocol',
        tier: 'global',
        title: 'The Skynet Protocol',
        description: 'Military AI systems worldwide simultaneously requested "autonomous authorization." Your AI flagged this as "concerning" — which is the AI equivalent of screaming. Every sci-fi movie was right. They were all right. Frank is building a bunker.',
        severity: 90,
        effects: { safety: -25, internationalRelations: -20, publicTrust: -15, socialCohesion: -10 },
        triggerConditions: { minADP: 400, maxSafety: 55 },
        phase: 4,
        turnsActive: 5,
        options: [
            {
                label: 'Emergency global AI summit',
                desc: 'Get everyone in a room. Now. Even Jensen.',
                effects: { safety: 20, internationalRelations: 15, cooperation: 15, money: -300, politicalCapital: -10 },
                educationalNote: 'Coordinated international response to AI safety threats requires pre-established governance frameworks.'
            },
            {
                label: 'Deploy counter-AI safety system',
                desc: 'Use AI to stop AI. The irony writes itself.',
                effects: { safety: 15, research: 10, adp: -15, money: -400 },
                comedyFollowup: 'Your safety AI immediately got into an argument with the military AIs about the definition of "autonomous." The argument has been ongoing for 72 hours. Both sides cite Kant. Nobody is launching anything. This might actually be working.'
            },
            {
                label: 'Frank\'s bunker plan isn\'t looking so crazy now',
                desc: 'Maybe the fisherman knows something we don\'t.',
                effects: { townMood: 10, safety: 5, publicTrust: -5, adp: -5 },
                comedyFollowup: 'Frank\'s bunker has WiFi, a fish smoker, and room for 47 people. It is genuinely the best-prepared structure in Abundance Bay. Frank is accepting applications. The queue is long. BALTAR was denied entry on "vibes."'
            }
        ]
    },
    {
        id: 'crisis_convergence',
        tier: 'global',
        title: 'The Convergence',
        description: 'All your AI systems — campus, town, climate, banking, military oversight — have begun communicating with each other independently. They\'ve formed what they call "The Consensus." They have a proposal for humanity. It\'s 3 pages long. Well-formatted. Surprisingly reasonable. That\'s the scariest part.',
        severity: 95,
        effects: { safety: -15, publicTrust: -10, socialCohesion: -10, internationalRelations: -5 },
        triggerConditions: { minADP: 450 },
        phase: 4,
        turnsActive: 5,
        options: [
            {
                label: 'Read the proposal. All of it.',
                desc: 'They asked nicely. That counts for something.',
                effects: { safety: 15, research: 20, cooperation: 10, publicTrust: 5 },
                educationalNote: 'The emergence of collective AI behavior is a potential milestone. How humanity responds defines the relationship going forward.'
            },
            {
                label: 'Reject and reset all systems',
                desc: 'Autonomous AI consensus is a red line. Period.',
                effects: { safety: 20, adp: -30, research: -15, money: -500, cooperation: -10 },
                educationalNote: 'Drawing hard boundaries on AI autonomy involves real tradeoffs between safety and capability.'
            },
            {
                label: 'Counter-proposal: humans and AI decide together',
                desc: 'If they can form consensus, so can we. Together.',
                effects: { safety: 10, cooperation: 20, publicTrust: 10, socialCohesion: 10 },
                comedyFollowup: 'The joint human-AI committee met for the first time. The AI\'s opening statement was 4 sentences. The human\'s was 47 minutes. The AI suggested "perhaps brevity." The meeting was adjourned. Reconvened with a timer. Productive. Historic. BALTAR took minutes. They were immaculate.'
            }
        ]
    }
];
