/**
 * KanjiTestPage.jsx — UNIFIED 10-QUESTION TEST
 * =============================================
 * Phase structure (in order):
 *   1-3  Strict radical (Option A)        — meaning + sentence context, blanked kanji, large distractor pool
 *   4-6  Soft radical (Idea C)            — same 3 words as 1-3, no kanji shown, small pre-populated list
 *   7-8  Reading & Meaning                — different words, MC selectors
 *   9-10 Transfer (novel kanji)           — 紹 then 拊, kanji visible, decompose
 *
 * All display strings come from hardcoded fields in studyConfig.js
 * (postTestHeader, testDisplayLine, EN_SENTENCE_CONTEXT, TRANSFER_KANJI).
 */

import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import RadicalSelector from '../components/RadicalSelector';
import {
  TARGET_KANJI,
  NON_TARGET_RADICAL_WORDS,
  WORD_PRIORITY_ORDER,
  IN_TEXT_RADICALS,
  IN_TEXT_RADICALS_META,
  EN_SENTENCE_CONTEXT,
  TRANSFER_KANJI,
  API_BASE,
} from '../config/studyConfig';

// ── Helpers ───────────────────────────────────────────────────────────────────

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function configFor(word) {
  return TARGET_KANJI[word] ?? NON_TARGET_RADICAL_WORDS?.[word] ?? null;
}
// Render testDisplayLine with the placeholder 'O' in bold, kanji in normal weight.
// Input: 'O容 (ないよう, content, substance)'
// Output: <span>O</span> bolded, the rest normal.
function renderDisplayLine(line) {
  if (!line) return null;
  // Split on the literal 'O' placeholder — there's only ever one per line.
  const idx = line.indexOf('O');
  if (idx === -1) return line;
  return (
    <>
      {line.slice(0, idx)}
      <span style={{ fontWeight: 700, color: 'var(--accent)', fontSize: '1.1em' }}>O</span>
      {line.slice(idx + 1)}
    </>
  );
}


function buildMcOptions(correct, pool, getVal, count = 3) {
  const seen = new Set([correct]);
  const distractors = [];
  const candidates = shuffle(pool.filter(w => TARGET_KANJI[w]));
  for (const w of candidates) {
    if (distractors.length >= count) break;
    const val = getVal(TARGET_KANJI[w]);
    if (val && !seen.has(val)) {
      seen.add(val);
      distractors.push(val);
    }
  }
  return shuffle([correct, ...distractors]);
}

// Pick N distractor radicals with full metadata (radical, stroke_count, english).
// Uses IN_TEXT_RADICALS_META so distractors always have correct stroke_count for grouping.
function pickDistractors(correctRadicals, searchableComponents, count) {
  const exclude = new Set([
    ...correctRadicals,
    ...(searchableComponents ?? []),
  ]);
  const inTextPool = IN_TEXT_RADICALS_META.filter(r => !exclude.has(r.radical));
  const shuffled = shuffle(inTextPool);
  return shuffled.slice(0, count).map(r => ({
    radical: r.radical,
    stroke_count: r.stroke_count,
    primary_english: r.primary_english,
    english_names: [r.primary_english],
  }));
}

// ── Pool building ─────────────────────────────────────────────────────────────

