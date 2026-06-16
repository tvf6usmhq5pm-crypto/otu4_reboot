import {
  loadExamDate,
  loadLastSession,
  loadResults,
  loadWeaknessRecords,
  loadWrongQuestionIds,
  type StoredSessionResult,
} from './storage';

import {
  getQuestionById,
} from './questions';

import type {
  OptionIndex,
  Subject,
  WeaknessRecord,
} from './types';

export const SUBJECT_KEYS: Subject[] = ['law', 'phys', 'prop'];

export type SubjectSummary = {
  subject: Subject;
  label: string;
  total: number;
  answered: number;
  correct: number;
  percent: number;
  gapTo60: number;
  passed60: boolean;
};

export type SubjectSummaryMap = Record<Subject, SubjectSummary>;

export type HomeSubjectStatus = {
  key: Subject;
  label: string;
  percent: number;
  state: 'unknown' | 'need' | 'reached';
  correct: number;
  total: number;
  gapTo60: number;
};

export type HomeDashboardSummary = {
  hasSession: boolean;
  wrongCount: number;
  examDays: number | null;
  statuses: HomeSubjectStatus[];
  focusSubject: Subject | null;
  remainingQuestions: number;
  summaries: SubjectSummaryMap;
};

export type PassReadiness = {
  passed: boolean;
  totalGapTo60: number;
  weakestSubject: Subject;
};

export type RecentResultSummary = {
  hasResult: boolean;
  resultId: string | null;
  sessionType: string | null;
  total: number;
  answered: number;
  correct: number;
  wrong: number;
  percent: number;
  wrongQuestionIds: string[];
  bySubject: SubjectSummaryMap;
};

export type WeakPointItem = {
  questionId: string;
  subject: Subject | null;
  label: string;
  itemName: string;
  errorCount: number;
  lastErrorAt: string;
  weaknessScore: number;
};

export type WeakPointSummary = {
  total: number;
  items: WeakPointItem[];
};

type RawSubjectSummary = {
  total?: unknown;
  answered?: unknown;
  correct?: unknown;
};

function subjectLabel(subject: Subject): string {
  if (subject === 'law') {
    return '\u6cd5\u4ee4';
  }

  if (subject === 'phys') {
    return '\u7269\u7406\u30fb\u5316\u5b66';
  }

  return '\u6027\u8cea\u30fb\u6d88\u706b';
}

function toCount(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.round(value));
}

function getRawSubjectSummary(
  bySubject: unknown,
  subject: Subject,
): RawSubjectSummary {
  if (!bySubject || typeof bySubject !== 'object') {
    return {};
  }

  const record = bySubject as Record<string, RawSubjectSummary | undefined>;
  return record[subject] ?? {};
}

function isOptionIndexValue(value: unknown): value is OptionIndex {
  return value === 0 || value === 1 || value === 2 || value === 3 || value === 4;
}

export function calcPercent(correct: number, total: number): number {
  if (total <= 0) {
    return 0;
  }

  return Math.round((correct / total) * 100);
}

export function calcGapTo60(correct: number, total: number): number {
  if (total <= 0) {
    return 0;
  }

  return Math.max(0, Math.ceil(total * 0.6) - correct);
}

export function calcExamDays(
  examDate: string | null,
  now = new Date(),
): number | null {
  if (!examDate) {
    return null;
  }

  const target = new Date(`${examDate}T00:00:00`);

  if (Number.isNaN(target.getTime())) {
    return null;
  }

  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 86400000));
}

export function calcExamDaysWithFallback(
  examDate: string | null,
  fallback = 67,
  now = new Date(),
): number {
  return calcExamDays(examDate, now) ?? fallback;
}

export function normalizeSubjectSummaries(bySubject: unknown): SubjectSummaryMap {
  const entries = SUBJECT_KEYS.map((subject) => {
    const raw = getRawSubjectSummary(bySubject, subject);
    const total = toCount(raw.total);
    const answered = toCount(raw.answered ?? raw.total);
    const correct = toCount(raw.correct);
    const percent = calcPercent(correct, total);
    const gapTo60 = calcGapTo60(correct, total);

    return [
      subject,
      {
        subject,
        label: subjectLabel(subject),
        total,
        answered,
        correct,
        percent,
        gapTo60,
        passed60: total > 0 && gapTo60 === 0,
      },
    ] as const;
  });

  return Object.fromEntries(entries) as SubjectSummaryMap;
}

export function getWeakestSubject(summaries: SubjectSummaryMap): Subject {
  const measured = SUBJECT_KEYS.filter((subject) => summaries[subject].total > 0);

  if (measured.length === 0) {
    return 'phys';
  }

  return measured
    .slice()
    .sort((a, b) => {
      const percentDiff = summaries[a].percent - summaries[b].percent;

      if (percentDiff !== 0) {
        return percentDiff;
      }

      return summaries[b].gapTo60 - summaries[a].gapTo60;
    })[0];
}

export function calcTotalGapTo60(summaries: SubjectSummaryMap): number {
  return SUBJECT_KEYS.reduce(
    (sum, subject) => sum + summaries[subject].gapTo60,
    0,
  );
}

