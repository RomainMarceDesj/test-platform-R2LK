/**
 * ReadingPage.jsx
 * ===============
 * The main reading screen. Loads the fixed text, renders it with Word components,
 * and provides the correct glossing interaction per group (A or B).
 *
 * Tracks:
 *  - Active reading time via heartbeat (5s intervals)
 *  - Every gloss event (word, timestamp, gloss duration, radicals clicked for A)
 *  - Mid-quiz trigger on first gloss of 特徴 or 認識
 *  - was_glossed map for all target kanji
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import Word from '../components/Word';
import RadicalSearchTray from '../components/RadicalSearchTray';
import ClassicGloss      from '../components/ClassicGloss';
import {
  API_BASE,
  APP_VERSION_A,
  APP_VERSION_B,
  READING_TEXT,
  TARGET_KANJI,
  QUIZ_TRIGGER_WORDS,
} from '../config/studyConfig';

const MemoizedWord = React.memo(Word);

export default function ReadingPage({
  participant,
  session,
  midQuizResults,       // null until mid-quiz completed
  onMidQuizTriggered,   // ({ word, glossIndex }) → switches phase to MID_QUIZ
  onComplete,           // (readingData) → switches phase to RADICAL_NOTICING
}) {
  const { participantId, group } = participant;
  const appVersion = group === 'A' ? APP_VERSION_A : APP_VERSION_B;

  // ── Text state ────────────────────────────────────────────────────────────
  const [wordData, setWordData]   = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ── Session ───────────────────────────────────────────────────────────────
  // Detect remount after mid-quiz — session has saved state from before the quiz
  const isRemount = (session.glossCount ?? 0) > 0 || !!midQuizResults;

  const sessionIdRef     = useRef(session.sessionId ?? uuidv4());
  const sessionId        = sessionIdRef.current;

  // Restore gloss tracking from saved session state if remounting after mid-quiz
  const glossCountRef    = useRef(session.glossCount ?? 0);
  const glossLogRef      = useRef(
    isRemount && session.glossLog?.length ? [...session.glossLog] : []
  );
  const wasGlossedRef    = useRef(
    isRemount && session.wasGlossed
      ? { ...session.wasGlossed }
      : Object.fromEntries(Object.keys(TARGET_KANJI).map(k => [k, false]))
  );
  const midQuizFiredRef  = useRef(isRemount); // true only when returning after mid-quiz was already completed
  const pendingMidQuizRef = useRef(null);

  // ── Gloss interaction state ───────────────────────────────────────────────
  // Group A
  const [showRadicalSearch, setShowRadicalSearch] = useState(false);
  const [radicalSearchTarget, setRadicalSearchTarget] = useState(null);
  const glossStartTsRef  = useRef(null);
  const glossRadicalsRef = useRef([]);         // radicals clicked during narrow-down

  // Group B
  const [activeGloss, setActiveGloss] = useState(null);

  // ── Refs ──────────────────────────────────────────────────────────────────
  const recentCallsRef = useRef(new Map());

  // ── 1. Start session + load text ─────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      // Only start a new session on first mount, not on remount after mid-quiz
      if (!isRemount) {
        try {
          await axios.post(`${API_BASE}/api/thesis/session/start`, {
            participant_id: participantId,
            group,
            session_id: sessionId,
          });
        } catch (e) {
          console.error('Failed to start thesis session:', e);
        }
      }

      // Always reload the text (wordData is lost on unmount regardless)
      try {
        const blob = new Blob([READING_TEXT], { type: 'text/plain' });
        const formData = new FormData();
        formData.append('file', blob, 'manga_text.txt');
        formData.append('start_position', '0');
        formData.append('page_size', '3000');
        formData.append('user_id', participantId);
        formData.append('app_version', appVersion);

        const res = await axios.post(`${API_BASE}/analyze`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setWordData(res.data.data ?? []);
      } catch (e) {
        console.error('Failed to load text:', e);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 2. Active reading heartbeat ───────────────────────────────────────────
  useEffect(() => {
    if (isLoading) return;
    const interval = setInterval(async () => {
      try {
        await axios.post(`${API_BASE}/api/thesis/session/heartbeat`, {
          session_id: sessionId,
        });
      } catch (e) {
        // Heartbeat failures are non-critical (transient network / Railway sleep).
        // Suppress console noise — active_reading_seconds will just miss those 5s.
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isLoading, sessionId]);

  // ── 3. Core gloss logger ──────────────────────────────────────────────────
  const logGloss = useCallback(async (word, radicalsClicked = []) => {
    glossCountRef.current += 1;
    const glossIndex   = glossCountRef.current;
    const glossEndTs   = Date.now();
    const glossStartTs = glossStartTsRef.current ?? glossEndTs;
    const durationMs   = glossEndTs - glossStartTs;

    console.log(`[GLOSS] word="${word}" index=${glossIndex} isTrigger=${QUIZ_TRIGGER_WORDS.has(word)} midQuizFired=${midQuizFiredRef.current}`);

    const entry = {
      word,
      timestamp: new Date().toISOString(),
      gloss_index: glossIndex,
      is_target_word: word in TARGET_KANJI,
    };
    glossLogRef.current.push(entry);

    if (word in TARGET_KANJI) {
      wasGlossedRef.current[word] = true;
    }

    // Check mid-quiz trigger — store pending immediately (before await)
    if (!midQuizFiredRef.current && QUIZ_TRIGGER_WORDS.has(word)) {
      pendingMidQuizRef.current = { word, glossIndex };
      console.log(`[GLOSS] ⚡ Pending mid-quiz set: word="${word}" index=${glossIndex}`);
    }

    // Post to backend (non-blocking for trigger purposes)
    try {
      await axios.post(`${API_BASE}/api/thesis/session/log-gloss`, {
        session_id: sessionId,
        word,
        gloss_index: glossIndex,
        gloss_start_ts: glossStartTs,
        gloss_end_ts: glossEndTs,
        gloss_duration_ms: durationMs,
        radicals_clicked: radicalsClicked,
      });
    } catch (e) {
      console.error('Gloss log failed:', e);
    }

    glossStartTsRef.current = null;
    glossRadicalsRef.current = [];
  }, [sessionId]);

  // ── 4. GROUP A — handleSwipe (radical tray) ───────────────────────────────
  const handleSwipeA = useCallback((wordId) => {
    let clickedWord = null;
    for (const para of wordData) {
      for (const w of para) {
        if (w.id === wordId) { clickedWord = w; break; }
      }
      if (clickedWord) break;
    }
    if (!clickedWord || clickedWord.type !== 'word') return;

    // If word already loaded — toggle furigana/translation, no tray
    if (clickedWord.isLazyLoaded) {
      setWordData(prev => prev.map(para => para.map(w => {
        if (w.id !== wordId) return w;
        if (!w.showFurigana)                    return { ...w, showFurigana: true, showTranslation: false };
        if (w.showFurigana && !w.showTranslation) return { ...w, showTranslation: true };
        return { ...w, showFurigana: false, showTranslation: false };
      })));
      return;
    }

    // Word not yet loaded — open radical search tray
    glossStartTsRef.current = Date.now();
    glossRadicalsRef.current = [];
    setRadicalSearchTarget({ wordId, kanji: clickedWord.kanji, word: clickedWord });
    setShowRadicalSearch(true);
  }, [wordData]);

  // ── Delayed mid-quiz fire — called directly from close action in either group
  // Accepts optional explicit word/glossIndex for cases where pending ref may not be set yet
  const fireDelayedMidQuiz = useCallback((explicitWord, explicitIdx) => {
    const word       = explicitWord ?? pendingMidQuizRef.current?.word;
    const glossIndex = explicitIdx  ?? pendingMidQuizRef.current?.glossIndex;

    console.log(`[FIRE] fireDelayedMidQuiz called: explicitWord="${explicitWord}" pendingWord="${pendingMidQuizRef.current?.word}" resolved="${word}" midQuizFired=${midQuizFiredRef.current}`);

    if (!word) { console.log('[FIRE] ❌ No word — aborting'); return; }
    if (midQuizFiredRef.current) { console.log('[FIRE] ❌ Already fired — aborting'); return; }

    pendingMidQuizRef.current = null;
    midQuizFiredRef.current = true;
    console.log(`[FIRE] ✅ Firing mid-quiz for "${word}" in 2s`);

    axios.post(`${API_BASE}/api/thesis/session/mid-quiz-triggered`, {
      session_id: sessionId,
      trigger_word: word,
      gloss_index: glossIndex ?? 0,
    }).catch(e => console.error('Mid-quiz trigger log failed:', e));

    setTimeout(() => {
      console.log(`[FIRE] 🚀 onMidQuizTriggered firing now for "${word}"`);
      onMidQuizTriggered({
        word,
        glossIndex,
        sessionId,
        glossLog:   [...glossLogRef.current],
        wasGlossed: { ...wasGlossedRef.current },
        glossCount: glossCountRef.current,
      });
    }, 2000);
  }, [sessionId, onMidQuizTriggered]);

  const handleRadicalTraySuccess = useCallback(async (selectedKanji, radicalsClicked) => {
    const kanji = radicalSearchTarget?.kanji;
    setShowRadicalSearch(false);
    setRadicalSearchTarget(null);

    // Lazy-load word info
    try {
      const res = await axios.post(`${API_BASE}/get_word_info`, {
        word: kanji,
        user_id: participantId,
        app_version: appVersion,
      });
      const { furigana, translation } = res.data;
      setWordData(prev => prev.map(para =>
        para.map(w => w.id === radicalSearchTarget?.wordId
          ? { ...w, furigana, translation, isLazyLoaded: true, showFurigana: true }
          : w
        )
      ));
    } catch (e) {
      console.error('Word info load failed:', e);
    }

    await logGloss(kanji, radicalsClicked ?? []);
    console.log(`[GROUP-A] Tray confirmed for "${kanji}". isTrigger=${QUIZ_TRIGGER_WORDS.has(kanji)} midQuizFired=${midQuizFiredRef.current} pending="${pendingMidQuizRef.current?.word}"`);
    // Fire mid-quiz 2s after tray closes (Group A)
    if (QUIZ_TRIGGER_WORDS.has(kanji) && !midQuizFiredRef.current) {
      fireDelayedMidQuiz(kanji, glossCountRef.current);
    } else {
      fireDelayedMidQuiz();
    }
  }, [radicalSearchTarget, participantId, appVersion, logGloss, fireDelayedMidQuiz]);

  const handleRadicalTrayClose = useCallback(() => {
    glossStartTsRef.current = null;
    setShowRadicalSearch(false);
    setRadicalSearchTarget(null);
  }, []);

  // ── 5. GROUP B — handleSwipe (classic gloss) ──────────────────────────────
  const handleSwipeB = useCallback((wordId, event) => {
    // Tapping active word closes it
    if (activeGloss?.wordId === wordId) {
      setActiveGloss(null);
      return;
    }

    let clickedWord = null;
    for (const para of wordData) {
      for (const w of para) {
        if (w.id === wordId) { clickedWord = w; break; }
      }
      if (clickedWord) break;
    }
    if (!clickedWord || clickedWord.type !== 'word') return;

    glossStartTsRef.current = Date.now();

    const pos = event
      ? { x: event.clientX, y: event.clientY }
      : { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    setActiveGloss({ wordId, kanji: clickedWord.kanji, position: pos });
  }, [wordData, activeGloss]);

  const handleGlossOpen = useCallback(async ({ word }) => {
    await logGloss(word, []);
  }, [logGloss]);



  const handleGlossDismiss = useCallback(() => {
    const closingWord = activeGloss?.kanji;
    console.log(`[GROUP-B] Popup dismissed for "${closingWord}". isTrigger=${QUIZ_TRIGGER_WORDS.has(closingWord)} midQuizFired=${midQuizFiredRef.current} pending="${pendingMidQuizRef.current?.word}"`);
    setActiveGloss(null);
    if (closingWord && QUIZ_TRIGGER_WORDS.has(closingWord) && !midQuizFiredRef.current) {
      fireDelayedMidQuiz(closingWord, glossCountRef.current);
    } else {
      fireDelayedMidQuiz();
    }
  }, [fireDelayedMidQuiz, activeGloss]);

  // ── 6. Unified handleSwipe ────────────────────────────────────────────────
  const handleSwipe = group === 'A' ? handleSwipeA : handleSwipeB;

  // ── 7. Finish reading ─────────────────────────────────────────────────────
  const handleFinish = useCallback(async () => {
    try {
      await axios.post(`${API_BASE}/api/thesis/session/end`, {
        session_id: sessionId,
      });
    } catch (e) {
      console.error('Session end failed:', e);
    }

    onComplete({
      sessionId,
      glossLog:      glossLogRef.current,
      wasGlossed:    { ...wasGlossedRef.current },
    });
  }, [sessionId, onComplete]);

  // ── 8. Render ─────────────────────────────────────────────────────────────

  const paragraphElement = wordData.map((para, pIdx) => (
    <p key={pIdx}>
      {para.map((word, wIdx) => (
        <MemoizedWord
          key={`${word.id}-${wIdx}`}
          handleSwipe={handleSwipe}
          furigana={word.furigana}
          translation={word.translation}
          kanji={word.kanji}
          showFurigana={word.showFurigana ?? false}
          showTranslation={word.showTranslation ?? false}
          type={word.type}
          id={word.id}
          value={word.value}
          isHighlighted={
            group === 'A'
              ? (showRadicalSearch && radicalSearchTarget?.wordId === word.id)
              : (activeGloss?.wordId === word.id)
          }
        />
      ))}
    </p>
  ));

  return (
    <div className="page" style={{ paddingBottom: '80px' }}>
      <div className="page-inner">

        {/* Header */}
        <div>
          <h3 style={{ marginBottom: '0.75rem' }}>Reading</h3>

          {/* Text title block */}
          <div style={{ marginBottom: '0.5rem' }}>
            <p style={{ fontSize: '0.78rem', color: 'var(--ink-faint)', letterSpacing: '0.03em', marginBottom: '0.3rem' }}>
              Excerpt from the Japan Foundation's reading comprehension text
            </p>
            <p style={{ fontFamily: 'var(--font-jp)', fontSize: '1.25rem', fontWeight: 500, color: 'var(--ink)', lineHeight: 1.4, marginBottom: '0.15rem' }}>
              日本人の大人と漫画
            </p>
            <p style={{ fontSize: '0.88rem', color: 'var(--ink-muted)', marginBottom: '0.5rem' }}>
              Japanese adults and manga — excerpt discussing why Japanese adults still read manga.
            </p>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--ink-faint)' }}>
            Tap any word you don't know to see more information.
          </p>
        </div>

        {/* Text */}
        <div className="card">
          {isLoading ? (
            <p style={{ textAlign: 'center', color: 'var(--ink-faint)', padding: '2rem' }}>
              Loading text…
            </p>
          ) : (
            <div className="reading-text">
              {paragraphElement}
            </div>
          )}
        </div>

      </div>

      {/* Finish button — fixed bottom */}
      <div className="reading-footer">
        <button
          className="btn btn-primary"
          onClick={handleFinish}
          disabled={isLoading}
        >
          Finish Reading →
        </button>
      </div>

      {/* Group A — Radical Search Tray */}
      {group === 'A' && showRadicalSearch && radicalSearchTarget && (
        <RadicalSearchTray
          targetKanji={radicalSearchTarget.kanji}
          onSuccess={(selectedKanji, radicalsClicked) =>
            handleRadicalTraySuccess(selectedKanji, radicalsClicked)
          }
          onClose={handleRadicalTrayClose}
          isOpen={showRadicalSearch}
          apiBase={API_BASE}
        />
      )}

      {/* Group B — Classic Gloss popup */}
      {group === 'B' && activeGloss && (
        <ClassicGloss
          word={{ kanji: activeGloss.kanji }}
          position={activeGloss.position}
          onGloss={handleGlossOpen}
          onDismiss={handleGlossDismiss}
          glossIndex={glossCountRef.current}
          userId={participantId}
          appVersion={APP_VERSION_B}
          apiBase={API_BASE}
        />
      )}
    </div>
  );
}
