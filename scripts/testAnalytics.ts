import {
  buildHomeDashboardSummary,
  calcExamDays,
  calcExamDaysWithFallback,
  calcGapTo60,
  calcPassReadiness,
  calcPercent,
  getRecentResultSummary,
  getResultById,
  getSubjectAccuracySummary,
  getWeakPointSummary,
  getWeakestSubject,
  getWrongQuestionIdsFromResult,
  normalizeSubjectSummaries,
} from '../lib/analytics';

import {
  addWrongQuestionId,
  clearExamDate,
  clearResults,
  clearWeaknessRecords,
  clearWrongQuestionIds,
  saveExamDate,
  saveResult,
} from '../lib/storage';

import {
  getQuestionsBySubject,
} from '../lib/questions';

import type {
  OptionIndex,
  Subject,
} from '../lib/types';

type LocalStorageMock = {
  store: Record<string, string>;
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
};

const localStorageMock: LocalStorageMock = {
  store: {},

  getItem(key: string): string | null {
    return Object.prototype.hasOwnProperty.call(this.store, key)
      ? this.store[key]
      : null;
  },

  setItem(key: string, value: string): void {
    this.store[key] = value;
  },

  removeItem(key: string): void {
    delete this.store[key];
  },

  clear(): void {
    this.store = {};
  },
};

(globalThis as unknown as { localStorage: LocalStorageMock }).localStorage =
  localStorageMock;

function resetStorage(): void {
  localStorageMock.clear();
}

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEqual<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) {
    throw new Error(`${message}. expected=${String(expected)} actual=${String(actual)}`);
  }
}

function nextWrongIndex(correct: OptionIndex): OptionIndex {
  return ((correct + 1) % 5) as OptionIndex;
}

function firstQuestionId(subject: Subject): string {
  const question = getQuestionsBySubject(subject)[0];

  if (!question) {
    throw new Error(`missing question for subject=${subject}`);
  }

  return question.id;
}

function buildStoredResult() {
  const lawId = firstQuestionId('law');
  const physId = firstQuestionId('phys');
  const propId = firstQuestionId('prop');

  const law = getQuestionsBySubject('law')[0];
  const phys = getQuestionsBySubject('phys')[0];
  const prop = getQuestionsBySubject('prop')[0];

  if (!law || !phys || !prop) {
    throw new Error('missing test questions');
  }

  return {
    id: 'analytics-result-1',
    sessionType: 'mock-exam',
    label: 'analytics test result',
    questionIds: [lawId, physId, propId],
    answers: {
      [lawId]: law.correct,
      [physId]: nextWrongIndex(phys.correct),
      [propId]: prop.correct,
    },
    total: 3,
    answered: 3,
    correct: 2,
    wrong: 1,
    accuracy: 2 / 3,
    bySubject: {
      law: { total: 1, answered: 1, correct: 1 },
      phys: { total: 1, answered: 1, correct: 0 },
      prop: { total: 1, answered: 1, correct: 1 },
    },
    startedAt: '2026-06-09T00:00:00.000Z',
    finishedAt: '2026-06-09T00:10:00.000Z',
  };
}

function testCoreMath(): void {
  assertEqual(calcPercent(3, 5), 60, 'percent should be rounded');
  assertEqual(calcPercent(0, 0), 0, 'percent should be zero when total is zero');
  assertEqual(calcGapTo60(2, 5), 1, 'gap to 60 should use ceil target');
  assertEqual(calcGapTo60(3, 5), 0, 'gap should be zero when 60 reached');

  assertEqual(
    calcExamDays('2026-06-10', new Date('2026-06-01T00:00:00')),
    9,
    'exam days should be calculated',
  );

  assertEqual(calcExamDays(null), null, 'missing exam date should be null');
  assertEqual(calcExamDaysWithFallback(null, 67), 67, 'fallback exam days should be used');

  console.log('PASS analytics core math');
}

