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

export const READING_TEXT = `日本人の大人と漫画
「どうして日本では、子どもだけでなくて大人たちも漫画を読んでいるのか。」と言う外国人の声を耳にすることがよくある。確かに、電車の中で漫画雑誌に夢中になっている大人を見るのは、珍しいことではない。特に、20代、30代の大人たちが多いようだ。彼らは、なぜ、大人になっても漫画を読んでいるのか、そして、彼らが読んでいる漫画とはどんなものなのか、考えてみたい。

まず、漫画は、駅で買って電車の中で立ったまま読めるという便利さがある。簡単に手に入れられて簡単に読むことができるので、毎日仕事で忙しい人たちにとっては、最も手軽なリラックスの手段だと言えるだろう。

また、漫画は「絵」がある点で、字だけの本に比べて、内容がとてもわかりやすい。言葉だけによる表現よりも、絵がある方が、具体的なイメージを持つことができるので、読者にとって、理解しやすくなるのである。最近では、この利点を生かして、会社や商品の案内書や説明書など、漫画で書かれているものが多くなった。

そして、読者をひきつけるために一番大切な、内容の面白さという点も、忘れることはできない。漫画をあまり読まない人たちの中には、漫画は低俗だとか、内容が乏しいと思っている人もいるが、実際は必ずしもそうとは言えない。話の内容に作者の思想が反映されている作品や、テーマや背景が注意深く調査されていて、読者の知的好奇心を満たすことができる作品も少なくない。そして、読者はそのような作品を読んで、すぐれた映画や小説に出会った時と同じように、感動したり、共感を覚えたりするのである。

若い大人たちにとって、漫画は子どものころから身近な存在だった。そして、彼らが大人になった今、このような漫画の特徴は以前よりもずっと広く認識されているし、また支持されるようにもなっている。漫画は、これからも多くの人たちに読まれていくだろう。`;

// ── Target kanji ──────────────────────────────────────────────────────────────
// 11 words tracked for is_target_word and was_glossed.
// Key: word as it appears in the text. Value: metadata for tests.

