'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import {
  answerQuestion,
  buildLastSession,
  getCurrentQuestion,
  isQuestionCorrect,
  moveToNextQuestion,
  moveToPreviousQuestion,
  revealQuestion,
  summarizeMockPass,
  summarizeSession,
  summarizeSessionBySubject,
} from '../../lib/session';

import {
  markWeaknessRecovered,

  recordQuestionAnswer,
  clearLastSession,
  loadLastSession,

  loadWrongQuestionIds,
  saveLastSession,
  saveResult,
  type StoredSessionResult,
} from '../../lib/storage';

import type { LastSession, OptionIndex } from '../../lib/types';
import { InlineMarkdownText } from './explanation/MarkdownText';
import { getExplanationMeta } from '../../data/explanation_meta_index';
import { ExplanationCard } from './explanation/ExplanationCard';
import { QuestionListModal } from './QuestionListModal';

const OPTION_INDICES: OptionIndex[] = [0, 1, 2, 3, 4];

const CHOICE_FOCUS_CSS = `
.z4-choice-button:focus:not(:focus-visible) {
  outline: none;
}

.z4-choice-button:focus-visible {
  outline: 2px solid rgba(14, 26, 43, 0.58);
  outline-offset: 2px;
}
`;

type TextSizeMode = 'small' | 'standard' | 'large';

const TEXT_SIZE_STORAGE_KEY = 'z4-text-size-mode';

const TEXT_SIZE_ORDER: TextSizeMode[] = ['small', 'standard', 'large'];

const TEXT_SIZE_PROFILES: Record<
  TextSizeMode,
  {
    label: string;
    questionFontSize: number;
    questionLineHeight: number;
    choiceFontSize: number;
    choiceLineHeight: number;
  }
> = {
  small: {
    label: '\u5c0f',
    questionFontSize: 16,
    questionLineHeight: 1.55,
    choiceFontSize: 14.5,
    choiceLineHeight: 1.58,
  },
  standard: {
    label: '\u6a19\u6e96',
    questionFontSize: 17,
    questionLineHeight: 1.6,
    choiceFontSize: 15,
    choiceLineHeight: 1.65,
  },
  large: {
    label: '\u5927',
    questionFontSize: 18.5,
    questionLineHeight: 1.68,
    choiceFontSize: 16,
    choiceLineHeight: 1.72,
  },
};

function readInitialTextSizeMode(): TextSizeMode {
  if (typeof window === 'undefined') {
    return 'standard';
  }

  const saved = window.localStorage.getItem(TEXT_SIZE_STORAGE_KEY);
  return saved === 'small' || saved === 'standard' || saved === 'large' ? saved : 'standard';
}

const TEXT = {
  loading: '\u8aad\u307f\u8fbc\u307f\u4e2d...',
  mockLabel: '35\u554f \u6a21\u8a66',
  star3Label: '\u2605\u2605\u2605 \u91cd\u8981\u554f\u984c',

  weakPointsLabel: '\u5f31\u70b9\u5fa9\u7fd2',
  daily10Label: '\u4eca\u65e5\u306e10\u554f',
  smartLabel: '\u30b9\u30de\u30fc\u30c810\u554f',
  randomLabel: '\u30e9\u30f3\u30c0\u30e010\u554f',
  subject: '\u79d1\u76ee',
  difficulty: '\u96e3\u6613\u5ea6',
  correct: '\u6b63\u89e3',
  wrong: '\u4e0d\u6b63\u89e3',
  explanation: '\u89e3\u8aac',
  optionDetails: '\u9078\u629e\u80a2\u3054\u3068\u306e\u89e3\u8aac',
  result: '\u7d50\u679c\u3092\u898b\u308b',
  submit: '\u63d0\u51fa\u3059\u308b',
  next: '\u6b21\u306e\u554f\u984c >',
  questionList: '≡ 問題一覧',
  previous: '< \u524d\u306e\u554f\u984c',
  answerFirst: '\u9078\u629e\u80a2\u3092\u9078\u3093\u3067\u304f\u3060\u3055\u3044',
  examAnswered: '\u56de\u7b54\u6e08\u307f\u3067\u3059\u3002\u6b21\u3078\u9032\u3081\u307e\u3059',
  premium: 'Premium Learning',
  z4: 'Z4',
} as const;

function isSubjectParam(value: string | null): value is 'law' | 'phys' | 'prop' {
  return value === 'law' || value === 'phys' || value === 'prop';
}

