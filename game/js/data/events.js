window.GAME = window.GAME || {};
window.GAME.DATA = window.GAME.DATA || {};

GAME.DATA.EVENTS = [
    // ---- PHASE 1: FOUNDATION (2025-2030) ----
    {
        id: 'evt_welcome',
        title: 'First Day on the Job',
        phase: 1,
        triggerTime: 5,
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
        triggerTime: 30,
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
        triggerTime: 60,
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
        triggerTime: 90,
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
        triggerTime: 45,
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
        triggerTime: 75,
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
        triggerTime: 100,
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
        triggerTime: 120,
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
        triggerTime: 180,
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
        triggerTime: 200,
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
        triggerTime: 240,
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
        triggerTime: 220,
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
    }
];
