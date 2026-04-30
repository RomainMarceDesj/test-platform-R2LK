/**
 * PostTestKanjiTest.jsx
 * =====================
 * Replays session 1's kanji test items with the exact same word AND question type.
 * Then appends N "control" items: target kanji that were NOT glossed in session 1,
 * to give a within-participant baseline for any background knowledge growth.
 *
 * Reuses the existing KanjiTestPage logic by feeding it a synthetic
 * `forcedItems` prop with pre-decided (word, type) pairs and a control flag.
 *
 * Each result in the post-test output carries:
 *   control: true|false   — whether this was a control (un-glossed) item
 *   session_number: 2     — added at submit time in the questionnaire
 */

import React, { useEffect, useMemo } from 'react';
import {
  TARGET_KANJI,
  NON_TARGET_RADICAL_WORDS,
  POSTTEST_CONTROL_KANJI_COUNT,
} from '../config/studyConfig';
import KanjiTestPage from './KanjiTestPage';

// Picks N target kanji that the participant did NOT gloss in session 1.
// Returns objects matching the KanjiTestPage item shape.
// Session 1 question types are 'radical' or 'reading_meaning' — control items
// always use 'reading_meaning' since they were never engaged with at the
// radical level (a radical question on an un-glossed item is not meaningful).
function pickControlItems(wasGlossed, alreadyTested, n) {
  const taken = new Set(alreadyTested);
  const candidates = Object.keys(TARGET_KANJI).filter(
    w => !wasGlossed?.[w] && !taken.has(w)
  );
  // Deterministic order: take the first N as listed in TARGET_KANJI.
  // (Random order would reintroduce the kind of variance we're trying to avoid.)
  return candidates.slice(0, n).map(word => ({
    word,
    type: 'reading_meaning',
    config: TARGET_KANJI[word],
    control: true,
  }));
}

export default function PostTestKanjiTest({ participant, posttestData, onComplete }) {
  const session1Items = posttestData?.kanji_test_items ?? [];
  const wasGlossed    = posttestData?.was_glossed ?? {};

  // Build forced items: each session 1 kanji test item, in the same order,
  // with the same question type. Then append control items.
  const forcedItems = useMemo(() => {
    const replay = session1Items
      .filter(it => it.word && it.question_type)
      .map(it => ({
        word: it.word,
        type: it.question_type,
        config: TARGET_KANJI[it.word] ?? NON_TARGET_RADICAL_WORDS?.[it.word] ?? null,
        control: false,
      }));
    const replayWords = new Set(replay.map(it => it.word));
    const controls = pickControlItems(wasGlossed, replayWords, POSTTEST_CONTROL_KANJI_COUNT);
    return [...replay, ...controls];
    // eslint-disable-next-line
  }, []);

  // Edge case: nothing to test. Skip with empty results.
  const shouldSkip = forcedItems.length === 0;
  useEffect(() => {
    if (shouldSkip) onComplete([]);
    // eslint-disable-next-line
  }, [shouldSkip]);

  if (shouldSkip) {
    return (
      <div className="page">
        <div className="page-inner animate-in" style={{ textAlign: 'center', paddingTop: '4rem' }}>
          <h2>Skipping vocabulary test</h2>
          <p style={{ marginTop: '0.5rem' }}>No items from your first session to retest.</p>
        </div>
      </div>
    );
  }

  // Wrap onComplete to merge the `control` flag into each result by index.
  const handleComplete = (kanjiResults) => {
    const tagged = kanjiResults.map((res, i) => ({
      ...res,
      control: !!forcedItems[i]?.control,
    }));
    onComplete(tagged);
  };

  // Synthetic session — KanjiTestPage's default builder reads glossLog/wasGlossed
  // but in forced-items mode we bypass that path entirely.
  const syntheticSession = {
    glossLog: posttestData?.gloss_log ?? [],
    wasGlossed,
    midQuizWord: posttestData?.mid_quiz_word ?? null,
  };

  return (
    <KanjiTestPage
      participant={participant}
      session={syntheticSession}
      forcedItems={forcedItems}
      onComplete={handleComplete}
    />
  );
}