function buildSessionFromMode(mode: string | null, subject: string | null, id: string | null): LastSession {
  if (mode === 'dev-question' && id) {
    return buildLastSession({
      sessionType: 'daily-10',
      label: `DEV: ${id}`,
      count: 1,
      questionIds: [id],
    });
  }

  if (mode === 'mock-exam') {
    return buildLastSession({
      sessionType: 'mock-exam',
      label: TEXT.mockLabel,
    });
  }

  if (mode === 'star3') {
    return buildLastSession({
      sessionType: 'card-study',
      label: TEXT.star3Label,
      count: 10,
      filters: {
        starMin: 3,
      },
    });
  }


  if (mode === 'weak-points') {
    const wrongQuestionIds = loadWrongQuestionIds();

    if (wrongQuestionIds.length === 0) {
      return buildLastSession({
        sessionType: 'daily-10',
        label: TEXT.daily10Label,
        count: 10,
      });
    }

    return buildLastSession({
      sessionType: 'weak-points',
      label: TEXT.weakPointsLabel,
      count: wrongQuestionIds.length,
      questionIds: wrongQuestionIds,
    });
  }

  const filters = isSubjectParam(subject) ? { subject } : undefined;

  if (mode === 'smart') {
    return buildLastSession({
      sessionType: 'daily-10',
      label: TEXT.smartLabel,
      count: 10,
      filters,
    });
  }

  if (mode === 'random') {
    return buildLastSession({
      sessionType: 'daily-10',
      label: TEXT.randomLabel,
      count: 10,
    });
  }

  return buildLastSession({
    sessionType: 'daily-10',
    label: TEXT.daily10Label,
    count: 10,
    filters,
  });
}

function sessionMatchesMode(
  session: LastSession,
  mode: string | null,
  subject: string | null,
  id: string | null,
): boolean {
  if (mode === 'dev-question') {
    return (
      session.sessionType === 'daily-10' &&
      session.questionIds.length === 1 &&
      session.questionIds[0] === id
    );
  }

  if (mode === 'mock-exam') {
    return session.sessionType === 'mock-exam';
  }

  if (mode === 'star3') {
    return session.sessionType === 'card-study' && session.filters?.starMin === 3;
  }


  if (mode === 'weak-points') {
    return session.sessionType === 'weak-points';
  }

  if (mode === 'smart') {
    return session.sessionType === 'daily-10' && session.label === TEXT.smartLabel;
  }

  if (mode === 'random') {
    return session.sessionType === 'daily-10' && session.label === TEXT.randomLabel;
  }

  if (isSubjectParam(subject)) {
    return session.sessionType === 'daily-10' && session.filters?.subject === subject;
  }

  return session.sessionType === 'daily-10';
}

function createResult(session: LastSession): StoredSessionResult {
  const summary = summarizeSession(session);
  const bySubject = summarizeSessionBySubject(session);
  const mockPass = summarizeMockPass(session);

  return {
    id: `result-${Date.now()}`,
    sessionType: session.sessionType,
    label: session.label,

    questionIds: session.questionIds,
    answers: session.answers,

    total: summary.total,
    answered: summary.answered,
    correct: summary.correct,
    wrong: summary.wrong,
    accuracy: summary.accuracy,

    startedAt: session.startedAt,
    finishedAt: new Date().toISOString(),

    passed:
      session.sessionType === 'mock-exam' ||
      session.sessionType === 'mock-practice'
        ? mockPass.passed
        : undefined,

    bySubject,
  };
}

function subjectLabel(subject: string): string {
  if (subject === 'law') {
    return '\u6cd5\u4ee4';
  }

  if (subject === 'phys') {
    return '\u7269\u7406\u30fb\u5316\u5b66';
  }

  if (subject === 'prop') {
    return '\u6027\u8cea\u30fb\u6d88\u706b';
  }

  return subject;
}

function correctChoiceLabel(index: number): string {
  return String(index + 1);
}

function starLabel(star: number): string {
  return '\u2605'.repeat(star);
}

function difficultyLabel(difficulty: number): string {
  return '\u{1F525}'.repeat(difficulty);
}

function QuizCrestShape({
  stroke,
  fill,
}: {
  stroke: string;
  fill: string;
}) {
  return (
    <>
      <path
        d="M130 18 C156 26 181 34 208 43 V99 C208 150 178 205 130 232 C82 205 52 150 52 99 V43 C79 34 104 26 130 18 Z"
        fill="none"
        stroke={stroke}
        strokeWidth="3.2"
        strokeLinejoin="round"
      />
      <path
        d="M130 34 C151 41 170 47 191 55 V100 C191 142 166 188 130 209 C94 188 69 142 69 100 V55 C90 47 109 41 130 34 Z"
        fill="none"
        stroke={stroke}
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <text
        x="130"
        y="112"
        textAnchor="middle"
        fontSize="58"
        fontFamily="Cormorant Garamond, Georgia, serif"
        fontWeight="600"
        fill={fill}
        opacity="0.72"
      >
        Z4
      </text>
      <path d="M107 132 H153" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
      <path
        d="M116 132 V170 C116 181 105 190 94 197 H166 C155 190 144 181 144 170 V132"
        fill="none"
        stroke={stroke}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M130 158 C141 172 148 183 148 194 C148 206 140 214 130 214 C120 214 112 206 112 194 C112 183 119 172 130 158 Z"
        fill={fill}
        opacity="0.42"
      />
      <path d="M91 186 C73 174 61 156 56 134" fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M169 186 C187 174 199 156 204 134" fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M78 153 C65 144 58 130 58 115" fill="none" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M182 153 C195 144 202 130 202 115" fill="none" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M69 176 C56 166 47 153 43 137" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
      <path d="M191 176 C204 166 213 153 217 137" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
    </>
  );
}