export const TARGET_KANJI = {
  '漫画': {
    reading: 'まんが',
    meaning: 'manga, comic',
    acceptedMeanings: ['manga', 'comic', 'comic book', 'comics'],
    difficulty: 'easy',
    paragraph: 1,
    testKanji: '漫',
    otherKanji: '画',
    exampleSentence: '「どうして日本では、子どもだけでなくて大人たちも漫画を読んでいるのか。」と言う外国人の声を耳にすることがよくある。',
  },
  '珍しい': {
    reading: 'めずらしい',
    meaning: 'rare, unusual',
    acceptedMeanings: ['rare', 'unusual', 'uncommon', 'strange'],
    difficulty: 'easy',
    paragraph: 1,
    testKanji: '珍',
    otherKanji: null,
    // Single-kanji word — blank is just [–]
    exampleSentence: '電車の中で漫画雑誌に夢中になっている大人を見るのは、珍しいことではない。',
  },
  '夢中': {
    reading: 'むちゅう',
    meaning: 'absorbed in, engrossed',
    acceptedMeanings: ['absorbed', 'engrossed', 'crazy about', 'enthusiastic'],
    difficulty: 'intermediate',
    paragraph: 1,
    testKanji: '夢',
    otherKanji: '中',
    exampleSentence: '電車の中で漫画雑誌に夢中になっている大人を見るのは、珍しいことではない。',
  },
  '表現': {
    reading: 'ひょうげん',
    meaning: 'expression',
    acceptedMeanings: ['expression', 'representation', 'depiction'],
    difficulty: 'intermediate',
    paragraph: 3,
    testKanji: '現',
    otherKanji: '表',
    exampleSentence: '言葉だけによる表現よりも、絵がある方が、具体的なイメージを持つことができるので、読者にとって、理解しやすくなるのである。',
  },
  '読者': {
    reading: 'どくしゃ',
    meaning: 'reader',
    acceptedMeanings: ['reader', 'readers'],
    difficulty: 'intermediate',
    paragraph: 3,
    testKanji: '読',
    otherKanji: '者',
    exampleSentence: '言葉だけによる表現よりも、絵がある方が、具体的なイメージを持つことができるので、読者にとって、理解しやすくなるのである。',
  },
  '作品': {
    reading: 'さくひん',
    meaning: 'work, piece',
    acceptedMeanings: ['work', 'piece', 'artwork', 'creation', 'production'],
    difficulty: 'intermediate',
    paragraph: 4,
    testKanji: '品',
    otherKanji: '作',
    exampleSentence: '話の内容に作者の思想が反映されている作品や、テーマや背景が注意深く調査されていて、読者の知的好奇心を満たすことができる作品も少なくない。',
  },
  '感動': {
    reading: 'かんどう',
    meaning: 'to be moved, deep emotion',
    acceptedMeanings: ['moved', 'deep emotion', 'emotion', 'impressed', 'touching'],
    difficulty: 'intermediate',
    paragraph: 4,
    testKanji: '感',
    otherKanji: '動',
    midQuizCandidate: true,
    exampleSentence: '読者はそのような作品を読んで、すぐれた映画や小説に出会った時と同じように、感動したり、共感を覚えたりするのである。',
  },
  '低俗': {
    reading: 'ていぞく',
    meaning: 'vulgar, lowbrow',
    acceptedMeanings: ['vulgar', 'lowbrow', 'crude', 'low grade'],
    difficulty: 'hard',
    paragraph: 4,
    testKanji: '俗',
    otherKanji: '低',
    exampleSentence: '漫画をあまり読まない人たちの中には、漫画は低俗だとか、内容が乏しいと思っている人もいるが、実際は必ずしもそうとは言えない。',
  },
  '思想': {
    reading: 'しそう',
    meaning: 'thought, ideology',
    acceptedMeanings: ['thought', 'ideology', 'ideas', 'philosophy'],
    difficulty: 'hard',
    paragraph: 4,
    testKanji: '思',
    otherKanji: '想',
    exampleSentence: '話の内容に作者の思想が反映されている作品や、テーマや背景が注意深く調査されていて、読者の知的好奇心を満たすことができる作品も少なくない。',
  },
  '反映': {
    reading: 'はんえい',
    meaning: 'reflection, to reflect',
    acceptedMeanings: ['reflection', 'reflect', 'mirror'],
    difficulty: 'hard',
    paragraph: 4,
    testKanji: '映',
    otherKanji: '反',
    exampleSentence: '話の内容に作者の思想が反映されている作品や、テーマや背景が注意深く調査されていて、読者の知的好奇心を満たすことができる作品も少なくない。',
  },
  '特徴': {
    reading: 'とくちょう',
    meaning: 'characteristic, feature',
    acceptedMeanings: ['characteristic', 'feature', 'trait', 'quality'],
    difficulty: 'hard',
    paragraph: 5,
    testKanji: '徴',
    otherKanji: '特',
    quizTrigger: true,
    exampleSentence: 'このような漫画の特徴は以前よりもずっと広く認識されているし、また支持されるようにもなっている。',
  },
};

// Mid-quiz trigger words — first gloss of any of these fires the mid-reading quiz
export const QUIZ_TRIGGER_WORDS = new Set(['特徴', '認識']);

// ── Comprehension questions ───────────────────────────────────────────────────
// Fixed, identical for all participants.

export const COMPREHENSION_QUESTIONS = [
  {
    index: 0,
    question: 'What practical advantage of manga is mentioned first in the text?',
    options: [
      { key: 'a', text: 'Manga is cheap compared to novels' },
      { key: 'b', text: 'Manga can be read easily during commuting' },
      { key: 'c', text: 'Manga is educational for children' },
      { key: 'd', text: 'Manga is usually very short' },
    ],
    correctAnswer: 'b',
  },
  {
    index: 1,
    question: 'What is the main point of this text?',
    options: [
      { key: 'a', text: 'Manga should replace novels in modern society' },
      { key: 'b', text: 'Manga is mainly for relaxation, not serious thinking' },
      { key: 'c', text: 'Manga continues to be popular among adults because of its accessibility and depth' },
      { key: 'd', text: 'Manga is more popular in Japan than in other countries' },
    ],
    correctAnswer: 'c',
  },
  {
    index: 2,
    question: 'Which age group is said to read manga particularly often?',
    options: [
      { key: 'a', text: 'Teenagers' },
      { key: 'b', text: 'People over 60' },
      { key: 'c', text: "People in their 20s and 30s" },
      { key: 'd', text: 'Children only' },
    ],
    correctAnswer: 'c',
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
