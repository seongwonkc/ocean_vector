// VECTOR Assessment Platform — Question Bank v0.3
// Powered by OCEAN | Internal Document | Do Not Distribute

// ─── PERSONALITY PAIRS ───────────────────────────────────────────────────────
// traitA: trait point if student picks option A
// traitB: trait point if student picks option B
const PERSONALITY_PAIRS = [
  { id: 1, traitA: 'O', traitB: 'C',
    textA: 'I often spend extra time understanding why a method works, even when I already know how to apply it.',
    textB: 'I prioritize the question types most likely to appear on the test.' },
  { id: 2, traitA: 'O', traitB: 'C',
    textA: 'I find myself thinking about ideas from class long after the lesson, even when they won\'t be tested.',
    textB: 'When I study, I focus on what will most directly improve my score.' },
  { id: 3, traitA: 'C', traitB: 'O',
    textA: 'I break large study tasks into specific steps and work through them in order.',
    textB: 'I tend to follow a topic wherever it leads, even if it takes me beyond what was assigned.' },
  { id: 4, traitA: 'O', traitB: 'C',
    textA: 'When I find a concept genuinely interesting, I look into it further even if it slows me down.',
    textB: 'I track my progress carefully enough that I always know which areas still need work.' },
  { id: 5, traitA: 'O', traitB: 'C',
    textA: 'I\'m drawn to problems that don\'t have a single clear answer.',
    textB: 'I keep a study log so I always know what I\'ve covered and what\'s left.' },
  { id: 6, traitA: 'C', traitB: 'N',
    textA: 'Once I\'ve hit my study target for the day, I can stop without much difficulty.',
    textB: 'Even when I\'m ahead of schedule, I feel uneasy if I\'m not using every available hour to prepare.' },
  { id: 7, traitA: 'N', traitB: 'C',
    textA: 'I study noticeably harder right after a session where I felt like I made real progress.',
    textB: 'My study effort stays roughly the same whether my last session went well or not.' },
  { id: 8, traitA: 'C', traitB: 'N',
    textA: 'Before a high-stakes test, I feel ready once I\'ve completed my planned preparation.',
    textB: 'Before a high-stakes test, I keep finding things I want to review even after I feel prepared.' },
  { id: 9, traitA: 'C', traitB: 'N',
    textA: 'I can draw a clear line between study time and rest time without it bothering me.',
    textB: 'During breaks, I often find myself thinking about what I should be reviewing instead of actually resting.' },
  { id: 10, traitA: 'N', traitB: 'O',
    textA: 'Even after I understand a mistake, I still catch myself thinking back to it later.',
    textB: 'Once I\'ve understood a mistake, I\'m more focused on the next problem than the one I got wrong.' },
  { id: 11, traitA: 'O', traitB: 'N',
    textA: 'When I encounter something unfamiliar while studying, my first instinct is to explore it.',
    textB: 'When I encounter something unfamiliar close to a test, I feel unsettled until I know how important it is.' },
  { id: 12, traitA: 'O', traitB: 'N',
    textA: 'When I\'m deep in a subject I find interesting, I lose track of time without noticing.',
    textB: 'When I\'m studying, I keep one eye on the clock to make sure I\'m staying on pace.' },
  { id: 13, traitA: 'N', traitB: 'E',
    textA: 'When a teacher gives me critical feedback, I find myself thinking about it much longer than they probably intended.',
    textB: 'After getting feedback, I find it easier to process if I can talk it through with someone right away.' },
  { id: 14, traitA: 'N', traitB: 'A',
    textA: 'After a rough session, I usually need to work through the feeling on my own before I can move on.',
    textB: 'After a rough session, I find it hard to reset until I\'ve heard from someone else that it\'s okay.' },
  { id: 15, traitA: 'C', traitB: 'A',
    textA: 'I prefer to manage my own preparation independently rather than coordinating with others.',
    textB: 'I often end up helping others with material, even when it slows down my own study plan.' },
  { id: 16, traitA: 'C', traitB: 'E',
    textA: 'After each practice test, I go through my mistakes before moving to new material.',
    textB: 'I tend to understand things better when I can talk them through with someone.' },
  { id: 17, traitA: 'C', traitB: 'E',
    textA: 'I keep a clear record of which topics I\'ve covered and which still need work.',
    textB: 'I find studying with others more energizing than studying alone.' },
  { id: 18, traitA: 'O', traitB: 'E',
    textA: 'I like subjects where there\'s more than one valid way to interpret things.',
    textB: 'I\'m usually comfortable speaking up in class when I have a question.' },
  { id: 19, traitA: 'O', traitB: 'E',
    textA: 'I enjoy reading about a topic beyond what\'s actually being tested.',
    textB: 'I prefer working through problems with a partner rather than on my own.' },
  { id: 20, traitA: 'O', traitB: 'A',
    textA: 'I\'d rather understand the reasoning behind a formula than just memorize it.',
    textB: 'In a study group, I make sure everyone understands the material before we move on.' },
];

// Trait max scores (how many pairs each trait can win)
const TRAIT_MAX = { O: 11, C: 12, N: 9, E: 5, A: 3 };

// ─── RW MODULE 1 — Medium Difficulty ─────────────────────────────────────────
// 20 questions | 25 minutes | Fixed for all students
// Answer Key: 1-B | 2-C | 3-B | 4-B | 5-B | 6-B | 7-C | 8-B | 9-C | 10-C |
//             11-B | 12-B | 13-C | 14-C | 15-C | 16-C | 17-B | 18-D | 19-B | 20-B

