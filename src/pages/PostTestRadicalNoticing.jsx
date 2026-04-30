/**
 * PostTestRadicalNoticing.jsx
 * ===========================
 * Replays session 1's radical noticing items, plus the mid-quiz word, in the
 * same order they were originally tested. Reuses the existing RadicalNoticingTest
 * component via its `forcedItems` override.
 *
 * Item composition for post-test:
 *   1. mid_quiz_word (if any) — included so nothing tested in session 1 is left out
 *   2. noticing_test_words from session 1 — in the same order as session 1
 *
 * If session 1 didn't complete and noticing_test_words is empty, we fall back
 * to rebuilding from glossLog the same way RadicalNoticingTest does — which
 * happens automatically by passing only midQuizWord and not forcedItems.
 */

import React, { useEffect, useMemo } from 'react';
import RadicalNoticingTest from './RadicalNoticingTest';

export default function PostTestRadicalNoticing({ participant, posttestData, onComplete }) {
  const noticingWords = posttestData?.noticing_test_words ?? [];
  const midQuizWord   = posttestData?.mid_quiz_word ?? null;
  const glossLog      = posttestData?.gloss_log ?? [];
  const wasGlossed    = posttestData?.was_glossed ?? {};

  // Build the forced item list:
  //   - Mid-quiz word first (if present and not already in noticing list)
  //   - Then session 1's noticing items in their original order
  const forcedItems = useMemo(() => {
    const list = [];
    if (midQuizWord && !noticingWords.includes(midQuizWord)) {
      list.push(midQuizWord);
    }
    for (const word of noticingWords) {
      if (!list.includes(word)) list.push(word);
    }
    return list;
    // eslint-disable-next-line
  }, []);

  // Edge case: nothing meaningful to test. Skip with empty results.
  // Use a top-level useEffect so hooks order stays stable.
  const shouldSkip = forcedItems.length === 0 && glossLog.length === 0;
  useEffect(() => {
    if (shouldSkip) onComplete([], []);
    // eslint-disable-next-line
  }, [shouldSkip]);

  if (shouldSkip) {
    return (
      <div className="page">
        <div className="page-inner animate-in" style={{ textAlign: 'center', paddingTop: '4rem' }}>
          <h2>Skipping radical test</h2>
          <p style={{ marginTop: '0.5rem' }}>No items from your first session to retest.</p>
        </div>
      </div>
    );
  }

  // Synthetic session for the underlying component — only needs glossLog and
  // wasGlossed for the fallback path. Pass posttestData's versions through.
  const syntheticSession = { glossLog, wasGlossed };

  // If forcedItems is non-empty we use it. Otherwise the underlying component
  // will rebuild the list from glossLog/wasGlossed using its standard algorithm
  // (handles partial-data session 1 gracefully).
  // Note: we don't pass midQuizWord to the underlying component when forcing
  // items, because we've already explicitly included it in forcedItems.
  return (
    <RadicalNoticingTest
      participant={participant}
      session={syntheticSession}
      midQuizWord={forcedItems.length > 0 ? null : midQuizWord}
      forcedItems={forcedItems.length > 0 ? forcedItems : undefined}
      onComplete={onComplete}
    />
  );
}
