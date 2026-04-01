/**
 * KanjiTestPage.jsx
 * =================
 * Phase 5: 6-item kanji test.
 * Types: reading recognition, meaning recognition, combined production.
 * Excludes words already tested in the radical noticing test where possible.
 * All questions have an "I don't know" option. Production allows empty submission.
 */

import React, { useState, useMemo } from 'react';
import { TARGET_KANJI } from '../config/studyConfig';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function normaliseReading(s) {
  return s.trim().toLowerCase().replace(/\s+/g, '');
}

function buildDistractors(correctKey, allWords, getVal, count = 3) {
  const others = allWords.filter(w => w !== correctKey && TARGET_KANJI[w]);
  return shuffle(others).slice(0, count).map(w => getVal(TARGET_KANJI[w]));
}

// ── Shared MC option ──────────────────────────────────────────────────────────

function McOption({ letter, text, selected, onClick, isIdontKnow }) {
  return (
    <button
      className={`mc-option ${selected ? 'selected' : ''}`}
      onClick={onClick}
      style={isIdontKnow ? { opacity: 0.7 } : {}}
    >
      <span className="mc-key">{letter}</span>
      <span style={{ fontSize: '0.95rem', fontStyle: isIdontKnow ? 'italic' : 'normal' }}>
        {text}
      </span>
    </button>
  );
}

// ── Reading recognition ───────────────────────────────────────────────────────