const RW1_QUESTIONS = [
  {
    id: 'rw1_q1', num: 1, type: 'vocabulary', domain: 'craft_structure',
    signal: null, highSignal: false,
    passage: 'Bioluminescence, the production of light by living organisms, is widespread in the deep ocean. Scientists studying deep-sea creatures have documented that this ability to generate light serves multiple functions, including attracting prey and communicating with potential mates. Researchers have recently proposed that bioluminescence may also play a _______ role in deterring predators, as the sudden flash of light can startle or confuse animals attempting to feed.',
    table: null, underline: null,
    question: 'Which choice completes the text with the most logical and precise word or phrase?',
    choices: { A: 'marginal', B: 'defensive', C: 'decorative', D: 'preliminary' },
    answer: 'B', isSPR: false
  },
  {
    id: 'rw1_q2', num: 2, type: 'vocabulary', domain: 'craft_structure',
    signal: null, highSignal: false,
    passage: 'Economists studying the gig economy have noted that platform-based work arrangements offer workers considerable scheduling flexibility. Critics, however, argue that this flexibility comes at a cost: gig workers typically lack access to benefits such as health insurance and retirement plans, leaving them financially _______ compared to traditional employees.',
    table: null, underline: null,
    question: 'Which choice completes the text with the most logical and precise word or phrase?',
    choices: { A: 'liberated', B: 'competitive', C: 'vulnerable', D: 'diversified' },
    answer: 'C', isSPR: false
  },
  {
    id: 'rw1_q3', num: 3, type: 'structure', domain: 'craft_structure',
    signal: 'O', highSignal: false,
    passage: 'The city at night reveals what daytime conceals. Street vendors pack up their carts, and the rush-hour crowd thins to a trickle. What remains is the infrastructure itself: the scaffolding of bridges, the geometry of intersections, the hum of ventilation systems keeping office towers alive in the dark.',
    underline: 'A city\'s design is most legible, perhaps, when its human activity is stripped away.',
    table: null,
    question: 'Which choice best describes the function of the underlined sentence in the text as a whole?',
    choices: {
      A: 'It introduces a claim that the following sentences then qualify.',
      B: 'It provides a conclusion supported by the observations in the preceding sentences.',
      C: 'It contradicts the main argument of the text.',
      D: 'It introduces a new topic unrelated to the preceding description.'
    },
    answer: 'B', isSPR: false
  },
  {
    id: 'rw1_q4', num: 4, type: 'structure', domain: 'craft_structure',
    signal: 'O', highSignal: false,
    passage: 'In 2018, researchers studying soil microbiomes discovered that certain bacterial colonies produce chemical signals that inhibit the growth of competing species. Earlier studies had focused primarily on competition through nutrient depletion — the idea that bacteria simply outcompete rivals by consuming available resources. The new findings suggest, however, that direct chemical interference is at least as important as resource competition in shaping microbial communities.',
    table: null, underline: null,
    question: 'Which choice best describes the overall structure of the text?',
    choices: {
      A: 'It describes a scientific discovery, then explains how it supports an existing theory.',
      B: 'It presents an older explanation, introduces a newer finding, and then indicates how the finding revises the earlier understanding.',
      C: 'It outlines a research methodology and then evaluates its effectiveness.',
      D: 'It proposes a hypothesis and then describes the experiment used to test it.'
    },
    answer: 'B', isSPR: false
  },
  {
    id: 'rw1_q5', num: 5, type: 'structure', domain: 'craft_structure',
    signal: 'O', highSignal: false,
    passage: 'Researchers have long assumed that individuals make financial decisions based on rational self-interest. The field of behavioral economics has challenged this assumption by documenting ways in which people consistently deviate from purely rational behavior — choosing smaller immediate rewards over larger delayed ones, or weighting losses more heavily than equivalent gains. These deviations are not random errors but systematic patterns that can be predicted and, in some cases, corrected through careful policy design.',
    table: null, underline: null,
    question: 'Which choice best describes the function of the final sentence in the text?',
    choices: {
      A: 'It introduces a counterargument to the findings described earlier.',
      B: 'It explains that the deviations follow consistent patterns with practical implications.',
      C: 'It suggests that behavioral economics has failed to improve financial decision-making.',
      D: 'It qualifies the claim made in the first sentence by noting exceptions to rational behavior.'
    },
    answer: 'B', isSPR: false
  },
  {
    id: 'rw1_q6', num: 6, type: 'dual_text', domain: 'craft_structure',
    signal: 'O', highSignal: true,
    passage: null,
    dualText: {
      text1: 'Research on the effects of social media on adolescent mental health has produced consistent findings: higher usage is associated with increased rates of anxiety and depression. A 2019 meta-analysis of over 40 studies found a significant negative correlation between time spent on social media platforms and self-reported well-being among teenagers.',
      text2: 'Critics of the social media and mental health research argue that correlation studies cannot establish causation. Adolescents experiencing anxiety or depression may be more likely to seek social connection online, meaning that mental health difficulties could drive social media use rather than the reverse. Without longitudinal data tracking individuals over time, the direction of the relationship remains unclear.'
    },
    table: null, underline: null,
    question: 'Based on the texts, how would the author of Text 2 most likely respond to the findings described in Text 1?',
    choices: {
      A: 'As unsurprising, given that social media was already known to cause anxiety in adults.',
      B: 'As potentially misleading, because correlation data cannot determine whether social media causes poor mental health or vice versa.',
      C: 'As well-designed, because the meta-analysis drew on a large number of studies.',
      D: 'As irrelevant, because adolescent mental health is primarily determined by factors unrelated to social media.'
    },
    answer: 'B', isSPR: false
  },
  {
    id: 'rw1_q7', num: 7, type: 'dual_text', domain: 'craft_structure',
    signal: 'O', highSignal: true,
    passage: null,
    dualText: {
      text1: 'Proponents of universal basic income (UBI) argue that providing all citizens with a guaranteed monthly payment reduces poverty and gives workers greater bargaining power. Several pilot programs have shown that recipients of unconditional cash transfers tend to spend the money on necessities rather than frivolous goods.',
      text2: 'Economists skeptical of UBI point to inflation as a central concern. If all citizens receive additional income simultaneously, the resulting increase in consumer spending power could drive up prices, effectively eroding the purchasing power of the payments and disproportionately harming fixed-income households.'
    },
    table: null, underline: null,
    question: 'Which of the following, if true, would most directly address the concern raised in Text 2?',
    choices: {
      A: 'Recipients of UBI payments in pilot programs reported higher levels of life satisfaction than non-recipients.',
      B: 'The cost of implementing a national UBI program would require significant tax increases on high earners.',
      C: 'UBI payments could be funded by redirecting existing government expenditures rather than increasing the money supply.',
      D: 'Workers in countries with stronger safety nets have higher productivity than those in countries without such systems.'
    },
    answer: 'C', isSPR: false
  },
  {
    id: 'rw1_q8', num: 8, type: 'dual_text', domain: 'craft_structure',
    signal: 'O', highSignal: true,
    passage: null,
    dualText: {
      text1: 'Marine biologist Dr. Keiko Watanabe argues that coral bleaching events — which occur when rising ocean temperatures cause corals to expel the algae living in their tissues — are becoming more frequent and more severe due to climate change. Without intervention, she contends, large sections of the world\'s reef systems could be functionally extinct within decades.',
      text2: 'A separate team of researchers studying coral adaptation has documented cases of "super corals" — populations that survived bleaching events and subsequently showed greater thermal tolerance. The team argues that natural selection may be producing heat-resistant coral strains faster than previously expected, potentially offering reefs a pathway to survival without human intervention.'
    },
    table: null, underline: null,
    question: 'Based on the texts, Dr. Watanabe and the researchers in Text 2 would most likely agree on which of the following?',
    choices: {
      A: 'Human intervention is the only viable strategy for protecting coral reef systems.',
      B: 'Coral bleaching events are increasing in frequency as ocean temperatures rise.',
      C: 'Natural selection alone will be sufficient to prevent the extinction of reef systems.',
      D: 'Super corals are found primarily in regions where bleaching events have been most severe.'
    },
    answer: 'B', isSPR: false
  },
  {
    id: 'rw1_q9', num: 9, type: 'data', domain: 'info_ideas',
    signal: 'O', highSignal: false,
    passage: 'A research team examined the relationship between self-reported study time and performance on a standardized exam.',
    table: `<table class="data-table">
      <thead><tr><th>Daily Study Hours</th><th>Avg. Score Improvement</th></tr></thead>
      <tbody>
        <tr><td>1–2 hours</td><td>28 points</td></tr>
        <tr><td>3–4 hours</td><td>52 points</td></tr>
        <tr><td>5–6 hours</td><td>61 points</td></tr>
        <tr><td>7+ hours</td><td>58 points</td></tr>
      </tbody>
    </table>`,
    underline: null,
    question: 'Based on the data in the table, which of the following conclusions is most directly supported?',
    choices: {
      A: 'Students who study more than 6 hours daily consistently outperform those who study fewer hours.',
      B: 'The relationship between study hours and score improvement is strongest at lower levels of study time.',
      C: 'Students who study 7 or more hours per day show diminishing returns compared to those who study 5–6 hours.',
      D: 'Score improvement is unrelated to study time among students who study more than 4 hours per day.'
    },
    answer: 'C', isSPR: false
  },
  {
    id: 'rw1_q10', num: 10, type: 'data', domain: 'info_ideas',
    signal: 'O', highSignal: false,
    passage: 'An environmental analyst is comparing carbon emissions across sectors and countries.',
    table: `<table class="data-table">
      <thead><tr><th>Sector</th><th>Country A</th><th>Country B</th><th>Country C</th></tr></thead>
      <tbody>
        <tr><td>Transport</td><td>28%</td><td>15%</td><td>22%</td></tr>
        <tr><td>Industry</td><td>31%</td><td>42%</td><td>38%</td></tr>
        <tr><td>Energy</td><td>25%</td><td>33%</td><td>27%</td></tr>
        <tr><td>Agriculture</td><td>16%</td><td>10%</td><td>13%</td></tr>
      </tbody>
    </table>`,
    underline: null,
    question: 'An environmental researcher notes that industrial emissions make up the largest share of total carbon output in _______. Which choice most effectively uses data from the table to complete the statement?',
    choices: {
      A: 'Country A only.',
      B: 'Country A and Country C.',
      C: 'Country B and Country C.',
      D: 'all three countries.'
    },
    answer: 'C', isSPR: false
  },
  {
    id: 'rw1_q11', num: 11, type: 'inference', domain: 'info_ideas',
    signal: 'O', highSignal: true,
    passage: 'Scientists studying population dynamics in island ecosystems have found that when a top predator is removed, prey species populations initially increase. This population surge is typically followed by overgrazing or overconsumption of resources, which eventually causes prey populations to collapse. Researchers refer to this cycle as a "trophic cascade" and argue that it demonstrates _______',
    table: null, underline: null,
    question: 'Which choice most logically completes the text?',
    choices: {
      A: 'that island ecosystems are more resilient than mainland ecosystems to disruption.',
      B: 'the critical role that predators play in maintaining the balance of ecosystems.',
      C: 'that prey species require human intervention to manage their populations effectively.',
      D: 'that overgrazing is the primary cause of biodiversity loss in island habitats.'
    },
    answer: 'B', isSPR: false
  },
  {
    id: 'rw1_q12', num: 12, type: 'inference', domain: 'info_ideas',
    signal: 'O', highSignal: true,
    passage: 'A 2020 analysis of urban commuting patterns found that cities with extensive public transit networks had significantly lower rates of traffic congestion. However, the study also found that cities with the highest public transit ridership were those with the highest urban density. The researchers cautioned that their findings do not necessarily mean that building more transit reduces congestion, since _______',
    table: null, underline: null,
    question: 'Which choice most logically completes the text?',
    choices: {
      A: 'cities with lower density tend to have fewer resources available for transit infrastructure.',
      B: 'commuters in dense cities may choose transit regardless of its quality because driving is impractical.',
      C: 'public transit ridership tends to decrease as urban populations grow.',
      D: 'the relationship between congestion and transit availability has not been studied in rural areas.'
    },
    answer: 'B', isSPR: false
  },
  {
    id: 'rw1_q13', num: 13, type: 'inference', domain: 'info_ideas',
    signal: 'O', highSignal: true,
    passage: 'The novelist argues that the best literary characters resist easy categorization. Rather than embodying pure virtue or unambiguous villainy, such characters force readers to sit with moral uncertainty — to recognize the complexity of human motivation without the relief of a clear verdict. This discomfort, the novelist suggests, is not a weakness of good fiction but _______',
    table: null, underline: null,
    question: 'Which choice most logically completes the text?',
    choices: {
      A: 'a reason why some readers prefer narratives with morally clear characters.',
      B: 'evidence that literary novels are less accessible than genre fiction to general audiences.',
      C: 'precisely what makes literature a more powerful instrument of moral inquiry than simple moral tales.',
      D: 'an argument for why novelists should strive for simplicity rather than complexity.'
    },
    answer: 'C', isSPR: false
  },
  {
    id: 'rw1_q14', num: 14, type: 'inference', domain: 'info_ideas',
    signal: 'O', highSignal: true,
    passage: 'Researchers studying the sleep patterns of migratory birds discovered that some species appear to sleep with only one hemisphere of their brain at a time — a phenomenon called unihemispheric slow-wave sleep. This allows the birds to remain partially alert to threats while still getting the rest they need during long flights over open water. If this finding holds across other species under sustained pressure, it would suggest that _______',
    table: null, underline: null,
    question: 'Which choice most logically completes the text?',
    choices: {
      A: 'sleep is not a biological necessity for birds as it is for mammals.',
      B: 'migratory birds do not experience fatigue during long-distance flights.',
      C: 'the brain may be capable of flexible adaptation in response to conditions that make full sleep dangerous.',
      D: 'unihemispheric sleep is a behavior that birds developed independently from other animals.'
    },
    answer: 'C', isSPR: false
  },
  {
    id: 'rw1_q15', num: 15, type: 'inference', domain: 'info_ideas',
    signal: 'O', highSignal: true,
    passage: 'A historian studying the spread of literacy in nineteenth-century Europe notes that the expansion of public education coincided with a dramatic increase in newspaper circulation. However, she cautions against concluding that education caused the rise of the press, pointing out that newspaper circulation also grew rapidly in regions where formal schooling remained limited. She argues that a more accurate explanation is that _______',
    table: null, underline: null,
    question: 'Which choice most logically completes the text?',
    choices: {
      A: 'public education was more effective in urban areas than in rural regions.',
      B: 'the growth of the newspaper industry was driven primarily by advances in printing technology rather than changes in literacy rates.',
      C: 'literacy and newspaper readership both expanded independently in response to broader economic and social changes.',
      D: 'newspapers played a more important role in spreading literacy than formal schooling did.'
    },
    answer: 'C', isSPR: false
  },
  {
    id: 'rw1_q16', num: 16, type: 'sec', domain: 'sec',
    signal: null, highSignal: false,
    passage: 'Early scientists believed that bacteria could not survive in extremely acidic environments. _______ researchers have since discovered thriving bacterial communities in hot springs with pH levels approaching 1.',
    table: null, underline: null,
    question: 'Which choice completes the text so that it conforms to the conventions of Standard English?',
    choices: { A: 'Therefore,', B: 'Similarly,', C: 'However,', D: 'As a result,' },
    answer: 'C', isSPR: false
  },
  {
    id: 'rw1_q17', num: 17, type: 'sec', domain: 'sec',
    signal: null, highSignal: false,
    passage: 'The migration patterns of the Arctic tern, which travels from pole to pole each year, _______ among the most extensive of any animal on Earth, covering a distance equivalent to three trips to the Moon and back over a lifetime.',
    table: null, underline: null,
    question: 'Which choice completes the text so that it conforms to the conventions of Standard English?',
    choices: { A: 'is', B: 'are', C: 'was', D: 'were' },
    answer: 'B', isSPR: false
  },
  {
    id: 'rw1_q18', num: 18, type: 'eoi_transition', domain: 'eoi',
    signal: null, highSignal: false,
    passage: 'Rainforests cover less than six percent of the Earth\'s surface. _______ they are home to more than half of the world\'s plant and animal species.',
    table: null, underline: null,
    question: 'Which choice completes the text with the most logical transition?',
    choices: { A: 'Similarly,', B: 'As a result,', C: 'For example,', D: 'Yet' },
    answer: 'D', isSPR: false
  },
  {
    id: 'rw1_q19', num: 19, type: 'eoi_transition', domain: 'eoi',
    signal: null, highSignal: false,
    passage: 'The ancient Romans built roads throughout their empire to move armies and supplies quickly. _______ these roads also facilitated trade and communication between distant regions.',
    table: null, underline: null,
    question: 'Which choice completes the text with the most logical transition?',
    choices: { A: 'However,', B: 'In addition,', C: 'Therefore,', D: 'Although' },
    answer: 'B', isSPR: false
  },
  {
    id: 'rw1_q20', num: 20, type: 'eoi_synthesis', domain: 'eoi',
    signal: null, highSignal: false,
    passage: null,
    notes: [
      'Mangrove forests grow along tropical and subtropical coastlines.',
      'Their roots trap sediment, preventing coastal erosion.',
      'They provide habitat for hundreds of species of fish, birds, and invertebrates.',
      'A 2022 study found that mangrove restoration projects reduced storm damage by up to 30%.'
    ],
    noteTask: 'The student wants to emphasize the protective benefits of mangrove forests.',
    table: null, underline: null,
    question: 'Which choice most effectively uses relevant information from the notes to accomplish this goal?',
    choices: {
      A: 'Mangrove forests, which are found in tropical and subtropical regions, have dense root systems that support a wide variety of species.',
      B: 'By trapping sediment and reducing storm impact, mangrove forests help protect coastlines from both gradual erosion and sudden damage.',
      C: 'According to a 2022 study, mangrove restoration projects can reduce storm damage, suggesting these forests have value beyond their ecological role.',
      D: 'Mangrove forests provide habitat for hundreds of species, making them among the most biodiverse ecosystems on Earth.'
    },
    answer: 'B', isSPR: false
  },
];