export function calcPassReadiness(summaries: SubjectSummaryMap): PassReadiness {
  const totalGapTo60 = calcTotalGapTo60(summaries);

  return {
    passed: totalGapTo60 === 0 && SUBJECT_KEYS.every((subject) => summaries[subject].total > 0),
    totalGapTo60,
    weakestSubject: getWeakestSubject(summaries),
  };
}

export function getWrongQuestionIdsFromResult(result: StoredSessionResult): string[] {
  const answers = result.answers as Record<string, unknown> | undefined;

  return result.questionIds.filter((questionId) => {
    const question = getQuestionById(questionId);

    if (!question) {
      return true;
    }

    const answer = answers?.[questionId];

    if (!isOptionIndexValue(answer)) {
      return true;
    }

    return answer !== question.correct;
  });
}

export function getLatestResult(
  results: StoredSessionResult[] = loadResults(),
): StoredSessionResult | null {
  return results[0] ?? null;
}

export function getResultById(
  resultId: string | null,
  results: StoredSessionResult[] = loadResults(),
): StoredSessionResult | null {
  if (!resultId) {
    return getLatestResult(results);
  }

  return results.find((result) => result.id === resultId) ?? null;
}

export function getSubjectAccuracySummary(
  result: StoredSessionResult | null,
): SubjectSummaryMap {
  return normalizeSubjectSummaries(result?.bySubject);
}

export function getRecentResultSummary(
  result: StoredSessionResult | null = getLatestResult(),
): RecentResultSummary {
  if (!result) {
    return {
      hasResult: false,
      resultId: null,
      sessionType: null,
      total: 0,
      answered: 0,
      correct: 0,
      wrong: 0,
      percent: 0,
      wrongQuestionIds: [],
      bySubject: normalizeSubjectSummaries(undefined),
    };
  }

  const total = toCount(result.total);
  const answered = toCount(result.answered ?? result.total);
  const correct = toCount(result.correct);
  const wrong = toCount(result.wrong ?? Math.max(0, answered - correct));

  return {
    hasResult: true,
    resultId: typeof result.id === 'string' ? result.id : null,
    sessionType: typeof result.sessionType === 'string' ? result.sessionType : null,
    total,
    answered,
    correct,
    wrong,
    percent: calcPercent(correct, total),
    wrongQuestionIds: getWrongQuestionIdsFromResult(result),
    bySubject: normalizeSubjectSummaries(result.bySubject),
  };
}

export function getWeakPointSummary(
  maxItems = 5,
  records: Record<string, WeaknessRecord> = loadWeaknessRecords(),
): WeakPointSummary {
  const items = Object.values(records)
    .slice()
    .sort((a, b) => {
      if (b.weaknessScore !== a.weaknessScore) {
        return b.weaknessScore - a.weaknessScore;
      }

      if (b.errorCount !== a.errorCount) {
        return b.errorCount - a.errorCount;
      }

      return b.lastErrorAt.localeCompare(a.lastErrorAt);
    })
    .slice(0, maxItems)
    .map((record) => {
      const question = getQuestionById(record.questionId);

      return {
        questionId: record.questionId,
        subject: question?.subject ?? null,
        label: question?.label ?? record.questionId,
        itemName: question?.item_name ?? '',
        errorCount: record.errorCount,
        lastErrorAt: record.lastErrorAt,
        weaknessScore: record.weaknessScore,
      };
    });

  return {
    total: Object.keys(records).length,
    items,
  };
}

export function buildHomeDashboardSummary(): HomeDashboardSummary {
  const session = loadLastSession();
  const latest = getLatestResult();
  const wrongIds = loadWrongQuestionIds();
  const examDate = loadExamDate();

  if (!latest?.bySubject) {
    const summaries = normalizeSubjectSummaries(undefined);

    return {
      hasSession: Boolean(session && session.questionIds.length > 0),
      wrongCount: wrongIds.length,
      examDays: calcExamDaysWithFallback(examDate),
      statuses: SUBJECT_KEYS.map((subject) => ({
        key: subject,
        label: subjectLabel(subject),
        percent: 0,
        state: 'unknown',
        correct: 0,
        total: 0,
        gapTo60: 0,
      })),
      focusSubject: 'phys',
      remainingQuestions: 18,
      summaries,
    };
  }

  const summaries = normalizeSubjectSummaries(latest.bySubject);
  const statuses: HomeSubjectStatus[] = SUBJECT_KEYS.map((subject) => {
    const summary = summaries[subject];

    return {
      key: subject,
      label: summary.label,
      percent: summary.percent,
      state:
        summary.total === 0
          ? 'unknown'
          : summary.percent >= 60
            ? 'reached'
            : 'need',
      correct: summary.correct,
      total: summary.total,
      gapTo60: summary.gapTo60,
    };
  });

  const focusSubject = getWeakestSubject(summaries);
  const remainingQuestions = calcTotalGapTo60(summaries);

  return {
    hasSession: Boolean(session && session.questionIds.length > 0),
    wrongCount: wrongIds.length,
    examDays: calcExamDaysWithFallback(examDate),
    statuses,
    focusSubject,
    remainingQuestions,
    summaries,
  };
}