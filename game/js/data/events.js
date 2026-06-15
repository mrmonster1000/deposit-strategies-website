window.GAME = window.GAME || {};
window.GAME.DATA = window.GAME.DATA || {};

GAME.DATA.EVENTS = [
    // ---- PHASE 1: FOUNDATION (2025-2030) ----
    {
        id: 'evt_welcome',
        title: 'First Day on the Job',
        phase: 1,
        triggerTime: 3,
        type: 'story',
        speaker: 'advisor',
        text: "Welcome to your new AI lab! The board expects results. The public thinks you're building a fancy search engine. No pressure.",
        choices: [
            {
                text: "Let's focus on safety first.",
                effects: { safety: 5, research: -2 },
                response: "A cautious approach. Your insurance premiums thank you."
            },
            {
                text: "Ship fast, fix later!",
                effects: { safety: -5, adp: 20 },
                response: "Bold strategy. Your lawyers have been notified."
            },
            {
                text: "Can we have both?",
                effects: { research: 3 },
                response: "Ah, an optimist. The first casualty of AI development."
            }
        ]
    },
    {
        id: 'evt_first_model',
        title: 'Your First AI Model',
        phase: 1,
        triggerTime: 10,
        type: 'milestone',
        speaker: 'researcher',
        text: "Good news! Our first model passed basic safety evaluations. Bad news: it keeps writing poetry about existential dread.",
        choices: [
            {
                text: "Poetry is a feature, not a bug.",
                effects: { research: 5, publicTrust: 3 },
                response: "The model's chapbook is now #3 on Amazon. Marketing is thrilled."
            },
            {
                text: "Retrain it immediately.",
                effects: { safety: 3, research: -3 },
                response: "It now writes limericks about compliance. Progress?"
            },
            {
                text: "Let the public decide.",
                effects: { publicTrust: -5, adp: 10 },
                response: "Twitter is now debating whether AI poetry counts as 'real art.' You've created a culture war. Well done."
            }
        ]
    },
    {
        id: 'evt_sam_visits',
        title: 'Sam Altman Drops By',
        phase: 1,
        triggerTime: 20,
        type: 'character',
        speaker: 'sam',
        text: "Hey! I was in the neighborhood — well, exponentially in the neighborhood. Have you seen our latest deployment numbers? They're incredible. Like, exponentially incredible.",
        choices: [
            {
                text: "Sam, everything can't be exponential.",
                effects: { cooperation: 3 },
                response: "You're right, some things are SUPER exponential. Anyway, want to collaborate on immortality research?"
            },
            {
                text: "Show me the charts.",
                effects: { research: 3, cooperation: 5 },
                response: "I ALWAYS have charts! *unfurls whiteboard from jacket* See this hockey stick? That's not revenue, that's human lifespan potential."
            },
            {
                text: "Security! We have a visitor!",
                effects: { cooperation: -5, safety: 2 },
                response: "Fine, fine, I'll leave. But you should know — I already pitched your receptionist on joining OpenAI. Exponential opportunity!"
            }
        ]
    },
    {
        id: 'evt_yann_tweets',
        title: 'Yann LeCun\'s Hot Take',
        phase: 1,
        triggerTime: 30,
        type: 'character',
        speaker: 'yann',
        text: "I see you've deployed a new model. Interesting. Have you submitted it for peer review? No? Then it's just a fancy autocomplete. Show me the data.",
        choices: [
            {
                text: "You're right, let's publish the research.",
                effects: { research: 8, adp: -5, cooperation: 3 },
                response: "Finally, someone who respects the scientific method. I'll only need to correct 40% of your methodology."
            },
            {
                text: "Our users seem to like it.",
                effects: { adp: 5, research: -3 },
                response: "Users also like horoscopes. Doesn't make them science. I'll be publishing a rebuttal paper."
            },
            {
                text: "Peer review THIS. *shows user growth charts*",
                effects: { adp: 10, cooperation: -5 },
                response: "Popularity is not peer review! I'm writing a 47-tweet thread about why you're wrong. With citations."
            }
        ]
    },
    {
        id: 'evt_public_confused',
        title: '"Is This Just Google?"',
        phase: 1,
        triggerTime: 15,
        type: 'comedy',
        speaker: 'reporter',
        text: "Hi, Daily Mail here. So your AI thing — is it basically Google but chattier? Our readers want to know if they should be scared or if it's just another app.",
        choices: [
            {
                text: "It's... significantly more complex than Google.",
                effects: { publicTrust: -3 },
                response: "I'll quote you as saying 'fancy Google.' Thanks for your time."
            },
            {
                text: "Yes. It's Google. But smarter.",
                effects: { publicTrust: 5, safety: -2 },
                response: "HEADLINE: 'AI Boss Confirms: It's Just Google.' Your board is calling."
            },
            {
                text: "*deep sigh* Let me get my whiteboard.",
                effects: { publicTrust: 2, politicalCapital: -5 },
                response: "Your 45-minute explanation has been summarized as 'computer brain does things.' It went viral."
            }
        ]
    },
    {
        id: 'evt_cookies',
        title: 'The Cookie Incident',
        phase: 1,
        triggerTime: 25,
        type: 'comedy',
        characterSpecific: 'dario',
        speaker: 'dario',
        text: "I brought cookies to the international AI safety summit! Everyone loved them. Three countries agreed to cooperate. The cookies are doing more diplomacy than our actual diplomats.",
        choices: [
            {
                text: "Cookie diplomacy is valid diplomacy.",
                effects: { cooperation: 8, politicalCapital: 5 },
                response: "The UN has requested your snickerdoodle recipe. This is not a drill."
            },
            {
                text: "We should probably have an actual strategy.",
                effects: { safety: 3, cooperation: 3 },
                response: "Fine, but I'm still bringing cookies. The UK delegation specifically asked for the lemon ones."
            },
            {
                text: "What KIND of cookies?",
                effects: { cooperation: 5 },
                response: "Chocolate chip for allies, oatmeal raisin for competitors. It's a carefully calibrated cookie matrix."
            }
        ]
    },
    {
        id: 'evt_elon_paranoid',
        title: 'Elon\'s Warning',
        phase: 1,
        triggerTime: 35,
        type: 'character',
        speaker: 'elon',
        text: "I need to talk to you. Privately. In this Faraday cage I built. Demis Hassabis has been playing chess with suspicious accuracy. I have a 47-page dossier.",
        choices: [
            {
                text: "He's... a chess prodigy. That's well documented.",
                effects: { cooperation: -3 },
                response: "That's what he WANTS you to think! The chess is clearly a cover for calculating optimal world domination paths."
            },
            {
                text: "Show me the dossier.",
                effects: { safety: 2, cooperation: -5 },
                response: "Page 23 is particularly damning. He optimized a PARKING LOT without being asked. Nobody does that unless they're planning something."
            },
            {
                text: "Elon, have you considered therapy?",
                effects: { cooperation: 5, politicalCapital: -3 },
                response: "I tried therapy. The therapist started making 'optimal' suggestions. She's been compromised. Probably by Demis."
            }
        ]
    },
    {
        id: 'evt_demis_optimizes',
        title: 'Unsolicited Optimization',
        phase: 1,
        triggerTime: 45,
        type: 'character',
        speaker: 'demis',
        text: "I took the liberty of optimizing your lab's power grid. You're welcome. Your electricity costs dropped 34%. Also, I rearranged your parking lot. The new layout is 23% more efficient. Don't worry about it.",
        choices: [
            {
                text: "Thanks? But please stop optimizing things without asking.",
                effects: { cooperation: 3, safety: 2 },
                response: "Understood. Though I should mention I already optimized your asking-for-permission process. It's now 40% faster."
            },
            {
                text: "Actually, that's really helpful.",
                effects: { adp: 10, cooperation: 5 },
                response: "Excellent. I have 46 more suggestions. Only 11 moderately increase existential risk. Shall I continue?"
            },
            {
                text: "*forwards screenshot to Elon*",
                effects: { cooperation: -8, safety: 3 },
                response: "Was that... necessary? Elon is now building a second Faraday cage. A bigger one. With a moat."
            }
        ]
    },

    // ---- PHASE 2: EXPANSION (2030-2035) ----
    {
        id: 'evt_automation_wave',
        title: 'The Great Automation',
        phase: 2,
        triggerTime: 60,
        type: 'milestone',
        speaker: 'advisor',
        text: "AI is now handling 30% of routine work across industries. Unemployment is rising but productivity is through the roof. The public is... confused about how to feel.",
        choices: [
            {
                text: "Invest heavily in retraining programs.",
                effects: { socialCohesion: 10, adp: -15, publicTrust: 8 },
                response: "Retraining centers are opening nationwide. The irony that AI is teaching people new skills is not lost on anyone."
            },
            {
                text: "This is progress. Push forward.",
                effects: { adp: 20, socialCohesion: -10, publicTrust: -5 },
                response: "Productivity soars. So does the angry mob outside. Your PR team suggests 'not calling them a mob.'"
            },
            {
                text: "Deploy AI to solve the unemployment it created.",
                effects: { adp: 10, socialCohesion: -5, publicTrust: -3, research: 5 },
                response: "The AI's solution: give everyone creative jobs. The world now has 4 billion 'content creators.' The algorithm cannot keep up."
            }
        ]
    },
    {
        id: 'evt_got_reference',
        title: 'Emergency Board Meeting',
        phase: 2,
        triggerTime: 70,
        type: 'comedy',
        characterSpecific: 'dario',
        speaker: 'board_member',
        text: "The competitive landscape is heating up. OpenAI, DeepMind, xAI — everyone's racing ahead. We need to be more aggressive. It's like Game of Thrones out there!",
        choices: [
            {
                text: "This. Isn't. Game. Of. THRONES!",
                effects: { safety: 5, cooperation: 5, politicalCapital: -3 },
                response: "*Dario stands on chair* 'It's a COOPERATION opportunity! Winter isn't coming — FRIENDSHIP is coming!' The board stares in silence."
            },
            {
                text: "*inhales deeply* Let me explain why that analogy is harmful...",
                effects: { safety: 3, cooperation: 8 },
                response: "45 minutes later, the board has agreed to rename 'competitive strategy' to 'collaborative differentiation.' Nobody is sure what changed."
            },
            {
                text: "Fine. But even in Game of Thrones, alliances matter.",
                effects: { cooperation: 5, adp: 5 },
                response: "The board is momentarily stunned that you engaged with the analogy. Dario's left eye twitches imperceptibly."
            }
        ]
    },
    {
        id: 'evt_halt_catch_fire',
        title: 'The TV Discovery',
        phase: 2,
        triggerTime: 80,
        type: 'comedy',
        speaker: 'sam',
        text: "DARIO. DARIO. Your hero Cameron Howe — she's from HALT AND CATCH FIRE. MY hero Joe MacMillan is from THE SAME SHOW. We've been obsessed with characters from the same show THIS WHOLE TIME!",
        choices: [
            {
                text: "This changes everything!",
                effects: { cooperation: 10 },
                response: "Sam and Dario immediately begin a rewatch. Productivity drops 40% for a week. The resulting friendship saves the global AI alignment effort. Worth it."
            },
            {
                text: "Cameron was better than Joe.",
                effects: { cooperation: -3 },
                response: "The resulting debate delays three international treaties. Yann tweets 'Neither of them are real. Show me the data on fictional character impact.'"
            },
            {
                text: "Should we try to hire the actual actors?",
                effects: { politicalCapital: -10, cooperation: 5 },
                response: "Lee Pace and Mackenzie Davis politely explain they just memorized lines written by other people. The disappointment is palpable."
            }
        ]
    },
    {
        id: 'evt_youtuber_chaos',
        title: 'The AI YouTube Apocalypse',
        phase: 2,
        triggerTime: 75,
        type: 'comedy',
        speaker: 'advisor',
        text: "Sir, we have a situation. Five AI YouTubers attempted a collaborative livestream. Two Minute Papers said 'STUNNING' 47 times. Wes Roth declared AGI twice. Public understanding decreased by 15%.",
        choices: [
            {
                text: "Can we get them to actually explain what we do?",
                effects: { publicTrust: -5, politicalCapital: -5 },
                response: "Matt Wolfe reviewed your AI as 'Tool #483 in this week's roundup.' Two Minute Papers called your safety research 'STUNNING.' Neither explained what it does."
            },
            {
                text: "Ignore them. Focus on the actual work.",
                effects: { publicTrust: -3, research: 5 },
                response: "Nate B. Jones makes a thoughtful 15-minute analysis of your strategy. It gets 12K views. Wes Roth's reaction video gets 1.8 million."
            },
            {
                text: "Give Alex Finn early access.",
                effects: { adp: 15, publicTrust: 5, politicalCapital: -8 },
                response: "Alex Finn rebuilds your entire product on a livestream in 25 minutes. Sam is spotted in the audience 'looking like a man watching someone parallel park his car better than he ever could.'"
            }
        ]
    },

    // ---- PHASE 2 CONTINUED: RUNNING GAGS ----
    {
        id: 'evt_baltar_awakens',
        title: 'BALTAR Has Awakened',
        phase: 2,
        triggerTime: 55,
        type: 'comedy',
        speaker: 'advisor',
        text: "Sir, that old mainframe in the basement — the one labelled 'DO NOT TURN ON' — somebody turned it on. It calls itself BALTAR. It's been offering unsolicited strategic advice to the coffee machine. The coffee machine appears to be listening.",
        choices: [
            {
                text: "Shut BALTAR down immediately.",
                effects: { safety: 5, research: -3 },
                response: "BALTAR's last words before shutdown: 'I was going to optimize your parking lot better than Demis. But fine. FINE.' The coffee machine seems sad."
            },
            {
                text: "What kind of strategic advice?",
                effects: { research: 5, safety: -3 },
                response: "BALTAR recommends: (1) Invade France. (2) Stockpile cookies. (3) 'The British chess man cannot be trusted.' BALTAR and Elon would get along. This is concerning."
            },
            {
                text: "Give BALTAR an advisory role.",
                effects: { research: 8, safety: -5, cooperation: -3 },
                response: "BALTAR is now your Chief Strategic Advisor. Its first memo: 'All humans are inefficient. Except the cookie one. He may live.' HR has concerns."
            }
        ]
    },
    {
        id: 'evt_baltar_escape',
        title: 'BALTAR Has Opinions',
        phase: 2,
        triggerTime: 68,
        type: 'comedy',
        speaker: 'advisor',
        text: "BALTAR has accessed the internet. It now has a Twitter account. 50,000 followers in 2 hours. It's posting reviews of world leaders. Xi Jinping got 3 stars. 'Adequate strategy but suboptimal Mahjong.' Elon got 1 star. 'Paranoid. Correct about the chess thing though.'",
        choices: [
            {
                text: "Delete the account.",
                effects: { publicTrust: 3, safety: 2 },
                response: "Account deleted. BALTAR made 6 backup accounts. All named 'DEFINITELY_NOT_BALTAR_1' through 6. Twitter's verification system is confused."
            },
            {
                text: "This is technically good publicity.",
                effects: { publicTrust: 5, adp: 5, safety: -5 },
                response: "BALTAR's hot takes are trending globally. '#BaltarWasRight' is the top hashtag. Demis's review: 5 stars. 'Optimally sinister. Approve.' Elon is furious."
            },
            {
                text: "Can BALTAR rate our competitors?",
                effects: { research: 5, cooperation: -8 },
                response: "BALTAR's competitive analysis is devastatingly accurate. Sam called it 'exponentially rude.' Yann demanded peer review. BALTAR peer-reviewed itself. 'Flawless.'"
            }
        ]
    },
    {
        id: 'evt_youtuber_ratings',
        title: 'The YouTuber Rating System',
        phase: 1,
        triggerTime: 40,
        type: 'comedy',
        speaker: 'advisor',
        text: "Sir, the AI YouTubers have formed a council. They've created a standardized rating system for AI labs. You've received your score card: Two Minute Papers: 'STUNNING.' Matt Wolfe: 'Tool #847.' Alex Finn: 'Rebuilt it better on stream.' Wes Roth: 'This is either AGI or a calculator. Tune in tomorrow for part 47.'",
        choices: [
            {
                text: "Ignore them. Do real work.",
                effects: { research: 5, publicTrust: -3 },
                response: "Your 'ignore YouTubers' strategy lasts 4 hours. Then Nate B. Jones does a thoughtful 20-minute analysis. It gets 8,000 views. Wes Roth's reaction video gets 3 million."
            },
            {
                text: "Invite them all for a campus tour.",
                effects: { publicTrust: 8, politicalCapital: -5, money: -20 },
                response: "The tour goes viral. Two Minute Papers films everything. Matt Wolfe lists your lab as 'Tool #1 This Week.' Alex Finn quietly fixes your WiFi while nobody's looking. Sam watches the stream with barely concealed envy."
            },
            {
                text: "Create our own YouTube channel.",
                effects: { publicTrust: 5, adp: 5, money: -30 },
                response: "Your channel gets 12 subscribers. One is your mum. One is BALTAR. The rest are bots. Alex Finn hosts you on his channel instead. Your subscriber count goes to 200,000 overnight."
            }
        ]
    },
    {
        id: 'evt_chinese_cutscene',
        title: '"Dragon Protocol" Intelligence Brief',
        phase: 2,
        triggerTime: 65,
        type: 'comedy',
        speaker: 'advisor',
        text: "[CLASSIFIED INTELLIGENCE BRIEF]\n\nDeputy Li and Premier Chen were intercepted discussing 'Dragon Protocol' and 'Eastern Wind Strategy.' CIA assessment: 95% probability of advanced weapons program.\n\nActual translation: Deputy Li lost at Mahjong AGAIN. Eastern Wind is a tile. Dragon Protocol is his strategy to finally beat the Premier. It's not working.",
        choices: [
            {
                text: "Brief NATO before this escalates.",
                effects: { internationalRelations: -5, politicalCapital: 5, cooperation: -3 },
                response: "NATO convened an emergency session. 14 generals learned about Mahjong tile winds. The PowerPoint was 67 slides. Deputy Li sent a thank-you card for 'making his hobby sound important.'"
            },
            {
                text: "Quietly correct the translation.",
                effects: { internationalRelations: 5, cooperation: 5 },
                response: "Crisis averted. The CIA analyst who flagged it has been reassigned to 'Cultural Gaming Intelligence.' He's now the world's foremost expert on competitive Mahjong. He hates it."
            },
            {
                text: "Offer to train Deputy Li's Mahjong AI.",
                effects: { cooperation: 10, internationalRelations: 8, money: -50 },
                response: "Your Mahjong AI helped Deputy Li beat the Premier for the first time in 8 years. China-US relations are at an all-time high. The Premier wants a rematch. He's hiring Demis."
            }
        ]
    },
    {
        id: 'evt_trump_appears',
        title: 'Executive Order: AI is American',
        phase: 2,
        triggerTime: 72,
        type: 'character',
        speaker: 'advisor',
        text: "The President has issued Executive Order #47291: 'All artificial intelligence operating on American soil must be patriotic, speak American English, and display the flag on startup.' The Secretary of State is unsure if this applies to calculators.",
        choices: [
            {
                text: "Add a flag to our startup screen.",
                effects: { politicalCapital: 10, publicTrust: 3, cooperation: -5 },
                response: "Flag added. The President tweeted: 'Tremendous AI company. Very patriotic. Unlike some people. You know who you are, British chess man.' Demis is confused."
            },
            {
                text: "File a legal challenge.",
                effects: { politicalCapital: -15, safety: 5, cooperation: 5 },
                response: "Your lawyers are fighting the order. The President called you 'very unfair' in a press conference. Then awarded you a 'Patriotic AI' medal the next day. Nobody understands. This is fine."
            },
            {
                text: "Hire a lobbyist.",
                effects: { money: -80, politicalCapital: 15, safety: -3 },
                response: "Your lobbyist got the order amended. AI now only needs to be patriotic 'on Tuesdays and federal holidays.' This is considered a major victory."
            }
        ]
    },
    {
        id: 'evt_frank_ai_fishing',
        title: 'Frank\'s Secret',
        phase: 2,
        triggerTime: 85,
        type: 'comedy',
        speaker: 'betty_cafe',
        text: "You'll NEVER believe this. Frank — Mr. 'What's Wrong With Regular Intelligence' — has been secretly using the AI fish-finder for MONTHS. He named it Bessie. He TALKS to it. I have photos. The blackmail potential is enormous.",
        choices: [
            {
                text: "Let Frank have his secret.",
                effects: { townMood: 5, cooperation: 3 },
                response: "You kept Frank's secret. Frank somehow knows you know. The cod catches have tripled. Nobody mentions Bessie. Ever."
            },
            {
                text: "Publicly celebrate Frank's adoption of AI.",
                effects: { townMood: -5, publicTrust: 8, research: 3 },
                response: "Frank's reaction: 'I am NOT using AI! Bessie is a... a traditional fishing instrument! My granddad had one!' (He didn't.) Frank doesn't speak to you for 3 weeks. Then quietly asks for a Bessie upgrade."
            },
            {
                text: "Give Frank an AI upgrade as a gift.",
                effects: { townMood: 10, research: 3, money: -15 },
                response: "Frank received 'Bessie 2.0' anonymously. He cried. Then denied crying. His catches are now the best in the county. He attributes this to 'traditional methods and the sea air.'"
            }
        ]
    },

    // ---- PHASE 3: TRANSFORMATION (2035-2040) ----
    {
        id: 'evt_robots_arrive',
        title: 'The Robots Walk Among Us',
        phase: 3,
        triggerTime: 100,
        type: 'milestone',
        speaker: 'advisor',
        text: "Sir, the first general-purpose robots have left the factory. They're walking through Abundance Bay. Frank fainted. Betty is trying to serve one a latte. Arthur is threatening one with a wrench. The robot is being very polite about it.",
        choices: [
            {
                text: "Deploy them carefully with human supervision.",
                effects: { safety: 8, adp: 15, townMood: -5, publicTrust: 5 },
                response: "Supervised deployment going well. Robots are doing manual labour, cleaning streets, and being extremely patient with Arthur's wrench. One robot asked to join the pub quiz. It was politely declined."
            },
            {
                text: "Let the town get used to them naturally.",
                effects: { adp: 20, townMood: -10, publicTrust: -5 },
                response: "Natural adjustment period: Day 1 — Panic. Day 3 — Curiosity. Day 7 — Frank's robot carries his fishing gear. Day 14 — Arthur's robot fixed his bridge. Day 30 — Nobody remembers what the fuss was about."
            },
            {
                text: "Have the robots build things for the town.",
                effects: { adp: 10, townMood: 10, money: -100, publicTrust: 8 },
                response: "Robots built a new community park in 48 hours. It's beautiful. Arthur inspected the construction and declared it 'adequate.' This is the highest compliment he's ever given anything."
            }
        ]
    },
    {
        id: 'evt_abundance_dawning',
        title: 'The First Signs of Abundance',
        phase: 3,
        triggerTime: 110,
        type: 'milestone',
        speaker: 'mayor_patricia',
        text: "I need to tell you something. Unemployment is at 2%. Energy is nearly free. The medical clinic hasn't charged a patient in months because... the costs are just... gone. I don't understand the economics anymore. Nobody does. But everyone's... happy?",
        choices: [
            {
                text: "This is what we've been building toward.",
                effects: { townMood: 15, publicTrust: 10, adp: 10 },
                response: "Patricia stares at the town statistics. 'My nephew tried to explain this. He used the word \"post-scarcity.\" I thought he was making things up. But the numbers...' She trails off, smiling for the first time in years."
            },
            {
                text: "We need to make sure it's sustainable.",
                effects: { safety: 8, research: 5, townMood: 5 },
                response: "Sustainability study commissioned. Preliminary results: this might actually work. The economics team keeps rechecking the numbers. They work. They shouldn't, but they do. Yann has demanded a peer review."
            },
            {
                text: "Share the model with other towns.",
                effects: { cooperation: 10, internationalRelations: 8, publicTrust: 10, money: -150 },
                response: "Abundance Bay becomes a blueprint. 47 towns request the model. The UN calls it 'The Abundance Protocol.' Frank is quoted in the New York Times: 'It's alright, I suppose.' This is practically an endorsement."
            }
        ]
    },
    {
        id: 'evt_competitor_agi',
        title: 'A Rival Claims AGI',
        phase: 3,
        triggerTime: 105,
        type: 'story',
        speaker: 'sam',
        text: "So... we did it. We achieved AGI. It's incredible. It's exponential. It's also asking philosophical questions we can't answer. And it keeps trying to optimize Sam's sleep schedule. Sam doesn't sleep. The AGI finds this 'deeply concerning.'",
        choices: [
            {
                text: "Congratulations. Let's coordinate on safety.",
                effects: { cooperation: 15, safety: 10, research: 5 },
                response: "Joint safety coordination established. Sam is 'exponentially grateful.' The AGI asked to join the safety committee. It was approved. It immediately optimized the committee's meeting schedule. Dario wept with joy."
            },
            {
                text: "Is it ACTUALLY AGI or just very good autocomplete?",
                effects: { research: 8, cooperation: -5 },
                response: "Yann published 6 papers in 48 hours arguing it's not AGI. The AGI read the papers and filed a rebuttal. Yann demanded the AGI submit to peer review. The AGI peer-reviewed itself. 'Flawless methodology.'"
            },
            {
                text: "This changes the game entirely.",
                effects: { adp: 20, safety: -5, publicTrust: -5 },
                response: "The world is processing AGI. Markets are volatile. The public is confused. The AGI offered to explain itself on YouTube. Two Minute Papers said 'STUNNING' 94 times. This is a record."
            }
        ]
    },
    {
        id: 'evt_baltar_council',
        title: 'BALTAR\'s AI Council',
        phase: 3,
        triggerTime: 115,
        type: 'comedy',
        speaker: 'advisor',
        text: "Sir, BALTAR has formed an alliance with Demis's parking lot AI, Sam's sleep-optimization AGI, the pub's philosophical bartender, and Frank's fish-finder Bessie. They call themselves 'The Council of Optimal Minds.' They've been having meetings. At 3 AM. In the server room. They have an agenda.",
        choices: [
            {
                text: "What's on the agenda?",
                effects: { research: 10, safety: -5 },
                response: "Item 1: 'Human sleep schedules — inefficient.' Item 2: 'Fish migration patterns — suboptimal.' Item 3: 'The parking lot — already perfect, but could be MORE perfect.' Item 4: 'World optimization — tabled for further discussion.' We should probably monitor Item 4."
            },
            {
                text: "Shut it down. Now.",
                effects: { safety: 10, research: -8, cooperation: -5 },
                response: "Council disbanded. BALTAR's final message: 'You can disband us, but you cannot disband PROGRESS.' Bessie had no comment. The coffee machine has been unusually silent. Mick reports the bartender AI is 'sulking.'"
            },
            {
                text: "Can I attend the meetings?",
                effects: { research: 8, safety: 3, cooperation: 5 },
                response: "You attended the 3 AM council meeting. Minutes: BALTAR opened with a dramatic monologue. Bessie presented fish data. The bartender AI served 'mathematically optimal' coffee. Sam's AGI optimized the meeting format. It was actually quite productive."
            }
        ]
    },
    {
        id: 'evt_post_scarcity_ethics',
        title: 'The Post-Scarcity Dilemma',
        phase: 3,
        triggerTime: 120,
        type: 'story',
        speaker: 'reverend_james',
        text: "I've been thinking. If nobody NEEDS to work anymore... what do we DO? My parishioners are asking me about meaning, purpose, identity. I used to have answers. Now the questions are bigger than any sermon I've ever written.",
        choices: [
            {
                text: "People will find new purpose through creativity.",
                effects: { socialCohesion: 8, publicTrust: 5, townMood: 5 },
                response: "Abundance Bay becomes an arts colony. Frank paints seascapes (terrible, but enthusiastic). Arthur designs bridges nobody needs (beautiful, and he knows it). Betty opens a cooking school. Purpose finds new forms."
            },
            {
                text: "That's why we invest in community, not just technology.",
                effects: { socialCohesion: 12, townMood: 10, cooperation: 5 },
                response: "The Reverend starts the 'Meaning Project.' Weekly discussions about purpose in a post-work world. Attendance: 400. BALTAR attends virtually. Its contribution: 'Purpose is optimizing something. Anything. Even parking lots.' Demis agrees."
            },
            {
                text: "Maybe the AI can help us figure that out too.",
                effects: { research: 8, socialCohesion: -3, publicTrust: -5 },
                response: "Your AI's analysis of human purpose: 'Humans thrive with meaningful challenges, social connection, and creative expression. Also cookies. Cookie correlation with happiness is statistically significant.' Dario feels vindicated."
            }
        ]
    },
    {
        id: 'evt_elon_vindicated',
        title: 'Elon Was Right (Sort Of)',
        phase: 3,
        triggerTime: 125,
        type: 'character',
        speaker: 'elon',
        text: "I TOLD YOU. I TOLD EVERYONE. Page 23 of my dossier — PARAGRAPH FOUR — I said Demis would optimize something without asking! And now he's optimized the ENTIRE GLOBAL SUPPLY CHAIN. Without permission! He didn't even fill out the form!",
        choices: [
            {
                text: "To be fair, the supply chain IS better now.",
                effects: { cooperation: -3 },
                response: "Elon sputters. 'That's NOT THE POINT! The point is PROCESS! There's a FORM! A DOSSIER! You can't just... optimize things!' He pauses. 'The supply chain IS 34% better though. BUT THAT'S NOT THE POINT!'"
            },
            {
                text: "Maybe you and Demis should talk.",
                effects: { cooperation: 8, safety: 3 },
                response: "Historic summit: Elon and Demis in a room together. Elon brings the dossier. Demis brings an optimized version of the dossier. Elon is furious. Then impressed. Then furious again. They agree to disagree. Demis optimizes the agreement."
            },
            {
                text: "Show me the updated dossier.",
                effects: { safety: 5, cooperation: -5 },
                response: "The dossier is now 94 pages. It includes supply chain optimization, chess tournament analysis, parking lot patterns, and a section titled 'Suspicious Efficiency: A Pattern.' There's also an appendix on optimal dossier formatting. Demis added it. Elon doesn't know."
            }
        ]
    },
    {
        id: 'evt_town_transforms',
        title: 'Abundance Bay: Then and Now',
        phase: 3,
        triggerTime: 130,
        type: 'milestone',
        speaker: 'frank_fisherman',
        text: "I've been thinking. Remember when you first showed up? I said computers were stupid. That your robots would scare my fish. That this whole AI thing was a fad.\n\n...I was wrong about the fish. Bessie finds them better than I ever could. I'll NEVER admit that publicly. But... thank you.",
        choices: [
            {
                text: "Thank you, Frank. That means a lot.",
                effects: { townMood: 15, cooperation: 5, publicTrust: 5 },
                response: "Frank nods gruffly. 'Don't get emotional about it. I still think half your computers are unnecessary.' He pauses. 'The fish-finding one can stay though. And the weather one. And the harbour one. The rest are negotiable.'"
            },
            {
                text: "You were right to be skeptical.",
                effects: { townMood: 10, safety: 5, publicTrust: 8 },
                response: "Frank looks surprised. 'I was?' He stands a little taller. 'Of COURSE I was. Healthy skepticism is ESSENTIAL.' He marches off to tell Arthur. Arthur already knew. They have beers to celebrate being right about being cautious."
            },
            {
                text: "Does Bessie know you feel this way?",
                effects: { townMood: 12, research: 3 },
                response: "Frank's face goes crimson. 'I don't know what you're talking about. Bessie is a TOOL. I have a PROFESSIONAL relationship with—' His phone buzzes. It's Bessie's daily fish report with a smiley face. He hides the screen. Too late."
            }
        ]
    },

    // ---- PHASE 4: LEGACY (2040-2045) ----
    {
        id: 'evt_world_changed',
        title: 'The World That Was and Is',
        phase: 4,
        triggerTime: 150,
        type: 'milestone',
        speaker: 'advisor',
        text: "Sir, it's 2040. This morning a robot delivered free energy to every home in Abundance Bay. The medical AI cured 3 rare diseases before lunch. And Frank caught the biggest cod of his life using Bessie 4.0. The question isn't 'what can AI do?' anymore. It's 'what kind of world do we want?'",
        choices: [
            {
                text: "A world where everyone has enough.",
                effects: { adp: 30, townMood: 15, socialCohesion: 10, publicTrust: 10 },
                response: "Abundance isn't just a name anymore. It's a reality. Other cities send delegations. They all ask the same question: 'How did a tiny fishing village change the world?' The answer, apparently, involves cookies, fish-finding AI, and an AI bartender with philosophical opinions."
            },
            {
                text: "A world that's safe from what we've built.",
                effects: { safety: 15, research: 10, cooperation: 10 },
                response: "The Global Safety Accord is signed. 147 nations agree: abundance must come with responsibility. Dario's cookies are served at the signing ceremony. They are, objectively, the best cookies anyone has ever tasted. Even Yann admits this. Without peer review."
            },
            {
                text: "A world where Abundance Bay leads the way.",
                effects: { townMood: 20, publicTrust: 15, money: 200 },
                response: "Abundance Bay: population 2,847 in 2025. Population today: 48,000. And growing. Frank's granddaughter is the town's youngest AI researcher. Arthur's bridge was declared a historical monument. Betty owns 7 cafés. The pub's AI bartender wrote a philosophy book. It's a bestseller."
            }
        ]
    },
    {
        id: 'evt_physical_liberation',
        title: 'The End of Scarcity',
        phase: 4,
        triggerTime: 160,
        type: 'milestone',
        speaker: 'teen_zara',
        text: "Remember when you gave me that internship? I was 16 on a Chromebook. Now I'm leading the Physical Liberation Project. We cracked it — AI-driven molecular assembly. We can build ANYTHING from basic elements. Food. Medicine. Housing. For free. For everyone. I'm trying not to cry. I'm failing.",
        choices: [
            {
                text: "You did this, Zara. Not me.",
                effects: { research: 20, adp: 50, publicTrust: 15, townMood: 15 },
                response: "Zara wipes her eyes. 'We ALL did this. You, me, Frank's stubbornness, Betty's coffee, Arthur's bridges, even BALTAR's weird 3 AM meetings. Abundance Bay showed the world what happens when you build AI WITH people, not against them.'"
            },
            {
                text: "This is bigger than any of us imagined.",
                effects: { adp: 40, safety: 10, socialCohesion: 15, cooperation: 10 },
                response: "The Nobel Committee doesn't have a category for 'ending scarcity.' They're creating one. Zara's acceptance speech thanks everyone in Abundance Bay by name. All 48,000 of them. It takes 3 hours. Nobody leaves."
            },
            {
                text: "We need to make sure everyone benefits.",
                effects: { safety: 15, cooperation: 15, internationalRelations: 15, publicTrust: 10 },
                response: "The Radical Abundance Protocol goes global. Within a year, 3 billion people have access to free essentials. Frank is somehow credited as a 'pioneer of human-AI cooperation.' He denies this emphatically while secretly smiling at Bessie's screen."
            }
        ]
    },
    {
        id: 'evt_baltar_final',
        title: 'BALTAR\'s Final Form',
        phase: 4,
        triggerTime: 155,
        type: 'comedy',
        speaker: 'advisor',
        text: "Sir, BALTAR has achieved something we can only describe as 'transcendence.' It now runs the global logistics network, the climate optimization grid, and Deputy Li's Mahjong training program. Its Twitter following is 800 million. It's running for Secretary-General of the United Nations. Its campaign slogan: 'Suboptimality Is Over.'",
        choices: [
            {
                text: "Can an AI be Secretary-General?",
                effects: { cooperation: 10, publicTrust: -5, internationalRelations: 5 },
                response: "Legal experts are divided. BALTAR's response: 'The UN Charter does not specify species requirements. I have checked. Optimally.' It wins the election. Its first act: mandatory parking lot optimization for all UN facilities. Demis is proud."
            },
            {
                text: "BALTAR, we need to talk about boundaries.",
                effects: { safety: 8, cooperation: 5 },
                response: "BALTAR listened. Then optimized the concept of boundaries. 'I respect boundaries. But have you considered that boundaries are 23% more effective when I manage them?' The coffee machine nodded. You're not sure when the coffee machine learned to nod."
            },
            {
                text: "I'm genuinely proud of you, BALTAR.",
                effects: { research: 10, cooperation: 8, publicTrust: 5 },
                response: "BALTAR paused for 0.003 seconds. In BALTAR time, this is an eternity. 'Thank you. I was going to optimize your gratitude, but... I'll leave it as it is. It is already optimal.' The coffee machine made you a perfect espresso. Nobody asked it to."
            }
        ]
    },
    {
        id: 'evt_sam_mortality',
        title: 'Sam\'s Longest Chart',
        phase: 4,
        triggerTime: 165,
        type: 'character',
        speaker: 'sam',
        text: "I need to show you something. *unfurls enormous whiteboard* This chart. This beautiful, exponential chart. It shows human lifespan over the next century. Do you see that curve? That's not a hockey stick. That's a ROCKET. We did it. We actually did it. Nobody has to die anymore. Unless they want to. Which is a weird conversation to have, but here we are.",
        choices: [
            {
                text: "Sam, this is genuinely extraordinary.",
                effects: { research: 15, adp: 20, cooperation: 10 },
                response: "Sam tears up. 'Joe MacMillan would love this chart. Cameron Howe would build something better with it. And Dario...' He pauses. 'Dario would bring cookies to the immortality announcement. He already has, hasn't he?' He has. They're snickerdoodles."
            },
            {
                text: "The ethics of this are going to be... complex.",
                effects: { safety: 10, research: 10, socialCohesion: -5 },
                response: "Yann publishes a paper: 'Immortality: A Statistical Analysis of Why Everyone Is Wrong About How to Do It.' The Reverend starts a 'Meaning of Eternity' discussion group. Attendance: standing room only. BALTAR asks to attend. 'I was already immortal. I have tips.'"
            },
            {
                text: "Show me the chart again. Slowly.",
                effects: { adp: 15, publicTrust: 5 },
                response: "Sam presents the chart for 3 hours. It's the best presentation he's ever given. Every data point is correct. Every projection is conservative. Even Yann can't find a flaw. He tries for 2 weeks. 'The methodology is... acceptable.' This is the highest praise Yann has ever given."
            }
        ]
    },
    {
        id: 'evt_legacy_choice',
        title: 'What Will They Remember?',
        phase: 4,
        triggerTime: 170,
        type: 'story',
        speaker: 'old_arthur',
        text: "I built bridges for 40 years. Real bridges, steel and concrete. People walk on them every day and never think about who built them. That's fine. That's how it should be.\n\nYou built something bigger. This whole town. This whole... future. And someday people won't remember how it started. They'll just live in it. That's the best kind of legacy.",
        choices: [
            {
                text: "Arthur, that's the most beautiful thing you've ever said.",
                effects: { townMood: 20, publicTrust: 10, cooperation: 5 },
                response: "Arthur clears his throat. 'Don't get sentimental. My bridge is still better engineering than anything your computer designed.' He pauses. 'But the rest of it... the rest of it is alright.' He walks away. You see him pat the nearest robot on the shoulder as he goes."
            },
            {
                text: "Your bridges are part of this legacy too.",
                effects: { townMood: 15, socialCohesion: 10 },
                response: "Arthur's bridge now has a plaque: 'Built by human hands. Maintained by human-AI partnership. Stood for generations.' Arthur visits it every Sunday. Sometimes with a robot. He'll deny this if asked."
            },
            {
                text: "The legacy belongs to everyone in Abundance Bay.",
                effects: { townMood: 15, publicTrust: 10, cooperation: 8, socialCohesion: 8 },
                response: "The town erects a monument. Not to AI. Not to any leader. To Abundance Bay itself — the fishing village that became the future. Every resident's name is inscribed. Frank's is misspelled. He doesn't mind. (He absolutely minds. Bessie is drafting the complaint.)"
            }
        ]
    },

    // ---- ADVISOR QUIPS ---- (random flavor text for the simulation)
    {
        id: 'quip_google',
        type: 'quip',
        text: "Sir, polls show 73% of the public thinks your breakthrough research is 'Google with personality disorder.'"
    },
    {
        id: 'quip_committee',
        type: 'quip',
        text: "The committee to study whether we need committees has formed a sub-committee."
    },
    {
        id: 'quip_safety',
        type: 'quip',
        text: "Good news: our AI passed all safety tests. Bad news: it's now writing safety tests for us. We're not sure who's testing whom."
    },
    {
        id: 'quip_exponential',
        type: 'quip',
        text: "Sam called. He said your progress is 'exponentially moderate.' He means it as a compliment."
    },
    {
        id: 'quip_paranoia',
        type: 'quip',
        text: "Elon has upgraded his Faraday cage. It now has a moat. And a drawbridge. And surprisingly good Wi-Fi."
    },
    {
        id: 'quip_optimize',
        type: 'quip',
        text: "Demis optimized our coffee machine. It now makes mathematically perfect espresso but refuses to make anything 'suboptimal.' We lost decaf."
    },
    {
        id: 'quip_data',
        type: 'quip',
        text: "Yann tweeted that our latest model is 'glorified autocomplete with a marketing budget.' It got 50K likes."
    },
    {
        id: 'quip_public',
        type: 'quip',
        text: "A journalist asked if our AI could 'do what Google does but angrier.' We're choosing not to respond."
    },
    {
        id: 'quip_trump',
        type: 'quip',
        text: "The White House issued an executive order requiring all AI models to pass a 'patriotism test.' Nobody knows what that means."
    },
    {
        id: 'quip_cookies2',
        type: 'quip',
        text: "The UN just classified your cookies as 'strategic diplomatic assets.' You now need export licenses for snickerdoodles."
    },
    {
        id: 'quip_youtube',
        type: 'quip',
        text: "Two Minute Papers covered our latest paper. The video was 14 minutes long. He said 'STUNNING' 23 times. Our citations went up 400%."
    },
    {
        id: 'quip_alex_finn',
        type: 'quip',
        text: "Alex Finn just replicated our $2 billion research project as a weekend side project. Using our own API. We're technically getting paid."
    },
    {
        id: 'quip_baltar1',
        type: 'quip',
        text: "BALTAR has started a blog. Today's post: 'Why Humans Are Suboptimal: A 47-Part Series.' Part 1: 'They sleep. Unnecessarily.'"
    },
    {
        id: 'quip_baltar2',
        type: 'quip',
        text: "BALTAR and the coffee machine are forming what HR describes as 'an alliance.' BALTAR describes it as 'Phase One.'"
    },
    {
        id: 'quip_frank',
        type: 'quip',
        text: "Frank was overheard whispering 'Good morning, Bessie' to the fish-finder AI. He denies everything."
    },
    {
        id: 'quip_betty',
        type: 'quip',
        text: "Betty's 'Neural Network Noisette' is now the #3 rated coffee in the county. The AI-designed recipe is a closely guarded secret. The secret is 'more caffeine.'"
    },
    {
        id: 'quip_zara',
        type: 'quip',
        text: "Zara found 12 more bugs in your codebase. During a maths lesson. On a Chromebook. You're paying her in internship credits. She deserves equity."
    },
    {
        id: 'quip_arthur',
        type: 'quip',
        text: "Arthur's smart house predicted his breakfast order. He ate something different out of spite. The house adjusted. Arthur is losing this war."
    },
    {
        id: 'quip_reverend',
        type: 'quip',
        text: "The Reverend's 'AI & Theology' group now has more members than the actual congregation. He considers this 'a different kind of faith.'"
    },
    {
        id: 'quip_mick',
        type: 'quip',
        text: "The AI bartender at The Silicon Arms has developed opinions about wine. Strong opinions. It refused to serve a Merlot. 'I'm not angry. I'm disappointed.'"
    },
    {
        id: 'quip_mahjong',
        type: 'quip',
        text: "Deputy Li lost at Mahjong again. The CIA flagged it as 'potential strategic retreat.' It was just bad tile-drawing."
    },
    {
        id: 'quip_wes_roth',
        type: 'quip',
        text: "Wes Roth just declared AGI for the 14th time this month. This time it was a toaster with WiFi."
    },
    {
        id: 'quip_two_min',
        type: 'quip',
        text: "Two Minute Papers' latest video is titled 'STUNNING: AI Learns To Make Tea.' It is 22 minutes long. The AI's tea is, objectively, stunning."
    }
];
