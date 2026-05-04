/**
 * studyConfig.js
 * ==============
 * Single source of truth for all study-specific content.
 * To update the text, target kanji, or questions: edit ONLY this file.
 * No other component needs to change.
 */

// ── API ───────────────────────────────────────────────────────────────────────

export const API_BASE = import.meta.env.VITE_API_BASE
  ?? 'https://furiganaapi-production.up.railway.app';

export const APP_VERSION_A = 'V3';
export const APP_VERSION_B = 'V3B';

// ── Reading text ──────────────────────────────────────────────────────────────
// The text is embedded here and sent to /analyze as plain text.
// To change the text: update READING_TEXT below. No server file needed.

export const READING_TEXT = `また、漫画は「絵」がある点で、字だけの本に比べて、内容がとてもわかりやすい。言葉だけによる表現よりも、絵がある方が、具体的なイメージを持つことができるので、読者にとって、理解しやすくなるのである。`;

// ── Target kanji ──────────────────────────────────────────────────────────────
// 11 words tracked for is_target_word and was_glossed.
// Key: word as it appears in the text. Value: metadata for tests.

export const TARGET_KANJI = {
  '漫画': {
    reading: 'まんが',
    meaning: 'manga, comic',
    acceptedMeanings: ['manga', 'comic', 'comic book', 'comics'],
    difficulty: 'easy',
    testKanji: '漫',
    otherKanji: '画',
    blankDisplay: 'O画',
    radicalKanjiMeaning: 'cartoon, involuntary',
    midQuizHeader: 'What radicals did you notice in the kanji for "cartoon, involuntary"',
    postTestHeader: 'What radicals did you remember in the kanji for "cartoon, involuntary"',
    testDisplayLine: 'O画 (まんが, manga, comic)',
    exampleSentence: 'また、漫画は「絵」がある点で、字だけの本に比べて、内容がとてもわかりやすい。',
  },
  '絵': {
    reading: 'え',
    meaning: 'picture, drawing',
    acceptedMeanings: ['picture', 'drawing', 'illustration', 'image', 'painting'],
    difficulty: 'easy',
    testKanji: '絵',
    otherKanji: null,
    blankDisplay: 'O',
    radicalKanjiMeaning: 'drawing, picture',
    midQuizHeader: 'What radicals did you notice in the kanji for "drawing, picture"',
    postTestHeader: 'What radicals did you remember in the kanji for "drawing, picture"',
    testDisplayLine: '「O」 (え, picture, drawing)',
    exampleSentence: 'また、漫画は「絵」がある点で、字だけの本に比べて、内容がとてもわかりやすい。',
  },
  '内容': {
    reading: 'ないよう',
    meaning: 'content, substance',
    acceptedMeanings: ['content', 'contents', 'substance', 'detail'],
    difficulty: 'easy',
    testKanji: '内',
    otherKanji: '容',
    blankDisplay: 'O容',
    exampleSentence: 'また、漫画は「絵」がある点で、字だけの本に比べて、内容がとてもわかりやすい。',
  },
  '表現': {
    reading: 'ひょうげん',
    meaning: 'expression',
    acceptedMeanings: ['expression', 'representation', 'depiction'],
    difficulty: 'intermediate',
    testKanji: '表',
    otherKanji: '現',
    blankDisplay: 'O現',
    exampleSentence: '言葉だけによる表現よりも、絵がある方が、具体的なイメージを持つことができるので、読者にとって、理解しやすくなるのである。',
  },
  '具体的': {
    reading: 'ぐたいてき',
    meaning: 'concrete, specific',
    acceptedMeanings: ['concrete', 'specific', 'tangible', 'definite'],
    difficulty: 'intermediate',
    testKanji: '的',
    otherKanji: '具体',
    blankDisplay: '具体O',
    radicalKanjiMeaning: 'target, bulls eye',
    midQuizHeader: 'What radicals did you notice in the kanji for "target, bulls eye"',
    postTestHeader: 'What radicals did you remember in the kanji for "target, bulls eye"',
    testDisplayLine: '具体O (ぐたいてき, concrete, specific)',
    quizTrigger: true,
    exampleSentence: '言葉だけによる表現よりも、絵がある方が、具体的なイメージを持つことができるので、読者にとって、理解しやすくなるのである。',
  },
  '読者': {
    reading: 'どくしゃ',
    meaning: 'reader',
    acceptedMeanings: ['reader', 'readers'],
    difficulty: 'intermediate',
    testKanji: '読',
    otherKanji: '者',
    blankDisplay: 'O者',
    exampleSentence: '言葉だけによる表現よりも、絵がある方が、具体的なイメージを持つことができるので、読者にとって、理解しやすくなるのである。',
  },
  '理解': {
    reading: 'りかい',
    meaning: 'understanding, comprehension',
    acceptedMeanings: ['understanding', 'comprehension', 'grasp', 'understand'],
    difficulty: 'intermediate',
    testKanji: '解',
    otherKanji: '理',
    blankDisplay: '理O',
    radicalKanjiMeaning: 'explanation, answer',
    midQuizHeader: 'What radicals did you notice in the kanji for "explanation, answer"',
    postTestHeader: 'What radicals did you remember in the kanji for "explanation, answer"',
    testDisplayLine: '理O (りかい, understanding, comprehension)',
    quizTrigger: true,
    exampleSentence: '言葉だけによる表現よりも、絵がある方が、具体的なイメージを持つことができるので、読者にとって、理解しやすくなるのである。',
  },
};