function testSubjectSummaries(): void {
  const summaries = normalizeSubjectSummaries({
    law: { total: 15, answered: 15, correct: 9 },
    phys: { total: 10, answered: 10, correct: 4 },
    prop: { total: 10, answered: 10, correct: 8 },
  });

  assertEqual(summaries.law.percent, 60, 'law percent should be 60');
  assertEqual(summaries.phys.gapTo60, 2, 'phys should need two more');
  assertEqual(summaries.prop.passed60, true, 'prop should be passed');

  assertEqual(getWeakestSubject(summaries), 'phys', 'phys should be weakest');

  const readiness = calcPassReadiness(summaries);
  assertEqual(readiness.passed, false, 'readiness should fail');
  assertEqual(readiness.totalGapTo60, 2, 'total gap should be two');
  assertEqual(readiness.weakestSubject, 'phys', 'weakest subject should be phys');

  console.log('PASS subject summaries');
}

function testResultAnalytics(): void {
  resetStorage();

  const result = buildStoredResult();
  const savedResults = saveResult(result);
  const saved = savedResults[0];

  assert(Boolean(saved), 'saved result should exist');

  const found = getResultById('analytics-result-1');
  assertEqual(found?.id, 'analytics-result-1', 'result should be found by id');

  const summary = getRecentResultSummary(found);
  assertEqual(summary.hasResult, true, 'recent summary should have result');
  assertEqual(summary.correct, 2, 'summary correct should be two');
  assertEqual(summary.wrong, 1, 'summary wrong should be one');
  assertEqual(summary.percent, 67, 'summary percent should be rounded');

  const wrongIds = getWrongQuestionIdsFromResult(saved);
  assertEqual(wrongIds.length, 1, 'one wrong question should be detected');

  const subjectSummary = getSubjectAccuracySummary(saved);
  assertEqual(subjectSummary.phys.correct, 0, 'phys correct should be zero');
  assertEqual(subjectSummary.phys.percent, 0, 'phys percent should be zero');

  console.log('PASS result analytics');
}

function testWeakPointAnalytics(): void {
  resetStorage();
  clearWeaknessRecords();
  clearWrongQuestionIds();

  const physId = firstQuestionId('phys');
  const lawId = firstQuestionId('law');

  addWrongQuestionId(physId, '2026-06-09T01:00:00.000Z');
  addWrongQuestionId(physId, '2026-06-09T01:10:00.000Z');
  addWrongQuestionId(lawId, '2026-06-09T01:20:00.000Z');

  const summary = getWeakPointSummary(5);

  assertEqual(summary.total, 2, 'weak point total should be two');
  assertEqual(summary.items[0]?.questionId, physId, 'highest score should be first');
  assertEqual(summary.items[0]?.errorCount, 2, 'highest score should have two errors');

  console.log('PASS weak point analytics');
}

function testHomeDashboardSummary(): void {
  resetStorage();
  clearResults();
  clearWeaknessRecords();
  clearWrongQuestionIds();
  clearExamDate();

  const empty = buildHomeDashboardSummary();

  assertEqual(empty.focusSubject, 'phys', 'empty home focus should default to phys');
  assertEqual(empty.remainingQuestions, 18, 'empty home remaining should default to 18');
  assertEqual(empty.examDays, 67, 'empty home exam days should fallback');

  const result = buildStoredResult();
  saveResult(result);
  addWrongQuestionId(firstQuestionId('phys'));
  saveExamDate('2099-01-01');

  const filled = buildHomeDashboardSummary();

  assertEqual(filled.wrongCount, 1, 'home wrong count should be one');
  assertEqual(filled.focusSubject, 'phys', 'home focus should be weakest subject');
  assertEqual(filled.remainingQuestions, 1, 'home remaining should be one');
  assert(filled.examDays !== null && filled.examDays > 0, 'home exam days should be positive');

  console.log('PASS home dashboard summary');
}

function run(): void {
  console.log('Running analytics tests...');

  testCoreMath();
  testSubjectSummaries();
  testResultAnalytics();
  testWeakPointAnalytics();
  testHomeDashboardSummary();

  console.log('All analytics tests passed.');
}

run();