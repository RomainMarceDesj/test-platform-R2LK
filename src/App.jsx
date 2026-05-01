/**
 * App.jsx — Thesis Platform
 * =========================
 * Top-level router and session state container.
 * All phase transitions happen here via setPhase().
 * Session data accumulates in sessionState and is passed forward.
 *
 * Two-session flow:
 *   Session 1: ONBOARDING → (SCREENING) → TUTORIAL → READING → MID_QUIZ
 *              → READING → RADICAL_NOTICING → KANJI_TEST → QUESTIONNAIRE → DONE
 *   Session 2 (post-test, ≥14 days later): ONBOARDING → POSTTEST_INTRO
 *              → POSTTEST_RADICAL_NOTICING → POSTTEST_KANJI_TEST
 *              → POSTTEST_QUESTIONNAIRE → POSTTEST_DONE
 *   Routing decisions for returning participants happen in OnboardingPage,
 *   which calls /api/thesis/participant/:id/status.
 */

import React, { useState, useCallback } from 'react';
import OnboardingPage   from './pages/OnboardingPage';
import TutorialPage     from './pages/TutorialPage';
import ScreeningPage    from './pages/ScreeningPage';
import ReadingPage      from './pages/ReadingPage';
import MidQuizPage      from './pages/MidQuizPage';
import RadicalNoticingTest from './pages/RadicalNoticingTest';
import KanjiTestPage    from './pages/KanjiTestPage';
import { QuestionnairePage, DonePage } from './pages/EndPages';
import PostTestIntroPage       from './pages/PostTestIntroPage';
import PostTestRadicalNoticing from './pages/PostTestRadicalNoticing';
import PostTestKanjiTest       from './pages/PostTestKanjiTest';
import PostTestQuestionnaire   from './pages/PostTestQuestionnaire';
import PostTestDonePage        from './pages/PostTestDonePage';
import ComeBackLaterPage       from './pages/ComeBackLaterPage';
import AlreadyDonePage         from './pages/AlreadyDonePage';
import { TARGET_KANJI } from './config/studyConfig';
import './App.css';

// ── Phase constants ───────────────────────────────────────────────────────────

