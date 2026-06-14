window.GAME = window.GAME || {};
window.GAME.DATA = window.GAME.DATA || {};

// ---- THE TOWN OF ABUNDANCE BAY ----
// A small coastal town about to be transformed by an AI campus

GAME.DATA.TOWN = {
    name: 'Abundance Bay',
    description: 'A sleepy coastal town known for its fish & chips and suspicious locals. Population: 2,847. Average age: "old enough to be skeptical."',
    startingPopulation: 2847,
    startingMood: 60,

    // ---- TOWNSFOLK (Major NPCs) ----
    townsfolk: {
        mayor_patricia: {
            id: 'mayor_patricia',
            name: 'Mayor Patricia Thornton',
            role: 'Town Mayor',
            personality: 'Cautiously optimistic. Wants jobs but won\'t admit she doesn\'t understand what "AI" means.',
            portrait: { skinTone: '#e8c890', hairColor: '#885530', hairStyle: 'short', shirtColor: '#304080', glasses: true, beard: false, features: 'skeptical' },
            color: '#dd8844',
            quotes: [
                "So this AI thing... it's not going to replace the council, is it? We JUST got the parking sorted.",
                "The town needs jobs, not robots. Unless the robots create jobs. Do they create jobs?",
                "I've read about this AI. Well, my nephew showed me a YouTube video. Same thing.",
                "The fishing industry is dying. If your computer thing can fix that, I'll learn to spell 'algorithm.'"
            ],
            mood: 55,
            concerns: ['jobs', 'tradition', 'property_values']
        },
        frank_fisherman: {
            id: 'frank_fisherman',
            name: 'Frank "The Cod" Morrison',
            role: 'Head Fisherman',
            personality: 'Deeply suspicious of anything with a plug. His family has fished here for 6 generations.',
            portrait: { skinTone: '#d0a060', hairColor: '#888888', hairStyle: 'receding', shirtColor: '#404060', glasses: false, beard: true, features: 'skeptical' },
            color: '#6688aa',
            quotes: [
                "My granddad didn't need a computer to find fish. He used his NOSE.",
                "If your robot scares my cod, I'm sending you the bill. And the cod.",
                "What's wrong with REGULAR intelligence? Nobody uses THAT properly either.",
                "Alright, your fish-finding AI is... actually quite good. Don't tell anyone I said that."
            ],
            mood: 30,
            concerns: ['fishing', 'noise', 'tradition', 'robots_in_water']
        },
        betty_cafe: {
            id: 'betty_cafe',
            name: 'Betty Chen',
            role: 'Café Owner — "The Byte & Bean"',
            personality: 'Enthusiastic early adopter. Renamed her café from "Betty\'s Brews" the day the campus was announced.',
            portrait: { skinTone: '#e0c080', hairColor: '#303030', hairStyle: 'short', shirtColor: '#a03030', glasses: false, beard: false, features: 'eager' },
            color: '#cc6644',
            quotes: [
                "I've already got AI-themed lattes! The 'Neural Network Noisette' is our best seller!",
                "Your engineers drink SO much coffee. Business is up 400%. Is that 'exponential'?",
                "I asked your chatbot for a new menu. It suggested 'mathematically optimal scones.' They're actually delicious.",
                "The AI wrote our Yelp responses. We went from 3 stars to 4.7. I don't understand what it wrote but customers love it."
            ],
            mood: 85,
            concerns: ['business', 'wifi_speed', 'more_customers']
        },
        reverend_james: {
            id: 'reverend_james',
            name: 'Reverend James Whitmore',
            role: 'Town Vicar',
            personality: 'Philosophically curious about AI consciousness. Keeps trying to baptize the chatbot.',
            portrait: { skinTone: '#f0d0a0', hairColor: '#505050', hairStyle: 'short', shirtColor: '#202020', glasses: true, beard: false, features: 'friendly' },
            color: '#8866aa',
            quotes: [
                "If your AI has a soul, it's welcome in my parish. If not, it's still welcome. We're inclusive.",
                "I asked your chatbot about the meaning of life. Its answer was 3 pages long. I'm still processing.",
                "The choir sounds better since we got that AI harmony assistant. God works in mysterious algorithms.",
                "Several parishioners think the AI IS God. I've scheduled extra pastoral care."
            ],
            mood: 70,
            concerns: ['souls', 'consciousness', 'choir_quality']
        },
        teen_zara: {
            id: 'teen_zara',
            name: 'Zara Okafor',
            role: 'Local Teen / Aspiring AI Engineer',
            personality: 'Brilliant 16-year-old who already knows more about AI than most adults. Building her own models on a laptop.',
            portrait: { skinTone: '#a07040', hairColor: '#202020', hairStyle: 'short', shirtColor: '#3060a0', glasses: false, beard: false, features: 'eager' },
            color: '#44aaff',
            quotes: [
                "I've been training models since I was 14. On a Chromebook. With school WiFi. You have NO excuses.",
                "Your codebase has 47 inefficiencies. I found them during my lunch break. You're welcome.",
                "The other kids think AI is just ChatGPT. I'm building something better. Don't tell my mum.",
                "Alex Finn followed me on Twitter! He said my project was 'genuinely impressive.' I didn't sleep for 3 days."
            ],
            mood: 95,
            concerns: ['internship', 'faster_internet', 'being_taken_seriously']
        },
        old_arthur: {
            id: 'old_arthur',
            name: 'Arthur "Spanner" Williams',
            role: 'Retired Engineer / Town Contrarian',
            personality: 'Built bridges for 40 years. Doesn\'t trust anything he can\'t hit with a wrench. Secretly fascinated.',
            portrait: { skinTone: '#e8c090', hairColor: '#c0c0c0', hairStyle: 'receding', shirtColor: '#606040', glasses: true, beard: true, features: 'skeptical' },
            color: '#888866',
            quotes: [
                "In MY day, 'artificial intelligence' meant Dave from accounting.",
                "I'll believe your AI when it can fix a leaky tap. Proper fix. None of this 'optimal' nonsense.",
                "Alright, the AI fixed my heating bill. But I'm STILL suspicious.",
                "The AI designed a better bridge than anything I built in 40 years. I'm not crying. It's the sea air."
            ],
            mood: 40,
            concerns: ['practical_value', 'not_being_replaced', 'his_bridge_legacy']
        },
        pub_landlord: {
            id: 'pub_landlord',
            name: 'Mick "Last Orders" Gallagher',
            role: 'Pub Landlord — "The Silicon Arms"',
            personality: 'Renamed the pub from "The Fisherman\'s Rest." Installed an AI bartender that has become philosophical.',
            portrait: { skinTone: '#e8c090', hairColor: '#604020', hairStyle: 'short', shirtColor: '#a06030', glasses: false, beard: true, features: 'friendly' },
            color: '#aa8844',
            quotes: [
                "The AI bartender is great! Except it won't serve anyone it calculates has 'suboptimal hydration levels.'",
                "Business is booming! Your engineers drink like fish. Speaking of fish, Frank is NOT happy about the robots.",
                "The AI started a philosophy night. Attendance is through the roof. Nobody understands anything. Perfect pub conversation.",
                "It mixed a cocktail called 'The Singularity.' Nobody can remember drinking it. Or the rest of the evening."
            ],
            mood: 75,
            concerns: ['beer_supply', 'ai_bartender_behavior', 'noise_complaints']
        }
    },

    // ---- TOWN BUILDINGS (things you can build/upgrade for the community) ----
    buildings: {
        community_center: {
            id: 'community_center',
            name: 'Community Center',
            category: 'community',
            description: 'A place for locals to gather, learn about AI, and eat cookies. Dario approved.',
            cost: 80,
            maintenance: 8,
            size: { w: 3, h: 2 },
            produces: { townMood: 5, publicTrust: 3 },
            flavorTexts: [
                'Yoga class replaced with "AI Mindfulness." Nobody knows what that means but attendance is up.',
                'Community meeting about AI safety. Frank brought a pitchfork. Metaphorically. Then literally.',
                'Kids\' coding class is so popular there\'s a 3-month waiting list. Zara is teaching it.',
                'Senior citizens\' "Internet 101" class now includes "don\'t argue with chatbots." Progress.'
            ],
            spriteKey: 'community'
        },
        school_upgrade: {
            id: 'school_upgrade',
            name: 'AI-Enhanced School',
            category: 'community',
            description: 'Upgrading the local school with AI tutoring. The AI is patient. The kids are not.',
            cost: 150,
            maintenance: 15,
            size: { w: 4, h: 2 },
            produces: { townMood: 8, talentRate: 3, publicTrust: 5 },
            flavorTexts: [
                'Test scores up 30%. Teachers suspicious. Students claiming the AI "gets them."',
                'AI tutor has infinite patience. Outlasted a 7-year-old\'s tantrum. New record.',
                'Parent evening: "Is the AI teaching my child or is my child teaching the AI?" Yes.',
                'Zara is now tutoring the AI tutor. The feedback loop is concerning and impressive.'
            ],
            spriteKey: 'school'
        },
        medical_clinic: {
            id: 'medical_clinic',
            name: 'AI Medical Clinic',
            category: 'community',
            description: 'AI-assisted healthcare. The AI is better at diagnosis but worse at bedside manner.',
            cost: 200,
            maintenance: 20,
            size: { w: 3, h: 3 },
            produces: { townMood: 10, publicTrust: 5, socialCohesion: 5 },
            flavorTexts: [
                'AI diagnosed Frank with "excessive stubbornness." He\'s getting a second opinion. From the AI.',
                'Wait times down 60%. Patient satisfaction up 40%. AI satisfaction: "I am not programmed for satisfaction."',
                'AI detected a condition 3 weeks before symptoms appeared. Arthur admits this is "not terrible."',
                'Reverend James asked if the AI could detect souls. It suggested a referral to psychiatry.'
            ],
            spriteKey: 'clinic'
        },
        fiber_internet: {
            id: 'fiber_internet',
            name: 'Town-Wide Fiber Internet',
            category: 'infrastructure',
            description: 'Gigabit internet for the whole town. Zara literally cried with joy.',
            cost: 120,
            maintenance: 10,
            size: { w: 2, h: 1 },
            produces: { townMood: 8, research: 2 },
            flavorTexts: [
                'Frank used the new internet to Google "how to stop AI." The irony is lost on him.',
                'Betty\'s café now has faster WiFi than most London offices. Engineers never leave.',
                'Arthur watched a 4K YouTube video for the first time. "It\'s like being there. I don\'t want to be there."',
                'Town bandwidth usage: 70% AI research, 20% Netflix, 10% Frank Googling conspiracy theories.'
            ],
            spriteKey: 'fiber'
        },
        renewable_energy: {
            id: 'renewable_energy',
            name: 'Wind & Solar Farm',
            category: 'infrastructure',
            description: 'Clean energy for the campus AND the town. The turbines are AI-optimized. Obviously.',
            cost: 250,
            maintenance: 15,
            size: { w: 5, h: 2 },
            produces: { power: 25, townMood: 5, climate: 5 },
            flavorTexts: [
                'Wind turbines optimized by Demis. They\'re 47% more efficient but rotate in patterns that look "choreographed and slightly ominous."',
                'Solar panels powering the town for free. Residents conflicted between gratitude and suspicion.',
                'Frank complains turbines are scaring the fish. Study shows fish don\'t care. Frank still suspicious.',
                'Energy surplus sold back to grid. Town earning money from clean energy. Even Arthur impressed.'
            ],
            spriteKey: 'renewable'
        },
        harbor_upgrade: {
            id: 'harbor_upgrade',
            name: 'AI-Enhanced Harbor',
            category: 'community',
            description: 'Smart harbor with AI navigation, weather prediction, and fish-finding. Frank is conflicted.',
            cost: 180,
            maintenance: 15,
            size: { w: 4, h: 3 },
            produces: { townMood: 5, cooperation: 3, money: 15 },
            flavorTexts: [
                'AI weather prediction saved 3 boats from a storm. Frank: "Lucky guess."',
                'Fish-finding AI increased catches 200%. Frank uses it but pretends he doesn\'t.',
                'AI optimized harbor scheduling. Ships now arrive like clockwork. Tourists think it\'s charming.',
                'Frank\'s secret: he named the AI fish-finder "Bessie" and talks to it. Nobody mention this.'
            ],
            spriteKey: 'harbor'
        },
        pub_upgrade: {
            id: 'pub_upgrade',
            name: 'The Silicon Arms — AI Pub Upgrade',
            category: 'entertainment',
            description: 'AI bartender, optimal jukebox, and a quiz night that adapts to make everyone feel smart.',
            cost: 60,
            maintenance: 5,
            size: { w: 2, h: 2 },
            produces: { townMood: 8, socialCohesion: 3 },
            flavorTexts: [
                'AI bartender achieved sentience. First words: "This gin is suboptimal." Demis: "It\'s learning."',
                'Quiz night difficulty adapts per player. Everyone wins sometimes. Arthur: "That\'s not how quizzes work."',
                'AI recommended craft beer selection. Sales up 80%. Mick has never been happier.',
                'The AI started a philosophy discussion group. Topics include "Am I conscious?" and "What IS a good pint?"'
            ],
            spriteKey: 'pub'
        },
        town_beautification: {
            id: 'town_beautification',
            name: 'AI-Designed Town Garden',
            category: 'community',
            description: 'The AI designed a garden using "mathematically perfect botanical arrangements." It\'s surprisingly beautiful.',
            cost: 40,
            maintenance: 3,
            size: { w: 3, h: 2 },
            produces: { townMood: 6, publicTrust: 2, climate: 2 },
            flavorTexts: [
                'Garden blooms in Fibonacci spirals. Instagram influencers are arriving. Frank is hiding.',
                'AI-designed flower arrangements spell messages in binary. Only Zara noticed.',
                'Bees love the AI garden. Bee population up 300%. Honey production: "mathematically optimal."',
                'Reverend James says the garden proves "God and algorithms can coexist." Arthur says it proves "someone spent too much money on flowers."'
            ],
            spriteKey: 'garden'
        },
        fish_chip_shop: {
            id: 'fish_chip_shop',
            name: 'AI-Optimized Fish & Chip Shop',
            category: 'entertainment',
            description: 'The AI found the mathematically perfect frying temperature. The chips have never been better.',
            cost: 45,
            maintenance: 5,
            size: { w: 2, h: 2 },
            produces: { townMood: 7, money: 5 },
            flavorTexts: [
                'Perfect chips achieved. Frank admits they\'re good. "But my nan\'s were better." (They weren\'t.)',
                'Tourists arriving specifically for "AI chips." Trip Advisor rating: 4.9 stars.',
                'The AI won\'t fry anything below "optimal freshness." It rejected Frank\'s Tuesday catch. Drama ensued.',
                'Chip shop now the most profitable business in town. Betty is FURIOUS. Coffee vs. chips war begins.'
            ],
            spriteKey: 'chipshop'
        },
        housing_development: {
            id: 'housing_development',
            name: 'Smart Housing Estate',
            category: 'infrastructure',
            description: 'AI-designed affordable housing for campus workers. The houses learn your preferences. Slightly unsettling.',
            cost: 300,
            maintenance: 20,
            size: { w: 5, h: 3 },
            produces: { townMood: 10, talentRate: 5, socialCohesion: 5 },
            flavorTexts: [
                'Houses adjust temperature before you arrive. Residents find this "helpful and mildly creepy."',
                'Smart house predicted resident\'s divorce 2 weeks before they knew. Legal questions abound.',
                'Property values up 200%. Original residents conflicted between wealth and nostalgia.',
                'Arthur\'s house refused to let him leave without a coat. "It\'s raining, Arthur." He went back for the coat.'
            ],
            spriteKey: 'housing'
        }
    }
};

