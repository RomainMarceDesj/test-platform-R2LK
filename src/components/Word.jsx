/**
 * Word.jsx — Thesis Platform
 * ==========================
 * Renders a single token from the tokenized text.
 * Compatible with both Group A (V3 narrow-down) and Group B (ClassicGloss).
 *
 * For Group A: handleSwipe(id) — RadicalSearchTray opens
 * For Group B: handleSwipe(id, event) — ClassicGloss popup opens at click coords
 *
 * showFurigana / showTranslation are only used by Group A after lazy load.
 * Group B never sets these — popup handles display separately.
 */

import React from 'react';

export default function Word(props) {
  if (props.type === 'word') {
    return (
      <span
        onClick={(e) => {
          props.handleSwipe(props.id, e);
        }}
        style={{ color: 'inherit', cursor: 'pointer', pointerEvents: 'auto' }}
        className={props.isHighlighted ? 'word-highlighted' : ''}
      >
        {props.showFurigana && !props.showTranslation ? (
          <ruby>
            {props.kanji}
            <rt style={{ color: 'inherit' }}>{props.furigana}</rt>
          </ruby>
        ) : props.showFurigana && props.showTranslation ? (
          <ruby>
            {props.kanji}
            <rt style={{ color: 'inherit' }}>{props.furigana}、{props.translation}</rt>
          </ruby>
        ) : (
          props.kanji
        )}
      </span>
    );
  }

  if (props.type === 'kana_word') {
    return <span>{props.kanji}</span>;
  }

  return <span>{props.value}</span>;
}
