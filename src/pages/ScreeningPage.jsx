/**
 * ScreeningPage.jsx
 * =================
 * Background questionnaire — all questions and options written out directly here.
 * Edit this file to change question wording or option labels.
 */

import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE } from '../config/studyConfig';

// ── Option components ─────────────────────────────────────────────────────────

function RadioGroup({ options, value, onChange }) {
  return (
    <div className="option-group">
      {options.map(opt => (
        <label
          key={opt.key}
          className={`option-item ${value === opt.key ? 'selected' : ''}`}
        >
          <input
            type="radio"
            checked={value === opt.key}
            onChange={() => onChange(opt.key)}
          />
          <div>
            <div className="option-label">{opt.label}</div>
            {opt.desc && <div className="option-desc">{opt.desc}</div>}
          </div>
        </label>
      ))}
    </div>
  );
}

function BoolGroup({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '0.75rem' }}>
      {['Yes', 'No'].map(opt => (
        <label
          key={opt}
          className={`option-item ${value === opt ? 'selected' : ''}`}
          style={{ flex: 1, justifyContent: 'center' }}
        >
          <input type="radio" checked={value === opt} onChange={() => onChange(opt)} />
          <span className="option-label">{opt}</span>
        </label>
      ))}
    </div>
  );
}

// ── Questions — edit labels and descriptions directly here ────────────────────

const STUDY_DURATION = [
  { key: 'never', label: 'Never studied Japanese' },
  { key: 'lt6m',  label: 'Less than 6 months' },
  { key: '6m1y',  label: '6 months – 1 year' },
  { key: '1y2y',  label: '1 – 2 years' },
  { key: '2y4y',  label: '2 – 4 years' },
  { key: '4y+',   label: '4 years or more' },
];

const OVERALL_LEVEL = [
  { key: 'A1', label: 'A1 — Beginner',          desc: 'I can understand and use very basic words and phrases' },
  { key: 'A2', label: 'A2 — Elementary',         desc: 'I can handle simple everyday conversations and routine tasks' },
  { key: 'B1', label: 'B1 — Intermediate',       desc: 'I can manage most situations that come up while travelling in Japan' },
  { key: 'B2', label: 'B2 — Upper intermediate', desc: 'I can communicate fluently and spontaneously with native speakers' },
  { key: 'C1', label: 'C1 — Advanced',           desc: 'I can express myself fluently without needing to search for words' },
  { key: 'C2', label: 'C2 — Proficient',         desc: 'I can understand virtually everything I hear or read with ease' },
  { key: 'unsure', label: 'Not sure', desc: '' },
];

const READING_LEVEL = [
  { key: '1', label: 'Cannot read Japanese text',
    desc: 'I cannot read hiragana, katakana, or kanji' },
  { key: '2', label: 'Very limited',
    desc: 'I can read hiragana and katakana but very few kanji' },
  { key: '3', label: 'Basic',
    desc: 'I can read simple texts but need a dictionary often' },
  { key: '4', label: 'Intermediate',
    desc: 'I can read most everyday texts with occasional help' },
  { key: '5', label: 'Advanced',
    desc: 'I can read almost any Japanese text with little or no difficulty' },
];

const JLPT_OPTIONS = [
  { key: 'never', label: 'Never attempted the JLPT' },
  { key: 'N5',    label: 'N5 (lowest level)' },
  { key: 'N4',    label: 'N4' },
  { key: 'N3',    label: 'N3' },
  { key: 'N2',    label: 'N2' },
  { key: 'N1',    label: 'N1 (highest level)' },
];

const TIME_IN_JAPAN = [
  { key: 'not_in_japan', label: 'Does not live in Japan' },
  { key: '0_1y',         label: '0 – 1 year' },
  { key: '1_2y',         label: '1 – 2 years' },
  { key: '3_5y',         label: '3 – 5 years' },
  { key: '5y_plus',      label: '5 or more years' },
];

const RADICAL_FAMILIARITY = [
  { key: '1', label: 'Not at all familiar',
    desc: 'I have never heard of kanji radicals' },
  { key: '2', label: 'Slightly familiar',
    desc: 'I have heard of radicals but know very little about them' },
  { key: '3', label: 'Somewhat familiar',
    desc: 'I know what radicals are and recognise a few' },
  { key: '4', label: 'Quite familiar',
    desc: 'I can identify many radicals and know their general meanings' },
  { key: '5', label: 'Very familiar',
    desc: 'I actively use radicals as part of my kanji study strategy' },
];

// ── Main component ────────────────────────────────────────────────────────────

