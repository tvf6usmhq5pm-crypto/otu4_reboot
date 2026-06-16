'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { buildHomeDashboardSummary } from '../../lib/analytics';
import {
  diagnoseNextAction,
  type DiagnosticRecommendation,
} from '../../lib/diagnostics';

import BottomTabBar from './BottomTabBar';
import HomeHeroCard from './HomeHeroCard';
import HomeHeader from './HomeHeader';
import HomeReasonPanel from './HomeReasonPanel';
import HomeStudyModeGrid from './HomeStudyModeGrid';
import SubjectStatusCard, { type SubjectStatus } from './SubjectStatusCard';

type SubjectKey = 'law' | 'phys' | 'prop';

type SubjectSummary = {
  total: number;
  correct: number;
};

type HomeState = {
  hasSession: boolean;
  wrongCount: number;
  examDays: number | null;
  statuses: SubjectStatus[];
  focusSubject: SubjectKey | null;
  remainingQuestions: number;
  summaries: Record<SubjectKey, SubjectSummary>;
};

const DEFAULT_SUMMARIES: Record<SubjectKey, SubjectSummary> = {
  law: { total: 0, correct: 0 },
  phys: { total: 0, correct: 0 },
  prop: { total: 0, correct: 0 },
};

const DEFAULT_STATUSES: SubjectStatus[] = [
  { key: 'law', label: '法令', percent: 0, state: 'unknown', correct: 0, total: 0, gapTo60: 0 },
  { key: 'phys', label: '物理・化学', percent: 0, state: 'unknown', correct: 0, total: 0, gapTo60: 0 },
  { key: 'prop', label: '性質・消火', percent: 0, state: 'unknown', correct: 0, total: 0, gapTo60: 0 },
];

function subjectLabel(subject: SubjectKey): string {
  if (subject === 'law') {
    return '法令';
  }

  if (subject === 'phys') {
    return '物理・化学';
  }

  return '性質・消火';
}

function compactSubjectLabel(subject: SubjectKey): string {
  if (subject === 'law') {
    return '\u6cd5\u4ee4';
  }

  if (subject === 'phys') {
    return '\u7269\u5316';
  }

  return '\u6027\u8cea\u30fb\u6d88\u706b';
}

function calcExamDays(examDate: string | null): number | null {
  if (!examDate) {
    return 67;
  }

  const target = new Date(`${examDate}T00:00:00`);
  const now = new Date();

  if (Number.isNaN(target.getTime())) {
    return 67;
  }

  const diffMs = target.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / 86400000));
}

function buildHomeState(): HomeState {
  return buildHomeDashboardSummary();
}

function buildRecommendation(state: HomeState): DiagnosticRecommendation {
  return diagnoseNextAction({
    wrongCount: state.wrongCount,
    examDays: state.examDays,
    summaries: state.summaries,
  });
}

function buildCTAHref(recommendation: DiagnosticRecommendation): string {
  if (recommendation.mode === 'daily-10' && recommendation.subject) {
    return `/quiz?mode=daily-10&subject=${recommendation.subject}`;
  }

  return `/quiz?mode=${recommendation.mode}`;
}

function buildFocusLabel(recommendation: DiagnosticRecommendation): string {
  if (recommendation.mode === 'weak-points') {
    return '未復習ミスを優先';
  }

  if (recommendation.mode === 'mock-exam') {
    return '35問実践で合格ライン確認';
  }

  if (recommendation.subject) {
    return `${subjectLabel(recommendation.subject)}を中心に出題`;
  }

  return '3科目をバランスよく出題';
}

function buildReason(recommendation: DiagnosticRecommendation): string {
  return recommendation.reason;
}

function buildHeroTitle(recommendation: DiagnosticRecommendation): string {
  if (recommendation.mode === 'weak-points') {
    return '未復習ミスを';
  }

  if (recommendation.mode === 'mock-exam') {
    return '35問模試で';
  }

  if (recommendation.subject) {
    return `${compactSubjectLabel(recommendation.subject)}が`;
  }

  return '今日の10問で';
}

function buildHeroGoalText(
  recommendation: DiagnosticRecommendation,
  gapToGoal: number,
): string {
  if (recommendation.mode === 'weak-points') {
    return '今日あと';
  }

  if (recommendation.mode === 'mock-exam') {
    return '合格ラインを';
  }

  if (recommendation.subject && gapToGoal > 0) {
    return '60%まであと';
  }

  return '3科目を';
}

function buildHeroEmphasisText(
  recommendation: DiagnosticRecommendation,
  gapToGoal: number,
): string {
  if (recommendation.mode === 'weak-points') {
    return `${recommendation.count}問`;
  }

  if (recommendation.mode === 'mock-exam') {
    return '確認';
  }

  if (recommendation.subject && gapToGoal > 0) {
    return `${gapToGoal}問`;
  }

  return '確認';
}
function buildReasonItems(state: HomeState) {
  const focus = state.focusSubject ? subjectLabel(state.focusSubject) : '3科目';

  return [
    {
      icon: '⚗',
      text:
        state.focusSubject && (state.statuses.find((item) => item.key === state.focusSubject)?.percent ?? 0) < 60
          ? `${focus}が60%ライン未達です`
          : '3科目をバランスよく維持します',
    },
    {
      icon: '↺',
      text:
        state.wrongCount > 0
          ? `未復習のミスが ${state.wrongCount} 問あります`
          : '未復習のミスはありません',
    },
    {
      icon: '◎',
      text:
        state.remainingQuestions > 0
          ? `合格圏まで あと ${state.remainingQuestions} 問です`
          : '3科目とも合格ラインに到達しています',
    },
  ];
}

