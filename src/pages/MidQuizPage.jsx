/**
 * MidQuizPage.jsx
 * ===============
 * Mid-reading radical noticing quiz. Appears 2s after trigger word gloss closes.
 *
 * Sentence display: the full context sentence with the target kanji replaced by [–].
 * Format: [–]動 (かんどう, to be moved)
 *
 * Works for both TARGET_KANJI words (static config) and any other glossed word
 * (dynamic config fetched from backend).
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RadicalSelector from '../components/RadicalSelector';
import { API_BASE, TARGET_KANJI, NON_TARGET_RADICAL_WORDS } from '../config/studyConfig';

// ── Sentence display — replaces the target kanji char with [–] ───────────────

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

// ── Main ─────────────────────────────────────────────────────────────────────

export default function MidQuizPage({
  participant,
  session,
  midQuizWord: midQuizWordProp,
  onComplete,
}) {
  const midQuizWord = midQuizWordProp ?? session?.midQuizWord ?? '';

  // All display values derived directly from hardcoded config — no useState, no fetching
  const staticConfig   = TARGET_KANJI[midQuizWord] ?? NON_TARGET_RADICAL_WORDS?.[midQuizWord];
  const targetChar     = staticConfig?.testKanji   ?? midQuizWord?.[0] ?? '';
  const blankDisplay   = staticConfig?.blankDisplay ?? '';
  const reading        = staticConfig?.reading      ?? '';
  const meaning        = staticConfig?.radicalKanjiMeaning ?? staticConfig?.meaning ?? '';
  const sentence       = staticConfig?.exampleSentence ?? '';
  const testDisplayLine = staticConfig?.testDisplayLine ?? blankDisplay;
  const quizHeader     = staticConfig?.midQuizHeader
    ?? `What radicals did you notice in the kanji for "${meaning}"`;

  const [sentence2, setSentence2] = useState(sentence); // kept for dynamic fallback
  void setSentence2;

  const [radicals, setRadicals]         = useState([]);
  const [correctDirect, setCorrectDirect]   = useState([]);
  const [correctIndirect, setCorrectIndirect] = useState([]);
  const [loading, setLoading]           = useState(true);

  // ── Load radical candidates only (display values are hardcoded above) ────────
  useEffect(() => {
    if (!midQuizWord || !targetChar) { setLoading(false); return; }

    const load = async () => {
      try {
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
        setRadicals(allCandidates);
        setCorrectDirect(Array.from(directSet));
        setCorrectIndirect(allCandidates.filter(r => !r.is_direct).map(r => r.radical));
      } catch (e) {
        console.error('MidQuiz radical load failed:', e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [midQuizWord, targetChar]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Scoring ───────────────────────────────────────────────────────────────
  const scoreResult = (selected) => {
    const selectedSet = new Set(selected);
    const directSet   = new Set(correctDirect);
    const indirectSet = new Set(correctIndirect);

    const directCorrect   = correctDirect.filter(r => selectedSet.has(r));
    const directMissed    = correctDirect.filter(r => !selectedSet.has(r));
    const indirectCorrect = correctIndirect.filter(r => selectedSet.has(r));
    const wrongSelected   = selected.filter(r => !directSet.has(r) && !indirectSet.has(r));

    const totalDirect = correctDirect.length || 1;
    const directScore = directCorrect.length / totalDirect;
    const totalScore  = Math.max(0, Math.min(1,
      (directCorrect.length * 1.0 + indirectCorrect.length * 0.5 - wrongSelected.length * 0.25)
      / totalDirect
    ));

    return { directCorrect, directMissed, indirectCorrect, wrongSelected, directScore, totalScore };
  };

  const handleSubmit = ({ selected, used_search, search_queries, time_to_submit_ms }) => {
    const scores = scoreResult(selected);
    onComplete({
      trigger_word:      midQuizWord,
      target_kanji:      targetChar,
      context_sentence:  sentence,
      selected_radicals: selected,
      correct_radicals:  correctDirect,
      indirect_radicals: correctIndirect,
      ...scores,
      used_search,
      search_queries,
      time_to_submit_ms,
    });
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (!midQuizWord) {
    return (
      <div className="quiz-overlay">
        <div className="quiz-panel">
          <p style={{ color: 'var(--ink-faint)', textAlign: 'center' }}>Loading quiz…</p>
        </div>
      </div>
    );
  }

  // compoundDisplay replaced by hardcoded testDisplayLine

  return (
    <div className="quiz-overlay">
      <div className="quiz-panel animate-in">

        <div>
          <h3 style={{ marginBottom: '0.4rem' }}>Quick check</h3>
          <h2>{quizHeader}</h2>
          <div style={{ marginTop: '0.5rem', fontFamily: 'var(--font-jp)', fontSize: '1.05rem', color: 'var(--ink-muted)' }}>
            in <span style={{ fontWeight: 400 }}>{renderDisplayLine(testDisplayLine)}</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--ink-faint)', lineHeight: 1.5, marginTop: '0.4rem' }}>
            The bold <strong style={{ color: 'var(--accent)' }}>O</strong> is the kanji you should remember the radicals of — not the other characters.
          </p>
        </div>

        {/* Sentence context */}
        {sentence && (
          <div style={{
            background: 'var(--paper-warm)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            fontSize: '0.9rem',
            fontFamily: 'var(--font-jp)',
            color: 'var(--ink-muted)',
            lineHeight: 1.9,
          }}>
            <SentenceWithBlank
              sentence={sentence}
              fullWord={midQuizWord}
              blankDisplay={blankDisplay}
            />
          </div>
        )}

        <div className="divider" />

        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--ink-faint)', padding: '1rem' }}>
            Loading…
          </p>
        ) : (
          <RadicalSelector
            candidateRadicals={radicals}
            onSubmit={handleSubmit}
            submitLabel="Submit & continue reading →"
          />
        )}

      </div>
    </div>
  );
}
