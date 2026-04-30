/**
 * ClassicGloss.jsx — Thesis Platform
 * ====================================
 * Group B classic pop-up gloss component.
 * Copied from the provided ClassicGloss.jsx with one change:
 * the apiBase for /api/radicals/for-kanji is passed as a prop
 * rather than imported, matching the thesis platform's pattern.
 *
 * See original ClassicGloss.jsx for full documentation.
 */

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const POPUP_WIDTH  = 320;
const POPUP_MARGIN = 12;

function ClassicGloss({ word, position, onGloss, onDismiss, glossIndex, userId, appVersion, apiBase }) {
  const [wordInfo, setWordInfo]           = useState(null);
  const [kanjiBreakdown, setKanjiBreakdown] = useState([]);
  const [isLoading, setIsLoading]         = useState(true);
  const [fetchError, setFetchError]       = useState(false);
  const popupRef = useRef(null);

  // Fire onGloss and fetch data on mount
  useEffect(() => {
    onGloss({ word: word.kanji, timestamp: Date.now(), gloss_index: glossIndex });
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Dismiss on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) onDismiss();
    };
    const timeout = setTimeout(() => {
      document.addEventListener('mousedown', handleOutside);
      document.addEventListener('touchstart', handleOutside);
    }, 50);
    return () => {
      clearTimeout(timeout);
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, [onDismiss]);

  const fetchData = async () => {
    setIsLoading(true);
    setFetchError(false);

    try {
      const wordRes = await axios.post(`${apiBase}/get_word_info`, {
        word: word.kanji,
        user_id: userId,
        app_version: appVersion,
      });
      setWordInfo(wordRes.data);
    } catch (err) {
      console.error('ClassicGloss: word info fetch failed', err);
      setFetchError(true);
      setIsLoading(false);
      return;
    }

    try {
      const radicalsRes = await axios.post(`${apiBase}/api/radicals/for-kanji`, { word: word.kanji });
      setKanjiBreakdown(radicalsRes.data || []);
    } catch (err) {
      console.error('ClassicGloss: radical breakdown unavailable', err);
    }

    setIsLoading(false);
  };

  // Viewport-safe positioning
  const computeStyle = () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const OFFSET_Y = 24;
    let left = position.x - POPUP_WIDTH / 2;
    let top  = position.y + OFFSET_Y;
    if (left + POPUP_WIDTH > vw - POPUP_MARGIN) left = vw - POPUP_WIDTH - POPUP_MARGIN;
    if (left < POPUP_MARGIN) left = POPUP_MARGIN;
    const estimatedHeight = 360;
    if (top + estimatedHeight > vh - POPUP_MARGIN) top = position.y - estimatedHeight - OFFSET_Y;
    if (top < POPUP_MARGIN) top = POPUP_MARGIN;
    return { left, top };
  };

  const { left, top } = computeStyle();

  return (
    <div
      ref={popupRef}
      className="classic-gloss-popup"
      style={{ left: `${left}px`, top: `${top}px`, maxHeight: '80vh', overflowY: 'auto' }}
      onMouseDown={e => e.stopPropagation()}
      onTouchStart={e => e.stopPropagation()}
    >
      <button className="gloss-close-btn" onClick={onDismiss} aria-label="Close">✕</button>

      {/* Word header */}
      <div className="gloss-word-section">
        <div className="gloss-word-kanji">{word.kanji}</div>

        {isLoading && (
          <div className="gloss-loading">
            <span className="gloss-loading-dot" />
            <span className="gloss-loading-dot" />
            <span className="gloss-loading-dot" />
          </div>
        )}

        {!isLoading && fetchError && (
          <div className="gloss-error">Could not load word data</div>
        )}

        {!isLoading && !fetchError && wordInfo && (
          <>
            {wordInfo.furigana && (
              <div className="gloss-furigana">
                <span className="gloss-label">Reading</span>
                {wordInfo.furigana}
              </div>
            )}
            {wordInfo.translation && (
              <div className="gloss-translation">
                <span className="gloss-label">Meaning</span>
                {wordInfo.translation}
              </div>
            )}
          </>
        )}
      </div>

      {/* Kanji breakdown */}
      {!isLoading && !fetchError && kanjiBreakdown.length > 0 && (
        <div className="gloss-breakdown-section">
          <div className="gloss-breakdown-heading">Kanji breakdown</div>
          {kanjiBreakdown.map((entry, idx) => (
            <div key={idx} className="gloss-kanji-entry">
              <span className="gloss-kanji-char">{entry.char}</span>
              <div className="gloss-kanji-meta">
                {entry.meaning && (
                  <div className="gloss-kanji-meaning">{entry.meaning}</div>
                )}
                {(entry.on?.length > 0 || entry.kun?.length > 0) && (
                  <div className="gloss-kanji-readings">
                    {entry.on?.length > 0 && (
                      <span className="gloss-reading-tag on">on: {entry.on.join('・')}</span>
                    )}
                    {entry.kun?.length > 0 && (
                      <span className="gloss-reading-tag kun">kun: {entry.kun.join('・')}</span>
                    )}
                  </div>
                )}
                {/* Radicals */}
                <div className="gloss-radical-chips">
                  {entry.radicals?.length > 0
                    ? entry.radicals.map((rad, rIdx) => (
                        <span key={rIdx} className="gloss-radical-chip">
                          <span className="chip-radical">{rad.radical}</span>
                          <span className="chip-label">
                            {Array.isArray(rad.english_names) ? rad.english_names[0] : rad.english_names}
                          </span>
                        </span>
                      ))
                    : <span className="gloss-no-radicals">No radical data</span>
                  }
                </div>

                {/* Kanji inside — separate from radicals, with on readings */}
                {entry.kanji_inside?.length > 0 && (
                  <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--paper-border)' }}>
                    <div style={{
                      fontSize: '0.65rem', textTransform: 'uppercase',
                      letterSpacing: '0.07em', color: 'var(--ink-faint)', marginBottom: '0.35rem',
                    }}>
                      Kanji inside
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                      {entry.kanji_inside.map((k, kIdx) => {
                        const toArr = v => Array.isArray(v) ? v : (v ? [v] : []);
                        const onReadings = toArr(k.on).slice(0, 2);
                        return (
                          <div key={kIdx} style={{
                            display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
                            gap: '2px', background: '#e8f0fe', border: '1px solid #c5d5f5',
                            borderRadius: '8px', padding: '4px 8px', minWidth: '44px',
                          }}>
                            <span style={{ fontFamily: 'var(--font-jp)', fontSize: '1.05rem', color: '#185fa5' }}>{k.kanji}</span>
                            {k.meaning && <span style={{ fontSize: '0.65rem', color: '#185fa5' }}>{k.meaning}</span>}
                            {onReadings.map((r, ri) => (
                              <span key={ri} style={{ fontFamily: 'var(--font-jp)', fontSize: '0.65rem', color: '#185fa5', opacity: 0.8 }}>
                                on: {r}
                              </span>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ClassicGloss;
