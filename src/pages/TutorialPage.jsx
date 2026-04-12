/**
 * TutorialPage.jsx
 * ================
 * Interactive tutorial — one flow per group, using 駅 as the demo word.
 * No mention of tests or mid-quiz.
 */

import React, { useState } from 'react';
import RadicalSearchTray from '../components/RadicalSearchTray';
import { API_BASE } from '../config/studyConfig';

function Step({ title, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <h2 style={{ lineHeight: 1.35 }}>{title}</h2>
      {children}
    </div>
  );
}

function Callout({ children }) {
  return (
    <div style={{
      background: 'var(--accent-light)',
      border: '1px solid var(--accent)',
      borderRadius: 'var(--radius-md)',
      padding: '0.7rem 1rem',
      fontSize: '0.875rem',
      color: 'var(--accent-dark)',
      lineHeight: 1.55,
    }}>
      {children}
    </div>
  );
}

function SuccessBanner({ children }) {
  return (
    <div style={{
      background: '#e8f5ee',
      border: '1px solid #2d6a4f',
      borderRadius: 'var(--radius-md)',
      padding: '0.7rem 1rem',
      fontSize: '0.875rem',
      color: '#2d6a4f',
    }}>
      ✓ {children}
    </div>
  );
}

function TapTarget({ word, onTap, tapped }) {
  return (
    <span
      onClick={onTap}
      style={{
        fontFamily: 'var(--font-jp)',
        fontSize: '1.3rem',
        cursor: 'pointer',
        padding: '2px 6px',
        borderRadius: '4px',
        background: tapped ? 'var(--accent-light)' : 'white',
        outline: tapped ? '2px solid var(--accent)' : '2px dashed var(--paper-border)',
        outlineOffset: '2px',
        transition: 'all 0.15s',
        userSelect: 'none',
        display: 'inline-block',
      }}
    >
      {word}
    </span>
  );
}

// Demo sentence context — makes sense with 駅
const DEMO_SENTENCE = '漫画は';
const DEMO_SUFFIX   = 'で買える。';

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP B
// ═══════════════════════════════════════════════════════════════════════════════

