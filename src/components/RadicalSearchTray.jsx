/**
 * RadicalSearchTray.jsx — Thesis Platform
 * ========================================
 * Adapted from V3.1 RadicalSearchTray.
 *
 * Changes from original:
 *  1. Accepts `apiBase` as a prop (no import from App)
 *  2. onSuccess(selectedKanji, radicalsClicked) — passes radical selection history
 *     back to ReadingPage so it can be logged to thesis_sessions.gloss_log
 *  3. Tracks all radicals ever selected during this tray session in radicalsClickedRef
 */

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function RadicalSearchTray({
  targetKanji,
  onSuccess,    // (selectedKanji: string, radicalsClicked: string[]) => void
  onClose,
  isOpen,
  apiBase,
}) {
  const [trayState, setTrayState]               = useState('half');
  const [searchQuery, setSearchQuery]           = useState('');
  const [radicalSuggestions, setRadicalSuggestions] = useState([]);
  const [isSearching, setIsSearching]           = useState(false);
  const [selectedRadicals, setSelectedRadicals] = useState([]);
  const [candidateKanji, setCandidateKanji]     = useState([]);
  const [candidateCount, setCandidateCount]     = useState(0);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [allRadicals, setAllRadicals]           = useState([]);
  const [hasFetchedAllRadicals, setHasFetchedAllRadicals] = useState(false);
  const [filteredRadicalGroups, setFilteredRadicalGroups] = useState([]);
  const [useFilteredBrowse, setUseFilteredBrowse] = useState(true);
  const [viewMode, setViewMode]                 = useState('search');
  const [expandedKanji, setExpandedKanji]       = useState(null);
  const [kanjiRadicalDetails, setKanjiRadicalDetails] = useState({});
  const [kanjiInfo, setKanjiInfo]               = useState({});

  // ── NEW: track ALL radicals ever clicked during this tray session ─────────
  const radicalsClickedRef = useRef([]);

  const kanjiCount = [...targetKanji].filter(c => /[\u4E00-\u9FFF]/.test(c)).length || 1;
  const searchInputRef = useRef(null);
  const trayRef = useRef(null);

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

  // Fetch radicals for browse mode
  useEffect(() => {
    if (trayState === 'full' && !hasFetchedAllRadicals) fetchAllRadicals();
  }, [trayState]);

  const fetchAllRadicals = async () => {
    try {
      const res = await axios.get(`${apiBase}/api/radicals/browse-all`);
      setAllRadicals(res.data);
      setHasFetchedAllRadicals(true);
    } catch (e) { console.error(e); }
  };

  const fetchFilteredRadicals = async () => {
    try {
      const kanjiChars = [...targetKanji].filter(c => /[\u4E00-\u9FFF]/.test(c));
      const charsToFetch = kanjiChars.length > 0 ? kanjiChars : [targetKanji];
      const allGroups = [];
      const seen = new Set();

      for (const char of charsToFetch) {
        const res = await axios.post(`${apiBase}/api/radicals/browse-filtered`, { target_kanji: char });
        for (const group of res.data.groups ?? []) {
          const unique = group.radicals.filter(r => { if (seen.has(r.radical)) return false; seen.add(r.radical); return true; });
          if (unique.length > 0) allGroups.push({ ...group, radicals: unique });
        }
      }
      setFilteredRadicalGroups(allGroups);
    } catch (e) {
      console.error(e);
      setUseFilteredBrowse(false);
      fetchAllRadicals();
    }
  };

  const fetchKanjiDetails = async (kanji) => {
    if (kanjiRadicalDetails[kanji]) return;
    try {
      const res = await axios.post(`${apiBase}/api/radicals/for-kanji`, { word: kanji });
      const details = res.data[0];
      if (details) {
        setKanjiRadicalDetails(prev => ({ ...prev, [kanji]: details.radicals }));
        setKanjiInfo(prev => ({ ...prev, [kanji]: { meaning: details.meaning || '', on: details.on || [], kun: details.kun || [] } }));
      }
    } catch (e) { console.error(e); }
  };

  // Filter candidates when selected radicals change
  useEffect(() => {
    if (selectedRadicals.length === 0) { setCandidateKanji([]); setCandidateCount(0); return; }
    const filter = async () => {
      try {
        const res = await axios.post(`${apiBase}/api/radicals/kanji-by-components`, {
          components: selectedRadicals.map(r => r.radical)
        });
        setCandidateKanji(res.data.kanji_list);
        setCandidateCount(res.data.count);
      } catch (e) { console.error(e); setCandidateKanji([]); setCandidateCount(0); }
    };
    filter();
  }, [selectedRadicals, apiBase]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleRadicalSelect = (radical) => {
    const alreadySelected = selectedRadicals.find(r => r.radical === radical.radical);
    if (alreadySelected) {
      setSelectedRadicals(prev => prev.filter(r => r.radical !== radical.radical));
    } else {
      const radicalToAdd = {
        radical: radical.radical,
        primary_english: radical.primary_english || radical.english_names?.[0] || '',
        english_names: radical.english_names || [radical.primary_english || ''],
        stroke_count: radical.stroke_count || 0,
      };
      setSelectedRadicals(prev => [...prev, radicalToAdd]);

      // ── Record in thesis click history ────────────────────────────────────
      if (!radicalsClickedRef.current.includes(radical.radical)) {
        radicalsClickedRef.current = [...radicalsClickedRef.current, radical.radical];
      }
    }
    if (viewMode === 'search') setSearchQuery('');
  };

  const handleKanjiSelect = (kanji) => {
    const alreadySelected = selectedCandidates.includes(kanji);
    if (alreadySelected) {
      setSelectedCandidates(prev => prev.filter(k => k !== kanji));
    } else {
      const newSelection = [...selectedCandidates, kanji];
      setSelectedCandidates(newSelection);
      setSelectedRadicals([]);
      setCandidateKanji([]);
      fetchKanjiDetails(kanji);
    }
  };

  const handleSelectedKanjiClick = (kanji) => {
    if (expandedKanji === kanji) { setExpandedKanji(null); return; }
    setExpandedKanji(kanji);
    fetchKanjiDetails(kanji);
  };

  const handleConfirm = () => {
    // Pass both the selected kanji AND the full list of radicals ever clicked
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

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      ref={trayRef}
      className={`radical-tray radical-tray-${trayState}`}
    >
      {/* Expand / collapse handle */}
      <div className="tray-header-controls">
        <button
          className="tray-expand-button"
          onClick={() => setTrayState(s => s === 'half' ? 'full' : 'half')}
        >
          {trayState === 'half' ? '⬆️ Expand' : '⬇️ Collapse'}
        </button>
      </div>

      <button className="tray-close-btn" onClick={handleClose}>✕</button>

      {/* Target word */}
      <div className="target-kanji-display">
        <span className="target-label">Find the kanji in:</span>
        <span className="target-kanji-large">{targetKanji}</span>
      </div>

      {/* Mode toggle */}
      <div className="mode-toggle">
        <button
          className={`mode-button ${viewMode === 'search' ? 'active' : ''}`}
          onClick={() => { setViewMode('search'); setTrayState('half'); }}
        >
          🔍 Search Radicals
        </button>
        <button
          className={`mode-button ${viewMode === 'browse' ? 'active' : ''}`}
          onClick={() => {
            setViewMode('browse');
            setTrayState('full');
            if (useFilteredBrowse) fetchFilteredRadicals();
            else if (!hasFetchedAllRadicals) fetchAllRadicals();
          }}
        >
          📚 Browse More Radicals
        </button>
      </div>

      {/* Selected radicals bar */}
      {selectedRadicals.length > 0 && viewMode === 'search' && (
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

      {/* Search mode */}
      {viewMode === 'search' && (
        <>
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

          {radicalSuggestions.length > 0 && (
            <div className="radical-suggestions-section">
              <div className="section-label">Search Results:</div>
              <div className="radical-chips-container">
                {radicalSuggestions.map((r, i) => (
                  <div
                    key={i}
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
        </>
      )}

      {/* Browse mode */}
      {viewMode === 'browse' && (
        <div className="browse-radicals-section">
          {useFilteredBrowse && filteredRadicalGroups.length > 0 ? (
            <>
              <div className="section-label">Browse Radicals:</div>
              <div className="radicals-filtered-browse">
                {filteredRadicalGroups.map((group, gi) => (
                  <div key={gi}>
                    {gi > 0 && <div className="group-separator" />}
                    <div className="radical-chips-container">
                      {group.radicals.map((r, i) => (
                        <div key={i} className="radical-chip" onClick={() => handleRadicalSelect(r)}>
                          <span className="radical-character">{r.radical}</span>
                          <span className="radical-meaning">{r.english_names?.slice(0, 2).join(' / ') || r.primary_english}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : allRadicals.length > 0 ? (
            <>
              <div className="section-label">Browse by Stroke Count:</div>
              <div className="radicals-by-stroke">
                {[1,2,3,4,5,6,7,8,9,10].map(sc => {
                  const group = allRadicals.filter(r => r.stroke_count === sc);
                  if (!group.length) return null;
                  return (
                    <div key={sc} className="stroke-group">
                      <div className="stroke-label">{sc} stroke{sc > 1 ? 's' : ''}:</div>
                      <div className="radical-chips-container">
                        {group.map((r, i) => (
                          <div key={i} className="radical-chip" onClick={() => handleRadicalSelect(r)}>
                            <span className="radical-character">{r.radical}</span>
                            <span className="radical-meaning">{r.primary_english}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="loading-radicals">Loading radicals…</div>
          )}
        </div>
      )}

      {/* Selected candidates + confirm */}
      {selectedCandidates.length > 0 && viewMode === 'search' && (
        <div className="selected-candidates-section">
          <div className="section-label">
            Your Selection ({selectedCandidates.length}/{kanjiCount}):
          </div>
          <div className="selected-candidates-display">
            {selectedCandidates.map((kanji, i) => (
              <div key={i} className="selected-candidate-entry">
                <div
                  className={`selected-candidate-char clickable ${expandedKanji === kanji ? 'expanded' : ''}`}
                  onClick={() => handleSelectedKanjiClick(kanji)}
                >
                  <span className="candidate-kanji-char">{kanji}</span>
                  {kanjiInfo[kanji] && (
                    <span className="candidate-kanji-readings">
                      {kanjiInfo[kanji].meaning && <span className="kanji-meaning">{kanjiInfo[kanji].meaning}</span>}
                      <span className="kanji-readings-row">
                        {kanjiInfo[kanji].kun[0] && <span className="reading-tag kun">Kun: {kanjiInfo[kanji].kun[0]}</span>}
                        {kanjiInfo[kanji].on[0]  && <span className="reading-tag on">On: {kanjiInfo[kanji].on[0]}</span>}
                      </span>
                    </span>
                  )}
                </div>
                {expandedKanji === kanji && kanjiRadicalDetails[kanji] && (
                  <div className="candidate-radical-reveal">
                    {kanjiRadicalDetails[kanji].map((r, j) => (
                      <span key={j} className="reveal-radical-chip">
                        <span className="radical-character">{r.radical}</span>
                        <span className="radical-meaning">{r.english_names?.slice(0, 2).join(' / ')}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <button className="check-answer-button" onClick={handleConfirm}>
            ✅ These are the correct kanji
          </button>
        </div>
      )}

      {/* Candidate grid */}
      {viewMode === 'search' && (
        <div className="candidates-section">
          {selectedRadicals.length > 0 && (
            <div className="section-label">Candidates ({candidateCount}):</div>
          )}
          {candidateKanji.length > 0 && (
            <>
              <div className="candidate-instruction">
                👆 Click to select kanji (select {kanjiCount} character{kanjiCount > 1 ? 's' : ''})
              </div>
              <div className="candidate-kanji-grid">
                {candidateKanji.slice(0, 50).map((kanji, i) => (
                  <div
                    key={i}
                    className={`candidate-kanji ${selectedCandidates.includes(kanji) ? 'selected-candidate' : ''}`}
                    onClick={() => handleKanjiSelect(kanji)}
                  >
                    {kanji}
                    {selectedCandidates.includes(kanji) && <span className="selected-indicator">✓</span>}
                  </div>
                ))}
                {candidateCount > 50 && (
                  <div className="more-results">+{candidateCount - 50} more…</div>
                )}
              </div>
            </>
          )}
          {selectedRadicals.length > 0 && candidateKanji.length === 0 && (
            <div className="no-results">No kanji found with these radicals. Try different combinations.</div>
          )}
        </div>
      )}
    </div>
  );
}

export default RadicalSearchTray;
