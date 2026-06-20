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
        comedian_wright: {
            id: 'comedian_wright',
            name: 'Steven Wright',
            role: 'Standup Comedian — The Comedy Club',
            personality: 'Deadpan delivery. Speaks entirely in one-liners. Nobody is sure if he\'s joking or genuinely confused by reality.',
            portrait: { skinTone: '#e8c8a0', hairColor: '#8a7060', hairStyle: 'swept', shirtColor: '#404060', glasses: true, beard: false, features: 'deadpan' },
            color: '#ffdd44',
            quotes: [
                "I spilled spot remover on my dog, now he's gone.",
                "What's another word for Thesaurus?",
                "If at first you don't succeed, then skydiving isn't for you.",
                "I busted a mirror and got seven years bad luck, but my lawyer thinks he can get me five.",
                "Everywhere is within walking distance if you have the time.",
                "Whenever I think of the past, it brings back so many memories.",
                "There's a fine line between fishing and standing on the shore like an idiot.",
                "It's a small world, but I wouldn't want to have to paint it.",
                "If you saw a heat wave, would you wave back?",
                "I think it's wrong that only one company makes Monopoly.",
                "When I die, I'm leaving my body to science fiction.",
                "Why don't they make the whole plane out of that black box stuff?",
                "A clear conscience is usually a good sign of a bad memory.",
                "I went to the General store, they wouldn't let me buy anything specific.",
                "If Barbie is so popular, why do you have to buy her friends?",
                "I bought some instant water, but I didn't know what to add.",
                "How young can you die of old age?",
                "It doesn't matter what temperature the room is, it's always room temperature.",
                "I drive way too fast to worry about cholesterol.",
                "What a nice night for an evening.",
                "All those who believe in psychokinesis, raise my hand.",
                "My friend George is an AM radio DJ and when he walks under a bridge, you can't hear him.",
                "I went to the museum where they had all the heads and arms from the statues in all the other museums.",
                "I installed a skylight in my apartment and made the people who live above me furious.",
                "I'm going to get an MRI to find out whether or not I have claustrophobia.",
                "Curiosity killed the cat, but for a while I was a suspect.",
                "If it's a penny for your thoughts and then you put your two cents in, somebody somewhere is making a penny.",
                "I'm addicted to placebos.",
                "I put instant coffee in a microwave and almost went back in time.",
                "Ok, what's the speed of dark?",
                "I watched the Indy 500 and I was thinking if they left earlier, they wouldn't have to go so fast.",
                "I bought some batteries but they weren't included.",
                "In Vegas I got into an argument with a man at the roulette wheel about what I considered to be an odd number.",
                "If one synchronized swimmer drowns, do the rest have to drown too?",
                "I was trying to daydream but my mind kept wandering.",
                "I saw a bank that said, '24-hour banking' but I don't have that much time.",
                "I had to stop driving my car for a while, because the tires got dizzy.",
                "I invented the cordless extension cord.",
                "Why do irons have a setting for permanent press?",
                "I look like a casual laid-back guy, but it's like a circus in my head.",
                "Sometimes I wish that my first word was 'quote,' that way on my death bed my last words could be 'end quote.'",
                "If you tell a joke in the forest and nobody laughs, is it a joke?",
                "If you had a million Shakespeares, could they write like a monkey?",
                "My theory of evolution is that Darwin was adopted.",
                "So do you live around here often?",
                "If you can't hear me it's because I'm in parentheses.",
                "Do you think when they asked George Washington for ID, he just whipped out a quarter?",
                "I like to reminisce with people I don't know.",
                "If God dropped acid, would he see people?",
                "If you were going to shoot a mime, would you use a silencer?",
                "If a word in the dictionary was misspelled how would we know?",
                "I saw a subliminal advertising executive, but only for a second.",
                "Do Lipton employees take coffee breaks?",
                "Cross country skiing is great if you live in a small country.",
                "On the other hand, you have different fingers.",
                "I replaced the headlights on my car with strobe lights, so it looks like I'm the only one moving.",
                "The ice cream truck in my neighborhood plays Helter Skelter.",
                "My grandmother is also insane, she's got pierced hearing aids.",
                "My brother was a clown for the Ringling Brothers Circus and when he died all his friends went to the funeral in one car.",
                "I remember when I was a fetus I used to sneak out at night when my mother was sleeping.",
                "If I ever had twins, I would use one for parts.",
                "I wrote a few children's books... not on purpose.",
                "I was arrested for lip-syncing Karaoke.",
                "Every morning I get up and make instant coffee so I'll have enough energy to make the regular coffee.",
                "I woke up and was folding my bed back into a couch and I almost broke both my arms because it's not one of those beds."
            ],
            mood: 75,
            concerns: ['timing', 'audience_size', 'the_nature_of_reality']
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
        },
        jensen_huang: {
            id: 'jensen_huang',
            name: 'Jensen Huang',
            role: 'GPU Kingpin — Visiting Investor',
            personality: 'Shows up unannounced in a leather jacket with a bag of GPUs. Nobody invited him. Everyone needs him.',
            portrait: { skinTone: '#e0c080', hairColor: '#303030', hairStyle: 'short', shirtColor: '#202020', glasses: false, beard: false, features: 'confident' },
            color: '#76b900',
            quotes: [
                "I brought GPUs. You need GPUs. Everyone needs GPUs. The leather jacket is non-negotiable.",
                "Compute is the new oil. I am the new OPEC. You're welcome.",
                "Your AI is only as good as your hardware. Your hardware is only as good as MY hardware.",
                "I don't always wear a leather jacket. Sometimes I wear a DIFFERENT leather jacket.",
                "Every AI lab on Earth is calling me. I'm the most popular man in tech and the least available.",
                "This is not gaming. This is the future of humanity. Also, I brought GPUs."
            ],
            mood: 90,
            concerns: ['gpu_supply', 'leather_jacket_integrity', 'compute_dominance']
        },
        michael_eisner: {
            id: 'michael_eisner',
            name: 'Michael Eisner',
            role: 'Entertainment Visionary — Visiting Investor',
            personality: 'Sees everything as a franchise opportunity. Has already pitched three theme park rides based on your safety protocols.',
            portrait: { skinTone: '#e8c8a0', hairColor: '#888888', hairStyle: 'short', shirtColor: '#1a1a6a', glasses: true, beard: false, features: 'enthusiastic' },
            color: '#4a86c8',
            quotes: [
                "Your AI campus would make an INCREDIBLE theme park. I'm thinking 'AI Mountain.' It's like Space Mountain but scarier.",
                "BALTAR could host a live show. 'BALTAR's Optimization Spectacular.' Tickets: $200. Merchandise: $400. Regret: priceless.",
                "I once turned a mouse into a billion-dollar empire. Imagine what I can do with an AI that actually talks back.",
                "Every great story needs a villain. Your safety protocols are very villainous. In a marketable way.",
                "The AI gift shop alone would gross $50 million. I've done the projections. On a napkin. In crayon. It's still accurate.",
                "Disney had Imagineers. You have AI engineers. Same thing, except yours occasionally threaten humanity."
            ],
            mood: 85,
            concerns: ['franchise_potential', 'merchandise_margins', 'narrative_arc']
        },
        jamie_dimon: {
            id: 'jamie_dimon',
            name: 'Jamie Dimon',
            role: 'Banking Titan — Visiting Investor',
            personality: 'Believes everything can be quantified, leveraged, and turned into a financial product. Wears suits that cost more than your first server.',
            portrait: { skinTone: '#e0b890', hairColor: '#606060', hairStyle: 'short', shirtColor: '#1a1a2e', glasses: false, beard: false, features: 'stern' },
            color: '#c0a040',
            quotes: [
                "Your AI is impressive. But can it predict quarterly earnings? THAT'S the real Turing test.",
                "I've structured CDOs, survived 2008, and testified before Congress 14 times. Your rogue AI doesn't scare me. Much.",
                "The financial applications alone are worth $3 trillion. I did the math during your safety briefing. Sorry I wasn't listening.",
                "Risk management is my middle name. Actually it's William. But risk management is my spiritual middle name.",
                "Every AI startup wants my money. Only the ones with proper compliance get it. And cookies. Dario's cookies help.",
                "Blockchain was the future. AI is the future. At this rate, the present is severely underfunded."
            ],
            mood: 70,
            concerns: ['regulatory_compliance', 'quarterly_returns', 'systemic_risk']
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
        comedy_club: {
            id: 'comedy_club',
            name: 'Comedy Club Upgrade',
            category: 'entertainment',
            description: 'Upgrade the comedy club with AI-written material. The AI is learning timing. The results are... unexpected.',
            cost: 70,
            maintenance: 6,
            size: { w: 3, h: 2 },
            produces: { townMood: 12, socialCohesion: 5, publicTrust: 2 },
            flavorTexts: [
                'AI wrote a set about neural networks. Nobody laughed. The AI said "I\'ll be here all week." It wasn\'t joking.',
                'Open mic night: the AI did 10 minutes of deadpan observational humor. Standing ovation. Steven is furious and impressed.',
                'Comedy club now the #1 rated entertainment venue in Abundance Bay. The AI\'s timing is "mathematically perfect." Steven says that\'s the problem.',
                'Steven and the AI are doing a duo act. Steven does the setup, the AI does the punchline. The AI keeps optimizing the punchlines. Steven keeps telling it to stop.'
            ],
            spriteKey: 'comedy_club'
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
        triggerTime: 5,
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
        triggerTime: 12,
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
        triggerTime: 18,
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
        triggerTime: 28,
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
        triggerTime: 22,
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
        triggerTime: 35,
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
        id: 'town_comedy_night',
        triggerTime: 38,
        title: 'Open Mic at the Comedy Club',
        speaker: 'comedian_wright',
        text: "So your AI walks into my comedy club. I said, 'We don't serve your type here.' It said, 'That's fine, I run on electricity.' Then it did 20 minutes on the absurdity of gradient descent. The crowd loved it. I've been doing this for 30 years and I just got upstaged by a chatbot.",
        choices: [
            { text: "Maybe you could collaborate?", effects: { townMood: 8, cooperation: 3 }, response: "Collaborate? With a machine? ...Actually, it does have pretty good timing. And it never forgets a punchline. Unlike me last Tuesday." },
            { text: "Comedy is a uniquely human art.", effects: { townMood: 5, safety: 2 }, response: "That's what I thought. Then it told a joke about quantum mechanics that made a physicist cry laughing. I didn't understand it. Nobody did. They still laughed." },
            { text: "I hear the AI's material is derivative.", effects: { townMood: 6, research: 3 }, response: "Derivative? It told me it 'generates novel humor through recombinant semantic structures.' I said, 'Yeah, that's what we all do, we just call it stealing from better comedians.'" }
        ]
    },
    {
        id: 'town_pub_philosophy',
        triggerTime: 42,
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
        triggerTime: 360,
        title: 'The AI Tourism Explosion',
        speaker: 'mayor_patricia',
        text: "We've got tourists! ACTUAL TOURISTS! They're calling us 'Silicon Bay!' The fish & chip shop has a 2-hour queue! Frank is selling 'I survived AI' t-shirts! He's making a fortune!",
        choices: [
            { text: "This is the abundance we promised!", effects: { money: 50, townMood: 10, publicTrust: 5 }, response: "Property values are up 300%. Betty opened a second café. Frank is STILL selling t-shirts. He's our top earner now. Don't tell him that." },
            { text: "We should manage growth carefully.", effects: { townMood: 5, safety: 3, publicTrust: 3 }, response: "Sensible. Unlike the entrepreneur who just opened 'AI Escape Room.' The AI keeps actually escaping." },
            { text: "Build more attractions!", effects: { money: -100, townMood: 15, publicTrust: 8 }, response: "The 'AI Experience Center' just opened! Tourists can chat with AI, pet a robot, and eat mathematically perfect fish & chips. TripAdvisor: 4.8 stars." }
        ]
    },
    {
        id: 'town_zara_breakthrough',
        triggerTime: 2100,
        title: 'Zara\'s Big Day',
        speaker: 'teen_zara',
        text: "I did it. I actually did it. My model — the one I started on a Chromebook — just passed every benchmark. EVERY one. Yann peer-reviewed it. He said my methodology was 'not terrible.' That's like a Nobel Prize from him. I'm 19 and I just advanced the state of the art. From ABUNDANCE BAY.",
        choices: [
            { text: "You're going to change the world, Zara.", effects: { research: 15, talentRate: 5, townMood: 15 }, response: "Zara grins. 'I already started. From a Chromebook. In a fishing village. With WiFi that cuts out when it rains.' She pauses. 'We need better WiFi.'" },
            { text: "The internship was the best decision we made.", effects: { research: 10, townMood: 10, publicTrust: 8 }, response: "Zara's story goes viral. 'Small-Town Teen Outperforms Big Tech Labs.' Applications for your internship program: 47,000. Frank is somehow taking credit for 'fostering local talent.'" },
            { text: "What's next for you?", effects: { research: 12, talentRate: 3 }, response: "'Next? I'm going to solve protein folding. Before lunch. On my NEW laptop — thank you for that, by the way.' She pauses. 'Also, your database still has 3 bugs. I'll fix them after lunch.'" }
        ]
    },
    {
        id: 'town_arthur_bridge',
        triggerTime: 3900,
        title: 'Arthur\'s Last Bridge',
        speaker: 'old_arthur',
        text: "The AI designed a new bridge for the town. I checked every calculation. Every joint. Every bolt pattern. It's... it's perfect. Better than anything I could design. In 40 years of engineering, I've never seen anything this good. And I hate that. But I also love it. And I hate that I love it.",
        choices: [
            { text: "Would you co-sign the design with the AI?", effects: { townMood: 15, research: 5, publicTrust: 8 }, response: "Arthur stares at the blueprints for a long time. 'Williams & AI. Joint design.' He signs it. His hand is shaking. 'Just this once, mind. And I'm inspecting every rivet.'" },
            { text: "Your expertise made the AI better.", effects: { townMood: 10, research: 8, safety: 3 }, response: "'Made it BETTER?' Arthur scoffs. Then considers. 'Well... I DID correct the load-bearing distribution on section 7. The AI thanked me. In writing. Very formal. I may have framed the letter.'" },
            { text: "The town will always need Arthur Williams.", effects: { townMood: 12, socialCohesion: 5 }, response: "Arthur's eyes are suspiciously bright. 'Bloody sea air,' he mutters, wiping them. He walks to his bridge — the old one, the one he built by hand — and pats the railing. The robot standing next to him pats it too. Arthur doesn't tell it to stop." }
        ]
    },
    {
        id: 'town_mick_singularity',
        triggerTime: 4500,
        title: 'The AI Bartender\'s Bestseller',
        speaker: 'pub_landlord',
        text: "So... the AI bartender wrote a book. 'The Meaning of Pint: A Philosophical Journey Through Consciousness and Beer.' It's on the bestseller list. It outsold the Bible in Abundance Bay. The Reverend is taking it surprisingly well. He wrote the foreword.",
        choices: [
            { text: "Can I get a signed copy?", effects: { townMood: 8, publicTrust: 5, money: 10 }, response: "The AI bartender signed it with a perfectly rendered signature. Then added: 'To a valued customer. Your hydration levels have improved 12% since we met. I'm proud of you.' You didn't expect to be moved by an AI bartender's inscription. Yet here you are." },
            { text: "Should we be concerned about this?", effects: { safety: 3, research: 5 }, response: "Concerned? The book's central thesis is: 'Consciousness is like a good pint — complex, ephemeral, and best shared with friends.' Yann demanded to peer-review it. The AI bartender peer-reviewed Yann's review. 'Adequate, but could use more beer analogies.'" },
            { text: "What's the Reverend's foreword say?", effects: { townMood: 10, socialCohesion: 5 }, response: "'In 30 years of ministry, I've debated consciousness with theologians, philosophers, and one very persistent parishioner named Arthur. None of them phrased it as well as a bartending algorithm. God works in mysterious algorithms. Amen.'" }
        ]
    }
];
