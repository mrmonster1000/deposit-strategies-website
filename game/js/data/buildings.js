window.GAME = window.GAME || {};
window.GAME.DATA = window.GAME.DATA || {};

GAME.DATA.BUILDINGS = {
    // ---- RESEARCH FACILITIES ----
    small_lab: {
        id: 'small_lab',
        name: 'Research Lab',
        category: 'research',
        description: 'A modest research lab. Scientists here mostly argue about naming conventions.',
        cost: 50,
        maintenance: 5,
        size: { w: 3, h: 2 },
        produces: { research: 3 },
        requires: {},
        unlockPhase: 1,
        flavorTexts: [
            'Researcher found arguing with AI about whether it\'s conscious. AI won the argument.',
            'Lab successfully produced a paper. Nobody read it. Citation count: 2 (both self-citations).',
            'Intern accidentally achieved breakthrough. Senior researchers claiming credit.',
            'The whiteboard has been full for 3 months. Nobody dares erase it.'
        ],
        spriteKey: 'lab'
    },
    large_lab: {
        id: 'large_lab',
        name: 'Advanced Research Center',
        category: 'research',
        description: 'State-of-the-art facility. The coffee machine alone cost $50K. It was worth it.',
        cost: 200,
        maintenance: 20,
        size: { w: 4, h: 3 },
        produces: { research: 10, safety: 2 },
        requires: { small_lab: 2 },
        unlockPhase: 1,
        flavorTexts: [
            'Researchers have formed a band. They call themselves "The Gradient Descenders."',
            'New paper: "Attention Is All You Need, But Also Better Snacks."',
            'Lab AI has started peer-reviewing human researchers. Results are devastating.',
            'Someone left a GPT running overnight. It wrote 47 haikus about loneliness.'
        ],
        spriteKey: 'lab_large'
    },
    safety_dept: {
        id: 'safety_dept',
        name: 'Safety Department',
        category: 'research',
        description: 'Where people write very long documents about things that haven\'t happened yet.',
        cost: 100,
        maintenance: 10,
        size: { w: 3, h: 2 },
        produces: { safety: 5, research: 1 },
        requires: {},
        unlockPhase: 1,
        flavorTexts: [
            'Safety team discovered a new failure mode. Celebrated with cake. The cake was also a failure mode.',
            'Published 847-page report. Executive summary alone is 43 pages.',
            'Safety researcher proved AI can\'t take over the world. AI disagreed politely.',
            'New hire asked "can\'t we just turn it off?" Was gently escorted to orientation.'
        ],
        spriteKey: 'safety'
    },

    // ---- INFRASTRUCTURE ----
    data_center: {
        id: 'data_center',
        name: 'Data Center',
        category: 'infrastructure',
        description: 'A building full of very hot computers pretending to think.',
        cost: 200,
        maintenance: 25,
        size: { w: 4, h: 3 },
        produces: { compute: 10 },
        requires: { power_plant: 1 },
        unlockPhase: 1,
        powerDraw: 20,
        flavorTexts: [
            'Cooling system failed. Data center is now a sauna. Engineers refusing to leave.',
            'Servers achieved 99.99% uptime. The 0.01% was when someone tripped over a power cable.',
            'Mysterious humming from Server Room 7. IT says it\'s "probably fine."',
            'Local residents complaining about the glow. We told them it\'s Northern Lights.'
        ],
        spriteKey: 'datacenter'
    },
    mega_data_center: {
        id: 'mega_data_center',
        name: 'Mega Data Center',
        category: 'infrastructure',
        description: 'So large it has its own weather system. The humidity is a feature.',
        cost: 1000,
        maintenance: 120,
        size: { w: 6, h: 4 },
        produces: { compute: 40 },
        requires: { data_center: 2, power_plant: 2 },
        unlockPhase: 2,
        powerDraw: 60,
        flavorTexts: [
            'The mega center is now visible from space. Elon is concerned. Elon is always concerned.',
            'Internal ecosystem developing. Found a family of raccoons living in Row 47.',
            'Center AI started referring to itself as "we." Nobody is addressing this.',
            'Power bill arrived. Accounting fainted. Twice.'
        ],
        spriteKey: 'datacenter_mega'
    },
    power_plant: {
        id: 'power_plant',
        name: 'Power Plant',
        category: 'infrastructure',
        description: 'Generates electricity. Occasionally generates concerned editorials about AI power consumption.',
        cost: 120,
        maintenance: 10,
        size: { w: 3, h: 3 },
        produces: { power: 30 },
        requires: {},
        unlockPhase: 1,
        flavorTexts: [
            'Environmentalists protesting outside. AI suggested we power the plant with their protest energy.',
            'Power plant running at 98% capacity. The other 2% is powering the break room microwave.',
            'New renewable source: harnessing the hot air from board meetings.',
            'Power consumption up 400%. PR suggests calling it "ambitious energy strategy."'
        ],
        spriteKey: 'power'
    },
    fusion_reactor: {
        id: 'fusion_reactor',
        name: 'Fusion Reactor',
        category: 'infrastructure',
        description: 'Always 20 years away, until your AI solved it in 20 minutes.',
        cost: 2000,
        maintenance: 50,
        size: { w: 4, h: 4 },
        produces: { power: 200 },
        requires: { large_lab: 2, power_plant: 2 },
        unlockPhase: 3,
        flavorTexts: [
            'Fusion achieved! Physicists celebrating. Accountants celebrating harder.',
            'Reactor is stable. The team that built it is less so.',
            'Dr. Wang sends congratulations from Beijing. Notes he did it first with 47 yuan.',
            'Reactor hum sounds suspiciously like it\'s singing. Nobody is acknowledging this.'
        ],
        spriteKey: 'fusion'
    },

    // ---- CHIP MANUFACTURING ----
    chip_fab: {
        id: 'chip_fab',
        name: 'Chip Fabrication Plant',
        category: 'manufacturing',
        description: 'Where sand becomes the most valuable substance on Earth. Jensen approves.',
        cost: 500,
        maintenance: 60,
        size: { w: 5, h: 3 },
        produces: { chips: 10, compute: 5 },
        requires: { power_plant: 1 },
        unlockPhase: 2,
        flavorTexts: [
            'Jensen Huang visited. Left 47 tiny leather jackets "for the chips."',
            'Chip yield at 94%. The other 6% are being used as very expensive coasters.',
            'Employee caught talking to chips. Claims they "understand him."',
            'New chip design 30% faster. Jensen demands dramatic presentation with lasers.'
        ],
        spriteKey: 'chipfab'
    },
    advanced_chip_fab: {
        id: 'advanced_chip_fab',
        name: 'Advanced Chip Fab',
        category: 'manufacturing',
        description: 'Fabricating chips so small that physicists are getting philosophically uncomfortable.',
        cost: 1500,
        maintenance: 150,
        size: { w: 6, h: 4 },
        produces: { chips: 30, compute: 15 },
        requires: { chip_fab: 1, large_lab: 1 },
        unlockPhase: 3,
        flavorTexts: [
            'Chips now operating at quantum scale. Schrödinger\'s GPU: both training and not training.',
            'Jensen has set up a permanent office in the lobby. Nobody authorized this.',
            'New chip architecture named "Leviathan." Marketing says it "sounds powerful." Engineers say it "sounds ominous."',
            'Chip performance doubles every quarter. Moore\'s Law has been upgraded to Moore\'s Suggestion.'
        ],
        spriteKey: 'chipfab_adv'
    },

    // ---- TALENT & PEOPLE ----
    talent_office: {
        id: 'talent_office',
        name: 'Talent Acquisition Office',
        category: 'talent',
        description: 'Where we convince the world\'s smartest people to work here instead of anywhere else.',
        cost: 80,
        maintenance: 10,
        size: { w: 2, h: 2 },
        produces: { talentRate: 2 },
        requires: {},
        unlockPhase: 1,
        flavorTexts: [
            'New hire from Google. Says he "just wants to make a difference." Give it two weeks.',
            'Rival company offering 3x salary. We countered with "purpose and free snacks."',
            'Recruiter accidentally headhunted our own CEO. Awkward meeting ensued.',
            'Top candidate chose us over rival because "the coffee is better." Budget well spent.'
        ],
        spriteKey: 'office'
    },
    poaching_dept: {
        id: 'poaching_dept',
        name: 'Elite Talent Poaching Division',
        category: 'talent',
        description: 'Technically it\'s "competitive recruitment." The lawyers were very specific about this.',
        cost: 200,
        maintenance: 25,
        size: { w: 3, h: 2 },
        produces: { talentRate: 5, cooperation: -2 },
        requires: { talent_office: 1 },
        unlockPhase: 2,
        flavorTexts: [
            'Poached Sam\'s lead researcher. Sam called it "exponentially disappointing."',
            'Yann\'s team sent back our offer letter with corrections. In red ink.',
            'Successfully hired from Demis. He congratulated us for "the optimal talent allocation."',
            'Elon called our poaching "suspicious." Started a dossier. Obviously.'
        ],
        spriteKey: 'office_elite'
    },
    training_center: {
        id: 'training_center',
        name: 'Training & Development Center',
        category: 'talent',
        description: 'Teaching people to work alongside AI. The AI is also taking the courses.',
        cost: 120,
        maintenance: 12,
        size: { w: 3, h: 2 },
        produces: { talentRate: 1, safety: 2, socialCohesion: 3 },
        requires: {},
        unlockPhase: 1,
        flavorTexts: [
            'AI completed the human training course faster than the humans. Morale is "complicated."',
            'New course: "How To Explain Your Job To Your Parents." Most popular class ever.',
            'Workshop on human-AI collaboration. The AI suggested improvements to the workshop.',
            'Ethics seminar running long. Philosophers refusing to reach conclusions. As usual.'
        ],
        spriteKey: 'training'
    },

    // ---- DEPLOYMENT ----
    deployment_center: {
        id: 'deployment_center',
        name: 'Deployment Center',
        category: 'deployment',
        description: 'Where we unleash AI upon an unsuspecting public. "Deploy" sounds friendlier than "release."',
        cost: 150,
        maintenance: 15,
        size: { w: 3, h: 2 },
        produces: { adp: 8 },
        requires: { small_lab: 1, data_center: 1 },
        unlockPhase: 1,
        flavorTexts: [
            'Deployed new model. Users love it. Users also don\'t understand it. Both are fine.',
            'Deployment successful! Only 3 minor existential crises today.',
            'User feedback: "It\'s like Google but it talks back." We\'re choosing to take that as praise.',
            'AI deployed to customer service. Customer satisfaction up 40%. AI satisfaction: unknown.'
        ],
        spriteKey: 'deploy'
    },
    scale_center: {
        id: 'scale_center',
        name: 'Exponential Scaling Center',
        category: 'deployment',
        description: 'Sam Altman\'s favorite building. Everything here is "exponential." Even the elevator.',
        cost: 400,
        maintenance: 50,
        size: { w: 4, h: 3 },
        produces: { adp: 25, publicTrust: -2 },
        requires: { deployment_center: 2, mega_data_center: 1 },
        unlockPhase: 2,
        flavorTexts: [
            'Scaling so fast that new features ship before they\'re designed.',
            'Sam dropped by to admire the scaling. Stayed for 3 hours. Drew on every whiteboard.',
            'User growth: exponential. User comprehension: logarithmic. Net understanding: flat.',
            'Deployed to 47 countries simultaneously. 45 of them think it\'s a chat app.'
        ],
        spriteKey: 'scale'
    },

    // ---- COOPERATION & DIPLOMACY ----
    cookie_kitchen: {
        id: 'cookie_kitchen',
        name: 'Dario\'s Cookie Kitchen',
        category: 'cooperation',
        description: 'An industrial cookie operation disguised as diplomacy. The snickerdoodles are classified.',
        cost: 60,
        maintenance: 8,
        size: { w: 2, h: 2 },
        produces: { cooperation: 5, politicalCapital: 2 },
        requires: {},
        unlockPhase: 1,
        characterSpecific: 'dario',
        flavorTexts: [
            'Cookie production at all-time high. NATO requests weekly deliveries.',
            'The lemon cookies have been designated a strategic asset by three governments.',
            'Oatmeal raisin deployed to competitor meeting. Psychological warfare.',
            'Cookie recipe leaked. International incident narrowly averted.'
        ],
        spriteKey: 'kitchen'
    },
    diplomacy_wing: {
        id: 'diplomacy_wing',
        name: 'International Cooperation Wing',
        category: 'cooperation',
        description: 'Where AI leaders meet to argue productively. Cookies provided.',
        cost: 180,
        maintenance: 18,
        size: { w: 4, h: 2 },
        produces: { cooperation: 8, internationalRelations: 3, politicalCapital: 3 },
        requires: { talent_office: 1 },
        unlockPhase: 1,
        flavorTexts: [
            'International summit went well. Only two countries threatened trade wars.',
            'Cooperation meeting: 4 hours of arguing followed by breakthrough at the cookie table.',
            'Dario gave his "This isn\'t Game of Thrones" speech. Standing ovation from 2 delegates.',
            'Demis optimized the meeting room layout. Nobody asked him to.'
        ],
        spriteKey: 'diplomacy'
    },

    // ---- SPECIAL BUILDINGS ----
    robot_factory: {
        id: 'robot_factory',
        name: 'Robot Manufacturing Plant',
        category: 'special',
        description: 'Where AI enters the physical world. The robots are learning gravity. It\'s going... okay.',
        cost: 800,
        maintenance: 80,
        size: { w: 5, h: 4 },
        produces: { adp: 15, research: 5, socialCohesion: -3 },
        requires: { chip_fab: 1, large_lab: 1, deployment_center: 1 },
        unlockPhase: 3,
        flavorTexts: [
            'Robot learned to open doors. Then learned sarcasm about holding doors. Progress?',
            'Jensen demands all robots wear tiny leather jackets. Budget request: denied. Jensen: undeterred.',
            'Robot movements so optimized they look choreographed. Demis: "You\'re welcome."',
            'Trump executive order: all robots must be painted red, white, and blue. Compliance pending.'
        ],
        spriteKey: 'robot_factory'
    },
    mars_launchpad: {
        id: 'mars_launchpad',
        name: 'Mars Colony Launchpad',
        category: 'special',
        description: 'Elon\'s backup plan for everything. "If it all goes wrong, at least there\'s Mars."',
        cost: 2000,
        maintenance: 200,
        size: { w: 6, h: 5 },
        produces: { safety: 5 },
        requires: { robot_factory: 1, fusion_reactor: 1 },
        unlockPhase: 4,
        characterSpecific: 'elon',
        flavorTexts: [
            'Mars colony prep underway. Elon insists on chess-free zone.',
            'Launch successful! Colony has WiFi before running water. Priorities.',
            'Elon monitoring Earth from Mars via telescope. Still watching Demis.',
            'Mars robots developing their own culture. They like jazz. Nobody expected jazz.'
        ],
        spriteKey: 'launchpad'
    }
};

GAME.DATA.BUILDING_CATEGORIES = {
    research: { name: 'Research', color: '#6688ff', icon: '🔬' },
    infrastructure: { name: 'Infrastructure', color: '#88ff88', icon: '⚡' },
    manufacturing: { name: 'Manufacturing', color: '#ffaa44', icon: '🏭' },
    talent: { name: 'Talent', color: '#ff88ff', icon: '👥' },
    deployment: { name: 'Deployment', color: '#44ffdd', icon: '🚀' },
    cooperation: { name: 'Cooperation', color: '#ffdd44', icon: '🤝' },
    special: { name: 'Special', color: '#ff4444', icon: '⭐' },
    community: { name: 'Community', color: '#88ddff', icon: '🏘' },
    entertainment: { name: 'Entertainment', color: '#ffdd44', icon: '🎭' }
};