function ReadingRecognitionQ({ word, config, allWords, onAnswer }) {
  const [selected, setSelected] = useState(null);

  // Guard: if config is null (non-target word), show a generic question
  const correct = config?.reading ?? null;

  const options = useMemo(() => {
    if (!correct) return [];
    const distractors = buildDistractors(word, allWords, c => c.reading);
    return [...shuffle([correct, ...distractors]), 'I don\'t know'];
  }, [word, correct]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!correct) {
    return (
      <div style={{ textAlign: 'center', padding: '1rem' }}>
        <span style={{ fontFamily: 'var(--font-jp)', fontSize: '2.5rem' }}>{word}</span>
        <p style={{ marginTop: '1rem', color: 'var(--ink-faint)' }}>No reading data available for this word.</p>
        <button className="btn btn-secondary" style={{ marginTop: '1rem' }}
          onClick={() => onAnswer({ word, question_type: 'reading', answer_given: 'skip', correct_answer: '', is_correct: false })}>
          Skip →
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontFamily: 'var(--font-jp)', fontSize: '2.5rem', letterSpacing: '0.05em' }}>{word}</span>
        <p style={{ marginTop: '0.4rem', fontSize: '0.82rem', color: 'var(--ink-faint)' }}>Select the correct reading</p>
      </div>
      <div className="mc-options">
        {options.map((opt, i) => (
          <McOption
            key={opt}
            letter={opt === "I don't know" ? '?' : String.fromCharCode(65 + i)}
            text={opt}
            selected={selected === opt}
            isIdontKnow={opt === "I don't know"}
            onClick={() => {
              setSelected(opt);
              const idontknow = opt === "I don't know";
              setTimeout(() => onAnswer({
                word,
                question_type: 'reading',
                answer_given:  idontknow ? 'i_dont_know' : opt,
                correct_answer: correct,
                is_correct: !idontknow && opt === correct,
              }), 350);
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Meaning recognition ───────────────────────────────────────────────────────

function MeaningRecognitionQ({ word, config, allWords, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const correct = config?.meaning ?? null;

  const options = useMemo(() => {
    if (!correct) return [];
    const distractors = buildDistractors(word, allWords, c => c.meaning);
    return [...shuffle([correct, ...distractors]), 'I don\'t know'];
  }, [word, correct]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!correct) {
    return (
      <div style={{ textAlign: 'center', padding: '1rem' }}>
        <span style={{ fontFamily: 'var(--font-jp)', fontSize: '2.5rem' }}>{word}</span>
        <p style={{ marginTop: '1rem', color: 'var(--ink-faint)' }}>No meaning data available for this word.</p>
        <button className="btn btn-secondary" style={{ marginTop: '1rem' }}
          onClick={() => onAnswer({ word, question_type: 'meaning', answer_given: 'skip', correct_answer: '', is_correct: false })}>
          Skip →
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontFamily: 'var(--font-jp)', fontSize: '2.5rem', letterSpacing: '0.05em' }}>{word}</span>
        <p style={{ marginTop: '0.4rem', fontSize: '0.82rem', color: 'var(--ink-faint)' }}>Select the correct meaning</p>
      </div>
      <div className="mc-options">
        {options.map((opt, i) => (
          <McOption
            key={opt}
            letter={opt === "I don't know" ? '?' : String.fromCharCode(65 + i)}
            text={opt}
            selected={selected === opt}
            isIdontKnow={opt === "I don't know"}
            onClick={() => {
              setSelected(opt);
              const idontknow = opt === "I don't know";
              setTimeout(() => onAnswer({
                word,
                question_type: 'meaning',
                answer_given:  idontknow ? 'i_dont_know' : opt,
                correct_answer: correct,
                is_correct: !idontknow && opt === correct,
              }), 350);
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Production ────────────────────────────────────────────────────────────────

function ProductionQ({ word, config, onAnswer }) {
  const [readingInput, setReadingInput] = useState('');
  const [meaningInput, setMeaningInput] = useState('');

  const handleSubmit = () => {
    const readingGiven = readingInput.trim();
    const meaningGiven = meaningInput.trim();

    // Allow fully empty submission ("I don't know")
    const normReading = normaliseReading(readingGiven);
    const normCorrect = config?.reading ? normaliseReading(config.reading) : '';
    const readingOk   = normCorrect !== '' && normReading === normCorrect;

    const normMeaning = meaningGiven.toLowerCase();
    const meaningOk   = config?.acceptedMeanings
      ? config.acceptedMeanings.some(m => m.toLowerCase() === normMeaning)
      : false;

    onAnswer({
      word,
      question_type:       'production',
      reading_given:        readingGiven || 'i_dont_know',
      reading_correct:      config?.reading ?? '',
      reading_is_correct:   readingOk,
      meaning_given:        meaningGiven || 'i_dont_know',
      meaning_correct:      config?.meaning ?? '',
      meaning_is_correct:   meaningOk,
      is_correct:           readingOk && meaningOk,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontFamily: 'var(--font-jp)', fontSize: '2.5rem', letterSpacing: '0.05em' }}>{word}</span>
        <p style={{ marginTop: '0.4rem', fontSize: '0.82rem', color: 'var(--ink-faint)' }}>
          Write what you remember — leave blank if you don't know
        </p>
      </div>

      <div className="form-group">
        <label className="form-label">Reading <span>hiragana or romaji</span></label>
        <input
          type="text"
          value={readingInput}
          onChange={e => setReadingInput(e.target.value)}
          placeholder="Leave blank if unsure"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Meaning <span>in English</span></label>
        <input
          type="text"
          value={meaningInput}
          onChange={e => setMeaningInput(e.target.value)}
          placeholder="Leave blank if unsure"
        />
      </div>

      <button className="btn btn-primary btn-full" onClick={handleSubmit}>
        Submit →
      </button>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function KanjiTestPage({ participant, session, onComplete }) {
  const { wasGlossed, glossLog } = session;

  const testItems = useMemo(() => {
    const noticingTested = new Set(session.noticingTestedWords ?? []);

    const targetGlossed = Object.entries(wasGlossed ?? {})
      .filter(([w, g]) => g && w in TARGET_KANJI && !noticingTested.has(w))
      .map(([w]) => w);

    const targetNoticed = Object.entries(wasGlossed ?? {})
      .filter(([w, g]) => g && w in TARGET_KANJI && noticingTested.has(w))
      .map(([w]) => w);

    const allGlossed = (glossLog ?? [])
      .map(e => e.word)
      .filter((w, i, arr) => arr.indexOf(w) === i)
      .filter(w => !targetGlossed.includes(w) && !targetNoticed.includes(w) && /[\u4E00-\u9FFF]/.test(w));

    let pool = [...shuffle(targetGlossed), ...shuffle(allGlossed)];
    if (pool.length < 6) pool = [...pool, ...shuffle(targetNoticed)];
    pool = pool.slice(0, 6);

    const allTargetWords = Object.keys(TARGET_KANJI);
    const types = ['reading', 'meaning', 'production', 'reading', 'meaning', 'production'];
    const items = [];

    for (let i = 0; i < Math.min(6, pool.length); i++) {
      const word   = pool[i];
      const config = TARGET_KANJI[word] ?? null;
      items.push({ word, config, type: types[i], allWords: allTargetWords });
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
          <p style={{ marginTop: '0.5rem' }}>No glossed words could be found for this test.</p>
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
