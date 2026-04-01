/**
 * ComprehensionPage.jsx, QuestionnairePage.jsx, DonePage.jsx
 * ============================================================
 * Phases 6, 7, and 8.
 */

// ─────────────────────────────────────────────────────────────────────────────
// ComprehensionPage.jsx
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { COMPREHENSION_QUESTIONS, LIKERT_QUESTIONS, USE_CONTEXT_OPTIONS, API_BASE } from '../config/studyConfig';

export function ComprehensionPage({ onComplete }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected]     = useState(null);
  const [results, setResults]       = useState([]);

  const q = COMPREHENSION_QUESTIONS[currentIdx];

  const handleSelect = (key) => {
    if (selected !== null) return; // already answered
    setSelected(key);

    const result = {
      question_index: q.index,
      answer_given:   key,
      correct_answer: q.correctAnswer,
      is_correct:     key === q.correctAnswer,
    };

    setTimeout(() => {
      const newResults = [...results, result];
      if (currentIdx + 1 < COMPREHENSION_QUESTIONS.length) {
        setResults(newResults);
        setCurrentIdx(prev => prev + 1);
        setSelected(null);
      } else {
        onComplete(newResults);
      }
    }, 600);
  };

  return (
    <div className="page">
      <div className="page-inner animate-in">

        <div>
          <h3>Reading comprehension — {currentIdx + 1} / {COMPREHENSION_QUESTIONS.length}</h3>
          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem' }}>
            {COMPREHENSION_QUESTIONS.map((_, i) => (
              <div key={i} className={`progress-dot ${i < currentIdx ? 'done' : i === currentIdx ? 'active' : ''}`} />
            ))}
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h2 style={{ lineHeight: 1.4 }}>{q.question}</h2>

          <div className="mc-options">
            {q.options.map((opt, i) => {
              let cls = '';
              if (selected === opt.key) {
                cls = opt.key === q.correctAnswer ? 'correct' : 'incorrect';
              }
              return (
                <button
                  key={opt.key}
                  className={`mc-option ${selected === opt.key ? 'selected' : ''} ${cls}`}
                  onClick={() => handleSelect(opt.key)}
                  disabled={selected !== null}
                >
                  <span className="mc-key">{opt.key.toUpperCase()}</span>
                  <span style={{ fontSize: '0.95rem' }}>{opt.text}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

export default ComprehensionPage;


// ─────────────────────────────────────────────────────────────────────────────
// QuestionnairePage.jsx
// ─────────────────────────────────────────────────────────────────────────────

export function QuestionnairePage({ participant, session, results, onComplete }) {
  const [likert, setLikert]       = useState({});
  const [contexts, setContexts]   = useState(new Set());
  const [otherText, setOtherText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState('');

  const allLikertAnswered = LIKERT_QUESTIONS.every(q => likert[q.id] !== undefined);

  const toggleContext = (key) => {
    setContexts(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');

    const questionnaireData = {
      likert,
      future_use_contexts: Array.from(contexts),
      future_use_other:    otherText.trim() || null,
    };

    // Build full results payload
    const payload = {
      participant_id:        participant.participantId,
      group:                 participant.group,
      session_id:            session.sessionId,
      mid_quiz:              results.midQuiz,
      kanji_test:            results.kanjiTest,
      radical_noticing_test: results.radicalNoticingTest,
      comprehension:         results.comprehension,
      questionnaire:         questionnaireData,
      was_glossed:           session.wasGlossed,
      // Which words appeared in each test — for cross-referencing results
      noticing_test_words:   (session.noticingTestedWords ?? []),
      kanji_test_words:      results.kanjiTest.map(r => r.word),
      mid_quiz_word:         results.midQuiz?.trigger_word ?? null,
    };

    try {
      await axios.post(`${API_BASE}/api/thesis/results/submit`, payload);
      onComplete(questionnaireData);
    } catch (e) {
      setError('Submission failed. Please try again.');
      console.error('Results submit error:', e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <div className="page-inner animate-in">

        <div>
          <h3>Almost done</h3>
          <h1 style={{ marginTop: '0.5rem' }}>Your experience</h1>
          <p style={{ marginTop: '0.5rem' }}>
            Rate each statement on a scale of 1 (low) to 5 (high).
          </p>
        </div>

        <div className="card">
          <div className="likert-group">
            {LIKERT_QUESTIONS.map((q, i) => (
              <div key={q.id} className="likert-item">
                <div className="likert-question">{q.text}</div>
                <div className="likert-scale">
                  {[1, 2, 3, 4, 5].map(v => (
                    <button
                      key={v}
                      className={`likert-btn ${likert[q.id] === v ? 'selected' : ''}`}
                      onClick={() => setLikert(prev => ({ ...prev, [q.id]: v }))}
                    >
                      {v}
                    </button>
                  ))}
                </div>
                <div className="likert-anchors">
                  <span>{q.anchors[0]}</span>
                  <span>{q.anchors[1]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Context multi-select */}
        <div className="card-sm">
          <div className="form-group">
            <label className="form-label" style={{ marginBottom: '0.5rem' }}>
              In what contexts would you use a tool like this?{' '}
              <span>Select all that apply</span>
            </label>
            <div className="option-group">
              {USE_CONTEXT_OPTIONS.map(opt => (
                <label
                  key={opt.key}
                  className={`option-item ${contexts.has(opt.key) ? 'selected' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={contexts.has(opt.key)}
                    onChange={() => toggleContext(opt.key)}
                  />
                  <span className="option-label">{opt.text}</span>
                </label>
              ))}
            </div>
            {contexts.has('other') && (
              <input
                type="text"
                placeholder="Please describe…"
                value={otherText}
                onChange={e => setOtherText(e.target.value.slice(0, 120))}
                style={{ marginTop: '0.5rem' }}
              />
            )}
          </div>
        </div>

        {error && (
          <p style={{ color: 'var(--accent)', fontSize: '0.875rem' }}>{error}</p>
        )}

        <button
          className="btn btn-primary btn-full"
          onClick={handleSubmit}
          disabled={!allLikertAnswered || submitting}
        >
          {submitting ? 'Submitting…' : 'Submit →'}
        </button>

      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// DonePage.jsx
// ─────────────────────────────────────────────────────────────────────────────

export function DonePage({ participant }) {
  return (
    <div className="page" style={{ justifyContent: 'center', textAlign: 'center' }}>
      <div className="page-inner animate-in" style={{ alignItems: 'center', gap: '1.5rem' }}>

        {/* Stamp mark */}
        <div style={{
          width: 80, height: 80,
          borderRadius: '50%',
          border: '3px solid var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2rem',
          color: 'var(--accent)',
        }}>
          完
        </div>

        <div>
          <h1>Thank you</h1>
          <p style={{ marginTop: '0.75rem', maxWidth: '400px', lineHeight: 1.7 }}>
            Your responses have been recorded. You're welcome to continue using
            the reading tool on your own — your activity will help inform the research.
          </p>
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--ink-faint)' }}>
          Participant {participant.participantId} · Group {participant.group}
        </p>

      </div>
    </div>
  );
}