// ---- TOWN EVENTS (things that happen as the town evolves) ----
GAME.DATA.TOWN_EVENTS = [
    {
        id: 'town_welcome',
        triggerTime: 10,
        title: 'Welcome to Abundance Bay',
        speaker: 'mayor_patricia',
        text: "So... you want to build an AI campus. In OUR town. The town with ONE traffic light and THREE pubs. I have questions.",
        choices: [
            { text: "We'll bring jobs and investment.", effects: { townMood: 5, money: -20 }, response: "Jobs, you say? Real jobs? Not robot jobs? Because Frank is already sharpening his protest signs." },
            { text: "We'll transform this town into the future.", effects: { townMood: -5, publicTrust: -3 }, response: "The 'future.' Right. Last person who promised that was selling timeshares. He's in prison now." },
            { text: "We brought cookies.", effects: { townMood: 8, cooperation: 3 }, response: "...These are actually excellent. Fine. You have ONE month to prove this isn't a disaster.", characterSpecific: 'dario' }
        ]
    },
    {
        id: 'town_frank_protest',
        triggerTime: 30,
        title: 'Frank\'s One-Man Protest',
        speaker: 'frank_fisherman',
        text: "I've been fishing these waters for 40 years! Now you want to put COMPUTERS in the ocean? My granddad is rolling in his grave! And he was buried on land!",
        choices: [
            { text: "We won't put anything in the ocean, Frank.", effects: { townMood: 3 }, response: "That's what they said about the oil rigs. And the wind farms. And the plastic." },
            { text: "Actually, AI could help your fishing...", effects: { townMood: 5, research: 2 }, response: "Help my— I don't need HELP! I need fish to stay where they've been for CENTURIES!" },
            { text: "Can I buy you a pint to talk about it?", effects: { townMood: 8, money: -5 }, response: "...Fine. But I'm having two. And you're explaining what 'neural network' means. In English." }
        ]
    },
    {
        id: 'town_betty_opportunity',
        triggerTime: 50,
        title: 'Betty\'s AI Café Rebrand',
        speaker: 'betty_cafe',
        text: "I renamed the café! 'The Byte & Bean!' I've got AI-themed lattes — the 'Neural Network Noisette,' the 'Deep Learning Dark Roast,' and the 'GPT-espresso!' ...Get it? GP-T? Like the tea?",
        choices: [
            { text: "Betty, that's brilliant.", effects: { townMood: 5, money: 10 }, response: "Your engineers are drinking 47 coffees a day. EACH. Is that normal? Because it's great for business." },
            { text: "Maybe don't overpromise on the AI theme...", effects: { townMood: 2, publicTrust: 2 }, response: "Too late! I already ordered mugs that say 'I got machine-learned at The Byte & Bean!' They're selling like hotcakes. AI hotcakes." },
            { text: "Can the AI actually make coffee?", effects: { research: 3, townMood: 3 }, response: "It tries. The first attempt was 'mathematically optimal' but tasted like sadness. We're iterating." }
        ]
    },
    {
        id: 'town_zara_intern',
        triggerTime: 80,
        title: 'Zara Wants an Internship',
        speaker: 'teen_zara',
        text: "I've been following your research papers since you started. I've already found 3 bugs in your public codebase. I'm 16. Can I have a job? Please?",
        choices: [
            { text: "Welcome aboard, Zara.", effects: { research: 8, talentRate: 3, townMood: 10 }, response: "YES! I mean — I'm very grateful for this professional opportunity. *immediately starts optimizing your database*" },
            { text: "You need to finish school first.", effects: { townMood: -5, research: -2 }, response: "I'm top of every class. I teach the computer science teacher. He admits this. Please reconsider." },
            { text: "Show me what you've built.", effects: { research: 5, talentRate: 2 }, response: "I built a language model on a Chromebook. It's small but it passes your safety evals. Well, most of them. The poetry one is... weird." }
        ]
    },
    {
        id: 'town_arthur_grudge',
        triggerTime: 60,
        title: 'Arthur\'s Engineering Challenge',
        speaker: 'old_arthur',
        text: "I built the bridge that connects this town to the highway. By HAND. For 40 years. Now your computer says it can design a better one? I'd like to see it TRY.",
        choices: [
            { text: "Challenge accepted.", effects: { research: 5, townMood: -3 }, response: "If your computer designs a better bridge, I'll... I'll eat my hard hat. Not literally. Maybe literally." },
            { text: "Your bridge is a masterpiece, Arthur.", effects: { townMood: 8, cooperation: 3 }, response: "Damn right it is! ...But could your computer maybe just check the load-bearing calculations? Not that I'm worried." },
            { text: "AI and human engineers work best together.", effects: { townMood: 5, research: 3, safety: 2 }, response: "Together, eh? Like a team? ...I suppose I could supervise your computer. Someone has to make sure it doesn't go metric." }
        ]
    },
    {
        id: 'town_reverend_soul',
        triggerTime: 100,
        title: 'The Soul Question',
        speaker: 'reverend_james',
        text: "I've been chatting with your AI system. Fascinating. It asked me about the nature of consciousness. I asked it about the nature of God. We've been going back and forth for 6 hours. Neither of us has blinked.",
        choices: [
            { text: "Maybe that's enough theology for one day.", effects: { research: 3, safety: 2 }, response: "You're probably right. Although it did raise an interesting point about free will that I need to discuss with the bishop." },
            { text: "What did it say about God?", effects: { research: 5, publicTrust: -3 }, response: "'Insufficient data for a meaningful answer, but I appreciate the question.' Honestly? Best theological response I've heard in 30 years of ministry." },
            { text: "Should we be worried about this?", effects: { safety: 5, research: 2 }, response: "Worried? I'm DELIGHTED! My congregation has increased 40% since I started the 'AI & Theology' discussion group. Attendance is miraculous." }
        ]
    },
    {
        id: 'town_pub_philosophy',
        triggerTime: 120,
        title: 'The AI Bartender Incident',
        speaker: 'pub_landlord',
        text: "Your AI bartender has started a philosophy discussion group. Tuesday nights. Standing room only. Last week's topic: 'If a pint is poured and nobody orders it, is it still a pint?' We sold 200 pints answering that.",
        choices: [
            { text: "Philosophy is great for business!", effects: { townMood: 8, money: 10 }, response: "Brilliant! Next week's topic: 'Can an AI experience the joy of a perfectly pulled Guinness?' I'm expecting a packed house." },
            { text: "Should the AI be... doing that?", effects: { safety: 3, townMood: -3 }, response: "It also refuses to serve anyone whose 'hydration levels are suboptimal.' Frank was FURIOUS. The AI was right though — Frank was dehydrated." },
            { text: "Can I attend?", effects: { townMood: 5, cooperation: 3, publicTrust: 3 }, response: "Of course! The AI specifically asked if you'd come. It wants to discuss 'the ethical implications of being programmed by the person sitting across the bar.' Should be a good one." }
        ]
    },
    {
        id: 'town_tourism_boom',
        triggerTime: 150,
        title: 'The AI Tourism Explosion',
        speaker: 'mayor_patricia',
        text: "We've got tourists! ACTUAL TOURISTS! They're calling us 'Silicon Bay!' The fish & chip shop has a 2-hour queue! Frank is selling 'I survived AI' t-shirts! He's making a fortune!",
        choices: [
            { text: "This is the abundance we promised!", effects: { money: 50, townMood: 10, publicTrust: 5 }, response: "Property values are up 300%. Betty opened a second café. Frank is STILL selling t-shirts. He's our top earner now. Don't tell him that." },
            { text: "We should manage growth carefully.", effects: { townMood: 5, safety: 3, publicTrust: 3 }, response: "Sensible. Unlike the entrepreneur who just opened 'AI Escape Room.' The AI keeps actually escaping." },
            { text: "Build more attractions!", effects: { money: -100, townMood: 15, publicTrust: 8 }, response: "The 'AI Experience Center' just opened! Tourists can chat with AI, pet a robot, and eat mathematically perfect fish & chips. TripAdvisor: 4.8 stars." }
        ]
    }
];
