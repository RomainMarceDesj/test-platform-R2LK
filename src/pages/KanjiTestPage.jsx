/**
 * KanjiTestPage.jsx
 * =================
 * Phase 5: Post-reading kanji test.
 *
 * Question count: 6 if participant glossed ≤6 words, 8 if they glossed >6.
 * Pool: glossed words in WORD_PRIORITY_ORDER, excluding the mid-quiz word.
 * Type assignment: equal radical / reading+meaning split.
 *   - Assign preferred type from WORD_PRIORITY_ORDER
 *   - When one type bucket fills (N/2), force remaining words to the other type
 *   - If N is odd, last word gets its preferred type
 *
 * Question types:
 *   'radical'         — same RadicalSelector as the noticing test
 *   'reading_meaning' — one screen, two independent MC selectors (reading + meaning)
 */

import React, { useState, useMemo } from 'react';
import axios from 'axios';
import RadicalSelector from '../components/RadicalSelector';
import { TARGET_KANJI, NON_TARGET_RADICAL_WORDS, WORD_PRIORITY_ORDER, API_BASE } from '../config/studyConfig';

// ── Helpers ───────────────────────────────────────────────────────────────────

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function normaliseReading(s) {
  return s.trim().toLowerCase().replace(/\s+/g, '');
}

function buildMcOptions(correct, pool, getVal, count = 3) {
  const others = shuffle(pool.filter(w => w !== correct && TARGET_KANJI[w]));
  const distractors = others.slice(0, count).map(w => getVal(TARGET_KANJI[w]));
  return shuffle([correct, ...distractors]);
}

// ── Pool-building algorithm ───────────────────────────────────────────────────

function buildTestItems(glossLog, wasGlossed, midQuizWord) {
  // Collect glossed words in priority order, excluding mid-quiz word.
  // Type is fixed per word — no overrides, no balancing logic.
  const glossedSet = new Set(
    (glossLog ?? []).map(e => e.word).filter(w => w !== midQuizWord)
  );

  const items = WORD_PRIORITY_ORDER
    .filter(item => glossedSet.has(item.word))
    .slice(0, 8)
    .map(item => ({
      word: item.word,
      type: item.type,
      config: TARGET_KANJI[item.word] ?? NON_TARGET_RADICAL_WORDS?.[item.word] ?? null,
    }));

  return items;
}

// ── Reading+Meaning combined question ────────────────────────────────────────