function QuizCrestWatermark() {
  return (
    <div style={quizWatermarkStyle} aria-hidden="true">
      <svg viewBox="0 0 260 260" style={quizWatermarkSvgStyle}>
        <g transform="translate(1.4 1.6)" opacity="0.34">
          <QuizCrestShape stroke="#BFB3A2" fill="#BFB3A2" />
        </g>
        <g transform="translate(-1.2 -1.2)" opacity="0.72">
          <QuizCrestShape stroke="#FFFFFF" fill="#FFFFFF" />
        </g>
        <g opacity="0.64">
          <QuizCrestShape stroke="#D8D0C4" fill="#D8D0C4" />
        </g>
      </svg>
    </div>
  );
}
export default function QuizClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams?.get('mode') ?? null;
  const subject = searchParams?.get('subject') ?? null;
  const id = searchParams?.get('id') ?? null;

  const [session, setSession] = useState<LastSession | null>(null);
  const [showQuestionList, setShowQuestionList] = useState(false);
  const [textSizeMode, setTextSizeMode] = useState<TextSizeMode>(() => readInitialTextSizeMode());
  const [showTextSizeMenu, setShowTextSizeMenu] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(TEXT_SIZE_STORAGE_KEY, textSizeMode);
    }
  }, [textSizeMode]);

  useEffect(() => {
    const existing = loadLastSession();

    if (existing && existing.questionIds.length > 0 && sessionMatchesMode(existing, mode, subject, id)) {
      setSession(existing);
      return;
    }

    const next = buildSessionFromMode(mode, subject, id);
    saveLastSession(next);
    setSession(next);
  }, [mode, subject, id]);

  const currentQuestion = useMemo(() => {
    if (!session) {
      return undefined;
    }

    return getCurrentQuestion(session);
  }, [session]);

  if (!session || !currentQuestion) {
    return (
      <main style={pageStyle}>
        <p>{TEXT.loading}</p>
      </main>
    );
  }

  const questionId = currentQuestion.id;
  const order = session.optionOrders?.[questionId] ?? OPTION_INDICES;
  const revealed = Boolean(session.revealed?.[questionId]);
  const result = isQuestionCorrect(session, questionId);
  const explanationMeta = getExplanationMeta(questionId);
  const isLast = session.currentIndex === session.questionIds.length - 1;
  const isFirst = session.currentIndex === 0;
  const isExamMode = session.sessionType === 'mock-exam';
  const hasAnswered = session.answers[questionId] !== undefined;
  const canProceed = true;
  const progressPercent =
    ((session.currentIndex + 1) / session.questionIds.length) * 100;

  function updateSession(next: LastSession) {
    saveLastSession(next);
    setSession(next);
  }

  function recordAnsweredQuestion(targetSession: LastSession, targetQuestionId: string) {
    const correct = isQuestionCorrect(targetSession, targetQuestionId);

    if (correct === true || correct === false) {
      recordQuestionAnswer(targetQuestionId, correct);
    
      if (targetSession.sessionType === 'weak-points' && correct === true) {
        markWeaknessRecovered(targetQuestionId);
      }
    }
  }

  function handleAnswer(displayedIndex: OptionIndex) {
    if (!session) {
      return;
    }

    const answered = answerQuestion(session, questionId, displayedIndex);

    if (isExamMode) {
      updateSession(answered);
      return;
    }

    const revealedSession = revealQuestion(answered, questionId);
    updateSession(revealedSession);
  }

  function handlePrevious() {
    if (!session || isFirst) {
      return;
    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });

    updateSession(moveToPreviousQuestion(session));
  }

  function handleNext() {
    if (!session || !canProceed) {
      return;
    }

    if (isLast) {
      const finalResult = createResult(session);

      session.questionIds.forEach((id) => {
        recordAnsweredQuestion(session, id);
      });

      saveResult(finalResult);
      clearLastSession();

      router.push(`/result?resultId=${finalResult.id}`);
      return;
    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });

    updateSession(moveToNextQuestion(session));
  }

  return (
    <main style={pageStyle}>
      <style>{CHOICE_FOCUS_CSS}</style>

      <header style={headerStyle}>
        <div style={headerInnerStyle}>
          <div style={topMetaGroupStyle}>
            <span style={topSubjectPillStyle}>{subjectLabel(currentQuestion.subject)}</span>
            <span style={topCountPillStyle}>
              {session.currentIndex + 1} / {session.questionIds.length}
            </span>
          </div>

          <div style={topActionGroupStyle}>
            <button
              type="button"
              onClick={() => setShowTextSizeMenu((value) => !value)}
              style={topTextSizeButtonStyle}
              aria-label={'\u6587\u5b57\u30b5\u30a4\u30ba'}
              title={'\u6587\u5b57\u30b5\u30a4\u30ba'}
            >
              Aa
            </button>

            {showTextSizeMenu && (
              <div style={topTextSizeMenuStyle}>
                <div style={topTextSizeMenuTitleStyle}>{'\u6587\u5b57\u30b5\u30a4\u30ba'}</div>
                <div style={topTextSizeOptionRowStyle}>
                  {TEXT_SIZE_ORDER.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        setTextSizeMode(size);
                        setShowTextSizeMenu(false);
                      }}
                      style={{
                        ...topTextSizeOptionStyle,
                        ...(textSizeMode === size ? topTextSizeOptionActiveStyle : {}),
                      }}
                    >
                      {TEXT_SIZE_PROFILES[size].label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => router.back()}
              style={topExitButtonStyle}
              aria-label={'\u7d42\u4e86'}
              title={'\u7d42\u4e86'}
            >
              {'\u7d42\u4e86'}
            </button>
          </div>
        </div>
      </header>

      <section style={questionCardStyle}>
        <div style={questionTopStyle}>
          <div style={pillGroupStyle}>
            <span style={pillStyle}>{subjectLabel(currentQuestion.subject)}</span>
            <span style={pillStyle}>{currentQuestion.item_name}</span>

            {revealed && currentQuestion.star > 0 && (
              <span style={pillStyle}>{starLabel(currentQuestion.star)}</span>
            )}

            {revealed && (
              <span style={pillStyle}>{difficultyLabel(currentQuestion.difficulty)}</span>
            )}
          </div>

          <span style={saveMockStyle}>{'\u25c7'}</span>
        </div>

        <div style={questionLineStyle}>
          <span style={questionMarkStyle}>Q.</span>
          <h1
            style={{
              ...questionStyle,
              fontSize: TEXT_SIZE_PROFILES[textSizeMode].questionFontSize,
              lineHeight: TEXT_SIZE_PROFILES[textSizeMode].questionLineHeight,
            }}
          >
            {currentQuestion.question}
          </h1>
        </div>
        <QuestionAssistBlock questionId={questionId} />
      </section>

      <section style={choicesStyle} aria-label="choices">
        {order.map((originalIndex, displayedIndex) => {
          const optionText = currentQuestion.options[originalIndex];
          const selected = session.answers[questionId] === originalIndex;
          const correct = currentQuestion.correct === originalIndex;

          let buttonStyle = choiceButtonStyle;
          let numberStyle = choiceNumberStyle;

          if (selected) {
            buttonStyle = {
              ...choiceButtonStyle,
              borderColor: '#C9A55A',
              background: '#FFF8E8',
            };
            numberStyle = {
              ...choiceNumberStyle,
              borderColor: '#C9A55A',
              background: '#F4E4B8',
              color: '#7A551E',
            };
          }

          if (!isExamMode && revealed && correct) {
            buttonStyle = {
              ...choiceButtonStyle,
              borderColor: '#CADBCE',
              background: '#F2FAF5',
            };
            numberStyle = {
              ...choiceNumberStyle,
              borderColor: '#4C7A5D',
              background: '#4C7A5D',
              color: '#FFFFFF',
            };
          }

          if (!isExamMode && revealed && selected && !correct) {
            buttonStyle = {
              ...choiceButtonStyle,
              borderColor: '#E6CBCD',
              background: '#FFF4F3',
            };
            numberStyle = {
              ...choiceNumberStyle,
              borderColor: '#B01F2E',
              background: '#B01F2E',
              color: '#FFFFFF',
            };
          }

          return (
            <button
              key={`${questionId}-${originalIndex}`}
              type="button"
              className="z4-choice-button"
              onClick={() => handleAnswer(displayedIndex as OptionIndex)}
              style={buttonStyle}
            >
              <span style={numberStyle}>{displayedIndex + 1}</span>
              <span
                style={{
                  ...choiceTextStyle,
                  fontSize: TEXT_SIZE_PROFILES[textSizeMode].choiceFontSize,
                  lineHeight: TEXT_SIZE_PROFILES[textSizeMode].choiceLineHeight,
                }}
              >
                {optionText}
              </span>

            </button>
          );
        })}
      </section>

      {!isExamMode && revealed && (
        <section
          style={{
            ...verdictStyle,
            borderColor: result ? '#2D765A' : '#B72A32',
            background: result ? '#F2FAF5' : '#FFF4F3',
          }}
          aria-live="polite"
        >
          <strong>{result ? TEXT.correct : TEXT.wrong}</strong>
          {!result && (
            <span>
              {' '}
              / {TEXT.correct}: {correctChoiceLabel(currentQuestion.correct)}
            </span>
          )}
        </section>
      )}

      {!isExamMode && revealed && (
        explanationMeta ? (
          <ExplanationCard meta={explanationMeta} />
        ) : (
          <section style={explanationStyle}>
            <h2 style={subTitleStyle}>
              <span style={accentDotStyle} />
              {TEXT.explanation}
            </h2>

            <p style={explanationTextStyle}><InlineMarkdownText text={currentQuestion.explanation} /></p>

            <details style={detailsStyle}>
              <summary style={detailsSummaryStyle}>{TEXT.optionDetails}</summary>

              <ul style={detailListStyle}>
                {currentQuestion.option_details.map((detail, index) => (
                  <li key={index}><InlineMarkdownText text={detail} /></li>
                ))}
              </ul>
            </details>
          </section>
        )
      )}

      <footer style={footerStyle}>
        <div style={footerInnerStyle}>
          <button
            type="button"
            onClick={handlePrevious}
            disabled={isFirst}
            style={{
              ...secondaryFooterButtonStyle,
              opacity: isFirst ? 0.45 : 1,
              cursor: isFirst ? 'not-allowed' : 'pointer',
            }}
          >
            {TEXT.previous}
          </button>

          <button
            type="button"
            onClick={() => setShowQuestionList(true)}
            style={questionListButtonStyle}
          >
            {TEXT.questionList}
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={!canProceed}
            style={{
              ...primaryButtonStyle,
              opacity: canProceed ? 1 : 0.48,
              cursor: canProceed ? 'pointer' : 'not-allowed',
            }}
          >
            {isLast ? (isExamMode ? TEXT.submit : TEXT.result) : TEXT.next}
          </button>
        </div>
      </footer>

      {showQuestionList && session && (
        <QuestionListModal
          questionIds={session.questionIds}
          currentIndex={session.currentIndex}
          isExamMode={isExamMode}
          getKind={(qid) => {
            if (isExamMode) {
              return session.answers[qid] !== undefined ? 'answered' : 'untouched';
            }
            const c = isQuestionCorrect(session, qid);
            return c === true ? 'correct' : c === false ? 'wrong' : 'untouched';
          }}
          onJump={(i) => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            updateSession({ ...session, currentIndex: i });
            setShowQuestionList(false);
          }}
          onClose={() => setShowQuestionList(false)}
        />
      )}
    </main>
  );
}

