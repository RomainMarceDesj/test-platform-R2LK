/**
 * AlreadyDonePage.jsx
 * ===================
 * Shown when a participant has nothing more to do:
 *   - reason='all_done'         → post-test already submitted
 *   - reason='all_done_no_data' → wait period elapsed but no useful session 1 data
 */

import React from 'react';

export default function AlreadyDonePage({ participant, reason }) {
  const noData = reason === 'all_done_no_data';

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
          <h1>{noData ? 'Nothing to do here' : 'All done'}</h1>
          <p style={{ marginTop: '0.75rem', maxWidth: '440px', lineHeight: 1.7 }}>
            {noData
              ? `It looks like the first session wasn't completed, so there's nothing for the follow-up to test. Thanks for stopping by — please reach out to the researcher if you'd like to take part again.`
              : `You've completed both sessions of this study. Thank you for your contribution — your responses have been recorded.`}
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
