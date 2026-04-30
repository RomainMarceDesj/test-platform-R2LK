/**
 * PostTestQuestionnaire.jsx
 * =========================
 * Short follow-up questionnaire to capture intervening exposure between sessions.
 * Submits the full post-test results document tagged session_number=2.
 */

import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE, POSTTEST_QUESTIONNAIRE } from '../config/studyConfig';

function YesNo({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '0.75rem' }}>
      {['Yes', 'No'].map(opt => (
        <label
          key={opt}
          className={`option-item ${value === opt ? 'selected' : ''}`}
          style={{ flex: 1, justifyContent: 'center', cursor: 'pointer' }}
        >
          <input
            type="radio"
            checked={value === opt}
            onChange={() => onChange(opt)}
          />
          <span className="option-label">{opt}</span>
        </label>
      ))}
    </div>
  );
}

export default function PostTestQuestionnaire({
  participant,
  posttestData,
  posttestResults,
  daysSinceSession1,
  onComplete,
}) {
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const set = (id, value) => setAnswers(prev => ({ ...prev, [id]: value }));

  // All non-optional questions must be answered
  const allAnswered = POSTTEST_QUESTIONNAIRE.every(q => {
    if (q.optional) return true;
    const v = answers[q.id];
    if (q.type === 'yesno') return v === 'Yes' || v === 'No';
    if (q.type === 'text')  return typeof v === 'string' && v.trim().length > 0;
    return v !== undefined;
  });

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');

    const payload = {
      participant_id:        participant.participantId,
      group:                 participant.group,
      session_number:        2,
      days_since_session1:   daysSinceSession1,
      radical_noticing_test: posttestResults.radicalNoticingTest ?? [],
      kanji_test:            posttestResults.kanjiTest ?? [],
      questionnaire:         answers,
      // Snapshot of session-1-derived inputs we replayed, for traceability
      replayed_from_session1: {
        noticing_test_words: posttestData?.noticing_test_words ?? [],
        kanji_test_items:    posttestData?.kanji_test_items ?? [],
        mid_quiz_word:       posttestData?.mid_quiz_word ?? null,
        was_glossed:         posttestData?.was_glossed ?? {},
        session1_completed:  !!posttestData?.session1_completed,
      },
    };

    try {
      await axios.post(`${API_BASE}/api/thesis/posttest/results/submit`, payload);
      onComplete(answers);
    } catch (e) {
      console.error('Post-test submit failed:', e);
      setError('Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <div className="page-inner animate-in">

        <div>
          <h3>Almost done</h3>
          <h1 style={{ marginTop: '0.5rem' }}>A few quick questions</h1>
          <p style={{ marginTop: '0.5rem' }}>
            About what you've been doing with Japanese in the time between sessions.
          </p>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {POSTTEST_QUESTIONNAIRE.map((q, idx) => (
            <div key={q.id} className="form-group">
              <label className="form-label" style={{ marginBottom: '0.5rem' }}>
                {q.text}
                {q.optional && <span> — optional</span>}
              </label>

              {q.type === 'yesno' && (
                <YesNo value={answers[q.id]} onChange={v => set(q.id, v)} />
              )}

              {q.type === 'text' && (
                <textarea
                  value={answers[q.id] ?? ''}
                  onChange={e => set(q.id, e.target.value.slice(0, 1000))}
                  placeholder={q.placeholder ?? ''}
                  rows={3}
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
              )}

              {idx < POSTTEST_QUESTIONNAIRE.length - 1 && <div style={{ height: 0 }} />}
            </div>
          ))}
        </div>

        {error && (
          <p style={{ color: 'var(--accent)', fontSize: '0.875rem' }}>{error}</p>
        )}

        <button
          className="btn btn-primary btn-full"
          onClick={handleSubmit}
          disabled={!allAnswered || submitting}
        >
          {submitting ? 'Submitting…' : 'Submit →'}
        </button>

      </div>
    </div>
  );
}
