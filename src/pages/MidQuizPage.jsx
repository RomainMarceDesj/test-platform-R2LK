/**
 * MidQuizPage.jsx
 * ===============
 * Mid-reading radical noticing quiz. Appears 2s after trigger word gloss closes.
 * Shows sentence with target kanji replaced by [-]. Participant selects radicals.
 *
 * The sentence display format:
 *   [-]動 (*かん*どう, to be moved)
 *   Full sentence shown below in smaller text with the same replacement.
 *
 * On submit → calls onComplete(midQuizResult) → App returns to ReadingPage.
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RadicalSelector from '../components/RadicalSelector';
import { API_BASE, TARGET_KANJI } from '../config/studyConfig';

// ── Sentence renderer — replaces target kanji with [-] ───────────────────────

function SentenceWithBlank({ sentence, targetKanji, otherKanji }) {
  if (!sentence) return null;
  const parts = sentence.split(new RegExp(`(${targetKanji})`, 'g'));
  return (
    <span>
      {parts.map((part, i) =>
        part === targetKanji
          ? <span key={i} style={{
              display: 'inline-flex', alignItems: 'baseline', gap: '1px',
              color: 'var(--accent)', fontWeight: 500
            }}>
              <span style={{ letterSpacing: '-0.02em' }}>[–]</span>
              {otherKanji && <span>{otherKanji}</span>}
            </span>
          : <span key={i}>{part}</span>
      )}
    </span>
  );
}

export default function MidQuizPage({ participant, session, midQuizWord: midQuizWordProp, onComplete }) {
  // Accept as direct prop (preferred) or fall back to session field
  const midQuizWord = midQuizWordProp ?? session.midQuizWord;
  const config  = TARGET_KANJI[midQuizWord] ?? {};

  const [radicals, setRadicals]       = useState([]);
  const [correctRadicals, setCorrect] = useState({ direct: [], indirect: [] });
  const [sentence, setSentence]       = useState('');
  const [loading, setLoading]         = useState(true);

  // ── Fetch radical candidates ──────────────────────────────────────────────
  useEffect(() => {
    if (!midQuizWord) { setLoading(false); return; }

    const fetchData = async () => {
      try {
        // Get radical breakdown for the target kanji character
        const targetChar = config.testKanji ?? midQuizWord[0];

        const [browseRes, breakdownRes] = await Promise.all([
          // ±5 window around each direct + indirect radical
          axios.post(`${API_BASE}/api/radicals/browse-filtered`, {
            target_kanji: targetChar,
            window_size: 5,
          }),
          // Radical breakdown to know which are direct vs indirect
          axios.post(`${API_BASE}/api/radicals/for-kanji`, {
            word: targetChar,
          }),
        ]);

        // Build correct radical sets
        const breakdown = breakdownRes.data?.[0];
        const directSet   = new Set(breakdown?.radicals?.map(r => r.radical) ?? []);

        // Flatten all candidates from browse-filtered groups
        const allCandidates = [];
        const seen = new Set();
        for (const group of browseRes.data?.groups ?? []) {
          for (const r of group.radicals) {
            if (!seen.has(r.radical)) {
              seen.add(r.radical);
              allCandidates.push({
                ...r,
                is_direct: directSet.has(r.radical),
              });
            }
          }
        }

        setRadicals(allCandidates);
        setCorrect({
          direct:   Array.from(directSet),
          indirect: allCandidates
            .filter(r => !r.is_direct && r.radical !== targetChar)
            .map(r => r.radical),
        });

        // Build example sentence (the word appears in the text — we use a known sentence)
        // For now we use a hard-coded sentence template; replace with backend lookup if needed.
        setSentence(config.exampleSentence ?? '');
      } catch (e) {
        console.error('MidQuiz data load failed:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [midQuizWord]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Score calculation ─────────────────────────────────────────────────────
  const scoreResult = (selected) => {
    const selectedSet  = new Set(selected);
    const directSet    = new Set(correctRadicals.direct);
    const indirectSet  = new Set(correctRadicals.indirect);

    const directCorrect   = correctRadicals.direct.filter(r => selectedSet.has(r));
    const directMissed    = correctRadicals.direct.filter(r => !selectedSet.has(r));
    const indirectCorrect = correctRadicals.indirect.filter(r => selectedSet.has(r));
    const wrongSelected   = selected.filter(r => !directSet.has(r) && !indirectSet.has(r));

    const totalDirect  = correctRadicals.direct.length || 1;
    const directScore  = directCorrect.length / totalDirect;
    const totalScore   = Math.max(0, Math.min(1,
      (directCorrect.length * 1.0 + indirectCorrect.length * 0.5 - wrongSelected.length * 0.25)
      / totalDirect
    ));

    return { directCorrect, directMissed, indirectCorrect, wrongSelected, directScore, totalScore };
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = ({ selected, used_search, search_queries, time_to_submit_ms }) => {
    const scores = scoreResult(selected);
    onComplete({
      trigger_word:       midQuizWord,
      target_kanji:       config.testKanji ?? midQuizWord[0],
      context_sentence:   sentence,
      selected_radicals:  selected,
      correct_radicals:   correctRadicals.direct,
      indirect_radicals:  correctRadicals.indirect,
      ...scores,
      used_search,
      search_queries,
      time_to_submit_ms,
    });
  };

  // ── Render ────────────────────────────────────────────────────────────────
  const targetChar  = config.testKanji ?? (midQuizWord?.[0] ?? '');
  const otherKanji  = config.otherKanji;
  const reading     = config.reading ?? '';
  const meaning     = config.meaning ?? '';

  // Build the inline compound display: [-]動 (*かん*どう, to be moved)
  const compoundDisplay = (
    <span style={{ fontFamily: 'var(--font-jp)', fontSize: '1.1rem' }}>
      <span style={{ color: 'var(--accent)', fontWeight: 600 }}>[–]</span>
      {otherKanji && <span>{otherKanji}</span>}
      {' '}
      <span style={{ fontSize: '0.9rem', color: 'var(--ink-muted)' }}>
        (<em>{reading}</em>, {meaning})
      </span>
    </span>
  );

  return (
    <div className="quiz-overlay">
      <div className="quiz-panel animate-in">

        {/* Title */}
        <div>
          <h3 style={{ marginBottom: '0.4rem' }}>Quick check</h3>
          <h2>
            What radicals can you remember seeing in the kanji for{' '}
            <span style={{ color: 'var(--accent)' }}>"{meaning}"</span>
          </h2>
          <div style={{ marginTop: '0.5rem' }}>{compoundDisplay}</div>
        </div>

        {/* Sentence context */}
        {sentence && (
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
              sentence={sentence}
              targetKanji={targetChar}
              otherKanji={otherKanji}
            />
          </div>
        )}

        <div className="divider" />

        {/* Radical selector */}
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
