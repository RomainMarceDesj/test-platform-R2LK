/**
 * PostTestIntroPage.jsx
 * =====================
 * Welcome screen for the 2-week follow-up.
 * Sets expectations for the format and asks participant not to use external resources.
 */

import React from 'react';
import { POSTTEST_INTRO_TEXT } from '../config/studyConfig';

export default function PostTestIntroPage({ participant, onComplete }) {
  return (
    <div className="page">
      <div className="page-inner animate-in">

        <div>
          <h3>Follow-up</h3>
          <h1 style={{ marginTop: '0.5rem' }}>Welcome back</h1>
        </div>

        <div className="card">
          {POSTTEST_INTRO_TEXT.split('\n\n').map((para, i) => (
            <p
              key={i}
              style={{
                lineHeight: 1.8,
                color: 'var(--ink)',
                marginTop: i === 0 ? 0 : '0.75rem',
              }}
            >
              {para}
            </p>
          ))}
        </div>

        <button
          className="btn btn-primary btn-full"
          onClick={onComplete}
        >
          Begin →
        </button>

        {participant?.participantId && (
          <p style={{ fontSize: '0.78rem', textAlign: 'center', color: 'var(--ink-faint)' }}>
            Signed in as {participant.participantId} · Group {participant.group ?? '—'}
          </p>
        )}

      </div>
    </div>
  );
}
