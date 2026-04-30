/**
 * OnboardingPage.jsx
 * ==================
 * Study introduction, consent checkbox, username entry, and routing.
 *
 * On submit, calls /api/thesis/participant/:id/status which returns one of:
 *   'new'              → standard new-participant flow
 *   'resume_session1'  → same-day return mid-session, resume reading
 *   'come_back_later'  → wait period not yet elapsed
 *   'posttest'         → eligible for the 2-week post-test
 *   'all_done'         → post-test already submitted
 *   'all_done_no_data' → wait elapsed but no useful session 1 data
 *
 * The outcome is forwarded to App.jsx which handles all phase transitions.
 */

import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE } from '../config/studyConfig';

export default function OnboardingPage({ onComplete }) {
  const [username, setUsername]   = useState('');
  const [consented, setConsented] = useState(false);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);

  const canSubmit = username.trim() && consented;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const id = username.trim();
    if (!id) { setError('Please enter your username.'); return; }
    if (!consented) { setError('Please confirm that you have filled in the consent form.'); return; }

    setLoading(true);
    setError('');

    try {
      const res = await axios.get(`${API_BASE}/api/thesis/participant/${id}/status`);
      const data = res.data;

      // Build the participant payload for downstream phases
      const participantPayload = data.participant
        ? {
            participantId:     data.participant.participant_id,
            group:             data.participant.group,
            assignmentIndex:   data.participant.assignment_index,
            screening:         data.participant.screening ?? null,
            alreadyRegistered: !!data.found,
          }
        : {
            participantId:     id,
            group:             null,
            assignmentIndex:   null,
            screening:         null,
            alreadyRegistered: false,
          };

      onComplete({
        nextAction:        data.next_action,
        participant:       participantPayload,
        posttestData:      data.posttest_data ?? null,
        session1Data:      data.session1_data ?? null,
        waitUntil:         data.wait_until ?? null,
        daysSinceSession1: data.days_since_session1 ?? null,
        forced:            !!data.forced,
      });
    } catch (err) {
      console.error('Onboarding status error:', err);

      // Fallback: if the new endpoint is unreachable, fall back to the legacy
      // /participant/:id endpoint so existing testers aren't blocked.
      try {
        const legacyRes = await axios.get(`${API_BASE}/api/thesis/participant/${id}`);
        if (legacyRes.data.found) {
          onComplete({
            nextAction: 'new',
            participant: {
              participantId:     legacyRes.data.participant_id,
              group:             legacyRes.data.group,
              assignmentIndex:   legacyRes.data.assignment_index,
              screening:         legacyRes.data.screening ?? null,
              alreadyRegistered: true,
            },
          });
        } else {
          onComplete({
            nextAction: 'new',
            participant: {
              participantId:     id,
              group:             null,
              assignmentIndex:   null,
              screening:         null,
              alreadyRegistered: false,
            },
          });
        }
      } catch (fallbackErr) {
        setError('Could not connect to the server. Please try again.');
        console.error('Onboarding fallback error:', fallbackErr);
      }
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
            About two weeks after this first session, you will be invited back for a short follow-up
            (~6 minutes). If you have already done the first session,
            sign in with the same username and the platform will guide you to the next step.
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
            {loading ? 'Checking…' : 'Continue →'}
          </button>
        </form>

        <p style={{ fontSize: '0.8rem', textAlign: 'center', color: 'var(--ink-faint)' }}>
          Your data will be anonymized. No personal information is stored beyond your username.
        </p>

      </div>
    </div>
  );
}