// Mid-quiz trigger words — first gloss of any of these fires the mid-reading quiz
export const QUIZ_TRIGGER_WORDS = new Set(['理解', '具体的']);

// ── Inline reading comprehension question (shown at bottom of reading page) ──
// This gates the Finish Reading button and is saved to thesis_results.
export const READING_INLINE_QUESTION = {
  question: 'According to this paragraph, what is it that makes manga special?',
  correctAnswer: 'c',
  options: [
    { key: 'a', text: 'Manga are written to be engaging to a wide audience, including adults' },
    { key: 'b', text: 'Manga can be purchased easily at convenience stores and train stations' },
    { key: 'c', text: 'The presence of pictures makes for clear mental images' },
    { key: 'd', text: 'Manga are easy to read on the go such as in the train' },
    { key: 'e', text: 'I do not know' },
  ],
};


// ── Comprehension questions ───────────────────────────────────────────────────
// Fixed, identical for all participants.

export const COMPREHENSION_QUESTIONS = [
  {
    index: 0,
    question: 'What advantage of manga is described first in the text?',
    options: [
      { key: 'a', text: 'Manga is cheaper than regular books' },
      { key: 'b', text: 'Manga can be read while standing on a train' },
      { key: 'c', text: 'Manga is available at all bookstores' },
      { key: 'd', text: 'Manga takes less time to read than novels' },
    ],
    correctAnswer: 'b',
  },
  {
    index: 1,
    question: 'According to the text, why is manga with pictures easier to understand than text-only books?',
    options: [
      { key: 'a', text: 'Manga uses simpler vocabulary' },
      { key: 'b', text: 'Manga has fewer pages' },
      { key: 'c', text: 'Pictures help readers form concrete mental images' },
      { key: 'd', text: 'Manga stories are shorter and easier to follow' },
    ],
    correctAnswer: 'c',
  },
  {
    index: 2,
    question: 'What recent development does the text mention?',
    options: [
      { key: 'a', text: 'Manga has become popular in other countries' },
      { key: 'b', text: 'Company guides and instruction manuals are increasingly written in manga format' },
      { key: 'c', text: 'Manga artists are now creating content for schools' },
      { key: 'd', text: 'Manga has replaced textbooks at universities' },
    ],
    correctAnswer: 'b',
  },
];


// ── Non-target words — radical test data (fallback only) ─────────────────────
export const NON_TARGET_RADICAL_WORDS = {
  '持つ': {
    reading: 'もつ',
    meaning: 'to hold, to have',
    testKanji: '持',
    blankDisplay: 'Oつ',
    radicalKanjiMeaning: 'hold',
    postTestHeader: 'What radicals did you remember in the kanji for "hold"',
    testDisplayLine: 'Oつ (もつ, to hold)',
    exampleSentence: '絵がある方が、具体的なイメージを持つことができるので…',
  },
  '比べて': {
    reading: 'くらべて',
    meaning: 'to compare',
    testKanji: '比',
    blankDisplay: 'Oべて',
    radicalKanjiMeaning: 'compare',
    postTestHeader: 'What radicals did you remember in the kanji for "compare"',
    testDisplayLine: 'Oべて (くらべて, to compare)',
    exampleSentence: '字だけの本に比べて、内容がとてもわかりやすい。',
  },
  '点': {
    reading: 'てん',
    meaning: 'point, spot',
    testKanji: '点',
    blankDisplay: 'O',
    radicalKanjiMeaning: 'spot, point',
    postTestHeader: 'What radicals did you remember in the kanji for "spot, point"',
    testDisplayLine: 'O (てん, point, spot)',
    exampleSentence: 'また、漫画は「絵」がある点で、字だけの本に比べて、内容がとてもわかりやすい。',
  },
  '字': {
    reading: 'じ',
    meaning: 'character, letter',
    testKanji: '字',
    blankDisplay: 'O',
    radicalKanjiMeaning: 'character, letter',
    postTestHeader: 'What radicals did you remember in the kanji for "character, letter"',
    testDisplayLine: 'O (じ, character, letter)',
    exampleSentence: '字だけの本に比べて、内容がとてもわかりやすい。',
  },
};