export default function HomeClient() {
  const [state, setState] = useState<HomeState>({
    hasSession: false,
    wrongCount: 0,
    examDays: 67,
    statuses: DEFAULT_STATUSES,
    focusSubject: 'phys',
    remainingQuestions: 18,
    summaries: DEFAULT_SUMMARIES,
  });

  useEffect(() => {
    setState(buildHomeState());
  }, []);

  const recommendation = useMemo(() => buildRecommendation(state), [state]);
  const ctaHref = useMemo(() => buildCTAHref(recommendation), [recommendation]);
  const ctaFocusLabel = useMemo(
    () => buildFocusLabel(recommendation),
    [recommendation],
  );
  const ctaReason = useMemo(() => buildReason(recommendation), [recommendation]);
  const ctaGapToGoal = useMemo(() => {
    if (recommendation.mode === 'daily-10' && recommendation.gapTo60 > 0) {
      return recommendation.gapTo60;
    }

    if (recommendation.mode === 'weak-points') {
      return recommendation.count;
    }

    return state.remainingQuestions > 0 ? state.remainingQuestions : recommendation.count;
  }, [recommendation, state.remainingQuestions]);
  const reasonItems = useMemo(() => buildReasonItems(state), [state]);

  return (
    <main style={pageStyle}>
      <div style={screenStyle}>
        <HomeHeader examDays={state.examDays} />

        <HomeHeroCard
          href={ctaHref}
          title={buildHeroTitle(recommendation)}
          goalText={buildHeroGoalText(recommendation, ctaGapToGoal)}
          emphasisText={buildHeroEmphasisText(recommendation, ctaGapToGoal)}
          description={ctaFocusLabel}
          subDescription={ctaReason}
          ctaLabel={recommendation.ctaLabel}
        />

        <HomeReasonPanel items={reasonItems} />

        <SubjectStatusCard statuses={state.statuses} />

        <div style={quickGridStyle}>
          <Link href="/quiz?mode=weak-points" style={quickCardStyle}>
            <div style={quickTopStyle}>
              <div style={quickTitleRowStyle}>
                <span style={quickIconStyle}>🗓</span>
                <strong style={quickTitleStyle}>未復習のミス</strong>
              </div>

              {state.wrongCount > 0 && (
                <span style={badgeStyle}>{state.wrongCount}問</span>
              )}
            </div>

            <p style={quickSubStyle}>24時間以内の復習で得点に変える</p>
            <span style={chevronStyle}>›</span>
          </Link>

          <Link href="/quiz?mode=mock-exam" style={quickCardStyle}>
            <div style={quickTopStyle}>
              <div style={quickTitleRowStyle}>
                <span style={quickIconStyle}>🧾</span>
                <strong style={quickTitleStyle}>35問実践モード</strong>
              </div>
            </div>

            <p style={quickSubStyle}>本番形式で3科目60%をチェック</p>
            <span style={chevronStyle}>›</span>
          </Link>
        </div>

        <HomeStudyModeGrid />

        {state.hasSession && (
          <Link href="/quiz?mode=daily-10" style={resumeCardStyle}>
            <div>
              <strong style={resumeTitleStyle}>続きから再開</strong>
              <p style={resumeSubStyle}>前回の演習の途中からすぐ戻れます</p>
            </div>

            <span style={resumeArrowStyle}>→</span>
          </Link>
        )}
      </div>

      <BottomTabBar />
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: '#F7F4EE',
  paddingBottom: 92,
};

const screenStyle: React.CSSProperties = {
  maxWidth: 430,
  margin: '0 auto',
};

const quickGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 10,
  margin: '0 18px 14px',
};

const quickCardStyle: React.CSSProperties = {
  position: 'relative',
  minWidth: 0,
  minHeight: 118,
  padding: '14px 14px 16px',
  borderRadius: 18,
  background: '#FFFFFF',
  border: '1px solid #E5DFD3',
  boxShadow: '0 12px 28px rgba(14, 26, 43, 0.04)',
};

const quickTopStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 8,
};

const quickTitleRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  minWidth: 0,
};

const quickIconStyle: React.CSSProperties = {
  fontSize: 16,
  lineHeight: 1,
};

const quickTitleStyle: React.CSSProperties = {
  color: '#0E1A2B',
  fontSize: 14,
  fontWeight: 900,
  lineHeight: 1.35,
};

const badgeStyle: React.CSSProperties = {
  flexShrink: 0,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '3px 8px',
  borderRadius: 999,
  background: '#FCEEF0',
  color: '#B01F2E',
  fontSize: 11,
  fontWeight: 900,
};

const quickSubStyle: React.CSSProperties = {
  margin: '10px 0 0',
  color: '#6B6258',
  fontSize: 12,
  fontWeight: 700,
  lineHeight: 1.55,
};

const chevronStyle: React.CSSProperties = {
  position: 'absolute',
  right: 12,
  bottom: 10,
  color: '#A89F90',
  fontSize: 18,
  fontWeight: 900,
};

const resumeCardStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  margin: '0 18px 18px',
  padding: '15px 16px',
  borderRadius: 18,
  background: '#0E1A2B',
  color: '#FFFFFF',
  boxShadow: '0 16px 34px rgba(14, 26, 43, 0.18)',
};

const resumeTitleStyle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 900,
};

const resumeSubStyle: React.CSSProperties = {
  margin: '4px 0 0',
  color: '#DAD3C7',
  fontSize: 12,
  fontWeight: 700,
};

const resumeArrowStyle: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 900,
  lineHeight: 1,
};