// ─── RW MODULE 2 — EASY ───────────────────────────────────────────────────────
// 20 questions | 25 minutes | Routed students ≤13 on Module 1
// Answer Key: 1-A | 2-B | 3-B | 4-B | 5-B | 6-B | 7-B | 8-B | 9-A | 10-C |
//             11-B | 12-B | 13-B | 14-B | 15-C | 16-A | 17-C | 18-C | 19-C | 20-B

const RW2_EASY_QUESTIONS = [
  {
    id: 'rw2e_q1', num: 1, type: 'vocabulary', domain: 'craft_structure',
    signal: null, highSignal: false,
    passage: 'The migration of monarch butterflies from Canada to Mexico is one of the most remarkable journeys in the animal kingdom. Scientists have found that these butterflies use the position of the sun as a _______ guide, adjusting their flight direction as the sun moves across the sky throughout the day.',
    table: null, underline: null,
    question: 'Which choice completes the text with the most logical and precise word or phrase?',
    choices: { A: 'navigational', B: 'theoretical', C: 'seasonal', D: 'decorative' },
    answer: 'A', isSPR: false
  },
  {
    id: 'rw2e_q2', num: 2, type: 'vocabulary', domain: 'craft_structure',
    signal: null, highSignal: false,
    passage: 'The invention of the printing press in the fifteenth century made books far more _______ than they had previously been, allowing texts that once existed in only a handful of handwritten copies to be reproduced in editions of hundreds or thousands.',
    table: null, underline: null,
    question: 'Which choice completes the text with the most logical and precise word or phrase?',
    choices: { A: 'expensive', B: 'accessible', C: 'complex', D: 'exclusive' },
    answer: 'B', isSPR: false
  },
  {
    id: 'rw2e_q3', num: 3, type: 'structure', domain: 'craft_structure',
    signal: null, highSignal: false,
    passage: 'On her last day of work, Mrs. Chen arrived early, as she had every morning for thirty-one years. She arranged the chairs into their usual rows. She wrote her name on the board, then erased it. She stood at the window and watched the buses arrive in the parking lot below, each one disgorging a fresh wave of students she would not teach.',
    underline: null, table: null,
    question: 'Which choice best describes the function of the final sentence in the text?',
    choices: {
      A: 'It reveals that Mrs. Chen regrets not having retired earlier in her career.',
      B: 'It emphasizes the contrast between Mrs. Chen\'s familiar routines and the reality of her departure.',
      C: 'It suggests that Mrs. Chen has a negative view of her students.',
      D: 'It introduces a conflict between Mrs. Chen and the school administration.'
    },
    answer: 'B', isSPR: false
  },
  {
    id: 'rw2e_q4', num: 4, type: 'structure', domain: 'craft_structure',
    signal: null, highSignal: false,
    passage: 'Coral reefs support roughly 25% of all marine species despite covering less than 1% of the ocean floor. Yet they are highly sensitive to changes in water temperature. Scientists have found that even a temperature increase of 1–2°C above normal summer maximums can trigger mass bleaching events, in which corals expel the algae that provide most of their nutrition and color.',
    table: null, underline: null,
    question: 'Which choice best describes the overall structure of the text?',
    choices: {
      A: 'It presents a scientific debate, then proposes a resolution.',
      B: 'It establishes the ecological importance of coral reefs, then explains a major threat they face.',
      C: 'It describes a research methodology, then evaluates its results.',
      D: 'It introduces a hypothesis, then provides evidence that contradicts it.'
    },
    answer: 'B', isSPR: false
  },
  {
    id: 'rw2e_q5', num: 5, type: 'structure', domain: 'craft_structure',
    signal: null, highSignal: false,
    passage: 'Historians have generally attributed the fall of the Roman Empire to a combination of military pressure and economic instability. A recent study, however, has proposed a new contributing factor: a series of volcanic eruptions in the sixth century CE that temporarily cooled global temperatures, disrupted agriculture, and may have triggered famine and social unrest.',
    table: null, underline: null,
    question: 'Which choice best describes the function of the second sentence?',
    choices: {
      A: 'It confirms the existing historical consensus about Rome\'s decline.',
      B: 'It introduces a new explanation that adds to our understanding of the empire\'s fall.',
      C: 'It argues that previous historians were entirely wrong about the causes of Rome\'s decline.',
      D: 'It describes the research methods used in the recent study.'
    },
    answer: 'B', isSPR: false
  },
  {
    id: 'rw2e_q6', num: 6, type: 'dual_text', domain: 'craft_structure',
    signal: null, highSignal: false,
    passage: null,
    dualText: {
      text1: 'Nutritionists advocating for plant-based diets argue that reducing meat consumption has significant health benefits, including lower rates of heart disease, type 2 diabetes, and certain cancers. Large-scale studies have found that people who eat primarily plant-based foods live longer on average than those who consume high quantities of red meat.',
      text2: 'Critics of plant-based diet recommendations point out that many large-scale nutrition studies rely on self-reported food intake data, which is notoriously inaccurate. People tend to underreport unhealthy eating habits and overreport vegetable consumption. As a result, the apparent health benefits may be partially explained by measurement error rather than diet itself.'
    },
    table: null, underline: null,
    question: 'Based on the texts, how would the author of Text 2 most likely respond to the evidence presented in Text 1?',
    choices: {
      A: 'By arguing that plant-based diets are nutritionally insufficient for most adults.',
      B: 'By questioning whether the data used in large-scale dietary studies accurately reflects what people actually eat.',
      C: 'By suggesting that heart disease and diabetes are not strongly influenced by dietary choices.',
      D: 'By pointing out that plant-based diets are too expensive for most people to maintain.'
    },
    answer: 'B', isSPR: false
  },
  {
    id: 'rw2e_q7', num: 7, type: 'dual_text', domain: 'craft_structure',
    signal: null, highSignal: false,
    passage: null,
    dualText: {
      text1: 'Education researchers studying the effects of homework have found that, at the elementary school level, there is little to no correlation between the amount of homework assigned and student performance on standardized tests. Some studies suggest that excessive homework at this age may actually reduce students\' intrinsic motivation to learn.',
      text2: 'A separate body of research focused on high school students shows a positive but diminishing relationship between homework and academic outcomes: moderate amounts of homework are associated with higher achievement, but very large amounts show no additional benefit. Researchers caution that homework quality and alignment with classroom instruction matter more than quantity.'
    },
    table: null, underline: null,
    question: 'Based on the texts, both groups of researchers would most likely agree that:',
    choices: {
      A: 'Homework should be eliminated entirely from the school curriculum.',
      B: 'The relationship between homework and academic achievement differs depending on students\' age or grade level.',
      C: 'High school students benefit from more homework than elementary students in every subject area.',
      D: 'Homework is most effective when assigned daily rather than weekly.'
    },
    answer: 'B', isSPR: false
  },
  {
    id: 'rw2e_q8', num: 8, type: 'dual_text', domain: 'craft_structure',
    signal: null, highSignal: false,
    passage: null,
    dualText: {
      text1: 'Proponents of early childhood arts education argue that learning to draw, sing, or play an instrument helps young children develop fine motor skills, emotional expression, and creative thinking. Studies of early arts programs have found improvements in children\'s language development and problem-solving abilities.',
      text2: 'Skeptics of arts education research note that many studies suffer from selection bias: families who enroll children in arts programs tend to be more educated and affluent, which independently predicts better educational outcomes. Without controlling for these variables, researchers may be attributing to arts education benefits that are actually caused by socioeconomic background.'
    },
    table: null, underline: null,
    question: 'Which of the following, if true, would most directly address the concern raised in Text 2?',
    choices: {
      A: 'A study found that children in arts programs showed greater creativity than those not enrolled.',
      B: 'Arts education programs in low-income schools produced outcomes similar to those reported in programs at higher-income schools.',
      C: 'A longitudinal study found that the benefits of early arts education persisted into adolescence.',
      D: 'Children who participated in arts education reported higher levels of enjoyment in school.'
    },
    answer: 'B', isSPR: false
  },
  {
    id: 'rw2e_q9', num: 9, type: 'data', domain: 'info_ideas',
    signal: null, highSignal: false,
    passage: 'A geography student is analyzing rainfall data across three cities.',
    table: `<table class="data-table">
      <thead><tr><th>Month</th><th>City X</th><th>City Y</th><th>City Z</th></tr></thead>
      <tbody>
        <tr><td>January</td><td>45 mm</td><td>12 mm</td><td>88 mm</td></tr>
        <tr><td>April</td><td>62 mm</td><td>8 mm</td><td>71 mm</td></tr>
        <tr><td>July</td><td>18 mm</td><td>95 mm</td><td>44 mm</td></tr>
        <tr><td>October</td><td>55 mm</td><td>22 mm</td><td>80 mm</td></tr>
      </tbody>
    </table>`,
    underline: null,
    question: 'A geography student concludes that City Y experiences its highest rainfall during summer months rather than winter. Which choice most effectively uses data from the table to support this conclusion?',
    choices: {
      A: 'City Y receives 95mm of rain in July but only 12mm in January.',
      B: 'City Y receives less rain than City X or City Z in every month shown.',
      C: 'City Z receives more rain than City Y in every season shown.',
      D: 'The three cities show very different rainfall patterns throughout the year.'
    },
    answer: 'A', isSPR: false
  },
  {
    id: 'rw2e_q10', num: 10, type: 'data', domain: 'info_ideas',
    signal: null, highSignal: false,
    passage: 'A school counselor is reviewing extracurricular participation data.',
    table: `<table class="data-table">
      <thead><tr><th>Hours per week</th><th>% of students</th></tr></thead>
      <tbody>
        <tr><td>0–2</td><td>18%</td></tr>
        <tr><td>3–5</td><td>34%</td></tr>
        <tr><td>6–8</td><td>29%</td></tr>
        <tr><td>9+</td><td>19%</td></tr>
      </tbody>
    </table>`,
    underline: null,
    question: 'A school counselor notes that the majority of surveyed students spend between 3 and 8 hours per week on extracurricular activities. Which choice most effectively uses data from the table to support this claim?',
    choices: {
      A: '18% of students spend 0–2 hours per week on extracurriculars.',
      B: 'Students spending 3–5 hours account for 34% of respondents, the largest single group.',
      C: 'Combined, students in the 3–5 and 6–8 hour categories account for 63% of surveyed students.',
      D: 'Nearly one in five students spends 9 or more hours per week on extracurricular activities.'
    },
    answer: 'C', isSPR: false
  },
  {
    id: 'rw2e_q11', num: 11, type: 'inference', domain: 'info_ideas',
    signal: null, highSignal: false,
    passage: 'Researchers studying the effects of light pollution on nocturnal insects found that artificial lights at night disrupted natural flight patterns and navigation. The study also found that light-exposed insects spent less time on essential behaviors such as feeding and mating. The researchers concluded that light pollution may therefore _______',
    table: null, underline: null,
    question: 'Which choice most logically completes the text?',
    choices: {
      A: 'increase the diversity of insect species found in urban areas.',
      B: 'have significant negative effects on insect populations and the ecosystems that depend on them.',
      C: 'cause nocturnal insects to become active during daytime hours.',
      D: 'improve conditions for predator species that feed on moths.'
    },
    answer: 'B', isSPR: false
  },
  {
    id: 'rw2e_q12', num: 12, type: 'inference', domain: 'info_ideas',
    signal: null, highSignal: false,
    passage: 'Studies of bilingual children have consistently shown that they outperform monolingual peers on tasks requiring the ability to focus attention and ignore distracting information. Researchers attribute this advantage to the constant mental effort required to manage two language systems simultaneously. These findings suggest that _______',
    table: null, underline: null,
    question: 'Which choice most logically completes the text?',
    choices: {
      A: 'bilingual children typically perform better than monolingual children on all academic subjects.',
      B: 'learning a second language may strengthen certain cognitive abilities beyond language itself.',
      C: 'monolingual children are unable to develop strong attention skills without language instruction.',
      D: 'the cognitive benefits of bilingualism are limited to children who learned both languages before age five.'
    },
    answer: 'B', isSPR: false
  },
  {
    id: 'rw2e_q13', num: 13, type: 'inference', domain: 'info_ideas',
    signal: null, highSignal: false,
    passage: 'Art historians studying Dutch Golden Age painters have noted that these artists depicted scenes of everyday domestic life with a level of detail previously reserved for religious or mythological subjects. This shift in subject matter is thought to reflect broader changes in Dutch society, including the rise of a prosperous merchant class that valued _______',
    table: null, underline: null,
    question: 'Which choice most logically completes the text?',
    choices: {
      A: 'religious devotion as expressed through the patronage of church art.',
      B: 'realistic representations of their own world rather than idealized biblical scenes.',
      C: 'abstract compositions that demonstrated artistic skill without reference to everyday objects.',
      D: 'mythological themes adapted to reflect contemporary Dutch cultural values.'
    },
    answer: 'B', isSPR: false
  },
  {
    id: 'rw2e_q14', num: 14, type: 'inference', domain: 'info_ideas',
    signal: null, highSignal: false,
    passage: 'A team of ecologists studying forest recovery after wildfire found that areas with greater pre-fire plant diversity recovered more quickly. They hypothesize that diverse plant communities are more resilient because _______',
    table: null, underline: null,
    question: 'Which choice most logically completes the text?',
    choices: {
      A: 'wildfires are more likely to occur in areas with limited vegetation.',
      B: 'different species occupy different ecological roles, so the loss of any one species is less likely to destabilize the overall system.',
      C: 'diverse forests contain more combustible material, which helps fires burn more intensely and clear the ground for new growth.',
      D: 'plant diversity is a reliable indicator of soil quality, which independently determines recovery speed.'
    },
    answer: 'B', isSPR: false
  },
  {
    id: 'rw2e_q15', num: 15, type: 'inference', domain: 'info_ideas',
    signal: null, highSignal: false,
    passage: 'A sociologist found that children born into the lowest income quartile in countries with strong public education systems were significantly more likely to move into higher income brackets as adults. The sociologist argued that this pattern suggests _______',
    table: null, underline: null,
    question: 'Which choice most logically completes the text?',
    choices: {
      A: 'private schools are less effective than public schools at improving outcomes for low-income students.',
      B: 'income inequality is primarily a result of differences in individual effort rather than structural factors.',
      C: 'access to quality education may be a significant driver of upward social mobility.',
      D: 'social mobility rates are highest in countries that invest heavily in higher education specifically.'
    },
    answer: 'C', isSPR: false
  },
  {
    id: 'rw2e_q16', num: 16, type: 'sec', domain: 'sec',
    signal: null, highSignal: false,
    passage: 'The James Webb Space Telescope, launched in December 2021, has produced images of galaxies that formed just a few hundred million years after the Big Bang _______ giving scientists their clearest view yet of the early universe.',
    table: null, underline: null,
    question: 'Which choice completes the text so that it conforms to the conventions of Standard English?',
    choices: { A: ',', B: ';', C: ':', D: '—' },
    answer: 'A', isSPR: false
  },
  {
    id: 'rw2e_q17', num: 17, type: 'sec', domain: 'sec',
    signal: null, highSignal: false,
    passage: 'Each of the five volunteers who participated in the study _______ asked to complete a survey about their daily habits before undergoing a series of cognitive tests.',
    table: null, underline: null,
    question: 'Which choice completes the text so that it conforms to the conventions of Standard English?',
    choices: { A: 'were', B: 'are', C: 'was', D: 'have been' },
    answer: 'C', isSPR: false
  },
  {
    id: 'rw2e_q18', num: 18, type: 'eoi_transition', domain: 'eoi',
    signal: null, highSignal: false,
    passage: 'Despite decades of conservation efforts, many coastal wetland ecosystems continue to decline. _______ scientists have documented accelerating rates of habitat loss in regions previously considered well-protected.',
    table: null, underline: null,
    question: 'Which choice completes the text with the most logical transition?',
    choices: { A: 'However,', B: 'In contrast,', C: 'In fact,', D: 'As a result,' },
    answer: 'C', isSPR: false
  },
  {
    id: 'rw2e_q19', num: 19, type: 'eoi_transition', domain: 'eoi',
    signal: null, highSignal: false,
    passage: 'Mars rovers have been collecting geological and atmospheric data for more than two decades. _______ scientists now have detailed records of surface conditions across multiple Martian seasons.',
    table: null, underline: null,
    question: 'Which choice completes the text with the most logical transition?',
    choices: { A: 'Nevertheless,', B: 'In contrast,', C: 'As a result,', D: 'On the other hand,' },
    answer: 'C', isSPR: false
  },
  {
    id: 'rw2e_q20', num: 20, type: 'eoi_synthesis', domain: 'eoi',
    signal: null, highSignal: false,
    passage: null,
    notes: [
      'The Sahara Desert is the largest hot desert in the world.',
      'It covers approximately 9.2 million square kilometers.',
      'It spans 11 countries in North Africa.',
      'Temperatures can exceed 50°C in summer but drop below freezing at night.'
    ],
    noteTask: 'The student wants to emphasize the Sahara\'s extreme temperature variations.',
    table: null, underline: null,
    question: 'Which choice most effectively uses relevant information from the notes?',
    choices: {
      A: 'The Sahara Desert spans 11 countries across North Africa, making it the world\'s largest hot desert at 9.2 million square kilometers.',
      B: 'Despite its reputation for intense heat — with summer temperatures exceeding 50°C — the Sahara can drop below freezing at night.',
      C: 'The Sahara Desert, covering 9.2 million square kilometers, is found in North Africa and is known for its hot climate.',
      D: 'Eleven countries share the Sahara Desert, which is notable for its extreme size and high daytime temperatures.'
    },
    answer: 'B', isSPR: false
  },
];