const topMetaGroupStyle: CSSProperties = {
  minWidth: 0,
  display: 'flex',
  alignItems: 'center',
  gap: 6,
};

const topSubjectPillStyle: CSSProperties = {
  maxWidth: 116,
  minHeight: 30,
  padding: '5px 10px',
  borderRadius: 999,
  border: '1px solid #C9A55A',
  background: '#FFF8E8',
  color: '#8B6226',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontSize: 13,
  fontWeight: 800,
  fontFamily:
    '"Noto Serif JP", "Yu Mincho", "Hiragino Mincho ProN", Georgia, serif',
};

const topCountPillStyle: CSSProperties = {
  minHeight: 30,
  padding: '5px 10px',
  borderRadius: 999,
  border: '1px solid #E3D9CA',
  background: 'rgba(255, 252, 248, 0.82)',
  color: '#6B5B43',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  whiteSpace: 'nowrap',
  fontSize: 14,
  fontWeight: 700,
  letterSpacing: '0.01em',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans JP", sans-serif',
};

const topActionGroupStyle: CSSProperties = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: 6,
};

const topTextSizeButtonStyle: CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: 10,
  border: '1px solid #D8D2C6',
  background: 'rgba(255, 252, 248, 0.96)',
  color: '#6B5B43',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
  fontSize: 14,
  fontWeight: 900,
  lineHeight: 1,
  cursor: 'pointer',
  fontFamily:
    '"Noto Serif JP", "Yu Mincho", "Hiragino Mincho ProN", Georgia, serif',
};

