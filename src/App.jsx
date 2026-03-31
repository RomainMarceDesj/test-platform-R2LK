/**
 * App.jsx — Thesis Platform
 * =========================
 * Top-level router and session state container.
 * All phase transitions happen here via setPhase().
 * Session data accumulates in sessionState and is passed forward.
 */

import React, { useState, useCallback } from 'react';
import OnboardingPage   from './pages/OnboardingPage';
import TutorialPage     from './pages/TutorialPage';
import ScreeningPage    from './pages/ScreeningPage';
import ReadingPage      from './pages/ReadingPage';
import MidQuizPage      from './pages/MidQuizPage';
import RadicalNoticingTest from './pages/RadicalNoticingTest';
import KanjiTestPage    from './pages/KanjiTestPage';
import { ComprehensionPage, QuestionnairePage, DonePage } from './pages/EndPages';
import './App.css';

// ── Phase constants ───────────────────────────────────────────────────────────

export const PHASES = {
  ONBOARDING:        'onboarding',
  SCREENING:         'screening',
  TUTORIAL:          'tutorial',
  READING:           'reading',
  MID_QUIZ:          'mid_quiz',
  RADICAL_NOTICING:  'radical_noticing',
  KANJI_TEST:        'kanji_test',
  COMPREHENSION:     'comprehension',
  QUESTIONNAIRE:     'questionnaire',
  DONE:              'done',
};

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [phase, setPhase] = useState(PHASES.ONBOARDING);

  // Participant info — set during onboarding/screening
  const [participant, setParticipant] = useState({
    participantId: null,
    group: null,          // 'A' or 'B'
    assignmentIndex: null,
    screening: null,
  });

  // Session runtime state — built up during reading
  const [session, setSession] = useState({
    sessionId: null,
    glossLog: [],         // all gloss events
    wasGlossed: {},       // { word: bool } for target kanji
    midQuizWord: null,    // trigger word for mid-quiz
    midQuizGlossIndex: null,
    activeReadingSeconds: 0,
  });

  // Results accumulation — filled phase by phase, submitted at the end
  const [results, setResults] = useState({
    midQuiz: null,
    radicalNoticingTest: [],
    kanjiTest: [],
    comprehension: [],
    questionnaire: null,
  });

  // ── Transition helpers ────────────────────────────────────────────────────

  const handleOnboardingComplete = useCallback((participantData) => {
    setParticipant(participantData);
    // New participants → screening → tutorial → reading
    // Returning participants → tutorial → reading (skip screening)
    setPhase(participantData.alreadyRegistered ? PHASES.TUTORIAL : PHASES.SCREENING);
  }, []);

  const handleScreeningComplete = useCallback((participantData) => {
    // participantData contains group, assignmentIndex, screening — save all of it
    setParticipant(prev => ({ ...prev, ...participantData }));
    setPhase(PHASES.TUTORIAL);
  }, []);

  const handleReadingComplete = useCallback((readingData) => {
    // readingData: { sessionId, glossLog, wasGlossed, activeReadingSeconds }
    setSession(prev => ({ ...prev, ...readingData }));
    setPhase(PHASES.RADICAL_NOTICING);
  }, []);

  const handleMidQuizComplete = useCallback((midQuizResult) => {
    setResults(prev => ({ ...prev, midQuiz: midQuizResult }));
    // Return to reading — mid-quiz fires mid-session
    setPhase(PHASES.READING);
  }, []);

  const handleMidQuizTriggered = useCallback((triggerData) => {
    // triggerData: { word, glossIndex }
    setSession(prev => ({
      ...prev,
      midQuizWord: triggerData.word,
      midQuizGlossIndex: triggerData.glossIndex,
    }));
    setPhase(PHASES.MID_QUIZ);
  }, []);

  const handleRadicalNoticingComplete = useCallback((radicalResults) => {
    setResults(prev => ({ ...prev, radicalNoticingTest: radicalResults }));
    setPhase(PHASES.KANJI_TEST);
  }, []);

  const handleKanjiTestComplete = useCallback((kanjiResults) => {
    setResults(prev => ({ ...prev, kanjiTest: kanjiResults }));
    setPhase(PHASES.COMPREHENSION);
  }, []);

  const handleComprehensionComplete = useCallback((comprehensionResults) => {
    setResults(prev => ({ ...prev, comprehension: comprehensionResults }));
    setPhase(PHASES.QUESTIONNAIRE);
  }, []);

  const handleQuestionnaireComplete = useCallback((questionnaireResults) => {
    setResults(prev => ({ ...prev, questionnaire: questionnaireResults }));
    setPhase(PHASES.DONE);
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────

  const sharedProps = { participant, session, results };

  switch (phase) {
    case PHASES.ONBOARDING:
      return <OnboardingPage onComplete={handleOnboardingComplete} />;

    case PHASES.SCREENING:
      return (
        <ScreeningPage
          participantId={participant.participantId}
          onComplete={handleScreeningComplete}
        />
      );

    case PHASES.TUTORIAL:
      return (
        <TutorialPage
          group={participant.group}
          onComplete={() => setPhase(PHASES.READING)}
        />
      );

    case PHASES.READING:
      return (
        <ReadingPage
          participant={participant}
          session={session}
          midQuizResults={results.midQuiz}
          onMidQuizTriggered={handleMidQuizTriggered}
          onComplete={handleReadingComplete}
        />
      );

    case PHASES.MID_QUIZ:
      return (
        <MidQuizPage
          participant={participant}
          session={session}
          midQuizWord={session.midQuizWord}
          onComplete={handleMidQuizComplete}
        />
      );

    case PHASES.RADICAL_NOTICING:
      return (
        <RadicalNoticingTest
          participant={participant}
          session={session}
          midQuizWord={session.midQuizWord}
          onComplete={handleRadicalNoticingComplete}
        />
      );

    case PHASES.KANJI_TEST:
      return (
        <KanjiTestPage
          participant={participant}
          session={session}
          onComplete={handleKanjiTestComplete}
        />
      );

    case PHASES.COMPREHENSION:
      return (
        <ComprehensionPage
          onComplete={handleComprehensionComplete}
        />
      );

    case PHASES.QUESTIONNAIRE:
      return (
        <QuestionnairePage
          participant={participant}
          session={session}
          results={results}
          onComplete={handleQuestionnaireComplete}
        />
      );

    case PHASES.DONE:
      return (
        <DonePage
          participant={participant}
          session={session}
          results={results}
        />
      );

    default:
      return <OnboardingPage onComplete={handleOnboardingComplete} />;
  }
}