// ─── RW MODULE 2 — HARD ───────────────────────────────────────────────────────
// 20 questions | 25 minutes | Routed students ≥14 on Module 1
// Answer Key: 1-B | 2-C | 3-A | 4-A | 5-D | 6-B | 7-D | 8-A | 9-A | 10-B |
//             11-D | 12-A | 13-C | 14-B | 15-A | 16-C | 17-C | 18-D | 19-C | 20-B

const RW2_HARD_QUESTIONS = [
  {
    id: 'rw2h_q1', num: 1, type: 'vocabulary', domain: 'craft_structure',
    signal: null, highSignal: false,
    passage: 'The philosopher of science Karl Popper argued that a theory is scientific only if it is falsifiable — that is, if it makes predictions that could, in principle, be shown to be wrong by empirical evidence. By this criterion, Popper considered Freudian psychoanalysis to be _______ rather than scientific, since its practitioners could interpret any human behavior as confirmation of the theory.',
    table: null, underline: null,
    question: 'Which choice completes the text with the most logical and precise word or phrase?',
    choices: { A: 'groundbreaking', B: 'pseudoscientific', C: 'empirical', D: 'provisional' },
    answer: 'B', isSPR: false
  },
  {
    id: 'rw2h_q2', num: 2, type: 'vocabulary', domain: 'craft_structure',
    signal: null, highSignal: false,
    passage: 'The diplomatic language of the treaty was deliberately _______, using terms that each signatory nation could interpret in ways consistent with its own domestic political interests, thereby making ratification possible while deferring the hard questions of implementation to future negotiations.',
    table: null, underline: null,
    question: 'Which choice completes the text with the most logical and precise word or phrase?',
    choices: { A: 'precise', B: 'binding', C: 'ambiguous', D: 'inflammatory' },
    answer: 'C', isSPR: false
  },
  {
    id: 'rw2h_q3', num: 3, type: 'structure', domain: 'craft_structure',
    signal: 'N', highSignal: true,
    passage: 'The great failure of most science communication is not that it oversimplifies — simplification is necessary and often elegant — but that it substitutes false certainty for genuine complexity.',
    underline: 'A study suggesting a possible link between diet and cognitive decline becomes a headline declaring that a single food causes dementia.',
    extraPassage: 'This flattening of nuance is not merely intellectually dishonest; it erodes public trust in science by setting expectations that the next study will inevitably contradict.',
    table: null,
    question: 'Which choice best describes the function of the second sentence in the text?',
    choices: {
      A: 'It provides a specific example that illustrates the problem introduced in the first sentence.',
      B: 'It introduces a counterargument to the claim made in the first sentence.',
      C: 'It explains why oversimplification is sometimes an acceptable approach.',
      D: 'It describes the consequences of poor science communication for researchers.'
    },
    answer: 'A', isSPR: false
  },
  {
    id: 'rw2h_q4', num: 4, type: 'structure', domain: 'craft_structure',
    signal: 'N', highSignal: true,
    passage: 'The standard explanation for why multicellular organisms age is based on evolutionary trade-offs: resources invested in the repair of aging cells are resources not available for reproduction. Once an organism has reproduced, natural selection has little reason to preserve it. Recent research on certain species of jellyfish, however, has documented what appears to be biological immortality — the capacity to revert to a juvenile state after reaching maturity — suggesting that aging may not be an inevitable feature of multicellular life.',
    table: null, underline: null,
    question: 'Which choice best describes the overall structure of the text?',
    choices: {
      A: 'It presents an established scientific explanation, then describes evidence that may require that explanation to be reconsidered.',
      B: 'It describes a scientific discovery and then explains why most biologists remain skeptical.',
      C: 'It outlines a research methodology and then evaluates the quality of the evidence.',
      D: 'It introduces a scientific controversy and presents arguments for one side.'
    },
    answer: 'A', isSPR: false
  },
  {
    id: 'rw2h_q5', num: 5, type: 'structure', domain: 'craft_structure',
    signal: 'N', highSignal: false,
    passage: 'Economists studying the labor market effects of automation have debated whether technological displacement leads to long-term unemployment or whether new industries eventually create enough jobs to absorb displaced workers. Historical evidence from previous industrial revolutions suggests the latter, as each wave of automation eventually generated more jobs than it destroyed. However, some economists argue that the current wave of automation, driven by artificial intelligence, is fundamentally different because it can displace cognitive labor as well as physical labor, affecting a far broader range of occupations.',
    table: null, underline: null,
    question: 'Which choice best describes the function of the final sentence?',
    choices: {
      A: 'It confirms that automation has historically produced more jobs than it has eliminated.',
      B: 'It introduces evidence that definitively resolves the debate described in the text.',
      C: 'It argues that economists who study automation have failed to account for cognitive labor.',
      D: 'It presents a qualification to the historical pattern described in the preceding sentence.'
    },
    answer: 'D', isSPR: false
  },
  {
    id: 'rw2h_q6', num: 6, type: 'dual_text', domain: 'craft_structure',
    signal: 'O', highSignal: true,
    passage: null,
    dualText: {
      text1: 'Art critic Elena Santos argues that the trend toward "context-free" digital art — works circulated as images without accompanying information about the artist, medium, or conditions of creation — represents a liberation from the gatekeeping structures of traditional institutions. When viewers encounter a work without knowing who made it, Santos suggests, their responses are more purely aesthetic and less contaminated by bias toward established names.',
      text2: 'Media scholar David Okafor contends that the apparent democratization of digital art conceals persistent inequalities. Algorithms that determine which content reaches large audiences tend to reward familiarity and emotional immediacy over formal complexity, systematically disadvantaging artists whose work requires sustained attention or contextual knowledge to appreciate. The result, Okafor argues, is not fewer gatekeepers but different ones.'
    },
    table: null, underline: null,
    question: 'Based on the texts, Santos and Okafor would most likely disagree about which of the following?',
    choices: {
      A: 'Whether traditional art institutions have historically exercised influence over which works receive public attention.',
      B: 'Whether digital distribution of art has resulted in a more level playing field for artists from diverse backgrounds.',
      C: 'Whether the quality of art can be assessed without knowledge of the artist\'s identity.',
      D: 'Whether algorithms play a role in determining the popularity of digital art.'
    },
    answer: 'B', isSPR: false
  },
  {
    id: 'rw2h_q7', num: 7, type: 'dual_text', domain: 'craft_structure',
    signal: 'O', highSignal: true,
    passage: null,
    dualText: {
      text1: 'Proponents of mixed-use urban development argue that allowing residential, commercial, and industrial uses in close proximity reduces commute times, supports local economies, and increases community cohesion. Residents of mixed-use neighborhoods tend to walk more, drive less, and report higher neighborhood satisfaction.',
      text2: 'Urban planners critical of zoning deregulation note that the benefits of mixed-use development are not evenly distributed. In practice, loosening zoning restrictions often accelerates gentrification, as developers target desirable neighborhoods for high-end development. Long-term residents, particularly renters, are frequently displaced by rising rents before the promised community benefits materialize.'
    },
    table: null, underline: null,
    question: 'Based on the texts, how would the critics in Text 2 most likely respond to the evidence cited by the proponents in Text 1?',
    choices: {
      A: 'By arguing that the data on commute times and driving habits is methodologically flawed.',
      B: 'By proposing that zoning deregulation be paired with stricter controls on commercial development.',
      C: 'By suggesting that mixed-use development should be pursued only in low-income neighborhoods.',
      D: 'By acknowledging the community benefits described but questioning whether they are shared equitably among existing residents.'
    },
    answer: 'D', isSPR: false
  },
  {
    id: 'rw2h_q8', num: 8, type: 'dual_text', domain: 'craft_structure',
    signal: 'O', highSignal: true,
    passage: null,
    dualText: {
      text1: 'Neuroscientists have used functional MRI imaging to document changes in the activity and structure of brain regions associated with attention and emotional regulation in long-term meditators. These findings have been widely cited as evidence that meditation produces lasting improvements in cognitive and emotional function.',
      text2: 'Psychologist Sara Westcott and colleagues conducted a systematic review of the neuroscience literature on meditation and found significant methodological concerns: most studies used small samples, lacked active control groups, and relied on self-selected participants who were already highly motivated. Westcott argues that the field has been prone to "expectation effects," in which participants\' and researchers\' expectations of benefit may have shaped reported outcomes.'
    },
    table: null, underline: null,
    question: 'Based on the texts, Westcott would most likely characterize the findings described in Text 1 as:',
    choices: {
      A: 'Potentially overstated, because methodological limitations in the research may have inflated the apparent effects of meditation.',
      B: 'Genuinely significant, because functional MRI provides an objective measure of brain activity unaffected by expectation.',
      C: 'Entirely fabricated, because the neurological changes described cannot be measured with current imaging technology.',
      D: 'Irrelevant, because brain structure changes do not reliably predict improvements in cognitive or emotional function.'
    },
    answer: 'A', isSPR: false
  },
  {
    id: 'rw2h_q9', num: 9, type: 'data', domain: 'info_ideas',
    signal: 'N', highSignal: false,
    passage: 'A researcher is analyzing job satisfaction data across industries.',
    table: `<table class="data-table">
      <thead><tr><th>Industry</th><th>In-Person</th><th>Hybrid</th><th>Remote</th></tr></thead>
      <tbody>
        <tr><td>Healthcare</td><td>58%</td><td>62%</td><td>49%</td></tr>
        <tr><td>Technology</td><td>61%</td><td>74%</td><td>71%</td></tr>
        <tr><td>Education</td><td>64%</td><td>68%</td><td>52%</td></tr>
        <tr><td>Finance</td><td>55%</td><td>67%</td><td>59%</td></tr>
      </tbody>
    </table>`,
    underline: null,
    question: 'A researcher concludes that hybrid work arrangements are associated with higher reported satisfaction than fully remote work in every industry surveyed. Which choice most effectively uses data from the table to support this conclusion?',
    choices: {
      A: 'In each of the four industries, the percentage of hybrid workers reporting high satisfaction exceeds the percentage of remote workers reporting high satisfaction.',
      B: 'In technology, hybrid workers report higher satisfaction (74%) than in-person workers (61%), while remote workers report 71%.',
      C: 'Healthcare workers report lower satisfaction when working remotely (49%) than workers in any other industry in any arrangement.',
      D: 'Finance workers report higher satisfaction in hybrid arrangements (67%) than in-person workers in healthcare (58%).'
    },
    answer: 'A', isSPR: false
  },
  {
    id: 'rw2h_q10', num: 10, type: 'data', domain: 'info_ideas',
    signal: 'N', highSignal: true,
    passage: 'A policy analyst is examining salary data by education level.',
    table: `<table class="data-table">
      <thead><tr><th>Education Level</th><th>Engineering</th><th>Business</th><th>Education</th><th>Healthcare</th></tr></thead>
      <tbody>
        <tr><td>High school diploma</td><td>$42,000</td><td>$36,000</td><td>$31,000</td><td>$35,000</td></tr>
        <tr><td>Bachelor's degree</td><td>$78,000</td><td>$61,000</td><td>$48,000</td><td>$62,000</td></tr>
        <tr><td>Master's degree</td><td>$95,000</td><td>$82,000</td><td>$58,000</td><td>$88,000</td></tr>
        <tr><td>Doctoral degree</td><td>$118,000</td><td>$103,000</td><td>$74,000</td><td>$135,000</td></tr>
      </tbody>
    </table>`,
    underline: null,
    question: 'A policy analyst notes that the salary premium between a bachelor\'s degree and a doctoral degree is largest in healthcare. Which choice most effectively uses data from the table to support this claim?',
    choices: {
      A: 'Healthcare workers with doctoral degrees earn $135,000, more than doctoral-level workers in education ($74,000) or business ($103,000).',
      B: 'The difference between bachelor\'s and doctoral salaries in healthcare ($73,000) exceeds the comparable difference in engineering ($40,000), business ($42,000), and education ($26,000).',
      C: 'Healthcare workers at every education level earn more than education workers at the same level.',
      D: 'The salary gap between high school and doctoral education is greatest in engineering, where earnings increase by $76,000.'
    },
    answer: 'B', isSPR: false
  },
  {
    id: 'rw2h_q11', num: 11, type: 'inference', domain: 'info_ideas',
    signal: 'O', highSignal: true,
    passage: 'Linguists studying the development of creole languages — new languages that emerge when speakers of mutually unintelligible languages are brought into sustained contact — have noted that creoles from different parts of the world often share structural features that do not appear in any of the parent languages. This cross-linguistic similarity, some linguists argue, provides evidence for _______',
    table: null, underline: null,
    question: 'Which choice most logically completes the text?',
    choices: {
      A: 'the idea that creole languages are less grammatically complex than the languages from which they developed.',
      B: 'the view that language acquisition is primarily a cultural rather than a biological phenomenon.',
      C: 'the claim that creole languages develop more rapidly when speakers share similar cultural backgrounds.',
      D: 'the hypothesis that human languages share certain structural tendencies rooted in the architecture of human cognition.'
    },
    answer: 'D', isSPR: false
  },
  {
    id: 'rw2h_q12', num: 12, type: 'inference', domain: 'info_ideas',
    signal: 'O', highSignal: true,
    passage: 'A behavioral economist found that when participants were presented with two options with identical expected values — one certain and one probabilistic — they consistently preferred the certain option. Surprisingly, when the framing was changed from "potential gain" to "potential loss," participants consistently preferred the probabilistic option. This pattern suggests that _______',
    table: null, underline: null,
    question: 'Which choice most logically completes the text?',
    choices: {
      A: 'the way a choice is presented can reverse preferences in ways that cannot be explained by expected value alone.',
      B: 'people are generally risk-averse and prefer certainty regardless of framing.',
      C: 'probabilistic reasoning is fundamentally incompatible with rational decision-making.',
      D: 'risk tolerance is determined primarily by the absolute size of potential gains and losses.'
    },
    answer: 'A', isSPR: false
  },
  {
    id: 'rw2h_q13', num: 13, type: 'inference', domain: 'info_ideas',
    signal: 'O', highSignal: true,
    passage: 'Scholars of oral literature have observed that stories transmitted through oral tradition are rarely fixed in a single authoritative version. Each retelling adapts the narrative to the context of its telling — the audience, the occasion, the performance conventions of the community. This variability, far from being a sign of carelessness or imprecision, may instead reflect _______',
    table: null, underline: null,
    question: 'Which choice most logically completes the text?',
    choices: {
      A: 'that oral cultures value entertainment more highly than accuracy in storytelling.',
      B: 'the limitations of human memory in preserving long narrative sequences without written support.',
      C: 'a fundamentally different conception of a story as a dynamic, communal act rather than a static, authored text.',
      D: 'an absence of the literary conventions necessary to produce consistent, stable narratives.'
    },
    answer: 'C', isSPR: false
  },
  {
    id: 'rw2h_q14', num: 14, type: 'inference', domain: 'info_ideas',
    signal: 'N', highSignal: true,
    passage: 'Psychologists studying self-perception and performance found that individuals who attributed their past successes to luck or external circumstances — rather than their own ability — showed greater anxiety about future tasks and lower persistence after initial setbacks. This pattern appeared even in individuals with objectively strong track records. Their findings suggest that _______',
    table: null, underline: null,
    question: 'Which choice most logically completes the text?',
    choices: {
      A: 'anxiety about performance is most common among individuals who have experienced frequent failure.',
      B: 'how people explain their own past successes may shape their expectations and behavior in future challenges as much as their actual abilities do.',
      C: 'individuals with strong track records are better equipped to handle failure than those with weaker records.',
      D: 'self-confidence is the primary determinant of academic and professional success.'
    },
    answer: 'B', isSPR: false
  },
  {
    id: 'rw2h_q15', num: 15, type: 'inference', domain: 'info_ideas',
    signal: 'O', highSignal: false,
    passage: 'Historical research on famine relief efforts in the nineteenth century found that aid programs administered by affected communities were often more effective than those administered by distant central authorities. Local administrators had more accurate knowledge of need distribution, stronger accountability pressures, and could adapt more quickly to changing conditions. The researcher concludes this has implications for contemporary development aid, suggesting that _______',
    table: null, underline: null,
    question: 'Which choice most logically completes the text?',
    choices: {
      A: 'effective aid delivery may depend on the degree to which those administering it are embedded in and accountable to the communities they serve.',
      B: 'international aid organizations should eliminate central oversight entirely in favor of local control.',
      C: 'nineteenth-century famine relief methods were superior to modern approaches in most respects.',
      D: 'community-administered programs are effective only when communities have prior experience with famine relief.'
    },
    answer: 'A', isSPR: false
  },
  {
    id: 'rw2h_q16', num: 16, type: 'sec', domain: 'sec',
    signal: null, highSignal: false,
    passage: 'The discovery that certain species of octopus engage in what appears to be play behavior — manipulating objects in their environment for no apparent functional purpose — has led some researchers to reconsider the boundaries of animal cognition _______ others remain skeptical that the behavior constitutes true play rather than exploratory foraging.',
    table: null, underline: null,
    question: 'Which choice completes the text so that it conforms to the conventions of Standard English?',
    choices: { A: 'and', B: '; however,', C: ', while', D: 'although' },
    answer: 'C', isSPR: false
  },
  {
    id: 'rw2h_q17', num: 17, type: 'sec', domain: 'sec',
    signal: null, highSignal: false,
    passage: 'The committee\'s decision to fund three of the seven proposed research projects, all of which focused on computational approaches to protein folding, _______ criticized by some members as too narrow a commitment to a single methodological approach.',
    table: null, underline: null,
    question: 'Which choice completes the text so that it conforms to the conventions of Standard English?',
    choices: { A: 'were', B: 'is', C: 'was', D: 'have been' },
    answer: 'C', isSPR: false
  },
  {
    id: 'rw2h_q18', num: 18, type: 'eoi_transition', domain: 'eoi',
    signal: null, highSignal: false,
    passage: 'Proponents of nuclear energy argue that it produces large amounts of electricity with minimal carbon emissions. _______ the risks of catastrophic failure, as demonstrated by events at Chernobyl and Fukushima, have made it deeply unpopular in many countries.',
    table: null, underline: null,
    question: 'Which choice completes the text with the most logical transition?',
    choices: { A: 'Similarly,', B: 'Consequently,', C: 'For example,', D: 'Nevertheless,' },
    answer: 'D', isSPR: false
  },
  {
    id: 'rw2h_q19', num: 19, type: 'eoi_transition', domain: 'eoi',
    signal: null, highSignal: false,
    passage: 'The discovery of the Higgs boson in 2012 confirmed a key prediction of the Standard Model of particle physics and earned the physicists who first proposed its existence a Nobel Prize. _______ physicists acknowledge that the Standard Model remains incomplete, as it cannot account for dark matter, dark energy, or gravity.',
    table: null, underline: null,
    question: 'Which choice completes the text with the most logical transition?',
    choices: { A: 'Therefore,', B: 'Likewise,', C: 'Yet', D: 'As a result,' },
    answer: 'C', isSPR: false
  },
  {
    id: 'rw2h_q20', num: 20, type: 'eoi_synthesis', domain: 'eoi',
    signal: null, highSignal: false,
    passage: null,
    notes: [
      'The Indus Valley Civilization flourished from approximately 3300 to 1300 BCE.',
      'Its cities, including Harappa and Mohenjo-daro, had sophisticated urban planning.',
      'Excavations have revealed grid-patterned streets, advanced drainage systems, and standardized building materials.',
      'No evidence of large palaces or temples has been found, suggesting a more egalitarian social structure than contemporary civilizations.'
    ],
    noteTask: 'The student wants to highlight what makes the Indus Valley Civilization unusual compared to other ancient civilizations.',
    table: null, underline: null,
    question: 'Which choice most effectively uses relevant information from the notes?',
    choices: {
      A: 'The Indus Valley Civilization, which lasted from approximately 3300 to 1300 BCE, included well-known cities such as Harappa and Mohenjo-daro.',
      B: 'Unlike many ancient civilizations, the Indus Valley Civilization shows no evidence of monumental religious or royal architecture, suggesting its society may have been organized differently.',
      C: 'Excavations of Indus Valley cities have revealed advanced drainage systems and standardized building materials, indicating a high degree of urban planning.',
      D: 'The cities of the Indus Valley were notable for their grid-patterned streets, which suggest careful design by central authorities.'
    },
    answer: 'B', isSPR: false
  },
];

