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

export const READING_TEXT = `また、漫画は「絵」がある点で、字だけの本に比べて、内容がとてもわかりやすい。言葉だけによる表現よりも、絵がある方が、具体的なイメージを持つことができるので、読者にとって、理解しやすくなるのである。最近では、この利点を生かして、会社や商品の案内書や説明書など、漫画で書かれているものが多くなった。`;

// ── Target kanji ──────────────────────────────────────────────────────────────
// 11 words tracked for is_target_word and was_glossed.
// Key: word as it appears in the text. Value: metadata for tests.

export const TARGET_KANJI = {
  '漫画': {
    reading: 'まんが',
    meaning: 'manga, comic',
    kanjiMeaning: 'overflow, manga',
    acceptedMeanings: ['manga', 'comic', 'comic book', 'comics'],
    difficulty: 'easy',
    testKanji: '漫',
    otherKanji: '画',
    blankDisplay: '[–]画',
    exampleSentence: 'また、漫画は「絵」がある点で、字だけの本に比べて、内容がとてもわかりやすい。',
  },
  '絵': {
    reading: 'え',
    meaning: 'picture, drawing',
    kanjiMeaning: 'picture, drawing',
    acceptedMeanings: ['picture', 'drawing', 'illustration', 'image', 'painting'],
    difficulty: 'easy',
    testKanji: '絵',
    otherKanji: null,
    blankDisplay: '[–]',
    exampleSentence: '言葉だけによる表現よりも、絵がある方が、具体的なイメージを持つことができるので、読者にとって、理解しやすくなるのである。',
  },
  '内容': {
    reading: 'ないよう',
    meaning: 'content, substance',
    kanjiMeaning: 'inside, within',
    acceptedMeanings: ['content', 'contents', 'substance', 'detail', 'details'],
    difficulty: 'easy',
    testKanji: '内',
    otherKanji: '容',
    blankDisplay: '[–]容',
    exampleSentence: 'また、漫画は「絵」がある点で、字だけの本に比べて、内容がとてもわかりやすい。',
  },
  '表現': {
    reading: 'ひょうげん',
    meaning: 'expression',
    kanjiMeaning: 'surface, express',
    acceptedMeanings: ['expression', 'representation', 'depiction'],
    difficulty: 'intermediate',
    testKanji: '表',
    otherKanji: '現',
    blankDisplay: '[–]現',
    exampleSentence: '言葉だけによる表現よりも、絵がある方が、具体的なイメージを持つことができるので、読者にとって、理解しやすくなるのである。',
  },
  '具体的': {
    reading: 'ぐたいてき',
    meaning: 'concrete, specific',
    kanjiMeaning: 'target, -like',
    acceptedMeanings: ['concrete', 'specific', 'tangible', 'definite'],
    difficulty: 'intermediate',
    testKanji: '的',
    otherKanji: '具体',
    blankDisplay: '具体[–]',
    exampleSentence: '言葉だけによる表現よりも、絵がある方が、具体的なイメージを持つことができるので、読者にとって、理解しやすくなるのである。',
  },
  '読者': {
    reading: 'どくしゃ',
    meaning: 'reader',
    kanjiMeaning: 'read',
    acceptedMeanings: ['reader', 'readers'],
    difficulty: 'intermediate',
    testKanji: '読',
    otherKanji: '者',
    blankDisplay: '[–]者',
    exampleSentence: '言葉だけによる表現よりも、絵がある方が、具体的なイメージを持つことができるので、読者にとって、理解しやすくなるのである。',
  },
  '理解': {
    reading: 'りかい',
    meaning: 'understanding, comprehension',
    kanjiMeaning: 'explain, solve',
    acceptedMeanings: ['understanding', 'comprehension', 'grasp', 'understand'],
    difficulty: 'intermediate',
    testKanji: '解',
    otherKanji: '理',
    blankDisplay: '理[–]',
    exampleSentence: '言葉だけによる表現よりも、絵がある方が、具体的なイメージを持つことができるので、読者にとって、理解しやすくなるのである。',
  },
  '最近': {
    reading: 'さいきん',
    meaning: 'recently, lately',
    kanjiMeaning: 'most, extreme',
    acceptedMeanings: ['recently', 'lately', 'these days', 'recent'],
    difficulty: 'intermediate',
    testKanji: '最',
    otherKanji: '近',
    blankDisplay: '[–]近',
    exampleSentence: '最近では、この利点を生かして、会社や商品の案内書や説明書など、漫画で書かれているものが多くなった。',
  },
  '利点': {
    reading: 'りてん',
    meaning: 'advantage, merit',
    kanjiMeaning: 'profit, benefit',
    acceptedMeanings: ['advantage', 'merit', 'benefit', 'plus', 'strong point'],
    difficulty: 'intermediate',
    testKanji: '利',
    otherKanji: '点',
    blankDisplay: '[–]点',
    exampleSentence: '最近では、この利点を生かして、会社や商品の案内書や説明書など、漫画で書かれているものが多くなった。',
  },
  '案内書': {
    reading: 'あんないしょ',
    meaning: 'guide booklet, brochure',
    kanjiMeaning: 'proposal, idea',
    acceptedMeanings: ['guide', 'brochure', 'guidebook', 'guide booklet'],
    difficulty: 'hard',
    testKanji: '案',
    otherKanji: '内書',
    blankDisplay: '[–]内書',
    quizTrigger: true,
    exampleSentence: '最近では、この利点を生かして、会社や商品の案内書や説明書など、漫画で書かれているものが多くなった。',
  },
  '説明書': {
    reading: 'せつめいしょ',
    meaning: 'instruction manual',
    kanjiMeaning: 'explanation, theory',
    acceptedMeanings: ['instruction manual', 'manual', 'instructions', 'guide'],
    difficulty: 'hard',
    testKanji: '説',
    otherKanji: '明書',
    blankDisplay: '[–]明書',
    quizTrigger: true,
    exampleSentence: '最近では、この利点を生かして、会社や商品の案内書や説明書など、漫画で書かれているものが多くなった。',
  },
};

// Mid-quiz trigger words — first gloss of any of these fires the mid-reading quiz
export const QUIZ_TRIGGER_WORDS = new Set(['案内書', '説明書']);

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