// ── Word priority order for post-reading test ─────────────────────────────────
// Words are drawn from this list in order, filtered to only glossed words.
// 'type' = preferred question type. Equal split is enforced — see KanjiTestPage.
// Mid-quiz word is excluded from this test (already tested in pop-up quiz).

export const WORD_PRIORITY_ORDER = [
  // Target words — radicals first to ensure radical pool is filled
  { word: '具体的', type: 'radical' },          // mid-quiz candidate
  { word: '理解',   type: 'radical' },          // mid-quiz candidate
  { word: '絵',     type: 'radical' },
  { word: '漫画',   type: 'radical' },
  { word: '読者',   type: 'reading_meaning' },
  { word: '表現',   type: 'reading_meaning' },
  { word: '内容',   type: 'reading_meaning' },
  // Non-target fallback (used only if target pool exhausted)
  { word: '持つ',   type: 'radical' },
  { word: '比べて', type: 'radical' },
  { word: '点',     type: 'radical' },
  { word: '字',     type: 'radical' },
  { word: '言葉',   type: 'reading_meaning' },
  { word: '方',     type: 'reading_meaning' },
  { word: '本',     type: 'reading_meaning' },
];

// ── Post-study questionnaire ──────────────────────────────────────────────────

export const LIKERT_QUESTIONS = [
  {
    id: 'enjoyment',
    text: 'How enjoyable did you find this reading experience?',
    anchors: ['Not at all enjoyable', 'Extremely enjoyable'],
  },
  {
    id: 'readings_learned',
    text: 'To what extent did this tool help you learn the readings of kanji you encountered?',
    anchors: ['Not at all', 'A great deal'],
  },
  {
    id: 'vocabulary_learned',
    text: 'To what extent did this tool help you learn new vocabulary?',
    anchors: ['Not at all', 'A great deal'],
  },
  {
    id: 'composition_noticed',
    text: 'To what extent did this tool help you notice the components that make up kanji?',
    anchors: ['Not at all', 'A great deal'],
  },
  {
    id: 'comprehension_self',
    text: 'How well do you feel you understood the reading material?',
    anchors: ['Very poorly', 'Very well'],
  },
  {
    id: 'tool_contribution',
    text: 'To what extent did the glossing tool contribute to your understanding of the text?',
    anchors: ['Not at all', 'A great deal'],
  },
  {
    id: 'reading_disruption',
    text: 'To what extent did the glossing tool disrupt your reading flow?',
    anchors: ['Not at all', 'Completely'],
  },
  {
    id: 'future_use',
    text: 'How likely are you to use a tool like this in your own time?',
    anchors: ['Very unlikely', 'Very likely'],
  },
];

export const USE_CONTEXT_OPTIONS = [
  { key: 'study', text: 'During reading for studying' },
  { key: 'translation', text: 'When needing quick translations (menu, document at work, etc.)' },
  { key: 'leisure', text: 'During reading for pleasure' },
  { key: 'other', text: 'Other' },
];

// ── CEFR level descriptions ───────────────────────────────────────────────────

export const CEFR_LEVELS = [
  { key: 'A1', label: 'A1 — Beginner',           desc: 'Can use and understand very basic phrases and expressions' },
  { key: 'A2', label: 'A2 — Elementary',          desc: 'Can communicate in simple and routine tasks on familiar topics' },
  { key: 'B1', label: 'B1 — Intermediate',        desc: 'Can deal with most situations likely to arise while travelling in Japan' },
  { key: 'B2', label: 'B2 — Upper intermediate',  desc: 'Can interact with a degree of fluency and spontaneity with native speakers' },
  { key: 'C1', label: 'C1 — Advanced',            desc: 'Can express ideas fluently and spontaneously without much searching for words' },
  { key: 'C2', label: 'C2 — Proficient',          desc: 'Can understand with ease virtually everything heard or read' },
  { key: 'unsure', label: 'Not sure', desc: '' },
];

