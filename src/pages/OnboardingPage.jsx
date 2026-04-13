/**
 * OnboardingPage.jsx
 * ==================
 * Shows study introduction and collects participant ID.
 * Calls /api/thesis/participant/<id> to check if already registered.
 * If already registered → restores group and skips screening.
 * If new → continues to ScreeningPage.
 */

import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE, STUDY_INTRO } from '../config/studyConfig';

export default function OnboardingPage({ onComplete }) {
  const [participantId, setParticipantId] = useState('');
  const [ageConfirmed, setAgeConfirmed]   = useState(false);
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const id = participantId.trim();
    if (!id) { setError('Please enter your participant ID.'); return; }

    setLoading(true);
    setError('');

    try {
      // Check if participant already registered
      const res = await axios.get(`${API_BASE}/api/thesis/participant/${id}`);

      if (res.data.found) {
        // Already registered — restore state and go straight to reading
        onComplete({
          participantId: res.data.participant_id,
          group: res.data.group,
          assignmentIndex: res.data.assignment_index,
          alreadyRegistered: true,
          screening: res.data.screening ?? null,
        });
      } else {
        // New participant — proceed to screening
        onComplete({
          participantId: id,
          group: null,
          assignmentIndex: null,
          alreadyRegistered: false,
          screening: null,
        });
      }
    } catch (err) {
      setError('Could not connect to the server. Please try again.');
      console.error('Onboarding error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-inner animate-in">

        {/* Header */}
        <div>
          <h3>Read2LearnKanji</h3>
          <h1 style={{ marginTop: '0.5rem' }}>Reading Study</h1>
        </div>

        {/* Study description */}
        <div className="card">
          <p style={{ lineHeight: 1.75, color: 'var(--ink)' }}>
            {STUDY_INTRO}
          </p>
        </div>

        {/* Login */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="pid">
              Participant ID
              <span> — provided by the researcher</span>
            </label>
            <input
              id="pid"
              type="text"
              value={participantId}
              onChange={e => { setParticipantId(e.target.value); setError(''); }}
              placeholder="e.g. P001"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
            />
          </div>

          {error && (
            <p style={{ color: 'var(--accent)', fontSize: '0.875rem' }}>{error}</p>
          )}

          {/* Age confirmation */}
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            cursor: 'pointer',
            fontSize: '0.9rem',
            color: 'var(--ink)',
            userSelect: 'none',
          }}>
            <input
              type="checkbox"
              checked={ageConfirmed}
              onChange={e => setAgeConfirmed(e.target.checked)}
              style={{ width: '18px', height: '18px', flexShrink: 0, cursor: 'pointer', accentColor: 'var(--accent)' }}
            />
            I confirm that I am 18 years of age or older.
          </label>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading || !participantId.trim() || !ageConfirmed}
          >
            {loading ? 'Checking...' : 'Continue →'}
          </button>
        </form>

        {/* Instructions */}
        <div className="card-sm" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <h3>Before you begin</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--ink)', lineHeight: 1.65 }}>
            Please read the following carefully:
          </p>
          <ul style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--ink-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            <li>
              <strong style={{ color: 'var(--ink)' }}>No outside help.</strong>{' '}
              Do not use a dictionary, translation app, or any other external resource during the study. The glossing tool provided is the only help you should use.
            </li>
            <li>
              <strong style={{ color: 'var(--ink)' }}>Complete in one sitting.</strong>{' '}
              Please do not pause the session partway through. The whole study takes approximately 15–20 minutes — set aside uninterrupted time before starting.
            </li>
            <li>
              <strong style={{ color: 'var(--ink)' }}>Read naturally.</strong>{' '}
              There are no right or wrong answers in most sections. We are interested in your natural reading experience, not your ability to memorise vocabulary.
            </li>
          </ul>
        </div>

        {/* Footer note */}
        <p style={{ fontSize: '0.8rem', textAlign: 'center', color: 'var(--ink-faint)' }}>
          No personal data is collected beyond your participant ID.
        </p>

      </div>
    </div>
  );
}
