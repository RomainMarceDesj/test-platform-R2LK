/**
 * EndPages.jsx — QuestionnairePage + DonePage
 * (ComprehensionPage removed — replaced by comments field in questionnaire)
 */

import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { LIKERT_QUESTIONS, USE_CONTEXT_OPTIONS, API_BASE } from '../config/studyConfig';

// ─────────────────────────────────────────────────────────────────────────────
// QuestionnairePage
// ─────────────────────────────────────────────────────────────────────────────

export function QuestionnairePage({ participant, session, results, onComplete }) {
  const [likert, setLikert]       = useState({});
  const [contexts, setContexts]   = useState(new Set());
  const [otherText, setOtherText] = useState('');
  const [comments, setComments]   = useState('');
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
      comments:            comments.trim() || null,
    };

    const payload = {
      participant_id:        participant.participantId,
      group:                 participant.group,
      session_id:            session.sessionId,
      mid_quiz:              results.midQuiz,
      kanji_test:            results.kanjiTest,
      radical_noticing_test: results.radicalNoticingTest,
      questionnaire:         questionnaireData,
      was_glossed:           session.wasGlossed,
      noticing_test_words:   (session.noticingTestedWords ?? []),
      kanji_test_words:      results.kanjiTest.map(r => r.word),
      inline_comprehension:  session.inlineComprehension ?? null,
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
            {LIKERT_QUESTIONS.map((q) => (
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
              In what contexts would you use a tool like this?{'  '}
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

        {/* Open comments */}
        <div className="card-sm">
          <div className="form-group">
            <label className="form-label">
              Comments on your experience or the system
              <span> — optional</span>
            </label>
            <textarea
              value={comments}
              onChange={e => setComments(e.target.value.slice(0, 1000))}
              placeholder="Any thoughts, difficulties, or suggestions are welcome…"
              rows={4}
              style={{
                width: '100%',
                padding: '0.7rem 0.9rem',
                border: '1px solid var(--paper-border)',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.95rem',
                fontWeight: 300,
                color: 'var(--ink)',
                background: 'white',
                resize: 'vertical',
                outline: 'none',
                boxSizing: 'border-box',
                lineHeight: 1.6,
              }}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--ink-faint)', textAlign: 'right' }}>
              {comments.length} / 1000
            </p>
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
// DonePage
// ─────────────────────────────────────────────────────────────────────────────

export function DonePage({ participant }) {
  return (
    <div className="page" style={{ justifyContent: 'center', textAlign: 'center' }}>
      <div className="page-inner animate-in" style={{ alignItems: 'center', gap: '1.5rem' }}>

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
