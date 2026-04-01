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
import { API_BASE, TARGET_KANJI } from '../config/studyConfig';

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

  // Static config from TARGET_KANJI (may be undefined for non-target words)
  const staticConfig = TARGET_KANJI[midQuizWord];

  // All display state — populated either from staticConfig or fetched dynamically
  const [targetChar, setTargetChar]     = useState(staticConfig?.testKanji ?? midQuizWord?.[0] ?? '');
  const [otherKanji, setOtherKanji]     = useState(staticConfig?.otherKanji ?? null);
  const [blankDisplay, setBlankDisplay] = useState(staticConfig?.blankDisplay ?? '');
  const [reading, setReading]           = useState(staticConfig?.reading ?? '');
  const [meaning, setMeaning]           = useState(staticConfig?.meaning ?? '');
  const [sentence, setSentence]         = useState(staticConfig?.exampleSentence ?? '');

  const [radicals, setRadicals]         = useState([]);
  const [correctDirect, setCorrectDirect]   = useState([]);
  const [correctIndirect, setCorrectIndirect] = useState([]);
  const [loading, setLoading]           = useState(true);

  // ── Load word info + radicals ─────────────────────────────────────────────
  useEffect(() => {
    if (!midQuizWord) { setLoading(false); return; }

    const load = async () => {
      try {
        const char = staticConfig?.testKanji ?? midQuizWord[0];

        // For non-target words, fetch reading+meaning dynamically
        if (!staticConfig) {
          try {
            const infoRes = await axios.post(`${API_BASE}/get_word_info`, {
              word: midQuizWord,
              user_id: participant?.participantId ?? '',
              app_version: 'thesis',
            });
            setReading(infoRes.data.furigana ?? '');
            setMeaning(infoRes.data.translation ?? '');
          } catch (e) {
            console.error('MidQuiz: word info fetch failed', e);
          }
          setTargetChar(char);
          const rest = midQuizWord.slice(1) || null;
          setOtherKanji(rest);
          // For unknown words, default to hiding first kanji
          setBlankDisplay('[–]' + (rest ?? ''));
        }

        // Fetch radical candidates (±5 window) and breakdown
        const [browseRes, breakdownRes] = await Promise.all([
          axios.post(`${API_BASE}/api/radicals/browse-filtered`, {
            target_kanji: char,
            window_size: 5,
          }),
          axios.post(`${API_BASE}/api/radicals/for-kanji`, {
            word: char,
          }),
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
        setCorrectIndirect(
          allCandidates.filter(r => !r.is_direct).map(r => r.radical)
        );

      } catch (e) {
        console.error('MidQuiz data load failed:', e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [midQuizWord]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const compoundDisplay = (
    <span style={{ fontFamily: 'var(--font-jp)', fontSize: '1.1rem' }}>
      <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{blankDisplay || '[–]'}</span>
      {' '}
      <span style={{ fontSize: '0.9rem', color: 'var(--ink-muted)' }}>
        ({reading}{reading && meaning ? ', ' : ''}{meaning})
      </span>
    </span>
  );

  return (
    <div className="quiz-overlay">
      <div className="quiz-panel animate-in">

        <div>
          <h3 style={{ marginBottom: '0.4rem' }}>Quick check</h3>
          <h2>
            What radicals can you remember seeing in the kanji for{' '}
            {meaning
              ? <span style={{ color: 'var(--accent)' }}>"{meaning}"</span>
              : <span style={{ fontFamily: 'var(--font-jp)', color: 'var(--accent)' }}>{midQuizWord}</span>
            }
          </h2>
          <div style={{ marginTop: '0.5rem' }}>{compoundDisplay}</div>
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
