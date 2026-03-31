/**
 * KanjiTestPage.jsx
 * =================
 * Phase 5: 6-item kanji test (2 reading recognition, 2 meaning recognition,
 * 2 combined production). Drawn from glossed target words.
 */

import React, { useState, useMemo } from 'react';
import { TARGET_KANJI } from '../config/studyConfig';

// ── Helpers ───────────────────────────────────────────────────────────────────

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Normalise hiragana/romaji reading input for comparison
function normaliseReading(s) {
  return s.trim().toLowerCase().replace(/\s+/g, '');
}

// Build distractor options from other target kanji (same type)
function buildDistractors(correctKey, allWords, getVal, count = 3) {
  const others = allWords.filter(w => w !== correctKey);
  return shuffle(others).slice(0, count).map(w => getVal(TARGET_KANJI[w]));
}

// ── MC Option component ────────────────────────────────────────────────────────

function McOption({ letter, text, selected, onClick }) {
  return (
    <button
      className={`mc-option ${selected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <span className="mc-key">{letter}</span>
      <span style={{ fontFamily: text.match(/[\u3000-\u9FFF]/) ? 'var(--font-jp)' : 'inherit', fontSize: '0.95rem' }}>
        {text}
      </span>
    </button>
  );
}

// ── Individual question types ─────────────────────────────────────────────────

function ReadingRecognitionQ({ word, config, allWords, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const correct = config.reading;

  const options = useMemo(() => {
    const distractors = buildDistractors(word, allWords, c => c.reading);
    return shuffle([correct, ...distractors]);
  }, [word]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontFamily: 'var(--font-jp)', fontSize: '2.5rem', letterSpacing: '0.05em' }}>
          {word}
        </span>
        <p style={{ marginTop: '0.4rem', fontSize: '0.82rem', color: 'var(--ink-faint)' }}>
          Select the correct reading
        </p>
      </div>
      <div className="mc-options">
        {options.map((opt, i) => (
          <McOption
            key={opt}
            letter={String.fromCharCode(65 + i)}
            text={opt}
            selected={selected === opt}
            onClick={() => {
              setSelected(opt);
              setTimeout(() => onAnswer({
                word,
                question_type: 'reading',
                answer_given: opt,
                correct_answer: correct,
                is_correct: opt === correct,
              }), 350);
            }}
          />
        ))}
      </div>
    </div>
  );
}

function MeaningRecognitionQ({ word, config, allWords, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const correct = config.meaning;

  const options = useMemo(() => {
    const distractors = buildDistractors(word, allWords, c => c.meaning);
    return shuffle([correct, ...distractors]);
  }, [word]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontFamily: 'var(--font-jp)', fontSize: '2.5rem', letterSpacing: '0.05em' }}>
          {word}
        </span>
        <p style={{ marginTop: '0.4rem', fontSize: '0.82rem', color: 'var(--ink-faint)' }}>
          Select the correct meaning
        </p>
      </div>
      <div className="mc-options">
        {options.map((opt, i) => (
          <McOption
            key={opt}
            letter={String.fromCharCode(65 + i)}
            text={opt}
            selected={selected === opt}
            onClick={() => {
              setSelected(opt);
              setTimeout(() => onAnswer({
                word,
                question_type: 'meaning',
                answer_given: opt,
                correct_answer: correct,
                is_correct: opt === correct,
              }), 350);
            }}
          />
        ))}
      </div>
    </div>
  );
}

function ProductionQ({ word, config, onAnswer }) {
  const [readingInput, setReadingInput] = useState('');
  const [meaningInput, setMeaningInput] = useState('');

  const handleSubmit = () => {
    const normReading  = normaliseReading(readingInput);
    const normCorrect  = normaliseReading(config.reading);
    const readingOk    = normReading === normCorrect;

    const normMeaning  = meaningInput.trim().toLowerCase();
    const meaningOk    = config.acceptedMeanings.some(m => m.toLowerCase() === normMeaning);

    onAnswer({
      word,
      question_type: 'production',
      reading_given:    readingInput.trim(),
      reading_correct:  config.reading,
      reading_is_correct: readingOk,
      meaning_given:    meaningInput.trim(),
      meaning_correct:  config.meaning,
      meaning_is_correct: meaningOk,
      is_correct: readingOk && meaningOk,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontFamily: 'var(--font-jp)', fontSize: '2.5rem', letterSpacing: '0.05em' }}>
          {word}
        </span>
        <p style={{ marginTop: '0.4rem', fontSize: '0.82rem', color: 'var(--ink-faint)' }}>
          Write both the reading and the meaning
        </p>
      </div>

      <div className="form-group">
        <label className="form-label">
          Reading <span>hiragana or romaji</span>
        </label>
        <input
          type="text"
          value={readingInput}
          onChange={e => setReadingInput(e.target.value)}
          placeholder="e.g. まんが or manga"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
        />
      </div>

      <div className="form-group">
        <label className="form-label">
          Meaning <span>in English</span>
        </label>
        <input
          type="text"
          value={meaningInput}
          onChange={e => setMeaningInput(e.target.value)}
          placeholder="e.g. manga"
        />
      </div>

      <button
        className="btn btn-primary btn-full"
        onClick={handleSubmit}
        disabled={!readingInput.trim() || !meaningInput.trim()}
      >
        Submit
      </button>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function KanjiTestPage({ participant, session, onComplete }) {
  const { wasGlossed } = session;

  // Build 6-item test from glossed target words
  const testItems = useMemo(() => {
    const glossed = Object.entries(wasGlossed ?? {})
      .filter(([w, g]) => g && w in TARGET_KANJI)
      .map(([w]) => w);

    const pool = shuffle(glossed);
    const allWords = Object.keys(TARGET_KANJI);

    const items = [];
    const types = ['reading', 'meaning', 'production', 'reading', 'meaning', 'production'];

    for (let i = 0; i < Math.min(6, pool.length); i++) {
      const word   = pool[i % pool.length];
      const config = TARGET_KANJI[word];
      items.push({ word, config, type: types[i], allWords });
    }

    return items;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  return (
    <div className="page">
      <div className="page-inner animate-in">

        <div>
          <h3>Vocabulary test — {currentIdx + 1} / {testItems.length}</h3>
          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem' }}>
            {testItems.map((_, i) => (
              <div key={i} className={`progress-dot ${i < currentIdx ? 'done' : i === currentIdx ? 'active' : ''}`} />
            ))}
          </div>
        </div>

        <div className="card">
          {current.type === 'reading' && (
            <ReadingRecognitionQ
              key={`reading-${currentIdx}`}
              word={current.word}
              config={current.config}
              allWords={current.allWords}
              onAnswer={handleAnswer}
            />
          )}
          {current.type === 'meaning' && (
            <MeaningRecognitionQ
              key={`meaning-${currentIdx}`}
              word={current.word}
              config={current.config}
              allWords={current.allWords}
              onAnswer={handleAnswer}
            />
          )}
          {current.type === 'production' && (
            <ProductionQ
              key={`production-${currentIdx}`}
              word={current.word}
              config={current.config}
              onAnswer={handleAnswer}
            />
          )}
        </div>

      </div>
    </div>
  );
}
