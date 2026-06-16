export type DiagnosticSubject = 'law' | 'phys' | 'prop';

export type DiagnosticMode =
  | 'weak-points'
  | 'daily-10'
  | 'mock-exam'
  | 'star3';

export type DiagnosticPriority =
  | 'urgent'
  | 'normal'
  | 'maintenance';

export type SubjectDiagnosticInput = {
  total: number;
  correct: number;
};

export type DiagnosticInput = {
  wrongCount: number;
  summaries: Record<DiagnosticSubject, SubjectDiagnosticInput>;
  examDays?: number | null;
};

export type DiagnosticRecommendation = {
  mode: DiagnosticMode;
  subject: DiagnosticSubject | null;
  priority: DiagnosticPriority;
  count: number;
  reason: string;
  ctaLabel: string;
  percent: number | null;
  gapTo60: number;
};

const SUBJECTS: DiagnosticSubject[] = ['law', 'phys', 'prop'];

const SUBJECT_LABELS: Record<DiagnosticSubject, string> = {
  law: '法令',
  phys: '物理・化学',
  prop: '性質・消火',
};

export function calcDiagnosticPercent(correct: number, total: number): number {
  if (total <= 0) {
    return 0;
  }

  return Math.round((correct / total) * 100);
}

export function calcDiagnosticGapTo60(correct: number, total: number): number {
  if (total <= 0) {
    return 0;
  }

  const required = Math.ceil(total * 0.6);
  return Math.max(0, required - correct);
}

export function getDiagnosticSubjectLabel(subject: DiagnosticSubject): string {
  return SUBJECT_LABELS[subject];
}

export function getWeakestDiagnosticSubject(
  summaries: Record<DiagnosticSubject, SubjectDiagnosticInput>,
): DiagnosticSubject | null {
  const answeredSubjects = SUBJECTS.filter((subject) => summaries[subject].total > 0);

  if (answeredSubjects.length === 0) {
    return null;
  }

  return answeredSubjects.reduce((weakest, subject) => {
    const currentPercent = calcDiagnosticPercent(
      summaries[subject].correct,
      summaries[subject].total,
    );

    const weakestPercent = calcDiagnosticPercent(
      summaries[weakest].correct,
      summaries[weakest].total,
    );

    if (currentPercent < weakestPercent) {
      return subject;
    }

    if (currentPercent === weakestPercent) {
      const currentGap = calcDiagnosticGapTo60(
        summaries[subject].correct,
        summaries[subject].total,
      );

      const weakestGap = calcDiagnosticGapTo60(
        summaries[weakest].correct,
        summaries[weakest].total,
      );

      if (currentGap > weakestGap) {
        return subject;
      }
    }

    return weakest;
  }, answeredSubjects[0]);
}

export function hasAnyDiagnosticHistory(
  summaries: Record<DiagnosticSubject, SubjectDiagnosticInput>,
): boolean {
  return SUBJECTS.some((subject) => summaries[subject].total > 0);
}

export function diagnoseNextAction(input: DiagnosticInput): DiagnosticRecommendation {
  if (input.wrongCount > 0) {
    return {
      mode: 'weak-points',
      subject: null,
      priority: 'urgent',
      count: input.wrongCount,
      reason: `未復習のミスが ${input.wrongCount} 問あります。先に回収すると得点に直結します。`,
      ctaLabel: '未復習ミスを復習する',
      percent: null,
      gapTo60: 0,
    };
  }

  const hasHistory = hasAnyDiagnosticHistory(input.summaries);

  if (!hasHistory) {
    return {
      mode: 'daily-10',
      subject: null,
      priority: 'normal',
      count: 10,
      reason: 'まだ学習履歴が少ないため、まず10問解いて現在地を作ります。',
      ctaLabel: '今日の10問を始める',
      percent: null,
      gapTo60: 0,
    };
  }

  const weakestSubject = getWeakestDiagnosticSubject(input.summaries);

  if (weakestSubject) {
    const summary = input.summaries[weakestSubject];
    const percent = calcDiagnosticPercent(summary.correct, summary.total);
    const gapTo60 = calcDiagnosticGapTo60(summary.correct, summary.total);

    if (percent < 60) {
      const label = getDiagnosticSubjectLabel(weakestSubject);

      return {
        mode: 'daily-10',
        subject: weakestSubject,
        priority: 'urgent',
        count: 10,
        reason: `${label}が ${percent}% で60%ライン未達です。この科目を優先します。`,
        ctaLabel: `${label}を10問解く`,
        percent,
        gapTo60,
      };
    }
  }

  if (input.examDays !== null && input.examDays !== undefined && input.examDays <= 14) {
    return {
      mode: 'mock-exam',
      subject: null,
      priority: 'normal',
      count: 35,
      reason: '試験日が近いため、本番形式で3科目60%以上を確認します。',
      ctaLabel: '35問実践モードへ',
      percent: null,
      gapTo60: 0,
    };
  }

  return {
    mode: 'mock-exam',
    subject: null,
    priority: 'maintenance',
    count: 35,
    reason: '大きな未回収ミスや60%未満科目がないため、本番形式で維持確認します。',
    ctaLabel: '35問実践モードへ',
    percent: null,
    gapTo60: 0,
  };
}