// ─── MATH MODULE — Medium-Hard ────────────────────────────────────────────────
// 18 questions | 22 minutes | Fixed for all students
// Answer Key: 1-C | 2-B | 3-C | 4-B | 5-B | 6-B | 7-A | 8-[95] | 9-B |
//             10-[6] | 11-[7] | 12-B | 13-[5.4] | 14-C | 15-C | 16-A | 17-A | 18-[26π]
// SPR questions: Q8, Q10, Q11, Q13, Q18

const MATH_QUESTIONS = [
  {
    id: 'math_q1', num: 1, type: 'algebra', domain: 'algebra',
    signal: null, highSignal: false, katex: false,
    text: 'A train leaves Station A traveling toward Station B at 80 km/h. At the same time, a second train leaves Station B traveling toward Station A at 60 km/h. If the stations are 420 km apart, how many kilometers from Station A will the two trains meet?',
    choices: { A: '180', B: '210', C: '240', D: '270' },
    answer: 'C', isSPR: false, sprAnswer: null
  },
  {
    id: 'math_q2', num: 2, type: 'algebra', domain: 'algebra',
    signal: 'C', highSignal: false, katex: false,
    text: 'A research lab records that a chemical reaction consumes 0.45 grams of a compound per minute. If a container begins with 54 grams of the compound, how many hours will it take for the compound to be completely consumed?',
    choices: { A: '0.8', B: '2', C: '120', D: '243' },
    answer: 'B', isSPR: false, sprAnswer: null,
    note: 'Unit conversion trap — students who skip the minutes→hours step pick C.'
  },
  {
    id: 'math_q3', num: 3, type: 'psda', domain: 'psda',
    signal: 'C', highSignal: false, katex: false,
    text: 'A store offers two discount schemes on a $200 jacket. Scheme X applies a 15% discount followed by a further 10% discount. Scheme Y applies a single 25% discount. A customer claims both schemes result in the same final price. Which of the following is true?',
    choices: {
      A: 'The customer is correct; both schemes result in the same final price.',
      B: 'The customer is incorrect; Scheme X results in a lower final price.',
      C: 'The customer is incorrect; Scheme Y results in a lower final price.',
      D: 'The relationship between the two prices cannot be determined without knowing the original price.'
    },
    answer: 'C', isSPR: false, sprAnswer: null
  },
  {
    id: 'math_q4', num: 4, type: 'algebra', domain: 'algebra',
    signal: null, highSignal: false, katex: false,
    text: 'At a school fundraiser, small candles sold for $4 each and large candles sold for $9 each. The school sold a total of 85 candles and collected $510 in revenue. How many small candles were sold?',
    choices: { A: '34', B: '51', C: '55', D: '61' },
    answer: 'B', isSPR: false, sprAnswer: null
  },
  {
    id: 'math_q5', num: 5, type: 'psda', domain: 'psda',
    signal: 'C', highSignal: false, katex: false,
    text: 'The price of a laptop was reduced by 20% during a sale. After the sale, the price was increased by 25%. The final price is what percent of the original price?',
    choices: { A: '95%', B: '100%', C: '105%', D: '110%' },
    answer: 'B', isSPR: false, sprAnswer: null,
    note: 'Classic trap — students who rush pick A.'
  },
  {
    id: 'math_q6', num: 6, type: 'advanced_math', domain: 'advanced_math',
    signal: null, highSignal: false, katex: true,
    text: 'A ball is launched upward from the ground. Its height $h$, in meters, after $t$ seconds is given by $h = -5t^2 + 20t$. For how many seconds is the ball at a height greater than 15 meters?',
    choices: { A: '1', B: '2', C: '3', D: '4' },
    answer: 'B', isSPR: false, sprAnswer: null
  },
  {
    id: 'math_q7', num: 7, type: 'advanced_math', domain: 'advanced_math',
    signal: null, highSignal: false, katex: true,
    text: 'Which of the following is equivalent to $(3x + 2)(x - 3) - (2x^2 - x + 1)$?',
    choices: { A: '$x^2 - 6x - 7$', B: '$x^2 + 6x + 7$', C: '$x^2 - 6x + 7$', D: '$x^2 + 6x - 7$' },
    answer: 'A', isSPR: false, sprAnswer: null
  },
  {
    id: 'math_q8', num: 8, type: 'psda', domain: 'psda',
    signal: null, highSignal: false, katex: false,
    text: 'A student scored 72, 85, 90, and 78 on four tests. What score does the student need on a fifth test to achieve a mean score of 84?',
    choices: null,
    answer: null, isSPR: true, sprAnswer: '95',
    sprAnswerNum: 95
  },
  {
    id: 'math_q9', num: 9, type: 'psda', domain: 'psda',
    signal: null, highSignal: false, katex: true,
    text: 'A bag contains 4 red marbles, 6 blue marbles, and 5 green marbles. If one marble is selected at random, what is the probability that it is not blue?',
    choices: { A: '$\\frac{2}{5}$', B: '$\\frac{3}{5}$', C: '$\\frac{2}{3}$', D: '$\\frac{3}{4}$' },
    answer: 'B', isSPR: false, sprAnswer: null
  },
  {
    id: 'math_q10', num: 10, type: 'algebra', domain: 'algebra',
    signal: 'N', highSignal: false, katex: false,
    text: 'A store sells standard notebooks for $3 each and premium notebooks for $5 each. A student wants to spend at most $30 and must buy at least 2 premium notebooks. What is the maximum number of standard notebooks the student can purchase?',
    choices: null,
    answer: null, isSPR: true, sprAnswer: '6',
    sprAnswerNum: 6
  },
  {
    id: 'math_q11', num: 11, type: 'advanced_math', domain: 'advanced_math',
    signal: null, highSignal: false, katex: true,
    text: 'If $x^2 - 6x + 9 = 16$, what is the positive value of $x$?',
    choices: null,
    answer: null, isSPR: true, sprAnswer: '7',
    sprAnswerNum: 7
  },
  {
    id: 'math_q12', num: 12, type: 'advanced_math', domain: 'advanced_math',
    signal: null, highSignal: false, katex: true,
    text: 'A population of bacteria doubles every 3 hours. If there are initially 500 bacteria, which of the following expressions gives the number of bacteria after $t$ hours?',
    choices: {
      A: '$500 \\cdot 2^t$',
      B: '$500 \\cdot 2^{t/3}$',
      C: '$500 \\cdot (\\frac{1}{2})^{3t}$',
      D: '$500 \\cdot 3^{t/2}$'
    },
    answer: 'B', isSPR: false, sprAnswer: null
  },
  {
    id: 'math_q13', num: 13, type: 'algebra', domain: 'algebra',
    signal: 'C', highSignal: false, katex: false,
    text: 'In the equation 4x + 3y = 36, if y = 2x − 6, what is the value of x?',
    choices: null,
    answer: null, isSPR: true, sprAnswer: '5.4',
    sprAnswerNum: 5.4,
    note: 'C-signal — pacing vs. surrounding harder questions'
  },
  {
    id: 'math_q14', num: 14, type: 'psda', domain: 'psda',
    signal: 'O', highSignal: false, katex: false,
    text: 'A teacher records test results for two classes. Both classes have a mean score of 74. Class A has a standard deviation of 3. Class B has a standard deviation of 11. Which of the following statements is best supported by this data?',
    choices: {
      A: 'Class A performed better on the test overall than Class B.',
      B: 'Class B has more students enrolled than Class A.',
      C: 'The scores in Class A are more tightly clustered around the mean than the scores in Class B.',
      D: 'The median score in Class A is higher than the median score in Class B.'
    },
    answer: 'C', isSPR: false, sprAnswer: null
  },
  {
    id: 'math_q15', num: 15, type: 'psda', domain: 'psda',
    signal: 'N', highSignal: false, katex: false,
    text: 'A researcher studying sleep and reaction time found that increasing sleep from 5 to 7 hours was associated with a decrease in reaction time of approximately 40 milliseconds. Which conclusion is best supported by this data?',
    choices: {
      A: 'Getting 7 or more hours of sleep guarantees optimal reaction time.',
      B: 'There is a positive association between hours of sleep and reaction time.',
      C: 'Within the studied range, more sleep was associated with faster reaction times.',
      D: 'Reaction time decreases by exactly 20 milliseconds for each additional hour of sleep above 5.'
    },
    answer: 'C', isSPR: false, sprAnswer: null,
    note: 'N-signal — watch for dwell spike here if Q14 was high-dwell for this student'
  },
  {
    id: 'math_q16', num: 16, type: 'geometry', domain: 'geometry',
    signal: 'C', highSignal: false, katex: true,
    text: 'A cylindrical water tank has a radius of 3 meters and a height of 8 meters. If the tank is currently 75% full, what is the volume of water in the tank, in cubic meters? (Use $\\pi \\approx 3.14$)',
    choices: { A: '169.56', B: '197.82', C: '211.32', D: '226.08' },
    answer: 'A', isSPR: false, sprAnswer: null,
    note: 'C-signal begins — entering final third; pacing shift relative to Q1–Q5 baseline'
  },
  {
    id: 'math_q17', num: 17, type: 'geometry', domain: 'geometry',
    signal: null, highSignal: false, katex: true,
    text: 'A circle in the xy-plane has the equation $(x + 1)^2 + (y - 4)^2 = 36$. Which of the following points lies on the circle?',
    choices: { A: '$(-1, 10)$', B: '$(5, 7)$', C: '$(2, 4)$', D: '$(-1, -3)$' },
    answer: 'A', isSPR: false, sprAnswer: null,
    note: 'D is a great sign-error trap'
  },
  {
    id: 'math_q18', num: 18, type: 'geometry', domain: 'geometry',
    signal: 'C', highSignal: false, katex: true,
    text: 'A circle has its center at the origin and passes through the point $(5, 12)$. What is the circumference of the circle, in units? Express your answer in terms of $\\pi$.',
    choices: null,
    answer: null, isSPR: true, sprAnswer: '26π',
    sprAnswerNum: null, // accepts '26π' or '26pi'
    note: 'C-signal final — time remaining at submission is the C-signal. Early submit = low C.'
  },
];