function TutorialB({ onComplete }) {
  const [step, setStep]           = useState(0);
  const [tapped, setTapped]       = useState(false);
  const [dismissed, setDismissed] = useState(false);

  return (
    <div className="page">
      <div className="page-inner animate-in">
        <div>
          <h3>Before you start</h3>
          <h1 style={{ marginTop: '0.4rem' }}>How to use the reading tool</h1>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {step === 0 && (
            <Step title="Tap any kanji word to look it up">
              <p>While reading, tap any word you don't know. A popup appears immediately with the reading, meaning, and kanji details.</p>
              <div style={{
                background: 'var(--paper-warm)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem 1.25rem',
                fontFamily: 'var(--font-jp)',
                fontSize: '1.15rem',
                lineHeight: 2.6,
              }}>
                {DEMO_SENTENCE}
                <TapTarget
                  word="駅"
                  tapped={tapped}
                  onTap={() => { setTapped(true); setTimeout(() => setStep(1), 350); }}
                />
                {DEMO_SUFFIX}
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--ink-faint)' }}>
                Words with a dashed outline are tappable. Tap <span style={{ fontFamily: 'var(--font-jp)' }}>駅</span> above.
              </p>
            </Step>
          )}

          {step === 1 && !dismissed && (
            <Step title="The popup shows everything at once">
              <p>Reading, meaning, and radicals — all revealed immediately.</p>
              <div style={{
                background: 'white',
                border: '1.5px solid var(--paper-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1rem 1.25rem',
                position: 'relative',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              }}>
                <button
                  onClick={() => { setDismissed(true); setStep(2); }}
                  style={{ position: 'absolute', top: '0.6rem', right: '0.6rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.95rem', color: 'var(--ink-faint)', padding: '4px 8px', lineHeight: 1 }}
                >✕</button>

                <div style={{ fontFamily: 'var(--font-jp)', fontSize: '1.6rem', fontWeight: 500, marginBottom: '0.6rem' }}>駅</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.9rem' }}>
                    <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-faint)', marginRight: '0.5rem' }}>Reading</span>
                    <span style={{ fontFamily: 'var(--font-jp)' }}>えき</span>
                  </div>
                  <div style={{ fontSize: '0.9rem' }}>
                    <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-faint)', marginRight: '0.5rem' }}>Meaning</span>
                    station
                  </div>
                </div>
                <div style={{ borderTop: '1px solid var(--paper-border)', paddingTop: '0.75rem' }}>
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-faint)', marginBottom: '0.5rem' }}>Kanji breakdown</div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                    <span style={{ fontFamily: 'var(--font-jp)', fontSize: '1.2rem', width: '28px', flexShrink: 0 }}>駅</span>
                    <div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--ink-muted)', marginBottom: '0.25rem' }}>station</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                        {[{ r: '馬', n: 'horse' }, { r: '尺', n: 'measure' }].map((r, j) => (
                          <span key={j} style={{ fontSize: '0.78rem', background: 'var(--paper-warm)', borderRadius: '12px', padding: '2px 8px', display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
                            <span style={{ fontFamily: 'var(--font-jp)' }}>{r.r}</span>
                            <span style={{ color: 'var(--ink-faint)' }}>{r.n}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <Callout>To close the popup, tap <strong>✕</strong> or tap anywhere outside it. Try it now.</Callout>
            </Step>
          )}

          {step === 2 && (
            <Step title="You're ready to start">
              <p>That's all there is to it. Tap any word while reading to see its gloss, and tap outside to close it.</p>
              <SuccessBanner>Tutorial complete.</SuccessBanner>
              <Callout>Read the text as naturally as you can. Use the gloss tool whenever you encounter a word you don't know.</Callout>
            </Step>
          )}

        </div>

        {step === 2 && (
          <button className="btn btn-primary btn-full" onClick={onComplete}>Start reading →</button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP A
// ═══════════════════════════════════════════════════════════════════════════════

function TutorialA({ onComplete }) {
  const [step, setStep]                   = useState(0);
  const [tapped, setTapped]               = useState(false);
  const [confirmedKanji, setConfirmedKanji] = useState('');

  const handleSuccess = (selectedKanji) => {
    setConfirmedKanji(selectedKanji);
    setStep(2);
  };

  return (
    <div className="page">
      <div className="page-inner animate-in">
        <div>
          <h3>Before you start</h3>
          <h1 style={{ marginTop: '0.4rem' }}>How to use the reading tool</h1>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Progress dots */}
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {[0,1,2].map(i => (
              <div key={i} className={`progress-dot ${i < step ? 'done' : i === step ? 'active' : ''}`} />
            ))}
          </div>

          {/* Step 0 — tap a word */}
          {step === 0 && (
            <Step title="Tap a word you want to look up">
              <p>When you see a kanji word you don't know, tap it. A search panel will open to help you identify it.</p>
              <div style={{
                background: 'var(--paper-warm)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem 1.25rem',
                fontFamily: 'var(--font-jp)',
                fontSize: '1.15rem',
                lineHeight: 2.6,
              }}>
                {DEMO_SENTENCE}
                <TapTarget
                  word="駅"
                  tapped={tapped}
                  onTap={() => { setTapped(true); setTimeout(() => setStep(1), 350); }}
                />
                {DEMO_SUFFIX}
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--ink-faint)' }}>
                Words with a dashed outline are tappable. Tap <span style={{ fontFamily: 'var(--font-jp)' }}>駅</span> above.
              </p>
            </Step>
          )}

          {/* Step 1 — use the real tray */}
          {step === 1 && (
            <Step title="Search for a radical to narrow it down">
              <p>
                Identify the kanji by searching for its <strong>radicals</strong> — the visual components it is built from.
                Type a radical name in English to search, then select it. The tool will show you kanji that contain it.
              </p>
              <Callout>
                Try typing <strong>"horse"</strong> — one of the radicals in <span style={{ fontFamily: 'var(--font-jp)' }}>駅</span>.
                Select the radical, then pick <span style={{ fontFamily: 'var(--font-jp)' }}>駅</span> from the candidates and confirm.
              </Callout>
            </Step>
          )}

          {/* Step 2 — confirmed */}
          {step === 2 && (
            <Step title="Reading and meaning are revealed">
              <p>Once you confirm your selection, the reading and meaning appear. You can tap the same word again anytime to review.</p>
              <div style={{ background: 'var(--paper-warm)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem' }}>
                <div style={{ fontFamily: 'var(--font-jp)', fontSize: '1.5rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                  {confirmedKanji || '駅'}
                </div>
                <div style={{ fontSize: '0.9rem', marginBottom: '0.15rem' }}>
                  <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-faint)', marginRight: '0.5rem' }}>Reading</span>
                  <span style={{ fontFamily: 'var(--font-jp)' }}>えき</span>
                </div>
                <div style={{ fontSize: '0.9rem' }}>
                  <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-faint)', marginRight: '0.5rem' }}>Meaning</span>
                  station
                </div>
              </div>
              <SuccessBanner>Tutorial complete.</SuccessBanner>
              <Callout>Read the text as naturally as you can. Use the tool whenever you encounter a word you don't know.</Callout>
            </Step>
          )}

        </div>

        {/* Real tray — mounted during step 1 */}
        {step === 1 && (
          <RadicalSearchTray
            targetKanji="駅"
            isOpen={true}
            onSuccess={handleSuccess}
            onClose={() => {}}
            apiBase={API_BASE}
          />
        )}

        {step === 2 && (
          <button className="btn btn-primary btn-full" onClick={onComplete}>Start reading →</button>
        )}
      </div>
    </div>
  );
}

export default function TutorialPage({ group, onComplete }) {
  if (group === 'B') return <TutorialB onComplete={onComplete} />;
  return <TutorialA onComplete={onComplete} />;
}
