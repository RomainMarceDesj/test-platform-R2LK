/**
 * RadicalNoticingTest.jsx
 * =======================
 * Phase 4: Post-reading radical noticing test.
 * Same format as MidQuizPage. Up to 5 items from glossed target words,
 * ordered most recent → earliest (reverse gloss order).
 * The word tested in the mid-quiz is excluded.
 */

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import RadicalSelector from '../components/RadicalSelector';
import { API_BASE, TARGET_KANJI } from '../config/studyConfig';

// ── Sentence display (same as MidQuizPage) ────────────────────────────────────

function SentenceWithBlank({ sentence, fullWord, blankDisplay }) {
  if (!sentence || !fullWord) return null;
  const parts = sentence.split(new RegExp(`(${fullWord})`, 'g'));
  return (
    <span>
      {parts.map((part, i) =>
        part === fullWord
          ? <span key={i} style={{ color: 'var(--accent)', fontWeight: 500, fontFamily: 'var(--font-jp)' }}>
              {blankDisplay}
            </span>
          : <span key={i}>{part}</span>
      )}
    </span>
  );
}

// ── Scoring (shared logic) ────────────────────────────────────────────────────

function scoreResult(selected, correctDirect, correctIndirect) {
  const selectedSet  = new Set(selected);
  const directSet    = new Set(correctDirect);
  const indirectSet  = new Set(correctIndirect);

  const directCorrect   = correctDirect.filter(r => selectedSet.has(r));
  const directMissed    = correctDirect.filter(r => !selectedSet.has(r));
  const indirectCorrect = correctIndirect.filter(r => selectedSet.has(r));
  const wrongSelected   = selected.filter(r => !directSet.has(r) && !indirectSet.has(r));

  const totalDirect  = correctDirect.length || 1;
  const directScore  = directCorrect.length / totalDirect;
  const totalScore   = Math.max(0, Math.min(1,
    (directCorrect.length * 1.0 + indirectCorrect.length * 0.5 - wrongSelected.length * 0.25)
    / totalDirect
  ));

  return { directCorrect, directMissed, indirectCorrect, wrongSelected, directScore, totalScore };
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function RadicalNoticingTest({ participant, session, midQuizWord, onComplete }) {
  const { glossLog, wasGlossed } = session;

  // Build ordered item list: glossed targets first, fall back to any glossed words
  const orderedItems = (() => {
    const lastGlossIndex = {};
    const allGlossedWords = []; // every word glossed, in order

    for (const entry of (glossLog ?? [])) {
      lastGlossIndex[entry.word] = entry.gloss_index;
      if (!allGlossedWords.includes(entry.word)) {
        allGlossedWords.push(entry.word);
      }
    }

    // Primary pool: target kanji that were glossed (excluding mid-quiz word)
    const targetGlossed = Object.entries(wasGlossed ?? {})
      .filter(([w, glossed]) => glossed && w !== midQuizWord && w in TARGET_KANJI)
      .map(([w]) => w);

    // Fallback pool: any glossed word that isn't the mid-quiz word and has a kanji char
    const fallbackGlossed = allGlossedWords
      .filter(w => w !== midQuizWord && !targetGlossed.includes(w) && /[一-鿿]/.test(w));

    // Combine: targets first, then fallback, most recent first within each pool
    const combined = [...targetGlossed, ...fallbackGlossed];
    combined.sort((a, b) => (lastGlossIndex[b] ?? 0) - (lastGlossIndex[a] ?? 0));

    return combined.slice(0, 5);
  })();

  const [currentIdx, setCurrentIdx]   = useState(0);
  const [itemData, setItemData]        = useState(null);   // { radicals, correctDirect, correctIndirect, sentence }
  const [loadingItem, setLoadingItem]  = useState(true);
  const [results, setResults]          = useState([]);

  const currentWord   = orderedItems[currentIdx];
  const config        = currentWord ? TARGET_KANJI[currentWord] : null;
  const targetChar    = config?.testKanji ?? currentWord?.[0] ?? '';
  const otherKanji    = config?.otherKanji ?? null;

  // ── Load data for current item ────────────────────────────────────────────
  useEffect(() => {
    if (!currentWord) return;
    setLoadingItem(true);
    setItemData(null);

    const load = async () => {
      try {
        // For non-target words, fetch reading+meaning dynamically
        let dynamicReading = config?.reading ?? '';
        let dynamicMeaning = config?.meaning ?? '';
        let dynamicSentence = config?.exampleSentence ?? '';

        if (!config) {
          try {
            const infoRes = await axios.post(`${API_BASE}/get_word_info`, {
              word: currentWord,
              user_id: participant?.participantId ?? '',
              app_version: 'thesis',
            });
            dynamicReading = infoRes.data.furigana ?? '';
            dynamicMeaning = infoRes.data.translation ?? '';
          } catch (e) {
            console.error('RadicalNoticingTest: word info fetch failed', e);
          }
        }

        const [browseRes, breakdownRes] = await Promise.all([
          axios.post(`${API_BASE}/api/radicals/browse-filtered`, {
            target_kanji: targetChar,
            window_size: 2,
          }),
          axios.post(`${API_BASE}/api/radicals/for-kanji`, { word: targetChar }),
        ]);

        const breakdown = breakdownRes.data?.[0];
        const directSet = new Set(breakdown?.radicals?.map(r => r.radical) ?? []);

        const allCandidates = [];
        const seen = new Set();
        for (const group of browseRes.data?.groups ?? []) {
          for (const r of group.radicals) {
            if (!seen.has(r.radical)) {
              seen.add(r.radical);
              allCandidates.push({ ...r, is_direct: directSet.has(r.radical) });
            }
          }
        }

        setItemData({
          radicals:        allCandidates,
          correctDirect:   Array.from(directSet),
          correctIndirect: [],
          sentence:        dynamicSentence,
          reading:         dynamicReading,
          meaning:         dynamicMeaning,
          blankDisplay:    config?.blankDisplay ?? ('[–]' + (currentWord.slice(1) || '')),
          fullWord:        currentWord,
        });
      } catch (e) {
        console.error('RadicalNoticingTest item load failed:', e);
        setItemData({ radicals: [], correctDirect: [], correctIndirect: [], sentence: '', reading: '', meaning: '' });
      } finally {
        setLoadingItem(false);
      }
    };

    load();
  }, [currentWord, targetChar]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handle item submission ────────────────────────────────────────────────
  const handleItemSubmit = ({ selected, used_search, search_queries, time_to_submit_ms }) => {
    const scores = scoreResult(selected, itemData.correctDirect, itemData.correctIndirect);

    const itemResult = {
      word:             currentWord,
      target_kanji:     targetChar,
      other_kanji:      otherKanji,
      context_sentence: itemData.sentence,
      selected_radicals: selected,
      correct_radicals:  itemData.correctDirect,
      indirect_radicals: itemData.correctIndirect,
      ...scores,
      used_search,
      search_queries,
      time_to_submit_ms,
    };

    const newResults = [...results, itemResult];
    setResults(newResults);

    if (currentIdx + 1 < orderedItems.length) {
      setCurrentIdx(prev => prev + 1);
    } else {
      // Pass tested words list so KanjiTestPage can exclude them
      onComplete(newResults, orderedItems);
    }
  };

  // ── Edge case: nothing to test ────────────────────────────────────────────
  if (orderedItems.length === 0) {
    return (
      <div className="page">
        <div className="page-inner animate-in" style={{ textAlign: 'center', paddingTop: '4rem' }}>
          <h2>No words to test</h2>
          <p style={{ marginTop: '0.5rem' }}>
            No glossed words could be found for this test.
          </p>
          <button
            className="btn btn-primary"
            style={{ marginTop: '1.5rem' }}
            onClick={() => onComplete([])}
          >
            Continue →
          </button>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  const displayReading = config?.reading ?? itemData?.reading ?? '';
  const displayMeaning = config?.meaning ?? itemData?.meaning ?? '';

  const displayBlank = itemData?.blankDisplay ?? (config?.blankDisplay ?? '[–]');

  const compoundDisplay = (
    <span style={{ fontFamily: 'var(--font-jp)', fontSize: '1.1rem' }}>
      <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{displayBlank}</span>
      {' '}
      <span style={{ fontSize: '0.9rem', color: 'var(--ink-muted)' }}>
        ({displayReading}{displayReading && displayMeaning ? ', ' : ''}{displayMeaning})
      </span>
    </span>
  );

  return (
    <div className="page">
      <div className="page-inner animate-in">

        {/* Header */}
        <div>
          <h3>Radical noticing — {currentIdx + 1} / {orderedItems.length}</h3>
          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem' }}>
            {orderedItems.map((_, i) => (
              <div key={i} className={`progress-dot ${i < currentIdx ? 'done' : i === currentIdx ? 'active' : ''}`} />
            ))}
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Show nothing until itemData is fully loaded — prevents word flash */}
          {loadingItem ? (
            <p style={{ textAlign: 'center', color: 'var(--ink-faint)', padding: '2rem' }}>
              Loading…
            </p>
          ) : (
            <>
              {/* Question */}
              <div>
                <h2>
                  What radicals can you remember seeing in the kanji for{' '}
                  <span style={{ color: 'var(--accent)' }}>"{displayMeaning}"</span>
                </h2>
                <div style={{ marginTop: '0.5rem' }}>{compoundDisplay}</div>
              </div>

              {/* Sentence context */}
              {itemData?.sentence && (
                <div style={{
                  background: 'var(--paper-warm)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 1rem',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-jp)',
                  color: 'var(--ink-muted)',
                  lineHeight: 1.8,
                }}>
                  <SentenceWithBlank
                    sentence={itemData.sentence}
                    fullWord={itemData.fullWord ?? currentWord}
                    blankDisplay={itemData.blankDisplay ?? '[–]'}
                  />
                </div>
              )}

              <div className="divider" />

              <RadicalSelector
                candidateRadicals={itemData?.radicals ?? []}
                onSubmit={handleItemSubmit}
                submitLabel={
                  currentIdx + 1 < orderedItems.length
                    ? 'Next →'
                    : 'Continue to vocabulary test →'
                }
              />
            </>
          )}

        </div>
      </div>
    </div>
  );
}
