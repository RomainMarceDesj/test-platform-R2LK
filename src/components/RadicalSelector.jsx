/**
 * RadicalSelector.jsx
 * ===================
 * Shared component for mid-quiz and radical noticing test.
 * Displays radical chips sorted by stroke count + a search bar.
 * Tracks: selected radicals, search bar usage, search queries, time to submit.
 * The direct/indirect distinction is NOT shown in the UI — kept only for scoring.
 *
 * Props:
 *  candidateRadicals  [{ radical, english_names, is_direct, stroke_count }]
 *  onSubmit           ({ selected, usedSearch, searchQueries, timeToSubmitMs })
 *  submitLabel        string
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';

export default function RadicalSelector({
  candidateRadicals = [],
  onSubmit,
  submitLabel = 'Submit',
}) {
  const [selected, setSelected]           = useState(new Set());
  const [searchQuery, setSearchQuery]     = useState('');
  const [usedSearch, setUsedSearch]       = useState(false);
  const [searchQueries, setSearchQueries] = useState([]);
  const [freeText, setFreeText]           = useState('');

  const startTimeRef   = useRef(Date.now());
  const searchInputRef = useRef(null);

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // ── Sort by stroke count, then filter by search ───────────────────────────
  const sorted = [...candidateRadicals].sort((a, b) =>
    (a.stroke_count ?? 99) - (b.stroke_count ?? 99)
  );

  const filtered = searchQuery.trim()
    ? sorted.filter(r => {
        const q = searchQuery.toLowerCase();
        return (
          r.radical.includes(q) ||
          r.english_names?.some(n => n.toLowerCase().includes(q))
        );
      })
    : sorted;

  // Group by stroke count for display
  const byStroke = filtered.reduce((acc, r) => {
    const sc = r.stroke_count ?? 0;
    if (!acc[sc]) acc[sc] = [];
    acc[sc].push(r);
    return acc;
  }, {});
  const strokeGroups = Object.entries(byStroke)
    .sort(([a], [b]) => Number(a) - Number(b));

  // ── Interaction ───────────────────────────────────────────────────────────
  const toggleRadical = useCallback((radical) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(radical)) next.delete(radical);
      else next.add(radical);
      return next;
    });
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim() && !usedSearch) setUsedSearch(true);
    if (val.trim()) {
      setSearchQueries(prev => {
        const last = prev[prev.length - 1] ?? '';
        return val !== last ? [...prev, val] : prev;
      });
    }
  };

  const handleSubmit = () => {
    const timeToSubmitMs = Date.now() - startTimeRef.current;
    onSubmit({
      selected: Array.from(selected),
      used_search: usedSearch,
      search_queries: searchQueries,
      time_to_submit_ms: timeToSubmitMs,
      free_text_radicals: freeText.trim() || null,
    });
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* Search bar */}
      <div className="search-wrap">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          ref={searchInputRef}
          type="search"
          placeholder="Search by name or character…"
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }}
        />
      </div>

      {/* Radicals grouped by stroke count */}
      {strokeGroups.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {strokeGroups.map(([sc, radicals]) => (
            <div key={sc}>
              <div style={{
                fontSize: '0.68rem',
                fontWeight: 500,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--ink-faint)',
                marginBottom: '0.4rem',
              }}>
                {sc} stroke{Number(sc) !== 1 ? 's' : ''}
              </div>
              <div className="radical-chip-grid">
                {radicals.map(r => (
                  <RadicalChip
                    key={r.radical}
                    radical={r}
                    isSelected={selected.has(r.radical)}
                    onToggle={toggleRadical}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ fontSize: '0.875rem', color: 'var(--ink-faint)', textAlign: 'center', padding: '1rem' }}>
          No radicals match "{searchQuery}"
        </p>
      )}

      {/* Selected count */}
      {selected.size > 0 && (
        <p style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
          {selected.size} radical{selected.size !== 1 ? 's' : ''} selected
        </p>
      )}

      {/* Free-text fallback */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <label style={{
          fontSize: '0.82rem',
          color: 'var(--ink-muted)',
          lineHeight: 1.5,
        }}>
          If you cannot find the radical you are looking for, you can write its name here:
        </label>
        <textarea
          value={freeText}
          onChange={e => setFreeText(e.target.value.slice(0, 300))}
          placeholder="e.g. fire, grass, mouth…"
          rows={2}
          style={{
            width: '100%',
            padding: '0.6rem 0.8rem',
            border: '1px solid var(--paper-border)',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-body)',
            fontSize: '0.9rem',
            color: 'var(--ink)',
            background: 'white',
            resize: 'none',
            outline: 'none',
            lineHeight: 1.5,
            boxSizing: 'border-box',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--paper-border)'}
        />
      </div>

      {/* Submit */}
      <button className="btn btn-primary btn-full" onClick={handleSubmit}>
        {submitLabel}
      </button>

      <p style={{ fontSize: '0.82rem', color: 'var(--ink-muted)', textAlign: 'center', lineHeight: 1.55 }}>
        Select any radicals you remember seeing. If you don't remember any,{' '}
        <strong>leave everything unselected</strong> and tap submit — you don't need to click anything to continue.
      </p>

    </div>
  );
}

function RadicalChip({ radical, isSelected, onToggle }) {
  const name = radical.english_names?.[0] ?? '';
  return (
    <button
      className={`radical-chip ${isSelected ? 'selected' : ''}`}
      onClick={() => onToggle(radical.radical)}
    >
      <span className="chip-char" style={{ fontFamily: 'var(--font-jp)', fontSize: '1.1rem' }}>
        {radical.radical}
      </span>
      {name && <span className="chip-name" style={{ fontSize: '0.72rem' }}>{name}</span>}
    </button>
  );
}