export const PHASES = {
  // Session 1
  ONBOARDING:        'onboarding',
  SCREENING:         'screening',
  TUTORIAL:          'tutorial',
  READING:           'reading',
  MID_QUIZ:          'mid_quiz',
  RADICAL_NOTICING:  'radical_noticing',
  KANJI_TEST:        'kanji_test',
  QUESTIONNAIRE:     'questionnaire',
  DONE:              'done',
  // Session 2 (post-test)
  POSTTEST_INTRO:            'posttest_intro',
  POSTTEST_RADICAL_NOTICING: 'posttest_radical_noticing',
  POSTTEST_KANJI_TEST:       'posttest_kanji_test',
  POSTTEST_QUESTIONNAIRE:    'posttest_questionnaire',
  POSTTEST_DONE:             'posttest_done',
  // Gating screens
  COME_BACK_LATER:   'come_back_later',
  ALREADY_DONE:      'already_done',
};

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [phase, setPhase] = useState(PHASES.ONBOARDING);

  // Participant info — set during onboarding/screening
  const [participant, setParticipant] = useState({
    participantId: null,
    group: null,
    assignmentIndex: null,
    screening: null,
  });

  // Session 1 runtime state — built up during reading
  const [session, setSession] = useState({
    sessionId: null,
    glossLog: [],
    wasGlossed: {},
    midQuizWord: null,
    midQuizGlossIndex: null,
    activeReadingSeconds: 0,
  });

  // Session 1 results — filled phase by phase, submitted at the end
  const [results, setResults] = useState({
    midQuiz: null,
    radicalNoticingTest: [],
    kanjiTest: [],
    comprehension: [],
    questionnaire: null,
  });

  // Post-test runtime state — populated by OnboardingPage on the post-test path.
  // posttestData mirrors the shape returned from /participant/:id/status under
  // the posttest_data key. Used by the post-test wrappers to rebuild items.
  const [posttestData, setPosttestData] = useState(null);
  const [daysSinceSession1, setDaysSinceSession1] = useState(null);

  // Post-test results
  const [posttestResults, setPosttestResults] = useState({
    radicalNoticingTest: [],
    kanjiTest: [],
    questionnaire: null,
  });

  // Gating screen state (set by OnboardingPage when next_action requires it)
  const [gatingState, setGatingState] = useState({ waitUntil: null, daysSinceSession1: null });

  // ── Onboarding routing ────────────────────────────────────────────────────
  // OnboardingPage reads the status endpoint and emits one of several outcomes.
  // We unpack and route here so all phase transitions stay centralised.

  const handleOnboardingComplete = useCallback((outcome) => {
    // outcome: { nextAction, participant, posttestData?, session1Data?, waitUntil?, daysSinceSession1? }
    const { nextAction, participant: pData } = outcome;

    if (pData) setParticipant(prev => ({ ...prev, ...pData }));

    switch (nextAction) {
      case 'new':
        // No prior record → standard new-participant flow
        if (pData?.alreadyRegistered) {
          // Edge case: registered (group assigned) but never started reading → skip screening
          setPhase(PHASES.TUTORIAL);
        } else {
          setPhase(PHASES.SCREENING);
        }
        return;

      case 'resume_session1': {
        // Same-day return mid-session — restore reading state and drop into READING.
        // The mid-quiz won't re-fire because midQuizFiredRef gets seeded from
        // session.midQuizTriggered on remount.
        const s1 = outcome.session1Data ?? {};
        const glossLog = s1.gloss_log ?? [];
        const wasGlossed = reconstructWasGlossed(glossLog);
        setSession(prev => ({
          ...prev,
          sessionId:        s1.session_id ?? prev.sessionId,
          glossLog,
          wasGlossed,
          glossCount:       glossLog.length,
          midQuizTriggered: !!s1.mid_quiz_triggered,
          midQuizWord:      s1.mid_quiz_trigger_word ?? null,
        }));
        setPhase(PHASES.READING);
        return;
      }

      case 'posttest':
        setPosttestData(outcome.posttestData ?? null);
        setDaysSinceSession1(outcome.daysSinceSession1 ?? null);
        setPhase(PHASES.POSTTEST_INTRO);
        return;

      case 'come_back_later':
        setGatingState({
          waitUntil:         outcome.waitUntil ?? null,
          daysSinceSession1: outcome.daysSinceSession1 ?? null,
        });
        setPhase(PHASES.COME_BACK_LATER);
        return;

      case 'all_done':
      case 'all_done_no_data':
        setGatingState({ reason: nextAction });
        setPhase(PHASES.ALREADY_DONE);
        return;

      default:
        console.warn('Unknown onboarding outcome:', nextAction);
        setPhase(PHASES.SCREENING);
    }
  }, []);

  // ── Session 1 transitions ─────────────────────────────────────────────────

  const handleScreeningComplete = useCallback((participantData) => {
    setParticipant(prev => ({ ...prev, ...participantData }));
    setPhase(PHASES.TUTORIAL);
  }, []);

  const handleReadingComplete = useCallback((readingData) => {
    setSession(prev => ({ ...prev, ...readingData }));
    setPhase(PHASES.KANJI_TEST);
  }, []);

  const handleMidQuizComplete = useCallback((midQuizResult) => {
    setResults(prev => ({ ...prev, midQuiz: midQuizResult }));
    setPhase(PHASES.READING);
  }, []);

  const handleMidQuizTriggered = useCallback((triggerData) => {
    setSession(prev => ({
      ...prev,
      midQuizWord:       triggerData.word,
      midQuizGlossIndex: triggerData.glossIndex,
      glossLog:          triggerData.glossLog    ?? prev.glossLog,
      wasGlossed:        triggerData.wasGlossed  ?? prev.wasGlossed,
      glossCount:        triggerData.glossCount  ?? prev.glossCount ?? 0,
      sessionId:         triggerData.sessionId   ?? prev.sessionId,
    }));
    setPhase(PHASES.MID_QUIZ);
  }, []);

  const handleRadicalNoticingComplete = useCallback((radicalResults, testedWords) => {
    setResults(prev => ({ ...prev, radicalNoticingTest: radicalResults }));
    setSession(prev => ({ ...prev, noticingTestedWords: testedWords ?? [] }));
    setPhase(PHASES.KANJI_TEST);
  }, []);

  const handleKanjiTestComplete = useCallback((kanjiResults) => {
    setResults(prev => ({ ...prev, kanjiTest: kanjiResults }));
    setPhase(PHASES.QUESTIONNAIRE);
  }, []);

  const handleQuestionnaireComplete = useCallback((questionnaireResults) => {
    setResults(prev => ({ ...prev, questionnaire: questionnaireResults }));
    setPhase(PHASES.DONE);
  }, []);

  // ── Post-test transitions ─────────────────────────────────────────────────

  const handlePostTestRadicalNoticingComplete = useCallback((noticingResults) => {
    setPosttestResults(prev => ({ ...prev, radicalNoticingTest: noticingResults }));
    setPhase(PHASES.POSTTEST_KANJI_TEST);
  }, []);

  const handlePostTestKanjiTestComplete = useCallback((kanjiResults) => {
    setPosttestResults(prev => ({ ...prev, kanjiTest: kanjiResults }));
    setPhase(PHASES.POSTTEST_QUESTIONNAIRE);
  }, []);

  const handlePostTestQuestionnaireComplete = useCallback((questionnaireResults) => {
    setPosttestResults(prev => ({ ...prev, questionnaire: questionnaireResults }));
    setPhase(PHASES.POSTTEST_DONE);
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────

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

    // ── Post-test phases ────────────────────────────────────────────────

    case PHASES.POSTTEST_INTRO:
      return (
        <PostTestIntroPage
          participant={participant}
          onComplete={() => setPhase(PHASES.POSTTEST_RADICAL_NOTICING)}
        />
      );

    case PHASES.POSTTEST_RADICAL_NOTICING:
      return (
        <PostTestRadicalNoticing
          participant={participant}
          posttestData={posttestData}
          onComplete={handlePostTestRadicalNoticingComplete}
        />
      );

    case PHASES.POSTTEST_KANJI_TEST:
      return (
        <PostTestKanjiTest
          participant={participant}
          posttestData={posttestData}
          onComplete={handlePostTestKanjiTestComplete}
        />
      );

    case PHASES.POSTTEST_QUESTIONNAIRE:
      return (
        <PostTestQuestionnaire
          participant={participant}
          posttestData={posttestData}
          posttestResults={posttestResults}
          daysSinceSession1={daysSinceSession1}
          onComplete={handlePostTestQuestionnaireComplete}
        />
      );

    case PHASES.POSTTEST_DONE:
      return (
        <PostTestDonePage
          participant={participant}
          daysSinceSession1={daysSinceSession1}
        />
      );

    case PHASES.COME_BACK_LATER:
      return (
        <ComeBackLaterPage
          participant={participant}
          waitUntil={gatingState.waitUntil}
          daysSinceSession1={gatingState.daysSinceSession1}
        />
      );

    case PHASES.ALREADY_DONE:
      return (
        <AlreadyDonePage
          participant={participant}
          reason={gatingState.reason}
        />
      );

    default:
      return <OnboardingPage onComplete={handleOnboardingComplete} />;
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Rebuild was_glossed from a gloss log using the current TARGET_KANJI keys. */
function reconstructWasGlossed(glossLog) {
  const initial = Object.fromEntries(Object.keys(TARGET_KANJI).map(k => [k, false]));
  for (const entry of glossLog ?? []) {
    if (entry.word in TARGET_KANJI) initial[entry.word] = true;
  }
  return initial;
}
