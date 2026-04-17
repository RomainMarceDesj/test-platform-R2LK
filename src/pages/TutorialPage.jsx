/**
 * TutorialPage.jsx
 * ================
 * Interactive tutorial — one flow per group, using 駅 as the demo word.
 * No mention of tests or mid-quiz.
 */

import React, { useState } from 'react';

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
  const [searchVal, setSearchVal]         = useState('');
  const [radicalPicked, setRadicalPicked] = useState(false);
  const [kanjiPicked, setKanjiPicked]     = useState(false);

  // 駅 contains 馬 (horse) — search trigger
  const showResults = searchVal.toLowerCase().includes('hors') ||
                      searchVal.toLowerCase().includes('uma') ||
                      searchVal === '馬';

  return (
    <div className="page">
      <div className="page-inner animate-in">
        <div>
          <h3>Before you start</h3>
          <h1 style={{ marginTop: '0.4rem' }}>How to use the reading tool</h1>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Tutorial video */}
          <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', aspectRatio: '9/16', width: '100%', maxWidth: '320px', alignSelf: 'center', background: '#000' }}>
            <iframe
              src="https://www.youtube.com/embed/xD3Hete9AiM?rel=0&modestbranding=1"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
            />
          </div>

          {/* Progress dots */}
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {[0,1,2,3].map(i => (
              <div key={i} className={`progress-dot ${i < step ? 'done' : i === step ? 'active' : ''}`} />
            ))}
          </div>

          {/* Step 0 — tap a word */}
          {step === 0 && (
            <Step title="Tap a word you want to look up">
              <p>When you see a kanji word you don't know, tap it. A panel will open to help you identify it.</p>
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

          {/* Step 1 — search a radical */}
          {step === 1 && (
            <Step title="Search for a radical by name">
              <p>
                You identify the kanji by searching for its <strong>radicals</strong> — the visual building blocks it is made of.
              </p>
              <p>
                Type a radical name in English. Try <strong>"horse"</strong> — one of the radicals in <span style={{ fontFamily: 'var(--font-jp)' }}>駅</span>.
              </p>
              <input
                type="text"
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                placeholder='Type "horse"…'
                autoFocus
              />
              {showResults && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)' }}>Radical found — tap it to add it to your filter:</p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {[{ r: '馬', n: 'horse' }].map((rad, i) => (
                      <button
                        key={i}
                        className={`radical-chip ${radicalPicked ? 'selected' : ''}`}
                        onClick={() => { setRadicalPicked(true); setTimeout(() => setStep(2), 350); }}
                      >
                        <span className="chip-char" style={{ fontFamily: 'var(--font-jp)', fontSize: '1.1rem' }}>{rad.r}</span>
                        <span className="chip-name">{rad.n}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {!showResults && searchVal.length > 0 && (
                <p style={{ fontSize: '0.85rem', color: 'var(--ink-faint)' }}>Keep typing — try "horse"</p>
              )}
            </Step>
          )}

          {/* Step 2 — pick the kanji */}
          {step === 2 && (
            <Step title="Select the correct kanji from the candidates">
              <p>
                The tool shows kanji that contain that radical. Tap the one that matches the word you saw in the text.
              </p>
              <div style={{ background: 'var(--paper-warm)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem' }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-faint)', marginBottom: '0.5rem' }}>
                  Candidates containing 馬:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {['駅', '騒', '験', '駆', '騎'].map(k => (
                    <button
                      key={k}
                      onClick={() => {
                        if (k === '駅') {
                          setKanjiPicked(true);
                          setTimeout(() => setStep(3), 400);
                        }
                      }}
                      style={{
                        fontFamily: 'var(--font-jp)',
                        fontSize: '1.3rem',
                        width: '48px',
                        height: '48px',
                        border: '1.5px solid var(--paper-border)',
                        borderRadius: 'var(--radius-md)',
                        background: kanjiPicked && k === '駅' ? 'var(--accent-light)' : 'white',
                        outline: kanjiPicked && k === '駅' ? '2px solid var(--accent)' : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.12s',
                      }}
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </div>
              <Callout>
                Tap <span style={{ fontFamily: 'var(--font-jp)' }}>駅</span> — it's the kanji you saw in the text.
              </Callout>
            </Step>
          )}

          {/* Step 3 — result revealed */}
          {step === 3 && (
            <Step title="The reading and meaning are revealed">
              <p>Once you confirm your selection, the reading and meaning appear. You can tap the same word again anytime to review.</p>
              <div style={{ background: 'var(--paper-warm)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem' }}>
                <div style={{ fontFamily: 'var(--font-jp)', fontSize: '1.5rem', fontWeight: 500, marginBottom: '0.5rem' }}>
                  駅{' '}
                  <ruby style={{ fontSize: '0.65em' }}><rt style={{ color: 'var(--ink-muted)' }}>えき</rt></ruby>
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--ink-muted)' }}>station</div>
              </div>
              <SuccessBanner>Tutorial complete.</SuccessBanner>
              <Callout>Read the text as naturally as you can. Use the tool whenever you encounter a word you don't know.</Callout>
            </Step>
          )}

        </div>

        {step === 3 && (
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