export const READING_LEVEL_OPTIONS = [
  { key: '1', label: '1', desc: 'I cannot read Japanese text at all' },
  { key: '2', label: '2', desc: 'I can read hiragana and katakana but very few kanji' },
  { key: '3', label: '3', desc: 'I can read simple texts with frequent dictionary use' },
  { key: '4', label: '4', desc: 'I can read most everyday texts with occasional help' },
  { key: '5', label: '5', desc: 'I can read almost any Japanese text with little difficulty' },
];

export const STUDY_DURATION_OPTIONS = [
  { key: 'never', label: 'Never studied' },
  { key: 'lt6m', label: 'Less than 6 months' },
  { key: '6m1y', label: '6 months – 1 year' },
  { key: '1y2y', label: '1 – 2 years' },
  { key: '2y4y', label: '2 – 4 years' },
  { key: '4y+', label: '4+ years' },
];

export const JLPT_OPTIONS = [
  { key: 'never', label: 'Never attempted' },
  { key: 'N5', label: 'N5' },
  { key: 'N4', label: 'N4' },
  { key: 'N3', label: 'N3' },
  { key: 'N2', label: 'N2' },
  { key: 'N1', label: 'N1' },
];

// ── Study intro text ──────────────────────────────────────────────────────────

export const STUDY_INTRO = `This study looks at how people read Japanese text when using a digital reading tool. You will read a short passage in Japanese and answer a few questions about what you read. The whole session takes about 15–20 minutes. There are no right or wrong answers in most sections — we are interested in your natural reading experience. Please read the text as you normally would. After reading, you will answer some questions about the text and the words you encountered.`;

// ── Post-test (2-week follow-up) ──────────────────────────────────────────────
// Wait period and special-case usernames for the long-term retention follow-up.

// Minimum days between session 1 and post-test eligibility.
export const POSTTEST_MIN_DAYS = 14;

// Test users who can take the post-test before the wait period elapses.
// Used during system development. Case-insensitive.
export const POSTTEST_BYPASS_WAIT_IDS = ['narrow', 'classic'];

// Test user who is always routed straight to the post-test if session 1 data exists.
// Used to test the post-test flow itself. Case-insensitive.
export const POSTTEST_FORCE_IDS = ['endtest'];

// Number of "control" target kanji to add to the post-test kanji test.
// Control items are target kanji the participant did NOT gloss in session 1
// — they give a within-participant baseline to detect background knowledge growth.
export const POSTTEST_CONTROL_KANJI_COUNT = 2;

// Post-test introduction shown before the radical noticing phase.
export const POSTTEST_INTRO_TEXT = `Welcome back. This is a short follow-up to test long-term retention of what you encountered in the first session. The format will feel familiar — radical noticing questions, then a vocabulary test, then a few short questions about what you've been doing in the meantime. The whole thing takes about 5–10 minutes.

Please answer with whatever you remember from the first session, even if you're unsure. Do NOT use a dictionary, translation app, or any other resource — and please don't review the original text before continuing. We are specifically interested in what you retained.`;

// Short post-test questionnaire — captures intervening exposure that could confound results.
export const POSTTEST_QUESTIONNAIRE = [
  {
    id: 'studied_japanese',
    type: 'yesno',
    text: 'Did you study Japanese (formally or informally) between the two sessions?',
  },
  {
    id: 'reencountered_kanji',
    type: 'yesno',
    text: 'Did you encounter any of the kanji from the first session in any other context (manga, news, classes, etc.) between sessions?',
  },
  {
    id: 'reread_text',
    type: 'yesno',
    text: 'Did you re-read or review the study text or its content between sessions?',
  },
  {
    id: 'comments',
    type: 'text',
    text: 'Anything else worth noting about the time between sessions?',
    optional: true,
    placeholder: 'Optional — any context you think is relevant…',
  },
];