function ReadingMeaningQ({ word, config, allWords, onAnswer }) {
  const [readingAnswer, setReadingAnswer] = useState(null);
  const [meaningAnswer, setMeaningAnswer] = useState(null);

  const readingOptions = useMemo(() => {
    if (!config?.reading) return [];
    return [...buildMcOptions(config.reading, allWords, c => c.reading), "I don't know"];
  }, [word]); // eslint-disable-line

  const meaningOptions = useMemo(() => {
    if (!config?.meaning) return [];
    return [...buildMcOptions(config.meaning, allWords, c => c.meaning), "I don't know"];
  }, [word]); // eslint-disable-line

  const canSubmit = readingAnswer !== null && meaningAnswer !== null;

  const handleSubmit = () => {
    onAnswer({
      word,
      question_type: 'reading_meaning',
      reading_given:      readingAnswer === "I don't know" ? 'i_dont_know' : readingAnswer,
      reading_correct:    config?.reading ?? null,
      reading_is_correct: readingAnswer === config?.reading,
      meaning_given:      meaningAnswer === "I don't know" ? 'i_dont_know' : meaningAnswer,
      meaning_correct:    config?.meaning ?? null,
      meaning_is_correct: meaningAnswer === config?.meaning,
      is_correct: readingAnswer === config?.reading && meaningAnswer === config?.meaning,
    });
  };

  if (!config) {
    return (
      <div style={{ textAlign: 'center', padding: '1rem' }}>
        <span style={{ fontFamily: 'var(--font-jp)', fontSize: '2.5rem' }}>{word}</span>
        <p style={{ marginTop: '1rem', color: 'var(--ink-faint)' }}>No data available.</p>
        <button className="btn btn-secondary" style={{ marginTop: '1rem' }}
          onClick={() => onAnswer({ word, question_type: 'reading_meaning', answer_given: 'no_data', is_correct: null, skipped: true })}>
          Skip →
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontFamily: 'var(--font-jp)', fontSize: '2.5rem', letterSpacing: '0.05em' }}>{word}</span>
      </div>

      {/* Reading */}
      <div>
        <p style={{ fontSize: '0.82rem', color: 'var(--ink-faint)', marginBottom: '0.5rem' }}>
          Select the correct reading:
        </p>
        <div className="mc-options">
          {readingOptions.map((opt, i) => (
            <button
              key={opt}
              className={`mc-option ${readingAnswer === opt ? 'selected' : ''}`}
              onClick={() => setReadingAnswer(opt)}
            >
              <span className="mc-key">
                {opt === "I don't know" ? '?' : String.fromCharCode(65 + i)}
              </span>
              <span style={{
                fontFamily: /[\u3000-\u9FFF]/.test(opt) ? 'var(--font-jp)' : 'inherit',
                fontSize: '0.95rem',
                fontStyle: opt === "I don't know" ? 'italic' : 'normal',
                opacity: opt === "I don't know" ? 0.7 : 1,
              }}>
                {opt}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Meaning */}
      <div>
        <p style={{ fontSize: '0.82rem', color: 'var(--ink-faint)', marginBottom: '0.5rem' }}>
          Select the correct meaning:
        </p>
        <div className="mc-options">
          {meaningOptions.map((opt, i) => (
            <button
              key={opt}
              className={`mc-option ${meaningAnswer === opt ? 'selected' : ''}`}
              onClick={() => setMeaningAnswer(opt)}
            >
              <span className="mc-key">
                {opt === "I don't know" ? '?' : String.fromCharCode(65 + i)}
              </span>
              <span style={{
                fontSize: '0.95rem',
                fontStyle: opt === "I don't know" ? 'italic' : 'normal',
                opacity: opt === "I don't know" ? 0.7 : 1,
              }}>
                {opt}
              </span>
            </button>
          ))}
        </div>
      </div>

      <button
        className="btn btn-primary btn-full"
        onClick={handleSubmit}
        disabled={!canSubmit}
      >
        {canSubmit ? 'Next →' : 'Answer both questions to continue'}
      </button>
    </div>
  );
}

// ── Radical question ──────────────────────────────────────────────────────────

function RadicalQ({ word, config, participant, onAnswer }) {
  const targetChar = config?.testKanji ?? word[0];
  const [radicals, setRadicals]       = useState([]);
  const [correctDirect, setCorrectDirect]     = useState([]);
  const [correctIndirect, setCorrectIndirect] = useState([]);
  const [loading, setLoading]         = useState(true);

  React.useEffect(() => {
    const load = async () => {
      try {
        const [browseRes, breakdownRes] = await Promise.all([
          axios.post(`${API_BASE}/api/radicals/browse-filtered`, { target_kanji: targetChar, window_size: 2 }),
          axios.post(`${API_BASE}/api/radicals/for-kanji`, { word: targetChar }),
        ]);
        const breakdown = breakdownRes.data?.[0];
        const directSet = new Set(breakdown?.radicals?.map(r => r.radical) ?? []);
        const allCandidates = [];
        const seen = new Set();
        for (const group of browseRes.data?.groups ?? []) {
          for (const r of group.radicals) {
            if (!seen.has(r.radical)) { seen.add(r.radical); allCandidates.push({ ...r, is_direct: directSet.has(r.radical) }); }
          }
        }
        setRadicals(allCandidates);
        setCorrectDirect(Array.from(directSet));
        setCorrectIndirect(allCandidates.filter(r => !r.is_direct).map(r => r.radical));
      } catch (e) {
        console.error('RadicalQ load failed:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [targetChar]); // eslint-disable-line

  const handleSubmit = ({ selected, used_search, search_queries, time_to_submit_ms, free_text_radicals }) => {
    const selectedSet = new Set(selected);
    const directSet   = new Set(correctDirect);
    const indirectSet = new Set(correctIndirect);
    const directCorrect   = correctDirect.filter(r => selectedSet.has(r));
    const directMissed    = correctDirect.filter(r => !selectedSet.has(r));
    const indirectCorrect = correctIndirect.filter(r => selectedSet.has(r));
    const wrongSelected   = selected.filter(r => !directSet.has(r) && !indirectSet.has(r));
    const totalDirect     = correctDirect.length || 1;
    const directScore     = directCorrect.length / totalDirect;
    const totalScore      = Math.max(0, Math.min(1,
      (directCorrect.length * 1.0 + indirectCorrect.length * 0.5 - wrongSelected.length * 0.25) / totalDirect
    ));
    const noData = !correctDirect.length;

    onAnswer({
      word,
      question_type:    'radical',
      target_kanji:     targetChar,
      other_kanji:      config?.otherKanji ?? null,
      blank_display:    config?.blankDisplay ?? '[–]',
      selected_radicals: selected,
      correct_radicals:  correctDirect,
      indirect_radicals: correctIndirect,
      directCorrect, directMissed, indirectCorrect, wrongSelected,
      direct_score: noData ? null : directScore,
      total_score:  noData ? null : totalScore,
      no_data: noData,
      used_search, search_queries, time_to_submit_ms,
      free_text_radicals: free_text_radicals ?? null,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {/* Hardcoded header — never derived dynamically */}
        <h2 style={{ fontSize: '1.1rem', lineHeight: 1.4 }}>
          {config?.postTestHeader ?? `What radicals did you remember in the kanji for "${config?.radicalKanjiMeaning ?? word}"`}
        </h2>
        <div style={{ fontFamily: 'var(--font-jp)', fontSize: '1rem', color: 'var(--ink-muted)' }}>
          in <span style={{ color: 'var(--accent)', fontWeight: 600 }}>
            {config?.testDisplayLine ?? config?.blankDisplay ?? word}
          </span>
        </div>
      </div>
      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--ink-faint)', padding: '1rem' }}>Loading…</p>
      ) : (
        <RadicalSelector
          candidateRadicals={radicals}
          onSubmit={handleSubmit}
          submitLabel="Next →"
        />
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function KanjiTestPage({ participant, session, onComplete }) {
  const { wasGlossed, glossLog } = session;

  const testItems = useMemo(() =>
    buildTestItems(glossLog, wasGlossed, session.midQuizWord),
  []); // eslint-disable-line

  const [currentIdx, setCurrentIdx] = useState(0);
  const [results, setResults]       = useState([]);

  const handleAnswer = (result) => {
    const newResults = [...results, result];
    setResults(newResults);
    if (currentIdx + 1 < testItems.length) {
      setCurrentIdx(prev => prev + 1);
    } else {
      onComplete(newResults);
    }
  };

  if (testItems.length === 0) {
    return (
      <div className="page">
        <div className="page-inner animate-in" style={{ textAlign: 'center', paddingTop: '4rem' }}>
          <h2>No words to test</h2>
          <p style={{ marginTop: '0.5rem' }}>No glossed words were found for this test.</p>
          <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => onComplete([])}>
            Continue →
          </button>
        </div>
      </div>
    );
  }

  const current = testItems[currentIdx];
  const config   = current.config ?? TARGET_KANJI[current.word] ?? NON_TARGET_RADICAL_WORDS?.[current.word] ?? null;
  const allWords = Object.keys(TARGET_KANJI);

  return (
    <div className="page">
      <div className="page-inner animate-in">

        <div>
          <h3>Vocabulary test — {currentIdx + 1} / {testItems.length}</h3>
          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem' }}>
            {testItems.map((item, i) => (
              <div
                key={i}
                className={`progress-dot ${i < currentIdx ? 'done' : i === currentIdx ? 'active' : ''}`}
                title={`${item.word} (${item.type})`}
              />
            ))}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--ink-faint)', marginTop: '0.3rem' }}>
            {current.type === 'radical' ? 'Radical recognition' : 'Reading & meaning'}
          </p>
        </div>

        <div className="card">
          {current.type === 'reading_meaning' ? (
            <ReadingMeaningQ
              key={`rm-${currentIdx}`}
              word={current.word}
              config={config}
              allWords={allWords}
              onAnswer={handleAnswer}
            />
          ) : (
            <RadicalQ
              key={`rad-${currentIdx}`}
              word={current.word}
              config={config}
              participant={participant}
              onAnswer={handleAnswer}
            />
          )}
        </div>

      </div>
    </div>
  );
}