const topExitButtonStyle: CSSProperties = {
  minWidth: 44,
  height: 34,
  padding: '0 10px',
  borderRadius: 10,
  border: '1px solid #D8D2C6',
  background: 'rgba(255, 252, 248, 0.98)',
  color: '#8B6226',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 13,
  fontWeight: 800,
  lineHeight: 1,
  cursor: 'pointer',
  fontFamily:
    '"Noto Serif JP", "Yu Mincho", "Hiragino Mincho ProN", Georgia, serif',
};

const topTextSizeMenuStyle: CSSProperties = {
  position: 'absolute',
  top: 40,
  right: 0,
  zIndex: 45,
  width: 158,
  padding: 10,
  borderRadius: 12,
  border: '1px solid #D8D2C6',
  background: 'rgba(255, 252, 248, 0.98)',
  boxShadow: '0 14px 34px rgba(14, 26, 43, 0.18)',
};

const topTextSizeMenuTitleStyle: CSSProperties = {
  marginBottom: 8,
  color: '#6B5B43',
  fontSize: 12,
  fontWeight: 800,
  fontFamily:
    '"Noto Serif JP", "Yu Mincho", "Hiragino Mincho ProN", Georgia, serif',
};

const topTextSizeOptionRowStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
  gap: 6,
};

