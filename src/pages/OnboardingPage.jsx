/**
 * OnboardingPage.jsx
 * ==================
 * Shows consent form (scrollable, must sign) and collects username.
 * Calls /api/thesis/participant/<id> to check if already registered.
 * If already registered → restores group and skips screening.
 * If new → continues to ScreeningPage.
 */

import React, { useState, useRef } from 'react';
import axios from 'axios';
import { API_BASE } from '../config/studyConfig';

// Today's date as default for the date fields
const today = new Date();
const todayYear  = today.getFullYear().toString();
const todayMonth = String(today.getMonth() + 1).padStart(2, '0');
const todayDay   = String(today.getDate()).padStart(2, '0');

export default function OnboardingPage({ onComplete }) {
  const [username, setUsername]       = useState('');
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);

  // Consent form fields
  const [participantName, setParticipantName]   = useState('');
  const [signature, setSignature]               = useState('');
  const [dateYear, setDateYear]                 = useState(todayYear);
  const [dateMonth, setDateMonth]               = useState(todayMonth);
  const [dateDay, setDateDay]                   = useState(todayDay);

  // Participant code is derived automatically from the username
  const participantCode = username.trim();

  const consentBoxRef = useRef(null);

  const consentComplete =
    participantName.trim() &&
    signature.trim() &&
    dateYear.trim() &&
    dateMonth.trim() &&
    dateDay.trim();

  const canSubmit = username.trim() && consentComplete;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const id = username.trim();
    if (!id) { setError('Please enter your username.'); return; }
    if (!consentComplete) { setError('Please complete all fields in the consent form before continuing.'); return; }

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

  // ── Styles ────────────────────────────────────────────────────────────────

  const fieldStyle = {
    display: 'inline-block',
    borderBottom: '1.5px solid var(--ink)',
    background: 'transparent',
    outline: 'none',
    border: 'none',
    borderBottom: '1.5px solid var(--ink)',
    fontFamily: 'var(--font-body)',
    fontSize: '0.95rem',
    color: 'var(--ink)',
    padding: '2px 4px',
    minWidth: '140px',
    marginLeft: '4px',
  };

  const narrowFieldStyle = { ...fieldStyle, minWidth: '56px' };

  const bodyTextStyle = {
    fontSize: '0.88rem',
    color: 'var(--ink)',
    lineHeight: 1.85,
  };

  const sectionHeadingStyle = {
    fontSize: '0.82rem',
    fontWeight: 500,
    color: 'var(--ink)',
    marginTop: '1.1rem',
    marginBottom: '0.2rem',
    letterSpacing: '0.01em',
  };

  return (
    <div className="page">
      <div className="page-inner animate-in">

        {/* Header */}
        <div>
          <h3>Read2LearnKanji</h3>
          <h1 style={{ marginTop: '0.5rem' }}>Reading Study</h1>
        </div>

        {/* ── Consent form ─────────────────────────────────────────────────── */}
        <div>
          <p style={{ fontSize: '0.82rem', color: 'var(--ink-faint)', marginBottom: '0.5rem', letterSpacing: '0.01em' }}>
            Please read the consent form in full and sign at the bottom before continuing.
          </p>

          {/* Scrollable legal box */}
          <div
            ref={consentBoxRef}
            style={{
              height: '340px',
              overflowY: 'scroll',
              border: '1.5px solid var(--paper-border)',
              borderRadius: 'var(--radius-md)',
              background: 'white',
              padding: '1.25rem 1.4rem',
              boxShadow: 'inset 0 -12px 16px -12px rgba(0,0,0,0.06)',
            }}
          >
            {/* Title */}
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <p style={{ fontWeight: 500, fontSize: '0.92rem', color: 'var(--ink)', lineHeight: 1.5 }}>
                Explanation and Consent Form Regarding Research Cooperation
              </p>
              <p style={{ fontWeight: 500, fontSize: '0.92rem', color: 'var(--ink)', lineHeight: 1.5 }}>
                "Effects of glossing types on incidental kanji learning"
              </p>
            </div>

            {/* Body */}
            <p style={bodyTextStyle}>To Participants of this experiment,</p>

            <p style={{ ...sectionHeadingStyle, marginTop: '1rem' }}>1. Research Objectives</p>
            <p style={bodyTextStyle}>
              This research aims to explore the use of incidental learning to learn kanji characters through the modification of glossing interactions while reading.
            </p>

            <p style={sectionHeadingStyle}>2. Implementation Details</p>
            <p style={bodyTextStyle}>
              Participants will be asked to first fill in a pre-test questionnaire. During this first questionnaire, participants will be asked to write a username/nickname of their choice without informing the researchers as well as provide contacting information. The contact information collected from the first questionnaire will serve the sole purpose of contacting participants for the second experiment. The contacting information will be erased one month following its acquisition and will be stored in Keio servers.
            </p>
            <p style={{ ...bodyTextStyle, marginTop: '0.6rem' }}>
              Participants will be asked to read a paragraph in Japanese using glossing type A or glossing type B which will be assigned in a sequential manner. Upon finishing the reading, questions will be handed to test the effects of either glossing types.
            </p>
            <p style={{ ...bodyTextStyle, marginTop: '0.6rem' }}>
              Following the quiz questions, a second post-test questionnaire will be provided.
              Any anonymized non-personal data such as usage logs, quiz results, and survey answers will be stored in a MongoDB database.
            </p>

            <p style={sectionHeadingStyle}>3. Handling of Personal Information and Records</p>
            <p style={bodyTextStyle}>
              Collected data will be stored on a cloud server managed by the Keio University Graduate School of Media Design Concordia Real Project (Responsible Person: Dunya Donna Chen) until March 31, 2030, and will be managed with the utmost care to prevent leakage to external parties. Furthermore, the data will be anonymized by assigning numbers, and personal information will be kept confidential when presenting research findings through professional societies, academic journals, and internal research meetings. Any collected photographs or videos that could potentially identify individuals will be blurred during research and publication. This stored data will be stored until March 31, 2030, at the latest after the completion of the research, and then disposed of. Additionally, participants may request the deletion of acquired data at any time and for any reason without prior notice.
            </p>

            <p style={sectionHeadingStyle}>4. Voluntary Participation</p>
            <p style={bodyTextStyle}>
              Participation in this research is voluntary, and you may freely withdraw at any time without giving a reason or any consequences.
            </p>

            {/* Divider before signature block */}
            <div style={{ borderTop: '1px solid var(--paper-border)', margin: '1.5rem 0 1rem' }} />

            <p style={bodyTextStyle}>
              I have received a full explanation regarding the implementation of the above research, understand the following points, and agree to participate in and cooperate with this research.
            </p>

            <p style={{ ...bodyTextStyle, marginTop: '0.85rem' }}>
              ● I agree not to receive any payment for participating in this research.
            </p>
            <p style={{ ...bodyTextStyle, marginTop: '0.4rem' }}>
              ● I understand that participation in this research is voluntary and that I can withdraw at any time.
            </p>

            {/* Signature fields */}
            <div style={{ marginTop: '1.4rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>

              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.3rem' }}>
                <span style={{ ...bodyTextStyle, whiteSpace: 'nowrap' }}>Participant Name:</span>
                <input
                  type="text"
                  value={participantName}
                  onChange={e => setParticipantName(e.target.value)}
                  placeholder="Full name"
                  style={fieldStyle}
                  autoComplete="off"
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.3rem' }}>
                <span style={{ ...bodyTextStyle, whiteSpace: 'nowrap' }}>Participant Signature:</span>
                <input
                  type="text"
                  value={signature}
                  onChange={e => setSignature(e.target.value)}
                  placeholder="Type your signature"
                  style={{ ...fieldStyle, fontStyle: 'italic' }}
                  autoComplete="off"
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.3rem' }}>
                <span style={{ ...bodyTextStyle, whiteSpace: 'nowrap' }}>Date:</span>
                <input
                  type="text"
                  value={dateYear}
                  onChange={e => setDateYear(e.target.value.slice(0, 4))}
                  placeholder="YYYY"
                  style={narrowFieldStyle}
                  maxLength={4}
                />
                <span style={bodyTextStyle}>/</span>
                <input
                  type="text"
                  value={dateMonth}
                  onChange={e => setDateMonth(e.target.value.slice(0, 2))}
                  placeholder="MM"
                  style={{ ...narrowFieldStyle, minWidth: '40px' }}
                  maxLength={2}
                />
                <span style={bodyTextStyle}>/</span>
                <input
                  type="text"
                  value={dateDay}
                  onChange={e => setDateDay(e.target.value.slice(0, 2))}
                  placeholder="DD"
                  style={{ ...narrowFieldStyle, minWidth: '40px' }}
                  maxLength={2}
                />
              </div>

            </div>

            {/* Research info block */}
            <div style={{
              marginTop: '1.5rem',
              padding: '0.85rem 1rem',
              background: 'var(--paper-warm)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem',
            }}>
              <p style={{ ...bodyTextStyle, fontWeight: 500 }}>
                Project Name: "Effects of glossing types on incidental kanji learning"
              </p>
              <p style={bodyTextStyle}>Affiliation: Keio University Graduate School of Media Design (KMD)</p>
              <p style={bodyTextStyle}>Research Leader: Dunya Donna Chen</p>
              <p style={bodyTextStyle}>Contact: kmdconcordia@gmail.com</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                <span style={bodyTextStyle}>Participant Code:</span>
                <span style={{
                  ...bodyTextStyle,
                  fontWeight: 500,
                  color: participantCode ? 'var(--ink)' : 'var(--ink-faint)',
                  fontStyle: participantCode ? 'normal' : 'italic',
                  marginLeft: '4px',
                }}>
                  {participantCode || '(enter your username below)'}
                </span>
              </div>
            </div>

            {/* Scroll indicator padding */}
            <div style={{ height: '0.5rem' }} />
          </div>

          {/* Scroll hint */}
          <p style={{ fontSize: '0.75rem', color: 'var(--ink-faint)', marginTop: '0.4rem', textAlign: 'right' }}>
            Scroll down inside the box to read and sign ↓
          </p>
        </div>

        {/* ── Username ──────────────────────────────────────────────────────── */}
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
            {loading ? 'Checking...' : 'I consent — Continue →'}
          </button>
        </form>

        {/* Footer */}
        <p style={{ fontSize: '0.8rem', textAlign: 'center', color: 'var(--ink-faint)' }}>
          Your data will be anonymized and handled in accordance with the consent form above.
        </p>

      </div>
    </div>
  );
}