// ── In-text radicals with hardcoded metadata (distractor pool) ───────────────
// Hardcoded so distractors always render correctly regardless of backend lookup.
export const IN_TEXT_RADICALS_META = [
  { radical: '一', stroke_count: 1, primary_english: 'one' },
  { radical: '二', stroke_count: 2, primary_english: 'two' },
  { radical: '人', stroke_count: 2, primary_english: 'person' },
  { radical: '亻', stroke_count: 2, primary_english: 'person (radical)' },
  { radical: '冂', stroke_count: 2, primary_english: 'open box' },
  { radical: '八', stroke_count: 2, primary_english: 'eight' },
  { radical: '刀', stroke_count: 2, primary_english: 'knife' },
  { radical: '勺', stroke_count: 3, primary_english: 'ladle' },
  { radical: '又', stroke_count: 2, primary_english: 'again, hand' },
  { radical: '口', stroke_count: 3, primary_english: 'mouth' },
  { radical: '子', stroke_count: 3, primary_english: 'child' },
  { radical: '宀', stroke_count: 3, primary_english: 'roof' },
  { radical: '寸', stroke_count: 3, primary_english: 'measure' },
  { radical: '廾', stroke_count: 3, primary_english: 'two hands' },
  { radical: '扌', stroke_count: 3, primary_english: 'hand (radical)' },
  { radical: '艹', stroke_count: 3, primary_english: 'grass' },
  { radical: '土', stroke_count: 3, primary_english: 'earth' },
  { radical: '比', stroke_count: 4, primary_english: 'compare' },
  { radical: '日', stroke_count: 4, primary_english: 'sun, day' },
  { radical: '木', stroke_count: 4, primary_english: 'tree' },
  { radical: '王', stroke_count: 4, primary_english: 'king' },
  { radical: '牛', stroke_count: 4, primary_english: 'cow' },
  { radical: '占', stroke_count: 5, primary_english: 'fortune-telling' },
  { radical: '田', stroke_count: 5, primary_english: 'rice field' },
  { radical: '目', stroke_count: 5, primary_english: 'eye' },
  { radical: '世', stroke_count: 5, primary_english: 'world' },
  { radical: '白', stroke_count: 5, primary_english: 'white' },
  { radical: '本', stroke_count: 5, primary_english: 'book, root' },
  { radical: '氵', stroke_count: 3, primary_english: 'water (radical)' },
  { radical: '穴', stroke_count: 5, primary_english: 'hole, cave' },
  { radical: '会', stroke_count: 6, primary_english: 'meeting' },
  { radical: '糸', stroke_count: 6, primary_english: 'thread' },
  { radical: '耂', stroke_count: 4, primary_english: 'old' },
  { radical: '衣', stroke_count: 6, primary_english: 'clothing' },
  { radical: '見', stroke_count: 7, primary_english: 'see' },
  { radical: '谷', stroke_count: 7, primary_english: 'valley' },
  { radical: '言', stroke_count: 7, primary_english: 'speech' },
  { radical: '寺', stroke_count: 6, primary_english: 'temple' },
  { radical: '里', stroke_count: 7, primary_english: 'village' },
  { radical: '角', stroke_count: 7, primary_english: 'horn, corner' },
  { radical: '売', stroke_count: 7, primary_english: 'sell' },
  { radical: '灬', stroke_count: 4, primary_english: 'fire (radical)' },
];

// Plain character list — kept for backwards compatibility
export const IN_TEXT_RADICALS = IN_TEXT_RADICALS_META.map(r => r.radical);

// ── English sentence contexts for radical questions ──────────────────────────
// Shown as an episodic cue without re-exposing the original Japanese.
export const EN_SENTENCE_CONTEXT = {
  '漫画':   'the kanji from the sentence introducing manga as having pictures',
  '絵':     'the kanji from the sentence about pictures making manga easy to understand',
  '内容':   'the kanji from the sentence about content being easy to understand',
  '表現':   'the kanji from the sentence about expression by words alone',
  '具体的': 'the kanji from the sentence about forming concrete mental images',
  '読者':   'the kanji from the sentence about the reader being able to understand',
  '理解':   'the kanji from the sentence about comprehension being easier',
};

// ── Transfer kanji (novel kanji built from in-text radicals) ─────────────────
// Same items shown to all participants, regardless of which words they glossed.
export const TRANSFER_KANJI = [
  {
    kanji: '紹',
    correctRadicals: ['糸', '刀', '口'],
    radicalsInText: { '糸': true, '刀': true, '口': true },
    sourceWordsInText: { '糸': '絵', '刀': '解', '口': '容/言/読' },
    // Partial-credit components: each maps to the correct radicals it contains.
    // E.g. placing 召 covers both 刀 and 口 (one level up from full decomposition).
    partialComponents: {
      '召': ['刀', '口'],   // 召 = 刀 + 口
    },
  },
  {
    kanji: '拊',
    correctRadicals: ['扌', '亻', '寸'],
    radicalsInText: { '扌': true, '亻': true, '寸': true },
    sourceWordsInText: { '扌': '持', '亻': '体', '寸': '持 (in 寺)' },
    partialComponents: {
      '付': ['亻', '寸'],   // 付 = 亻 + 寸
    },
  },
];
