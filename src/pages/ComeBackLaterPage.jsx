/**
 * ComeBackLaterPage.jsx
 * =====================
 * Shown when a participant returns before the 14-day wait period has elapsed.
 * Tells them when to come back. No way forward from this screen.
 */

import React from 'react';
import { POSTTEST_MIN_DAYS } from '../config/studyConfig';

function formatDate(isoString) {
  if (!isoString) return null;
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return null;
  }
}

export default function ComeBackLaterPage({ participant, waitUntil, daysSinceSession1 }) {
  const dateStr = formatDate(waitUntil);
  const daysElapsed = daysSinceSession1 != null ? Math.floor(daysSinceSession1) : null;
  const daysLeft = daysElapsed != null ? Math.max(0, POSTTEST_MIN_DAYS - daysElapsed) : null;

  return (
    <div className="page" style={{ justifyContent: 'center', textAlign: 'center' }}>
      <div className="page-inner animate-in" style={{ alignItems: 'center', gap: '1.5rem' }}>

        <div style={{
          width: 80, height: 80,
          borderRadius: '50%',
          border: '3px solid var(--paper-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2rem',
          color: 'var(--ink-muted)',
        }}>
          待
        </div>

        <div>
          <h1>See you soon</h1>
          <p style={{ marginTop: '0.75rem', maxWidth: '440px', lineHeight: 1.7 }}>
            You've already completed the first session. The follow-up will be available
            {' '}{POSTTEST_MIN_DAYS} days after you finished.
          </p>

          {dateStr && (
            <p style={{ marginTop: '1rem', fontSize: '1rem', color: 'var(--ink)', fontWeight: 500 }}>
              Please come back on or after <span style={{ color: 'var(--accent)' }}>{dateStr}</span>.
            </p>
          )}

          {daysLeft !== null && daysLeft > 0 && (
            <p style={{ marginTop: '0.5rem', color: 'var(--ink-muted)', fontSize: '0.9rem' }}>
              {daysLeft} day{daysLeft === 1 ? '' : 's'} to go.
            </p>
          )}

          <p style={{ marginTop: '1rem', maxWidth: '440px', lineHeight: 1.7, color: 'var(--ink-muted)', fontSize: '0.9rem' }}>
            In the meantime, please avoid reviewing the original text or the words from the first
            session — we're testing what you naturally retain.
          </p>
        </div>

        {participant?.participantId && (
          <p style={{ fontSize: '0.8rem', color: 'var(--ink-faint)' }}>
            Participant {participant.participantId} · Group {participant.group ?? '—'}
          </p>
        )}

      </div>
    </div>
  );
}