// ─── MATH DOMAIN MAP (for Section 2 of report) ───────────────────────────────
const MATH_DOMAIN_MAP = {
  algebra: ['math_q1', 'math_q2', 'math_q4', 'math_q10', 'math_q13'],
  advanced_math: ['math_q6', 'math_q7', 'math_q11', 'math_q12'],
  psda: ['math_q3', 'math_q5', 'math_q8', 'math_q9', 'math_q14', 'math_q15'],
  geometry: ['math_q16', 'math_q17', 'math_q18'],
};

// ─── RW DOMAIN MAP ────────────────────────────────────────────────────────────
const RW_DOMAIN_MAP = {
  craft_structure: [1, 2, 3, 4, 5, 6, 7, 8],     // Q1–Q8
  info_ideas:      [9, 10, 11, 12, 13, 14, 15],   // Q9–Q15
  sec:             [16, 17],                        // Q16–Q17
  eoi:             [18, 19, 20],                    // Q18–Q20
};

// ─── PROFILE MAPPING ──────────────────────────────────────────────────────────
// Eight profiles based on O × C × N (high/low). E and A are secondary modifiers.
// Key: uppercase = High, lowercase = low

const PROFILES = {
  OCn: {
    code: 'OCn',
    label: 'Clear Path',
    traits: { O: 'high', C: 'high', N: 'low' },
    tagline: 'Strong foundation. The ceiling question is execution, not potential.',
    sessionStructure: 'Content-led. Let them drive intellectual direction within a structured agenda. Long sessions work — they sustain focus. One session per week is often enough if homework compliance is high.',
    feedbackStyle: 'Peer register. Explain the why behind every correction. They will push back if they disagree — engage with that, don\'t shut it down. Approval-seeking is low so positive reinforcement matters less than intellectual honesty.',
    practiceFormat: 'Timed mixed sets. The issue is drilling the right things, not motivation. Prioritize SEC and grid-in math — the areas where depth-orientation becomes a liability. Explicitly discourage re-reading passages they already understand.',
    pressureManagement: 'Low intervention needed. Simulate harder conditions than the real test. They tend to underestimate how much timed pressure affects mechanical accuracy. One full-length mock under strict conditions early in the engagement is useful as calibration.',
    sectionThree: {
      patterns: [
        'Inference and dual-text question performance will likely exceed overall score — verbal reasoning tends to be a strength for this profile.',
        'The behavioral data will probably show efficient pacing early in each module with slower responses on mechanical questions — SEC and grammar tend to require more effort than the reasoning work.',
        'Time remaining at test end will be average or high — but watch for careless errors on mechanics, not missed questions.'
      ],
      primaryGap: 'The gap is usually not reasoning but precision on high-speed mechanical execution.'
    }
  },
  OCN: {
    code: 'OCN',
    label: 'Blocked Potential',
    traits: { O: 'high', C: 'high', N: 'high' },
    tagline: 'The reasoning is there. The score doesn\'t show it yet.',
    sessionStructure: 'Highly structured with visible progress markers. They need to see movement or anxiety compounds. Weekly check-ins on score trajectory. Avoid open-ended exploratory sessions — structure reduces anxiety.',
    feedbackStyle: 'Precise and forward-looking. Don\'t dwell on mistakes — name them, explain them, move on. Avoid language that implies ceiling. Focus on systems: "here\'s the process that will get you the result."',
    practiceFormat: 'Pressure simulation is the primary intervention. Practice under test conditions from week one. Reduce total study volume if they\'re over-preparing — more hours is making anxiety worse. Cap weekly study hours explicitly. Full-length mocks every two weeks minimum.',
    pressureManagement: 'Central to the whole engagement. Introduce a between-section reset protocol — a specific 30-second routine. Reframe mistakes during practice as data collection. The goal is desensitization to difficulty, not elimination of mistakes.',
    sectionThree: {
      patterns: [
        'Inference question scores are likely above the overall average — the reasoning ability is real. The score gap shows up in timed execution, not comprehension.',
        'The behavioral data will show a dwell-time spike pattern: performance dips late in each module, consistent with how high-performing students respond to sustained pressure.',
        'Answer change rate will be above average — especially in the second half of each module. This is rumination under pressure, not uncertainty about content.'
      ],
      primaryGap: 'The gap is pressure management. This is the primary intervention before any content work.'
    }
  },
  Ocn: {
    code: 'Ocn',
    label: 'Loose Engine',
    traits: { O: 'high', C: 'low', N: 'low' },
    tagline: 'The ability is real. The structure isn\'t — yet.',
    sessionStructure: 'Short and frequent beats long and infrequent. 45-minute sessions twice a week outperforms 90-minute sessions once a week. Build in variety. Start with intellectually interesting material, end with mechanical drilling.',
    feedbackStyle: 'Engagement-first. Connect corrections to ideas they find interesting. Dry mechanical feedback produces tuneout. Enthusiasm is contagious with this profile.',
    practiceFormat: 'Gamify the mechanical work. Streak tracking, personal bests on timed drills. Short daily sessions over long weekend sessions. Homework compliance will be inconsistent — design for that rather than fighting it.',
    pressureManagement: 'Low need. The risk is complacency, not anxiety. Introduce mild competitive framing if appropriate. Don\'t over-structure the pressure management layer or it becomes another thing they don\'t do.',
    sectionThree: {
      patterns: [
        'Performance on inference and conceptually rich questions will likely exceed SEC and algebra performance — the intellectual engagement is high, but sustained attention on mechanical work drops off.',
        'Pacing data will show fast initial responses followed by slower engagement late in modules — attention drift, not difficulty.',
        'Low answer change rate suggests confidence (appropriate or not) — not second-guessing, which is a strength in timed conditions.'
      ],
      primaryGap: 'The gap is consistency and follow-through on mechanical question types. Build the habit architecture, not the reasoning.'
    }
  },
  OcN: {
    code: 'OcN',
    label: 'Spinning Out',
    traits: { O: 'high', C: 'low', N: 'high' },
    tagline: 'High ceiling, active floor-trap. The first job is safety, not content.',
    sessionStructure: 'Fixed schedule is non-negotiable — more important than content decisions. Sessions should feel safe and low-stakes, especially early. Don\'t introduce timed pressure until the avoidance cycle is broken. Build momentum with achievable wins first.',
    feedbackStyle: 'Warm and explicit. This profile needs to hear that progress is happening — they often can\'t see it themselves. Overcommunicate small wins. Avoid comparative framing entirely. Focus entirely on trajectory, not position.',
    practiceFormat: 'Untimed practice first, then introduce timing gradually over several weeks. Short sessions with clear endpoints. Remove decision fatigue: pre-planned sessions, materials ready, no choices to make.',
    pressureManagement: 'Priority one before content. Introduce a daily low-stakes check-in routine. Normalize difficulty explicitly and repeatedly. The goal for the first two weeks is not score improvement — it\'s showing up consistently.',
    sectionThree: {
      patterns: [
        'Inference and dual-text performance will likely show the strongest results — the conceptual ability is real and visible even under pressure.',
        'The behavioral data will show high dwell times across the board with significant answer change rates — rumination is the main pattern, not lack of knowledge.',
        'Time management data may show incomplete modules or late rushes — not because the questions are too hard, but because of processing loops on individual items.'
      ],
      primaryGap: 'Breaking the avoidance-anxiety cycle is the first deliverable. Score improvement follows from that, not the other way around.'
    }
  },
  oCn: {
    code: 'oCn',
    label: 'Steady Grind',
    traits: { O: 'low', C: 'high', N: 'low' },
    tagline: 'The system is there. Unlocking the ceiling means teaching inference.',
    sessionStructure: 'Milestone-based. Define clear targets for each session and each week. They respond well to structured progression. Longer sessions work well. Predictability is a feature, not a limitation.',
    feedbackStyle: 'Direct and specific. No emotional scaffolding needed. "This was wrong because X, here\'s the correct approach, do it again" lands well. They don\'t need the why behind every rule — they need the rule and a way to apply it consistently.',
    practiceFormat: 'High volume mechanical drilling. Spaced repetition for grammar rules and math formulas. For inference questions specifically — explicit step-by-step strategies, not intuition-building. Turn the ambiguous into the procedural wherever possible.',
    pressureManagement: 'Low need. May need to teach strategic skipping explicitly — perfectionism around completion can hurt timing on test day.',
    sectionThree: {
      patterns: [
        'SEC grammar and algebra performance will likely be among the strongest scores — these are domains where consistent execution wins.',
        'Inference, dual-text, and conceptually open questions will show the largest gap relative to overall performance — this is the primary content ceiling.',
        'Pacing data will show consistent timing across questions with low variance — a strength on test day, but watch for time lost on hard inference items where a skip would be more strategic.'
      ],
      primaryGap: 'Inference and "what does this suggest" question types. The procedural approach needs to be extended into ambiguous territory.'
    }
  },
  oCN: {
    code: 'oCN',
    label: 'Pressure Build',
    traits: { O: 'low', C: 'high', N: 'high' },
    tagline: 'The work ethic is strong. The test environment is working against it.',
    sessionStructure: 'Structured and predictable. Include explicit time for reviewing what went well. End sessions on a positive note rather than finishing on weakest areas.',
    feedbackStyle: 'Balanced. For every correction, pair it with something they\'re doing well — specific, not generic praise. Avoid any language implying their effort isn\'t enough.',
    practiceFormat: 'Pressure inoculation is the primary intervention. Full-length mocks under strict conditions. Introduce a between-section reset protocol. Explicitly reduce total study volume if they\'re over-preparing. More drilling is feeding the anxiety.',
    pressureManagement: 'Central concern. Performance degrades in the final third of each section. Target interventions specifically at the last 5 questions of every module under time pressure. Build confidence in the endgame.',
    sectionThree: {
      patterns: [
        'Grammar and algebra scores will likely reflect the preparation — the mechanical work is there. The gap shows up in inference and open-ended questions.',
        'Dwell time will increase significantly in the second half of each module — performance degradation in the endgame is the primary signal.',
        'Answer change rate will spike late in each module, especially on inference questions — this is anxiety-driven, not content-driven.'
      ],
      primaryGap: 'The final third of each module. The preparation is real; the endgame execution is the target.'
    }
  },
  ocn: {
    code: 'ocn',
    label: 'Not Engaged',
    traits: { O: 'low', C: 'low', N: 'low' },
    tagline: 'Low investment doesn\'t mean low potential. It means the case hasn\'t been made yet.',
    sessionStructure: 'Short — 45 minutes maximum early on. Build in genuine choice where possible. Autonomy increases engagement. Don\'t assign homework that won\'t get done — design sessions assuming zero work happens between them.',
    feedbackStyle: 'Non-judgmental and honest. Don\'t moralize about effort or potential. Find one genuine strength in the assessment and make that the foundation. Connect SAT performance to something they actually care about.',
    practiceFormat: 'Variety over depth. No long drilling sessions. Gamify wherever possible. Short daily tasks over long weekly sessions. Goal early on is habit formation, not content mastery.',
    pressureManagement: 'Low anxiety = low urgency. Mild external accountability structures help: check-ins, visible progress tracking, parent visibility into session goals.',
    sectionThree: {
      patterns: [
        'The score profile will likely show relatively even distribution across question types — no strong domain, but no catastrophic weak area either.',
        'Pacing will be fast with low dwell time across the board — questions are being processed but not engaged with deeply.',
        'Low answer change rate combined with low accuracy signals guessing or disengagement, not confident wrong answers.'
      ],
      primaryGap: 'Engagement is the primary variable. Content gaps will become measurable once engagement is established.'
    }
  },
  ocN: {
    code: 'ocN',
    label: 'Shut Down',
    traits: { O: 'low', C: 'low', N: 'high' },
    tagline: 'Relationship before curriculum. Trust is the first deliverable.',
    sessionStructure: 'Slow start. First session should be almost entirely intake and relationship-building — not content. Trust before curriculum. Fixed schedule, short sessions, clear endpoints. Every session should end with the student feeling slightly better than when they arrived.',
    feedbackStyle: 'Patient and incremental. Celebrate small gains explicitly and specifically. Never compare to peers. Avoid framing any question as something they "should" know. The goal is a safe environment where making mistakes is acceptable.',
    practiceFormat: 'Start with mechanical questions only — grammar, algebra, data tables. Never start with hard inference passages. Visible wins on mechanical questions build the confidence needed to approach harder material. Introduce difficulty gradually over weeks, not sessions.',
    pressureManagement: 'Priority one, weeks one through three. No timed practice until anxiety is visibly reduced. No full-length mocks early in the engagement. The score will not improve until the student believes improvement is possible — that belief is the first deliverable.',
    sectionThree: {
      patterns: [
        'Performance across all question types will tend to be suppressed — not because of content gaps, but because anxiety affects retrieval and execution simultaneously.',
        'Dwell time will be high throughout, with the highest spikes on inference and open-ended questions — these feel most exposed because there\'s no procedure to fall back on.',
        'Answer change rate may be paradoxically low — not from confidence, but from shutdown (first answer locked in, subsequent thinking avoided).'
      ],
      primaryGap: 'Belief that improvement is possible is the first deliverable. Everything else follows from that.'
    }
  },
};