const topTextSizeOptionStyle: CSSProperties = {
  minHeight: 34,
  borderRadius: 9,
  border: '1px solid #D8D2C6',
  background: '#FFFFFF',
  color: '#4F4A42',
  fontSize: 12.5,
  fontWeight: 800,
  cursor: 'pointer',
  fontFamily:
    '"Noto Serif JP", "Yu Mincho", "Hiragino Mincho ProN", Georgia, serif',
};

const topTextSizeOptionActiveStyle: CSSProperties = {
  borderColor: '#C9A55A',
  background: '#FFF8E8',
  color: '#8B6226',
};

function QuestionAssistBlock({ questionId }: { questionId: string }) {
  if (questionId !== 'PHYS-021-001') {
    return null;
  }

  return (
    <aside style={questionAssistStyle} aria-label="原子記号の読み方">
      <div style={questionAssistHeaderStyle}>原子記号の読み方</div>

      <div style={questionAssistBodyStyle}>
        <div
          style={nuclideSymbolStyle}
          aria-label="アルミニウム、上の数字27、下の数字13"
        >
          <span style={nuclideNumbersStyle}>
            <span style={nuclideNumberStyle}>27</span>
            <span style={nuclideNumberStyle}>13</span>
          </span>
          <span style={nuclideElementStyle}>Al</span>
        </div>

        <div style={nuclideLegendStyle}>
          <div>
            <strong>上の数字</strong> = 質量数
          </div>
          <div>
            <strong>下の数字</strong> = 原子番号
          </div>
          <div>
            ※ここでは数字の位置だけ確認します
          </div>
        </div>
      </div>
    </aside>
  );
}

const questionAssistStyle: CSSProperties = {
  marginTop: 14,
  padding: '12px 14px',
  border: '1px solid #E6D6B4',
  borderRadius: 16,
  background: '#FFFCF2',
  color: '#243044',
  boxShadow: '0 8px 22px rgba(88, 64, 22, 0.08)',
};

const questionAssistHeaderStyle: CSSProperties = {
  color: '#8A5A18',
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: '0.04em',
  marginBottom: 10,
};

const questionAssistBodyStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 14,
  flexWrap: 'wrap',
};

const nuclideSymbolStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 94,
  padding: '10px 12px',
  borderRadius: 14,
  background: '#FFFFFF',
  border: '1px solid #E9DEC4',
  boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.7)',
};

const nuclideNumbersStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  justifyContent: 'center',
  lineHeight: 0.9,
  marginRight: 4,
};

const nuclideNumberStyle: CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  fontFamily: 'Georgia, serif',
  color: '#8A5A18',
};

const nuclideElementStyle: CSSProperties = {
  fontSize: 38,
  fontWeight: 700,
  lineHeight: 1,
  fontFamily: 'Georgia, serif',
  color: '#1F2A3A',
};

const nuclideLegendStyle: CSSProperties = {
  display: 'grid',
  gap: 4,
  fontSize: 13.5,
  lineHeight: 1.55,
};

const questionLineStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 8,
};

const questionMarkStyle: CSSProperties = {
  color: '#0E2745',
  fontSize: 26,
  fontWeight: 600,
  lineHeight: 1.15,
  fontFamily: 'Cormorant Garamond, Georgia, serif',
};

const quizWatermarkStyle: CSSProperties = {
  position: 'absolute',
  right: 6,
  top: 10,
  width: 112,
  height: 112,
  opacity: 1,
  pointerEvents: 'none',
  transform: 'rotate(-2deg)',
  zIndex: 1,
};

const quizWatermarkSvgStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'block',
};

