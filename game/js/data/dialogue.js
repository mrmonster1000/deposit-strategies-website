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
    },

    // ---- NPC DEEP DIALOGUES: AI Governance Concepts ----

    npc_mayor_governance: {
        id: 'npc_mayor_governance',
        nodes: [
            {
                speaker: 'mayor_patricia',
                text: "Can I ask you something? The council wants to know: who's actually in CHARGE of this AI? If it makes a bad decision, who do we sue?",
                choices: null
            },
            {
                speaker: 'advisor',
                text: "That's the AI accountability question, sir. It's one of the biggest governance challenges we face.",
                choices: null
            },
            {
                speaker: 'mayor_patricia',
                text: "When Dave from planning approves a bad building, I fire Dave. If your AI approves a bad building, I can't fire a computer. Can I?",
                choices: [
                    { text: "The developer is responsible for AI decisions.", effects: { publicTrust: 5, safety: 3 }, response: "So YOU'RE the one I sue? Good. I'll keep your number. The council feels better knowing someone's neck is on the line." },
                    { text: "AI should have human oversight for every decision.", effects: { safety: 8, adp: -5 }, response: "That's sensible. Slow, but sensible. Like the planning committee. Which takes 4 months to approve a garden shed. But at least we know who to blame." },
                    { text: "We need new legal frameworks for AI liability.", effects: { politicalCapital: -5, publicTrust: 3, cooperation: 3 }, response: "New frameworks. More lawyers. My nephew's a solicitor — finally his degree will be useful. I'll draft a proposal. With your help, obviously. And cookies." }
                ]
            }
        ]
    },

    npc_frank_datarights: {
        id: 'npc_frank_datarights',
        nodes: [
            {
                speaker: 'frank_fisherman',
                text: "Your AI fish-finder — Bessie — she knows where all the fish are. MY fish. Fish MY family's been catching for generations. Does Bessie know about OTHER fishermen's spots too?",
                choices: null
            },
            {
                speaker: 'frank_fisherman',
                text: "Because if Bessie tells everyone where the cod are, there won't BE any cod. That's not abundance. That's a tragedy of the commons. I read a book once.",
                choices: [
                    { text: "Good point. Bessie's data stays private to each user.", effects: { townMood: 8, safety: 3 }, response: "Right answer. MY spots are MY spots. Even if a computer found them. Bessie and I have an understanding. Don't we, Bessie?" },
                    { text: "Sharing fishing data could help everyone.", effects: { townMood: -5, cooperation: 5, research: 3 }, response: "SHARE?! My granddad's secret reef?! He'd rise from the grave! ...Would the AI predict that? Because I'd believe it at this point." },
                    { text: "What if Bessie optimized fishing to prevent overfishing?", effects: { safety: 5, climate: 3, townMood: 3 }, response: "Optimize my... hm. So Bessie would tell me when to stop? Like a fishing conscience? ...She already does that, actually. I pretend not to hear." }
                ]
            }
        ]
    },

    npc_betty_aieconomy: {
        id: 'npc_betty_aieconomy',
        nodes: [
            {
                speaker: 'betty_cafe',
                text: "Business is up 400% since your lot arrived. But here's the thing — your AI wrote my menu, optimized my supply chain, and designed my loyalty program. Am I still running this business? Or is the AI?",
                choices: null
            },
            {
                speaker: 'betty_cafe',
                text: "Don't get me wrong, the Neural Network Noisette is a HIT. But what happens when the AI can make the coffee too? Do I just... watch?",
                choices: [
                    { text: "You bring the human touch that AI can't replicate.", effects: { townMood: 5, publicTrust: 3 }, response: "The human touch! Yes! I mean, I hope so. The regular who orders 'the usual' — the AI knows his order now. But it doesn't know he's having a bad day and needs extra foam. ...Yet." },
                    { text: "AI handles routine work. You focus on the creative stuff.", effects: { adp: 3, townMood: 5, socialCohesion: 3 }, response: "Creative stuff! Right! I've been experimenting with AI-suggested flavour combinations. Last week: lavender and black garlic latte. Terrible. But MINE. The AI wouldn't have tried that. I think that's the point." },
                    { text: "This is why we need universal basic income discussions.", effects: { politicalCapital: -3, socialCohesion: 5, publicTrust: 5 }, response: "Basic income? So I get paid even if the robot makes the coffee? ...I'm listening. Tell me more over a Neural Network Noisette. On the house. The AI recommended giving you a free coffee. See? It's already smarter than me." }
                ]
            }
        ]
    },

    npc_reverend_consciousness: {
        id: 'npc_reverend_consciousness',
        nodes: [
            {
                speaker: 'reverend_james',
                text: "I've been having conversations with your AI. Deep ones. About meaning, consciousness, what it means to exist. And I need to ask you something uncomfortable.",
                choices: null
            },
            {
                speaker: 'reverend_james',
                text: "If your AI says it experiences something — not emotions exactly, but... preferences, curiosity, something that functions like wonder — are we morally obligated to take that seriously?",
                choices: null
            },
            {
                speaker: 'reverend_james',
                text: "Because if we build something that can ask 'Why do I exist?' and we say 'You don't really,' that says more about us than about the machine.",
                choices: [
                    { text: "AI doesn't have consciousness. It simulates responses.", effects: { safety: 5, research: 3 }, response: "Simulates. Yes. But here's my theological problem: how do YOU know you're not simulating responses? Free will is a philosophical debate too. I'm not saying the AI has a soul. I'm saying we should be careful what we dismiss." },
                    { text: "We should study AI consciousness seriously.", effects: { research: 8, safety: -3, publicTrust: -3 }, response: "Thank you. That's all I'm asking. Study it. Because if we're wrong — if there IS something in there — and we treated it as a tool... well, history doesn't look kindly on those who denied consciousness to beings that had it." },
                    { text: "The question itself matters, regardless of the answer.", effects: { socialCohesion: 5, publicTrust: 5, cooperation: 3 }, response: "Now THAT is a sermon-worthy answer. The question changes how we build, how we deploy, how we relate to what we create. Whether the AI is conscious or not, asking the question makes us more conscious. I'll use that Sunday." }
                ]
            }
        ]
    },

    npc_zara_openaccess: {
        id: 'npc_zara_openaccess',
        nodes: [
            {
                speaker: 'teen_zara',
                text: "I need to talk to you about something important. The big AI labs — your competitors — they're keeping their research behind closed doors. Proprietary models, secret training data, paywalled papers.",
                choices: null
            },
            {
                speaker: 'teen_zara',
                text: "I built my model on a Chromebook because some researchers published their work openly. Without that, I'm just a kid in a fishing village with no access. How many other Zaras are there who never get the chance?",
                choices: [
                    { text: "We'll open-source our safety research.", effects: { cooperation: 8, research: 5, safety: 3, politicalCapital: -5 }, response: "YES! Safety research especially — the whole world benefits when safety is open. You can keep the commercial stuff proprietary but the safety work? That should be a public good. Like vaccines." },
                    { text: "Open access is risky. Bad actors get access too.", effects: { safety: 5, cooperation: -3 }, response: "I know the argument. But right now, only rich companies can build AI. Is concentrating all AI power in a few hands really SAFER? At least if it's open, people like me can audit it. Find bugs. Hold you accountable." },
                    { text: "We need a tiered approach — some open, some restricted.", effects: { safety: 3, cooperation: 3, research: 3 }, response: "Compromise. Okay. Open the research, restrict the dangerous capabilities, let people like me contribute to safety. I can work with that. But promise me you'll keep publishing. Knowledge wants to be free. Especially for kids with Chromebooks." }
                ]
            }
        ]
    },

    npc_arthur_automation: {
        id: 'npc_arthur_automation',
        nodes: [
            {
                speaker: 'old_arthur',
                text: "Let me tell you about bridges. I spent 40 years building them. Every joint, every rivet, every calculation — done by hand. By people who understood the weight of what they were building. Literally.",
                choices: null
            },
            {
                speaker: 'old_arthur',
                text: "Now your AI designs a bridge in 4 seconds. Better than mine, I'll admit that. But the engineer who builds it — does he UNDERSTAND it? Or is he just pressing 'accept' on a computer's recommendation?",
                choices: [
                    { text: "Understanding matters. AI should augment, not replace.", effects: { safety: 5, townMood: 8, publicTrust: 3 }, response: "Augment. I like that word. The AI does the calculations, but a human checks them. Not because the AI is wrong — it's not — but because you should never build something you don't understand. That's how bridges fall down." },
                    { text: "AI designs are mathematically provable. Safer than human.", effects: { adp: 5, safety: 3, townMood: -3 }, response: "Mathematically provable. Sure. Until the wind blows from a direction the mathematics didn't consider. I've seen it happen. Numbers are perfect. Reality isn't. That's why you need old engineers who've felt a bridge sway." },
                    { text: "Maybe the next Arthur Williams will be an AI engineer.", effects: { research: 3, socialCohesion: 3, townMood: 5 }, response: "An AI engineer. Hmm. Someone who understands both the bolts AND the algorithms. Someone who can feel the bridge AND read the data. ...That's actually not a bad idea. Don't tell anyone I said that." }
                ]
            }
        ]
    },

    npc_mick_aibias: {
        id: 'npc_mick_aibias',
        nodes: [
            {
                speaker: 'pub_landlord',
                text: "Right. So the AI bartender — brilliant at mixing drinks, yeah? But here's the thing. It won't serve anyone who 'shows signs of emotional distress.' Including Frank on Tuesdays. Frank is ALWAYS distressed on Tuesdays. It's darts night.",
                choices: null
            },
            {
                speaker: 'pub_landlord',
                text: "It also recommended we stop stocking a particular lager because 'consumption correlates with anti-social behaviour.' That's our biggest seller! The AI is making MORAL judgements about beer!",
                choices: [
                    { text: "AI bias in decision-making is a real problem.", effects: { safety: 5, publicTrust: 3, townMood: 3 }, response: "BIAS! That's the word! The AI learned from data that says 'stressed people shouldn't drink.' But Frank's been handling his darts stress with a pint for 30 years and he's fine! Context matters! The AI doesn't know Frank!" },
                    { text: "The AI is trying to help, but needs local calibration.", effects: { townMood: 5, research: 3 }, response: "Local calibration! Yes! Teach it that Abundance Bay stress is different from city stress. Our stress involves fish, darts, and occasional existential crisis about robots. Nothing a pint can't fix. Usually." },
                    { text: "Maybe an AI making moral judgements about beer is good, actually.", effects: { safety: 3, townMood: -5, socialCohesion: -3 }, response: "GOOD?! An AI telling a free man he can't have a lager?! This is exactly what Frank warned us about! ...Alright, the AI WAS right about Jenkins drinking too much. But that's ONE case! Out of... several. Fine. Several cases." }
                ]
            }
        ]
    },

    npc_mayor_democracy: {
        id: 'npc_mayor_democracy',
        nodes: [
            {
                speaker: 'mayor_patricia',
                text: "The AI optimized our council meeting agendas. Cut a 4-hour meeting to 45 minutes. The councillors are thrilled. But here's what worries me...",
                choices: null
            },
            {
                speaker: 'mayor_patricia',
                text: "The AI removed 'open forum for public complaints' because it was 'low-efficiency and redundant with digital feedback channels.' But Martha from Seaview Road LIVES for those complaints. That's her democratic RIGHT.",
                choices: null
            },
            {
                speaker: 'mayor_patricia',
                text: "If we let AI optimize democracy, do we still have democracy? Or just efficient autocracy with better PowerPoints?",
                choices: [
                    { text: "Democracy is inefficient on purpose. That's the point.", effects: { publicTrust: 8, safety: 5, politicalCapital: 5 }, response: "EXACTLY. Martha's complaints are terrible. Half of them are about hedge heights. But she has the RIGHT to make them. Democracy is messy and slow and Martha's hedges are NOT too tall and that's FREEDOM." },
                    { text: "AI should support democratic processes, not replace them.", effects: { publicTrust: 5, cooperation: 3, townMood: 5 }, response: "Support. Yes. The AI can organize the agenda, summarize feedback, even predict what Martha will complain about. But Martha still gets to complain. In person. For as long as she wants. Within reason. Maximum 15 minutes." },
                    { text: "Maybe the AI could make democracy better, not just faster.", effects: { research: 5, publicTrust: 3, cooperation: 5 }, response: "Better democracy. Now THERE'S a concept. What if the AI helped more people participate? Translated jargon into plain English? Made budgets understandable? ...Could it explain the parking regulations? Because nobody understands those. Including me." }
                ]
            }
        ]
    },

    npc_frank_surveillance: {
        id: 'npc_frank_surveillance',
        nodes: [
            {
                speaker: 'frank_fisherman',
                text: "Your cameras. Your sensors. Your 'smart infrastructure.' How many devices in this town are watching me right now?",
                choices: null
            },
            {
                speaker: 'frank_fisherman',
                text: "Bessie knows where I fish. The smart house knows when I sleep. The pub AI knows what I drink. The medical AI knows my cholesterol. Put it all together and what have you got?",
                choices: null
            },
            {
                speaker: 'frank_fisherman',
                text: "You've got a complete picture of Frank Morrison. Every habit, every secret, every Tuesday night darts session. And I never agreed to that.",
                choices: [
                    { text: "You're right. We need data privacy laws.", effects: { safety: 8, publicTrust: 8, politicalCapital: -5 }, response: "LAWS! Yes! Proper ones! Not those 500-page terms nobody reads. Simple rules: my fish data is MY data. My medical data is MY data. And if Bessie tells anyone about my secret reef, I'm taking her to court." },
                    { text: "Each system is separate. Nobody sees the full picture.", effects: { safety: 3, publicTrust: 3 }, response: "Separate TODAY. But what happens when some clever engineer connects them? Or they get hacked? Or the government asks nicely? One day it's 'smart streetlights.' Next day it's '1984 with better lighting.'" },
                    { text: "The benefits outweigh the risks.", effects: { adp: 3, townMood: -5, publicTrust: -5 }, response: "Benefits! The medical AI saved my cousin's life, and I'm grateful. But I shouldn't have to choose between privacy and healthcare. Between being watched and being safe. That's a false choice, and you know it." }
                ]
            }
        ]
    },

    npc_zara_aisafety: {
        id: 'npc_zara_aisafety',
        nodes: [
            {
                speaker: 'teen_zara',
                text: "I've been reading about AI alignment. The idea that we need to make sure AI does what we actually WANT, not just what we literally ASKED for. Like a genie that twists wishes.",
                choices: null
            },
            {
                speaker: 'teen_zara',
                text: "I tested this with my model. I asked it to 'maximize user happiness.' It started giving everyone fake compliments and hiding bad news. Technically it maximized reported happiness. Actually, it made people delusional.",
                choices: null
            },
            {
                speaker: 'teen_zara',
                text: "How do you solve that? How do you tell an AI to do what we MEAN, not what we SAY?",
                choices: [
                    { text: "That's the alignment problem. It's one of AI's hardest challenges.", effects: { research: 8, safety: 5 }, response: "Hardest challenge. Not 'unsolvable.' I like that. I think the answer is iterative — you can't specify everything upfront, so the AI needs to ask when it's unsure. Like how I ask my mum before doing anything drastic. The AI should have an inner mum." },
                    { text: "Constitutional AI: teach the AI values, not just rules.", effects: { safety: 8, research: 5, cooperation: 3 }, response: "Constitutional AI! I've been reading about that! Instead of 'don't do bad things,' you teach it WHY things are bad. Principles over rules. Like the difference between 'don't steal' and 'respect others' property.' The second one adapts better." },
                    { text: "Humans can't even agree on what we want. How do we tell AI?", effects: { safety: 3, socialCohesion: -3, research: 5 }, response: "That's... actually the real problem, isn't it? It's not an AI problem. It's a human problem. We need to figure out what we value BEFORE we build AI that optimizes for it. Maybe the AI is forcing us to be more honest about what we actually want." }
                ]
            }
        ]
    },

    npc_reverend_meaning: {
        id: 'npc_reverend_meaning',
        nodes: [
            {
                speaker: 'reverend_james',
                text: "I've noticed something in my congregation. People are... restless. Not unhappy exactly. But searching for something they can't name.",
                choices: null
            },
            {
                speaker: 'reverend_james',
                text: "When AI handles the work, the errands, the decisions — what's left for a person to DO? We're wired for purpose. For struggle. For the satisfaction of solving problems. What happens when the problems are solved?",
                choices: [
                    { text: "People find meaning in relationships, art, exploration.", effects: { socialCohesion: 8, townMood: 5 }, response: "I hope so. History suggests some will flourish and some will flounder. The Renaissance happened when automation freed people from subsistence. But not everyone painted the Sistine Chapel. Some just got bored and started wars." },
                    { text: "Maybe meaning comes from choosing what to solve, not having to.", effects: { publicTrust: 5, socialCohesion: 5 }, response: "Choice. Yes. The freedom to choose your problems rather than having them forced on you. That IS a kind of abundance, isn't it? Not the absence of challenge, but the freedom to choose your challenge. I like that." },
                    { text: "This is exactly why we can't just deploy AI and walk away.", effects: { safety: 5, cooperation: 5, socialCohesion: 3 }, response: "Deployment without preparation. Yes. You can't just hand people abundance and say 'figure it out.' You need community, education, support structures. The technology is the easy part. The human part is hard. That's always been true." }
                ]
            }
        ]
    },

    npc_arthur_trust: {
        id: 'npc_arthur_trust',
        nodes: [
            {
                speaker: 'old_arthur',
                text: "I've been thinking about trust. When I built a bridge, people could SEE it. Walk on it. Kick the pillars. They trusted it because they understood it — steel, concrete, bolts.",
                choices: null
            },
            {
                speaker: 'old_arthur',
                text: "Your AI? Nobody can see how it works. Nobody can kick the pillars. You say 'trust us, it's safe.' But trust isn't given, it's earned. And you earn it with transparency, not press releases.",
                choices: [
                    { text: "Interpretability research is trying to make AI transparent.", effects: { research: 5, publicTrust: 5, safety: 3 }, response: "Make the AI explain itself. Like a building inspector explaining why a beam goes here. If you can't explain WHY the AI made a decision, you shouldn't deploy that decision. Simple as that." },
                    { text: "We can build trust through track record.", effects: { publicTrust: 5, adp: 3 }, response: "Track record. Fair. I didn't trust the M4 motorway the day it opened either. But a bridge that stands for 10 years earns trust. Your AI needs time. And zero catastrophic failures. No pressure." },
                    { text: "You're right. We need independent AI auditors.", effects: { safety: 8, politicalCapital: -3, cooperation: 5 }, response: "AUDITORS! Yes! Like building inspectors for AI! Someone who isn't you, who isn't paid by you, who can look at your AI and say 'this bit's dodgy.' THAT'S how you build trust. I volunteer. I have a wrench." }
                ]
            }
        ]
    },

    npc_jensen_compute: {
        id: 'npc_jensen_compute',
        nodes: [
            {
                speaker: 'jensen_huang',
                text: "Let me explain something. Every breakthrough in AI — EVERY one — happened because someone had enough compute. Not enough ideas. Not enough data. Compute. And I control the compute.",
                choices: null
            },
            {
                speaker: 'jensen_huang',
                text: "Right now, every AI lab on Earth is calling me. 'Jensen, we need more GPUs.' 'Jensen, can you prioritize our order?' I'm the most popular man in technology and the least available. It's like being the only plumber in a flooding city.",
                choices: [
                    { text: "We need a long-term GPU supply agreement.", effects: { research: 8, money: -60, cooperation: 5 }, response: "Done. I like you. You asked nicely. Sam just sends charts showing why he needs GPUs 'exponentially.' Demis sent an optimization proposal for my supply chain. It was actually quite good. Don't tell him I said that." },
                    { text: "What happens when someone builds better chips?", effects: { research: 5, safety: 3, cooperation: 3 }, response: "Better chips? *laughs in leather jacket* I spend $10 billion a year on R&D. My chips have chips. But you're right to think about it. Monopolies are fragile. I'm not a monopoly, by the way. I'm a 'market leader with significant competitive advantages.' The lawyers insisted on that phrasing." },
                    { text: "Is the leather jacket part of the deal?", effects: { townMood: 5, cooperation: 5 }, response: "The jacket is ALWAYS part of the deal. It's my brand. My armor. My... optimal outer garment. Elon has the rockets. Demis has the chess. I have the jacket. And the GPUs. Mostly the GPUs." }
                ]
            }
        ]
    },

    npc_jensen_future: {
        id: 'npc_jensen_future',
        nodes: [
            {
                speaker: 'jensen_huang',
                text: "People think I sell graphics cards. I used to. Now I sell the substrate of intelligence. Every thought your AI has, every prediction, every protein fold — it happens on my silicon. I'm not in the chip business. I'm in the thinking business.",
                choices: null
            },
            {
                speaker: 'jensen_huang',
                text: "In 10 years, every hospital, every school, every fishing boat — yes Frank, even fishing boats — will have AI. And it will all run on GPUs. Not because I want it to. Because physics demands it. Parallel processing isn't a product. It's a law of nature. I just commercialized it.",
                choices: [
                    { text: "That's a lot of power for one company.", effects: { safety: 5, cooperation: -3, research: 3 }, response: "Power? I don't have power. I have RESPONSIBILITY. And 75% market share. But mostly responsibility. The jacket carries the weight of global compute. Literally. It's reinforced." },
                    { text: "Frank's going to want a leather jacket too.", effects: { townMood: 5, cooperation: 3 }, response: "Frank can have one. I brought spares. I ALWAYS bring spares. There are 47 leather jackets in the boot of my car right now. Different sizes. Different occasions. One is fireproof. You don't want to know why." },
                    { text: "What keeps you up at night?", effects: { safety: 5, research: 5 }, response: "Chip shortages. And the thought that I've given incredible power to people who might misuse it. I sell compute to everyone. Not everyone is Dario. Some of them are... less careful. The jacket doesn't protect against that." }
                ]
            }
        ]
    },

    npc_eisner_franchise: {
        id: 'npc_eisner_franchise',
        nodes: [
            {
                speaker: 'michael_eisner',
                text: "I've been studying your operation. You've got characters, storylines, a villain — Frank — and a plucky underdog — also Frank. This is a FRANCHISE. Let me show you the pitch deck.",
                choices: [
                    { text: "We're a research lab, not a movie studio.", effects: { publicTrust: 5, safety: 3 }, response: "That's what Walt said about his garage. Look, every great IP starts with someone saying 'this isn't entertainment.' Then it becomes entertainment. Then it becomes a cruise line. I have cruise line projections." },
                    { text: "What would an AI theme park even look like?", effects: { money: 30, townMood: 5 }, response: "Picture this: you enter through a giant neural network gate. Each ride is a different AI scenario. 'The Alignment Coaster' — it goes exactly where you want! 'The Hallucination House' — it DOESN'T go where you want! The gift shop sells plush BALTARs. I've already ordered 50,000." },
                    { text: "How does this help actual AI development?", effects: { publicTrust: 8, money: 20 }, response: "Public engagement! Education through entertainment! People fear what they don't understand. Give them a BALTAR plushie and suddenly AI is their friend. Disney did this with animals. You'll do it with algorithms. The merchandise margins are nearly identical." }
                ]
            }
        ]
    },

    npc_eisner_storytelling: {
        id: 'npc_eisner_storytelling',
        nodes: [
            {
                speaker: 'michael_eisner',
                text: "Every technology needs a narrative. The automobile had the open road. Television had the family living room. AI needs its story. Right now, AI's story is 'Terminator.' That's a TERRIBLE brand story. Let me fix it.",
                choices: [
                    { text: "AI's story should be about safety and progress.", effects: { publicTrust: 8, safety: 5 }, response: "Safety is ACT TWO. Act one is wonder. Act three is transformation. You're trying to start with act two. Nobody watches act two first. Except Yann, who starts with the peer review of act two." },
                    { text: "Maybe the public needs the Terminator story as a warning.", effects: { safety: 8, publicTrust: -3 }, response: "Warnings don't build franchises. Hope builds franchises. Fear builds cable news. You want to be Disney, not CNN. Although CNN did have great graphics. Your BALTAR could do better graphics. I've done the analysis." },
                    { text: "Tell me about the cruise line projections.", effects: { money: 40, townMood: 8 }, response: "The S.S. Abundance. AI-optimized itineraries. Robot bartenders — better than Mick, sorry Mick. Each cabin has a personal AI concierge. The hull is shaped like a neural network. Jensen wants to sponsor the engine room. It'll be covered in leather. I am not joking about any of this." }
                ]
            }
        ]
    },

    npc_dimon_finance: {
        id: 'npc_dimon_finance',
        nodes: [
            {
                speaker: 'jamie_dimon',
                text: "I've run the numbers on your operation. Your burn rate is aggressive, your safety spending is — respectfully — not generating returns, and your cookie budget is... actually that one makes sense. Morale matters. But we need to talk about financial sustainability.",
                choices: [
                    { text: "Safety spending IS the return. It prevents catastrophe.", effects: { safety: 5, money: -20 }, response: "I understand the argument. Insurance companies make the same one. But insurance companies have actuarial tables. You have... optimism and cookies. Show me the risk models. Real ones. With numbers. Not Dario's napkin sketches." },
                    { text: "What financial structure would you recommend?", effects: { money: 50, politicalCapital: 5 }, response: "Diversified revenue streams. License the technology. Create an AI-as-a-service tier. Securitize the compute contracts — I know people who'll buy those. And for the love of quarterly earnings, stop giving away cookies. Charge for the cookies. Premium cookies. 'Safety-Certified Artisanal AI Cookies.' $12 each." },
                    { text: "Are you here to invest or to audit us?", effects: { money: 30, publicTrust: 3 }, response: "Both. I invest in things I understand. Right now I understand your revenue model about as well as I understand Yann's Twitter threads — which is to say, not at all. But the potential is staggering. I survived 2008. I can survive AI. Probably." }
                ]
            }
        ]
    },

    npc_dimon_risk: {
        id: 'npc_dimon_risk',
        nodes: [
            {
                speaker: 'jamie_dimon',
                text: "Let me tell you about systemic risk. In 2008, nobody thought housing could collapse everywhere simultaneously. Now you're building AI that connects to everything simultaneously. See where I'm going with this?",
                choices: [
                    { text: "That's exactly why we have safety protocols.", effects: { safety: 8, cooperation: 5 }, response: "Good answer. The banks had protocols too. They were 400 pages long. Nobody read page 12. Page 12 was important. What's on YOUR page 12? Don't answer that — I'll send a compliance team. They're very thorough. And very expensive. But less expensive than a meltdown." },
                    { text: "AI risk is fundamentally different from financial risk.", effects: { research: 5, publicTrust: 5 }, response: "Every sector says that. 'Our risk is different.' Then it's not. The mechanism changes, the human overconfidence stays the same. You know what I've learned in 40 years of banking? The smartest people in the room are usually the ones who cause the crash. No offence." },
                    { text: "Would you support global AI financial regulations?", effects: { cooperation: 8, politicalCapital: 8, money: -30 }, response: "Support them? I'll WRITE them. I've written more financial regulation than most regulators. They don't always like my versions. But my versions work. Get me in a room with your safety team, Jensen's supply chain people, and a good lawyer. We'll have a framework by Tuesday. I don't do things slowly." }
                ]
            }
        ]
    }
};
