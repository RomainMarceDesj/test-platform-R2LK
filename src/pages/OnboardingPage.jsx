/**
 * OnboardingPage.jsx
 * ==================
 * Study introduction, consent checkbox, and username entry.
 */

import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE } from '../config/studyConfig';

export default function OnboardingPage({ onComplete }) {
  const [username, setUsername]     = useState('');
  const [consented, setConsented]   = useState(false);
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);

  const canSubmit = username.trim() && consented;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const id = username.trim();
    if (!id) { setError('Please enter your username.'); return; }
    if (!consented) { setError('Please confirm that you have filled in the consent form.'); return; }

    setLoading(true);
    setError('');

    try {
      const res = await axios.get(`${API_BASE}/api/thesis/participant/${id}`);
      if (res.data.found) {
        onComplete({
          participantId:     res.data.participant_id,
          group:             res.data.group,
          assignmentIndex:   res.data.assignment_index,
          alreadyRegistered: true,
          screening:         res.data.screening ?? null,
        });
      } else {
        onComplete({
          participantId:     id,
          group:             null,
          assignmentIndex:   null,
          alreadyRegistered: false,
          screening:         null,
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

        {/* Description */}
        <div className="card">
          <p style={{ lineHeight: 1.8, color: 'var(--ink)' }}>
            Thank you for taking the time to participate in this experiment. This research aims to test
            the effects of various types of glossing while reading in Japanese.
          </p>
          <p style={{ lineHeight: 1.8, color: 'var(--ink)', marginTop: '0.75rem' }}>
            You will be assigned to group A or B and asked to read a paragraph. Following the reading,
            some test questions and a survey about your experience will be provided — please answer them
            honestly, as the objective is a comparison between the two groups. The total experiment time
            is expected to be between 10 and 30 minutes.
          </p>
          <p style={{ lineHeight: 1.8, color: 'var(--ink)', marginTop: '0.75rem' }}>
            Before starting, please choose a username that is not your real name but that you will be
            able to remember.
          </p>
        </div>

        {/* Consent checkbox */}
        <label
          className={`option-item ${consented ? 'selected' : ''}`}
          style={{ cursor: 'pointer' }}
        >
          <input
            type="checkbox"
            checked={consented}
            onChange={e => setConsented(e.target.checked)}
          />
          <span className="option-label">I have filled in the consent form.</span>
        </label>

        {/* Username + submit */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">
              Username
              <span> — a nickname of your choice that you can remember</span>
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={e => { setUsername(e.target.value); setError(''); }}
              placeholder="e.g. sakura42"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
            />
          </div>

          {error && (
            <p style={{ color: 'var(--accent)', fontSize: '0.875rem' }}>{error}</p>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading || !canSubmit}
          >
            {loading ? 'Checking...' : 'Continue →'}
          </button>
        </form>

        <p style={{ fontSize: '0.8rem', textAlign: 'center', color: 'var(--ink-faint)' }}>
          Your data will be anonymized. No personal information is stored beyond your username.
        </p>

      </div>
    </div>
  );
}
