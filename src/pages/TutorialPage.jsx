/**
 * TutorialPage.jsx
 * ================
 * Focused interactive tutorial — one flow per group.
 * Group A: walks through radical search tray step by step with a live sim.
 * Group B: walks through the classic popup with a live sim.
 * No mention of the mid-quiz or any test.
 */

import React, { useState } from 'react';

// ── Shared helpers ────────────────────────────────────────────────────────────

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

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP B — Classic popup tutorial
// ═══════════════════════════════════════════════════════════════════════════════

function TutorialB({ onComplete }) {
  const [step, setStep] = useState(0);
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

          {/* Step 0 — tap a word */}
          {step === 0 && (
            <Step title="Tap any kanji word to look it up">
              <p>
                While reading, tap any word you don't know. A popup appears immediately with the reading, meaning, and kanji details.
              </p>
              <div style={{
                background: 'var(--paper-warm)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem 1.25rem',
                fontFamily: 'var(--font-jp)',
                fontSize: '1.15rem',
                lineHeight: 2.6,
              }}>
                大人たちも{' '}
                <TapTarget
                  word="漫画"
                  tapped={tapped}
                  onTap={() => { setTapped(true); setTimeout(() => setStep(1), 350); }}
                />
                {' '}を読んでいる。
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--ink-faint)' }}>
                Words with a dashed outline are tappable. Tap 漫画 above.
              </p>
            </Step>
          )}

          {/* Step 1 — show popup, explain contents */}
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
                  style={{
                    position: 'absolute', top: '0.6rem', right: '0.6rem',
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: '0.95rem', color: 'var(--ink-faint)', padding: '4px 8px',
                    lineHeight: 1,
                  }}
                >✕</button>

                <div style={{ fontFamily: 'var(--font-jp)', fontSize: '1.6rem', fontWeight: 500, marginBottom: '0.6rem' }}>
                  漫画
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.9rem' }}>
                    <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-faint)', marginRight: '0.5rem' }}>Reading</span>
                    <span style={{ fontFamily: 'var(--font-jp)' }}>まんが</span>
                  </div>
                  <div style={{ fontSize: '0.9rem' }}>
                    <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-faint)', marginRight: '0.5rem' }}>Meaning</span>
                    manga, comic
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--paper-border)', paddingTop: '0.75rem' }}>
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-faint)', marginBottom: '0.5rem' }}>
                    Kanji breakdown
                  </div>
                  {[
                    { char: '漫', meaning: 'loose, rough', radicals: [{ r: '氵', n: 'water' }, { r: '又', n: 'again' }] },
                    { char: '画', meaning: 'picture, stroke', radicals: [{ r: '田', n: 'field' }, { r: '凵', n: 'container' }] },
                  ].map((k, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontFamily: 'var(--font-jp)', fontSize: '1.2rem', width: '28px', flexShrink: 0 }}>{k.char}</span>
                      <div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--ink-muted)', marginBottom: '0.25rem' }}>{k.meaning}</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                          {k.radicals.map((r, j) => (
                            <span key={j} style={{
                              fontSize: '0.78rem',
                              background: 'var(--paper-warm)',
                              borderRadius: '12px',
                              padding: '2px 8px',
                              display: 'inline-flex',
                              gap: '4px',
                              alignItems: 'center',
                            }}>
                              <span style={{ fontFamily: 'var(--font-jp)' }}>{r.r}</span>
                              <span style={{ color: 'var(--ink-faint)' }}>{r.n}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Callout>
                To close the popup, tap <strong>✕</strong> or tap anywhere outside it. Try it now.
              </Callout>
            </Step>
          )}

          {/* Step 2 — done */}
          {step === 2 && (
            <Step title="You're ready to start">
              <p>
                That's all there is to it. Tap any word while reading to see its gloss, and tap outside to close it.
              </p>
              <SuccessBanner>Tutorial complete.</SuccessBanner>
              <Callout>
                Read the text as naturally as you can. Use the gloss tool whenever you encounter a word you don't know.
              </Callout>
            </Step>
          )}

        </div>

        {step === 2 && (
          <button className="btn btn-primary btn-full" onClick={onComplete}>
            Start reading →
          </button>
        )}

      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP A — Radical search tray tutorial
// ═══════════════════════════════════════════════════════════════════════════════

