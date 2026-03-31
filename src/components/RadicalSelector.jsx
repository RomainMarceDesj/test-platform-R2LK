/**
 * RadicalSelector.jsx
 * ===================
 * Shared component for mid-quiz and radical noticing test.
 * Displays a chip grid of candidate radicals + a search bar.
 * Tracks: selected radicals, search bar usage, search queries, time to submit.
 *
 * Props:
 *  candidateRadicals  [{ radical, english_names, is_direct }]
 *  onSubmit           ({ selected, usedSearch, searchQueries, timeToSubmitMs })
 *  submitLabel        string
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';

export default function RadicalSelector({
  candidateRadicals = [],
  onSubmit,
  submitLabel = 'Submit',
}) {
  const [selected, setSelected]         = useState(new Set());
  const [searchQuery, setSearchQuery]   = useState('');
  const [usedSearch, setUsedSearch]     = useState(false);
  const [searchQueries, setSearchQueries] = useState([]);

  const startTimeRef  = useRef(Date.now());
  const searchInputRef = useRef(null);

  // Auto-focus search on mount
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // ── Filtering ─────────────────────────────────────────────────────────────
  const filtered = searchQuery.trim()
    ? candidateRadicals.filter(r => {
        const q = searchQuery.toLowerCase();
        return (
          r.radical.includes(q) ||
          r.english_names?.some(n => n.toLowerCase().includes(q))
        );
      })
    : candidateRadicals;

  // Direct radicals first, then indirect
  const sorted = [...filtered].sort((a, b) => {
    if (a.is_direct && !b.is_direct) return -1;
    if (!a.is_direct && b.is_direct) return 1;
    return 0;
  });

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
        // Only record meaningful new queries (changed by 1+ chars from last)
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
        />
      </div>

      {/* Direct radicals section */}
      {sorted.filter(r => r.is_direct).length > 0 && (
        <div>
          <div style={{
            fontSize: '0.72rem',
            fontWeight: 500,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--ink-faint)',
            marginBottom: '0.5rem'
          }}>
            Radicals
          </div>
          <div className="radical-chip-grid">
            {sorted.filter(r => r.is_direct).map(r => (
              <RadicalChip
                key={r.radical}
                radical={r}
                isSelected={selected.has(r.radical)}
                onToggle={toggleRadical}
              />
            ))}
          </div>
        </div>
      )}

      {/* Indirect / components of components */}
      {sorted.filter(r => !r.is_direct).length > 0 && (
        <div>
          <div style={{
            fontSize: '0.72rem',
            fontWeight: 500,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--ink-faint)',
            marginBottom: '0.5rem'
          }}>
            Sub-components
          </div>
          <div className="radical-chip-grid">
            {sorted.filter(r => !r.is_direct).map(r => (
              <RadicalChip
                key={r.radical}
                radical={r}
                isSelected={selected.has(r.radical)}
                onToggle={toggleRadical}
              />
            ))}
          </div>
        </div>
      )}

      {/* No results */}
      {sorted.length === 0 && (
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

      {/* Submit */}
      <button
        className="btn btn-primary btn-full"
        onClick={handleSubmit}
      >
        {submitLabel}
      </button>

      <p style={{ fontSize: '0.78rem', color: 'var(--ink-faint)', textAlign: 'center' }}>
        Select all radicals you remember seeing in this kanji. You can select none if you don't remember any.
      </p>
    </div>
  );
}

// ── Chip sub-component ────────────────────────────────────────────────────────

function RadicalChip({ radical, isSelected, onToggle }) {
  const name = radical.english_names?.[0] ?? '';
  return (
    <button
      className={`radical-chip ${isSelected ? 'selected' : ''}`}
      onClick={() => onToggle(radical.radical)}
    >
      <span className="chip-char">{radical.radical}</span>
      {name && <span className="chip-name">{name}</span>}
    </button>
  );
}