export default function ScreeningPage({ participantId, onComplete }) {
  const [form, setForm] = useState({
    prior_japanese_study:  '',
    overall_level:         '',
    reading_level:         '',
    jlpt_attempted:        '',
    fluent_kanji_language: '',
    studied_kanji_other:   '',
    time_in_japan:         '',
    radical_familiarity:   '',
    contact_info:          '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const set = key => val => setForm(prev => ({ ...prev, [key]: val }));
  const allAnswered = Object.values(form).every(v => v !== '');

  const handleSubmit = async () => {
    if (!allAnswered) return;
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_BASE}/api/thesis/register`, {
        participant_id: participantId,
        screening: form,
      });
      onComplete({
        participantId:   res.data.participant_id,
        group:           res.data.group,
        assignmentIndex: res.data.assignment_index,
        screening:       form,
      });
    } catch (err) {
      setError('Registration failed. Please try again.');
      console.error('Screening error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-inner animate-in">

        <div>
          <h3>Before we begin</h3>
          <h1 style={{ marginTop: '0.5rem' }}>Background questions</h1>
          <p style={{ marginTop: '0.5rem' }}>
            These help us understand your experience with Japanese.
            There are no right or wrong answers.
          </p>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

          {/* Q1 — Study duration */}
          <div className="form-group">
            <label className="form-label">
              How long have you been studying Japanese?
            </label>
            <RadioGroup
              options={STUDY_DURATION}
              value={form.prior_japanese_study}
              onChange={set('prior_japanese_study')}
            />
          </div>

          <div className="divider" />

          {/* Q2 — Overall Japanese level (CEFR) */}
          <div className="form-group">
            <label className="form-label">
              What is your current overall level in Japanese?
            </label>
            <RadioGroup
              options={OVERALL_LEVEL}
              value={form.overall_level}
              onChange={set('overall_level')}
            />
          </div>

          <div className="divider" />

          {/* Q3 — Reading level (1–5 scale) */}
          <div className="form-group">
            <label className="form-label">
              How well can you read Japanese text?
            </label>
            <RadioGroup
              options={READING_LEVEL}
              value={form.reading_level}
              onChange={set('reading_level')}
            />
          </div>

          <div className="divider" />

          {/* Q4 — JLPT */}
          <div className="form-group">
            <label className="form-label">
              What is the last JLPT level you have attempted, or plan to attempt?
            </label>
            <RadioGroup
              options={JLPT_OPTIONS}
              value={form.jlpt_attempted}
              onChange={set('jlpt_attempted')}
            />
          </div>

          <div className="divider" />

          {/* Q5 — Fluency in kanji language */}
          <div className="form-group">
            <label className="form-label">
              Do you already have a mastery of kanji characters from a language you are fluent in?
              <span style={{ display: 'block', fontWeight: 300, fontSize: '0.82rem', color: 'var(--ink-faint)', marginTop: '2px' }}>
                e.g. Chinese (Mandarin, Cantonese, etc.) 
              </span>
            </label>
            <BoolGroup
              value={form.fluent_kanji_language}
              onChange={set('fluent_kanji_language')}
            />
          </div>

          <div className="divider" />

          {/* Q6 — Studied kanji in another language */}
          <div className="form-group">
            <label className="form-label">
              Have you studied kanji characters as part of learning another language?
            </label>
            <BoolGroup
              value={form.studied_kanji_other}
              onChange={set('studied_kanji_other')}
            />
          </div>

          <div className="divider" />

          {/* Q7 — Time living in Japan */}
          <div className="form-group">
            <label className="form-label">
              How long have you lived in Japan?
            </label>
            <RadioGroup
              options={TIME_IN_JAPAN}
              value={form.time_in_japan}
              onChange={set('time_in_japan')}
            />
          </div>

          <div className="divider" />

          {/* Q8 — Radical familiarity */}
          <div className="form-group">
            <label className="form-label">
              How familiar are you with kanji radicals?
              <span style={{ display: 'block', fontWeight: 300, fontSize: '0.82rem', color: 'var(--ink-faint)', marginTop: '2px' }}>
                Radicals are the building-block components that kanji characters are made from
              </span>
            </label>
            <RadioGroup
              options={RADICAL_FAMILIARITY}
              value={form.radical_familiarity}
              onChange={set('radical_familiarity')}
            />
          </div>

          <div className="divider" />

          {/* Q9 — Contact information */}
          <div className="form-group">
            <label className="form-label">
              Contact information
              <span style={{ display: 'block', fontWeight: 300, fontSize: '0.82rem', color: 'var(--ink-faint)', marginTop: '2px' }}>
                We will use this only to notify you when the second part of this study is ready. An email address is preferred.
              </span>
            </label>
            <input
              type="text"
              value={form.contact_info}
              onChange={e => setForm(prev => ({ ...prev, contact_info: e.target.value }))}
              placeholder="e.g. yourname@example.com"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
            />
          </div>

        </div>

        {error && (
          <p style={{ color: 'var(--accent)', fontSize: '0.875rem' }}>{error}</p>
        )}

        <button
          className="btn btn-primary btn-full"
          onClick={handleSubmit}
          disabled={!allAnswered || loading}
        >
          {loading ? 'Registering…' : 'Start →'}
        </button>

      </div>
    </div>
  );
}
