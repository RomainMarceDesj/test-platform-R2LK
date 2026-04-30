/**
 * RadicalSearchTray.jsx — Thesis Platform
 */

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function RadicalSearchTray({ targetKanji, onSuccess, onClose, isOpen, apiBase }) {

  const [trayState, setTrayState]               = useState('half');
  const [searchQuery, setSearchQuery]           = useState('');
  const [radicalSuggestions, setRadicalSuggestions] = useState([]);
  const [isSearching, setIsSearching]           = useState(false);
  const [selectedRadicals, setSelectedRadicals] = useState([]);
  const [candidateKanji, setCandidateKanji]     = useState([]);
  const [candidateCount, setCandidateCount]     = useState(0);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [viewMode, setViewMode]                 = useState('search');

  // Browse: filtered radical groups from server (±3 window)
  const [browseGroups, setBrowseGroups]         = useState([]);
  const [hasFetchedBrowse, setHasFetchedBrowse] = useState(false);

  // Selected kanji details
  const [kanjiRadicalDetails, setKanjiRadicalDetails] = useState({});
  const [kanjiInsideDetails, setKanjiInsideDetails]   = useState({});
  const [kanjiInfo, setKanjiInfo]                     = useState({});

  const radicalsClickedRef = useRef([]);
  const searchInputRef     = useRef(null);

  const kanjiCount = [...targetKanji].filter(c => /[\u4E00-\u9FFF]/.test(c)).length || 1;
  const canConfirm = selectedCandidates.length === kanjiCount;

  // Focus search on open
  useEffect(() => {
    if (isOpen && trayState === 'half') {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen, trayState]);

  // Debounced radical search
  useEffect(() => {
    if (!searchQuery.trim()) { setRadicalSuggestions([]); return; }
    const t = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await axios.post(`${apiBase}/api/radicals/search`, { query: searchQuery });
        setRadicalSuggestions(res.data);
      } catch (e) {
        console.error('Radical search error:', e);
        setRadicalSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery, apiBase]);

  // Fetch browse-filtered (±3) when entering browse mode
  useEffect(() => {
    if (viewMode !== 'browse' || hasFetchedBrowse) return;
    const fetchBrowse = async () => {
      try {
        const kanjiChars = [...targetKanji].filter(c => /[\u4E00-\u9FFF]/.test(c));
        const charsToFetch = kanjiChars.length > 0 ? kanjiChars : [targetKanji[0]];
        // Collect all radicals with their stroke counts, deduped
        const seen = new Set();
        const allRadicals = [];
        for (const char of charsToFetch) {
          const res = await axios.post(`${apiBase}/api/radicals/browse-filtered`, {
            target_kanji: char,
            window_size: 3,
          });
          for (const group of res.data?.groups ?? []) {
            for (const r of group.radicals) {
              if (!seen.has(r.radical)) {
                seen.add(r.radical);
                // stroke_count is now on the radical object itself (from the fixed backend)
                allRadicals.push({ ...r, stroke_count: r.stroke_count ?? group.stroke_count ?? 0 });
              }
            }
          }
        }
        // Group by stroke count, sorted
        const byStroke = {};
        for (const r of allRadicals) {
          const sc = r.stroke_count ?? 0;
          if (!byStroke[sc]) byStroke[sc] = [];
          byStroke[sc].push(r);
        }
        const groups = Object.entries(byStroke)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([sc, radicals]) => ({ sc: Number(sc), radicals }));
        setBrowseGroups(groups);
        setHasFetchedBrowse(true);
      } catch (e) {
        console.error('Browse fetch failed:', e);
      }
    };
    fetchBrowse();
  }, [viewMode, targetKanji, apiBase, hasFetchedBrowse]);

  // Filter candidates when selected radicals change
  useEffect(() => {
    if (selectedRadicals.length === 0) { setCandidateKanji([]); setCandidateCount(0); return; }
    const filter = async () => {
      try {
        const res = await axios.post(`${apiBase}/api/radicals/kanji-by-components`, {
          components: selectedRadicals.map(r => r.radical)
        });
        setCandidateKanji(res.data.kanji_list ?? []);
        setCandidateCount(res.data.count ?? 0);
      } catch (e) { setCandidateKanji([]); setCandidateCount(0); }
    };
    filter();
  }, [selectedRadicals, apiBase]);

  // Fetch kanji details (radicals + kanji_inside + readings)
  const fetchKanjiDetails = async (kanji) => {
    if (kanjiRadicalDetails[kanji] !== undefined) return;
    // Set placeholder to avoid double-fetch
    setKanjiRadicalDetails(prev => ({ ...prev, [kanji]: null }));
    try {
      const res = await axios.post(`${apiBase}/api/radicals/for-kanji`, { word: kanji });
      const d = res.data[0];
      if (d) {
        // Radicals only — exclude any that are also in kanji_inside
        const kanjiInside = d.kanji_inside ?? [];
        const kanjiInsideChars = new Set(kanjiInside.map(k => typeof k === 'string' ? k : k.kanji));
        const pureRadicals = (d.radicals ?? []).filter(r => !kanjiInsideChars.has(r.radical));
        setKanjiRadicalDetails(prev => ({ ...prev, [kanji]: pureRadicals }));
        setKanjiInsideDetails(prev => ({ ...prev, [kanji]: kanjiInside }));
        const toArr = v => Array.isArray(v) ? v : (v ? [v] : []);
        setKanjiInfo(prev => ({
          ...prev,
          [kanji]: {
            meaning: d.meaning || '',
            on:  toArr(d.on).slice(0, 2),
            kun: toArr(d.kun).slice(0, 2),
          }
        }));
      }
    } catch (e) {
      console.error('fetchKanjiDetails failed:', e);
      setKanjiRadicalDetails(prev => ({ ...prev, [kanji]: [] }));
    }
  };

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleRadicalSelect = (radical) => {
    const already = selectedRadicals.find(r => r.radical === radical.radical);
    if (already) {
      setSelectedRadicals(prev => prev.filter(r => r.radical !== radical.radical));
    } else {
      setSelectedRadicals(prev => [...prev, {
        radical: radical.radical,
        primary_english: radical.primary_english || radical.english_names?.[0] || '',
        english_names: radical.english_names || [radical.primary_english || ''],
        stroke_count: radical.stroke_count || 0,
      }]);
      if (!radicalsClickedRef.current.includes(radical.radical)) {
        radicalsClickedRef.current = [...radicalsClickedRef.current, radical.radical];
      }
    }
    if (viewMode === 'search') setSearchQuery('');
  };

  const handleKanjiSelect = (kanji) => {
    if (selectedCandidates.includes(kanji)) return;
    setSelectedCandidates(prev => [...prev, kanji]);
    setSelectedRadicals([]);
    setCandidateKanji([]);
    fetchKanjiDetails(kanji);
  };

  const handleRemoveSelectedKanji = (kanji, e) => {
    e.stopPropagation();
    setSelectedCandidates(prev => prev.filter(k => k !== kanji));
  };

  const handleConfirm = () => {
    if (!canConfirm) return;
    onSuccess(selectedCandidates.join(''), radicalsClickedRef.current);
  };

  const handleClose = () => {
    setTrayState('collapsed');
    setTimeout(() => {
      onClose();
      setSearchQuery('');
      setSelectedRadicals([]);
      setCandidateKanji([]);
      setRadicalSuggestions([]);
      setSelectedCandidates([]);
      radicalsClickedRef.current = [];
    }, 300);
  };

  if (!isOpen) return null;

  // ── Selected candidates block (reused in both modes) ───────────────────────

  const SelectedCandidatesBlock = selectedCandidates.length > 0 ? (
    <div className="selected-candidates-section">
      <div className="section-label">
        Your Selection ({selectedCandidates.length}/{kanjiCount}):
      </div>
      <div className="selected-candidates-display">
        {selectedCandidates.map((kanji, i) => {
          const info      = kanjiInfo[kanji];
          const radicals  = kanjiRadicalDetails[kanji];
          const inside    = kanjiInsideDetails[kanji] ?? [];
          return (
            <div key={i} className="selected-candidate-entry">

              {/* Kanji + meaning + remove */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <span style={{
                  fontFamily: 'var(--font-jp)', fontSize: '1.8rem', fontWeight: 500,
                  color: '#185fa5', background: 'white', padding: '4px 10px',
                  borderRadius: 'var(--radius-md)', border: '1.5px solid #185fa5',
                }}>
                  {kanji}
                </span>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {info?.meaning && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>{info.meaning}</span>
                  )}
                  {/* Kun/On readings */}
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {info?.kun?.map((r, ri) => (
                      <span key={`kun${ri}`} style={{
                        fontFamily: 'var(--font-jp)', fontSize: '0.72rem',
                        background: '#f0faf5', border: '1px solid #2d6a4f',
                        color: '#2d6a4f', borderRadius: '10px', padding: '1px 6px',
                      }}>
                        kun: {r}
                      </span>
                    ))}
                    {info?.on?.map((r, ri) => (
                      <span key={`on${ri}`} style={{
                        fontFamily: 'var(--font-jp)', fontSize: '0.72rem',
                        background: '#e8f0fe', border: '1px solid #185fa5',
                        color: '#185fa5', borderRadius: '10px', padding: '1px 6px',
                      }}>
                        on: {r}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={(e) => handleRemoveSelectedKanji(kanji, e)}
                  title="Remove"
                  style={{
                    background: 'none', border: '1px solid var(--paper-border)',
                    borderRadius: '50%', width: '22px', height: '22px',
                    cursor: 'pointer', fontSize: '0.7rem', color: 'var(--ink-faint)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}
                >✕</button>
              </div>

              {/* Radicals */}
              {radicals === null && (
                <span style={{ fontSize: '0.75rem', color: 'var(--ink-faint)' }}>Loading…</span>
              )}
              {radicals?.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-faint)', marginBottom: '3px' }}>
                    Radicals
                  </div>
                  <div className="candidate-radical-reveal">
                    {radicals.map((r, j) => (
                      <span key={j} className="reveal-radical-chip">
                        <span className="radical-character">{r.radical}</span>
                        <span className="radical-meaning">{r.english_names?.slice(0, 2).join(' / ')}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Kanji inside — separate section with on readings */}
              {inside.length > 0 && (
                <div style={{ marginTop: '5px' }}>
                  <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-faint)', marginBottom: '3px' }}>
                    Kanji inside
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {inside.map((k, ki) => {
                      const kChar    = typeof k === 'string' ? k : k.kanji;
                      const kMeaning = typeof k === 'string' ? '' : (k.meaning || '');
                      const toArr2 = v => Array.isArray(v) ? v : (v ? [v] : []);
                      const kOn      = typeof k === 'string' ? [] : toArr2(k.on).slice(0, 2);
                      return (
                        <div key={ki} style={{
                          display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
                          gap: '2px', background: '#e8f0fe', border: '1px solid #c5d5f5',
                          borderRadius: '8px', padding: '4px 8px', minWidth: '48px',
                        }}>
                          <span style={{ fontFamily: 'var(--font-jp)', fontSize: '1.1rem', color: '#185fa5' }}>{kChar}</span>
                          {kMeaning && <span style={{ fontSize: '0.65rem', color: '#185fa5' }}>{kMeaning}</span>}
                          {kOn.map((r, ri) => (
                            <span key={ri} style={{ fontFamily: 'var(--font-jp)', fontSize: '0.65rem', color: '#185fa5', opacity: 0.8 }}>
                              on: {r}
                            </span>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>

      <p style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', marginTop: '0.5rem', marginBottom: '0.4rem' }}>
        {selectedCandidates.length} / {kanjiCount} kanji selected
      </p>
      <button
        className="check-answer-button"
        onClick={handleConfirm}
        disabled={!canConfirm}
        style={{ opacity: canConfirm ? 1 : 0.45, cursor: canConfirm ? 'pointer' : 'not-allowed' }}
      >
        Check kanji match ✓
      </button>
    </div>
  ) : null;

  // ── Full render ─────────────────────────────────────────────────────────────

  return (
    <div className={`radical-tray radical-tray-${trayState}`}>

      {/* Close — always visible */}
      <button className="tray-close-btn" onClick={handleClose}
        style={{ position: 'absolute', top: '10px', right: '12px', zIndex: 20 }}>
        ✕
      </button>

      {/* Expand/collapse */}
      <div className="tray-header-controls" style={{ paddingRight: '2.5rem' }}>
        <button className="tray-expand-button"
          onClick={() => setTrayState(s => s === 'half' ? 'full' : 'half')}>
          {trayState === 'half' ? '⬆️ Expand' : '⬇️ Collapse'}
        </button>
      </div>

      {/* Selected candidates — shown in search mode only, above target word */}
      {viewMode === 'search' && SelectedCandidatesBlock}

      {/* Target word */}
      <div className="target-kanji-display">
        <span className="target-label">Find the kanji in:</span>
        <span className="target-kanji-large">{targetKanji}</span>
      </div>

      {/* Mode toggle */}
      <div className="mode-toggle">
        <button className={`mode-button ${viewMode === 'search' ? 'active' : ''}`}
          onClick={() => { setViewMode('search'); setTrayState('half'); }}>
          🔍 Search Radicals
        </button>
        <button className={`mode-button ${viewMode === 'browse' ? 'active' : ''}`}
          onClick={() => { setViewMode('browse'); setTrayState('full'); }}>
          📚 Browse Radicals
        </button>
      </div>

      {/* ── Search mode ── */}
      {viewMode === 'search' && (
        <>
          {/* Selected radical chips */}
          {selectedRadicals.length > 0 && (
            <div className="selected-radicals-section">
              <div className="section-label">Selected Radicals ({selectedRadicals.length}):</div>
              <div className="selected-chips">
                {selectedRadicals.map((r, i) => (
                  <div key={i} className="selected-chip" onClick={() => handleRadicalSelect(r)}>
                    <span className="radical-character">{r.radical}</span>
                    <span className="radical-meaning">{r.primary_english}</span>
                    <span className="remove-icon">✕</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search input */}
          <div className="tray-search-section">
            <input
              ref={searchInputRef}
              type="text"
              className="radical-search-input"
              placeholder="Search radicals (e.g., 'water', 'speech', 'hand')..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {isSearching && <div className="search-loading">Searching...</div>}
          </div>

          {/* Search results */}
          {radicalSuggestions.length > 0 && (
            <div className="radical-suggestions-section">
              <div className="section-label">Search Results:</div>
              <div className="radical-chips-container">
                {radicalSuggestions.map((r, i) => (
                  <div key={i}
                    className={`radical-chip ${selectedRadicals.find(s => s.radical === r.radical) ? 'selected' : ''}`}
                    onClick={() => handleRadicalSelect(r)}
                  >
                    <span className="radical-character">{r.radical}</span>
                    <span className="radical-meaning">{r.english_names?.slice(0, 2).join(' / ') || r.primary_english}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Candidates */}
          <div className="candidates-section">
            {selectedRadicals.length > 0 && (
              <div className="section-label">Candidates ({candidateCount}):</div>
            )}
            {candidateKanji.length > 0 && (
              <>
                <div className="candidate-instruction">
                  👆 Tap the kanji you see in the word above
                </div>
                <div className="candidate-kanji-grid">
                  {[...candidateKanji].sort().slice(0, 8).map((kanji, i) => (
                    <div key={i}
                      className={`candidate-kanji ${selectedCandidates.includes(kanji) ? 'selected-candidate' : ''}`}
                      onClick={() => handleKanjiSelect(kanji)}
                    >
                      {kanji}
                      {selectedCandidates.includes(kanji) && <span className="selected-indicator">✓</span>}
                    </div>
                  ))}
                  {candidateCount > 8 && (
                    <div className="more-results">+{candidateCount - 8} more — try adding another radical</div>
                  )}
                </div>
              </>
            )}
            {selectedRadicals.length > 0 && candidateKanji.length === 0 && (
              <div className="no-results">No kanji found with these radicals. Try different combinations.</div>
            )}
          </div>
        </>
      )}

      {/* ── Browse mode — filtered by ±3 stroke window, no selected kanji block ── */}
      {viewMode === 'browse' && (
        <div className="browse-radicals-section">
          {browseGroups.length > 0 ? (
            <div className="radicals-by-stroke">
              {browseGroups.map(({ sc, radicals }) => (
                <div key={sc} className="stroke-group">
                  <div className="stroke-label">{sc} stroke{sc > 1 ? 's' : ''}:</div>
                  <div className="radical-chips-container">
                    {radicals.map((r, i) => (
                      <div key={i} className="browse-radical-chip">
                        <span className="radical-character">{r.radical}</span>
                        <span className="radical-meaning">{r.primary_english || r.english_names?.[0]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="loading-radicals">Loading radicals…</div>
          )}
        </div>
      )}

    </div>
  );
}

export default RadicalSearchTray;