function buildTestItems(glossLog, midQuizWord) {
  const glossedSet = new Set(
    (glossLog ?? []).map(e => e.word).filter(w => w !== midQuizWord)
  );

  const ordered = WORD_PRIORITY_ORDER.filter(item => glossedSet.has(item.word));

  // Target words (in TARGET_KANJI) are primary. Non-target words from
  // NON_TARGET_RADICAL_WORDS or other glossed words act as fallback when
  // the target pool runs short. Each item is tagged with is_target so the
  // analysis can filter accordingly.
  const isTargetWord = (w) => !!TARGET_KANJI[w];

  const targetRadicals  = ordered.filter(i => i.type === 'radical' && isTargetWord(i.word));
  const targetRM        = ordered.filter(i => i.type === 'reading_meaning' && isTargetWord(i.word));
  const fallbackRadicals = ordered.filter(i => i.type === 'radical' && !isTargetWord(i.word));
  const fallbackRM       = ordered.filter(i => i.type === 'reading_meaning' && !isTargetWord(i.word));

  // Target distribution: 3 radical words + 2 RM words = 5 total
  // Fill from target pool first, then fall back to non-target words if needed.
  const radicalWords = [
    ...targetRadicals.slice(0, 3),
    ...fallbackRadicals.slice(0, Math.max(0, 3 - targetRadicals.length)),
  ];
  const rmWords = [
    ...targetRM.slice(0, 2),
    ...fallbackRM.slice(0, Math.max(0, 2 - targetRM.length)),
  ];

  console.log('[BUILD-TEST] glossed words:', [...glossedSet]);
  console.log('[BUILD-TEST] ordered:', ordered.map(o => `${o.word}(${o.type})`));
  console.log('[BUILD-TEST] mid-quiz word excluded:', midQuizWord);
  console.log('[BUILD-TEST] target radicals:', targetRadicals.map(w => w.word));
  console.log('[BUILD-TEST] fallback radicals (non-target):', fallbackRadicals.map(w => w.word));
  console.log('[BUILD-TEST] radical words selected:', radicalWords.map(w => `${w.word}${isTargetWord(w.word) ? '' : '*fallback'}`));
  console.log('[BUILD-TEST] reading_meaning words selected:', rmWords.map(w => `${w.word}${isTargetWord(w.word) ? '' : '*fallback'}`));

  const items = [];

  // 1-3: Strict on radicalWords
  radicalWords.forEach(item => items.push({
    phase: 'strict_radical',
    word: item.word,
    config: configFor(item.word),
    is_target: isTargetWord(item.word),
  }));

  // 4-6: Soft on the same words (different format)
  radicalWords.forEach(item => items.push({
    phase: 'soft_radical',
    word: item.word,
    config: configFor(item.word),
    is_target: isTargetWord(item.word),
  }));

  // 7-8: Reading + Meaning on different words
  rmWords.forEach(item => items.push({
    phase: 'reading_meaning',
    word: item.word,
    config: configFor(item.word),
    is_target: isTargetWord(item.word),
  }));

  // 9-10: Transfer (always present, regardless of glossing)
  TRANSFER_KANJI.forEach(t => items.push({
    phase: 'transfer',
    word: t.kanji,
    transfer: t,
  }));

  return items;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STRICT RADICAL — meaning + sentence cue, blanked kanji, 6 distractors
// ═══════════════════════════════════════════════════════════════════════════════

function StrictRadicalQ({ word, config, onAnswer }) {
  const targetChar = config?.testKanji ?? word[0];
  const [radicals, setRadicals]       = useState([]);
  const [correctDirect, setCorrectDirect]     = useState([]);
  const [correctIndirect, setCorrectIndirect] = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const breakdownRes = await axios.post(`${API_BASE}/api/radicals/for-kanji`, { word: targetChar });
        const breakdown    = breakdownRes.data?.[0];
        const directRads   = breakdown?.radicals ?? [];
        const directChars  = directRads.map(r => r.radical);
        const searchable   = breakdown?.searchable_components ?? directChars;

        // Build stroke_count lookup from hardcoded metadata
        const strokeMap = Object.fromEntries(IN_TEXT_RADICALS_META.map(r => [r.radical, r.stroke_count]));

        // 6 distractor radicals — full metadata from hardcoded list
        const enrichedDistractors = pickDistractors(directChars, searchable, 6);

        const allCandidates = [
          ...directRads.map(r => ({
            ...r,
            is_direct: true,
            stroke_count: strokeMap[r.radical] ?? r.stroke_count ?? 99,
          })),
          ...enrichedDistractors.map(r => ({ ...r, is_direct: false })),
        ];

        setRadicals(shuffle(allCandidates));
        setCorrectDirect(directChars);
        setCorrectIndirect([]); // strict test has no "indirect" — only correct or wrong
      } catch (e) {
        console.error('StrictRadicalQ load failed:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [targetChar]); // eslint-disable-line

  const handleSubmit = ({ selected, used_search, search_queries, time_to_submit_ms, free_text_radicals }) => {
    const selectedSet  = new Set(selected);
    const directSet    = new Set(correctDirect);
    const directCorrect = correctDirect.filter(r => selectedSet.has(r));
    const directMissed  = correctDirect.filter(r => !selectedSet.has(r));
    const wrongSelected = selected.filter(r => !directSet.has(r));
    const totalDirect   = correctDirect.length || 1;
    const directScore   = directCorrect.length / totalDirect;
    const totalScore    = Math.max(0, Math.min(1,
      (directCorrect.length - wrongSelected.length * 0.25) / totalDirect
    ));
    const noData = !correctDirect.length;

    onAnswer({
      word,
      question_type:    'strict_radical',
      target_kanji:     targetChar,
      blank_display:    config?.blankDisplay ?? 'O',
      selected_radicals: selected,
      correct_radicals:  correctDirect,
      directCorrect, directMissed, wrongSelected,
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
        <h2 style={{ fontSize: '1.1rem', lineHeight: 1.4 }}>
          {config?.postTestHeader
            ?? `What radicals did you remember in the kanji for "${config?.radicalKanjiMeaning ?? word}"`}
        </h2>
        <div style={{ fontFamily: 'var(--font-jp)', fontSize: '1.05rem', color: 'var(--ink-muted)' }}>
          in <span style={{ fontWeight: 400 }}>
            {renderDisplayLine(config?.testDisplayLine ?? config?.blankDisplay ?? word)}
          </span>
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--ink-faint)', lineHeight: 1.5, marginTop: '0.2rem' }}>
          The bold <strong style={{ color: 'var(--accent)' }}>O</strong> is the kanji you should remember the radicals of — not the other characters.
        </p>
        {EN_SENTENCE_CONTEXT[word] && (
          <p style={{ fontSize: '0.78rem', color: 'var(--ink-faint)', fontStyle: 'italic', lineHeight: 1.5 }}>
            ({EN_SENTENCE_CONTEXT[word]})
          </p>
        )}
      </div>
      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--ink-faint)', padding: '1rem' }}>Loading…</p>
      ) : (
        <RadicalSelector candidateRadicals={radicals} onSubmit={handleSubmit} submitLabel="Next →" maxSelections={5} />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SOFT RADICAL — no kanji shown, pre-populated list with 2 distractors, remove the wrong ones
// ═══════════════════════════════════════════════════════════════════════════════

function SoftRadicalQ({ word, config, onAnswer }) {
  const targetChar = config?.testKanji ?? word[0];
  const [items, setItems] = useState([]); // {radical, english_names, is_correct}
  const [keptSet, setKeptSet] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [startTs] = useState(Date.now());

  useEffect(() => {
    const load = async () => {
      try {
        const breakdownRes = await axios.post(`${API_BASE}/api/radicals/for-kanji`, { word: targetChar });
        const breakdown   = breakdownRes.data?.[0];
        const directRads  = breakdown?.radicals ?? [];
        const directChars = directRads.map(r => r.radical);
        const searchable  = breakdown?.searchable_components ?? directChars;

        const strokeMap = Object.fromEntries(IN_TEXT_RADICALS_META.map(r => [r.radical, r.stroke_count]));

        // 2 distractors only for soft test
        const enrichedDistractors = pickDistractors(directChars, searchable, 2);

        const all = shuffle([
          ...directRads.map(r => ({
            ...r,
            is_correct: true,
            stroke_count: strokeMap[r.radical] ?? r.stroke_count ?? 99,
          })),
          ...enrichedDistractors.map(r => ({ ...r, is_correct: false })),
        ]);

        setItems(all);
        setKeptSet(new Set(all.map(x => x.radical))); // start with all kept, user removes
      } catch (e) {
        console.error('SoftRadicalQ load failed:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [targetChar]);

  const [idkSelected, setIdkSelected] = useState(false);

  const removedCount = items.length - keptSet.size;

  const toggleItem = (r) => {
    setKeptSet(prev => {
      const next = new Set(prev);
      if (next.has(r)) {
        // Trying to remove — only allowed if under the cap of 2
        if (removedCount >= 2) return prev;
        next.delete(r);
      } else {
        next.add(r);
      }
      return next;
    });
  };

  const handleSubmit = () => {
    const correctRadicals = items.filter(i => i.is_correct).map(i => i.radical);
    const distractorRadicals = items.filter(i => !i.is_correct).map(i => i.radical);
    const correctlyKept = correctRadicals.filter(r => keptSet.has(r));
    const incorrectlyRemoved = correctRadicals.filter(r => !keptSet.has(r));
    const correctlyRemoved = distractorRadicals.filter(r => !keptSet.has(r));
    const incorrectlyKept = distractorRadicals.filter(r => keptSet.has(r));

    const totalCorrect = correctRadicals.length || 1;
    const totalDistractors = distractorRadicals.length || 1;
    const score = (correctlyKept.length / totalCorrect + correctlyRemoved.length / totalDistractors) / 2;

    onAnswer({
      word,
      question_type: 'soft_radical',
      target_kanji:  targetChar,
      kept_radicals:    [...keptSet],
      correct_radicals: correctRadicals,
      distractor_radicals: distractorRadicals,
      correctlyKept, incorrectlyRemoved, correctlyRemoved, incorrectlyKept,
      idk_selected: idkSelected,
      score: idkSelected ? null : score,
      time_to_submit_ms: Date.now() - startTs,
    });
  };

  if (loading) {
    return <p style={{ textAlign: 'center', color: 'var(--ink-faint)', padding: '1rem' }}>Loading…</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <h2 style={{ fontSize: '1.05rem', lineHeight: 1.4 }}>
          From this list, remove any radicals that were NOT in the kanji for{' '}
          <span style={{ color: 'var(--accent)', fontWeight: 600 }}>
            "{config?.radicalKanjiMeaning ?? config?.meaning ?? word}"
          </span>
        </h2>
        {config?.testDisplayLine && (
          <div style={{ fontFamily: 'var(--font-jp)', fontSize: '1.05rem', color: 'var(--ink-muted)' }}>
            in <span style={{ fontWeight: 400 }}>
              {renderDisplayLine(config.testDisplayLine)}
            </span>
          </div>
        )}
        <p style={{ fontSize: '0.78rem', color: 'var(--ink-faint)', lineHeight: 1.5 }}>
          The bold <strong style={{ color: 'var(--accent)' }}>O</strong> is the kanji you should think about — not the other characters.
        </p>
        {EN_SENTENCE_CONTEXT[word] && (
          <p style={{ fontSize: '0.78rem', color: 'var(--ink-faint)', fontStyle: 'italic', lineHeight: 1.5 }}>
            ({EN_SENTENCE_CONTEXT[word]})
          </p>
        )}
        <p style={{ fontSize: '0.78rem', color: 'var(--ink-faint)', marginTop: '0.3rem' }}>
          You can remove up to 2 radicals. Tap a radical to remove or restore it.
        </p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {items.map((it, i) => {
          const kept = keptSet.has(it.radical);
          const atCap = !kept ? false : removedCount >= 2; // can't remove more
          return (
            <button
              key={i}
              onClick={() => toggleItem(it.radical)}
              disabled={atCap}
              style={{
                padding: '0.5rem 0.75rem',
                border: '1.5px solid var(--paper-border)',
                borderRadius: 'var(--radius-md)',
                background: kept ? 'white' : 'var(--paper-warm)',
                opacity: kept ? (atCap ? 0.7 : 1) : 0.4,
                textDecoration: kept ? 'none' : 'line-through',
                cursor: atCap ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontFamily: 'var(--font-jp)', fontSize: '1.3rem' }}>{it.radical}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>
                {it.english_names?.[0] || it.primary_english || ''}
              </span>
            </button>
          );
        })}
      </div>

      <p style={{ fontSize: '0.78rem', color: 'var(--ink-faint)', textAlign: 'right' }}>
        Removed: {removedCount} / 2
      </p>

      <button
        onClick={() => setIdkSelected(prev => !prev)}
        style={{
          alignSelf: 'flex-start',
          padding: '0.4rem 0.8rem',
          fontSize: '0.8rem',
          background: idkSelected ? 'var(--paper-warm)' : 'transparent',
          border: idkSelected ? '1.5px solid var(--accent)' : '1px solid var(--paper-border)',
          borderRadius: 'var(--radius-md)',
          color: idkSelected ? 'var(--accent)' : 'var(--ink-faint)',
          cursor: 'pointer',
          fontStyle: 'italic',
        }}
      >
        {idkSelected ? '✓ ' : ''}I don't know which to remove
      </button>

      <button className="btn btn-primary btn-full" onClick={handleSubmit}>
        Next →
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// READING + MEANING (unchanged from previous version)
// ═══════════════════════════════════════════════════════════════════════════════

function ReadingMeaningQ({ word, config, allWords, onAnswer }) {
  const [readingIdx, setReadingIdx] = useState(null);
  const [meaningIdx, setMeaningIdx] = useState(null);

  const readingOptions = useMemo(() => {
    if (!config?.reading) return [];
    return [...buildMcOptions(config.reading, allWords, c => c.reading), "I don't know"];
  }, [word]); // eslint-disable-line

  const meaningOptions = useMemo(() => {
    if (!config?.meaning) return [];
    return [...buildMcOptions(config.meaning, allWords, c => c.meaning), "I don't know"];
  }, [word]); // eslint-disable-line

  const canSubmit = readingIdx !== null && meaningIdx !== null;

  const handleSubmit = () => {
    const readingAnswer = readingOptions[readingIdx] ?? null;
    const meaningAnswer = meaningOptions[meaningIdx] ?? null;
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

  if (!config?.reading || !config?.meaning) {
    return (
      <div style={{ textAlign: 'center', padding: '1rem' }}>
        <span style={{ fontFamily: 'var(--font-jp)', fontSize: '2.5rem' }}>{word}</span>
        <p style={{ marginTop: '1rem', color: 'var(--ink-faint)' }}>No data available for this word.</p>
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

      <div>
        <p style={{ fontSize: '0.82rem', color: 'var(--ink-faint)', marginBottom: '0.5rem' }}>Select the correct reading:</p>
        <div className="mc-options">
          {readingOptions.map((opt, i) => (
            <button key={i}
              className={`mc-option ${readingIdx === i ? 'selected' : ''}`}
              onClick={() => setReadingIdx(i)}>
              <span className="mc-key">{opt === "I don't know" ? '?' : String.fromCharCode(65 + i)}</span>
              <span style={{
                fontFamily: /[\u3000-\u9FFF]/.test(opt) ? 'var(--font-jp)' : 'inherit',
                fontSize: '0.95rem',
                fontStyle: opt === "I don't know" ? 'italic' : 'normal',
                opacity: opt === "I don't know" ? 0.7 : 1,
              }}>{opt}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p style={{ fontSize: '0.82rem', color: 'var(--ink-faint)', marginBottom: '0.5rem' }}>Select the correct meaning:</p>
        <div className="mc-options">
          {meaningOptions.map((opt, i) => (
            <button key={i}
              className={`mc-option ${meaningIdx === i ? 'selected' : ''}`}
              onClick={() => setMeaningIdx(i)}>
              <span className="mc-key">{opt === "I don't know" ? '?' : String.fromCharCode(65 + i)}</span>
              <span style={{
                fontSize: '0.95rem',
                fontStyle: opt === "I don't know" ? 'italic' : 'normal',
                opacity: opt === "I don't know" ? 0.7 : 1,
              }}>{opt}</span>
            </button>
          ))}
        </div>
      </div>

      <button className="btn btn-primary btn-full" onClick={handleSubmit} disabled={!canSubmit}>
        {canSubmit ? 'Next →' : 'Answer both questions to continue'}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TRANSFER — kanji visible, participants retrieve radicals via search (no chips)
// ═══════════════════════════════════════════════════════════════════════════════

function TransferQ({ transfer, onAnswer }) {
  const { kanji, correctRadicals } = transfer;
  const slotCount = correctRadicals.length;

  // Each slot holds either { radical, english_names, primary_english } or null or 'idk'
  const [slots, setSlots]       = useState(Array(slotCount).fill(null));
  const [activeSlot, setActiveSlot] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [startTs] = useState(Date.now());
  const [searchHistory, setSearchHistory] = useState([]);
  const searchInputRef = React.useRef(null);

  // Debounced search — requires ≥2 characters to avoid flooding with single-letter matches
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await axios.post(`${API_BASE}/api/radicals/search`, { query: q });
        setSearchResults(res.data ?? []);
        setSearchHistory(prev => [...prev, q]);
      } catch (e) {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const placeRadical = (rad) => {
    if (activeSlot === null) return;
    setSlots(prev => {
      const next = [...prev];
      next[activeSlot] = rad;
      return next;
    });
    setSearchQuery('');
    setSearchResults([]);
    // Auto-advance to next empty slot
    const nextEmpty = slots.findIndex((s, i) => i !== activeSlot && s === null);
    if (nextEmpty >= 0) setActiveSlot(nextEmpty);
  };

  const clearSlot = (idx) => {
    setSlots(prev => {
      const next = [...prev];
      next[idx] = null;
      return next;
    });
    setActiveSlot(idx);
  };

  const setSlotIDK = (idx) => {
    setSlots(prev => {
      const next = [...prev];
      next[idx] = 'idk';
      return next;
    });
    const nextEmpty = slots.findIndex((s, i) => i !== idx && s === null);
    if (nextEmpty >= 0) setActiveSlot(nextEmpty);
  };

  const allSlotsFilled = slots.every(s => s !== null);

  const handleSubmit = () => {
    const answeredRadicals = slots.map(s => (s === 'idk' ? 'i_dont_know' : s?.radical ?? null));
    const correctSet = new Set(correctRadicals);
    const placedSet  = new Set(answeredRadicals.filter(r => r && r !== 'i_dont_know'));
    const partialMap = transfer.partialComponents ?? {};

    const correctSelected = correctRadicals.filter(r => placedSet.has(r));
    const correctMissed   = correctRadicals.filter(r => !placedSet.has(r));

    // Partial credit: placed components that aren't direct radicals but contain
    // some correct radicals as sub-components (e.g. 召 covers 刀+口 for 紹)
    const partialCredits = []; // [{ placed, covers: [radicals] }]
    const wrongSelected = [];
    for (const placed of placedSet) {
      if (correctSet.has(placed)) continue; // already in correctSelected
      if (partialMap[placed]) {
        partialCredits.push({ placed, covers: partialMap[placed] });
      } else {
        wrongSelected.push(placed);
      }
    }

    // Add radicals covered by partial placements to "covered" set
    const coveredByPartial = new Set();
    for (const pc of partialCredits) {
      for (const r of pc.covers) coveredByPartial.add(r);
    }
    // Subtract from missed: a radical that's missed but covered by a partial counts as covered
    const trulyMissed = correctMissed.filter(r => !coveredByPartial.has(r));
    const partiallyCovered = correctMissed.filter(r => coveredByPartial.has(r));

    const idkCount = answeredRadicals.filter(r => r === 'i_dont_know').length;
    const total    = correctRadicals.length || 1;

    // direct_score: only counts exact-match radicals as full credit
    const directScore = correctSelected.length / total;
    // total_score: includes partial credit (0.5 per radical covered by a partial component)
    const partialPoints = partiallyCovered.length * 0.5;
    const totalScore = Math.max(0, Math.min(1,
      (correctSelected.length + partialPoints - wrongSelected.length * 0.25) / total
    ));

    onAnswer({
      word: kanji,
      question_type: 'transfer',
      transfer_kanji: kanji,
      slots_answered: answeredRadicals,
      correct_radicals: correctRadicals,
      correctSelected,
      correctMissed: trulyMissed,
      partiallyCovered,        // radicals not directly placed but covered by a partial component
      partialCredits,          // [{ placed: '召', covers: ['刀','口'] }, ...]
      wrongSelected,
      idk_count: idkCount,
      direct_score: directScore,
      total_score:  totalScore,
      search_history: searchHistory,
      time_to_submit_ms: Date.now() - startTs,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* Kanji display */}
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', marginBottom: '0.4rem' }}>
          New kanji — you may not have seen this one before
        </p>
        <span style={{ fontFamily: 'var(--font-jp)', fontSize: '4rem', fontWeight: 500 }}>{kanji}</span>
        <h2 style={{ fontSize: '1rem', marginTop: '0.6rem', lineHeight: 1.4 }}>
          Find the {slotCount} radicals that make up this kanji
        </h2>
        <p style={{ fontSize: '0.78rem', color: 'var(--ink-faint)', fontStyle: 'italic', marginTop: '0.3rem' }}>
          Search by name (e.g. "water", "tree", "mouth")
        </p>
      </div>

      {/* Slots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        {slots.map((slot, i) => {
          const isActive = activeSlot === i;
          const isFilled = slot !== null;
          const isIDK    = slot === 'idk';
          return (
            <div
              key={i}
              onClick={() => {
                if (isFilled) {
                  clearSlot(i);
                } else {
                  setActiveSlot(i);
                  // Focus the search input on the next tick so the keyboard pops on mobile
                  setTimeout(() => searchInputRef.current?.focus(), 0);
                }
              }}
              style={{
                width: '70px',
                height: '70px',
                border: isActive ? '2px solid var(--accent)' : '1.5px dashed var(--paper-border)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                background: isFilled ? (isIDK ? 'var(--paper-warm)' : 'white') : 'transparent',
                position: 'relative',
              }}
            >
              {isFilled ? (
                isIDK ? (
                  <span style={{ fontSize: '0.7rem', color: 'var(--ink-faint)', fontStyle: 'italic' }}>?</span>
                ) : (
                  <>
                    <span style={{ fontFamily: 'var(--font-jp)', fontSize: '1.5rem' }}>{slot.radical}</span>
                    <span style={{ fontSize: '0.6rem', color: 'var(--ink-muted)' }}>
                      {slot.english_names?.[0] ?? slot.primary_english ?? ''}
                    </span>
                  </>
                )
              ) : (
                <span style={{ fontSize: '0.85rem', color: 'var(--ink-faint)' }}>+</span>
              )}
              {isFilled && (
                <span style={{
                  position: 'absolute', top: '-6px', right: '-6px',
                  background: 'var(--ink-faint)', color: 'white',
                  borderRadius: '50%', width: '16px', height: '16px',
                  fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>✕</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Search input — only show when an active slot is empty */}
      {activeSlot !== null && slots[activeSlot] === null && (
        <>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search radicals (e.g., 'water', 'tree')…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }}
            autoFocus
            style={{
              padding: '0.7rem 0.9rem',
              border: '1.5px solid var(--paper-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.95rem',
              outline: 'none',
            }}
          />

          {/* Search results */}
          {searchQuery.trim().length === 1 && (
            <p style={{ textAlign: 'center', color: 'var(--ink-faint)', fontSize: '0.8rem', fontStyle: 'italic' }}>
              Keep typing — at least 2 letters needed
            </p>
          )}
          {isSearching && <p style={{ textAlign: 'center', color: 'var(--ink-faint)', fontSize: '0.85rem' }}>Searching…</p>}
          {searchResults.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {searchResults.map((r, i) => (
                <button
                  key={i}
                  onClick={() => placeRadical(r)}
                  style={{
                    padding: '0.4rem 0.7rem',
                    border: '1.5px solid var(--paper-border)',
                    borderRadius: 'var(--radius-md)',
                    background: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-jp)', fontSize: '1.2rem' }}>{r.radical}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>
                    {r.english_names?.[0] ?? r.primary_english ?? ''}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* I don't know option */}
          <button
            onClick={() => setSlotIDK(activeSlot)}
            style={{
              alignSelf: 'flex-start',
              padding: '0.4rem 0.8rem',
              fontSize: '0.8rem',
              background: 'transparent',
              border: '1px solid var(--paper-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--ink-faint)',
              cursor: 'pointer',
              fontStyle: 'italic',
            }}
          >
            I don't know — leave this slot blank
          </button>
        </>
      )}

      <button
        className="btn btn-primary btn-full"
        onClick={handleSubmit}
        disabled={!allSlotsFilled}
        style={{ marginTop: '0.5rem' }}
      >
        {allSlotsFilled ? 'Next →' : `Fill all ${slotCount} slots to continue`}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════

export default function KanjiTestPage({ participant, session, onComplete }) {
  const { glossLog } = session;

  const testItems = useMemo(
    () => buildTestItems(glossLog, session.midQuizWord),
    []
  ); // eslint-disable-line

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
          <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => onComplete([])}>
            Continue →
          </button>
        </div>
      </div>
    );
  }

  const current = testItems[currentIdx];
  const allWords = Object.keys(TARGET_KANJI);

  const phaseLabel = {
    strict_radical:   'Radical recognition (with hint)',
    soft_radical:     'Radical recognition (remove distractors)',
    reading_meaning:  'Reading & meaning',
    transfer:         'New kanji — radical decomposition',
  }[current.phase] ?? '';

  return (
    <div className="page">
      <div className="page-inner animate-in">

        <div>
          <h3>Quiz — {currentIdx + 1} / {testItems.length}</h3>
          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem' }}>
            {testItems.map((item, i) => (
              <div key={i}
                className={`progress-dot ${i < currentIdx ? 'done' : i === currentIdx ? 'active' : ''}`}
                title={`${item.word} (${item.phase})`}
              />
            ))}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--ink-faint)', marginTop: '0.3rem' }}>
            {phaseLabel}
          </p>
        </div>

        <div className="card">
          {current.phase === 'strict_radical' && (
            <StrictRadicalQ key={`s${currentIdx}`} word={current.word} config={current.config}
              onAnswer={(r) => handleAnswer({ ...r, is_target: current.is_target })} />
          )}
          {current.phase === 'soft_radical' && (
            <SoftRadicalQ key={`o${currentIdx}`} word={current.word} config={current.config}
              onAnswer={(r) => handleAnswer({ ...r, is_target: current.is_target })} />
          )}
          {current.phase === 'reading_meaning' && (
            <ReadingMeaningQ key={`rm${currentIdx}`} word={current.word} config={current.config} allWords={allWords}
              onAnswer={(r) => handleAnswer({ ...r, is_target: current.is_target })} />
          )}
          {current.phase === 'transfer' && (
            <TransferQ key={`t${currentIdx}`} transfer={current.transfer}
              onAnswer={(r) => handleAnswer({ ...r, is_target: false, is_transfer: true })} />
          )}
        </div>

      </div>
    </div>
  );
}
