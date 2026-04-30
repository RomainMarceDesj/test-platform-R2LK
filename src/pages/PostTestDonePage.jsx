/**
 * PostTestDonePage.jsx
 * ====================
 * Terminal screen after post-test submission.
 */

import React from 'react';

export default function PostTestDonePage({ participant, daysSinceSession1 }) {
  const days = daysSinceSession1 != null ? Math.round(daysSinceSession1) : null;

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
          <p style={{ marginTop: '0.75rem', maxWidth: '440px', lineHeight: 1.7 }}>
            Your follow-up responses have been recorded. This was the final part of the study —
            your contribution is genuinely appreciated.
          </p>
          {days !== null && (
            <p style={{ marginTop: '0.75rem', maxWidth: '440px', lineHeight: 1.7, color: 'var(--ink-muted)', fontSize: '0.9rem' }}>
              Time between sessions: {days} day{days === 1 ? '' : 's'}.
            </p>
          )}
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--ink-faint)' }}>
          Participant {participant?.participantId} · Group {participant?.group ?? '—'}
        </p>

      </div>
    </div>
  );
}