function TutorialA({ onComplete }) {
  const [step, setStep]             = useState(0);
  const [tapped, setTapped]         = useState(false);
  const [searchVal, setSearchVal]   = useState('');
  const [radicalPicked, setRadicalPicked] = useState(false);
  const [kanjiPicked, setKanjiPicked]     = useState(false);

  const showResults = searchVal.toLowerCase().includes('wat') || searchVal === '氵';

  return (
    <div className="page">
      <div className="page-inner animate-in">

        <div>
          <h3>Before you start</h3>
          <h1 style={{ marginTop: '0.4rem' }}>How to use the reading tool</h1>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Progress */}
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {[0,1,2,3].map(i => (
              <div key={i} className={`progress-dot ${i < step ? 'done' : i === step ? 'active' : ''}`} />
            ))}
          </div>

          {/* Step 0 — tap a word */}
          {step === 0 && (
            <Step title="Tap a word you want to look up">
              <p>
                When you see a kanji word you don't know, tap it. A panel will open to help you identify it.
              </p>
              <div style={{
                background: 'var(--paper-warm)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem 1.25rem',
                fontFamily: 'var(--font-jp)',
                fontSize: '1.15rem',
                lineHeight: 2.6,
              }}>
                大人たちも{' '}
                <TapTarget
                  word="漫画"
                  tapped={tapped}
                  onTap={() => { setTapped(true); setTimeout(() => setStep(1), 350); }}
                />
                {' '}を読んでいる。
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--ink-faint)' }}>
                Words with a dashed outline are tappable. Tap 漫画 above.
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
                Type a radical name in English. Try <strong>"water"</strong> — one of the radicals in 漫.
              </p>

              <input
                type="text"
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                placeholder='Type "water"…'
                autoFocus
              />

              {showResults && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)' }}>
                    Radicals found — tap one to add it to your filter:
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {[{ r: '氵', n: 'water (3-stroke)' }, { r: '水', n: 'water (4-stroke)' }].map((rad, i) => (
                      <button
                        key={i}
                        className={`radical-chip ${radicalPicked && rad.r === '氵' ? 'selected' : ''}`}
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
                <p style={{ fontSize: '0.85rem', color: 'var(--ink-faint)' }}>Keep typing — try "water"</p>
              )}
            </Step>
          )}

          {/* Step 2 — pick the kanji */}
          {step === 2 && (
            <Step title="Select the correct kanji from the candidates">
              <p>
                The tool shows kanji that contain that radical. Tap the one that matches the word you saw — here it's{' '}
                <span style={{ fontFamily: 'var(--font-jp)', fontSize: '1.05rem' }}>漫</span>.
              </p>

              <div style={{
                background: 'var(--paper-warm)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1rem',
              }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-faint)', marginBottom: '0.5rem' }}>
                  Candidates containing 氵:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {['漫', '漁', '湖', '海', '波', '泳'].map(k => (
                    <button
                      key={k}
                      onClick={() => { if (k === '漫') { setKanjiPicked(true); setTimeout(() => setStep(3), 400); } }}
                      style={{
                        fontFamily: 'var(--font-jp)',
                        fontSize: '1.3rem',
                        width: '48px',
                        height: '48px',
                        border: '1.5px solid var(--paper-border)',
                        borderRadius: 'var(--radius-md)',
                        background: kanjiPicked && k === '漫' ? 'var(--accent-light)' : 'white',
                        outline: kanjiPicked && k === '漫' ? '2px solid var(--accent)' : 'none',
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
                Tap <span style={{ fontFamily: 'var(--font-jp)' }}>漫</span> — it's the first character of 漫画.
              </Callout>
            </Step>
          )}

          {/* Step 3 — result revealed */}
          {step === 3 && (
            <Step title="The reading and meaning are revealed">
              <p>
                Once you confirm your selection, the reading and meaning appear. You can tap the same word again anytime to review.
              </p>

              <div style={{
                background: 'var(--paper-warm)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem 1.25rem',
              }}>
                <div style={{ fontFamily: 'var(--font-jp)', fontSize: '1.5rem', fontWeight: 500, marginBottom: '0.5rem' }}>
                  漫画
                  <ruby style={{ fontSize: '0.65em', marginLeft: '0.3em' }}><rt style={{ color: 'var(--ink-muted)' }}>まんが</rt></ruby>
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--ink-muted)' }}>manga, comic</div>
              </div>

              <SuccessBanner>Tutorial complete.</SuccessBanner>

              <Callout>
                Read the text as naturally as you can. Use the tool whenever you encounter a word you don't know.
              </Callout>
            </Step>
          )}

        </div>

        {step === 3 && (
          <button className="btn btn-primary btn-full" onClick={onComplete}>
            Start reading →
          </button>
        )}

      </div>
    </div>
  );
}

// ── Router — strict group separation ─────────────────────────────────────────

export default function TutorialPage({ group, onComplete }) {
  if (group === 'B') return <TutorialB onComplete={onComplete} />;
  return <TutorialA onComplete={onComplete} />;
}