// ─── PROFILE TRAIT DESCRIPTIONS (Section 1 of report) ────────────────────────
const TRAIT_DESCRIPTIONS = {
  O: {
    high: 'You tend to engage deeply with ideas, often thinking about concepts beyond what\'s required. You find genuine interest in understanding why things work the way they do — and this shows up in how you approach reading and reasoning questions.',
    moderate: 'You balance intellectual curiosity with practical focus. You\'re drawn to interesting ideas when they appear, but you can stay on task when needed.',
    low: 'You prefer clear, concrete tasks with defined answers. You work efficiently when the path is clear and tend to be most effective on questions with a procedural approach.'
  },
  C: {
    high: 'You approach preparation systematically, tracking what you\'ve covered and working through tasks in a structured way. Your follow-through is a genuine asset.',
    moderate: 'You have some structure in your study approach, though it varies. When the goal is clear, your consistency shows.',
    low: 'Your study approach tends to be flexible and variable. Consistency is something you\'re building — and once you have the right system, your engagement can be a real strength.'
  },
  N: {
    high: 'You hold yourself to high standards and feel the weight of important tests. That pressure is real — and understanding how it affects your performance is one of the most useful things we can do together.',
    moderate: 'You feel some pressure around high-stakes tests, but you manage it reasonably well. There are specific moments where it affects performance more than others.',
    low: 'You handle pressure with relative ease. Your performance under test conditions tends to be stable, which is a real advantage on test day.'
  },
  E: {
    high: 'You tend to process ideas through conversation and benefit from talking through problems with others.',
    moderate: 'You\'re comfortable working both independently and collaboratively, depending on the task.',
    low: 'You prefer to work through material independently, which suits focused individual preparation.'
  },
  A: {
    high: 'You\'re attuned to others and naturally supportive — which can be a strength in collaborative settings and sometimes a source of distraction from your own preparation.',
    moderate: 'You balance your own goals with awareness of those around you.',
    low: 'You\'re self-directed and focused on your own goals, which serves independent preparation well.'
  }
};

// E and A modifiers text
const EA_MODIFIERS = {
  highE: 'Verbal processing works well for you — talking through material with a consultant or study partner tends to accelerate understanding.',
  highA: 'Positive reinforcement and explicit acknowledgment of progress matter more for your motivation than for most students.',
  lowA_highOC: 'You will push back on recommendations you don\'t agree with — that\'s useful signal. Engage with it directly rather than deferring.'
};