const detailsSummaryStyle: CSSProperties = {
  cursor: 'pointer',
  color: '#A36E38',
  fontSize: 15,
  fontWeight: 700,
  fontFamily:
    '"Noto Serif JP", "Yu Mincho", "Hiragino Mincho ProN", Georgia, serif',
};
const pageStyle: CSSProperties = {
  maxWidth: 430,
  margin: '0 auto',
  minHeight: '100vh',
  padding: '66px 18px 150px',
  background:
    'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.95) 0%, rgba(250,247,242,0.96) 45%, #F7F1EA 100%)',
  color: '#0E1A2B',
};

const headerStyle: CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 30,
  background: 'rgba(255, 252, 248, 0.96)',
  borderBottom: '1px solid rgba(218, 210, 198, 0.82)',
  backdropFilter: 'blur(12px)',
};

const headerInnerStyle: CSSProperties = {
  maxWidth: 430,
  margin: '0 auto',
  minHeight: 52,
  padding: '0 14px',
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  alignItems: 'center',
  gap: 10,
};

const logoBlockStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
};

const logoStyle: CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: 12,
  display: 'grid',
  placeItems: 'center',
  background: '#1a2a4f',
  color: '#f5e6c8',
  fontWeight: 900,
  letterSpacing: -1,
};

const eyebrowStyle: CSSProperties = {
  margin: 0,
  color: '#b8860b',
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: 0.5,
};

const labelStyle: CSSProperties = {
  margin: 0,
  color: '#1a1f2e',
  fontSize: 14,
  fontWeight: 800,
};

const progressMetaStyle: CSSProperties = {
  maxWidth: 760,
  margin: '0 auto',
  padding: '0 18px 6px',
  display: 'flex',
  justifyContent: 'space-between',
  color: '#7a756c',
  fontSize: 12,
  fontWeight: 700,
};

const progressTrackStyle: CSSProperties = {
  height: 3,
  background: '#eee8dd',
};

const progressFillStyle: CSSProperties = {
  height: '100%',
  background: '#b8860b',
  transition: 'width 180ms ease',
};

const questionCardStyle: CSSProperties = {
  padding: '12px 0 8px',
  background: 'transparent',
  border: 'none',
  boxShadow: 'none',
};

const questionTopStyle: CSSProperties = {
  display: 'none',
};

const pillGroupStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
};

const pillStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: 28,
  padding: '4px 10px',
  borderRadius: 999,
  background: '#f5e6c8',
  color: '#1a2a4f',
  fontSize: 12,
  fontWeight: 800,
};

const saveMockStyle: CSSProperties = {
  color: '#b8860b',
  fontSize: 22,
  lineHeight: 1,
};

const questionStyle: CSSProperties = {
  margin: 0,
  flex: 1,
  color: '#0E1A2B',
  fontSize: 17,
  fontWeight: 600,
  lineHeight: 1.6,
  whiteSpace: 'pre-line',
  letterSpacing: '0.02em',
  fontFamily:
    '"Noto Serif JP", "Yu Mincho", "Hiragino Mincho ProN", Georgia, serif',
};

const choicesStyle: CSSProperties = {
  display: 'grid',
  gap: 10,
  marginTop: 12,
};

const choiceButtonStyle: CSSProperties = {
  minHeight: 52,
  width: '100%',
  padding: '10px 14px',
  borderRadius: 10,
  border: '1.3px solid #E4DDD3',
  background: 'rgba(255, 252, 248, 0.96)',
  color: '#0E1A2B',
  display: 'grid',
  gridTemplateColumns: '28px minmax(0, 1fr)',
  alignItems: 'center',
  gap: 12,
  textAlign: 'left',
  boxShadow:
    '0 1px 2px rgba(35, 28, 20, 0.035), 0 8px 20px rgba(35, 28, 20, 0.055)',
  fontFamily:
    '"Noto Serif JP", "Yu Mincho", "Hiragino Mincho ProN", Georgia, serif',
};

const choiceNumberStyle: CSSProperties = {
  width: 28,
  height: 28,
  minWidth: 28,
  borderRadius: 999,
  border: '1px solid #D8D2C6',
  background: 'rgba(255, 252, 248, 0.92)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#5A5347',
  fontWeight: 800,
  fontSize: 14,
  lineHeight: 1,
  fontFamily:
    '"Noto Serif JP", "Yu Mincho", "Hiragino Mincho ProN", Georgia, serif',
};

const choiceTextStyle: CSSProperties = {
  minWidth: 0,
  fontSize: 15,
  fontWeight: 600,
  lineHeight: 1.65,
};


const verdictStyle: CSSProperties = {
  marginTop: 20,
  padding: '0 0 0 16px',
  borderRadius: 0,
  border: 'none',
  borderLeft: '4px solid',
  color: '#9F1F27',
  background: 'transparent',
  fontSize: 15,
  fontWeight: 700,
  lineHeight: 1.7,
  fontFamily:
    '"Noto Serif JP", "Yu Mincho", "Hiragino Mincho ProN", Georgia, serif',
};

const explanationStyle: CSSProperties = {
  position: 'relative',
  overflow: 'hidden',
  marginTop: 18,
  padding: '20px 20px 18px',
  borderRadius: 12,
  background:
    'radial-gradient(circle at 83% 26%, rgba(255,255,255,0.86) 0%, rgba(255,255,255,0.26) 36%, rgba(255,252,247,0) 62%), rgba(255, 252, 248, 0.98)',
  border: '1px solid #E2D9CD',
  boxShadow:
    '0 1px 2px rgba(35, 28, 20, 0.035), 0 10px 24px rgba(35, 28, 20, 0.065)',
};

const subTitleStyle: CSSProperties = {
  position: 'relative',
  zIndex: 2,
  margin: 0,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  color: '#A36E38',
  fontSize: 20,
  fontWeight: 700,
  fontFamily:
    '"Noto Serif JP", "Yu Mincho", "Hiragino Mincho ProN", Georgia, serif',
};

const accentDotStyle: CSSProperties = {
  display: 'none',
};

const explanationTextStyle: CSSProperties = {
  position: 'relative',
  zIndex: 2,
  color: '#0E1A2B',
  fontSize: 15,
  fontWeight: 600,
  lineHeight: 1.85,
  fontFamily:
    '"Noto Serif JP", "Yu Mincho", "Hiragino Mincho ProN", Georgia, serif',
};

const detailsStyle: CSSProperties = {
  position: 'relative',
  zIndex: 2,
  marginTop: 16,
  padding: '14px 16px',
  borderRadius: 12,
  background: 'rgba(255, 252, 248, 0.96)',
  border: '1px solid #E4DDD3',
  color: '#0E1A2B',
  boxShadow: '0 6px 18px rgba(35, 28, 20, 0.045)',
};

const detailListStyle: CSSProperties = {
  margin: '10px 0 0',
  lineHeight: 1.8,
  paddingLeft: 20,
  fontSize: 13,
  color: '#3F3932',
};

const footerStyle: CSSProperties = {
  position: 'fixed',
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 30,
  padding: '10px 18px 16px',
  background:
    'linear-gradient(180deg, rgba(250,247,242,0.74) 0%, rgba(250,247,242,0.98) 30%, #FAF7F2 100%)',
  borderTop: '1px solid rgba(218, 210, 198, 0.76)',
  backdropFilter: 'blur(12px)',
};

const footerInnerStyle: CSSProperties = {
  maxWidth: 430,
  margin: '0 auto',
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
  alignItems: 'center',
  gap: 8,
};

const questionListButtonStyle: CSSProperties = {
  width: '100%',
  minHeight: 46,
  padding: '8px 10px',
  borderRadius: 10,
  border: '1px solid #D8D2C6',
  background: 'rgba(255, 252, 248, 0.96)',
  color: '#4F4A42',
  fontSize: 14,
  fontWeight: 700,
  whiteSpace: 'nowrap',
  cursor: 'pointer',
  boxShadow: '0 4px 10px rgba(14, 26, 43, 0.06)',
  fontFamily:
    '"Noto Serif JP", "Yu Mincho", "Hiragino Mincho ProN", Georgia, serif',
};

const primaryButtonStyle: CSSProperties = {
  width: '100%',
  minHeight: 46,
  padding: '8px 10px',
  borderRadius: 10,
  border: '1px solid #B89143',
  background: 'linear-gradient(180deg, #D9C06F 0%, #C9A55A 52%, #A97932 100%)',
  color: '#ffffff',
  fontSize: 14,
  fontWeight: 800,
  whiteSpace: 'nowrap',
  boxShadow: '0 8px 16px rgba(169, 121, 50, 0.26)',
  fontFamily:
    '"Noto Serif JP", "Yu Mincho", "Hiragino Mincho ProN", Georgia, serif',
};

const secondaryFooterButtonStyle: CSSProperties = {
  width: '100%',
  minHeight: 46,
  padding: '8px 10px',
  borderRadius: 10,
  border: '1px solid #D8D2C6',
  background: 'rgba(255, 252, 248, 0.96)',
  color: '#4F4A42',
  fontSize: 14,
  fontWeight: 700,
  whiteSpace: 'nowrap',
  boxShadow: '0 4px 10px rgba(14, 26, 43, 0.06)',
  fontFamily:
    '"Noto Serif JP", "Yu Mincho", "Hiragino Mincho ProN", Georgia, serif',
};